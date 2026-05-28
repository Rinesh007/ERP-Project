// src/layouts/Navbar.jsx — Top navigation bar
import { useLocation } from 'react-router-dom';
import { Bell, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your business' },
  '/customers': { title: 'Customers', subtitle: 'Manage customer records' },
  '/products': { title: 'Products', subtitle: 'Manage product inventory' },
  '/create-invoice': { title: 'Create Invoice', subtitle: 'Generate a new billing invoice' },
  '/sales-register': { title: 'Sales Register', subtitle: 'View all invoices and transactions' },
};

const Navbar = () => {
  const { pathname } = useLocation();
  const page = pageTitles[pathname] || { title: 'Professional Edge Global', subtitle: '' };
  const today = formatDate(new Date().toISOString());

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page Title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900">{page.title}</h1>
        {page.subtitle && <p className="text-xs text-gray-400">{page.subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>{today}</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="text-[10px] font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded uppercase tracking-wide">
            Professional Edge v1.0
          </div>
      </div>
    </header>
  );
};

export default Navbar;
