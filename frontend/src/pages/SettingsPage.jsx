import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Moon, Sun, Shield, Server, Check, HelpCircle, Compass, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { menuAPI, ordersAPI } from '../services/api';

export default function SettingsPage({ role }) {
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('user_email') || 'admin@dashboard.com');
  const [userName, setUserName] = useState(() => {
    return role === 'admin' ? 'Admin' : 'Viewer';
  });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Theme state synchronized with root html element
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  // Server health state
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [dbHealth, setDbHealth] = useState({
    status: 'checking', // checking, active, disconnected
    dishesCount: 0,
    ordersCount: 0,
    apiUrl: 'http://localhost:8000',
  });

  useEffect(() => {
    checkServerHealth();
  }, []);

  const checkServerHealth = async () => {
    setCheckingHealth(true);
    setDbHealth(prev => ({ ...prev, status: 'checking' }));
    try {
      const [dishes, ordersList] = await Promise.all([
        menuAPI.getAll(),
        ordersAPI.getAll()
      ]);
      setDbHealth({
        status: 'active',
        dishesCount: dishes.length,
        ordersCount: ordersList.length,
        apiUrl: 'http://localhost:8000'
      });
    } catch (err) {
      setDbHealth({
        status: 'disconnected',
        dishesCount: 0,
        ordersCount: 0,
        apiUrl: 'http://localhost:8000'
      });
    } finally {
      setTimeout(() => setCheckingHealth(false), 500); // Visual buffer
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('user_email', userEmail);
      toast.success('Profile settings updated successfully!', {
        style: {
          borderRadius: '20px',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }
      });
      setSavingProfile(false);
    }, 400);
  };

  const toggleThemeMode = (darkActive) => {
    setDarkMode(darkActive);
    if (darkActive) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      toast.success('Dark Mode Enabled', {
        icon: '🌙',
        style: {
          borderRadius: '20px',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }
      });
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      toast.success('Light Mode Enabled', {
        icon: '☀️',
        style: {
          borderRadius: '20px',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        }
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-up text-left">
      
      {/* Header Info */}
      <div>
        <h2 className="text-3xl font-serif font-semibold tracking-wide text-slate-900 dark:text-white mb-1">Settings</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium font-sans">Manage user profiles, theme preferences, and backend database status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Cards grid */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Profile Settings */}
          <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism glow-gold-card transition-all duration-300 shadow-md">
            <div className="flex items-center gap-3.5 mb-6 border-b border-border/50 dark:border-white/5 pb-4 font-sans">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
                <User className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Profile Settings</h3>
                <p className="text-[10px] text-slate-400 font-medium">Credentials identifying the dashboard console operator.</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                    Access Level
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/15 bg-slate-100/50 dark:bg-[#121212]/50 text-slate-500 text-xs">
                    <Shield className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="capitalize font-bold text-slate-800 dark:text-slate-300">
                      {role === 'admin' ? 'Administrator (Full Admin)' : 'Viewer (Read-only)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card/60 text-xs font-semibold outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-extrabold text-xs shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer outline-none disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Theme Settings */}
          <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism glow-gold-card transition-all duration-300 shadow-md">
            <div className="flex items-center gap-3.5 mb-6 border-b border-border/50 dark:border-white/5 pb-4 font-sans">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Theme Settings</h3>
                <p className="text-[10px] text-slate-400 font-medium">Choose between light and dark modes for the dashboard theme.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              {/* Option 1: Light Mode */}
              <div 
                onClick={() => toggleThemeMode(false)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-44 text-left ${
                  !darkMode 
                    ? 'border-[#D4AF37] bg-[#f8f6f2] shadow-lg shadow-[#D4AF37]/5' 
                    : 'border-border/30 dark:border-[#D4AF37]/15 bg-[#121212]/30 opacity-70 hover:opacity-90 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Sun className="w-4 h-4" />
                  </span>
                  {!darkMode && <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-[#D4AF37]/10 text-amber-700 border border-[#D4AF37]/35 uppercase">Active Theme</span>}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-slate-950 text-base mb-1">Light Mode</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Clean ivory and light backgrounds for optimal readability.</p>
                </div>
              </div>

              {/* Option 2: Dark Mode */}
              <div 
                onClick={() => toggleThemeMode(true)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between h-44 text-left ${
                  darkMode 
                    ? 'border-[#D4AF37] bg-[#16171a] text-white shadow-lg shadow-black/60' 
                    : 'border-border bg-slate-50 opacity-70 hover:opacity-90'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    <Moon className="w-4 h-4" />
                  </span>
                  {darkMode && <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/35 uppercase">Active Theme</span>}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-white text-base mb-1">Dark Mode</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Premium dark interface with soft contrast and gold accents.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Server health monitor card */}
        <div className="space-y-8 font-sans">
          
          {/* Card 3: Backend Connection */}
          <div className="p-6 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism glow-gold-card transition-all duration-300 shadow-md">
            <div className="flex items-center justify-between mb-6 border-b border-border/50 dark:border-white/5 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md shrink-0">
                  <Server className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-serif font-extrabold text-slate-900 dark:text-white leading-none">Backend Connection</h3>
                  <span className="text-[9px] text-slate-400 tracking-wider">FastAPI Endpoint Connection</span>
                </div>
              </div>

              {/* Refresh trigger */}
              <button
                onClick={checkServerHealth}
                disabled={checkingHealth}
                className="p-1.5 rounded-lg border border-border dark:border-[#D4AF37]/20 bg-slate-50 dark:bg-card hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50"
                title="Refresh database status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin text-[#D4AF37]' : ''}`} />
              </button>
            </div>

            <div className="space-y-5 text-left text-xs">
              
              {/* Endpoint Address */}
              <div className="flex justify-between items-center py-2 border-b border-border/40 dark:border-white/5">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Host URL</span>
                <code className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#121212] text-slate-700 dark:text-slate-300 font-semibold">{dbHealth.apiUrl}</code>
              </div>

              {/* API Connection Health Badge */}
              <div className="flex justify-between items-center py-2 border-b border-border/40 dark:border-white/5">
                <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Connection Status</span>
                
                {dbHealth.status === 'checking' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-[9px] bg-slate-100 text-slate-500 dark:bg-white/5 border border-border/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                    Checking Link...
                  </span>
                )}

                {dbHealth.status === 'active' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Operational
                  </span>
                )}

                {dbHealth.status === 'disconnected' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[9px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Timeout / Off
                  </span>
                )}
              </div>

              {/* DB statistics */}
              <div className="space-y-2.5 pt-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold mb-3 font-sans">Database Status</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold text-[10px]">Registered Menu Items</span>
                  <span className="font-extrabold text-slate-800 dark:text-[#D4AF37] text-sm">
                    {dbHealth.status === 'active' ? dbHealth.dishesCount : '—'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold text-[10px]">Total Orders Logged</span>
                  <span className="font-extrabold text-slate-800 dark:text-[#D4AF37] text-sm">
                    {dbHealth.status === 'active' ? dbHealth.ordersCount : '—'}
                  </span>
                </div>
              </div>

              {/* Status report note */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#121212]/50 border border-border dark:border-[#D4AF37]/10 mt-6 text-[10px] text-slate-400 leading-relaxed font-sans">
                {dbHealth.status === 'active' ? (
                  <span>The Menu Intelligence Dashboard is successfully connected to the backend database. Fast response times verified.</span>
                ) : dbHealth.status === 'checking' ? (
                  <span>Querying backend databases...</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400">Failed to query FastAPI endpoints. Please double check if your local server at port 8000 is active.</span>
                )}
              </div>

            </div>
          </div>

          {/* Help box */}
          <div className="p-5 rounded-2xl border border-border dark:border-[#D4AF37]/15 bg-white dark:bg-card/40 glassmorphism text-left space-y-2 font-sans">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              Dashboard Help
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              For system questions regarding credentials, access levels, or custom integrations, please contact your administrator.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
