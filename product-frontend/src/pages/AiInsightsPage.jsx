import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdLightbulb, MdTrendingUp, MdWarning, MdCheckCircle, MdRefresh } from 'react-icons/md';
import { RiBrainFill } from 'react-icons/ri';
import AiService from '../services/AiService';

function InsightCard({ text, index }) {
  const icons = ['📊', '🏷️', '⭐', '💰', '📈'];
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      style={{ display: 'flex', gap: 12, padding: '12px 14px',
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 10, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icons[index % icons.length]}</span>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{text}</p>
    </motion.div>
  );
}

function RecommCard({ text, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ display: 'flex', gap: 12, padding: '12px 14px',
        background: 'var(--color-success-light)', border: '1px solid var(--color-success)',
        borderRadius: 10, alignItems: 'flex-start' }}>
      <MdCheckCircle style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 1 }} size={16} />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{text}</p>
    </motion.div>
  );
}

function RiskCard({ text, index }) {
  return (
    <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{ display: 'flex', gap: 12, padding: '12px 14px',
        background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)',
        borderRadius: 10, alignItems: 'flex-start' }}>
      <MdWarning style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} size={16} />
      <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{text}</p>
    </motion.div>
  );
}

function HealthBadge({ health }) {
  const map = {
    'Excellent': { bg: '#ecfdf5', color: '#10b981', label: 'Excellent' },
    'Good':      { bg: '#eff6ff', color: '#2563eb', label: 'Good' },
    'Fair':      { bg: '#fffbeb', color: '#f59e0b', label: 'Fair' },
    'Poor':      { bg: '#fef2f2', color: '#ef4444', label: 'Poor' },
  };
  const key = Object.keys(map).find(k => health?.includes(k)) || 'Good';
  const style = map[key];
  return (
    <span style={{ background: style.bg, color: style.color, fontWeight: 700,
      fontSize: 13, padding: '4px 14px', borderRadius: 99,
      border: `1px solid ${style.color}` }}>
      {health || style.label}
    </span>
  );
}

export default function AiInsightsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysed, setAnalysed] = useState(false);

  const analyse = async () => {
    setLoading(true);
    try {
      const res = await AiService.getInsights();
      setData(res.data);
      setAnalysed(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => { analyse(); }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RiBrainFill style={{ color: 'var(--color-accent)' }} />
              AI Business Analyst
            </h1>
            <p>AI-generated insights from your product inventory — like having a senior business consultant on demand</p>
          </div>
          <button className="btn btn-primary" onClick={analyse} disabled={loading}>
            {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Analysing…</>
              : <><MdRefresh size={15} /> Re-analyse</>}
          </button>
        </div>
      </div>

      {loading && !analysed && (
        <div className="loading-state">
          <div className="spinner" />
          <span>AI is analysing your inventory…</span>
        </div>
      )}

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Executive Summary */}
          <div className="chart-card" style={{ borderLeft: '3px solid var(--color-accent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <MdLightbulb style={{ color: 'var(--color-warning)' }} size={20} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Executive Summary</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Confidence: {Math.round((data.confidenceScore || 0.85) * 100)}%
                </span>
                <HealthBadge health={data.overallHealth} />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-primary)',
              lineHeight: 1.8, fontStyle: 'italic' }}>
              "{data.summary}"
            </p>
          </div>

          {/* Three columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>

            {/* Insights */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <MdTrendingUp style={{ color: 'var(--color-accent)' }} size={18} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Key Insights</span>
                <span style={{ background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                  {data.insights?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.insights?.map((ins, i) => <InsightCard key={i} text={ins} index={i} />)}
              </div>
            </div>

            {/* Recommendations */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <MdCheckCircle style={{ color: 'var(--color-success)' }} size={18} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Recommendations</span>
                <span style={{ background: 'var(--color-success-light)', color: 'var(--color-success)',
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                  {data.recommendations?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recommendations?.map((r, i) => <RecommCard key={i} text={r} index={i} />)}
              </div>
            </div>

            {/* Risks */}
            <div className="chart-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <MdWarning style={{ color: 'var(--color-warning)' }} size={18} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Risk Alerts</span>
                <span style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)',
                  borderRadius: 99, padding: '1px 8px', fontSize: 11, fontWeight: 600 }}>
                  {data.risks?.length || 0}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.risks?.map((r, i) => <RiskCard key={i} text={r} index={i} />)}
                {(!data.risks || data.risks.length === 0) && (
                  <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
                    ✅ No critical risks detected
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
