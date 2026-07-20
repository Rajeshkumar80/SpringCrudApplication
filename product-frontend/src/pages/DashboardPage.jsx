import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdInventory2, MdAttachMoney, MdStarRate,
  MdTrendingUp, MdTrendingDown, MdPhoneAndroid,
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area, RadialBarChart, RadialBar,
} from 'recharts';
import DashboardService from '../services/DashboardService';

/* ── Brand colours (consistent palette) ── */
const PALETTE = [
  '#2563eb','#7c3aed','#10b981','#f59e0b','#ef4444',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#0ea5e9','#a16207','#be185d',
  '#047857','#9333ea','#dc2626','#0284c7','#65a30d',
];

const fmt = (n) =>
  n >= 10000000 ? `₹${(n/10000000).toFixed(1)}Cr`
  : n >= 100000  ? `₹${(n/100000).toFixed(1)}L`
  : n >= 1000    ? `₹${(n/1000).toFixed(0)}K`
  : `₹${n}`;

/* ── Tooltip shared style (uses real CSS vars) ── */
const TIP = {
  contentStyle: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 10,
    fontSize: 12,
    boxShadow: 'var(--shadow-md)',
    color: 'var(--text-primary)',
  },
  cursor: { fill: 'var(--border-light)' },
};

const AXIS_TICK = { fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter,sans-serif' };
const GRID     = { strokeDasharray: '3 3', stroke: 'var(--border-default)', strokeOpacity: 0.6 };

/* ── Stat Card ── */
function StatCard({ label, value, sub, icon, accent, delay }) {
  return (
    <motion.div className="stat-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}>
      <div>
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
      <div className={`stat-card-icon ${accent}`}>{icon}</div>
    </motion.div>
  );
}

/* ── Custom Donut label ── */
const DonutLabel = ({ cx, cy, total }) => (
  <>
    <text x={cx} y={cy - 8} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--text-primary)">{total}</text>
    <text x={cx} y={cy + 12} textAnchor="middle" fontSize={11} fill="var(--text-muted)">brands</text>
  </>
);

