// Import des dépendances
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { createServer } = require('http');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PocketBase = require('pocketbase/cjs');
const nodemailer = require('nodemailer');
const ics = require('ics');

// Configuration de l'application Express
const app = express();
const server = createServer(app);

// Configuration de PocketBase
let pb = null;
if (process.env.POCKETBASE_URL) {
  pb = new PocketBase(process.env.POCKETBASE_URL);
  console.log('✅ PocketBase configuré:', process.env.POCKETBASE_URL);
} else {
  console.log('⚠️  PocketBase non configuré - certaines fonctionnalités ne seront pas disponibles');
}

// ===============================
// FONCTIONS HELPER POCKETBASE
// ===============================

// Créer ou mettre à jour un lead par email
async function upsertLead(leadData) {
  try {
    // Chercher si le lead existe déjà
    const existing = await pb.collection('leads').getFirstListItem(`email="${leadData.email.toLowerCase()}"`).catch(() => null);

    if (existing) {
      // Mise à jour
      const updated = await pb.collection('leads').update(existing.id, {
        ...leadData,
        email: leadData.email.toLowerCase(),
        updated: new Date().toISOString()
      });
      return { data: updated, error: null };
    } else {
      // Création
      const created = await pb.collection('leads').create({
        ...leadData,
        email: leadData.email.toLowerCase(),
        status: leadData.status || 'new'
      });
      return { data: created, error: null };
    }
  } catch (error) {
    console.error('Erreur upsertLead:', error);
    return { data: null, error };
  }
}

