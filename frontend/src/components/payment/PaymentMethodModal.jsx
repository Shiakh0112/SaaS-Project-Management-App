import { useState } from 'react';
import { FiX, FiShield, FiLock, FiChevronRight, FiCreditCard } from 'react-icons/fi';
import Spinner from '../common/Spinner';

const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const formatExpiry = (val) => {
  const v = val.replace(/\D/g, '').slice(0, 4);
  return v.length >= 3 ? `${v.slice(0, 2)}/${v.slice(2)}` : v;
};

const PaymentMethodModal = ({ isOpen, onClose, plan, amount, paymentIntentId, onSuccess }) => {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isOpen) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');

    if (!cardName.trim()) return setError('Please enter cardholder name.');
    if (cardNumber.replace(/\s/g, '').length < 16) return setError('Please enter a valid 16-digit card number.');
    if (expiry.length < 5) return setError('Please enter a valid expiry (MM/YY).');
    if (cvv.length < 3) return setError('Please enter a valid CVV.');

    setPaying(true);
    try {
      // Payment already confirmed server-side — just verify
      await onSuccess({ paymentIntentId });
    } catch (err) {
      setError(err?.response?.data?.message || 'Payment failed. Please try again.');
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Complete Payment</h2>
              <p className="text-primary-200 text-sm mt-0.5">
                {plan?.name} Plan —{' '}
                <span className="font-semibold text-white">${(amount / 100).toFixed(2)}/month</span>
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
              <FiX size={16} />
            </button>
          </div>
          <div className="bg-white/15 rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-primary-100 text-sm">Total Amount</span>
            <span className="text-white text-xl font-bold">${(amount / 100).toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handlePay} className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FiCreditCard size={16} className="text-primary-600" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Card Details</p>
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label">Cardholder Name</label>
            <input type="text" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="John Doe" className="input" />
          </div>

          <div>
            <label className="label">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className="input font-mono"
              maxLength={19}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Expiry</label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                className="input font-mono"
                maxLength={5}
              />
            </div>
            <div>
              <label className="label">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="•••"
                className="input font-mono"
                maxLength={4}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <FiShield size={14} className="text-green-600 flex-shrink-0" />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex-1">
              <span className="font-semibold text-gray-700 dark:text-gray-300">100% Secure</span> — 256-bit SSL encrypted. Powered by Stripe.
            </p>
            <FiLock size={12} className="text-gray-400 flex-shrink-0" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {['VISA', 'Mastercard', 'Amex', 'Discover'].map((c) => (
              <span key={c} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-400">{c}</span>
            ))}
          </div>

          <button
            type="submit"
            disabled={paying}
            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 text-sm"
          >
            {paying ? <><Spinner size="sm" /> Processing...</> : <><FiLock size={15} /> Pay ${(amount / 100).toFixed(2)} Securely <FiChevronRight size={16} /></>}
          </button>

          <p className="text-center text-xs text-gray-400">By paying you agree to our Terms of Service. Cancel anytime.</p>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
