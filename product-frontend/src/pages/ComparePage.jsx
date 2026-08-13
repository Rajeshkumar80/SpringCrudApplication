import { useEffect, useState } from 'react';
import { MdCompareArrows, MdCheckCircle, MdTune } from 'react-icons/md';
import ProductService from '../services/ProductService';

const ROWS = [
  { key: 'price',    label: 'Price',     format: (p) => `₹${p.price.toLocaleString('en-IN')}` },
  { key: 'processor',label: 'Processor' },
  { key: 'ram',      label: 'RAM' },
  { key: 'storage',  label: 'Storage' },
  { key: 'battery',  label: 'Battery' },
  { key: 'camera',   label: 'Camera' },
  { key: 'display',  label: 'Display' },
  { key: 'rating',   label: 'Rating',    format: (p) => `${p.rating} / 5` },
  { key: 'stock',    label: 'Stock',     format: (p) => `${p.stock} units` },
];

const MAX_SELECT = 3;

function ComparePage() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ProductService.getAllProducts()
      .then((res) => setProducts(res.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setError('');
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECT) {
        setError(`You can compare up to ${MAX_SELECT} products.`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const compare = async () => {
    if (selected.length < 2) return;
    setComparing(true);
    setError('');
    try {
      const res = await ProductService.compareProducts(selected);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Comparison failed.');
    } finally {
      setComparing(false);
    }
  };

  const clear = () => { setSelected([]); setResult(null); };

  if (loading) return <div className="page-empty">Loading products…</div>;

  const bestBy = (key) => {
    if (!result) return null;
    let best = null;
    for (const item of result.items) {
      const v = item.product[key];
      if (best === null || (key === 'price' ? v < best : v > best)) best = v;
    }
    return best;
  };

  const isBestCell = (item, key) => {
    const b = bestBy(key);
    return b !== null && item.product[key] === b;
  };

  return (
    <div className="page">
      <div className="compare-toolbar">
        <div className="compare-hint">
          <MdTune size={16} />
          Select 2–3 products to compare side by side
        </div>
        {selected.length > 0 && (
          <button className="btn btn-secondary" onClick={clear} style={{ fontSize: 12.5, padding: '6px 12px' }}>
            Clear ({selected.length})
          </button>
        )}
      </div>

      {error && <div className="toast toast-error">{error}</div>}

      <div className="compare-select-grid">
        {products.map((p) => {
          const isSel = selected.includes(p.id);
          return (
            <button
              key={p.id}
              className={`compare-select-card ${isSel ? 'selected' : ''}`}
              onClick={() => toggle(p.id)}
            >
              <div className="compare-check">
                {isSel && <MdCheckCircle size={18} />}
              </div>
              {p.imageUrl
                ? <img className="compare-thumb" src={p.imageUrl} alt={p.name} />
                : <div className="compare-thumb compare-thumb-empty">{p.name[0]}</div>}
              <div>
                <div className="compare-card-name">{p.name}</div>
                <div className="compare-card-sub">{p.brand} · ₹{p.price.toLocaleString('en-IN')}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="compare-actions">
        <button
          className="btn btn-primary"
          onClick={compare}
          disabled={selected.length < 2 || comparing}
          style={{ gap: 6 }}
        >
          <MdCompareArrows size={16} />
          {comparing ? 'Comparing…' : `Compare ${selected.length || ''} products`}
        </button>
      </div>

      {result && result.items?.length > 0 && (
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="compare-label-col">Specification</th>
                {result.items.map((item) => (
                  <th key={item.product.id} className={item.bestOverall ? 'col-best' : ''}>
                    <div className="compare-head">
                      {item.product.imageUrl
                        ? <img className="compare-thumb" src={item.product.imageUrl} alt={item.product.name} />
                        : <div className="compare-thumb compare-thumb-empty">{item.product.name[0]}</div>}
                      <div className="compare-card-name">{item.product.name}</div>
                      <div className="compare-card-sub">{item.product.brand}</div>
                      {item.bestOverall && (
                        <span className="badge badge-best-overall">Best Overall</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td className="compare-label-col">{row.label}</td>
                  {result.items.map((item) => (
                    <td key={item.product.id} className={isBestCell(item, row.key) ? 'cell-best' : ''}>
                      {row.format ? row.format(item.product) : item.product[row.key] || '—'}
                      {isBestCell(item, row.key) && <span className="cell-best-tag">best</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="compare-footer">
            <span className="badge badge-best-overall">
              <MdCheckCircle size={12} /> Best Overall: {result.bestOverallName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ComparePage;