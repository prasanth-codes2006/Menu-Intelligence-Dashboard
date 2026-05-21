import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Moon, Sun, Shield, LogOut, ChevronDown, User, Sparkles, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Topbar({ role, setRole, pageTitle, onOpenCommandPalette, onLogout }) {
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const userEmail = localStorage.getItem('user_email') || 'admin@dashboard.com';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleRole = () => {
    const newRole = role === 'admin' ? 'viewer' : 'admin';
    setRole(newRole);
    localStorage.setItem('dashboard_role', newRole);
    toast.success(`Switched credentials to ${newRole === 'admin' ? 'Administrator' : 'Viewer'}!`, {
      icon: '👑',
      style: {
        borderRadius: '20px',
        background: darkMode ? 'rgba(22, 23, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: darkMode ? '#F8F5EF' : '#1f2937',
        border: darkMode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(212, 175, 55, 0.4)',
        backdropFilter: 'blur(16px)',
      }
    });
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    toast.success(`Switched to ${nextMode ? 'Dark' : 'Light'} Mode`, {
      icon: nextMode ? '🌙' : '☀️',
      style: {
        borderRadius: '20px',
        background: nextMode ? 'rgba(22, 23, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: nextMode ? '#F8F5EF' : '#1f2937',
        border: nextMode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(212, 175, 55, 0.4)',
        backdropFilter: 'blur(16px)',
      }
    });
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('is_logged_in');
    localStorage.removeItem('user_email');
    toast.success('Logged out successfully.', {
      style: {
        borderRadius: '20px',
        background: darkMode ? 'rgba(22, 23, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: darkMode ? '#F8F5EF' : '#1f2937',
        border: darkMode ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid rgba(212, 175, 55, 0.4)',
      }
    });
    if (onLogout) onLogout();
  };

  return (
    <header className="h-[72px] border-b border-border dark:border-white/5 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
      
      {/* Left: Title / Breadcrumbs */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
          <span>Dashboard Overview</span>
          <span>/</span>
          <span className="text-slate-600 dark:text-[#D4AF37] font-extrabold">{pageTitle || 'Dashboard'}</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight mt-0.5 text-slate-900 dark:text-white font-serif">
          {pageTitle || 'Overview'}
        </h2>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Floating Quick Search Bar Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border dark:border-white/10 hover:border-amber-500/20 bg-slate-50 dark:bg-card hover:bg-slate-100 dark:hover:bg-card/85 text-slate-400 dark:text-slate-500 text-xs font-semibold select-none cursor-pointer outline-none transition-all"
        >
          <Search className="w-4 h-4 shrink-0 text-slate-400" />
          <span className="text-left pr-4">Search actions...</span>
          <kbd className="font-mono px-1.5 py-0.5 rounded border border-border dark:border-white/10 bg-white dark:bg-card text-[10px] shadow-sm shrink-0 text-slate-500 dark:text-slate-400">
            Ctrl+K
          </kbd>
        </button>

        {/* Theme Swapper with Rotating Icon */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-border dark:border-white/10 hover:border-amber-500/25 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-all outline-none"
          title="Toggle appearance theme"
        >
          <motion.div
            animate={{ rotate: darkMode ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-450" /> : <Moon className="w-4 h-4" />}
          </motion.div>
        </button>

        {/* Role Quick Toggle Switcher */}
        <button
          onClick={toggleRole}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold text-xs cursor-pointer active:scale-95 transition-all outline-none ${
            role === 'admin'
              ? 'bg-[#D4AF37]/10 text-[#D4AF37] dark:text-[#F7E7B4] border-[#D4AF37]/35 shadow-sm'
              : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-border dark:border-white/10'
          }`}
          title="Toggle access credentials"
        >
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span className="capitalize">{role === 'admin' ? 'Admin' : 'Viewer'}</span>
        </button>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-border dark:bg-white/10 mx-0.5" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer outline-none transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center font-bold text-slate-950 shadow-md text-sm shrink-0">
              {role === 'admin' ? '👑' : '✨'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-300" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {/* Animated Dropdown List */}
          <AnimatePresence>
            {dropdownOpen && (
              <>
                {/* Close overlay */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-border dark:border-white/10 bg-white dark:bg-card shadow-2xl p-2 z-50 glassmorphism text-left"
                >
                  {/* Account Header */}
                  <div className="px-3 py-2.5 border-b border-border dark:border-white/5">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-extrabold">Active Account Credentials</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate mt-0.5">{userEmail}</p>
                    <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold border mt-1.5 uppercase ${
                      role === 'admin' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    }`}>
                      {role === 'admin' ? 'Admin' : 'Viewer'} ACCESS
                    </span>
                  </div>

                  {/* Options */}
                  <div className="mt-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCommandPalette();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white cursor-pointer outline-none transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Command Palette
                    </button>
                    
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer outline-none transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
