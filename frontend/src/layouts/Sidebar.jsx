// src/layouts/Sidebar.jsx — Collapsible sidebar navigation
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ClipboardList,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import logo from '../assets/logo.svg';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/create-invoice', label: 'Create Invoice', icon: FileText },
  { to: '/sales-register', label: 'Sales Register', icon: ClipboardList },
];

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0
                  ${collapsed ? 'w-16' : 'w-60'}`}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center h-16 border-b border-gray-200 px-3 gap-2 flex-shrink-0`}>
        <img
          src={logo}
          alt="Professional Edge Global Logo"
          className="w-9 h-9 flex-shrink-0 object-contain"
        />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">Professional Edge</p>
            <p className="text-[9px] text-primary-600 font-semibold truncate uppercase tracking-wide">Global Pvt. Ltd.</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-2' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className={`border-t border-gray-200 p-3 flex-shrink-0`}>
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-primary-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-red-500 hover:bg-red-50 hover:text-red-600
                      ${collapsed ? 'justify-center px-2' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
