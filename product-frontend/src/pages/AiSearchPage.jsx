import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdStar, MdPhoneAndroid, MdClose } from 'react-icons/md';
import { RiSearchEyeLine } from 'react-icons/ri';
import AiService from '../services/AiService';

const EXAMPLES = [
  'Gaming phones under ₹40,000',
  'Samsung phones with AMOLED display',
  'Best camera phones below ₹50k',
  'Phones with 6000mAh battery',
  'Flagship phones above ₹1 lakh',
  'Budget phones under ₹25,000',
  'Snapdragon phones with 12GB RAM',
  'Highest rated phones',
  'OnePlus phones',
  'Phones with 200MP camera',
  'Student phones under ₹30,000',
  'Gaming phones with Dimensity processor',
];

function TagChip({ label, onRemove }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none',
          cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex',
          alignItems: 'center' }}>
          <MdClose size={12} />
        </button>
      )}
    </span>
  );
}

function ProductCard({ product, index }) {
  const stockColor = product.stock === 0
    ? 'var(--color-danger)'
    : product.stock <= 5 ? 'var(--color-warning)' : 'var(--color-success)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{
        background: 'var(--color-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10,
        boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: 'var(--color-border-light)', border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: 20, flexShrink: 0,
        }}>
          <MdPhoneAndroid />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{product.brand}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--color-accent)' }}>
            ₹{Number(product.price).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-warning)',
            display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
            <MdStar size={11} />{product.rating}
          </div>
        </div>
      </div>

      {/* Specs grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 8px',
        fontSize: 11, color: 'var(--color-text-secondary)',
      }}>
        {product.processor && <div>⚡ {product.processor}</div>}
        {product.ram && <div>💾 {product.ram} RAM</div>}
        {product.battery && <div>🔋 {product.battery}</div>}
        {product.camera && <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📷 {product.camera}</div>}
        {product.storage && <div>💽 {product.storage}</div>}
        {(product.display || product.display_info) && (
          <div style={{ gridColumn: 'span 2', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            🖥 {product.display || product.display_info}
          </div>
        )}
      </div>

      {/* Stock */}
      <div style={{ fontSize: 11, fontWeight: 600, color: stockColor }}>
        {product.stock === 0 ? '● Out of Stock'
          : product.stock <= 5 ? `● Low Stock — ${product.stock} left`
          : `● ${product.stock} in stock`}
      </div>
    </motion.div>
  );
}

export default function AiSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [interpretation, setInterpretation] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const inputRef = useRef(null);

  const search = async (q) => {
    const searchQuery = q || query.trim();
    if (!searchQuery) return;
    setLastQuery(searchQuery);
    setLoading(true);
    try {
      const res = await AiService.nlSearch(searchQuery);
      setResults(res.data.products || []);
      setInterpretation(res.data.interpretation || '');
    } catch (e) {
      setResults([]);
      setInterpretation('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') search();
  };

  const clear = () => {
    setQuery('');
    setResults(null);
    setInterpretation('');
    setLastQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiSearchEyeLine style={{ color: 'var(--color-accent)' }} />
          AI Natural Language Search
        </h1>
        <p>Forget filters — just describe what you need in plain English</p>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          display: 'flex', gap: 10, background: 'var(--color-card)',
          border: '2px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          padding: '12px 16px', transition: 'all 0.15s', boxShadow: 'var(--shadow-sm)',
        }}
          onFocus={() => {}}
          onClick={() => inputRef.current?.focus()}
        >
          <MdSearch size={22} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: 1 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder='Try: "Gaming phones under ₹40,000" or "Samsung AMOLED with 12GB RAM"'
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              background: 'transparent', color: 'var(--color-text-primary)',
            }}
          />
          {query && (
            <button onClick={clear} style={{ background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0,
              display: 'flex', alignItems: 'center' }}>
              <MdClose size={18} />
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => search()}
            disabled={loading || !query.trim()}
            style={{ padding: '6px 18px', flexShrink: 0 }}
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>

        {/* Interpretation badge */}
        <AnimatePresence>
          {interpretation && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>AI understood:</span>
              <TagChip label={interpretation} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example chips */}
      {!results && !loading && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Try these searches
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EXAMPLES.map((ex, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => { setQuery(ex); search(ex); }}
                style={{
                  background: 'var(--color-card)', border: '1px solid var(--color-border)',
                  borderRadius: 99, padding: '6px 14px', fontSize: 12,
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.color = 'var(--color-accent)';
                  e.currentTarget.style.background = 'var(--color-accent-light)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.background = 'var(--color-card)';
                }}
              >
                {ex}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <span>Searching…</span>
        </div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        <div>
          {/* Result header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>
                {results.length > 0
                  ? `${results.length} product${results.length !== 1 ? 's' : ''} found`
                  : 'No products found'}
              </span>
              {lastQuery && (
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  for "{lastQuery}"
                </span>
              )}
            </div>
            <button className="btn btn-secondary" onClick={clear}
              style={{ padding: '5px 12px', fontSize: 12 }}>
              Clear results
            </button>
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <span>No products match your search.</span>
              <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                Try different keywords or a broader budget range.
              </span>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {results.map((p, i) => (
                <ProductCard key={p.id || i} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
