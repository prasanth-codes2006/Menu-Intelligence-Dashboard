import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, BarChart3, FileText, UtensilsCrossed, Moon, Sun, Shield, Terminal, X, ShoppingBag, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CommandPalette({ isOpen, setIsOpen, role, setRole }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const commands = [
    { id: 'dash', title: 'Go to Dashboard Overview', shortcut: 'G D', icon: LayoutDashboard, action: () => navigate('/') },
    { id: 'analytics', title: 'Go to Analytics', shortcut: 'G A', icon: BarChart3, action: () => navigate('/analytics') },
    { id: 'reports', title: 'Go to Reports', shortcut: 'G R', icon: FileText, action: () => navigate('/reports') },
    { id: 'orders', title: 'Go to Orders', shortcut: 'G O', icon: ShoppingBag, action: () => navigate('/orders') },
    { id: 'settings', title: 'Configure Settings', shortcut: 'G S', icon: Settings, action: () => navigate('/settings') },
    { 
      id: 'menu', 
      title: 'Go to Menu Management', 
      shortcut: 'G M', 
      icon: UtensilsCrossed, 
      action: () => {
        if (role === 'viewer') {
          toast.error("Administrator role required to access Menu Management", {
            style: {
              borderRadius: '20px',
              background: 'hsl(var(--card) / 0.95)',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--primary) / 0.25)',
              backdropFilter: 'blur(16px)',
            }
          });
        } else {
          navigate('/menu');
        }
      } 
    },
    { 
      id: 'toggle-role', 
      title: `Switch credentials to ${role === 'admin' ? 'Viewer' : 'Administrator'}`, 
      shortcut: 'S R', 
      icon: Shield, 
      action: () => {
        const nextRole = role === 'admin' ? 'viewer' : 'admin';
        setRole(nextRole);
        localStorage.setItem('dashboard_role', nextRole);
        toast.success(`Credentials updated to ${nextRole === 'admin' ? 'Administrator' : 'Viewer'}`, {
          icon: '👑',
          style: {
            borderRadius: '20px',
            background: 'hsl(var(--card) / 0.95)',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--primary) / 0.25)',
            backdropFilter: 'blur(16px)',
          }
        });
      } 
    },
    { 
      id: 'theme-dark', 
      title: 'Set Dark Theme Mode', 
      shortcut: 'T D', 
      icon: Moon, 
      action: () => {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        toast.success('Dark mode enabled', {
          icon: '🌙',
          style: {
            borderRadius: '20px',
            background: 'hsl(var(--card) / 0.95)',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--primary) / 0.25)',
            backdropFilter: 'blur(16px)',
          }
        });
      } 
    },
    { 
      id: 'theme-light', 
      title: 'Set Light Theme Mode', 
      shortcut: 'T L', 
      icon: Sun, 
      action: () => {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        toast.success('Light mode enabled', {
          icon: '☀️',
          style: {
            borderRadius: '20px',
            background: 'hsl(var(--card) / 0.95)',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--primary) / 0.25)',
            backdropFilter: 'blur(16px)',
          }
        });
      } 
    }
  ];

  // Close palette on escape keypress
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const triggerAction = (action) => {
    action();
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/35 dark:bg-black/50 backdrop-blur-md"
          />

          {/* Floating Command Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="w-full max-w-[600px] bg-card border border-border dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl relative z-10 text-left glassmorphism"
          >
            {/* Input Search Container */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-slate-100/50 dark:bg-card/45">
              <Search className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, pages, actions..."
                className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none font-medium"
                autoFocus
              />
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions list */}
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5 no-scrollbar">
              {filteredCommands.length > 0 ? (
                filteredCommands.map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => triggerAction(cmd.action)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#D4AF37]/5 text-foreground/80 hover:text-foreground transition-all text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-muted/30 group-hover:bg-[#D4AF37]/15 text-muted-foreground group-hover:text-[#D4AF37] flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold truncate font-serif tracking-wide">{cmd.title}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-4">
                        {cmd.shortcut.split(' ').map((char, index) => (
                          <kbd 
                            key={index}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-muted/40 border border-border dark:border-[#D4AF37]/20 rounded-md text-[#D4AF37] shadow-sm"
                          >
                            {char}
                          </kbd>
                        ))}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                  <Terminal className="w-6 h-6 text-[#D4AF37]" />
                  <p className="text-xs font-semibold">No commands found matching "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer with hints */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-t border-border text-[9px] font-bold text-muted-foreground/80 tracking-widest uppercase">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1 py-0.5 bg-muted/40 border border-border rounded">ESC</kbd> to close
              </span>
              <span>
                Use <kbd className="px-1 py-0.5 bg-muted/40 border border-border rounded">Tab</kbd> / <kbd className="px-1 py-0.5 bg-muted/40 border border-border rounded">↵</kbd> to execute
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
