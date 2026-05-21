import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function KPICard({ title, value, icon, subtitle, trend, color = 'blue' }) {
  // Map color strings to modern tailwind/CSS variable colors
  const colorMaps = {
    green: {
      border: 'hover:border-emerald-500/35',
      glow: 'shadow-emerald-500/5 hover:shadow-emerald-500/10',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      indicator: 'bg-emerald-500',
    },
    blue: {
      border: 'hover:border-[#D4AF37]/35',
      glow: 'shadow-[#D4AF37]/5 hover:shadow-[#D4AF37]/10',
      iconBg: 'bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F7E7B4]',
      indicator: 'bg-[#D4AF37]',
    },
    purple: {
      border: 'hover:border-purple-500/35',
      glow: 'shadow-purple-500/5 hover:shadow-purple-500/10',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      indicator: 'bg-purple-500',
    },
    amber: {
      border: 'hover:border-amber-500/35',
      glow: 'shadow-amber-500/5 hover:shadow-amber-500/10',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      indicator: 'bg-amber-500',
    },
    red: {
      border: 'hover:border-rose-500/35',
      glow: 'shadow-rose-500/5 hover:shadow-rose-500/10',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      indicator: 'bg-rose-500',
    },
  };

  const scheme = colorMaps[color] || colorMaps.blue;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative p-6 rounded-2xl border border-border/80 dark:border-white/5 bg-card/75 shadow-md overflow-hidden glassmorphism flex flex-col justify-between text-left group glow-gold-card ${scheme.border} ${scheme.glow} transition-colors duration-300`}
    >
      {/* Visual Accent Bar */}
      <div className={`absolute top-0 left-0 w-full h-[3.5px] ${scheme.indicator} opacity-85`} />

      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-none font-serif">
            {value}
          </h3>
        </div>

        {/* Emoji or character symbol converted to circular badge */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110 ${scheme.iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/50 dark:border-white/5">
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
          {subtitle}
        </span>

        {/* Optional Trend Pill */}
        {trend && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
            trend.type === 'up'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
              : trend.type === 'down'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent'
          }`}>
            {trend.type === 'up' ? (
              <TrendingUp className="w-3 h-3 text-emerald-500" />
            ) : trend.type === 'down' ? (
              <TrendingDown className="w-3 h-3 text-rose-500" />
            ) : (
              <RefreshCw className="w-3 h-3 text-amber-500" />
            )}
            {trend.text}
          </span>
        )}
      </div>
    </motion.div>
  );
}
