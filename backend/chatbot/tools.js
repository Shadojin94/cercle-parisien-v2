/**
 * Tools simplifiés pour le Chatbot - Appelle n8n pour toutes les actions
 * Architecture: Chatbot → n8n Webhook → PocketBase/Stripe/Email
 */

// URL du webhook n8n (à configurer dans .env)
const N8N_WEBHOOK_URL = process.env.N8N_CHATBOT_WEBHOOK || 'https://n8n.cercleonline.com/webhook/chatbot-action';

/**
 * Définitions des tools pour OpenAI
 * Un seul tool générique qui appelle n8n
 */
const TOOLS_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "execute_action",
      description: "Exécute une action backend via n8n. Utilise cette fonction pour : sauvegarder un lead (action='collect_lead'), générer un lien de paiement (action='payment_link'), envoyer un email (action='send_email'), ou obtenir le contact WhatsApp (action='whatsapp').",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: ["collect_lead", "payment_link", "send_email", "whatsapp"],
            description: "L'action à exécuter"
          },
          first_name: {
            type: "string",
            description: "Prénom du prospect"
          },
          email: {
            type: "string",
            description: "Email du prospect"
          },
          phone: {
            type: "string",
            description: "Téléphone du prospect (optionnel)"
          },
          plan_type: {
            type: "string",
            enum: ["essai", "annuel", "trimestriel"],
            description: "Type de plan pour le paiement (optionnel)"
          }
        },
        required: ["action"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_school_info",
      description: "Récupère des informations sur l'école (horaires, adresse, tarifs, etc.)",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Le sujet: 'horaires', 'adresse', 'tarifs', 'equipement', 'debutant'"
          }
        },
        required: ["topic"]
      }
    }
  }
];

/**
 * Base de connaissances locale (pas besoin de n8n pour ça)
 */
const KNOWLEDGE_BASE = {
  horaires: "Les cours ont lieu le samedi de 14h à 16h. Ouverture de la salle à 13h45.",
  adresse: "119 Avenue du Général Leclerc, 75014 Paris (Métro Alésia, ligne 4)",
  tarifs: "Cours d'essai: 35€ | Abonnement annuel: 550€ (soit 46€/mois) | Trimestriel: 220€",
  equipement: "Tenue de sport confortable (jogging, t-shirt). Pieds nus ou chaussures de sport propres.",
  debutant: "Tous niveaux bienvenus ! L'ambiance est familiale et bienveillante. Pas besoin d'expérience.",
  contact: "Cédric au 06 50 75 43 89 ou WhatsApp: https://wa.me/33650754389"
};

/**
 * Crée les handlers de tools
 */
function createToolHandlers(deps) {
  console.log('🔧 [N8N TOOLS] Initialisation - Webhook:', N8N_WEBHOOK_URL);

  return {
    /**
     * Execute une action via n8n
     */
    async execute_action({ action, first_name, email, phone, plan_type }) {
      console.log(`🚀 [N8N] Appel webhook pour action: ${action}`, { first_name, email, phone, plan_type });

      try {
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            first_name,
            email,
            phone,
            plan_type: plan_type || 'essai',
            timestamp: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error(`n8n returned ${response.status}`);
        }

        const result = await response.json();
        console.log(`✅ [N8N] Réponse:`, result);

        // Mapper la réponse n8n au format attendu par le chatbot
        return {
          success: result.success !== false,
          message: result.message || "Action effectuée",
          url: result.url || result.stripe_url || result.whatsapp_url,
          action_type: result.action_type || (action === 'whatsapp' ? 'whatsapp_link' : action === 'payment_link' ? 'payment_link' : null),
          price: result.price || 35
        };

      } catch (err) {
        console.error('❌ [N8N] Erreur:', err.message);

        // Fallback WhatsApp si n8n échoue
        if (action === 'collect_lead' || action === 'payment_link') {
          return {
            success: false,
            action_type: 'whatsapp_link',
            url: 'https://wa.me/33650754389?text=Bonjour%2C%20je%20veux%20r%C3%A9server%20le%20cours%20d%27essai',
            message: "Petit souci technique. Contacte Cédric sur WhatsApp pour finaliser, il répond très vite !"
          };
        }

        return {
          success: false,
          message: "Erreur technique. Contacte Cédric au 06 50 75 43 89."
        };
      }
    },

    /**
     * Récupère des infos sur l'école (local, pas de n8n)
     */
    async get_school_info({ topic }) {
      console.log(`📚 [LOCAL] get_school_info:`, topic);

      const info = KNOWLEDGE_BASE[topic.toLowerCase()] || KNOWLEDGE_BASE.contact;

      return {
        success: true,
        topic,
        info,
        message: info
      };
    }
  };
}

/**
 * Exécute un tool
 */
async function executeTool(toolName, args, handlers) {
  const handler = handlers[toolName];

  if (!handler) {
    console.error(`❌ Tool inconnu: ${toolName}`);
    return { success: false, message: `Tool "${toolName}" non trouvé.` };
  }

  try {
    return await handler(args);
  } catch (err) {
    console.error(`❌ Erreur exécution tool ${toolName}:`, err);
    return { success: false, message: `Erreur lors de l'exécution.` };
  }
}

module.exports = {
  TOOLS_DEFINITIONS,
  createToolHandlers,
  executeTool
};