// Récupérer un lead par ID
async function getLeadById(id) {
  try {
    const lead = await pb.collection('leads').getOne(id);
    return { data: lead, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Récupérer un lead par token
async function getLeadByToken(token) {
  try {
    const lead = await pb.collection('leads').getFirstListItem(`resumeToken="${token}"`);
    return { data: lead, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Mettre à jour le statut d'un lead
async function updateLeadStatus(id, status) {
  try {
    const updated = await pb.collection('leads').update(id, {
      status,
      updated: new Date().toISOString()
    });
    return { data: updated, error: null };
  } catch (error) {
    console.error('Erreur updateLeadStatus:', error);
    return { data: null, error };
  }
}

// Générer un token de reprise unique
function generateResumeToken() {
  return 'rt_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Configuration Nodemailer pour Gmail
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https://picsum.photos", "https://i.imgur.com"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://js.stripe.com"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:5173'] : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200  // Pour preflight OPTIONS
}));

app.options('*', cors());

// Pas de serve statique en prod - Nginx gère le frontend
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(__dirname, '../httpdocs')));
}

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Fonction pour générer le fichier ICS du rendez-vous
function generateICS(firstName, email) {
  const start = [2025, 9, 27, 14, 0]; // 27/09/2025 14:00
  const end = [2025, 9, 27, 16, 0];   // 27/09/2025 16:00

  const { error, value } = ics.createEvent({
    title: `Cours d'essai JKD - Bienvenue ${firstName}`,
    start,
    end,
    location: '119 Av. du Général Leclerc, 75014 Paris - Tél: 06 50 75 43 89',
    description: 'Lien Maps: https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris\n\nMerci pour votre inscription au Cercle Parisien JKD !',
    organizer: {
      name: 'Cercle Parisien JKD',
      email: 'contact@cercle-parisien.com'
    }
  });

  if (error) {
    throw new Error(`Erreur génération ICS: ${error}`);
  }

  return value;
}

// ===============================
// ROUTES API
// ===============================

/**
 * POST /api/checkout-3mo
 * Crée une session de paiement Stripe pour abonnement 3 mois avec annulation automatique
 * Note: On crée d'abord la session, puis on modifie la subscription après création
 */
app.post('/api/checkout-3mo', async (req, res) => {
  try {
    const {
      email,
      first_name,
      phone,
      tshirtQuantity = 0,
      includeLicense = false,
      includeAlesia = false,
      isIntegralUpgrade = false,
      utm
    } = req.body;

    if (!email || !first_name || !phone) {
      return res.status(400).json({ error: 'Email, prénom, téléphone requis' });
    }

    // Vérifier si la période promo est active
    const targetDate = new Date('2025-12-31T23:59:59');
    const now = new Date();
    const isPromoActive = now < targetDate;

    // Choisir le bon price ID selon la promo
    const monthlyPriceId = isPromoActive
      ? 'price_1SE5FoFvnccm1W1dkil8MunN' // 187€/mois avec promo
      : 'price_1SE4ztFvnccm1W1dJzKgoauw'; // 220€/mois sans promo

    // Construire les line_items
    let line_items = [{ price: monthlyPriceId, quantity: 1 }];

    // Ajouter les options
    const TSHIRT_PRICE_ID = 'price_1PCHQLFvnccm1W1dyslpgf3r';
    const LICENSE_PRICE_ID = 'price_1SDNjDFvnccm1W1dBuX73ZXD';

    if (tshirtQuantity > 0) {
      line_items.push({ price: TSHIRT_PRICE_ID, quantity: tshirtQuantity });
    }

    if (includeLicense) {
      line_items.push({ price: LICENSE_PRICE_ID, quantity: 1 });
    }

    // Créer la session checkout (sans cancel_at qui n'est pas supporté ici)
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card', 'sepa_debit'],
      line_items,
      customer_email: email,
      client_reference_id: req.body.leadId || null,
      subscription_data: {
        metadata: {
          first_name,
          phone,
          tshirtQuantity: tshirtQuantity.toString(),
          includeLicense: includeLicense.toString(),
          includeAlesia: includeAlesia.toString(),
          isIntegralUpgrade: isIntegralUpgrade.toString(),
          paymentOption: 'installments_3mo',
          cancel_in_3_months: 'true' // Flag pour le webhook
        }
      },
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
      metadata: {
        first_name,
        phone,
        tshirtQuantity: tshirtQuantity.toString(),
        includeLicense: includeLicense.toString(),
        includeAlesia: includeAlesia.toString(),
        isIntegralUpgrade: isIntegralUpgrade.toString(),
        paymentOption: 'installments_3mo',
        cancel_in_3_months: 'true', // Flag pour le webhook
        utm: JSON.stringify(utm || {})
      }
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création checkout 3 mois:', error);
    res.status(500).json({ error: 'Erreur création session de paiement' });
  }
});

/**
 * POST /api/checkout
 * Crée une session de paiement Stripe
 */
app.post('/api/checkout', async (req, res) => {
  try {
    const {
      email,
      first_name,
      phone,
      planId,
      promoCode,
      utm,
      tshirtQuantity = 0,
      includeLicense = false,
      includeAlesia = false,
      isIntegralUpgrade = false,
      paymentOption = 'single'
    } = req.body;

    if (!email || !first_name || !phone || !planId) {
      console.log('Validation failed:', { email, first_name, phone, planId }); // Debug log
      return res.status(400).json({ error: 'Email, prénom, téléphone et plan sont requis' });
    }

    // Si paiement en 3 fois pour l'abonnement annuel, rediriger vers checkout-3mo
    const isAnnualPlan = planId === 'price_1SE5fLFvnccm1W1d6bghBCkt';
    if (isAnnualPlan && paymentOption === 'installments') {
      // Rediriger vers la route checkout-3mo
      return res.redirect(307, '/api/checkout-3mo');
    }

    // Plans Stripe
    const plans = {
      'price_1S8fhXFvnccm1W1dXlCxUlbV': { name: 'Cours d\'essai', price: 35, mode: 'payment' },
      'price_1SE5fLFvnccm1W1d6bghBCkt': { name: 'Abonnement annuel', price: 550, mode: 'payment' },
      'price_1S8fkYFvnccm1W1dI5RhgQlT': { name: 'Abonnement trimestriel', price: 220, mode: 'subscription' }
    };

    // Déterminer le plan à utiliser
    let effectivePlanId = planId;

    const plan = plans[effectivePlanId];
    if (!plan) {
      console.log('Invalid planId:', effectivePlanId); // Debug log
      return res.status(400).json({ error: 'Plan invalide' });
    }

    // Prix des options
    const TSHIRT_PRICE_ID = 'price_1PCHQLFvnccm1W1dyslpgf3r';
    const LICENSE_PRICE_ID = 'price_1SDNjDFvnccm1W1dBuX73ZXD';
    const ALESIA_PRICE_ID = 'price_1SDNkDFvnccm1W1d12345678'; // À créer dans Stripe si nécessaire
    const INTEGRAL_UPGRADE_PRICE_ID = 'price_1SDNlDFvnccm1W1d12345678'; // À créer dans Stripe si nécessaire

    // Construire les line_items avec le bon price ID
    let line_items = [{ price: effectivePlanId, quantity: 1 }];

    // Ajouter les t-shirts
    if (tshirtQuantity > 0) {
      line_items.push({ price: TSHIRT_PRICE_ID, quantity: tshirtQuantity });
    }

    // Ajouter la licence si demandée (SAUF pour trimestriel où elle est incluse)
    const isTrimestrielPlan = planId === 'price_1S8fkYFvnccm1W1dI5RhgQlT';
    if (includeLicense && !isTrimestrielPlan) {
      line_items.push({ price: LICENSE_PRICE_ID, quantity: 1 });
    }

    // Note: Alesia and integral upgrade prices need to be created in Stripe
    // For now, these are not added to line_items to avoid 500 errors
    // TODO: Create proper price IDs in Stripe for these options

    // Validation promo code si fourni
    let discounts = [];
    if (promoCode) {
      try {
        const promos = await stripe.promotionCodes.list({ code: promoCode, limit: 1 });
        if (promos.data.length > 0) {
          const promo = promos.data[0];
          if (promo.active && promo.coupon.valid) {
            // Use the promotion_code ID, not the code text
            discounts = [{ promotion_code: promo.id }];
          }
        }
      } catch (error) {
        console.error('Error validating promo code:', error);
      }
    }

    // Créer la session checkout
    const sessionConfig = {
      payment_method_types: ['card', 'sepa_debit'],
      line_items,
      mode: plan.mode,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
      customer_email: email,
      client_reference_id: req.body.leadId || null,
      discounts,
      metadata: {
        first_name,
        phone,
        tshirtQuantity: tshirtQuantity.toString(),
        includeLicense: includeLicense.toString(),
        includeAlesia: includeAlesia.toString(),
        isIntegralUpgrade: isIntegralUpgrade.toString(),
        paymentOption,
        utm: JSON.stringify(utm || {})
      }
    };

    // Pour les abonnements, ajouter subscription_data si nécessaire
    if (plan.mode === 'subscription') {
      sessionConfig.subscription_data = {
        metadata: {
          first_name,
          phone,
          tshirtQuantity: tshirtQuantity.toString(),
          includeLicense: includeLicense.toString(),
          includeAlesia: includeAlesia.toString(),
          isIntegralUpgrade: isIntegralUpgrade.toString(),
          paymentOption
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur création checkout:', error);
    res.status(500).json({ error: 'Erreur création session de paiement' });
  }
});

/**
 * Fonction handler pour les webhooks Stripe (réutilisable)
 */
async function handleStripeWebhook(req, res) {
  try {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Erreur de signature webhook:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Logs détaillés pour debugging
    console.log(`Webhook reçu: ${event.type}`, { id: event.id, livemode: event.livemode });

    // Traiter l'événement
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Paiement réussi:', session.id, { customer_email: session.customer_email, amount_total: session.amount_total });

        // Si c'est un abonnement 3 mois, configurer l'annulation automatique
        if (session.mode === 'subscription' && session.metadata?.cancel_in_3_months === 'true' && session.subscription) {
          try {
            const now = new Date();
            const cancelAt = Math.floor(
              new Date(
                now.getFullYear(),
                now.getMonth() + 3,
                now.getDate(),
                now.getHours(),
                now.getMinutes(),
                0
              ).getTime() / 1000
            );

            await stripe.subscriptions.update(session.subscription, {
              cancel_at: cancelAt
            });
            console.log(`Subscription ${session.subscription} configurée pour s'annuler dans 3 mois`);
          } catch (subError) {
            console.error('Erreur configuration annulation subscription:', subError);
          }
        }

        // Mettre à jour le statut du lead
        if (session.client_reference_id && pb) {
          try {
            await updateLeadStatus(session.client_reference_id, 'converted');
            console.log(`Lead ${session.client_reference_id} mis à jour en 'converted'`);
          } catch (pbError) {
            console.error('Erreur PocketBase update lead converted:', pbError);
            // Pour retry: logger pour traitement manuel ou implémenter queue
          }

          // Récupérer les détails du lead pour l'email
          const { data: lead, error: leadError } = await getLeadById(session.client_reference_id);

          if (leadError || !lead) {
            console.error('Erreur récupération lead pour email:', leadError);
          } else {
            try {
              // Générer ICS
              const icsContent = generateICS(lead.first_name, lead.email);

              // Préparer l'email de confirmation
              const mailOptions = {
                from: process.env.SMTP_USER,
                to: lead.email,
                subject: 'Confirmation d\'inscription - Cercle Parisien JKD',
                html: `
                  <h1>Bienvenue ${lead.first_name} !</h1>
                  <p>Votre paiement a été confirmé avec succès.</p>
                  <p><strong>Rendez-vous pour votre cours d'essai :</strong></p>
                  <ul>
                    <li><strong>Date :</strong> Samedi 27 septembre 2025</li>
                    <li><strong>Heure :</strong> 14h00 - 16h00</li>
                    <li><strong>Adresse :</strong> 119 Av. du Général Leclerc, 75014 Paris</li>
                    <li><strong>Téléphone :</strong> 06 50 75 43 89</li>
                  </ul>
                  <p><a href="https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris" target="_blank">Ouvrir dans Google Maps</a></p>
                  <p>Nous avons hâte de vous accueillir !</p>
                  <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
                `,
                attachments: [
                  {
                    filename: 'rdv-cours-essai-jkd.ics',
                    content: icsContent,
                    contentType: 'text/calendar; method=REQUEST'
                  }
                ]
              };

              // Envoyer l'email
              const info = await transporter.sendMail(mailOptions);
              console.log('Email de confirmation envoyé:', info.messageId, 'à', lead.email);
            } catch (emailError) {
              console.error('Erreur envoi email de confirmation:', emailError);
              // Pour retry: pourrait ajouter à une queue de retry
            }
          }
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log('Session expirée:', expiredSession.id, { customer_email: expiredSession.customer_email });

        // Mettre à jour le statut du lead
        if (expiredSession.client_reference_id && pb) {
          try {
            await updateLeadStatus(expiredSession.client_reference_id, 'expired');
            console.log(`Lead ${expiredSession.client_reference_id} mis à jour en 'expired'`);
          } catch (pbError) {
            console.error('Erreur PocketBase update lead expired:', pbError);
          }

          // Récupérer les détails du lead pour l'email de relance
          const { data: lead, error: leadError } = await getLeadById(expiredSession.client_reference_id);

          if (leadError || !lead) {
            console.error('Erreur récupération lead pour relance:', leadError);
          } else {
            try {
              // Générer lien de reprise (ex. frontend avec resumeToken)
              const resumeUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?resume=${lead.resumeToken}`;

              // Préparer l'email de relance
              const mailOptions = {
                from: process.env.SMTP_USER,
                to: lead.email,
                subject: 'Reprenez votre inscription - Cercle Parisien JKD',
                html: `
                  <h1>Bonjour ${lead.first_name},</h1>
                  <p>Votre session de paiement a expiré. Nous avons remarqué que vous étiez intéressé par nos cours JKD !</p>
                  <p>Reprenez votre inscription en <a href="${resumeUrl}" style="color: #007bff; text-decoration: none;">cliquant ici</a>.</p>
                  <p><strong>Rappel de votre sélection :</strong></p>
                  <ul>
                    <li>Date du cours d'essai : Samedi 27 septembre 2025</li>
                    <li>Heure : 14h00 - 16h00</li>
                    <li>Adresse : 119 Av. du Général Leclerc, 75014 Paris</li>
                  </ul>
                  <p>Nous serions ravis de vous accueillir. N'hésitez pas si vous avez des questions !</p>
                  <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
                `
              };

              // Envoyer l'email de relance
              const info = await transporter.sendMail(mailOptions);
              console.log('Email de relance envoyé:', info.messageId, 'à', lead.email);
            } catch (emailError) {
              console.error('Erreur envoi email de relance:', emailError);
            }
          }
        }
        break;

      default:
        console.log(`Événement non géré: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Erreur webhook Stripe:', error);
    res.status(500).json({ error: 'Erreur du webhook' });
  }
}

/**
 * POST /api/webhooks/stripe
 * Webhook pour gérer les événements Stripe
 */
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

/**
 * POST /webhook
 * Route pour CLI Stripe (forward vers handler interne)
 */
app.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

/**
 * POST /api/webhook
 * Route pour dashboard Stripe (forward vers handler interne)
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

/**
 * POST /api/leads/upsert
 * Enregistre ou met à jour un prospect dans la base de données
 */
app.post('/api/leads/upsert', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ error: 'Service PocketBase non disponible' });
    }

    const { email, first_name, phone, plan_id, utm } = req.body;

    // Validation des données requises
    if (!email || !first_name || !phone) {
      return res.status(400).json({
        error: 'Données manquantes: email, prénom et téléphone sont requis'
      });
    }

    // Générer un token de reprise si ce n'est pas fourni
    const resumeToken = req.body.resumeToken || generateResumeToken();

    // Upsert dans PocketBase
    const { data, error } = await upsertLead({
      email: email.toLowerCase(),
      first_name: first_name.trim(),
      phone: phone.trim(),
      plan_id: plan_id || null,
      resumeToken: resumeToken,
      status: 'new'
    });

    if (error) {
      console.error('Erreur PocketBase leads upsert:', error);
      return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du lead' });
    }

    console.log(`Lead enregistré: ${email} avec token: ${resumeToken}`);

    res.json({
      success: true,
      leadId: data.id,
      resumeToken: resumeToken
    });

  } catch (error) {
    console.error('Erreur /api/leads/upsert:', error);
    res.status(500).json({ error: 'Erreur serveur interne' });
  }
});

/**
 * POST /api/confirm-free
 * Confirm free trial without payment
 */
app.post('/api/confirm-free', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ error: 'Service PocketBase non disponible' });
    }

    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'Lead ID requis' });
    }

    // Update status
    await updateLeadStatus(leadId, 'confirmed_free');

    // Fetch lead for email
    const { data: lead, error: leadError } = await getLeadById(leadId);

    if (leadError || !lead) {
      return res.status(500).json({ error: 'Lead not found' });
    }

    // Generate ICS
    const icsContent = generateICS(lead.first_name, lead.email);

    // Prepare email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: lead.email,
      subject: 'Confirmation d\'inscription gratuite - Cercle Parisien JKD',
      html: `
        <h1>Bienvenue ${lead.first_name} !</h1>
        <p>Votre inscription gratuite a été confirmée.</p>
        <p><strong>Rendez-vous pour votre cours d'essai :</strong></p>
        <ul>
          <li><strong>Date :</strong> Samedi 27 septembre 2025</li>
          <li><strong>Heure :</strong> 14h00 - 16h00</li>
          <li><strong>Adresse :</strong> 119 Av. du Général Leclerc, 75014 Paris</li>
          <li><strong>Téléphone :</strong> 06 50 75 43 89</li>
        </ul>
        <p><a href="https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris" target="_blank">Ouvrir dans Google Maps</a></p>
        <p>Nous avons hâte de vous accueillir !</p>
        <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
      `,
      attachments: [
        {
          filename: 'rdv-cours-essai-jkd.ics',
          content: icsContent,
          contentType: 'text/calendar; method=REQUEST'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email confirmation gratuite envoyé:', info.messageId, 'à', lead.email);

    res.json({ success: true, message: 'Inscription gratuite confirmée, email envoyé' });
  } catch (error) {
    console.error('Erreur confirm free:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * GET /api/get-lead
 * Get lead data by resumeToken
 */
app.get('/api/get-lead', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ success: false, error: 'Service PocketBase non disponible' });
    }

    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, error: 'Token requis' });
    }

    const { data, error } = await getLeadByToken(token);

    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, lead: data });
  } catch (error) {
    console.error('Erreur get lead:', error);
    res.status(500).json({ success: false, error: 'Erreur serveur' });
  }
});

