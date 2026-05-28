// src/components/invoice/InvoiceDetailModal.jsx — Full invoice view with print/download
import { AlertTriangle, Printer } from 'lucide-react';
import Modal from '../ui/Modal';
import Spinner from '../ui/Spinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printInvoice } from '../../utils/printInvoice';

const InvoiceDetailModal = ({ isOpen, onClose, invoice, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details" size="lg">
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : !invoice ? (
        <p className="text-sm text-gray-500 text-center py-8">No invoice data.</p>
      ) : (
        <div className="space-y-5">

          {/* KYC Flag */}
          {invoice.kyc_required === 1 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-700">KYC Required</p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  This transaction requires KYC documentation.
                </p>
              </div>
            </div>
          )}

          {/* Header: Invoice No + Grand Total + Print button */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Invoice Number</p>
              <p className="text-lg font-bold text-primary-700 font-mono">{invoice.invoice_number}</p>
              <p className="text-xs text-gray-500 mt-0.5">Date: {formatDate(invoice.invoice_date)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Grand Total</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(invoice.grand_total)}</p>
                {parseFloat(invoice.balance) < 0 && (
                  <p className="text-xs text-red-500 mt-0.5">
                    Balance due: {formatCurrency(Math.abs(invoice.balance))}
                  </p>
                )}
                {parseFloat(invoice.balance) >= 0 && parseFloat(invoice.payment_received) > 0 && (
                  <p className="text-xs text-green-500 mt-0.5">
                    Change: {formatCurrency(invoice.balance)}
                  </p>
                )}
              </div>
              {/* Print / Download button */}
              <button
                onClick={() => printInvoice(invoice)}
                className="btn-primary btn-sm gap-1.5"
                title="Print or save as PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Download PDF
              </button>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bill To</p>
            <p className="text-sm font-semibold text-gray-800">{invoice.customer_name}</p>
            <p className="text-xs text-gray-500">{invoice.customer_code}</p>
            {invoice.phone      && <p className="text-xs text-gray-500 mt-0.5">📞 {invoice.phone}</p>}
            {invoice.pan_number && <p className="text-xs text-gray-500">PAN: {invoice.pan_number}</p>}
            {invoice.address    && <p className="text-xs text-gray-500">📍 {invoice.address}</p>}
          </div>

          {/* Items Table */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="data-table text-xs">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Item</th>
                    <th className="text-right">Weight (g)</th>
                    <th className="text-right">Rate/10g</th>
                    <th className="text-right">Making</th>
                    <th className="text-right">Discount</th>
                    <th className="text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.items || []).map((item, i) => (
                    <tr key={item.id}>
                      <td className="text-gray-400">{i + 1}</td>
                      <td>
                        <p className="font-medium text-gray-800">{item.item_name}</p>
                        {item.product_name && (
                          <p className="text-[10px] text-gray-400">{item.product_code} — {item.product_name}</p>
                        )}
                      </td>
                      <td className="text-right">{parseFloat(item.weight).toFixed(3)}</td>
                      <td className="text-right">{formatCurrency(item.rate)}</td>
                      <td className="text-right">{formatCurrency(item.making_charge)}</td>
                      <td className="text-right text-green-600">
                        {parseFloat(item.discount) > 0 ? `−${formatCurrency(item.discount)}` : '—'}
                      </td>
                      <td className="text-right font-semibold">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {parseFloat(invoice.vat_amount) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>VAT (13%)</span>
                <span className="text-amber-600">{formatCurrency(invoice.vat_amount)}</span>
              </div>
            )}
            {parseFloat(invoice.extra_tax) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service charge (2%)</span>
                <span className="text-blue-600">{formatCurrency(invoice.extra_tax)}</span>
              </div>
            )}
            {parseFloat(invoice.adjustment_amount) > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Adjustment (−)</span>
                <span className="text-green-600">−{formatCurrency(invoice.adjustment_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>Grand Total</span>
              <span className="text-primary-700">{formatCurrency(invoice.grand_total)}</span>
            </div>
            {parseFloat(invoice.payment_received) > 0 && (
              <>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Paid</span>
                  <span>{formatCurrency(invoice.payment_received)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>{parseFloat(invoice.balance) < 0 ? 'Balance Due' : 'Change'}</span>
                  <span className={parseFloat(invoice.balance) < 0 ? 'text-red-600' : 'text-green-600'}>
                    {parseFloat(invoice.balance) < 0
                      ? `−${formatCurrency(Math.abs(invoice.balance))}`
                      : formatCurrency(invoice.balance)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Bottom print button */}
          <button
            onClick={() => printInvoice(invoice)}
            className="w-full btn-secondary gap-2 justify-center"
          >
            <Printer className="h-4 w-4" />
            Print Invoice / Save as PDF
          </button>

        </div>
      )}
    </Modal>
  );
};

export default InvoiceDetailModal;
