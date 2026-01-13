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
  },
{
  type: "function",
    function: {
      name: "get_contact_options",
      description: "Retourne les options de contact rapides (WhatsApp). Utilise cette fonction si le prospect veut parler à un humain (Cédric) ou hésite.",
      parameters: {
        type: "object",
        properties: {},
        required: []
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

  // LOG CRITIQUE: Vérifier les dépendances au démarrage
  console.log('🔧 [TOOLS] Initialisation handlers avec deps:', {
    hasPb: !!pb,
    hasStripe: !!stripe,
    hasTransporter: !!transporter,
    hasUpsert: !!upsertLead
  });

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
          status: 'chatbot_lead'
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
            status: 'checkout_initiated',
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
          client_reference_id: leadId,
          metadata: {
            first_name,
            phone: phone || '',
            source: 'chatbot'
          }
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);

        console.log(`✅ Session Stripe créée: ${session.id}`);

        return {
          success: true,
          url: session.url,
          plan_name: plan.name,
          price: plan.price,
          message: `Voici ton lien de paiement pour ${plan.name} (${plan.price}€) : ${session.url}`
        };

      } catch (err) {
        console.error('❌ Erreur generate_payment_link:', err);

        // FALLBACK: Liens statiques si l'API échoue
        const staticLinks = {
          'essai': 'https://buy.stripe.com/00gcMQdqEehf5Bm8wy', // Lien vérifié
          'annuel': 'https://buy.stripe.com/5kA02k0IcgprcPCcMQ', // Exemple (à vérifier)
          'trimestriel': 'https://buy.stripe.com/T1J2asfyUbdbdTGeUW' // Exemple
        };

        const fallbackUrl = staticLinks[plan_type];

        if (fallbackUrl) {
          console.log(`⚠️ Utilisation du lien statique fallback pour ${plan_type}`);
          return {
            success: true,
            url: fallbackUrl,
            plan_name: plan_type,
            price: (plan_type === 'essai' ? 35 : 0),
            message: `Petit souci technique avec la génération auto, mais voici le lien direct pour régler : ${fallbackUrl}`
          };
        }

        return {
          success: false,
          message: "Erreur technique. Tu peux payer directement sur place ou demander le lien à Cédric (06 50 75 43 89)."
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
     * Envoie des informations par email
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
        // Préparer le contenu selon le type
        let subject, htmlContent;

        const kb = KNOWLEDGE_BASE;

        switch (info_type) {
          case 'infos_pratiques':
            subject = 'Informations pratiques - Cercle Parisien JKD';
            htmlContent = `
              <h1>Salut ${first_name} !</h1>
              <p>Voici les infos pratiques pour venir nous rejoindre :</p>

              <h2>📍 Adresse</h2>
              <p>${kb.localisation.adresse}</p>
              <p><a href="${kb.localisation.google_maps}">Voir sur Google Maps</a></p>

              <h2>🚇 Accès</h2>
              <p>Métro : ${kb.localisation.metro.join(' ou ')}</p>

              <h2>📅 Horaires</h2>
              <p>${kb.horaires.cours_regulier}</p>
              <p>Arrive vers ${kb.horaires.ouverture_salle} pour te changer tranquillement.</p>

              <h2>👕 Équipement</h2>
              <p>${kb.equipement.resume_debutant}</p>

              <h2>🏠 Vestiaires</h2>
              <p>${kb.vestiaires.description}</p>

              <p>Des questions ? Appelle Cédric au ${kb.contact.telephone}</p>

              <p>À samedi !<br>L'équipe du Cercle Parisien JKD</p>
            `;
            break;

          case 'tarifs':
            subject = 'Nos tarifs - Cercle Parisien JKD';
            htmlContent = `
              <h1>Salut ${first_name} !</h1>
              <p>Voici nos formules :</p>

              <h2>🥋 Cours d'essai - ${kb.tarifs.cours_essai.prix_affiche}</h2>
              <p>${kb.tarifs.cours_essai.description}</p>
              <p>${kb.tarifs.cours_essai.inclus}</p>

              <h2>⭐ Abonnement annuel - ${kb.tarifs.abonnement_annuel.prix_affiche}</h2>
              <p>${kb.tarifs.abonnement_annuel.description}</p>
              <p>Soit seulement ${kb.tarifs.abonnement_annuel.prix_mensuel} !</p>
              <p>Inclus : ${kb.tarifs.abonnement_annuel.inclus.join(', ')}</p>

              <h2>📆 Abonnement trimestriel - ${kb.tarifs.abonnement_trimestriel.prix_affiche}</h2>
              <p>${kb.tarifs.abonnement_trimestriel.description}</p>

              <p>Pour t'inscrire, réponds à cet email ou appelle Cédric au ${kb.contact.telephone}</p>

              <p>À bientôt !<br>L'équipe du Cercle Parisien JKD</p>
            `;
            break;

          case 'plan_acces':
            subject = 'Plan d\'accès - Cercle Parisien JKD';
            htmlContent = `
              <h1>Salut ${first_name} !</h1>
              <p>Voici comment venir :</p>

              <h2>📍 Adresse</h2>
              <p><strong>${kb.localisation.adresse}</strong></p>
              <p><a href="${kb.localisation.google_maps}" style="background:#c8102e;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Ouvrir dans Google Maps</a></p>

              <h2>🚇 En métro</h2>
              <p>${kb.localisation.metro.join('<br>')}</p>

              <h2>🚌 En bus</h2>
              <p>Lignes : ${kb.localisation.bus.join(', ')}</p>

              <h2>🚗 En voiture</h2>
              <p>${kb.localisation.acces_voiture}</p>
              <p>Parking : ${kb.localisation.parking}</p>

              <h2>🚪 À l'arrivée</h2>
              <p>${kb.localisation.instructions}</p>

              <p>À samedi !<br>L'équipe du Cercle Parisien JKD</p>
            `;
            break;

          default:
            return {
              success: false,
              message: `Type d'info "${info_type}" non reconnu.`
            };
        }

        // Générer le fichier ICS pour le cours d'essai (Samedi prochain 14h)
        const nextSaturday = new Date();
        nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7);
        nextSaturday.setHours(14, 0, 0, 0);

        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Cercle Parisien JKD//NONSGML v1.0//EN',
          'BEGIN:VEVENT',
          `DTSTART:${nextSaturday.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          `DTEND:${new Date(nextSaturday.getTime() + 2 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
          'SUMMARY:Cours JKD - Cercle Parisien',
          'DESCRIPTION:Cours d\'essai Jeet Kune Do. Tenue de sport confortable recommandée.',
          'LOCATION:119 Avenue du Général Leclerc, 75014 Paris',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        // Envoyer l'email
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject,
          html: htmlContent,
          attachments: [
            {
              filename: 'cours-jkd.ics',
              content: icsContent,
              contentType: 'text/calendar'
            }
          ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé avec ICS: ${info.messageId}`);

        // Aussi créer/mettre à jour le lead
        if (pb && upsertLead) {
          await upsertLead({
            email: email.toLowerCase().trim(),
            first_name: first_name.trim(),
            status: 'email_sent'
          });
        }

        return {
          success: true,
          message: `C'est envoyé ! Vérifie ta boîte mail (et les spams au cas où).`
        };

      } catch (err) {
        console.error('Erreur send_info_by_email:', err);
        return {
          success: false,
          message: "Erreur lors de l'envoi. Tu peux trouver toutes les infos sur www.cercle-parisien.com"
        };
      }
    /**
     * Retourne les options de contact (Action WhatsApp)
     */
    async get_contact_options() {
        console.log('📞 Tool get_contact_options appelé');
        return {
          success: true,
          // On ne retourne pas d'URL dans le message texte, mais l'action sera interceptée
          // par le wrapper pour ajouter un bouton
          action_type: 'whatsapp_link',
          url: 'https://wa.me/33650754389',
          message: "Tu peux discuter directement avec Cédric sur WhatsApp, c'est souvent le plus simple !"
        };
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
