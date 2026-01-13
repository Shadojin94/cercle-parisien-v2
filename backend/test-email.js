require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Test de configuration email SMTP\n');

// Afficher la configuration (masquer le password)
console.log('Configuration détectée:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'smtp.gmail.com');
console.log('- SMTP_PORT:', process.env.SMTP_PORT || '465');
console.log('- SMTP_USER:', process.env.SMTP_USER || 'cedriccercleparisien@gmail.com');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '***configuré***' : 'jvbypiuzwwjhosuo (DÉFAUT)');
console.log('');

// Configuration du transporter (identique à index.js)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Test de connexion
console.log('📡 Test de connexion au serveur SMTP...\n');

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ ERREUR de connexion SMTP:');
    console.log(error);
    console.log('\n💡 Solutions possibles:');
    console.log('1. Vérifiez que SMTP_USER et SMTP_PASS sont dans le fichier .env');
    console.log('2. Pour Gmail, utilisez un "App Password" (pas le mot de passe principal)');
    console.log('3. Activez "Accès moins sécurisé" dans Gmail si nécessaire');
    console.log('4. Vérifiez que le port 465 n\'est pas bloqué par votre firewall');
    process.exit(1);
  } else {
    console.log('✅ Connexion SMTP réussie !');
    console.log('Le serveur est prêt à envoyer des emails.\n');
    
    // Envoyer un email de test
    console.log('📧 Envoi d\'un email de test...\n');
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
      to: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com', // Envoi à soi-même
      subject: 'Test - Configuration Email CPJKD',
      html: `
        <h1>✅ Test réussi !</h1>
        <p>Ce message confirme que la configuration email fonctionne correctement.</p>
        <p><strong>Configuration utilisée:</strong></p>
        <ul>
          <li>Serveur: smtp.gmail.com:465</li>
          <li>Utilisateur: ${process.env.SMTP_USER || 'cedriccercleparisien@gmail.com'}</li>
        </ul>
        <p>Les emails de confirmation de paiement devraient maintenant fonctionner.</p>
      `
    };
    
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log('❌ ERREUR lors de l\'envoi de l\'email de test:');
        console.log(error);
        process.exit(1);
      } else {
        console.log('✅ Email de test envoyé avec succès !');
        console.log('Message ID:', info.messageId);
        console.log('');
        console.log('🎉 Tout fonctionne ! Vérifiez votre boîte de réception.');
        console.log('');
        console.log('📋 Prochaines étapes:');
        console.log('1. Vérifiez que vous avez reçu l\'email de test');
        console.log('2. Testez un paiement sur le site');
        console.log('3. Vérifiez les logs du serveur: pm2 logs cercle-parisien-api');
        process.exit(0);
      }
    });
  }
});
