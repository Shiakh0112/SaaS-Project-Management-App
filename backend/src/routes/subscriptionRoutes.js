const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');
const {
  validateCreateOrder,
  validateVerifyPayment,
} = require('../validators/subscriptionValidator');

router.use(protect);

router.post('/create-payment-intent', validateCreateOrder,   createOrder);
router.post('/verify-payment',        validateVerifyPayment, verifyPayment);
router.get('/status',                                        getSubscriptionStatus);
router.post('/cancel',                                       cancelSubscription);
router.get('/history',                                       getPaymentHistory);

module.exports = router;
