/**
 * Tools (Function Calling) pour l'Agent Chatbot
 * Ces fonctions sont appelées par l'IA quand elle a besoin d'effectuer des actions
 */

const { getInfo, getFormattedInfo, KNOWLEDGE_BASE } = require('./knowledge-base');

// ============================================
// DÉFINITIONS DES TOOLS POUR OPENAI
// ============================================

const TOOLS_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "collect_lead_info",
      description: "Enregistre les informations du prospect dans la base de données quand il les fournit naturellement dans la conversation. Appelle cette fonction dès que tu obtiens le prénom ET (email OU téléphone) du prospect.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
            description: "Le prénom du prospect"
          },
          email: {
            type: "string",
            description: "L'email du prospect (optionnel si téléphone fourni)"
          },
          phone: {
            type: "string",
            description: "Le numéro de téléphone du prospect (optionnel si email fourni)"
          },
          interest: {
            type: "string",
            enum: ["cours_essai", "abonnement", "information"],
            description: "Ce qui intéresse le prospect"
          }
        },
        required: ["first_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_payment_link",
      description: "Génère un lien de paiement Stripe personnalisé pour le prospect. Utilise cette fonction quand le prospect veut s'inscrire et que tu as son email.",
      parameters: {
        type: "object",
        properties: {
          plan_type: {
            type: "string",
            enum: ["essai", "annuel", "trimestriel"],
            description: "Le type de formule choisie"
          },
          email: {
            type: "string",
            description: "L'email du prospect pour le paiement"
          },
          first_name: {
            type: "string",
            description: "Le prénom du prospect"
          },
          phone: {
            type: "string",
            description: "Le téléphone du prospect (optionnel)"
          }
        },
        required: ["plan_type", "email", "first_name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_school_info",
      description: "Récupère des informations détaillées sur l'école. Utilise cette fonction pour répondre précisément aux questions sur l'adresse, les horaires, les tarifs, les vestiaires, etc.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Le sujet sur lequel tu veux des informations. Exemples: 'horaires', 'adresse', 'vestiaires', 'parking', 'metro', 'tarifs', 'equipement', 'inscription', 'debutant'"
          }
        },
        required: ["topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_info_by_email",
      description: "Envoie des informations pratiques par email au prospect. Utilise cette fonction quand le prospect demande à recevoir des infos par email.",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "L'email du destinataire"
          },
          first_name: {
            type: "string",
            description: "Le prénom du prospect"
          },
          info_type: {
            type: "string",
            enum: ["infos_pratiques", "tarifs", "plan_acces"],
            description: "Le type d'information à envoyer"
          }
        },
        required: ["email", "first_name", "info_type"]
      }
    }
  }
];

// ============================================
// HANDLERS DES TOOLS
// ============================================

/**
 * Crée les handlers avec les dépendances injectées
 * @param {Object} deps - Dépendances (pb, stripe, transporter, upsertLead, etc.)
 */
