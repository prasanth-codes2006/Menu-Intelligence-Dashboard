import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Award, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' or 'viewer'
  const [email, setEmail] = useState('admin@dashboard.com');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('is_logged_in', 'true');
      localStorage.setItem('dashboard_role', selectedRole);
      
      toast.success(`Access granted! Logged in as ${selectedRole === 'admin' ? 'Admin' : 'Viewer'}`, {
        icon: '🔑',
        style: {
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          color: 'hsl(var(--foreground))',
        }
      });
      onLogin(selectedRole);
    }, 800);
  };

  const fillQuickCredentials = (role) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setEmail('admin@dashboard.com');
      setPassword('adminpassword');
    } else {
      setEmail('viewer@dashboard.com');
      setPassword('viewerpassword');
    }
    toast.success(`Loaded credentials for ${role === 'admin' ? 'Admin' : 'Viewer'}`, {
      icon: '🪄',
      duration: 1500
    });
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-background overflow-hidden font-sans select-none">
      {/* 1. Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-amber-600/10 to-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-yellow-500/5 to-amber-600/10 blur-[120px] pointer-events-none" />

      {/* 2. Glassmorphic Login Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="w-full max-w-md p-8 rounded-3xl border border-border dark:border-white/5 bg-white/70 dark:bg-card/45 backdrop-blur-xl shadow-2xl space-y-6 z-10"
      >
        {/* Title / Brand header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 text-black flex items-center justify-center shadow-lg shadow-amber-500/10">
            <Sparkles className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-2xl font-serif font-extrabold tracking-wide text-slate-900 dark:text-white pt-2">
            Menu Intelligence
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Enter your credentials or choose a quick login role.
          </p>
        </div>

        {/* Quick Sandbox Login Toggles */}
        <div className="space-y-2 text-left">
          <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
            Demo Sandboxes
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillQuickCredentials('admin')}
              className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all duration-300 ${
                selectedRole === 'admin'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-slate-950 dark:text-white'
                  : 'border-border/60 dark:border-white/5 bg-slate-50/50 dark:bg-card/25 text-slate-500 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                <span>Admin</span>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1">Full control access</p>
            </button>

            <button
              type="button"
              onClick={() => fillQuickCredentials('viewer')}
              className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all duration-300 ${
                selectedRole === 'viewer'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-slate-950 dark:text-white'
                  : 'border-border/60 dark:border-white/5 bg-slate-50/50 dark:bg-card/25 text-slate-500 hover:border-slate-300 dark:hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Viewer</span>
              </div>
              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium mt-1">Read-only access</p>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@restaurant.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/40 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/40 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2 select-none"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}