// src/pages/SalesRegister.jsx — All invoices with search, date filter, and view detail
import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, RefreshCw, FileText, Printer } from 'lucide-react';
import { toast } from 'react-toastify';
import InvoiceDetailModal from '../components/invoice/InvoiceDetailModal';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { invoiceService } from '../services/invoice.service';
import { formatCurrency, formatDate, getTodayDate } from '../utils/formatters';
import { printInvoice } from '../utils/printInvoice';

const SalesRegister = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Invoice detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const res = await invoiceService.getAll(params);
      setInvoices(res.data.data);
    } catch {
      toast.error('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, [search, fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(fetchInvoices, 300);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const handleViewInvoice = async (invoiceId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setSelectedInvoice(null);
    try {
      const res = await invoiceService.getById(invoiceId);
      setSelectedInvoice(res.data.data);
    } catch {
      toast.error('Failed to load invoice details.');
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFromDate('');
    setToDate('');
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      const res = await invoiceService.getById(invoiceId);
      printInvoice(res.data.data);
    } catch {
      toast.error('Failed to load invoice for printing.');
    }
  };

  // Totals summary
  const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.grand_total || 0), 0);
  const totalVAT = invoices.reduce((s, i) => s + parseFloat(i.vat_amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Sales Register</h2>
          <p className="page-subtitle">{invoices.length} invoices found</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="badge badge-blue">
            Total: {formatCurrency(totalRevenue)}
          </span>
          <span className="badge badge-yellow">
            VAT: {formatCurrency(totalVAT)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="invoice-search"
            type="text"
            placeholder="Search by customer or invoice #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9"
          />
        </div>

        {/* Date From */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">From:</label>
          <input
            id="filter-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-input text-sm py-1.5 w-36"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 whitespace-nowrap">To:</label>
          <input
            id="filter-to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-input text-sm py-1.5 w-36"
          />
        </div>

        {(search || fromDate || toDate) && (
          <button onClick={handleClearFilters} className="btn-ghost btn-sm text-xs">
            Clear filters
          </button>
        )}

        <button onClick={fetchInvoices} className="btn-ghost btn-sm ml-auto" title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Try adjusting your filters or create a new invoice."
            action={
              <a href="/create-invoice" className="btn-primary btn-sm">
                <FileText className="h-4 w-4" /> Create Invoice
              </a>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Invoice Number</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Subtotal</th>
                  <th>VAT (13%)</th>
                  <th>Grand Total</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id}>
                    <td className="text-gray-400 text-xs">{idx + 1}</td>
                    <td>
                      <span className="badge badge-blue font-mono text-xs">{inv.invoice_number}</span>
                    </td>
                    <td>
                      <p className="font-medium text-gray-900 text-xs">{inv.customer_name}</p>
                      <p className="text-[10px] text-gray-400">{inv.customer_code}</p>
                    </td>
                    <td className="text-gray-600 text-xs">{formatDate(inv.invoice_date)}</td>
                    <td className="text-gray-600">{formatCurrency(inv.subtotal)}</td>
                    <td className="text-amber-600">{formatCurrency(inv.vat_amount)}</td>
                    <td className="font-semibold text-gray-900">{formatCurrency(inv.grand_total)}</td>
                    <td className="text-gray-400 text-xs">{formatDate(inv.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewInvoice(inv.id)}
                          className="btn-ghost btn-sm gap-1 text-primary-600 hover:bg-primary-50"
                          title="View invoice"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(inv.id)}
                          className="btn-ghost btn-sm text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          title="Print / Save as PDF"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals Footer */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={4} className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Totals ({invoices.length} invoices)
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {formatCurrency(invoices.reduce((s, i) => s + parseFloat(i.subtotal || 0), 0))}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-amber-600">
                    {formatCurrency(totalVAT)}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary-700">
                    {formatCurrency(totalRevenue)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <InvoiceDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        invoice={selectedInvoice}
        loading={detailLoading}
      />
    </div>
  );
};

export default SalesRegister;