function createToolHandlers(deps) {
  const { pb, stripe, transporter, upsertLead, generateResumeToken } = deps;

  return {
    /**
     * Enregistre les informations du prospect
     */
    async collect_lead_info({ first_name, email, phone, interest }) {
      console.log(`📝 Tool collect_lead_info appelé:`, { first_name, email, phone, interest });

      if (!pb) {
        return {
          success: false,
          message: "Base de données non disponible, mais j'ai noté les informations."
        };
      }

      try {
        // Préparer les données du lead
        const leadData = {
          first_name: first_name.trim(),
          status: 'new'  // Valeur valide PocketBase
        };

        if (email) {
          leadData.email = email.toLowerCase().trim();
        }
        if (phone) {
          leadData.phone = phone.trim();
        }

        // Générer un token de reprise
        leadData.resumeToken = generateResumeToken();

        // Upsert dans PocketBase
        const { data, error } = await upsertLead(leadData);

        if (error) {
          console.error('Erreur upsertLead:', error);
          return {
            success: false,
            message: "Erreur lors de l'enregistrement, mais j'ai noté les informations."
          };
        }

        console.log(`✅ Lead enregistré: ${data.id}`);

        return {
          success: true,
          leadId: data.id,
          message: `Super, j'ai bien noté tes coordonnées ${first_name} !`,
          resumeToken: leadData.resumeToken
        };

      } catch (err) {
        console.error('Erreur collect_lead_info:', err);
        return {
          success: false,
          message: "Erreur technique, mais j'ai noté les informations."
        };
      }
    },

    /**
     * Génère un lien de paiement Stripe
     */
    async generate_payment_link({ plan_type, email, first_name, phone }) {
      console.log(`💳 Tool generate_payment_link appelé:`, { plan_type, email, first_name });

      if (!stripe) {
        return {
          success: false,
          message: "Service de paiement temporairement indisponible. Contacte Cédric au 06 50 75 43 89."
        };
      }

      try {
        // Mapping des plans vers les price IDs Stripe
        const planMapping = {
          'essai': {
            priceId: 'price_1S8fhXFvnccm1W1dXlCxUlbV',
            name: "Cours d'essai",
            price: 35,
            mode: 'payment'
          },
          'annuel': {
            priceId: 'price_1SE5fLFvnccm1W1d6bghBCkt',
            name: 'Abonnement annuel',
            price: 550,
            mode: 'payment'
          },
          'trimestriel': {
            priceId: 'price_1S8fkYFvnccm1W1dI5RhgQlT',
            name: 'Abonnement trimestriel',
            price: 220,
            mode: 'subscription'
          }
        };

        const plan = planMapping[plan_type];
        if (!plan) {
          return {
            success: false,
            message: `Plan "${plan_type}" non reconnu. Les options sont: essai (35€), annuel (550€), trimestriel (220€).`
          };
        }

        // D'abord, créer/mettre à jour le lead
        let leadId = null;
        if (pb && upsertLead) {
          const { data } = await upsertLead({
            email: email.toLowerCase().trim(),
            first_name: first_name.trim(),
            phone: phone ? phone.trim() : undefined,
            status: 'new',  // Valeur valide PocketBase
            resumeToken: generateResumeToken()
          });
          if (data) leadId = data.id;
        }

        // Créer la session Stripe
        const frontendUrl = process.env.FRONTEND_URL || 'https://www.cercle-parisien.com';

        const sessionConfig = {
          payment_method_types: ['card'],
          line_items: [{ price: plan.priceId, quantity: 1 }],
          mode: plan.mode,
          success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${frontendUrl}/cancel`,
          customer_email: email.toLowerCase().trim(),
          metadata: {
            first_name,
            phone: phone || '',
            source: 'chatbot'
          }
        };

        // Ajouter client_reference_id SEULEMENT si on a un leadId valide
        if (leadId) {
          sessionConfig.client_reference_id = leadId;
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log(`✅ Session Stripe créée: ${session.id}`);

        return {
          success: true,
          action_type: 'payment_link',  // Pour afficher un bouton dans le frontend
          url: session.url,
          plan_name: plan.name,
          price: plan.price,
          message: `Super ! Clique sur le bouton pour réserver ta place.`
        };

      } catch (err) {
        console.error('Erreur generate_payment_link:', err);
        return {
          success: false,
          message: "Erreur lors de la création du lien de paiement. Contacte Cédric au 06 50 75 43 89."
        };
      }
    },

    /**
     * Récupère des informations sur l'école
     */
    async get_school_info({ topic }) {
      console.log(`📚 Tool get_school_info appelé:`, { topic });

      const info = getInfo(topic);

      if (!info) {
        return {
          success: false,
          topic,
          message: `Je n'ai pas trouvé d'info spécifique sur "${topic}". Pour plus de détails, contacte Cédric au 06 50 75 43 89.`
        };
      }

      return {
        success: true,
        topic,
        info,
        message: `Voici les informations sur ${topic}`
      };
    },

    /**
     * Envoie des informations par email (texte brut, anti-spam)
     */
    async send_info_by_email({ email, first_name, info_type }) {
      console.log(`📧 Tool send_info_by_email appelé:`, { email, first_name, info_type });

      if (!transporter) {
        return {
          success: false,
          message: "Service email temporairement indisponible. Les infos sont sur www.cercle-parisien.com"
        };
      }

      try {
        let subject, textContent;

        switch (info_type) {
          case 'infos_pratiques':
            subject = 'Infos pratiques pour ton cours';
            textContent = `Bonjour ${first_name},

J'espère que tu vas bien.

Voici les infos pratiques pour venir nous rejoindre :

Les cours ont lieu chaque samedi de 14h à 16h au Centre Alésia, situé au 119 Avenue du Général Leclerc, Paris 14e.

Pour y accéder, le plus simple est le métro Alésia (ligne 4), c'est à 2 minutes à pied.

Je te conseille d'arriver vers 13h45 pour te changer tranquillement. Côté tenue, viens avec un jogging et un t-shirt, pieds nus ou chaussures de sport propres.

N'hésite pas à m'appeler au 06 50 75 43 89 si tu as des questions.

Au plaisir de te retrouver samedi.

Bien à toi,

Cédric

--
Cédric ATTICOT DIT RAVINO
cedric.atticot@live.fr
06 50 75 43 89
www.cercle-parisien.com`;
            break;

          case 'tarifs':
            subject = 'Nos formules - Cercle Parisien JKD';
            textContent = `Bonjour ${first_name},

J'espère que tu vas bien.

Voici nos différentes formules :

- Cours d'essai : 35 euros (un cours complet pour découvrir, sans engagement)
- Abonnement annuel : 550 euros (soit 46 euros par mois, paiement en 1x ou 3x sans frais)
- Abonnement trimestriel : 220 euros (pour tester sur 3 mois)

Pour t'inscrire, tu peux répondre à cet email ou m'appeler directement au 06 50 75 43 89.

N'hésite pas si tu as des questions.

Bien à toi,

Cédric

--
Cédric ATTICOT DIT RAVINO
cedric.atticot@live.fr
06 50 75 43 89
www.cercle-parisien.com`;
            break;

          case 'plan_acces':
            subject = 'Comment venir au dojo';
            textContent = `Bonjour ${first_name},

J'espère que tu vas bien.

Voici comment venir :

L'adresse : 119 Avenue du Général Leclerc, 75014 Paris
Google Maps : https://maps.google.com/?q=119+Avenue+General+Leclerc+Paris

En métro : Ligne 4, station Alésia, sortie Avenue du Général Leclerc. C'est à 2 minutes à pied.

En bus : Lignes 28, 38, 68 - arrêt Alésia.

À ton arrivée, entre dans la cour de l'immeuble, le dojo est au fond à gauche.

N'hésite pas à m'appeler au 06 50 75 43 89 si tu as du mal à trouver.

Au plaisir de te voir samedi.

Bien à toi,

Cédric

--
Cédric ATTICOT DIT RAVINO
cedric.atticot@live.fr
06 50 75 43 89
www.cercle-parisien.com`;
            break;

          default:
            return {
              success: false,
              message: `Type d'info "${info_type}" non reconnu.`
            };
        }

        // Envoyer l'email en texte brut (meilleure delivrabilite)
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject,
          text: textContent  // Texte brut, pas de HTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé: ${info.messageId}`);

        // Aussi créer/mettre à jour le lead
        if (pb && upsertLead) {
          await upsertLead({
            email: email.toLowerCase().trim(),
            first_name: first_name.trim(),
            status: 'new'
          });
        }

        return {
          success: true,
          message: `C'est envoye ! Verifie ta boite mail.`
        };

      } catch (err) {
        console.error('Erreur send_info_by_email:', err);
        return {
          success: false,
          message: "Erreur lors de l'envoi. Tu peux trouver toutes les infos sur www.cercle-parisien.com"
        };
      }
    }
  };
}

/**
 * Exécute un tool avec les arguments donnés
 * @param {string} toolName - Nom du tool
 * @param {Object} args - Arguments du tool
 * @param {Object} handlers - Handlers créés avec createToolHandlers
 */
async function executeTool(toolName, args, handlers) {
  const handler = handlers[toolName];

  if (!handler) {
    console.error(`❌ Tool inconnu: ${toolName}`);
    return {
      success: false,
      message: `Tool "${toolName}" non trouvé.`
    };
  }

  try {
    return await handler(args);
  } catch (err) {
    console.error(`❌ Erreur exécution tool ${toolName}:`, err);
    return {
      success: false,
      message: `Erreur lors de l'exécution de ${toolName}.`
    };
  }
}

module.exports = {
  TOOLS_DEFINITIONS,
  createToolHandlers,
  executeTool
};
