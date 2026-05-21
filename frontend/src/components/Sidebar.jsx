/**
 * Sidebar Component — Main navigation sidebar for the dashboard.
 * 
 * Shows navigation links with icons for each page.
 * Highlights the currently active page.
 * Includes role-based display (Admin vs Viewer).
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  ShoppingBag,
  UtensilsCrossed,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/orders', label: 'Orders', icon: ShoppingBag },
  { path: '/menu', label: 'Menu Management', icon: UtensilsCrossed },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed, role }) {
  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Logo / Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__logo">🍽️</span>
        {!collapsed && <span className="sidebar__title">Menu Intel</span>}
      </div>

      {/* Navigation Links */}
      <nav className="sidebar__nav">
        {navItems.map(({ path, label, icon: Icon }) => {
          // Hide Menu Management link for viewers
          if (path === '/menu' && role === 'viewer') return null;

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
              title={label}
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Role Badge */}
      <div className="sidebar__footer">
        {!collapsed && (
          <div className="sidebar__role">
            <ShieldCheck size={16} />
            <span>{role === 'admin' ? 'Admin' : 'Viewer'}</span>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          className="sidebar__toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
