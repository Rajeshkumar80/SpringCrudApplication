import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  ZAxis, ComposedChart,
} from 'recharts';
import DashboardService from '../services/DashboardService';

const PALETTE = [
  '#2563eb','#7c3aed','#10b981','#f59e0b','#ef4444',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#0ea5e9','#a16207','#be185d',
  '#047857','#9333ea','#dc2626','#0284c7','#65a30d',
];

const fmt = (n) =>
  n >= 100000 ? `₹${(n/100000).toFixed(1)}L`
  : n >= 1000  ? `₹${(n/1000).toFixed(0)}K`
  : `₹${n}`;

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
const GRID = { strokeDasharray: '3 3', stroke: 'var(--border-default)', strokeOpacity: 0.5 };

function ChartCard({ title, subtitle, children, delay = 0 }) {
  return (
    <motion.div className="chart-card"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}>
      <div className="chart-card-header">
        <div className="chart-card-title">{title}</div>
        <div className="chart-card-subtitle">{subtitle}</div>
      </div>
      {children}
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getAnalytics()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page"><div className="loading-state"><div className="spinner" /><span>Loading analytics…</span></div></div>
  );

  const brandCount  = data?.brandWiseCount          || [];
  const brandPrice  = data?.brandAvgPrice           || [];
  const brandRating = data?.brandAvgRating          || [];
  const priceRange  = data?.priceRangeDistribution  || [];

  /* Merge brand price + rating for combo chart */
  const combined = brandPrice.map(b => {
    const r = brandRating.find(x => x.brand === b.brand);
    return { brand: b.brand, avgPrice: b.avgPrice, avgRating: r?.avgRating ?? 0 };
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Data-driven insights from your live product database — all charts update from the database in real time</p>
      </div>

      {/* Row 1 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>

        {/* Coloured bar — brand count */}
        <ChartCard title="Products by Brand" subtitle="Count of products per brand in your catalog" delay={0}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandCount} margin={{ top: 4, right: 16, left: 0, bottom: 70 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={AXIS_TICK} />
              <Tooltip {...TIP} formatter={(v) => [v, 'Products']} />
              <Bar dataKey="count" radius={[5,5,0,0]} maxBarSize={28}>
                {brandCount.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Donut — brand share */}
        <ChartCard title="Brand Market Share" subtitle="Percentage of catalog owned by each brand" delay={0.05}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={brandCount} dataKey="count" nameKey="brand"
                cx="50%" cy="48%" innerRadius={55} outerRadius={100} paddingAngle={2}>
                {brandCount.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="none" />)}
              </Pie>
              <Tooltip {...TIP} formatter={(v, n) => [v + ' products', n]} />
              <Legend iconType="circle" iconSize={8}
                wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>

        {/* Avg price bar */}
        <ChartCard title="Average Price by Brand" subtitle="Mean price per brand — reflects premium vs budget positioning" delay={0.1}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandPrice} margin={{ top: 4, right: 16, left: 0, bottom: 70 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis tickFormatter={fmt} tick={AXIS_TICK} width={50} />
              <Tooltip {...TIP} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']} />
              <Bar dataKey="avgPrice" radius={[5,5,0,0]} maxBarSize={28}>
                {brandPrice.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Line chart — avg rating */}
        <ChartCard title="Average Rating by Brand" subtitle="Customer satisfaction score per brand (out of 5)" delay={0.15}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={brandRating} margin={{ top: 10, right: 16, left: 0, bottom: 70 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis domain={[3.5, 5]} tickCount={4} tick={AXIS_TICK} />
              <Tooltip {...TIP} formatter={(v) => [`${v}/5`, 'Avg Rating']} />
              <Line type="monotone" dataKey="avgRating" stroke="#7c3aed" strokeWidth={2.5}
                dot={{ r: 5, fill: '#7c3aed', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#7c3aed' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>

        {/* Price range donut */}
        <ChartCard title="Price Segment Distribution" subtitle="Budget · Mid-range · Upper · Premium · Ultra-premium" delay={0.2}>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={priceRange} dataKey="count" nameKey="range"
                cx="50%" cy="48%" innerRadius={55} outerRadius={100} paddingAngle={3}
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
        </ChartCard>

        {/* Area chart — price trend across brands */}
        <ChartCard title="Price Trend Across Brands" subtitle="Visual sweep of average price from cheapest to most expensive brand" delay={0.25}>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={[...brandPrice].sort((a,b) => a.avgPrice - b.avgPrice)}
              margin={{ top: 10, right: 16, left: 0, bottom: 70 }}>
              <defs>
                <linearGradient id="priceTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis tickFormatter={fmt} tick={AXIS_TICK} width={50} />
              <Tooltip {...TIP} formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']} />
              <Area type="monotone" dataKey="avgPrice" stroke="#2563eb" fill="url(#priceTrend)"
                strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 — Combo chart */}
      <div style={{ marginBottom: 20 }}>
        <ChartCard title="Price vs Rating — Brand Intelligence" subtitle="Combined view: bar = avg price, line = avg rating — reveals value leaders" delay={0.3}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={combined} margin={{ top: 10, right: 30, left: 0, bottom: 70 }}>
              <CartesianGrid {...GRID} />
              <XAxis dataKey="brand" tick={AXIS_TICK} angle={-38} textAnchor="end" interval={0} />
              <YAxis yAxisId="price" tickFormatter={fmt} tick={AXIS_TICK} width={52}
                label={{ value: 'Avg Price', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'var(--text-muted)' } }} />
              <YAxis yAxisId="rating" orientation="right" domain={[3.5, 5.0]}
                tick={AXIS_TICK}
                label={{ value: 'Rating', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: 'var(--text-muted)' } }} />
              <Tooltip {...TIP} formatter={(v, n) =>
                n === 'avgPrice' ? [`₹${Number(v).toLocaleString()}`, 'Avg Price']
                : [`${v}/5`, 'Avg Rating']} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 8 }} />
              <Bar yAxisId="price" dataKey="avgPrice" name="Avg Price" radius={[5,5,0,0]} maxBarSize={26}>
                {combined.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
              <Line yAxisId="rating" dataKey="avgRating" name="Avg Rating" type="monotone"
                stroke="#f59e0b" strokeWidth={2.5}
                dot={{ r: 5, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

    </div>
  );
}
