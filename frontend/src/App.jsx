import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CommandPalette from './components/CommandPalette';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import SettingsPage from './pages/SettingsPage';

// Map paths to page titles
const pageTitles = {
  '/': 'Dashboard Overview',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/menu': 'Menu Management',
  '/orders': 'Orders',
  '/settings': 'Settings',
};

function AppLayout({ role, setRole, onLogout }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const pageTitle = pageTitles[location.pathname] || 'Dashboard Overview';

  // Listen for Ctrl+K keyboard shortcut to open command palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex">
      {/* Sidebar navigation */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} role={role} />

      {/* Main Panel Content Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 280 }}
      >
        <Topbar 
          role={role} 
          setRole={setRole} 
          pageTitle={pageTitle} 
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onLogout={onLogout}
        />

        {/* Page Main container with routing transition animations */}
        <main className="flex-grow p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="w-full"
            >
              <Routes location={location}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/menu" element={<MenuPage role={role} />} />
                <Route path="/orders" element={<OrdersPage role={role} />} />
                <Route path="/settings" element={<SettingsPage role={role} />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Shortcut Palette */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        setIsOpen={setIsCommandPaletteOpen}
        role={role}
        setRole={setRole}
      />

      {/* Global Toast configurations */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card) / 0.95)',
            color: 'hsl(var(--foreground))',
            borderRadius: '20px',
            padding: '16px 24px',
            fontSize: '0.85rem',
            fontWeight: 600,
            border: '1px solid hsl(var(--primary) / 0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.15)',
          },
          success: {
            iconTheme: { primary: 'hsl(var(--primary))', secondary: 'hsl(var(--card))' },
          },
          error: {
            iconTheme: { primary: 'hsl(var(--destructive))', secondary: 'hsl(var(--card))' },
          },
        }}
      />
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [role, setRole] = useState(() => {
    return localStorage.getItem('dashboard_role') || 'admin';
  });

  // Dark mode recovery on startup
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = (selectedRole) => {
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {isLoggedIn ? (
        <AppLayout role={role} setRole={setRole} onLogout={handleLogout} />
      ) : (
        <AuthPage onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}

export default App;
