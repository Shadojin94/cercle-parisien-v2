require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateICS } = require('./ics-generator');
const emailTemplates = require('./email-templates');

console.log('🧪 Test complet des emails avec nouveau design\n');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
    pass: process.env.SMTP_PASS || 'jvbypiuzwwjhosuo'
  }
});

const testData = {
  first_name: 'Chad',
  email: 'chad942@hotmail.com'
};

async function sendTestEmail(type) {
  console.log(`\n📧 Envoi de l'email type: ${type.toUpperCase()}\n`);

  try {
    // Générer le fichier ICS compatible tous calendriers
    const icsContent = generateICS(testData.first_name, testData.email, type);
    
    // Récupérer le template email
    const emailTemplate = emailTemplates[type](testData.first_name);
    
    // Préparer l'email
    const mailOptions = {
      from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
      to: testData.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      attachments: [
        {
          filename: 'cours-jkd.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST'
        }
      ]
    };
    
    // Envoyer
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Email "${type}" envoyé avec succès !`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Destinataire: ${testData.email}`);
    
    return true;
  } catch (error) {
    console.log(`❌ ERREUR lors de l'envoi de l'email "${type}":`);
    console.log(error);
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('   TEST DES 3 TYPES D\'EMAILS - NOUVEAU DESIGN');
  console.log('═══════════════════════════════════════════════════\n');
  
  // Demander quel type tester
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node test-new-emails.js [trial|annual|3x|all]\n');
    console.log('Exemples:');
    console.log('  node test-new-emails.js trial    → Teste l\'email cours d\'essai');
    console.log('  node test-new-emails.js annual   → Teste l\'email abonnement annuel');
    console.log('  node test-new-emails.js 3x       → Teste l\'email paiement en 3 fois');
    console.log('  node test-new-emails.js all      → Teste les 3 emails\n');
    process.exit(0);
  }
  
  const type = args[0].toLowerCase();
  
  if (type === 'all') {
    console.log('🎯 Test des 3 types d\'emails...\n');
    await sendTestEmail('trial');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendTestEmail('annual');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await sendTestEmail('threePayments');
  } else if (type === 'trial') {
    await sendTestEmail('trial');
  } else if (type === 'annual') {
    await sendTestEmail('annual');
  } else if (type === '3x' || type === 'threepayments') {
    await sendTestEmail('threePayments');
  } else {
    console.log('❌ Type invalide. Utilisez: trial, annual, 3x, ou all');
    process.exit(1);
  }
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('   ✅ TESTS TERMINÉS');
  console.log('═══════════════════════════════════════════════════\n');
  console.log('📬 Vérifiez votre boîte mail: chad942@hotmail.com\n');
  console.log('📎 Chaque email contient:');
  console.log('   • Design sobre inspiré de Stripe');
  console.log('   • Charte graphique Cercle Parisien (bleu/jaune)');
  console.log('   • Fichier ICS compatible iOS/Outlook/Google Calendar');
  console.log('   • Bouton Google Maps');
  console.log('   • Optimisé anti-spam\n');
  
  process.exit(0);
}

runTests();
