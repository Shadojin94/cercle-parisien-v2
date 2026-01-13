// Calcul automatique de la date du prochain cours (prochain samedi à 14h)

function getNextSaturday() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Dimanche, 6 = Samedi
  
  let daysUntilSaturday;
  
  if (currentDay === 6) {
    // Si aujourd'hui est samedi
    const currentHour = today.getHours();
    // Si il est avant 14h, c'est aujourd'hui, sinon samedi prochain
    daysUntilSaturday = currentHour < 14 ? 0 : 7;
  } else {
    // Calculer les jours jusqu'au prochain samedi
    daysUntilSaturday = (6 - currentDay + 7) % 7;
    if (daysUntilSaturday === 0) daysUntilSaturday = 7;
  }
  
  const nextSaturday = new Date(today);
  nextSaturday.setDate(today.getDate() + daysUntilSaturday);
  nextSaturday.setHours(14, 0, 0, 0); // 14h00
  
  return nextSaturday;
}

function formatDateFR(date) {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${dayName} ${day} ${month} ${year}`;
}

function getCoursDate() {
  const nextSaturday = getNextSaturday();
  const endDate = new Date(nextSaturday);
  endDate.setHours(16, 0, 0, 0); // Fin à 16h00
  
  return {
    start: nextSaturday,
    end: endDate,
    // Format pour ICS [année, mois, jour, heure, minute]
    startArray: [
      nextSaturday.getFullYear(),
      nextSaturday.getMonth() + 1, // ICS compte les mois de 1 à 12
      nextSaturday.getDate(),
      14,
      0
    ],
    endArray: [
      endDate.getFullYear(),
      endDate.getMonth() + 1,
      endDate.getDate(),
      16,
      0
    ],
    // Format texte pour email
    formatted: formatDateFR(nextSaturday),
    // Format court
    shortDate: `${nextSaturday.getDate()}/${nextSaturday.getMonth() + 1}/${nextSaturday.getFullYear()}`,
    time: '14h00 - 16h00'
  };
}

module.exports = { getCoursDate, getNextSaturday, formatDateFR };
