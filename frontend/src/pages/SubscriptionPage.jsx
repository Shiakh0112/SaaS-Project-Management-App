import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FiCheck, FiZap, FiStar, FiBriefcase, FiCreditCard,
  FiCalendar, FiPackage, FiClock, FiAlertCircle, FiList, FiX, FiShield,
} from 'react-icons/fi';
import {
  getSubscriptionStatus, createOrder, verifyPayment,
  cancelSubscription, getPaymentHistory,
} from '../services/uploadService';
import { fetchMe } from '../app/slices/authSlice';
import PaymentMethodModal from '../components/payment/PaymentMethodModal';
import Spinner from '../components/common/Spinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: FiZap,
    iconColor: 'text-gray-500',
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    badge: null,
    features: [
      '3 Projects',
      '1 Team',
      '5 Members',
      '2 Boards per project',
      'Basic notifications',
      'Community support',
    ],
    notIncluded: ['File uploads', 'Analytics', 'Priority support'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    icon: FiStar,
    iconColor: 'text-primary-600',
    iconBg: 'bg-primary-100 dark:bg-primary-900/30',
    badge: 'Most Popular',
    badgeColor: 'bg-primary-600',
    ring: 'ring-2 ring-primary-500',
    features: [
      'Unlimited Projects',
      '5 Teams',
      '25 Members',
      'Unlimited Boards',
      'File uploads (Cloudinary)',
      'Advanced analytics',
      'Priority support',
      'Custom labels & colors',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999,
    icon: FiBriefcase,
    iconColor: 'text-yellow-600',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    badge: 'Best Value',
    badgeColor: 'bg-yellow-500',
    features: [
      'Everything in Pro',
      'Unlimited Teams & Members',
      'Custom roles & permissions',
      'SSO / SAML',
      'Dedicated account manager',
      'SLA guarantee (99.9%)',
      'Custom integrations',
      'Audit logs',
      'White-label option',
    ],
    notIncluded: [],
  },
];

const SubscriptionPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(null);
  const [paymentModal, setPaymentModal] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadStatus = async () => {
    try {
      const data = await getSubscriptionStatus();
      setStatus(data);
    } catch {}
    finally { setLoadingStatus(false); }
  };

  useEffect(() => { loadStatus(); }, []);

  const currentPlan = status?.currentPlan?.plan || user?.subscription?.plan || 'free';
  const expiresAt = status?.currentPlan?.expiresAt || user?.subscription?.expiresAt;

  // Step 1 — Create Stripe Payment Intent, then open payment modal
  const handleUpgrade = async (plan) => {
    if (plan.id === 'free' || plan.id === currentPlan) return;
    setCreatingOrder(plan.id);
    try {
      const order = await createOrder(plan.id);
      setPaymentModal({
        plan,
        amount: order.amount,
        currency: order.currency,
        clientSecret: order.clientSecret,
        paymentIntentId: order.paymentIntentId,
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create payment intent');
    } finally {
      setCreatingOrder(null);
    }
  };

  // Step 2 — Called by PaymentMethodModal after Stripe success
  const handlePaymentSuccess = async ({ paymentIntentId }) => {
    await verifyPayment({ paymentIntentId, plan: paymentModal.plan.id });
    toast.success(`Upgraded to ${paymentModal.plan.name} plan!`);
    await Promise.all([loadStatus(), dispatch(fetchMe())]);
    setPaymentModal(null);
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await cancelSubscription('User requested cancellation');
      toast.success('Subscription cancelled. Access continues until billing period ends.');
      await Promise.all([loadStatus(), dispatch(fetchMe())]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
      setShowCancel(false);
    }
  };

  const handleShowHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const data = await getPaymentHistory();
      setHistory(data.history || []);
    } catch {
      toast.error('Failed to load payment history');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-6"
      >
        <span>←</span> Back
      </button>

      {/* Page header */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <FiCreditCard className="text-white" size={22} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Choose Your Plan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          Upgrade anytime. Cancel anytime. All plans include a 7-day free trial.
        </p>
      </div>

      {/* Current plan status card */}
      {!loadingStatus && (
        <div className="card p-5 mb-8 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-primary-600 rounded-2xl flex items-center justify-center">
                <FiPackage className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Active Plan</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100 capitalize">{currentPlan}</p>
                {status?.subscription?.status === 'cancelled' && (
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1 mt-0.5">
                    <FiAlertCircle size={11} /> Cancelled — access until billing period ends
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {expiresAt && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                  <FiCalendar size={14} className="text-primary-600" />
                  {status?.subscription?.status === 'cancelled' ? 'Access until' : 'Renews'}{' '}
                  {new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              {currentPlan !== 'free' && status?.subscription?.status === 'active' && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 transition-colors"
                >
                  <FiAlertCircle size={12} /> Cancel Plan
                </button>
              )}
              <button
                onClick={handleShowHistory}
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
              >
                <FiList size={12} /> Payment History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = plan.id === currentPlan;
          const isOrdering = creatingOrder === plan.id;

          return (
            <div
              key={plan.id}
              className={`card p-6 flex flex-col relative transition-all duration-200 hover:shadow-lg ${plan.ring || ''}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`${plan.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Icon + name */}
              <div className={`w-12 h-12 ${plan.iconBg} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={22} className={plan.iconColor} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>

              {/* Price */}
              <div className="mt-2 mb-6">
                {plan.price === 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">Free</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">forever</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">₹</span>
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-gray-100">{plan.price.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                    <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={10} className="text-green-600" />
                    </div>
                    {f}
                  </li>
                ))}
                {plan.notIncluded.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400 dark:text-gray-600 line-through">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheck size={10} className="text-gray-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              {isCurrent ? (
                <div className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl text-sm text-center flex items-center justify-center gap-2">
                  <FiCheck size={15} /> Current Plan
                </div>
              ) : plan.price === 0 ? (
                <div className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-400 font-semibold rounded-xl text-sm text-center border border-gray-200 dark:border-gray-700">
                  Free Forever
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isOrdering}
                  className={`w-full py-3 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.id === 'pro'
                      ? 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg shadow-yellow-500/25'
                  }`}
                >
                  {isOrdering ? (
                    <><Spinner size="sm" /> Preparing...</>
                  ) : (
                    <><FiCreditCard size={15} /> Upgrade to {plan.name}</>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Trust badges */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
        {[
          { icon: FiShield, text: '256-bit SSL Encryption' },
          { icon: FiCheck,  text: 'PCI-DSS Compliant' },
          { icon: FiX,      text: 'Cancel Anytime' },
          { icon: FiCreditCard, text: 'All Major Cards' },
          { icon: FiZap,    text: 'Powered by Stripe' },
        ].map(({ icon: Icon, text }) => (
          <span key={text} className="flex items-center gap-1.5">
            <Icon size={13} className="text-gray-400" /> {text}
          </span>
        ))}
      </div>

      {/* Payment Method Modal */}
      {paymentModal && (
        <PaymentMethodModal
          isOpen={!!paymentModal}
          onClose={() => setPaymentModal(null)}
          plan={paymentModal.plan}
          amount={paymentModal.amount}
          currency={paymentModal.currency}
          clientSecret={paymentModal.clientSecret}
          paymentIntentId={paymentModal.paymentIntentId}
          user={user}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Cancel Subscription Dialog */}
      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancelSubscription}
        loading={cancelling}
        title="Cancel Subscription"
        message="Your subscription will be cancelled but you'll keep access until the end of your current billing period. Are you sure?"
      />

      {/* Payment History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FiList size={18} /> Payment History
              </h2>
              <button onClick={() => setShowHistory(false)} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white">
                <FiX size={14} />
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {loadingHistory ? (
                <div className="flex justify-center py-8"><Spinner size="lg" /></div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <FiClock size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No payment history yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{h.plan} Plan</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {new Date(h.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' • '}
                          <span className="capitalize">{h.paymentMethod}</span>
                        </p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                          {h.stripePaymentIntentId?.slice(0, 24)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          ₹{h.amount?.toLocaleString('en-IN')}
                        </p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          h.status === 'succeeded'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
