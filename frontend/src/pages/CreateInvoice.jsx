// src/pages/CreateInvoice.jsx — Invoice creation with full calculation pipeline
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Send, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import InvoiceItemRow from '../components/invoice/InvoiceItemRow';
import InvoiceSummary from '../components/invoice/InvoiceSummary';
import Spinner from '../components/ui/Spinner';
import { customerService } from '../services/customer.service';
import { productService } from '../services/product.service';
import { invoiceService } from '../services/invoice.service';
import { getTodayDate } from '../utils/formatters';

// Default blank item shape
const DEFAULT_ITEM = {
  item_name:    '',
  weight:       '',
  rate:         '',
  making_charge:'',
  discount:     '',
  line_total:   0,
  product_id:   null,
};

const CreateInvoice = () => {
  const navigate = useNavigate();

  // ── API data ──────────────────────────────────────────────────────────────
  const [customers,        setCustomers]        = useState([]);
  const [products,         setProducts]         = useState([]);
  const [nextInvoiceNumber,setNextInvoiceNumber] = useState('');
  const [loadingData,      setLoadingData]       = useState(true);
  const [submitting,       setSubmitting]        = useState(false);

  // ── Form state ────────────────────────────────────────────────────────────
  const [customerId,       setCustomerId]        = useState('');
  const [selectedCustomer, setSelectedCustomer]  = useState(null);
  const [invoiceDate,      setInvoiceDate]       = useState(getTodayDate());
  const [items,            setItems]             = useState([{ ...DEFAULT_ITEM }]);
  const [paidAmount,       setPaidAmount]        = useState('');
  const [adjustment,       setAdjustment]        = useState('');
  const [errors,           setErrors]            = useState({});

  // ── Load initial data ─────────────────────────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes, numRes] = await Promise.all([
          customerService.getAll(),
          productService.getAll(),
          invoiceService.getNextNumber(),
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
        setNextInvoiceNumber(numRes.data.data.invoice_number);
      } catch {
        toast.error('Failed to load data. Please refresh.');
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // ── Item handlers ─────────────────────────────────────────────────────────
  const handleItemChange = (index, updatedItem) => {
    const next = [...items];
    next[index] = updatedItem;
    setItems(next);
  };

  const handleAddItem   = ()      => setItems([...items, { ...DEFAULT_ITEM }]);
  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!customerId)  errs.customerId  = 'Please select a customer.';
    if (!invoiceDate) errs.invoiceDate = 'Invoice date is required.';

    const validItems = items.filter((i) => i.item_name);
    if (validItems.length === 0) errs.items = 'Add at least one item with a name.';

    for (let i = 0; i < validItems.length; i++) {
      if (!validItems[i].weight || parseFloat(validItems[i].weight) <= 0) {
        errs.items = `Item ${i + 1}: weight must be greater than 0.`;
        break;
      }
      if (!validItems[i].rate || parseFloat(validItems[i].rate) <= 0) {
        errs.items = `Item ${i + 1}: rate must be greater than 0.`;
        break;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const validItems = items
      .filter((i) => i.item_name)
      .map((i) => ({
        item_name:    i.item_name,
        weight:       parseFloat(i.weight)        || 0,
        rate:         parseFloat(i.rate)          || 0,
        making_charge:parseFloat(i.making_charge) || 0,
        discount:     parseFloat(i.discount)      || 0,
        product_id:   i.product_id || null,
      }));

    setSubmitting(true);
    try {
      const res = await invoiceService.create({
        customer_id:  parseInt(customerId),
        invoice_date: invoiceDate,
        paid_amount:  parseFloat(paidAmount)  || 0,
        adjustment:   parseFloat(adjustment)  || 0,
        items:        validItems,
      });
      toast.success(`Invoice ${res.data.data.invoice.invoice_number} created successfully!`);
      navigate('/sales-register');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCustomerId('');
    setSelectedCustomer(null);
    setInvoiceDate(getTodayDate());
    setItems([{ ...DEFAULT_ITEM }]);
    setPaidAmount('');
    setAdjustment('');
    setErrors({});
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="text-sm text-gray-500 mt-3">Loading invoice data...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4">

        {/* ── Page header ── */}
        <div className="page-header">
          <div>
            <h2 className="page-title">Create Invoice</h2>
            <p className="page-subtitle">Generate a new billing invoice</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleReset} className="btn-secondary btn-sm">
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
            <button
              type="submit"
              id="save-invoice-btn"
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Saving Invoice...' : 'Save Invoice'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

          {/* ── Left: Invoice Form ── */}
          <div className="xl:col-span-2 space-y-4">

            {/* Invoice Details Card */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">
                Invoice Details
              </h3>

              {/* Row 1: Invoice No, Customer, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Invoice Number */}
                <div>
                  <label className="form-label">Invoice Number</label>
                  <input
                    type="text"
                    value={nextInvoiceNumber}
                    readOnly
                    className="form-input bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-xs"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Auto-generated</p>
                </div>

                {/* Customer */}
                <div>
                  <label className="form-label">Customer <span className="text-red-500">*</span></label>
                  <select
                    id="invoice-customer"
                    value={customerId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomerId(val);
                      setSelectedCustomer(customers.find((c) => String(c.id) === val) || null);
                      setErrors((p) => ({ ...p, customerId: '' }));
                    }}
                    className={`form-input ${errors.customerId ? 'form-input-error' : ''}`}
                  >
                    <option value="">— Select Customer —</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.customer_code} — {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && <p className="form-error">{errors.customerId}</p>}
                </div>

                {/* Invoice Date */}
                <div>
                  <label className="form-label">Invoice Date <span className="text-red-500">*</span></label>
                  <input
                    id="invoice-date"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => { setInvoiceDate(e.target.value); setErrors((p) => ({ ...p, invoiceDate: '' })); }}
                    className={`form-input ${errors.invoiceDate ? 'form-input-error' : ''}`}
                  />
                  {errors.invoiceDate && <p className="form-error">{errors.invoiceDate}</p>}
                </div>
              </div>

              {/* Row 2: Customer Details (always visible, auto-filled) */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Customer Details
                  <span className="ml-1.5 normal-case font-normal">(auto-filled on selection)</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">Customer Code</label>
                    <input type="text" value={selectedCustomer?.customer_code ?? ''} readOnly placeholder="—"
                      className="form-input bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-xs" />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input type="text" value={selectedCustomer?.phone ?? ''} readOnly placeholder="—"
                      className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="form-label">PAN Number</label>
                    <input type="text" value={selectedCustomer?.pan_number ?? ''} readOnly placeholder="—"
                      className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input type="text" value={selectedCustomer?.address ?? ''} readOnly placeholder="—"
                      className="form-input bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700">Invoice Items</h3>
                  <p className="text-xs text-gray-400">Enter item details — line total is auto-calculated</p>
                </div>
                <button
                  type="button"
                  id="add-item-btn"
                  onClick={handleAddItem}
                  className="btn-secondary btn-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Item
                </button>
              </div>

              {errors.items && (
                <div className="px-5 py-2 bg-red-50 border-b border-red-100">
                  <p className="text-xs text-red-600">{errors.items}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="px-3 py-2.5 text-center w-8">#</th>
                      <th className="px-2 py-2.5 text-left">Item Name</th>
                      <th className="px-2 py-2.5 text-right w-24">Weight (g)</th>
                      <th className="px-2 py-2.5 text-right w-28">Rate/10g</th>
                      <th className="px-2 py-2.5 text-right w-28">Making (NPR)</th>
                      <th className="px-2 py-2.5 text-right w-24">Discount</th>
                      <th className="px-3 py-2.5 text-right w-32">Line Total</th>
                      <th className="px-2 py-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <InvoiceItemRow
                        key={index}
                        item={item}
                        index={index}
                        products={products}
                        onChange={handleItemChange}
                        onRemove={handleRemoveItem}
                        canRemove={items.length > 1}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table footer: subtotal quick view */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <span className="text-sm text-gray-600">
                  Subtotal:{' '}
                  <span className="font-semibold text-gray-900 ml-1">
                    {new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR' })
                      .format(items.reduce((s, i) => s + parseFloat(i.line_total || 0), 0))}
                  </span>
                </span>
              </div>
            </div>

            {/* Payment Card */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">
                Payment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Amount Paid (NPR)</label>
                  <input
                    id="paid-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Leave blank if not paid yet</p>
                </div>
                <div>
                  <label className="form-label">Adjustment / Rounding (NPR)</label>
                  <input
                    id="adjustment"
                    type="number"
                    min="0"
                    step="0.01"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="0.00"
                    className="form-input"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Deducted from grand total</p>
                </div>
              </div>
            </div>

            {/* No products note */}
            {products.length === 0 && (
              <div className="card px-5 py-4 border-amber-200 bg-amber-50">
                <p className="text-sm text-amber-700">
                  ⚠️ No catalogue products found. You can still enter items manually.{' '}
                  <a href="/products" className="underline font-medium">Add products</a>{' '}
                  to enable quick-fill.
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Summary ── */}
          <div>
            <InvoiceSummary
              items={items}
              paidAmount={parseFloat(paidAmount) || 0}
              adjustment={parseFloat(adjustment) || 0}
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateInvoice;
