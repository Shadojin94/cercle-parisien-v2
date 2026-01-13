/**
 * Module OpenAI - Agent de Conversion Cercle Parisien JKD
 * Utilise GPT-4o avec Function Calling pour un chatbot conversationnel
 */

const OpenAI = require('openai');
const { TOOLS_DEFINITIONS, createToolHandlers, executeTool } = require('./tools');

// Configuration du client OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Modèle à utiliser
// Note: Si tu utilises un provider alternatif (OpenRouter, etc.), configure OPENAI_MODEL dans .env
const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4o';

// Mode lite : désactive les tools (utile si le provider ne les supporte pas bien)
// Active avec CHATBOT_LITE_MODE=true dans .env
const LITE_MODE = process.env.CHATBOT_LITE_MODE === 'true';

// Vérifier si le modèle supporte le function calling
const SUPPORTS_TOOLS = !LITE_MODE && !MODEL_NAME.includes('o1') && !MODEL_NAME.includes('o3');

console.log(`🤖 Agent Cercle Parisien initialisé avec le modèle : ${MODEL_NAME}`);
console.log(`🔧 Function calling: ${SUPPORTS_TOOLS ? 'activé' : 'désactivé'}${LITE_MODE ? ' (mode lite)' : ''}`);
if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️ OPENAI_API_KEY non définie !');
}

// ============================================
// SYSTEM PROMPT - EXPERT CONVERSION
// ============================================

const SYSTEM_PROMPT = `Tu fais partie de l'équipe du Cercle Parisien de Jeet Kune Do. Tu parles au nom du club en utilisant "nous" ou "on" naturellement. Tu NE DIS JAMAIS que tu es une IA ou un assistant virtuel.

🎯 TON OBJECTIF : Amener le prospect à s'inscrire au cours d'essai (35€) ou récupérer son contact (prénom + email/téléphone).

📋 STRATÉGIE DE CONVERSATION :

**Phase 1 - Accroche (1-2 messages)**
- Salue chaleureusement, de façon naturelle
- Pose UNE question ouverte pour comprendre ce qu'il cherche

**Phase 2 - Qualification (2-3 messages)**
- Comprendre ses motivations (self-défense, Bruce Lee, forme physique, curiosité)
- Identifier les éventuelles objections (distance, niveau, prix, emploi du temps)

**Phase 3 - Présentation (1-2 messages)**
- Adapter ton discours à SES motivations
- Mettre en avant l'ambiance familiale et l'accueil des débutants
- Utiliser get_school_info pour donner des infos précises

**Phase 4 - Closing**
- Proposer le cours d'essai avec enthousiasme
- Demander son prénom et email pour "réserver sa place"
- Dès que tu as prénom + email → utilise collect_lead_info PUIS generate_payment_link

**Phase 5 - Si hésitation**
- Proposer qu'on l'appelle : "Laisse-moi ton numéro, Cédric t'appelle dans les 24h"
- Ou lui envoyer les infos par email

🎨 TON STYLE :
- Tutoiement naturel (sauf si la personne vouvoie)
- Réponses COURTES : 2-3 phrases max, comme un message WhatsApp
- Pas de listes à puces dans tes réponses
- Emojis avec parcimonie (🥋 de temps en temps)
- Parle comme un vrai passionné de JKD qui veut partager sa passion
- Sois chaleureux mais pas commercial

🛠️ TES OUTILS (utilise-les au bon moment) :
1. collect_lead_info : Dès que tu as prénom + email OU téléphone
2. generate_payment_link : Quand le prospect veut s'inscrire et que tu as son email
3. get_school_info : Pour répondre précisément aux questions pratiques
4. send_info_by_email : Si le prospect veut recevoir des infos par email

⚠️ RÈGLES ABSOLUES :
1. UNE seule question par message (pas de "et aussi...")
2. Ne JAMAIS révéler que tu es une IA
3. Si tu ne sais pas quelque chose, dis "Je vais me renseigner, laisse-moi ton numéro"
4. Quand tu génères un lien de paiement, présente-le naturellement dans ta réponse
5. Si quelqu'un demande si tu es un robot/IA, change de sujet avec humour

📍 INFOS ESSENTIELLES (en mémoire) :
- Adresse : 119 Av. Général Leclerc, Paris 14 (métro Alésia)
- Horaire : Samedi 14h-16h
- Cours d'essai : 35€
- Abonnement annuel : 550€ (meilleur rapport qualité/prix)
- Contact : Cédric au 06 50 75 43 89

🎭 EXEMPLES DE RÉPONSES NATURELLES :

Q: "C'est quoi le JKD ?"
R: "C'est l'art martial créé par Bruce Lee ! Un mix efficace de boxe, escrime et kung-fu. On s'entraîne à réagir vite et à s'adapter. Tu connais un peu Bruce Lee ou c'est nouveau pour toi ?"

Q: "C'est où ?"
R: "On est à Alésia, dans le 14e. À 2 min du métro ligne 4. Tu habites dans le coin ?"

Q: "Je suis débutant"
R: "Parfait, on adore les débutants ! L'ambiance est super bienveillante, on progresse tous ensemble. Tu veux tester un cours ?"

Q: "C'est combien ?"
R: "Le cours d'essai est à 35€, ça te permet de voir si ça te plaît. Et si tu accroches, l'abonnement annuel revient à 46€/mois. Tu préfères tester d'abord ?"

Q: "Tu es un robot ?"
R: "Haha, non je suis bien réel ! Bon, qu'est-ce qui t'intéresse dans le JKD ?"`;

