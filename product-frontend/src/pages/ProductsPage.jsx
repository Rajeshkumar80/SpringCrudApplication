import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdEdit, MdDelete, MdStar, MdPhoneAndroid } from 'react-icons/md';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import ProductService from '../services/ProductService';
import ProductModal from '../components/ProductModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const SORT_OPTIONS = [
  { value: 'id-asc',     label: 'ID ↑' },
  { value: 'id-desc',    label: 'ID ↓' },
  { value: 'name-asc',   label: 'Name A→Z' },
  { value: 'name-desc',  label: 'Name Z→A' },
  { value: 'price-asc',  label: 'Price ↑' },
  { value: 'price-desc', label: 'Price ↓' },
  { value: 'rating-asc', label: 'Rating ↑' },
  { value: 'rating-desc',label: 'Rating ↓' },
  { value: 'brand-asc',  label: 'Brand A→Z' },
];

function stockBadge(stock) {
  if (stock === 0) return <span className="badge badge-stock-out">Out of Stock</span>;
  if (stock <= 5)  return <span className="badge badge-stock-low">Low {stock}</span>;
  return <span className="badge badge-stock-ok">{stock} units</span>;
}

function ProductsPage({ openAdd, setOpenAdd, showToast }) {
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [debouncedKw, setDebouncedKw] = useState('');
  const [sort, setSort] = useState('id-asc');
  const [page, setPage] = useState(0);

  const [editProduct, setEditProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Open add modal from navbar
  useEffect(() => {
    if (openAdd) {
      setEditProduct(null);
      setModalOpen(true);
      setOpenAdd(false);
    }
  }, [openAdd, setOpenAdd]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedKw(keyword); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [keyword]);

  const [sortBy, sortDir] = sort.split('-');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = debouncedKw
        ? await ProductService.searchProducts(debouncedKw, page, 5, sortBy, sortDir)
        : await ProductService.getProductsPaged(page, 5, sortBy, sortDir);
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedKw, page, sortBy, sortDir]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    try {
      if (editProduct) {
        await ProductService.updateProduct(editProduct.id, form);
        showToast('Product updated successfully!', 'success');
      } else {
        await ProductService.createProduct(form);
        showToast('Product added successfully!', 'success');
      }
      setModalOpen(false);
      setEditProduct(null);
      load();
    } catch (e) {
      showToast('Failed to save product.', 'error');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await ProductService.deleteProduct(deleteTarget.id);
      showToast(`"${deleteTarget.name}" deleted.`, 'success');
      setDeleteTarget(null);
      load();
    } catch (e) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const products = data.content || [];
  const totalPages = data.totalPages || 0;
  const totalElements = data.totalElements || 0;
  const currentPage = data.number || 0;

  const pageNums = Array.from({ length: totalPages }, (_, i) => i)
    .filter((p) => p >= currentPage - 2 && p <= currentPage + 2);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <p>Browse, search, and manage all {totalElements} products</p>
      </div>

      <div className="table-wrapper">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <span className="table-title">Catalog</span>
            <span className="table-count-badge">{totalElements} items</span>
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, brand, processor…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>
          <div className="table-toolbar-right">
            <select
              className="sort-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(0); }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="loading-state"><div className="spinner" /><span>Loading…</span></div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <span>No products found</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Processor / RAM</th>
                  <th>Storage</th>
                  <th>Battery</th>
                  <th>Camera</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <td style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{p.id}</td>
                      <td>
                        <div className="product-name-cell">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="product-img"
                              onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="product-img-placeholder"><MdPhoneAndroid /></div>
                          )}
                          <div>
                            <div className="product-name">{p.name}</div>
                            <div className="product-brand">{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 'var(--font-size-xs)' }}>{p.processor}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{p.ram}</div>
                      </td>
                      <td style={{ fontSize: 'var(--font-size-xs)' }}>{p.storage}</td>
                      <td style={{ fontSize: 'var(--font-size-xs)' }}>{p.battery}</td>
                      <td style={{ fontSize: 'var(--font-size-xs)', maxWidth: 140 }} className="truncate">{p.camera}</td>
                      <td>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                          ₹{Number(p.price).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <div className="rating-display">
                          <MdStar size={14} />
                          {p.rating}
                        </div>
                      </td>
                      <td>{stockBadge(p.stock)}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon edit" title="Edit"
                            onClick={() => { setEditProduct(p); setModalOpen(true); }}>
                            <MdEdit />
                          </button>
                          <button className="btn-icon delete" title="Delete"
                            onClick={() => setDeleteTarget(p)}>
                            <MdDelete />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {currentPage * 5 + 1}–{Math.min((currentPage + 1) * 5, totalElements)} of {totalElements}
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(0)} disabled={currentPage === 0}>«</button>
              <button className="page-btn" onClick={() => setPage((p) => p - 1)} disabled={currentPage === 0}>
                <FiChevronLeft />
              </button>
              {pageNums.map((n) => (
                <button key={n} className={`page-btn ${n === currentPage ? 'active' : ''}`}
                  onClick={() => setPage(n)}>
                  {n + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage((p) => p + 1)} disabled={currentPage >= totalPages - 1}>
                <FiChevronRight />
              </button>
              <button className="page-btn" onClick={() => setPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditProduct(null); }}
        onSave={handleSave}
        editProduct={editProduct}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        product={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}

export default ProductsPage;