/**
 * POST /api/send-contact
 * Envoie un formulaire de contact
 */
app.post('/api/send-contact', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ error: 'Service PocketBase non disponible' });
    }

    const { firstName, email, message = '' } = req.body;

    if (!firstName || !email || !message) {
      return res.status(400).json({ error: 'Prénom, email et message sont requis' });
    }

    // Upsert lead in PocketBase
    const { data: lead, error: leadError } = await upsertLead({
      email: email.toLowerCase(),
      first_name: firstName.trim(),
      status: 'contact_form'
    });

    if (leadError) {
      console.error('Erreur PocketBase contact upsert:', leadError);
    }

    // Initial email to team (HTML, with Reply-To prospect)
    const mailOptions = {
      from: process.env.SMTP_USER,
      replyTo: email,
      to: 'cedric.atticot@cercle-parisien.com',
      cc: 'interceptjkd@hotmail.com, thierry.hugon@cercle-parisien.com',
      subject: 'Re: [SITE CPJKD ]Prise de contact',
      html: `
        <h2>Nouvelle prise de contact via le site CPJKD</h2>
        <p><strong>Prénom:</strong> ${firstName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <hr>
        <p>Lead ID: ${lead ? lead.id : 'N/A'}</p>
      `
    };

    await transporter.sendMail(mailOptions);

    // Schedule follow-up email after 15 min
    setTimeout(async () => {
      const greet = firstName ? `Salut ${firstName} !` : 'Salut !';
      const followUpOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Re: [SITE CPJKD ]Prise de contact',
        html: `
          <p>${greet}</p>
          <p>Oui, tu peux faire un cours d'essai gratuit. On s'entraîne chaque samedi 14h–16h au Centre Alésia (119 Av. du Général Leclerc, Paris 14e).</p>
          <p>Viens en tenue confortable avec une paire de baskets pour l'intérieur.</p>
          <p>Le plus simple : appelle-moi au 06 50 75 43 89 pour confirmer ta venue.</p>
          <p>On sera ravis de t'accueillir dès ce samedi.</p>
          <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
        `
      };

      await transporter.sendMail(followUpOptions);
      console.log(`Follow-up email sent to ${email}`);
    }, 15 * 60 * 1000);

    res.json({ success: true, message: 'Message envoyé' });
  } catch (error) {
    console.error('Erreur send contact:', error);
    res.status(500).json({ error: 'Erreur envoi message' });
  }
});

