import { motion } from 'framer-motion';

export default function SkeletonLoader({ type = 'card', count = 3 }) {
  const items = Array.from({ length: count });

  const shimmerVariants = {
    initial: { backgroundPosition: '-200% 0' },
    animate: {
      backgroundPosition: '200% 0',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      },
    },
  };

  const ShimmerBlock = ({ className = "h-4 rounded" }) => (
    <motion.div
      initial="initial"
      animate="animate"
      variants={shimmerVariants}
      className={`bg-gradient-to-r from-[#D4AF37]/5 via-[#D4AF37]/20 to-[#D4AF37]/5 dark:from-[#D4AF37]/5 dark:via-[#D4AF37]/15 dark:to-[#D4AF37]/5 bg-[length:200%_auto] ${className}`}
    />
  );

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {items.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border dark:border-[#D4AF37]/10 bg-card shadow-sm flex flex-col justify-between h-[115px] glassmorphism">
            <div className="flex items-center justify-between">
              <ShimmerBlock className="h-3 w-16" />
              <ShimmerBlock className="h-7 w-7 rounded-lg" />
            </div>
            <div className="space-y-2 mt-2">
              <ShimmerBlock className="h-6 w-24" />
              <ShimmerBlock className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="w-full h-[320px] p-5 rounded-2xl border border-border dark:border-[#D4AF37]/10 bg-card shadow-sm flex flex-col justify-between glassmorphism">
        <div className="flex items-center justify-between">
          <ShimmerBlock className="h-4 w-32" />
          <ShimmerBlock className="h-6 w-24" />
        </div>
        <div className="flex items-end gap-3 flex-1 mt-6 h-[200px]">
          {Array.from({ length: 12 }).map((_, idx) => (
            <ShimmerBlock 
              key={idx} 
              className="flex-1 rounded-t-lg"
              style={{ height: `${20 + Math.random() * 80}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full border border-border dark:border-[#D4AF37]/10 bg-card rounded-2xl overflow-hidden shadow-sm glassmorphism">
        <div className="px-5 py-4 border-b border-border dark:border-[#D4AF37]/10 bg-muted/10 flex items-center justify-between">
          <ShimmerBlock className="h-4.5 w-36" />
          <ShimmerBlock className="h-7 w-20" />
        </div>
        <div className="p-5 space-y-4">
          {items.map((_, i) => (
            <div key={i} className="flex items-center gap-6 py-2 border-b border-border/30 dark:border-[#D4AF37]/5 last:border-0">
              <ShimmerBlock className="h-3 w-6 shrink-0" />
              <ShimmerBlock className="h-3.5 w-36 flex-grow" />
              <ShimmerBlock className="h-3.5 w-20 shrink-0" />
              <ShimmerBlock className="h-3.5 w-24 shrink-0" />
              <ShimmerBlock className="h-7 w-8 rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'recommendation') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {items.map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border dark:border-[#D4AF37]/10 bg-card shadow-sm flex flex-col justify-between h-[180px] glassmorphism">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <ShimmerBlock className="h-4 w-28" />
                <ShimmerBlock className="h-4.5 w-16" />
              </div>
              <div className="flex gap-4">
                <ShimmerBlock className="h-3 w-16" />
                <ShimmerBlock className="h-3 w-20" />
              </div>
              <div className="flex gap-2 pt-1">
                <ShimmerBlock className="h-5 w-24 rounded-full" />
                <ShimmerBlock className="h-5 w-24 rounded-full" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <ShimmerBlock className="h-3 w-full" />
              <ShimmerBlock className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
