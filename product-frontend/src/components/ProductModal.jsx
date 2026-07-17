import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose } from 'react-icons/md';

const empty = {
  name: '', brand: '', price: '', processor: '', ram: '',
  storage: '', battery: '', camera: '', display: '',
  rating: '', stock: '', imageUrl: '',
};

function ProductModal({ open, onClose, onSave, editProduct }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setForm({ ...editProduct, price: String(editProduct.price), rating: String(editProduct.rating), stock: String(editProduct.stock) });
    } else {
      setForm(empty);
    }
    setErrors({});
  }, [editProduct, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.brand.trim()) errs.brand = 'Brand is required';
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = 'Valid price required';
    if (!form.rating || isNaN(form.rating) || Number(form.rating) < 1 || Number(form.rating) > 5)
      errs.rating = 'Rating must be 1-5';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
        rating: parseFloat(form.rating),
        stock: parseInt(form.stock, 10),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="modal-header">
              <h2>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={onClose}><MdClose /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  {/* Name */}
                  <div className="form-group span-2">
                    <label className="form-label">Product Name *</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="e.g. iPhone 16 Pro" />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  {/* Brand */}
                  <div className="form-group">
                    <label className="form-label">Brand *</label>
                    <input className="form-input" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Apple" />
                    {errors.brand && <span className="form-error">{errors.brand}</span>}
                  </div>
                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g. 79999" min="1" />
                    {errors.price && <span className="form-error">{errors.price}</span>}
                  </div>
                  {/* Processor */}
                  <div className="form-group">
                    <label className="form-label">Processor</label>
                    <input className="form-input" name="processor" value={form.processor} onChange={handleChange} placeholder="e.g. Snapdragon 8 Elite" />
                  </div>
                  {/* RAM */}
                  <div className="form-group">
                    <label className="form-label">RAM</label>
                    <input className="form-input" name="ram" value={form.ram} onChange={handleChange} placeholder="e.g. 8GB" />
                  </div>
                  {/* Storage */}
                  <div className="form-group">
                    <label className="form-label">Storage</label>
                    <input className="form-input" name="storage" value={form.storage} onChange={handleChange} placeholder="e.g. 256GB" />
                  </div>
                  {/* Battery */}
                  <div className="form-group">
                    <label className="form-label">Battery</label>
                    <input className="form-input" name="battery" value={form.battery} onChange={handleChange} placeholder="e.g. 5000mAh" />
                  </div>
                  {/* Camera */}
                  <div className="form-group">
                    <label className="form-label">Camera</label>
                    <input className="form-input" name="camera" value={form.camera} onChange={handleChange} placeholder="e.g. 50MP + 12MP" />
                  </div>
                  {/* Display */}
                  <div className="form-group">
                    <label className="form-label">Display</label>
                    <input className="form-input" name="display" value={form.display} onChange={handleChange} placeholder='e.g. 6.1" OLED 120Hz' />
                  </div>
                  {/* Rating */}
                  <div className="form-group">
                    <label className="form-label">Rating (1-5) *</label>
                    <input className="form-input" name="rating" type="number" step="0.1" value={form.rating} onChange={handleChange} placeholder="e.g. 4.5" min="1" max="5" />
                    {errors.rating && <span className="form-error">{errors.rating}</span>}
                  </div>
                  {/* Stock */}
                  <div className="form-group">
                    <label className="form-label">Stock *</label>
                    <input className="form-input" name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="e.g. 20" min="0" />
                    {errors.stock && <span className="form-error">{errors.stock}</span>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ProductModal;