export default function DashboardPage() {
  const [summary,   setSummary]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([DashboardService.getSummary(), DashboardService.getAnalytics()])
      .then(([s, a]) => { setSummary(s.data); setAnalytics(a.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page"><div className="loading-state"><div className="spinner" /><span>Loading dashboard…</span></div></div>
  );

  const brandCount = analytics?.brandWiseCount || [];
  const brandPrice = analytics?.brandAvgPrice  || [];
  const brandRating= analytics?.brandAvgRating || [];
  const priceRange = analytics?.priceRangeDistribution || [];
  const totalBrands = brandCount.length;

  const stats = [
    { label: 'Total Products',   value: summary?.totalProducts ?? '—',                     sub: 'Unique SKUs in catalog',         icon: <MdPhoneAndroid />, accent: 'accent-blue',   delay: 0 },
    { label: 'Total Inventory',  value: summary?.totalInventory?.toLocaleString() ?? '—',   sub: 'Units across all products',      icon: <MdInventory2 />,   accent: 'accent-green',  delay: 0.04 },
    { label: 'Inventory Value',  value: summary ? fmt(summary.inventoryValue) : '—',        sub: 'Total stock value (₹)',          icon: <MdAttachMoney />,  accent: 'accent-orange', delay: 0.08 },
    { label: 'Average Price',    value: summary ? fmt(summary.averagePrice) : '—',          sub: 'Mean price across catalog',      icon: <MdTrendingUp />,   accent: 'accent-purple', delay: 0.12 },
    { label: 'Highest Price',    value: summary?.highestPriceProduct?.name ?? '—',          sub: summary?.highestPriceProduct ? fmt(summary.highestPriceProduct.price) : '', icon: <MdTrendingUp />,  accent: 'accent-red',    delay: 0.16 },
    { label: 'Lowest Price',     value: summary?.lowestPriceProduct?.name  ?? '—',          sub: summary?.lowestPriceProduct  ? fmt(summary.lowestPriceProduct.price)  : '', icon: <MdTrendingDown />, accent: 'accent-teal',   delay: 0.20 },
    { label: 'Highest Rated',    value: summary?.highestRatedProduct?.name ?? '—',          sub: summary?.highestRatedProduct ? `⭐ ${summary.highestRatedProduct.rating}/5` : '', icon: <MdStarRate />, accent: 'accent-orange', delay: 0.24 },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time analytics from your live product database — {summary?.totalProducts ?? 0} products across {totalBrands} brands</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Row 1: Brand bar + Donut ── */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>

        {/* Brand product count — horizontal bar */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Products by Brand</div>
            <div className="chart-card-subtitle">Total products per brand in database</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandCount} layout="vertical" margin={{ top: 4, right: 30, left: 50, bottom: 4 }}>
              <CartesianGrid {...GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={AXIS_TICK} />
              <YAxis type="category" dataKey="brand" tick={{ ...AXIS_TICK, fontSize: 11.5 }} width={55} />
              <Tooltip {...TIP} formatter={(v) => [v, 'Products']} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {brandCount.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Brand Donut */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Distribution</div>
            <div className="chart-card-subtitle">Share of catalog per brand</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <defs>
                {brandCount.map((_, i) => (
                  <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.65} />
                  </linearGradient>
                ))}
              </defs>
              <Pie data={brandCount} dataKey="count" nameKey="brand"
                cx="50%" cy="48%" innerRadius={62} outerRadius={100} paddingAngle={2}>
                {brandCount.map((_, i) => <Cell key={i} fill={`url(#bg${i})`} stroke="none" />)}
              </Pie>
              <DonutLabel cx={0} cy={0} total={totalBrands} />
              <Tooltip {...TIP} formatter={(v, n) => [v + ' products', n]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Row 2: Avg Price bar + Rating area ── */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>

        {/* Brand avg price */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Average Price by Brand</div>
            <div className="chart-card-subtitle">Mean selling price in ₹</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandPrice} margin={{ top: 4, right: 16, left: 0, bottom: 70 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis tickFormatter={fmt} tick={AXIS_TICK} width={52} />
              <Tooltip {...TIP} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']} />
              <Bar dataKey="avgPrice" radius={[5, 5, 0, 0]} maxBarSize={26}>
                {brandPrice.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Brand avg rating — smooth area */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Rating Comparison</div>
            <div className="chart-card-subtitle">Average customer rating per brand (out of 5)</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={brandRating} margin={{ top: 10, right: 16, left: 0, bottom: 70 }}>
              <defs>
                <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis domain={[3.5, 5]} tickCount={4} tick={AXIS_TICK} />
              <Tooltip {...TIP} formatter={(v) => [`${v}/5`, 'Avg Rating']} />
              <Area type="monotone" dataKey="avgRating" stroke="#7c3aed" fill="url(#ratingFill)"
                strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── Row 3: Price Range donut ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px,1fr))', gap: 20, marginBottom: 20 }}>
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Price Segment Distribution</div>
            <div className="chart-card-subtitle">How products spread across budget segments</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priceRange} dataKey="count" nameKey="range"
                cx="50%" cy="48%" innerRadius={60} outerRadius={100} paddingAngle={3}
                label={({ name, percent }) => `${(percent*100).toFixed(0)}%`}
                labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
                fontSize={11}>
                {priceRange.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
              </Pie>
              <Tooltip {...TIP} formatter={(v, n) => [v + ' phones', n]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radial bars — top brands by count */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Top Brands — Catalog Size</div>
            <div className="chart-card-subtitle">Leading brands by number of products</div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={110}
              data={[...brandCount].sort((a,b) => b.count - a.count).slice(0,8)
                .map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))}>
              <RadialBar background={{ fill: 'var(--border-light)' }}
                dataKey="count" cornerRadius={6} label={false} />
              <Tooltip {...TIP} formatter={(v, n) => [v + ' products', n]} />
              <Legend iconType="circle" iconSize={8}
                formatter={(v) => v}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
