require('dotenv').config({ path: './cercle-parisien-prod/server/.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripe() {
  try {
    const customer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer'
    });
    console.log('Stripe test réussi - Customer créé:', customer.id);
  } catch (error) {
    console.error('Erreur Stripe test:', error.message);
  }
}

testStripe();
