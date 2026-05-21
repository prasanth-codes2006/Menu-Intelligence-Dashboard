import { Calendar, Trash2 } from 'lucide-react';

export default function DateFilter({ startDate, endDate, onStartChange, onEndChange, onClear }) {
  return (
    <div className="flex items-end gap-3 flex-wrap text-left">
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          From Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="pl-3 pr-3 py-2 rounded-xl border border-border dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          To Date
        </label>
        <div className="relative">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            className="pl-3 pr-3 py-2 rounded-xl border border-border dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/40 text-xs font-bold outline-none focus:border-indigo-500 text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {(startDate || endDate) && (
        <button
          onClick={onClear}
          className="px-3.5 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 font-extrabold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shrink-0"
          title="Clear date parameters"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
