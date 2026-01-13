require('dotenv').config();
const nodemailer = require('nodemailer');
const { generateICS, generateGoogleCalendarLink, getCoursDate } = require('./ics-generator');

console.log('🧪 Test Email avec DATE CALCULÉE + LIEN GOOGLE CALENDAR\n');

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

async function sendTestEmail() {
  try {
    const coursDate = getCoursDate();
    const gcalLink = generateGoogleCalendarLink(testData.first_name, '3x');
    
    console.log('📅 Date calculée du prochain cours:');
    console.log(`   ${coursDate.formatted}`);
    console.log(`   ${coursDate.time}\n`);
    
    // Générer ICS
    const icsContent = generateICS(testData.first_name, testData.email, '3x');
    
    const mailOptions = {
      from: process.env.SMTP_USER || 'cedriccercleparisien@gmail.com',
      to: testData.email,
      subject: '[TEST] Confirmation - Paiement en 3 fois avec DATE CALCULÉE',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f9fc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;background:linear-gradient(135deg,#1e3c72 0%,#2a5298 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" style="vertical-align:middle;">
                    <div style="width:50px;height:50px;background:#fbbf24;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;">🥋</div>
                  </td>
                  <td style="vertical-align:middle;padding-left:15px;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">
                      CERCLE PARISIEN<br><span style="font-size:16px;font-weight:400;">de Jeet Kune Do</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px 20px;text-align:center;">
              <div style="display:inline-block;background-color:#10b981;color:white;padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
                ✓ 1er paiement confirmé
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 40px 30px;">
              <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:22px;font-weight:600;">
                Bienvenue ${testData.first_name} !
              </h2>
              <p style="margin:0;color:#6b7280;font-size:16px;line-height:1.6;">
                Votre premier paiement a été confirmé. Votre abonnement annuel est maintenant actif.
              </p>
            </td>
          </tr>

          <!-- Détails du cours avec DATE CALCULÉE -->
          <tr>
            <td style="padding:0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;border:1px solid #e5e7eb;">
                <tr>
                  <td style="padding:24px;">
                    <h3 style="margin:0 0 16px;color:#1a1a1a;font-size:16px;font-weight:600;">
                      Votre premier cours
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">Date</td>
                        <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:500;">${coursDate.formatted}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Horaire</td>
                        <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:500;">${coursDate.time}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Lieu</td>
                        <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:500;">119 Av. du Général Leclerc<br>75014 Paris</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Contact</td>
                        <td style="padding:8px 0;color:#1a1a1a;font-size:14px;font-weight:500;">06 50 75 43 89</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Boutons -->
          <tr>
            <td style="padding:0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris" 
                       style="display:inline-block;background-color:#fbbf24;color:#000000;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600;">
                      📍 Voir sur Google Maps
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${gcalLink}" 
                       style="display:inline-block;background-color:#f3f4f6;color:#1a1a1a;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:500;border:1px solid #e5e7eb;">
                      📅 Ajouter à Google Calendar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:30px 40px;border-top:1px solid #e5e7eb;background-color:#f9fafb;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:14px;text-align:center;">
                Cercle Parisien de Jeet Kune Do
              </p>
              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                contact@cercle-parisien.com • 06 50 75 43 89
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      attachments: [
        {
          filename: 'cours-jkd.ics',
          content: icsContent,
          contentType: 'text/calendar; charset=utf-8; method=REQUEST',
          contentDisposition: 'attachment'
        }
      ]
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email envoyé avec succès !');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Destinataire: ${testData.email}\n`);
    console.log('📎 Email contient:');
    console.log('   ✅ Date CALCULÉE automatiquement (prochain samedi)');
    console.log('   ✅ Fichier ICS en pièce jointe (compatible Outlook)');
    console.log('   ✅ Bouton Google Calendar pour ajout rapide');
    console.log('   ✅ Bouton Google Maps\n');
    console.log(`🔗 Lien Google Calendar: ${gcalLink}\n`);
    
    process.exit(0);
  } catch (error) {
    console.log('❌ ERREUR:', error);
    process.exit(1);
  }
}

sendTestEmail();
