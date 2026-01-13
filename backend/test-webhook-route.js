// ROUTE DE TEST WEBHOOK - Ne pas déployer en production !
// Cette route simule un webhook Stripe pour tester les emails sans toucher à la config live

const express = require('express');
const router = express.Router();

// Import des fonctions nécessaires
const { generateICS } = require('./ics-generator');
const emailTemplates = require('./email-templates');

/**
 * POST /api/test/webhook
 * Simule un webhook Stripe checkout.session.completed pour tester les emails
 * 
 * Body attendu:
 * {
 *   "email": "test@example.com",
 *   "first_name": "John",
 *   "plan_type": "trial" | "annual" | "3x"
 * }
 */
router.post('/test/webhook', async (req, res) => {
  try {
    const { email, first_name, plan_type = 'trial' } = req.body;

    if (!email || !first_name) {
      return res.status(400).json({ 
        error: 'Email et prénom requis',
        example: {
          email: 'test@example.com',
          first_name: 'John',
          plan_type: 'trial'
        }
      });
    }

    console.log(`\n🧪 [TEST WEBHOOK] Simulation paiement ${plan_type} pour ${first_name} (${email})`);

    // Générer le fichier ICS
    const icsContent = generateICS(first_name, email, plan_type);

    // Mapping du plan_type vers le template
    const templateMap = {
      'trial': 'trial',
      'annual': 'annual',
      '3x': 'threePayments',
      'threepayments': 'threePayments'
    };

    const templateKey = templateMap[plan_type] || 'trial';
    const emailTemplate = emailTemplates[templateKey](first_name);

    // Préparer l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `[TEST] ${emailTemplate.subject}`,
      html: emailTemplate.html,
      attachments: [
        {
          filename: 'cours-jkd.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };

    // Envoyer l'email (en utilisant le transporter déjà configuré)
    const transporter = req.app.locals.transporter;
    if (!transporter) {
      throw new Error('Transporter email non configuré');
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ [TEST] Email envoyé:`, info.messageId);

    res.json({
      success: true,
      message: 'Email de test envoyé avec succès',
      details: {
        recipient: email,
        plan_type: plan_type,
        message_id: info.messageId,
        template_used: templateKey
      }
    });

  } catch (error) {
    console.error('❌ [TEST WEBHOOK] Erreur:', error);
    res.status(500).json({
      error: 'Erreur lors de l\'envoi de l\'email de test',
      message: error.message
    });
  }
});

/**
 * GET /api/test/webhook/info
 * Affiche les informations sur l'endpoint de test
 */
router.get('/test/webhook/info', (req, res) => {
  res.json({
    endpoint: '/api/test/webhook',
    method: 'POST',
    description: 'Simule un webhook Stripe pour tester les emails sans toucher à la production',
    body: {
      email: 'string (required)',
      first_name: 'string (required)',
      plan_type: 'string (optional) - trial | annual | 3x'
    },
    examples: [
      {
        description: 'Test cours d\'essai',
        body: {
          email: 'chad942@hotmail.com',
          first_name: 'Chad',
          plan_type: 'trial'
        }
      },
      {
        description: 'Test abonnement annuel',
        body: {
          email: 'chad942@hotmail.com',
          first_name: 'Chad',
          plan_type: 'annual'
        }
      },
      {
        description: 'Test paiement en 3 fois',
        body: {
          email: 'chad942@hotmail.com',
          first_name: 'Chad',
          plan_type: '3x'
        }
      }
    ],
    curl_examples: [
      `curl -X POST http://localhost:3000/api/test/webhook \\
  -H "Content-Type: application/json" \\
  -d '{"email":"chad942@hotmail.com","first_name":"Chad","plan_type":"trial"}'`,
      
      `curl -X POST https://cercle-parisien.com/api/test/webhook \\
  -H "Content-Type: application/json" \\
  -d '{"email":"chad942@hotmail.com","first_name":"Chad","plan_type":"3x"}'`
    ]
  });
});

module.exports = router;