/**
 * POST /api/send-rib
 * Send RIB details for bank transfer
 */
app.post('/api/send-rib', async (req, res) => {
  try {
    if (!pb) {
      return res.status(503).json({ error: 'Service PocketBase non disponible' });
    }

    const { leadId, planId, tshirtQuantity, includeLicense, includeAlesia, isIntegralUpgrade, email } = req.body;

    if (!leadId || !email) {
      return res.status(400).json({ error: 'Lead ID et email requis' });
    }

    // Fetch lead
    const { data: lead, error: leadError } = await getLeadById(leadId);

    if (leadError || !lead) {
      return res.status(500).json({ error: 'Lead not found' });
    }

    // Update status
    await updateLeadStatus(leadId, 'bank_transfer');

    // RIB details
    const ribDetails = {
      iban: 'FR76 3006 6106 0001 0235 6789 012',
      bic: 'CMCIFRPP',
      holder: 'Cercle Parisien JKD',
      bank: 'Crédit Mutuel'
    };

    // Plans and calculation
    const plans = {
      'price_1SAAj4FgfkXEYKPg0Sn0J28G': { name: 'Cours d\'essai', price: 35 },
      'price_1SAAj4FgfkXEYKPggPeNd6T4': { name: 'Abonnement annuel', price: 550 },
      'price_1SAAj5FgfkXEYKPgjo0MBeJK': { name: 'Abonnement trimestriel', price: 220 }
    };
    const plan = plans[planId];
    const T_SHIRT_ANNUAL_PRICE = 25;
    const T_SHIRT_REGULAR_PRICE = 30;
    const LICENSE_PRICE = 25;
    const ALESIA_MEMBERSHIP_PRICE = 30;
    const INTEGRAL_PACK_UPSELL_PRICE = 150;
    const isAnnualPlan = plan && plan.name.includes('annuel');
    const effectiveTshirtPrice = isAnnualPlan ? T_SHIRT_ANNUAL_PRICE : T_SHIRT_REGULAR_PRICE;
    let totalPrice = plan ? plan.price : 0;
    if (tshirtQuantity > 0) totalPrice += tshirtQuantity * effectiveTshirtPrice;
    if (includeLicense) totalPrice += LICENSE_PRICE;
    if (includeAlesia) totalPrice += ALESIA_MEMBERSHIP_PRICE;
    if (isIntegralUpgrade && isAnnualPlan) {
      totalPrice += INTEGRAL_PACK_UPSELL_PRICE;
    }

    // Email to client
    const clientMailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Coordonnées RIB - Inscription CPJKD',
      html: `
        <h1>Bonjour ${lead.first_name},</h1>
        <p>Merci pour votre intérêt pour nos cours JKD ! Vous avez choisi le paiement par virement bancaire.</p>
        <p><strong>Coordonnées bancaires :</strong></p>
        <ul>
          <li>IBAN : ${ribDetails.iban}</li>
          <li>BIC : ${ribDetails.bic}</li>
          <li>Titulaire : ${ribDetails.holder}</li>
          <li>Banque : ${ribDetails.bank}</li>
        </ul>
        <p><strong>Montant à verser :</strong> ${totalPrice.toFixed(2)} €</p>
        <p>Objet du virement : Inscription CPJKD - ${lead.first_name} ${email}</p>
        <p>Une fois le virement effectué, confirmez-nous par email à cette adresse.</p>
        <p><strong>Rappel de votre sélection :</strong></p>
        <ul>
          <li>Plan : ${plan ? plan.name : 'Non spécifié'}</li>
          <li>T-shirts : ${tshirtQuantity}</li>
          <li>Licence : ${includeLicense ? 'Oui' : 'Non'}</li>
          <li>Adhésion Alesia : ${includeAlesia ? 'Oui' : 'Non'}</li>
          <li>Pack intégral : ${isIntegralUpgrade ? 'Oui' : 'Non'}</li>
        </ul>
        <p>Nous avons hâte de vous accueillir !</p>
        <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
      `
    };

    // Email to admin
    const adminMailOptions = {
      from: process.env.SMTP_USER,
      to: 'cedric.atticot@cercle-parisien.com',
      cc: 'interceptjkd@hotmail.com, thierry.hugon@cercle-parisien.com',
      subject: 'Nouveau virement bancaire - CPJKD',
      html: `
        <h1>Nouveau paiement par virement</h1>
        <p>Un nouveau lead a choisi le virement bancaire.</p>
        <p><strong>Détails :</strong></p>
        <ul>
          <li>Lead ID : ${leadId}</li>
          <li>Nom : ${lead.first_name}</li>
          <li>Email : ${email}</li>
          <li>Téléphone : ${lead.phone}</li>
          <li>Plan : ${plan ? plan.name : 'Non spécifié'}</li>
          <li>Montant : ${totalPrice.toFixed(2)} €</li>
          <li>T-shirts : ${tshirtQuantity}</li>
          <li>Licence : ${includeLicense ? 'Oui' : 'Non'}</li>
          <li>Adhésion Alesia : ${includeAlesia ? 'Oui' : 'Non'}</li>
          <li>Pack intégral : ${isIntegralUpgrade ? 'Oui' : 'Non'}</li>
        </ul>
        <p>Surveillez votre compte bancaire pour le virement.</p>
        <p>Cordialement,<br>Système CPJKD</p>
      `
    };

    await transporter.sendMail(clientMailOptions);
    await transporter.sendMail(adminMailOptions);

    res.json({ success: true, message: 'RIB envoyé par email' });
  } catch (error) {
    console.error('Erreur send rib:', error);
    res.status(500).json({ error: 'Erreur envoi RIB' });
  }
});

