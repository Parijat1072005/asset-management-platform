import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Package, Activity, CalendarClock, AlertCircle, Loader2, Download } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function buildMonthBuckets() {
  const now = new Date();
  const buckets = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      name: MONTH_NAMES[d.getMonth()],
      Approved: 0,
      Pending: 0,
      Returned: 0,
    });
  }
  return buckets;
}

const SummaryCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col transition-colors duration-300">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-gray-500 dark:text-gray-400 font-medium text-sm">{title}</h3>
      <div className="p-2 rounded-lg bg-opacity-10">
        <Icon size={20} className={colorClass} />
      </div>
    </div>
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{value}</h2>
  </div>
);

// ── Export helpers ─────────────────────────────────────────────────────────────

function toCSV(rows) {
  return rows.map(row =>
    row.map(cell => {
      const s = String(cell ?? '');
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(',')
  ).join('\r\n');
}

function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildReport(stats, rawAssets) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const avgUtil = stats.totalInventory > 0
    ? `${Math.round((stats.activeBookings / stats.totalInventory) * 100)}%`
    : '--';

  const sections = [];

  // ── Section 1: Summary ──────────────────────────────────────────────────────
  sections.push(
    ['ASSETIQ — DASHBOARD REPORT'],
    [`Generated: ${dateStr} at ${timeStr}`],
    [],
    ['=== SUMMARY STATISTICS ==='],
    ['Metric', 'Value'],
    ['Total Inventory (units)', stats.totalInventory],
    ['Active Bookings', stats.activeBookings],
    ['Overdue Returns', stats.overdueReturns],
    ['Avg Utilization', avgUtil],
    [],
  );

  // ── Section 2: Asset Distribution ──────────────────────────────────────────
  sections.push(
    ['=== ASSET DISTRIBUTION BY CATEGORY ==='],
    ['Category', 'Share (%)'],
    ...stats.distribution
      .filter(d => d.name !== 'No Data')
      .map(d => [d.name, d.value]),
    [],
  );

  // ── Section 3: Booking Trend ────────────────────────────────────────────────
  sections.push(
    ['=== BOOKING ACTIVITY TREND (Last 6 Months) ==='],
    ['Month', 'Approved', 'Pending', 'Returned'],
    ...stats.bookingTrend.map(m => [m.name, m.Approved, m.Pending, m.Returned]),
    [],
  );

  // ── Section 4: Full Inventory ───────────────────────────────────────────────
  sections.push(
    ['=== FULL INVENTORY LIST ==='],
    ['Asset Name', 'Category', 'Description', 'Quantity', 'Status'],
    ...rawAssets.map(a => [a.name, a.category, a.description, a.quantity, a.status]),
  );

  return toCSV(sections);
}

// ── Dashboard component ────────────────────────────────────────────────────────

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [rawAssets, setRawAssets] = useState([]);
  const [stats, setStats] = useState({
    totalInventory: 0,
    activeBookings: 0,
    overdueReturns: 0,
    distribution: [],
    bookingTrend: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [assetsRes, statsRes] = await Promise.all([
          axios.get('/api/assets', config),
          axios.get('/api/bookings/stats', config),
        ]);

        const assets = assetsRes.data;
        const { activeBookings, overdueReturns, trend } = statsRes.data;

        setRawAssets(assets); // keep raw list for export

        const categoryCounts = {};
        let totalItems = 0;
        assets.forEach(asset => {
          totalItems += asset.quantity;
          categoryCounts[asset.category] =
            (categoryCounts[asset.category] || 0) + asset.quantity;
        });
        const dynamicDistribution = Object.keys(categoryCounts).map(key => ({
          name: key,
          value: Math.round((categoryCounts[key] / totalItems) * 100) || 0,
        }));

        setStats({
          totalInventory: totalItems,
          activeBookings,
          overdueReturns,
          distribution: dynamicDistribution.length > 0
            ? dynamicDistribution
            : [{ name: 'No Data', value: 100 }],
          bookingTrend: trend,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Re-fetch latest data so the report is always fresh
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [assetsRes, statsRes] = await Promise.all([
        axios.get('/api/assets', config),
        axios.get('/api/bookings/stats', config),
      ]);

      const assets = assetsRes.data;
      const { activeBookings, overdueReturns, trend } = statsRes.data;

      const categoryCounts = {};
      let totalItems = 0;
      assets.forEach(a => {
        totalItems += a.quantity;
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + a.quantity;
      });
      const distribution = Object.keys(categoryCounts).map(key => ({
        name: key,
        value: Math.round((categoryCounts[key] / totalItems) * 100) || 0,
      }));

      const freshStats = {
        totalInventory: totalItems,
        activeBookings,
        overdueReturns,
        distribution,
        bookingTrend: trend,
      };

      const csv = buildReport(freshStats, assets);
      const date = new Date().toISOString().slice(0, 10);
      downloadCSV(`AssetIQ_Report_${date}.csv`, csv);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full text-brand-blue">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Real-time asset utilization and status.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-brand-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <><Loader2 size={16} className="animate-spin" /> Exporting...</>
          ) : (
            <><Download size={16} /> Export Report</>
          )}
        </button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Inventory"  value={stats.totalInventory}  icon={Package}      colorClass="text-blue-500" />
        <SummaryCard title="Avg Utilization"  value={stats.totalInventory > 0 ? `${Math.round((stats.activeBookings / stats.totalInventory) * 100)}%` : '--%'} icon={Activity} colorClass="text-green-500" />
        <SummaryCard title="Active Bookings"  value={stats.activeBookings}  icon={CalendarClock} colorClass="text-purple-500" />
        <SummaryCard title="Overdue Returns"  value={stats.overdueReturns}  icon={AlertCircle}  colorClass="text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm lg:col-span-2 transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Booking Activity Trend</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Monthly bookings over the last 6 months</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.bookingTrend} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} allowDecimals={false} />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="Approved" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Pending"  stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Returned" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Asset Distribution</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">By current inventory categories</p>
          <div className="h-[250px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;