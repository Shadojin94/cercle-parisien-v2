require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Envoi d\'un email de test à chad942@hotmail.com\n');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
    pass: process.env.SMTP_PASS || 'jvbypiuzwwjhosuo'
  }
});

const mailOptions = {
  from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
  to: 'chad942@hotmail.com',
  subject: '✅ Test Email - Cercle Parisien JKD',
  html: `
    <h1>✅ Configuration Email Testée avec Succès !</h1>
    <p>Bonjour,</p>
    <p>Ce message confirme que la configuration email du Cercle Parisien JKD fonctionne correctement.</p>
    
    <h2>📋 Problèmes identifiés :</h2>
    <ol>
      <li><strong>Webhook Stripe :</strong> Reçoit des erreurs 301 (redirection)</li>
      <li><strong>URL du webhook :</strong> Doit être changée dans Stripe Dashboard</li>
    </ol>
    
    <h2>🔧 Solutions :</h2>
    <ol>
      <li>Dans Stripe Dashboard > Développeurs > Webhooks</li>
      <li>Modifier l'URL en : <code>https://cercle-parisien.com/webhook</code></li>
      <li>OU garder <code>https://cercle-parisien.com/api/webhook</code> mais modifier la config Nginx</li>
    </ol>
    
    <h2>🎯 Événements à activer :</h2>
    <ul>
      <li>checkout.session.completed</li>
      <li>checkout.session.expired</li>
    </ul>
    
    <p><strong>Une fois corrigé, les emails de confirmation de paiement fonctionneront automatiquement !</strong></p>
    
    <hr>
    <p style="color: #666; font-size: 0.9em;">
      Ce message est un test de la configuration SMTP du Cercle Parisien de Jeet Kune Do.<br>
      Configuration : smtp.gmail.com:465 avec ${process.env.SMTP_USER || 'cedriccercleparisien@gmail.com'}
    </p>
  `
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log('❌ ERREUR lors de l\'envoi:');
    console.log(error);
    process.exit(1);
  } else {
    console.log('✅ Email envoyé avec succès à chad942@hotmail.com !');
    console.log('Message ID:', info.messageId);
    console.log('');
    console.log('🎉 Vérifiez votre boîte de réception (et les spams) !');
    process.exit(0);
  }
});
