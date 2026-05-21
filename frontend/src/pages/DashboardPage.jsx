import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { Brain, Star, ArrowUpRight, TrendingUp, Sparkles, MessageSquare, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI, reportsAPI } from '../services/api';
import KPICard from '../components/KPICard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

// Enhanced vibrant color palette for modern charts
const CHART_COLORS = ['#D4AF37', '#F7E7B4', '#C5A880', '#10b981', '#a855f7', '#ec4899', '#f43f5e', '#14b8a6', '#06b6d4'];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [bestsellers, setBestsellers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, bestRes, recRes, monthlyRes] = await Promise.all([
        analyticsAPI.getSummary(),
        analyticsAPI.getBestsellers({ limit: 5 }),
        analyticsAPI.getRecommendations(),
        reportsAPI.getMonthlySales(),
      ]);
      setSummary(summaryRes.data);
      setBestsellers(bestRes.data || []);
      setRecommendations(recRes.data || []);
      setMonthlySales(monthlyRes.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard metrics: ' + error.message);
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth skeleton buffer
    }
  };

  // Convert bestsellers to Recharts Pie compatible format
  const pieData = bestsellers.map((item) => ({
    name: item.item_name,
    value: item.quantity_sold,
  }));

  // Reusable stagger animation parents/children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  // Reusable custom chart tooltip styled with glassmorphism
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-white/95 dark:bg-[#202126]/95 border border-border dark:border-white/10 text-slate-800 dark:text-[#F8F5EF] rounded-2xl shadow-xl backdrop-blur-md text-xs text-left">
          <p className="font-bold text-slate-900 dark:text-slate-200 mb-1.5 font-serif">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-semibold flex justify-between gap-4 py-0.5" style={{ color: entry.name.includes('Revenue') ? '#d4a017' : 'hsl(var(--muted-foreground))' }}>
              <span>{entry.name}:</span>
              <span className="font-extrabold">{typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-up">
        {/* Skeleton Shimmers */}
        <SkeletonLoader type="card" count={5} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonLoader type="chart" count={1} />
          <SkeletonLoader type="chart" count={1} />
        </div>
        <div className="p-6 border border-border bg-card rounded-2xl space-y-4">
          <div className="h-5 w-48 rounded bg-muted/10 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonLoader type="recommendation" count={3} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 text-left"
    >
      
      {/* KPI Stats Panel */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Revenue"
          value={`₹${(summary?.total_revenue || 0).toLocaleString('en-IN')}`}
          icon="💰"
          color="green"
          subtitle={`${summary?.total_order_count || 0} order records`}
          trend={{ type: 'up', text: '+12% vs last month' }}
        />
        <KPICard
          title="Total Orders"
          value={(summary?.total_orders || 0).toLocaleString('en-IN')}
          icon="📦"
          color="blue"
          subtitle={`Avg ₹${summary?.avg_order_value || 0} transaction`}
          trend={{ type: 'up', text: '+8% volume growth' }}
        />
        <KPICard
          title="Menu Items"
          value={summary?.total_menu_items || 0}
          icon="🍽️"
          color="purple"
          subtitle="Catalog size in storage"
          trend={{ type: 'stable', text: 'Catalog stable' }}
        />
        <KPICard
          title="Bestseller"
          value={summary?.best_selling_item || 'N/A'}
          icon="🏆"
          color="amber"
          subtitle="Top performer in demand"
          trend={{ type: 'up', text: 'High velocity' }}
        />
        <KPICard
          title="Low Margin"
          value={summary?.low_performing_count || 0}
          icon="📉"
          color="red"
          subtitle="Needs urgent markup adjustment"
          trend={{ type: 'down', text: 'Attention required' }}
        />
      </motion.div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Area Chart: Monthly Revenue */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md flex flex-col justify-between glassmorphism"
        >
          <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-wide">Revenue Performance</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Gross revenue statistics grouped by month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
          </div>

          {monthlySales.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySales} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="month_name" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} 
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#gradientRevenue)"
                    name="Revenue (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="📈" title="No Sales Generated" message="Revenue timelines display once order data compiles." />
          )}
        </motion.div>

        {/* Bar Chart: Items Sold */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md flex flex-col justify-between glassmorphism"
        >
          <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-wide">Sales Volume Trends</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Total units sold grouped by month</p>
            </div>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>

          {monthlySales.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="month_name" 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} 
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="items_sold" fill="url(#barSalesGradient)" radius={[6, 6, 0, 0]} name="Quantity Sold">
                    <defs>
                      <linearGradient id="barSalesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#C5A880" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="📊" title="Timeline Empty" message="Interactive visual analytics will compile here." />
          )}
        </motion.div>

      </div>

      {/* Secondary Row: Bestsellers & Pie sales breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top 5 Bestsellers (H-Bar Chart) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-7 p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md flex flex-col justify-between glassmorphism"
        >
          <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-wide">Top 5 Bestsellers</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Highest sales velocity menu items</p>
            </div>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>

          {bestsellers.length > 0 ? (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestsellers} layout="vertical" margin={{ left: 20, right: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'rgb(156 163 175)' }} />
                  <YAxis 
                    dataKey="item_name" 
                    type="category" 
                    tickLine={false}
                    axisLine={false}
                    width={100} 
                    tick={{ fontSize: 11, fill: 'rgb(156 163 175)', fontWeight: 600 }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantity_sold" fill="url(#bestsellerGradient)" radius={[0, 6, 6, 0]} name="Quantity Sold">
                    <defs>
                      <linearGradient id="bestsellerGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#F7E7B4" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon="🏆" title="No Top Performers" message="Sales records are required to identify top items." />
          )}
        </motion.div>

        {/* Sales Distribution (Pie Chart) */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-5 p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md flex flex-col justify-between glassmorphism"
        >
          <div className="flex items-center justify-between border-b border-border/50 dark:border-white/5 pb-4 mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-wide">Sales Distribution</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Item shares relative to aggregate demand</p>
            </div>
            <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
          </div>

          {pieData.length > 0 ? (
            <div className="h-[280px] w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center text-[10px] font-bold text-slate-400 mt-2">
                {pieData.slice(0, 4).map((entry, index) => (
                  <span key={index} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                    {entry.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon="🥧" title="Distribution Empty" message="Share breakdown compiles when database seeds." />
          )}
        </motion.div>

      </div>

      {/* Intelligent Pricing & Recommendations Panel */}
      <motion.div
        variants={itemVariants}
        className="p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md glassmorphism"
      >
        <div className="flex items-center justify-between border-b border-[#D4AF37]/10 pb-4 mb-6">
          <div className="flex items-center gap-2 text-left">
            <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/35 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-[#D4AF37]" />
            </div>
            <div className="text-left ml-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-wide">🧠 AI-Powered Menu Recommendations</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Automated profitability tips generated dynamically</p>
            </div>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.map((rec) => (
              <motion.div
                key={rec.item_id}
                whileHover={{ y: -3 }}
                className="p-5 rounded-2xl border border-border/60 dark:border-white/5 bg-white/55 dark:bg-[#1a1c23]/40 text-left flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-slate-950 dark:text-white leading-snug truncate pr-2">
                      {rec.item_name}
                    </h4>
                    <span className="text-sm font-extrabold text-[#D4AF37] shrink-0 font-serif">
                      ₹{rec.price}
                    </span>
                  </div>

                  {/* Profit Statistics metadata */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div className="bg-slate-50 dark:bg-card border border-border/40 dark:border-white/5 rounded-xl p-2">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Qty Sold</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{rec.total_sales}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-card border border-border/40 dark:border-white/5 rounded-xl p-2">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Margin %</p>
                      <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{rec.margin_percentage}%</p>
                    </div>
                  </div>

                  {/* Recommendation Tag Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {rec.tags.map((tag, i) => {
                      let tagColor = 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
                      if (tag.includes('Top') || tag.includes('High')) {
                        tagColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                      } else if (tag.includes('Low')) {
                        tagColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                      }
                      return (
                        <span key={i} className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${tagColor}`}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Suggestions Checklist */}
                <div className="mt-4 pt-3 border-t border-border/60 dark:border-white/5 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {rec.recommendations.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 shrink-0" />
                      <p className="leading-snug">{r}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState icon="🧠" title="No AI Advice Configured" message="Once database registers menu items and orders, smart recommendations calculate automatically." />
        )}
      </motion.div>

    </motion.div>
  );
}
