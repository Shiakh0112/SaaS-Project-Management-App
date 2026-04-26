const Stripe = require('stripe');

let _stripe;

const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

module.exports = getStripe;