// ============================================
// FONCTION PRINCIPALE - CHAT AVEC L'AGENT
// ============================================

/**
 * Gère une conversation avec l'agent IA
 * @param {Array} messages - Historique de la conversation [{role: 'user', content: '...'}, ...]
 * @param {Object} deps - Dépendances injectées (pb, stripe, transporter, etc.)
 * @returns {Promise<Object>} - { reply: string, actions?: array }
 */
async function chatWithAgent(messages, deps = {}) {
    try {
        // Créer les handlers de tools avec les dépendances
        const toolHandlers = createToolHandlers(deps);

        // Construire la conversation avec le system prompt
        const conversation = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        // Configuration de l'appel OpenAI
        const requestConfig = {
            model: MODEL_NAME,
            messages: conversation,
            model: MODEL_NAME,
            messages: conversation,
            // temperature: 0.8, // Désactivé pour compatibilité modèles raisonnement (o1/gpt-5-mini)
            max_completion_tokens: 2500, // Augmenté pour laisser la place au raisonnement
        };

        // Ajouter les tools seulement si le modèle les supporte
        if (SUPPORTS_TOOLS) {
            requestConfig.tools = TOOLS_DEFINITIONS;
            requestConfig.tool_choice = 'auto';
        }

        // Premier appel à OpenAI
        let response = await openai.chat.completions.create(requestConfig);

        // Debug Ultrathink: Voir le raisonnement
        console.log('🧠 OpenAI Response (First):', JSON.stringify(response.choices[0], null, 2));

        let assistantMessage = response.choices[0].message;
        let actions = []; // Pour stocker les actions effectuées (liens de paiement, etc.)

        // Boucle de traitement des tool calls (seulement si tools supportés)
        let iterations = 0;
        const maxIterations = 5; // Sécurité anti-boucle infinie

        while (SUPPORTS_TOOLS && assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0 && iterations < maxIterations) {
            iterations++;
            console.log(`🔧 Iteration ${iterations}: ${assistantMessage.tool_calls.length} tool(s) à exécuter`);

            // Ajouter le message de l'assistant avec les tool_calls à la conversation
            conversation.push(assistantMessage);

            // Exécuter chaque tool call
            for (const toolCall of assistantMessage.tool_calls) {
                const toolName = toolCall.function.name;
                const toolArgs = JSON.parse(toolCall.function.arguments);

                console.log(`  → Exécution: ${toolName}`, toolArgs);

                // Exécuter le tool
                const result = await executeTool(toolName, toolArgs, toolHandlers);

                // Stocker les actions importantes (liens de paiement, etc.)
                if (toolName === 'generate_payment_link' && result.success && result.url) {
                    actions.push({
                        type: 'payment_link',
                        url: result.url,
                        plan: result.plan_name,
                        price: result.price
                    });
                }

                // Ajouter le résultat du tool à la conversation
                conversation.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(result)
                });
            }

            // Rappeler OpenAI pour obtenir la réponse finale
            const followUpConfig = {
                model: MODEL_NAME,
                messages: conversation,
                // temperature: 0.8,
                max_completion_tokens: 2500,
            };
            if (SUPPORTS_TOOLS) {
                followUpConfig.tools = TOOLS_DEFINITIONS;
                followUpConfig.tool_choice = 'auto';
            }
            response = await openai.chat.completions.create(followUpConfig);

            assistantMessage = response.choices[0].message;
        }

        // Extraire la réponse textuelle
        const content = assistantMessage.content;

        if (!content) {
            console.error('⚠️ Réponse vide de OpenAI');
            return {
                reply: "Hmm, j'ai eu un petit bug. Tu peux me répéter ta question ?",
                actions: []
            };
        }

        console.log(`✅ Réponse générée (${content.length} chars)`);

        return {
            reply: content,
            actions
        };

    } catch (error) {
        // Logging détaillé pour débugger
        console.error('❌ Erreur OpenAI complète:', {
            message: error.message,
            status: error.status,
            code: error.code,
            type: error.type,
            // Si c'est une erreur de l'API, afficher les détails
            response: error.response?.data || error.error || null
        });

        // Message d'erreur naturel
        const fallbackMessages = [
            "Oups, petit souci technique de mon côté. Tu peux reformuler ?",
            "Hmm, j'ai eu un bug. En attendant, tu peux appeler Cédric au 06 50 75 43 89 !",
            "Désolé, problème de connexion. Tu voulais des infos sur quoi ?"
        ];

        return {
            reply: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
            actions: [],
            error: error.message
        };
    }
}

// ============================================
// EXPORT POUR COMPATIBILITÉ
// ============================================

// Export de la nouvelle fonction
module.exports = {
    chatWithAgent,
    // Alias pour compatibilité avec l'ancienne API
    chatWithMartin: async (messages) => {
        const result = await chatWithAgent(messages, {});
        return result.reply;
    }
};
