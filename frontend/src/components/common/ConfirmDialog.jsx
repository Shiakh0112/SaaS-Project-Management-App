import { FiAlertTriangle } from 'react-icons/fi';
import Spinner from './Spinner';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading = false, danger = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
          <FiAlertTriangle className={danger ? 'text-red-600 dark:text-red-400' : 'text-yellow-600'} size={22} />
        </div>
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 font-medium px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 ${danger ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading && <Spinner size="sm" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
