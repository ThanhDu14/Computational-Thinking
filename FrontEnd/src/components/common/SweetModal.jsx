import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Info, X } from 'lucide-react';

const SweetModal = ({ 
  isOpen, 
  onClose, 
  type = 'info', // success, error, warning, info
  title, 
  message, 
  confirmText = 'Đồng ý', 
  cancelText = 'Hủy', 
  onConfirm, 
  showCancel = false 
}) => {
  
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-16 h-16 text-emerald-500" />;
      case 'error':
        return <XCircle className="w-16 h-16 text-rose-500" />;
      case 'warning':
        return <AlertCircle className="w-16 h-16 text-amber-500" />;
      default:
        return <Info className="w-16 h-16 text-blue-500" />;
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';
      case 'error':
        return 'bg-rose-500 hover:bg-rose-600 shadow-rose-200';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
      default:
        return 'bg-blue-500 hover:bg-blue-600 shadow-blue-200';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl border border-white/20 dark:border-white/10"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              {/* Icon Animation */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                {getIcon()}
              </motion.div>

              <h3 className="text-2xl font-display font-black text-slate-900 dark:text-white mb-3">
                {title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 font-body leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3 w-full">
                {showCancel && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-4 rounded-2xl text-white font-bold transition-all shadow-lg active:scale-95 ${getButtonClass()}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SweetModal;
