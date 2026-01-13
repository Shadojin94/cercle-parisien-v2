require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log('🔍 Vérification de la configuration des webhooks Stripe\n');

async function checkWebhookConfig() {
  try {
    // Lister tous les webhooks
    const webhooks = await stripe.webhookEndpoints.list();
    
    if (webhooks.data.length === 0) {
      console.log('❌ Aucun webhook configuré dans Stripe');
      console.log('\n💡 Solution:');
      console.log('1. Allez dans le Dashboard Stripe > Développeurs > Webhooks');
      console.log('2. Cliquez sur "Ajouter un endpoint"');
      console.log('3. URL du endpoint: https://cercle-parisien.com/webhook');
      console.log('4. Sélectionnez les événements: checkout.session.completed');
      console.log('5. Copiez le secret webhook et ajoutez-le à STRIPE_WEBHOOK_SECRET dans .env');
      return;
    }
    
    console.log(`✅ ${webhooks.data.length} webhook(s) configuré(s):`);
    
    webhooks.data.forEach(webhook => {
      console.log(`\n📡 Webhook: ${webhook.url}`);
      console.log(`   Statut: ${webhook.status}`);
      console.log(`   Événements: ${webhook.enabled_events.join(', ')}`);
      
      if (webhook.url.includes('cercle-parisien.com')) {
        console.log('   ✅ Webhook pour Cercle Parisien trouvé');
        
        // Vérifier si les événements nécessaires sont activés
        const requiredEvents = ['checkout.session.completed'];
        const hasRequiredEvents = requiredEvents.every(event => 
          webhook.enabled_events.includes(event)
        );
        
        if (hasRequiredEvents) {
          console.log('   ✅ Événements requis configurés');
        } else {
          console.log('   ❌ Événements requis manquants');
          console.log(`   📋 Événements requis: ${requiredEvents.join(', ')}`);
        }
      }
    });
    
    console.log('\n🔧 Actions recommandées:');
    console.log('1. Vérifiez que l\'URL du webhook est: https://cercle-parisien.com/webhook');
    console.log('2. Assurez-vous que l\'événement "checkout.session.completed" est activé');
    console.log('3. Vérifiez que le secret webhook correspond à STRIPE_WEBHOOK_SECRET dans .env');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des webhooks:', error.message);
  }
}

checkWebhookConfig().then(() => {
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});