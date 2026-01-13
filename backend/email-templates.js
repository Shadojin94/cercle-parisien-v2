// Templates d'emails professionnels pour le Cercle Parisien JKD
// Design sobre inspiré de Stripe, anti-spam, compatible tous clients email

const emailTemplates = {
  
  // Template pour cours d'essai (35€)
  trial: (firstName) => ({
    subject: 'Confirmation d\'inscription - Cours d\'essai JKD',
    html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation d'inscription</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9fc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Header avec logo -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                CERCLE PARISIEN JKD
              </h1>
            </td>
          </tr>

          <!-- Badge de confirmation -->
          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✓ Paiement confirmé
              </div>
            </td>
          </tr>

          <!-- Message principal -->
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

          <!-- Détails du cours -->
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
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">Samedi 27 septembre 2025</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Horaire</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">14h00 - 16h00</td>
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

          <!-- Bouton Google Maps -->
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris" 
                 style="display: inline-block; background-color: #fbbf24; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.3px;">
                Voir sur Google Maps
              </a>
            </td>
          </tr>

          <!-- Footer -->
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
  }),

  // Template pour abonnement annuel (550€)
  annual: (firstName) => ({
    subject: 'Confirmation d\'inscription - Abonnement Annuel JKD',
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
          
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                CERCLE PARISIEN JKD
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✓ Abonnement activé
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                Bienvenue ${firstName} !
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Votre abonnement annuel est maintenant actif. Vous avez accès à tous les cours pendant 12 mois.
              </p>
            </td>
          </tr>

          <!-- Récapitulatif abonnement -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #fbbf24;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px; color: #92400e; font-size: 14px; font-weight: 600;">
                      Votre abonnement
                    </p>
                    <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.5;">
                      <strong style="font-size: 18px;">550€</strong> pour 12 mois<br>
                      <span style="font-size: 13px;">Économie de 100€</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Détails du premier cours (identique) -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      Votre premier cours
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Date</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">Samedi 27 septembre 2025</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Horaire</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">14h00 - 16h00</td>
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

          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris" 
                 style="display: inline-block; background-color: #fbbf24; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                Voir sur Google Maps
              </a>
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
  }),

  // Template pour paiement en 3 fois (187€×3)
  threePayments: (firstName) => ({
    subject: 'Confirmation d\'inscription - Abonnement Annuel (3 paiements)',
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
          
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
                CERCLE PARISIEN JKD
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px 20px; text-align: center;">
              <div style="display: inline-block; background-color: #10b981; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                ✓ 1er paiement confirmé
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px 30px;">
              <h2 style="margin: 0 0 16px; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                Bienvenue ${firstName} !
              </h2>
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Votre premier paiement a été confirmé. Votre abonnement annuel est maintenant actif.
              </p>
            </td>
          </tr>

          <!-- Calendrier des paiements -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      Vos 3 paiements mensuels
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #10b981; color: white; text-align: center; border-radius: 50%; font-size: 12px; line-height: 20px; font-weight: 600;">✓</span>
                          <span style="margin-left: 12px; color: #1a1a1a; font-size: 14px; font-weight: 500;">1er paiement • Aujourd'hui • 187€</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #e5e7eb; color: #6b7280; text-align: center; border-radius: 50%; font-size: 12px; line-height: 20px;">2</span>
                          <span style="margin-left: 12px; color: #6b7280; font-size: 14px;">2ème paiement • Dans 1 mois • 187€</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 12px 0;">
                          <span style="display: inline-block; width: 20px; height: 20px; background-color: #e5e7eb; color: #6b7280; text-align: center; border-radius: 50%; font-size: 12px; line-height: 20px;">3</span>
                          <span style="margin-left: 12px; color: #6b7280; font-size: 14px;">3ème paiement • Dans 2 mois • 187€</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Note importante -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #dbeafe; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.5;">
                      <strong>Annulation automatique :</strong> Votre abonnement sera automatiquement annulé après le 3ème paiement. Aucune action requise de votre part.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Détails du premier cours -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                <tr>
                  <td style="padding: 24px;">
                    <h3 style="margin: 0 0 16px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                      Votre premier cours
                    </h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Date</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">Samedi 27 septembre 2025</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Horaire</td>
                        <td style="padding: 8px 0; color: #1a1a1a; font-size: 14px; font-weight: 500;">14h00 - 16h00</td>
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

          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris" 
                 style="display: inline-block; background-color: #fbbf24; color: #000000; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600;">
                Voir sur Google Maps
              </a>
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
  })
};

module.exports = emailTemplates;
