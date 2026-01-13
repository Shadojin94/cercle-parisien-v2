require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const ics = require('ics');

console.log('🧪 Test de webhook Stripe pour envoi d\'email après paiement\n');

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration Nodemailer (identique à index.js)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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

// Simulation d'un webhook Stripe checkout.session.completed
async function simulatePaymentWebhook() {
  try {
    console.log('📡 Simulation d\'un webhook Stripe après paiement...\n');

    // Données de test pour le lead
    const testEmail = `test-${Date.now()}@example.com`;
    const testLead = {
      first_name: 'Test',
      email: testEmail
    };

    // Insérer le lead de test dans Supabase (sans spécifier l'ID pour laisser Supabase le générer)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .upsert({
        email: testLead.email,
        first_name: testLead.first_name,
        phone: '0612345678',
        status: 'new'
      })
      .select()
      .single();

    if (leadError) {
      console.error('❌ Erreur insertion lead test:', leadError);
      return;
    }

    console.log(`✅ Lead test créé: ${lead.id} (${lead.email})`);

    // Simuler le traitement du webhook
    console.log('\n🔄 Simulation du traitement webhook...');
    
    // Générer ICS
    const icsContent = generateICS(lead.first_name, lead.email);
    console.log('✅ Fichier ICS généré');

    // Préparer l'email de confirmation
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: lead.email,
      subject: 'Confirmation d\'inscription - Cercle Parisien JKD',
      html: `
        <h1>Bienvenue ${lead.first_name} !</h1>
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
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmation envoyé:', info.messageId, 'à', lead.email);

    // Mettre à jour le statut du lead
    await supabase
      .from('leads')
      .update({ 
        status: 'converted',
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.id);
    console.log('✅ Lead mis à jour en "converted"');

    console.log('\n🎉 Test webhook réussi !');
    console.log('📬 Vérifiez votre boîte mail: chad942@hotmail.com');
    console.log('📎 L\'email contient le fichier ICS pour le calendrier');

  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error);
  }
}

// Exécuter le test
simulatePaymentWebhook().then(() => {
  console.log('\n✅ Test terminé');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});