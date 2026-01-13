/**
 * Base de Connaissances - Cercle Parisien de Jeet Kune Do
 * Contient toutes les informations sur l'école pour l'agent IA
 *
 * Tu peux modifier ce fichier pour ajouter/mettre à jour les informations
 */

const KNOWLEDGE_BASE = {
  // === INFORMATIONS GÉNÉRALES ===
  general: {
    nom: "Cercle Parisien de Jeet Kune Do",
    nom_court: "CPJKD",
    discipline: "Jeet Kune Do - L'art martial créé par Bruce Lee",
    philosophie: "Absorber ce qui est utile, rejeter ce qui ne l'est pas, ajouter ce qui vous est propre",
    fondateur: "Sifu Lee Hong Long (Michel Levan)",
    instructeur_principal: "Cédric Atticot",
    ambiance: "Familiale, respectueuse, tous niveaux bienvenus",
    description_courte: "On pratique le JKD authentique, celui de Bruce Lee, dans une ambiance conviviale où tout le monde progresse à son rythme."
  },

  // === LOCALISATION ET ACCÈS ===
  localisation: {
    adresse: "119 Avenue du Général Leclerc, 75014 Paris",
    adresse_courte: "119 Av. Général Leclerc, Paris 14",
    quartier: "Alésia",
    centre: "Centre Alésia",
    code_postal: "75014",
    ville: "Paris",

    // Transports
    metro: [
      "Alésia (Ligne 4) - 2 min à pied",
      "Mouton-Duvernet (Ligne 4) - 5 min à pied"
    ],
    bus: ["28", "38", "68", "62"],
    tram: "T3a (Porte d'Orléans) + 10 min de marche",

    // Voiture
    parking: "Parking public rue d'Alésia à 100m, sinon places dans les rues adjacentes",
    acces_voiture: "Périphérique Porte d'Orléans, puis direction Alésia/Montrouge",

    // Liens
    google_maps: "https://maps.google.com/?q=119+Av.+du+G%C3%A9n%C3%A9ral+Leclerc,+75014+Paris",

    // Instructions d'arrivée
    instructions: "Le centre se trouve au 119, sonnez et montez au 1er étage. La salle est sur votre gauche."
  },

  // === HORAIRES ===
  horaires: {
    cours_regulier: "Samedi 14h00 - 16h00",
    jour: "Samedi",
    heure_debut: "14h00",
    heure_fin: "16h00",
    duree_cours: "2 heures",
    ouverture_salle: "13h45",
    conseil_arrivee: "Arrivez vers 13h45 pour vous changer tranquillement et être prêt à 14h",

    // Périodes spéciales
    vacances: "On s'entraîne toute l'année sauf pendant les vacances de Noël (2 semaines) et août",
    jours_feries: "Pas de cours les samedis fériés, on prévient par email"
  },

  // === VESTIAIRES ET INSTALLATIONS ===
  vestiaires: {
    disponibles: true,
    description: "Vestiaires hommes et femmes séparés avec douches",
    douches: true,
    casiers: "Casiers disponibles, apportez votre cadenas",
    toilettes: true,
    conseil: "Arrivez 15 min avant pour vous changer tranquillement",

    // Ce qu'il faut apporter
    apporter: [
      "Cadenas pour le casier",
      "Serviette si vous voulez vous doucher",
      "Tongs pour la douche (recommandé)"
    ]
  },

  // === ÉQUIPEMENT ===
  equipement: {
    tenue: {
      description: "Tenue de sport confortable",
      details: "Jogging ou short, t-shirt. Pas besoin de kimono !",
      conseil: "Évitez les vêtements avec fermetures éclair ou boutons qui peuvent blesser"
    },
    chaussures: {
      description: "Baskets propres pour l'intérieur",
      details: "Semelles non marquantes (pas de semelles noires qui laissent des traces)",
      conseil: "Gardez une paire dédiée à la salle, ou nettoyez les semelles avant d'entrer"
    },
    protections: {
      fournies: "Gants, protège-tibias et coquille fournis pour les débutants",
      achat: "Vous pourrez acheter votre propre matériel plus tard si vous continuez",
      obligatoire: "Coquille obligatoire pour les hommes (on en prête pour l'essai)"
    },
    eau: "Apportez votre bouteille d'eau, c'est important de s'hydrater",

    // Résumé pour débutants
    resume_debutant: "Pour ton premier cours, viens juste avec une tenue de sport et des baskets propres. On te prête le reste !"
  },

  // === TARIFS ===
  tarifs: {
    cours_essai: {
      prix: 35,
      prix_affiche: "35€",
      description: "Premier cours découverte",
      inclus: "Cours complet de 2h + conseils personnalisés",
      engagement: "Sans engagement, tu décides après si tu veux continuer",
      remboursement: "Non remboursable"
    },
    abonnement_annuel: {
      prix: 550,
      prix_affiche: "550€",
      prix_mensuel: "~46€/mois",
      description: "Accès illimité pendant 1 an",
      inclus: [
        "Tous les cours du samedi",
        "Événements spéciaux et stages",
        "T-shirt offert"
      ],
      paiement: "En une fois ou en 3 fois sans frais",
      meilleur_rapport: true
    },
    abonnement_trimestriel: {
      prix: 220,
      prix_affiche: "220€",
      prix_mensuel: "~73€/mois",
      description: "3 mois d'accès",
      inclus: "Tous les cours du samedi pendant 3 mois",
      paiement: "En une fois ou mensuellement"
    },
    options: {
      tshirt: {
        prix: 25,
        prix_affiche: "25€",
        description: "T-shirt officiel du Cercle (offert avec l'annuel)"
      },
      licence: {
        prix: 25,
        prix_affiche: "25€",
        description: "Licence fédérale FFJDA",
        obligatoire: false,
        avantages: "Assurance et accès aux compétitions fédérales"
      }
    },

    // Moyens de paiement
    paiement: {
      acceptes: ["Carte bancaire", "Virement bancaire", "Espèces sur place"],
      en_ligne: "Paiement sécurisé par Stripe (CB ou prélèvement)"
    }
  },

  // === CONTACT ===
  contact: {
    instructeur: {
      prenom: "Cédric",
      nom_complet: "Cédric Atticot",
      role: "Instructeur principal"
    },
    telephone: "06 50 75 43 89",
    email: "contact@cercle-parisien.com",
    email_cedric: "cedric.atticot@cercle-parisien.com",
    site: "www.cercle-parisien.com",

    // Réseaux sociaux (à compléter si besoin)
    facebook: null,
    instagram: null,
    youtube: null
  },

  // === FAQ - QUESTIONS FRÉQUENTES ===
  faq: {
    debutant: {
      question: "Je suis débutant, c'est adapté ?",
      reponse: "Absolument ! On accueille tous les niveaux. Le JKD s'adapte à chacun, on progresse à son rythme dans une ambiance bienveillante."
    },
    condition_physique: {
      question: "Faut-il être en bonne condition physique ?",
      reponse: "Pas besoin d'être un athlète ! On s'adapte à ton niveau. Le JKD, c'est justement apprendre à utiliser ton corps efficacement."
    },
    age: {
      question: "Quel âge pour commencer ?",
      reponse: "À partir de 16 ans. Pour les plus jeunes, contacte-nous pour en discuter."
    },
    age_max: {
      question: "Y a-t-il un âge maximum ?",
      reponse: "Non ! On a des pratiquants de tous âges. Le JKD s'adapte à chacun."
    },
    femmes: {
      question: "Le JKD est-il adapté aux femmes ?",
      reponse: "Bien sûr ! On a des pratiquantes de tous niveaux. Le JKD mise sur la technique et l'efficacité, pas sur la force brute."
    },
    blessure: {
      question: "J'ai une blessure/problème physique",
      reponse: "Préviens Cédric en début de cours, on adaptera les exercices. On veut que tu progresses sans te blesser."
    },
    violence: {
      question: "Est-ce violent ?",
      reponse: "On travaille de manière contrôlée et respectueuse. L'objectif c'est d'apprendre, pas de se faire mal. Les contacts sont progressifs."
    },
    cours_annule: {
      question: "Et si un cours est annulé ?",
      reponse: "C'est très rare, mais si ça arrive on prévient par email et SMS. On rattrape toujours."
    },
    remboursement: {
      question: "Peut-on être remboursé ?",
      reponse: "Le cours d'essai n'est pas remboursable. Pour les abonnements, on voit au cas par cas selon les situations."
    },
    absence: {
      question: "Et si je rate un cours ?",
      reponse: "Pas de souci, tu reviens la semaine suivante ! L'abonnement te donne accès à tous les cours de l'année."
    },
    niveau_cours: {
      question: "Y a-t-il différents niveaux de cours ?",
      reponse: "On travaille tous ensemble, mais Cédric adapte les exercices à chaque niveau. Les avancés aident souvent les débutants, c'est notre philosophie."
    },
    competition: {
      question: "Y a-t-il des compétitions ?",
      reponse: "Le JKD n'est pas orienté compétition, c'est avant tout de la self-défense. Mais on organise des stages et des événements entre écoles."
    },
    difference_autres_arts: {
      question: "Quelle différence avec les autres arts martiaux ?",
      reponse: "Le JKD, créé par Bruce Lee, combine le meilleur de plusieurs arts martiaux. C'est pragmatique, direct, et on s'adapte à chaque situation."
    },
    bruce_lee: {
      question: "C'est vraiment la méthode de Bruce Lee ?",
      reponse: "Oui ! Notre fondateur, Sifu Lee Hong Long, a été formé par des élèves directs de Bruce Lee. On transmet la lignée authentique."
    },
    equipement_acheter: {
      question: "Faut-il acheter du matériel ?",
      reponse: "Pour commencer, juste une tenue de sport et des baskets. Le matériel de protection est prêté. Tu pourras investir plus tard si tu continues."
    }
  },

  // === CONTENU PÉDAGOGIQUE ===
  pedagogie: {
    description: "Le cours de 2h se compose généralement de :",
    structure_cours: [
      "Échauffement et mobilité (15-20 min)",
      "Technique : frappes, déplacements, blocages (40 min)",
      "Travail à deux : applications et sparring léger (40 min)",
      "Renforcement et étirements (15-20 min)"
    ],
    ce_quon_apprend: [
      "Frappes : poings, pieds, coudes, genoux",
      "Déplacements et esquives",
      "Techniques de self-défense",
      "Gestion de la distance et du timing",
      "Travail au sol (bases)"
    ],
    philosophie_enseignement: "On apprend en faisant. Pas de théorie interminable, on pratique dès le premier cours."
  }
};

