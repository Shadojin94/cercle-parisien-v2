require('dotenv').config();
const nodemailer = require('nodemailer');
const ics = require('ics');

console.log('🧪 Simulation paiement ANNUEL EN 3 FOIS - Test email de confirmation\n');

// Configuration email (identique à index.js)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
    pass: process.env.SMTP_PASS || 'jvbypiuzwwjhosuo'
  }
});

// Fonction pour générer le fichier ICS
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

// Données du test - Paiement en 3 fois
const testLead = {
  first_name: 'Chad',
  email: 'chad942@hotmail.com'
};

// Informations du plan 3 fois
const planInfo = {
  name: 'Abonnement annuel - Paiement en 3 fois',
  price: '187€/mois pendant 3 mois',
  total: '561€ (au lieu de 650€)',
  reduction: '89€ d\'économies',
  details: 'Annulation automatique après 3 mois'
};

console.log(`📧 Envoi email de confirmation PAIEMENT EN 3 FOIS à ${testLead.email}...\n`);

try {
  // Générer le fichier ICS
  const icsContent = generateICS(testLead.first_name, testLead.email);

  // Préparer l'email spécifique au paiement 3 fois
  const mailOptions = {
    from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
    to: testLead.email,
    subject: '🎉 Confirmation d\'inscription - Abonnement Annuel (3×) - Cercle Parisien JKD',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1e40af;">Bienvenue ${testLead.first_name} ! 🥋</h1>
        
        <div style="background: #fef3c7; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">✅ Votre premier paiement a été confirmé avec succès !</p>
        </div>

        <h2 style="color: #1e40af;">📋 Récapitulatif de votre abonnement</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Formule :</strong> ${planInfo.name}</p>
          <p><strong>Montant :</strong> ${planInfo.price}</p>
          <p><strong>Total annuel :</strong> ${planInfo.total}</p>
          <p style="color: #15803d; font-weight: bold;">💰 ${planInfo.reduction}</p>
          <p style="font-size: 0.9em; color: #6b7280;">ℹ️ ${planInfo.details}</p>
        </div>

        <h2 style="color: #1e40af;">📅 Calendrier des paiements</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>✅ 1er paiement :</strong> Aujourd'hui - 187€</p>
          <p><strong>📆 2ème paiement :</strong> Dans 1 mois - 187€</p>
          <p><strong>📆 3ème paiement :</strong> Dans 2 mois - 187€</p>
          <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db; font-size: 0.9em; color: #6b7280;">
            <strong>Important :</strong> L'abonnement sera automatiquement annulé après le 3ème paiement. 
            Vous n'aurez aucune action à effectuer et aucun prélèvement supplémentaire ne sera effectué.
          </p>
        </div>

        <h2 style="color: #1e40af;">🥋 Votre premier cours</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>📅 Date :</strong> Samedi 27 septembre 2025</p>
          <p><strong>⏰ Heure :</strong> 14h00 - 16h00</p>
          <p><strong>📍 Adresse :</strong> 119 Av. du Général Leclerc, 75014 Paris</p>
          <p><strong>📞 Téléphone :</strong> 06 50 75 43 89</p>
          <p style="margin-top: 15px;">
            <a href="https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris" 
               style="background: #fbbf24; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              📍 Ouvrir dans Google Maps
            </a>
          </p>
        </div>

        <h2 style="color: #1e40af;">💳 Gestion de votre abonnement</h2>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Vous pouvez consulter vos paiements et gérer votre abonnement à tout moment via votre espace Stripe.</p>
          <p style="font-size: 0.9em; color: #6b7280;">
            Un email de rappel vous sera envoyé avant chaque prélèvement mensuel.
          </p>
        </div>

        <div style="background: #dbeafe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-size: 0.95em; color: #1e40af;">
            <strong>📝 Note importante :</strong> Votre abonnement annuel est valide pendant 12 mois à compter d'aujourd'hui, 
            quelle que soit la date de votre premier cours. Vous avez accès à tous les cours pendant toute cette période !
          </p>
        </div>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="font-size: 1.1em; color: #1e40af;">
          <strong>Nous avons hâte de vous accueillir dans notre dojo ! 🥋</strong>
        </p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>

        <p style="margin-top: 30px;">
          Cordialement,<br>
          <strong>L'équipe du Cercle Parisien JKD</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

        <p style="color: #999; font-size: 0.85em; text-align: center;">
          <strong>🧪 CECI EST UN EMAIL DE TEST</strong><br>
          Simulation d'un paiement en 3 fois pour tester le système d'envoi d'emails.<br>
          Email envoyé via ${process.env.SMTP_USER || 'cedriccercleparisien@gmail.com'}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: 'rdv-premier-cours-jkd.ics',
        content: icsContent,
        contentType: 'text/calendar; method=REQUEST'
      }
    ]
  };

  // Envoyer l'email
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('❌ ERREUR lors de l\'envoi:');
      console.log(error);
      process.exit(1);
    } else {
      console.log('✅ Email de confirmation PAIEMENT 3× envoyé avec succès !');
      console.log('');
      console.log('📊 Détails de l\'envoi:');
      console.log('  - Message ID:', info.messageId);
      console.log('  - Destinataire:', testLead.email);
      console.log('  - Plan:', planInfo.name);
      console.log('  - Prix:', planInfo.price);
      console.log('');
      console.log('🎉 Vérifiez votre boîte mail !');
      console.log('');
      console.log('📎 L\'email contient :');
      console.log('  ✅ Message de bienvenue personnalisé');
      console.log('  ✅ Récapitulatif de l\'abonnement annuel en 3 fois');
      console.log('  ✅ Calendrier des 3 paiements mensuels');
      console.log('  ✅ Explication de l\'annulation automatique');
      console.log('  ✅ Détails du premier cours (date, heure, adresse)');
      console.log('  ✅ Fichier ICS pour ajouter au calendrier');
      console.log('  ✅ Lien Google Maps');
      console.log('  ✅ Informations sur la gestion de l\'abonnement');
      console.log('');
      console.log('💡 Points importants mis en avant:');
      console.log('  - 1er paiement confirmé');
      console.log('  - 2 prochains paiements à venir (187€/mois)');
      console.log('  - Annulation automatique après 3 mois');
      console.log('  - Économie de 89€ vs prix standard');
      console.log('');
      console.log('✨ C\'est cet email que vos clients recevront pour le paiement en 3 fois !');
      process.exit(0);
    }
  });
} catch (error) {
  console.log('❌ ERREUR:');
  console.log(error);
  process.exit(1);
}
