export default function LoadingSpinner({ message = 'Loading catalog...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      {/* Outer spinning ring with gradient */}
      <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
        <div className="absolute inset-0 border-4 border-indigo-500/10 dark:border-indigo-500/5 rounded-full" />
        <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
      </div>
      
      {/* Loading message */}
      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase animate-pulse">
        {message}
      </p>
    </div>
  );
}