/**
 * POST /api/test-email
 * Endpoint de test pour envoyer un email de confirmation sans paiement
 */
app.post('/api/test-email', async (req, res) => {
  try {
    const { email, firstName = 'Client' } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email destinataire requis' });
    }

    // Générer ICS
    const icsContent = generateICS(firstName, email);

    // Préparer l'email de test
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: '[TEST] Confirmation d\'inscription - Cercle Parisien JKD',
      html: `
        <h1>Test - Bienvenue ${firstName} !</h1>
        <p>Ceci est un email de test pour vérifier la configuration SMTP.</p>
        <p><strong>Rendez-vous pour votre cours d'essai :</strong></p>
        <ul>
          <li><strong>Date :</strong> Samedi 27 septembre 2025</li>
          <li><strong>Heure :</strong> 14h00 - 16h00</li>
          <li><strong>Adresse :</strong> 119 Av. du Général Leclerc, 75014 Paris</li>
          <li><strong>Téléphone :</strong> 06 50 75 43 89</li>
        </ul>
        <p><a href="https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris" target="_blank">Ouvrir dans Google Maps</a></p>
        <p>Si vous recevez cet email avec le fichier ICS joint, la configuration fonctionne !</p>
        <p>Cordialement,<br>L'équipe du Cercle Parisien JKD</p>
      `,
      attachments: [
        {
          filename: 'rdv-cours-essai-jkd.ics',
          content: icsContent,
          contentType: 'text/calendar; method=REQUEST'
        }
      ]
    };

    // Envoyer l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email de test envoyé:', info.messageId, 'à', email);

    res.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Erreur envoi email de test:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de l\'email de test',
      details: error.message
    });
  }
});

