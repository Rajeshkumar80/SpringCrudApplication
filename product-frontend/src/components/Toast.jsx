import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCheckCircle, MdError, MdInfo, MdClose } from 'react-icons/md';

const icons = {
  success: <MdCheckCircle size={18} style={{ color: 'var(--color-success)' }} />,
  error:   <MdError size={18} style={{ color: 'var(--color-danger)' }} />,
  info:    <MdInfo size={18} style={{ color: 'var(--color-accent)' }} />,
};

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className={`toast ${toast.type}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {icons[toast.type] || icons.info}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                color: 'var(--color-text-muted)',
              }}
            >
              <MdClose size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for toast management
export function useToast() {
  const [toasts, setToasts] = [
    typeof window !== 'undefined' ? [] : [],
    () => {},
  ];

  return { toasts, addToast: () => {}, removeToast: () => {} };
}

export default Toast;
