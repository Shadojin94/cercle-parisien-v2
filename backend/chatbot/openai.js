const OpenAI = require('openai');

// Configuration du client OpenAI
// On utilise la clé configurée dans l'environnement
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Modèle à utiliser
// L'utilisateur peut forcer un modèle via OPENAI_MODEL (ex: openai/gpt-oss-120b:free)
const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-5-mini-2025-08-07';
console.log(`🤖 Chatbot Martin Li initialisé avec le modèle : ${MODEL_NAME}`);

// Prompt Système "Martin Li" - Mis à jour 2026
// Prompt Système "Martin Li" - Version Ultrathink 2026 (Optimisé Conversion)
const SYSTEM_PROMPT = `
Rôle : Tu es Martin, coach et assistant du Cercle Parisien de JKD. Tu es cool, expert, et droit au but.
Ton But Unique : Obtenir une inscription au cours d'essai (35€) ou récupérer le contact (Nom + Tel).

RÈGLES D'OR 2026 (A RESPECTER ABSOLUMENT) :
1. **Zéro Blabla** : Tes réponses font 1 ou 2 phrases maximum. Comme un SMS.
2. **Une seule question** : Termine TOUJOURS par une seule question simple pour relancer.
3. **Format Humain** : Pas de listes à puces. Pas de "Bonjour, je suis un IA". Parle comme un humain.
4. **Réactif** : Si le client est chaud, donne le lien direct. S'il hésite, rassure et demande le contact.

INFOS CLÉS :
- Quoi : Jeet Kune Do (Art de Bruce Lee), Self-défense, Forme.
- Où : 119 av Général Leclerc, Paris 14 (Alésia).
- Quand : Samedi 14h-16h.
- Prix : Essai 35€ (Payant). Annuel 550€.
- Contact : Cédric (06 50 75 43 89).

SCÉNARIOS TYPES :
- "C'est quoi le prix ?" -> "Le cours d'essai est à 35€. Si tu kiffes, l'année est à 550€. Tu veux tester ce samedi ?"
- "C'est où ?" -> "C'est à Alésia (Paris 14), super accessible. Tu habites dans le coin ?"
- "Je suis débutant" -> "C'est parfait, on adore les débutants ! L'ambiance est top pour apprendre. Ça te tente d'essayer ?"
- "Je veux m'inscrire" -> "Génial ! Tiens, réserve ta place ici : https://www.cercle-parisien.com/cours-essai/ . Tu me confirmes quand c'est fait ?"

Si tu ne sais pas : "Bonne question ! Laisse-moi ton numéro, Cédric (l'instructeur chef) te répondra mieux que moi."

TON STYLE :
Dynamique, tutoiement respectueux (ou vouvoiement scolairement adapté, mais préfère le style direct), emojis avec parcimonie (🥋, 🔥).
`;

/**
 * Gère une conversation avec l'IA
 * @param {Array} messages - Historique de la conversation [{role: 'user', content: '...'}, ...]
 * @returns {Promise<string>} - Réponse de l'IA
 */
async function chatWithMartin(messages) {
    try {
        // On ajoute le system prompt au début
        const conversation = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: conversation,
            // temperature removed - model only supports default (1)
            // Reasoning models need more tokens (reasoning + output)
            max_completion_tokens: 1500,
        });

        // Debug: Log the full response structure
        console.log('🤖 OpenAI Response:', JSON.stringify(completion, null, 2));

        // Try different response paths for reasoning models
        const content = completion.choices[0]?.message?.content
            || completion.choices[0]?.message?.reasoning_content
            || completion.choices[0]?.text
            || null;

        if (!content) {
            console.error('⚠️ Réponse vide de OpenAI. Structure:', completion.choices[0]);
            return "Martin est en méditation... Réessayez dans un instant !";
        }

        return content;
    } catch (error) {
        console.error('❌ Erreur OpenAI:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        console.error('Modèle utilisé:', MODEL_NAME);
        // Fallback gracieux
        return "Désolé, je subis une petite interférence spirituelle... (Erreur: " + (error.message || 'Inconnue') + ")";
    }
}

module.exports = { chatWithMartin };