/**
 * POST /api/validate-promo
 * Validate a promo code and return discount details
 */
app.post('/api/validate-promo', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ valid: false, error: 'Code promo requis' });
    }

    // Retrieve promotion code
    const promotionCodes = await stripe.promotionCodes.list({
      code: code,
      limit: 1,
    });

    if (promotionCodes.data.length === 0) {
      return res.json({ valid: false, error: 'Code promo invalide' });
    }

    const promo = promotionCodes.data[0];
    if (promo.coupon.valid) {
      const coupon = await stripe.coupons.retrieve(promo.coupon.id);
      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
          duration: coupon.duration
        }
      });
    } else {
      res.json({ valid: false, error: 'Code promo expiré ou non valide' });
    }
  } catch (error) {
    console.error('Erreur validation promo:', error);
    res.status(500).json({ valid: false, error: 'Erreur serveur' });
  }
});

// ===============================
// ROUTES DE TEST
// ===============================

/**
 * GET /api/health
 * Vérifie que le serveur fonctionne
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    domain: 'cercle-parisien.com',
    pocketbase: pb ? 'configured' : 'not configured'
  });
});

// ===============================
// GESTION DES ERREURS
// ===============================

// 404 - Page non trouvée
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// ===============================
// DÉMARRAGE DU SERVEUR
// ===============================

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Cercle Parisien JKD démarré sur le port ${PORT}`);
  console.log(`📡 API disponible: http://localhost:${PORT}`);
  console.log(`🌐 Frontend disponible: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Domaine: cercle-parisien.com`);
  console.log(`⚠️  PocketBase: ${pb ? 'configuré' : 'non configuré'}`);
});

// ===============================
// FONCTIONS UTILITAIRES
// ===============================

/**
 * Génère un token de reprise unique
 */
function generateResumeToken() {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...');
  server.close(() => {
    console.log('Serveur arrêté');
    process.exit(0);
  });
});
