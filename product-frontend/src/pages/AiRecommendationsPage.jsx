import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdStar, MdPhoneAndroid } from 'react-icons/md';
import { RiRobot2Fill, RiGamepadFill } from 'react-icons/ri';
import { MdCameraAlt, MdBatteryFull, MdMonitor, MdSpeed, MdAttachMoney } from 'react-icons/md';
import AiService from '../services/AiService';

const SCORE_BARS = [
  { key: 'gamingScore',      label: 'Gaming',      icon: <RiGamepadFill />,    color: '#8b5cf6' },
  { key: 'cameraScore',      label: 'Camera',      icon: <MdCameraAlt />,      color: '#ec4899' },
  { key: 'batteryScore',     label: 'Battery',     icon: <MdBatteryFull />,    color: '#10b981' },
  { key: 'displayScore',     label: 'Display',     icon: <MdMonitor />,        color: '#06b6d4' },
  { key: 'performanceScore', label: 'Performance', icon: <MdSpeed />,          color: '#f59e0b' },
  { key: 'valueScore',       label: 'Value',       icon: <MdAttachMoney />,    color: '#2563eb' },
];

function ScoreBar({ label, icon, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color, fontSize: 13, width: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', width: 72, flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{ height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, width: 28, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  );
}

function ScoreRing({ value }) {
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const color = value >= 85 ? '#10b981' : value >= 70 ? '#2563eb' : value >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ position: 'relative', width: 72, height: 72 }}>
      <svg width="72" height="72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="5" />
        <motion.circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8 }}
          strokeLinecap="round" transform="rotate(-90 36 36)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color }}>{value}</span>
        <span style={{ fontSize: 9, color: 'var(--color-text-muted)' }}>/ 100</span>
      </div>
    </div>
  );
}

function ProductScoreCard({ product, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--color-border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-text-muted)', fontSize: 20, flexShrink: 0 }}>
          <MdPhoneAndroid />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{product.brand}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-accent)', marginTop: 2 }}>
            ₹{Number(product.price).toLocaleString()}
          </div>
        </div>
        <ScoreRing value={product.overallAiScore} />
      </div>

      {/* Tag */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--color-accent-subtle)',
          color: 'var(--color-accent)', padding: '2px 8px', borderRadius: 99 }}>
          {product.primaryTag}
        </span>
      </div>

      {/* Score bars */}
      {SCORE_BARS.map(b => (
        <ScoreBar key={b.key} label={b.label} icon={b.icon}
          value={product[b.key]} color={b.color} />
      ))}

      {/* Summary */}
      {product.aiSummary && (
        <p style={{ margin: '10px 0 0', fontSize: 11, color: 'var(--color-text-muted)',
          fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px solid var(--color-border-light)',
          paddingTop: 8 }}>
          {product.aiSummary}
        </p>
      )}
    </motion.div>
  );
}

function TopCategorySection({ title, products, icon }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{title}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {products?.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)',
              borderRadius: 10, padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 12, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>₹{Number(p.price).toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: 2 }}>
                <MdStar size={11} />{p.rating}
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-accent)' }}>
              {p.overallAiScore}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function AiRecommendationsPage() {
  const [scores, setScores] = useState([]);
  const [topData, setTopData] = useState(null);
  const [tab, setTab] = useState('top');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([AiService.getAllScores(), AiService.getTopByCategory()])
      .then(([s, t]) => { setScores(s.data); setTopData(t.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page"><div className="loading-state"><div className="spinner" /><span>Computing AI scores…</span></div></div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <RiRobot2Fill style={{ color: 'var(--color-accent)' }} />
          AI Recommendation Engine
        </h1>
        <p>Every product scored across 6 dimensions — Gaming, Camera, Battery, Display, Performance, Value</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--color-border)', paddingBottom: 0 }}>
        {[['top', '🏆 Top Picks'], ['all', '📋 All Scores']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ padding: '8px 16px', background: 'none', border: 'none',
              borderBottom: tab === key ? '2px solid var(--color-accent)' : '2px solid transparent',
              color: tab === key ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              fontWeight: tab === key ? 700 : 500, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s', marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'top' && topData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <TopCategorySection title="Best Overall" icon="🏆" products={topData.topOverall} />
          <TopCategorySection title="Top Gaming Phones" icon="🎮" products={topData.topGaming} />
          <TopCategorySection title="Best Camera Phones" icon="📷" products={topData.topCamera} />
          <TopCategorySection title="Best Battery Life" icon="🔋" products={topData.topBattery} />
          <TopCategorySection title="Best Performance" icon="⚡" products={topData.topPerformance} />
          <TopCategorySection title="Best Value for Money" icon="💰" products={topData.topValue} />
        </div>
      )}

      {tab === 'all' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {scores.map((p, i) => <ProductScoreCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