/**
 * Récupère des informations sur un sujet donné
 * @param {string} topic - Le sujet recherché
 * @returns {object} - Les informations trouvées
 */
function getInfo(topic) {
  const topicLower = topic.toLowerCase();

  // Mapping des topics vers les sections
  const topicMapping = {
    // Localisation
    'adresse': KNOWLEDGE_BASE.localisation,
    'lieu': KNOWLEDGE_BASE.localisation,
    'ou': KNOWLEDGE_BASE.localisation,
    'localisation': KNOWLEDGE_BASE.localisation,
    'acces': KNOWLEDGE_BASE.localisation,
    'venir': KNOWLEDGE_BASE.localisation,
    'trouver': KNOWLEDGE_BASE.localisation,

    // Transport
    'metro': { metro: KNOWLEDGE_BASE.localisation.metro, adresse: KNOWLEDGE_BASE.localisation.adresse },
    'bus': { bus: KNOWLEDGE_BASE.localisation.bus, adresse: KNOWLEDGE_BASE.localisation.adresse },
    'parking': { parking: KNOWLEDGE_BASE.localisation.parking, acces_voiture: KNOWLEDGE_BASE.localisation.acces_voiture },
    'voiture': { parking: KNOWLEDGE_BASE.localisation.parking, acces_voiture: KNOWLEDGE_BASE.localisation.acces_voiture },
    'transport': { metro: KNOWLEDGE_BASE.localisation.metro, bus: KNOWLEDGE_BASE.localisation.bus },

    // Horaires
    'horaires': KNOWLEDGE_BASE.horaires,
    'heure': KNOWLEDGE_BASE.horaires,
    'quand': KNOWLEDGE_BASE.horaires,
    'jour': KNOWLEDGE_BASE.horaires,
    'samedi': KNOWLEDGE_BASE.horaires,

    // Tarifs
    'tarifs': KNOWLEDGE_BASE.tarifs,
    'prix': KNOWLEDGE_BASE.tarifs,
    'cout': KNOWLEDGE_BASE.tarifs,
    'payer': KNOWLEDGE_BASE.tarifs,
    'abonnement': { annuel: KNOWLEDGE_BASE.tarifs.abonnement_annuel, trimestriel: KNOWLEDGE_BASE.tarifs.abonnement_trimestriel },
    'essai': KNOWLEDGE_BASE.tarifs.cours_essai,

    // Équipement
    'equipement': KNOWLEDGE_BASE.equipement,
    'tenue': KNOWLEDGE_BASE.equipement.tenue,
    'vetement': KNOWLEDGE_BASE.equipement.tenue,
    'chaussure': KNOWLEDGE_BASE.equipement.chaussures,
    'basket': KNOWLEDGE_BASE.equipement.chaussures,
    'protection': KNOWLEDGE_BASE.equipement.protections,
    'materiel': KNOWLEDGE_BASE.equipement,

    // Vestiaires
    'vestiaire': KNOWLEDGE_BASE.vestiaires,
    'douche': KNOWLEDGE_BASE.vestiaires,
    'casier': KNOWLEDGE_BASE.vestiaires,
    'changer': KNOWLEDGE_BASE.vestiaires,

    // Contact
    'contact': KNOWLEDGE_BASE.contact,
    'telephone': KNOWLEDGE_BASE.contact,
    'email': KNOWLEDGE_BASE.contact,
    'appeler': KNOWLEDGE_BASE.contact,
    'instructeur': KNOWLEDGE_BASE.contact.instructeur,
    'cedric': KNOWLEDGE_BASE.contact,

    // Général
    'general': KNOWLEDGE_BASE.general,
    'cercle': KNOWLEDGE_BASE.general,
    'jkd': KNOWLEDGE_BASE.general,
    'jeet kune do': KNOWLEDGE_BASE.general,
    'bruce lee': { ...KNOWLEDGE_BASE.general, faq: KNOWLEDGE_BASE.faq.bruce_lee },

    // Pédagogie
    'cours': KNOWLEDGE_BASE.pedagogie,
    'apprendre': KNOWLEDGE_BASE.pedagogie,
    'entrainement': KNOWLEDGE_BASE.pedagogie,
    'programme': KNOWLEDGE_BASE.pedagogie,

    // Inscription
    'inscription': {
      essai: KNOWLEDGE_BASE.tarifs.cours_essai,
      contact: KNOWLEDGE_BASE.contact,
      horaires: KNOWLEDGE_BASE.horaires
    },
    'inscrire': {
      essai: KNOWLEDGE_BASE.tarifs.cours_essai,
      contact: KNOWLEDGE_BASE.contact,
      horaires: KNOWLEDGE_BASE.horaires
    }
  };

  // Recherche directe
  if (topicMapping[topicLower]) {
    return topicMapping[topicLower];
  }

  // Recherche dans les FAQ
  for (const [key, faqItem] of Object.entries(KNOWLEDGE_BASE.faq)) {
    if (topicLower.includes(key) || faqItem.question.toLowerCase().includes(topicLower)) {
      return faqItem;
    }
  }

  // Recherche par mots-clés dans toutes les sections
  for (const [key, section] of Object.entries(KNOWLEDGE_BASE)) {
    if (key.includes(topicLower) || topicLower.includes(key)) {
      return section;
    }
  }

  // Rien trouvé
  return null;
}

/**
 * Formate les informations pour une réponse naturelle
 * @param {string} topic - Le sujet
 * @returns {string} - Texte formaté pour l'agent
 */
function getFormattedInfo(topic) {
  const info = getInfo(topic);

  if (!info) {
    return `Je n'ai pas trouvé d'information spécifique sur "${topic}". Voici le contact pour plus de détails : ${KNOWLEDGE_BASE.contact.telephone}`;
  }

  return JSON.stringify(info, null, 2);
}

module.exports = {
  KNOWLEDGE_BASE,
  getInfo,
  getFormattedInfo
};
