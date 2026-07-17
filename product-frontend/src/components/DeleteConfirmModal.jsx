import { motion, AnimatePresence } from 'framer-motion';
import { MdWarning, MdClose } from 'react-icons/md';

function DeleteConfirmModal({ open, product, onConfirm, onCancel, deleting }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
          <motion.div
            className="modal"
            style={{ maxWidth: 420 }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdWarning style={{ color: 'var(--color-danger)' }} />
                Delete Product
              </h2>
              <button className="modal-close" onClick={onCancel}><MdClose /></button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', lineHeight: 1.7 }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--color-text-primary)' }}>
                  {product?.name}
                </strong>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onCancel} disabled={deleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DeleteConfirmModal;
