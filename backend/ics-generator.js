// Générateur ICS amélioré - Compatible Outlook Windows
const { getCoursDate } = require('./date-calculator');

function generateICS(firstName, email, planType = 'trial') {
  const coursDate = getCoursDate();
  
  const titles = {
    'trial': `Cours d'essai JKD - ${firstName}`,
    'annual': `Premier cours JKD - ${firstName}`,
    '3x': `Premier cours JKD - ${firstName}`
  };

  const { error, value } = require('ics').createEvent({
    title: titles[planType] || titles['trial'],
    start: coursDate.startArray,
    end: coursDate.endArray,
    startInputType: 'local',
    startOutputType: 'local',
    endInputType: 'local', 
    endOutputType: 'local',
    location: '119 Avenue du Général Leclerc, 75014 Paris, France',
    description: [
      'Bienvenue au Cercle Parisien de Jeet Kune Do !',
      '',
      'Adresse: 119 Av. du Général Leclerc, 75014 Paris',
      'Telephone: 06 50 75 43 89',
      'Site: https://cercle-parisien.com',
      '',
      'Lien Google Maps:',
      'https://maps.google.com/?q=119+Avenue+du+Général+Leclerc,+75014+Paris',
      '',
      'Nous avons hate de vous accueillir !',
      '',
      '- L\'equipe du Cercle Parisien JKD'
    ].join('\n'),
    url: 'https://cercle-parisien.com',
    geo: { lat: 48.8334, lon: 2.3268 },
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { 
      name: 'Cercle Parisien JKD', 
      email: 'contact@cercle-parisien.com' 
    },
    attendees: [
      { 
        name: firstName, 
        email: email,
        rsvp: true,
        partstat: 'ACCEPTED',
        role: 'REQ-PARTICIPANT'
      }
    ],
    alarms: [
      {
        action: 'display',
        description: 'Rappel: Cours JKD dans 24h',
        trigger: { hours: 24, before: true }
      },
      {
        action: 'display', 
        description: 'Rappel: Cours JKD dans 2h',
        trigger: { hours: 2, before: true }
      }
    ],
    productId: 'cercle-parisien.com',
    method: 'REQUEST',
    uid: `cours-jkd-${Date.now()}-${email.replace('@', '-at-')}@cercle-parisien.com`,
    sequence: 0,
    calName: 'Cercle Parisien JKD'
  });

  if (error) {
    console.error('Erreur generation ICS:', error);
    throw new Error(`Erreur generation ICS: ${error}`);
  }

  return value;
}

// Fonction pour générer un lien Google Calendar
function generateGoogleCalendarLink(firstName, planType = 'trial') {
  const coursDate = getCoursDate();
  
  const titles = {
    'trial': `Cours d'essai JKD - ${firstName}`,
    'annual': `Premier cours JKD - ${firstName}`,
    '3x': `Premier cours JKD - ${firstName}`
  };
  
  const title = encodeURIComponent(titles[planType] || titles['trial']);
  const details = encodeURIComponent(
    'Bienvenue au Cercle Parisien de Jeet Kune Do !\n\n' +
    'Adresse: 119 Av. du Général Leclerc, 75014 Paris\n' +
    'Téléphone: 06 50 75 43 89\n' +
    'Site: https://cercle-parisien.com'
  );
  const location = encodeURIComponent('119 Avenue du Général Leclerc, 75014 Paris, France');
  
  // Format: YYYYMMDDTHHmmss
  const formatDateForGoogle = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  };
  
  const dates = `${formatDateForGoogle(coursDate.start)}/${formatDateForGoogle(coursDate.end)}`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

module.exports = { generateICS, generateGoogleCalendarLink, getCoursDate };
