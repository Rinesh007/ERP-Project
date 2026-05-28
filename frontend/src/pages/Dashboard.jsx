// src/pages/Dashboard.jsx — Dashboard with stats, recent invoices, and revenue chart
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import { invoiceService } from '../services/invoice.service';
import { formatCurrency, formatDate } from '../utils/formatters';

// Custom Recharts tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="text-sm font-bold text-primary-600">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, recentRes] = await Promise.all([
          invoiceService.getStats(),
          invoiceService.getMonthly(),
          invoiceService.getRecent(),
        ]);
        setStats(statsRes.data.data);
        setMonthly(monthlyRes.data.data);
        setRecent(recentRes.data.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const statCards = [
    { title: 'Total Customers', value: stats?.total_customers ?? '—', icon: Users, color: 'indigo' },
    { title: 'Total Products', value: stats?.total_products ?? '—', icon: Package, color: 'emerald' },
    { title: 'Total Invoices', value: stats?.total_invoices ?? '—', icon: FileText, color: 'amber' },
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.total_revenue) : '—',
      icon: TrendingUp,
      color: 'blue',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts + Recent Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Monthly Revenue Chart */}
        <div className="xl:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Monthly Revenue</h2>
              <p className="text-xs text-gray-400">Last 12 months</p>
            </div>
          </div>

          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : monthly.length === 0 ? (
            <div className="h-52 flex items-center justify-center">
              <p className="text-sm text-gray-400">No revenue data available yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthly} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Quick Stats Panel */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: 'Add New Customer', to: '/customers', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
              { label: 'Add New Product', to: '/products', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
              { label: 'Create Invoice', to: '/create-invoice', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
              { label: 'View Sales Register', to: '/sales-register', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
            ].map(({ label, to, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${color}`}
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Recent Invoices</h2>
            <p className="text-xs text-gray-400">Latest 10 transactions</p>
          </div>
          <Link to="/sales-register" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : recent.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No invoices yet. Create your first invoice!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Subtotal</th>
                  <th>VAT</th>
                  <th>Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span className="badge badge-blue">{inv.invoice_number}</span>
                    </td>
                    <td className="font-medium">{inv.customer_name}</td>
                    <td className="text-gray-500">{formatDate(inv.invoice_date)}</td>
                    <td>{formatCurrency(inv.subtotal)}</td>
                    <td>{formatCurrency(inv.vat_amount)}</td>
                    <td className="font-semibold text-gray-900">{formatCurrency(inv.grand_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
