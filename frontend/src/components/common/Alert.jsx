import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const VARIANTS = {
  error: { icon: FiAlertCircle, cls: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' },
  success: { icon: FiCheckCircle, cls: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' },
  info: { icon: FiInfo, cls: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400' },
  warning: { icon: FiAlertTriangle, cls: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400' },
};

const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  const { icon: Icon, cls } = VARIANTS[type] || VARIANTS.info;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${cls}`}>
      <Icon size={16} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 opacity-70 hover:opacity-100">
          <FiX size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;
