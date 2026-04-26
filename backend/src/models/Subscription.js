const mongoose = require('mongoose');

const paymentHistorySchema = new mongoose.Schema(
  {
    stripePaymentIntentId: { type: String, required: true },
    amount:        { type: Number, required: true },
    currency:      { type: String, default: 'usd' },
    plan:          { type: String, enum: ['pro', 'enterprise'], required: true },
    paymentMethod: { type: String, default: 'card' },
    status:        { type: String, enum: ['succeeded', 'failed', 'refunded'], default: 'succeeded' },
    paidAt:        { type: Date, default: Date.now },
  },
  { _id: true }
);

const subscriptionSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan:   { type: String, enum: ['free', 'pro', 'enterprise'], required: true, default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'failed'], default: 'inactive' },

    stripePaymentIntentId: { type: String },
    paymentMethod:         { type: String, default: 'card' },

    amount:    { type: Number },
    currency:  { type: String, default: 'usd' },
    startDate: { type: Date },
    endDate:   { type: Date },

    cancelledAt:      { type: Date },
    cancellationNote: { type: String },

    features: {
      maxProjects: { type: Number, default: 3 },
      maxMembers:  { type: Number, default: 5 },
      fileUpload:  { type: Boolean, default: false },
      analytics:   { type: Boolean, default: false },
    },

    paymentHistory: [paymentHistorySchema],
  },
  { timestamps: true }
);

subscriptionSchema.index({ status: 1, endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
