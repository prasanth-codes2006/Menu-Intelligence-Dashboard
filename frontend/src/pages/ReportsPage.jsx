import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, TrendingUp, DollarSign, Calendar, BarChart3, ChevronRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { reportsAPI } from '../services/api';
import DateFilter from '../components/DateFilter';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function ReportsPage() {
  const [monthlySales, setMonthlySales] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    loadReports();
  }, [startDate, endDate]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [monthlyRes, revenueRes] = await Promise.all([
        reportsAPI.getMonthlySales(),
        reportsAPI.getRevenue(params),
      ]);

      setMonthlySales(monthlyRes.data || []);
      setRevenue(revenueRes.data || []);
    } catch (error) {
      toast.error('Failed to compile reports: ' + error.message);
    } finally {
      setTimeout(() => setLoading(false), 450); // Visual buffer
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      await reportsAPI.exportCSV(type, params);
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} records exported and downloaded successfully!`, {
        icon: '📥',
      });
    } catch (error) {
      toast.error('Export encountered an error: ' + error.message);
    } finally {
      setExporting('');
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -5 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
  };

  // Glassmorphic custom tooltip styled for reports page charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-card/95 border border-border text-foreground rounded-2xl shadow-2xl glassmorphism text-xs text-left font-sans">
          <p className="font-bold text-slate-800 dark:text-slate-200 mb-1.5">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium flex justify-between gap-4 py-0.5" style={{ color: entry.name.includes('Revenue') || entry.name.includes('Gross') ? '#D4AF37' : '#F7E7B4' }}>
              <span>{entry.name}:</span>
              <span className="font-extrabold">{typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-up text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-semibold tracking-wide text-slate-900 dark:text-white mb-1">Reports</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Examine monthly revenue sheets and export sales data to CSV.</p>
        </div>
      </div>

      {/* Export Tool Box Card */}
      <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card transition-all duration-300">
        <div className="flex items-center gap-2 mb-4 font-sans">
          <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center">
            <Download className="w-4 h-4 text-[#D4AF37] stroke-[2.5]" />
          </div>
          <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-white">Export Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {['revenue', 'monthly', 'bestsellers', 'menu'].map((type) => {
            const labelMap = {
              revenue: 'Revenue Breakdown',
              monthly: 'Monthly Sales',
              bestsellers: 'Top Performers',
              menu: 'Menu Catalog'
            };
            const isExporting = exporting === type;

            return (
              <button
                key={type}
                onClick={() => handleExport(type)}
                disabled={exporting !== ''}
                className="flex items-center justify-between p-4 rounded-xl border border-border/80 dark:border-white/5 bg-slate-50/50 dark:bg-card/20 hover:bg-slate-100 dark:hover:bg-card hover:border-[#D4AF37]/35 text-left outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none transition-all group duration-300 font-sans"
              >
                <div className="min-w-0 font-sans">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {labelMap[type]}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                    {isExporting ? 'Compiling data...' : 'Download CSV file'}
                  </p>
                </div>
                
                {/* Visual indicator spin or download arrow */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isExporting ? 'bg-[#D4AF37] text-slate-950 font-extrabold' : 'bg-white dark:bg-card border border-border dark:border-[#D4AF37]/15 text-slate-400 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/35'
                }`}>
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Filters block */}
      <div className="p-5 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card flex flex-col sm:flex-row sm:items-end justify-between gap-5 transition-all duration-300 font-sans">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Timeline Scope</span>
        </div>
        <DateFilter
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
          onClear={clearFilters}
        />
      </div>

      {/* Sliding indicators tabs bar */}
      <div className="flex p-1 gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 max-w-sm border border-border/50 dark:border-white/5 shadow-sm font-sans">
        <button
          onClick={() => setActiveTab('monthly')}
          className="relative flex-1 py-2.5 rounded-lg text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer outline-none transition-colors"
        >
          {activeTab === 'monthly' && (
            <motion.div
              layoutId="activeReportsTab"
              className="absolute inset-0 bg-white dark:bg-card rounded-lg shadow-sm border border-border/50 dark:border-[#D4AF37]/15 -z-10"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <span className={activeTab === 'monthly' ? 'text-amber-600 dark:text-[#D4AF37] font-bold' : ''}>
            📅 Monthly Sales
          </span>
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className="relative flex-1 py-2.5 rounded-lg text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer outline-none transition-colors"
        >
          {activeTab === 'revenue' && (
            <motion.div
              layoutId="activeReportsTab"
              className="absolute inset-0 bg-white dark:bg-card rounded-lg shadow-sm border border-border/50 dark:border-[#D4AF37]/15 -z-10"
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            />
          )}
          <span className={activeTab === 'revenue' ? 'text-amber-600 dark:text-[#D4AF37] font-bold' : ''}>
            💰 Item Performance
          </span>
        </button>
      </div>

      {/* Main lazy loading layout */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SkeletonLoader type="chart" count={1} />
            <div className="mt-6">
              <SkeletonLoader type="table" count={4} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* A. MONTHLY TIMELINE TAB */}
            {activeTab === 'monthly' && (
              <>
                {/* Visual Chart */}
                <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card flex flex-col justify-between transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6 font-sans">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">Sales Trends</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">Gross revenue plotted against units sold</p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
                  </div>

                  {monthlySales.length > 0 ? (
                    <div className="h-[300px] w-full font-sans">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlySales} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                          <XAxis dataKey="month_name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="revenue"
                            stroke="#D4AF37"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#D4AF37', strokeWidth: 0 }}
                            name="Revenue (₹)"
                          />
                          <Line
                            type="monotone"
                            dataKey="items_sold"
                            stroke="#F7E7B4"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#F7E7B4', strokeWidth: 0 }}
                            name="Units Sold"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState icon="📈" title="Timeline Empty" />
                  )}
                </div>

                {/* Audit Table */}
                <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card transition-all duration-300">
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-6">Monthly Revenue Reports</h3>
                  
                  {monthlySales.length > 0 ? (
                    <div className="overflow-x-auto no-scrollbar font-sans">
                      <table className="saas-table">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/20 font-sans">
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Month</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Year</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Orders</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Units Sold</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Total Revenue</th>
                          </tr>
                        </thead>
                        <motion.tbody
                          variants={tableContainerVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {monthlySales.map((row, i) => (
                            <motion.tr
                              variants={rowVariants}
                              key={i}
                              className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b border-border/50 dark:border-white/5"
                            >
                              <td className="font-serif font-bold text-slate-900 dark:text-white">{row.month_name}</td>
                              <td className="text-slate-500 dark:text-slate-400 font-medium">{row.year}</td>
                              <td className="font-bold text-slate-900 dark:text-white">{row.order_count}</td>
                              <td>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                                  {row.items_sold} units
                                </span>
                              </td>
                              <td className="font-extrabold text-[#D4AF37]">
                                ₹{row.revenue.toLocaleString('en-IN')}
                              </td>
                            </motion.tr>
                          ))}
                          
                          {/* Total Calculations row */}
                          <tr className="bg-slate-50 dark:bg-card/60 font-bold text-slate-950 dark:text-white border-t border-[#D4AF37]/35">
                            <td className="font-serif font-extrabold text-slate-900 dark:text-white">Total</td>
                            <td />
                            <td className="font-extrabold text-slate-900 dark:text-white">{monthlySales.reduce((a, r) => a + r.order_count, 0)}</td>
                            <td>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-xs bg-[#D4AF37]/10 text-amber-600 dark:text-[#D4AF37] border border-[#D4AF37]/20">
                                {monthlySales.reduce((a, r) => a + r.items_sold, 0)} units
                              </span>
                            </td>
                            <td className="font-black text-[#D4AF37] text-sm">
                              ₹{monthlySales.reduce((a, r) => a + r.revenue, 0).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        </motion.tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState icon="📊" title="Auditing Logs Blank" />
                  )}
                </div>
              </>
            )}

            {/* B. REVENUE BY DISH TAB */}
            {activeTab === 'revenue' && (
              <>
                {/* Visual Chart */}
                <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card flex flex-col justify-between transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6 font-sans">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">Item Performance</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-sans">Item sales performance and gross profits</p>
                    </div>
                    <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                  </div>

                  {revenue.length > 0 ? (
                    <div className="h-[320px] w-full font-sans">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenue} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                          <XAxis dataKey="item_name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: 'rgb(156 163 175)', fontWeight: 600 }} height={50} angle={-15} textAnchor="end" />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="total_revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Gross Revenue" />
                          <Bar dataKey="total_profit" fill="#F7E7B4" radius={[4, 4, 0, 0]} name="Profit" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState icon="💰" title="Sales Records Blank" />
                  )}
                </div>

                {/* Audit Table */}
                <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 shadow-lg glassmorphism glow-gold-card transition-all duration-300">
                  <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white mb-6">Menu Item Performance</h3>
                  
                  {revenue.length > 0 ? (
                    <div className="overflow-x-auto no-scrollbar font-sans">
                      <table className="saas-table">
                        <thead>
                          <tr className="border-b border-[#D4AF37]/20 font-sans">
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Rank</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Item Name</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Price</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Cost</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Quantity</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Revenue</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Profit</th>
                            <th className="font-sans tracking-wider text-[#D4AF37] uppercase text-[10px]">Margin</th>
                          </tr>
                        </thead>
                        <motion.tbody
                          variants={tableContainerVariants}
                          initial="hidden"
                          animate="show"
                        >
                          {revenue.map((row, i) => (
                            <motion.tr
                              variants={rowVariants}
                              key={row.item_id}
                              className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b border-border/50 dark:border-white/5"
                            >
                              <td className="font-extrabold text-slate-400 dark:text-slate-600 w-16">
                                #{i + 1}
                              </td>
                              <td className="font-serif font-bold text-slate-900 dark:text-white">{row.item_name}</td>
                              <td className="font-semibold text-slate-900 dark:text-white">₹{row.unit_price}</td>
                              <td className="text-slate-500 dark:text-slate-400 font-medium">₹{row.unit_cost}</td>
                              <td className="font-bold text-slate-900 dark:text-white">{row.quantity_sold}</td>
                              <td className="font-bold text-slate-900 dark:text-white font-sans">₹{row.total_revenue.toLocaleString('en-IN')}</td>
                              <td className="font-bold text-[#D4AF37]">₹{row.total_profit.toLocaleString('en-IN')}</td>
                              <td>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                                  row.margin_percentage >= 50
                                    ? 'bg-[#D4AF37]/10 text-amber-600 dark:text-[#D4AF37] border-[#D4AF37]/30'
                                    : row.margin_percentage >= 30
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                    : row.margin_percentage >= 15
                                    ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                }`}>
                                  {row.margin_percentage}%
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </motion.tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState icon="📊" title="Breakdown Database Blank" />
                  )}
                </div>
              </>
            )}

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
