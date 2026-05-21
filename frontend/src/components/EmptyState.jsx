import { Inbox } from 'lucide-react';

export default function EmptyState({ icon = '📊', title = 'No data yet', message = 'Data will appear here once available.' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/80 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 max-w-sm mx-auto my-6 space-y-3">
      {/* Icon Badge */}
      <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-center text-2xl shadow-sm animate-bounce shrink-0">
        {icon}
      </div>
      
      {/* Texts */}
      <div className="space-y-1">
        <h4 className="font-extrabold text-sm text-slate-950 dark:text-white">
          {title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
