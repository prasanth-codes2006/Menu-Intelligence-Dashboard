import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Award, AlertTriangle, TrendingUp, Sliders, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../services/api';
import DateFilter from '../components/DateFilter';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function AnalyticsPage() {
  const [bestsellers, setBestsellers] = useState([]);
  const [lowMargin, setLowMargin] = useState([]);
  const [lowPerformance, setLowPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bestsellers');

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [marginThreshold, setMarginThreshold] = useState(30);

  useEffect(() => {
    loadAnalytics();
  }, [startDate, endDate, marginThreshold]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const [bestRes, marginRes, perfRes] = await Promise.all([
        analyticsAPI.getBestsellers({ ...params, limit: 50 }),
        analyticsAPI.getLowMargin(marginThreshold),
        analyticsAPI.getLowPerformance(params),
      ]);

      setBestsellers(bestRes.data || []);
      setLowMargin(marginRes.data || []);
      setLowPerformance(perfRes.data || []);
    } catch (error) {
      toast.error('Failed to update analytics logs: ' + error.message);
    } finally {
      setTimeout(() => setLoading(false), 400); // Visual buffer
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const filterBySearch = (items) => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const tabs = [
    { id: 'bestsellers', label: '🏆 Top Selling Items', count: filterBySearch(bestsellers).length },
    { id: 'low-margin', label: '💸 Margin Analysis', count: filterBySearch(lowMargin).length },
    { id: 'low-performance', label: '📉 Low Performing Items', count: filterBySearch(lowPerformance).length },
  ];

  // Motion variants for stagger table rows
  const tableContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }
  };

  return (
    <div className="space-y-8 animate-fade-up text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-serif">Analytics</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Examine menu profit margins, sales indexes, and velocity distributions.</p>
        </div>
      </div>

      {/* Floating Filters Section */}
      <div className="p-5 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 backdrop-blur-xl shadow-md flex flex-col md:flex-row md:items-end gap-5">
        
        {/* Search */}
        <div className="flex-1 space-y-1.5 text-left">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Search Menu Items
          </label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border dark:border-white/10 bg-slate-50/50 dark:bg-[#1a1c23]/60 text-sm font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/10 text-slate-900 dark:text-white transition-all animate-none"
            />
          </div>
        </div>

        {/* Date Filter Component wrapper */}
        <div className="shrink-0 flex items-end gap-3 text-left">
          <DateFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={clearFilters}
          />
        </div>
      </div>

      {/* Modern Tabs Bar with sliding indicator */}
      <div className="flex p-1 gap-1.5 rounded-xl bg-slate-100/80 dark:bg-[#1a1c23]/60 max-w-lg border border-border/50 dark:border-white/5 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 py-2.5 rounded-lg text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer outline-none transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeAnalyticsTab"
                  className="absolute inset-0 bg-white dark:bg-[#121212] rounded-lg shadow-sm border border-border/50 dark:border-white/5 -z-10"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className={isActive ? 'text-[#D4AF37] font-bold font-serif tracking-wide' : ''}>
                {tab.label} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Content Panel */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SkeletonLoader type="table" count={5} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md glassmorphism animate-none"
            >
              {/* Tab Header Controls */}
              <div className="flex items-center justify-between border-b border-border/50 dark:border-[#D4AF37]/10 pb-4 mb-6 text-left">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize font-serif tracking-wide">
                    {activeTab === 'bestsellers' && '🏆 Top Selling Items Leaderboard'}
                    {activeTab === 'low-margin' && '💸 Margin Analysis'}
                    {activeTab === 'low-performance' && '📉 Low Performing Items'}
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {activeTab === 'bestsellers' && 'Top selling items based on order volume and customer demand'}
                    {activeTab === 'low-margin' && 'Items with profit margins below the target threshold'}
                    {activeTab === 'low-performance' && 'Items with low sales volume needing performance improvement'}
                  </p>
                </div>

                {/* Live Margin slider threshold inside Tab Title Bar */}
                {activeTab === 'low-margin' && (
                  <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl border border-border dark:border-white/10 bg-slate-50 dark:bg-[#1a1c23]/60 shrink-0">
                    <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-slate-500">Target:</span>
                    <span className="text-xs font-extrabold text-[#D4AF37] font-serif">{marginThreshold}%</span>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      value={marginThreshold}
                      onChange={(e) => setMarginThreshold(Number(e.target.value))}
                      className="w-20 sm:w-28 accent-[#D4AF37] h-1 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Bestsellers Table content */}
              {activeTab === 'bestsellers' && (
                filterBySearch(bestsellers).length > 0 ? (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Menu Item</th>
                          <th>Qty Sold</th>
                          <th>Gross Revenue</th>
                          <th>Trend Index</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={tableContainerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {filterBySearch(bestsellers).map((item, index) => (
                          <motion.tr
                            variants={rowVariants}
                            key={item.item_id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                          >
                            <td className="font-extrabold text-slate-400 dark:text-slate-600 w-16">
                              #{index + 1}
                            </td>
                            <td className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                              {item.item_name}
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
                                {item.quantity_sold}
                              </span>
                            </td>
                            <td className="font-extrabold text-slate-900 dark:text-white">
                              ₹{item.total_revenue.toLocaleString('en-IN')}
                            </td>
                            <td>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <TrendingUp className="w-3.5 h-3.5" />
                                {item.sales_trend}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="🏆" title="No Bestsellers Registered" message="Seed orders to generate sales leaderboards." />
                )
              )}

              {/* Low Margins Table content */}
              {activeTab === 'low-margin' && (
                filterBySearch(lowMargin).length > 0 ? (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>Index</th>
                          <th>Menu Item</th>
                          <th>Price</th>
                          <th>Raw Cost</th>
                          <th>Profit</th>
                          <th>Margin %</th>
                          <th>AI Action Plan</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={tableContainerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {filterBySearch(lowMargin).map((item, index) => (
                          <motion.tr
                            variants={rowVariants}
                            key={item.item_id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                          >
                            <td className="font-extrabold text-slate-400 dark:text-slate-600 w-16">
                              #{index + 1}
                            </td>
                            <td className="font-bold text-slate-900 dark:text-white">
                              {item.item_name}
                            </td>
                            <td className="font-bold">₹{item.price}</td>
                            <td className="text-slate-500">₹{item.cost}</td>
                            <td className="font-bold text-rose-500">₹{item.profit_margin}</td>
                            <td>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-xs border ${
                                item.margin_percentage < 15
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                {item.margin_percentage}%
                              </span>
                            </td>
                            <td className="text-xs font-semibold text-slate-500 max-w-sm leading-relaxed">
                              {item.recommendation}
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="✅" title="All Margins Healthy!" message={`No active dishes sit below target threshold of ${marginThreshold}%.`} />
                )
              )}

              {/* Low Performance Table content */}
              {activeTab === 'low-performance' && (
                filterBySearch(lowPerformance).length > 0 ? (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th>Index</th>
                          <th>Menu Item</th>
                          <th>Total Sales Count</th>
                          <th>Recommendation</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={tableContainerVariants}
                        initial="hidden"
                        animate="show"
                      >
                        {filterBySearch(lowPerformance).map((item, index) => (
                          <motion.tr
                            variants={rowVariants}
                            key={item.item_id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-950/40 transition-colors"
                          >
                            <td className="font-extrabold text-slate-400 dark:text-slate-600 w-16">
                              #{index + 1}
                            </td>
                            <td className="font-bold text-slate-900 dark:text-white">
                              {item.item_name}
                            </td>
                            <td>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs border ${
                                item.total_sales === 0
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                              }`}>
                                {item.total_sales === 0 ? 'No demand recorded' : `${item.total_sales} sold`}
                              </span>
                            </td>
                            <td className="text-xs font-semibold text-slate-500 max-w-lg leading-relaxed flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0" />
                              {item.recommendation}
                            </td>
                          </motion.tr>
                        ))}
                      </motion.tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState icon="🎉" title="Excellent Portfolio Velocity" message="No catalog items fall inside low performance filters." />
                )
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
