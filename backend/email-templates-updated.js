// Templates d'emails avec logo et dates calculées automatiquement
const { getCoursDate, generateGoogleCalendarLink } = require('./ics-generator');

const emailTemplates = {
  
  trial: (firstName) => {
    const coursDate = getCoursDate();
    const gcalLink = generateGoogleCalendarLink(firstName, 'trial');
    
    return {
      subject: 'Confirmation d\'inscription - Cours d\'essai JKD',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header avec logo -->
          <tr>
            <td style="padding: 30px 40px; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="60" style="vertical-align: middle;">
                    <img src="https://i.imgur.com/YOUR_LOGO_ID.png" alt="CPJKD Logo" width="50" height="50" style="display: block; border-radius: 4px;"/>
                  </td>
                  <td style="vertical-align: middle; padding-left: 15px;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: -0.3px;">
                      CERCLE PARISIEN<br><span style="font-size: 16px; font-weight: 400;">de Jeet Kune Do</span>
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✓ Paiement confirmé
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                Bienvenue ${firstName} !
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Votre inscription au cours d'essai a été confirmée avec succès.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      Détails de votre cours
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Date</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${coursDate.formatted}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Horaire</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">${coursDate.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Lieu</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">119 Av. du Général Leclerc<br>75014 Paris</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Contact</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">06 50 75 43 89</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Boutons -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris" 
                       style="display: inline-block; background-color: #fbbf24; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                      📍 Voir sur Google Maps
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="${gcalLink}" 
                       style="display: inline-block; background-color: #f3f4f6; color: #1a1a1a; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 500; border: 1px solid #e5e7eb;">
                      📅 Ajouter à Google Calendar
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-align: center;">
                Cercle Parisien de Jeet Kune Do
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 13px; text-align: center;">
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
      `
    };
  },

  // Template annuel (550€) - À compléter de la même manière
  annual: (firstName) => {
    const coursDate = getCoursDate();
    const gcalLink = generateGoogleCalendarLink(firstName, 'annual');
    
    return {
      subject: 'Confirmation d\'inscription - Abonnement Annuel JKD',
      html: `<!-- Même structure avec date calculée et bouton Google Calendar -->`
    };
  },

  // Template 3 paiements - À compléter de la même manière  
  threePayments: (firstName) => {
    const coursDate = getCoursDate();
    const gcalLink = generateGoogleCalendarLink(firstName, '3x');
    
    return {
      subject: 'Confirmation d\'inscription - Abonnement Annuel (3 paiements)',
      html: `<!-- Même structure avec date calculée et bouton Google Calendar -->`
    };
  }
};

module.exports = emailTemplates;
