const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const errors = error.details.map((d) => d.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  next();
};

// POST /api/subscription/create-payment-intent
const createOrderSchema = Joi.object({
  plan: Joi.string().valid('pro', 'enterprise').required().messages({
    'any.only': 'Plan must be pro or enterprise.',
    'any.required': 'Plan is required.',
  }),
});

// POST /api/subscription/verify-payment
const verifyPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required().messages({ 'any.required': 'paymentIntentId is required.' }),
  plan:            Joi.string().valid('pro', 'enterprise').required(),
});

module.exports = {
  validateCreateOrder:   validate(createOrderSchema),
  validateVerifyPayment: validate(verifyPaymentSchema),
};
