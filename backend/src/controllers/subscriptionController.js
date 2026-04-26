const getStripe = require('../config/stripe');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { successResponse } = require('../utils/response');
const AppError = require('../utils/AppError');

// ─── Plan definitions ────────────────────────────────────────────────────────
const PLANS = {
  free: {
    amount: 0,
    currency: 'usd',
    durationDays: 36500,
    features: { maxProjects: 3, maxMembers: 5, fileUpload: false, analytics: false },
  },
  pro: {
    amount: 999, // $9.99 in cents
    currency: 'usd',
    durationDays: 30,
    features: { maxProjects: 20, maxMembers: 50, fileUpload: true, analytics: true },
  },
  enterprise: {
    amount: 2999, // $29.99 in cents
    currency: 'usd',
    durationDays: 30,
    features: { maxProjects: -1, maxMembers: -1, fileUpload: true, analytics: true },
  },
};

// ─── POST /api/subscription/create-payment-intent ────────────────────────────
const createOrder = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!plan || !PLANS[plan] || plan === 'free') {
      return next(new AppError('Invalid plan. Choose pro or enterprise.', 400));
    }

    const planDetails = PLANS[plan];

    // Create and confirm PaymentIntent server-side using Stripe test card
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: planDetails.amount,
      currency: planDetails.currency,
      payment_method: 'pm_card_visa',
      payment_method_types: ['card'],
      confirm: true,
      metadata: {
        userId: req.user._id.toString(),
        userEmail: req.user.email,
        plan,
      },
    });

    return successResponse(res, 200, 'Payment intent created.', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      plan,
      planName: plan.charAt(0).toUpperCase() + plan.slice(1),
    });
  } catch (error) {
    if (error.type && error.type.startsWith('Stripe')) {
      return next(new AppError(`Stripe error: ${error.message}`, 502));
    }
    next(error);
  }
};

// ─── POST /api/subscription/verify-payment ───────────────────────────────────
const verifyPayment = async (req, res, next) => {
  try {
    const { paymentIntentId, plan } = req.body;

    if (!paymentIntentId || !plan) {
      return next(new AppError('Missing paymentIntentId or plan.', 400));
    }
    if (!PLANS[plan] || plan === 'free') {
      return next(new AppError('Invalid plan.', 400));
    }

    // Retrieve from Stripe to confirm status
    let paymentIntent;
    try {
      paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch {
      return next(new AppError('Could not verify payment with Stripe.', 502));
    }

    if (paymentIntent.status !== 'succeeded') {
      return next(new AppError(`Payment not successful. Status: ${paymentIntent.status}`, 400));
    }

    if (paymentIntent.metadata.userId !== req.user._id.toString()) {
      return next(new AppError('Payment does not belong to this user.', 403));
    }

    const planDetails = PLANS[plan];
    const startDate = new Date();
    const endDate = new Date(Date.now() + planDetails.durationDays * 24 * 60 * 60 * 1000);

    const historyEntry = {
      stripePaymentIntentId: paymentIntent.id,
      amount: planDetails.amount / 100,
      currency: planDetails.currency,
      plan,
      paymentMethod: 'card',
      status: 'succeeded',
      paidAt: new Date(),
    };

    const subscription = await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          user: req.user._id, plan, status: 'active',
          stripePaymentIntentId: paymentIntent.id,
          paymentMethod: 'card',
          amount: planDetails.amount / 100,
          currency: planDetails.currency,
          startDate, endDate,
          cancelledAt: null, cancellationNote: null,
          features: planDetails.features,
        },
        $push: { paymentHistory: historyEntry },
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(req.user._id, {
      'subscription.plan': plan,
      'subscription.status': 'active',
      'subscription.expiresAt': endDate,
    });

    return successResponse(res, 200, 'Payment verified. Subscription activated.', {
      subscription, paymentMethod: 'card', activatedPlan: plan, expiresAt: endDate,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/subscription/status ────────────────────────────────────────────
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id).select('subscription');

    if (subscription && subscription.status === 'active' && subscription.endDate < new Date()) {
      subscription.status = 'inactive';
      await subscription.save();
      await User.findByIdAndUpdate(req.user._id, {
        'subscription.plan': 'free',
        'subscription.status': 'inactive',
      });
    }

    return successResponse(res, 200, 'Subscription status fetched.', {
      subscription: subscription || null,
      currentPlan: user.subscription,
      paymentHistory: subscription?.paymentHistory || [],
      plans: {
        free:       { name: 'Free',       price: 0,     features: PLANS.free.features },
        pro:        { name: 'Pro',        price: 9.99,  features: PLANS.pro.features },
        enterprise: { name: 'Enterprise', price: 29.99, features: PLANS.enterprise.features },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/subscription/cancel ───────────────────────────────────────────
const cancelSubscription = async (req, res, next) => {
  try {
    const { reason = '' } = req.body;

    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription || subscription.status !== 'active') {
      return next(new AppError('No active subscription to cancel.', 400));
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationNote = reason;
    await subscription.save();

    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled',
    });

    return successResponse(res, 200, 'Subscription cancelled. Access continues until billing period ends.', {
      cancelledAt: subscription.cancelledAt,
      accessUntil: subscription.endDate,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET /api/subscription/history ───────────────────────────────────────────
const getPaymentHistory = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    const history = subscription?.paymentHistory || [];
    const sorted = [...history].sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    return successResponse(res, 200, 'Payment history fetched.', {
      history: sorted,
      total: sorted.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory,
};
