import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdInventory2, MdAttachMoney, MdStarRate,
  MdTrendingUp, MdTrendingDown, MdPhoneAndroid,
} from 'react-icons/md';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import DashboardService from '../services/DashboardService';

const PIE_COLORS = [
  '#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#06b6d4','#ec4899','#84cc16','#f97316','#6366f1',
  '#14b8a6','#e11d48','#7c3aed','#059669','#d97706',
];

const fmt = (n) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(2)}L`
    : n >= 1000
    ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n}`;

function StatCard({ label, value, sub, icon, accent, delay }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="stat-card-content">
        <div className="stat-card-label">{label}</div>
        <div className="stat-card-value">{value}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
      <div className={`stat-card-icon ${accent}`}>{icon}</div>
    </motion.div>
  );
}

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, analyticsRes] = await Promise.all([
          DashboardService.getSummary(),
          DashboardService.getAnalytics(),
        ]);
        setSummary(summaryRes.data);
        setAnalytics(analyticsRes.data);
      } catch (e) {
        console.error('Dashboard load error', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Products',
      value: summary?.totalProducts ?? '—',
      sub: 'Unique SKUs',
      icon: <MdPhoneAndroid />,
      accent: 'accent-blue',
      delay: 0,
    },
    {
      label: 'Total Inventory',
      value: summary?.totalInventory?.toLocaleString() ?? '—',
      sub: 'Units in stock',
      icon: <MdInventory2 />,
      accent: 'accent-green',
      delay: 0.05,
    },
    {
      label: 'Inventory Value',
      value: summary ? fmt(summary.inventoryValue) : '—',
      sub: 'Total stock value',
      icon: <MdAttachMoney />,
      accent: 'accent-orange',
      delay: 0.1,
    },
    {
      label: 'Average Price',
      value: summary ? fmt(summary.averagePrice) : '—',
      sub: 'Across all products',
      icon: <MdTrendingUp />,
      accent: 'accent-purple',
      delay: 0.15,
    },
    {
      label: 'Highest Price',
      value: summary?.highestPriceProduct ? `${summary.highestPriceProduct.name}` : '—',
      sub: summary?.highestPriceProduct ? fmt(summary.highestPriceProduct.price) : '',
      icon: <MdTrendingUp />,
      accent: 'accent-red',
      delay: 0.2,
    },
    {
      label: 'Lowest Price',
      value: summary?.lowestPriceProduct ? `${summary.lowestPriceProduct.name}` : '—',
      sub: summary?.lowestPriceProduct ? fmt(summary.lowestPriceProduct.price) : '',
      icon: <MdTrendingDown />,
      accent: 'accent-teal',
      delay: 0.25,
    },
    {
      label: 'Highest Rated',
      value: summary?.highestRatedProduct ? `${summary.highestRatedProduct.name}` : '—',
      sub: summary?.highestRatedProduct ? `⭐ ${summary.highestRatedProduct.rating}/5` : '',
      icon: <MdStarRate />,
      accent: 'accent-orange',
      delay: 0.3,
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time overview of your product inventory</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Bar Chart: Brand Avg Price */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Average Price</div>
            <div className="chart-card-subtitle">Average selling price per brand (₹)</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={analytics?.brandAvgPrice || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Avg Price']}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="avgPrice" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart: Brand-wise Count */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Distribution</div>
            <div className="chart-card-subtitle">Products per brand</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={analytics?.brandWiseCount || []}
                dataKey="count"
                nameKey="brand"
                cx="50%" cy="45%"
                outerRadius={90}
                label={({ brand, percent }) => `${brand} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={10}
              >
                {(analytics?.brandWiseCount || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Area Chart: Brand Avg Rating */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">Brand Average Rating</div>
            <div className="chart-card-subtitle">Customer satisfaction by brand</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={analytics?.brandAvgRating || []} margin={{ top: 4, right: 10, left: 0, bottom: 60 }}>
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} angle={-35} textAnchor="end" interval={0} />
              <YAxis domain={[3.5, 5]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} />
              <Tooltip
                formatter={(v) => [`${v}/5`, 'Avg Rating']}
                contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="avgRating" stroke="#10b981" fill="url(#ratingGrad)" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart: Price Range */}
        <motion.div
          className="chart-card"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
        >
          <div className="chart-card-header">
            <div className="chart-card-title">Price Range Distribution</div>
            <div className="chart-card-subtitle">Products grouped by price segment</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={analytics?.priceRangeDistribution || []}
                dataKey="count"
                nameKey="range"
                cx="50%" cy="45%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
              >
                {(analytics?.priceRangeDistribution || []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

export default DashboardPage;
