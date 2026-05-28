// src/components/invoice/InvoiceItemRow.jsx — Jewelry invoice line item
// Fields: item_name | weight | rate | making_charge | discount | line_total (auto)
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Frontend mirror of backend calculateLineTotal:
 * ((weight / 10) * rate) + makingCharge - discount
 */
function calcLineTotal(weight, rate, makingCharge, discount) {
  const w  = parseFloat(weight)       || 0;
  const r  = parseFloat(rate)         || 0;
  const mc = parseFloat(makingCharge) || 0;
  const d  = parseFloat(discount)     || 0;
  return Math.max(0, Number((((w / 10) * r) + mc - d).toFixed(2)));
}

const InvoiceItemRow = ({ item, index, products, onChange, onRemove, canRemove }) => {

  // Quick-fill from product catalogue (optional convenience)
  const handleProductChange = (e) => {
    const productId = e.target.value ? parseInt(e.target.value) : null;
    const product   = products.find((p) => p.id === productId);
    const updatedItem = {
      ...item,
      product_id: productId,
      item_name:  product ? product.name  : item.item_name,
      rate:       product ? parseFloat(product.price) : item.rate,
    };
    updatedItem.line_total = calcLineTotal(
      updatedItem.weight, updatedItem.rate,
      updatedItem.making_charge, updatedItem.discount
    );
    onChange(index, updatedItem);
  };

  const handleChange = (field, raw) => {
    const updatedItem = { ...item, [field]: raw };
    updatedItem.line_total = calcLineTotal(
      updatedItem.weight, updatedItem.rate,
      updatedItem.making_charge, updatedItem.discount
    );
    onChange(index, updatedItem);
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/70 transition-colors">

      {/* S.N. */}
      <td className="px-3 py-2.5 text-center text-xs text-gray-400 font-medium w-8">
        {index + 1}
      </td>

      {/* Item Name (free-form) + optional product quick-fill */}
      <td className="px-2 py-2 min-w-[160px]">
        <input
          id={`item-name-${index}`}
          type="text"
          value={item.item_name || ''}
          onChange={(e) => handleChange('item_name', e.target.value)}
          placeholder="e.g. Gold Ring"
          className="form-input text-xs py-1.5 mb-1"
        />
        <select
          id={`item-product-${index}`}
          value={item.product_id || ''}
          onChange={handleProductChange}
          className="form-input text-[10px] py-1 text-gray-400"
        >
          <option value="">— Quick-fill from catalogue —</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.product_code} — {p.name}
            </option>
          ))}
        </select>
      </td>

      {/* Weight (g) */}
      <td className="px-2 py-2 w-24">
        <input
          id={`item-weight-${index}`}
          type="number"
          min="0"
          step="0.001"
          value={item.weight || ''}
          onChange={(e) => handleChange('weight', e.target.value)}
          placeholder="0.000"
          className="form-input text-xs py-1.5 text-right"
        />
        <p className="text-[10px] text-gray-400 text-right mt-0.5">grams</p>
      </td>

      {/* Rate (NPR / 10g) */}
      <td className="px-2 py-2 w-28">
        <input
          id={`item-rate-${index}`}
          type="number"
          min="0"
          step="0.01"
          value={item.rate || ''}
          onChange={(e) => handleChange('rate', e.target.value)}
          placeholder="0.00"
          className="form-input text-xs py-1.5 text-right"
        />
        <p className="text-[10px] text-gray-400 text-right mt-0.5">per 10g</p>
      </td>

      {/* Making Charge */}
      <td className="px-2 py-2 w-28">
        <input
          id={`item-mc-${index}`}
          type="number"
          min="0"
          step="0.01"
          value={item.making_charge || ''}
          onChange={(e) => handleChange('making_charge', e.target.value)}
          placeholder="0.00"
          className="form-input text-xs py-1.5 text-right"
        />
      </td>

      {/* Discount */}
      <td className="px-2 py-2 w-24">
        <input
          id={`item-discount-${index}`}
          type="number"
          min="0"
          step="0.01"
          value={item.discount || ''}
          onChange={(e) => handleChange('discount', e.target.value)}
          placeholder="0.00"
          className="form-input text-xs py-1.5 text-right"
        />
      </td>

      {/* Line Total (auto-calculated, read-only) */}
      <td className="px-3 py-2 w-32 text-right">
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(item.line_total || 0)}
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5">auto-calc</p>
      </td>

      {/* Remove */}
      <td className="px-2 py-2 text-center w-8">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
            title="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default InvoiceItemRow;
