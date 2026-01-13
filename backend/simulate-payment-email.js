require('dotenv').config();
const nodemailer = require('nodemailer');
const ics = require('ics');

console.log('🧪 Simulation d\'un paiement réussi - Test email de confirmation\n');

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

// Fonction pour générer le fichier ICS (identique à index.js)
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

// Données du test
const testLead = {
  first_name: 'Chad',
  email: 'chad942@hotmail.com'
};

console.log(`📧 Envoi d'un email de confirmation à ${testLead.email}...\n`);

try {
  // Générer le fichier ICS
  const icsContent = generateICS(testLead.first_name, testLead.email);

  // Préparer l'email (identique à ce qui est envoyé après paiement)
  const mailOptions = {
    from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
    to: testLead.email,
    subject: 'Confirmation d\'inscription - Cercle Parisien JKD',
    html: `
      <h1>Bienvenue ${testLead.first_name} !</h1>
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
      <hr>
      <p style="color: #999; font-size: 0.9em;">
        <strong>🧪 Ceci est un email de TEST</strong><br>
        Simulation d'un paiement réussi pour tester le système d'envoi d'emails.
      </p>
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
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log('❌ ERREUR lors de l\'envoi:');
      console.log(error);
      process.exit(1);
    } else {
      console.log('✅ Email de confirmation envoyé avec succès !');
      console.log('Message ID:', info.messageId);
      console.log('Destinataire:', testLead.email);
      console.log('');
      console.log('🎉 Vérifiez votre boîte mail !');
      console.log('');
      console.log('📎 L\'email contient :');
      console.log('  - Message de bienvenue personnalisé');
      console.log('  - Détails du rendez-vous (date, heure, adresse)');
      console.log('  - Fichier ICS pour ajouter au calendrier');
      console.log('  - Lien Google Maps');
      console.log('');
      console.log('✨ C\'est exactement cet email que vos clients recevront après paiement !');
      process.exit(0);
    }
  });
} catch (error) {
  console.log('❌ ERREUR:');
  console.log(error);
  process.exit(1);
}
