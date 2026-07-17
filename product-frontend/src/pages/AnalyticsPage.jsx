import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import DashboardService from '../services/DashboardService';

const COLORS = [
  '#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#7c3aed','#059669','#d97706',
];

function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DashboardService.getAnalytics()
      .then((res) => setData(res.data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page">
      <div className="loading-state"><div className="spinner" /><span>Loading analytics…</span></div>
    </div>
  );

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: 8, fontSize: 12,
    },
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Analytics</h1>
        <p>Deep insights into your product catalog</p>
      </div>

      <div className="charts-grid">

        {/* Bar: Brand Count */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Products by Brand</div>
            <div className="chart-card-subtitle">Number of products per brand</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.brandWiseCount || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="count" radius={[4,4,0,0]}>
                {(data?.brandWiseCount || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie: Brand count */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Share</div>
            <div className="chart-card-subtitle">Percentage share of each brand</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data?.brandWiseCount || []} dataKey="count" nameKey="brand" cx="50%" cy="48%" outerRadius={90} paddingAngle={2}>
                {(data?.brandWiseCount || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar: Avg Price */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Average Price by Brand</div>
            <div className="chart-card-subtitle">Mean selling price per brand (₹)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.brandAvgPrice || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']} {...tooltipStyle} />
              <Bar dataKey="avgPrice" fill="#f59e0b" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line: Avg Rating */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Average Rating by Brand</div>
            <div className="chart-card-subtitle">Customer satisfaction score (out of 5)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.brandAvgRating || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis domain={[3, 5]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip formatter={(v) => [`${v}/5`, 'Avg Rating']} {...tooltipStyle} />
              <Line type="monotone" dataKey="avgRating" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, fill: '#8b5cf6' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Price Range Pie */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Price Segment Distribution</div>
            <div className="chart-card-subtitle">How products are distributed across price ranges</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.priceRangeDistribution || []}
                dataKey="count"
                nameKey="range"
                cx="50%" cy="45%"
                innerRadius={50} outerRadius={95}
                paddingAngle={3}
                label={({ range, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
              >
                {(data?.priceRangeDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Area: Brand Avg Price trend */}
        <motion.div className="chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="chart-card-header">
            <div className="chart-card-title">Price Trend Across Brands</div>
            <div className="chart-card-subtitle">Area view of average prices</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.brandAvgPrice || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']} {...tooltipStyle} />
              <Area type="monotone" dataKey="avgPrice" stroke="#2563eb" fill="url(#priceGrad)" strokeWidth={2} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
}

export default AnalyticsPage;
