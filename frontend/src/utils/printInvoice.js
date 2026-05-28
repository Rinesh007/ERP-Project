// src/utils/printInvoice.js
// Opens a fully self-contained, print-ready invoice in a new window.
// The browser's "Save as PDF" option acts as the download/download button.

const COMPANY = {
  name:    'Professional Edge Global Pvt. Ltd.',
  tagline: 'Trusted Jewelry Management Solutions',
  address: 'Kathmandu, Nepal',
  phone:   '+977-000-000-0000',
  email:   'info@professionaledgeglobal.com',
  pan:     'PAN: 000000000',
};

// Base64 company logo (embedded for print reliability)
const LOGO_B64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCI+CiAgPCEtLSBHbG9iZSBjaXJjbGUgb3V0bGluZSAtLT4KICA8Y2lyY2xlIGN4PSI1MiIgY3k9IjUyIiByPSIzOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjIuNSIvPgoKICA8IS0tIEdsb2JlIGxhdGl0dWRlIGxpbmVzIC0tPgogIDxlbGxpcHNlIGN4PSI1MiIgY3k9IjUyIiByeD0iMTgiIHJ5PSIzOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxlbGxpcHNlIGN4PSI1MiIgY3k9IjUyIiByeD0iMzgiIHJ5PSIxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxsaW5lIHgxPSIxNCIgeTE9IjUyIiB4Mj0iOTAiIHkyPSI1MiIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgogIDxsaW5lIHgxPSI1MiIgeTE9IjE0IiB4Mj0iNTIiIHkyPSI5MCIgc3Ryb2tlPSIjNkI3MjgwIiBzdHJva2Utd2lkdGg9IjEuNSIvPgoKICA8IS0tIEJhciBjaGFydCBiYXJzIChuYXZ5IGJsdWUpIC0tPgogIDxyZWN0IHg9IjMzIiB5PSI2MiIgd2lkdGg9IjgiIGhlaWdodD0iMTQiIHJ4PSIxIiBmaWxsPSIjMUUzQThBIi8+CiAgPHJlY3QgeD0iNDQiIHk9IjUyIiB3aWR0aD0iOCIgaGVpZ2h0PSIyNCIgcng9IjEiIGZpbGw9IiMxRTNBOEEiLz4KICA8cmVjdCB4PSI1NSIgeT0iNDIiIHdpZHRoPSI4IiBoZWlnaHQ9IjM0IiByeD0iMSIgZmlsbD0iIzFFM0E4QSIvPgogIDxyZWN0IHg9IjY2IiB5PSIzMCIgd2lkdGg9IjgiIGhlaWdodD0iNDYiIHJ4PSIxIiBmaWxsPSIjMUUzQThBIi8+CgogIDwhLS0gQXJyb3cgbGluZSBnb2luZyB1cC1yaWdodCAtLT4KICA8bGluZSB4MT0iMjgiIHkxPSI3NiIgeDI9Ijg1IiB5Mj0iMjAiIHN0cm9rZT0iIzFFM0E4QSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICA8IS0tIEFycm93IGhlYWQgLS0+CiAgPHBvbHlnb24gcG9pbnRzPSI4NSwyMCA3MiwyMiA4MywzMSIgZmlsbD0iIzFFM0E4QSIvPgo8L3N2Zz4K';

// ── helpers ────────────────────────────────────────────────────────────────

function fmt(amount) {
  const n = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-NP', {
    style: 'currency', currency: 'NPR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-NP', {
    year: 'numeric', month: 'long', day: '2-digit',
  }).format(new Date(dateStr));
}

function row(label, value, cls = '') {
  return `
    <tr>
      <td style="padding:5px 8px;color:#555;font-size:12px;">${label}</td>
      <td style="padding:5px 8px;text-align:right;font-size:12px;${cls}">${value}</td>
    </tr>`;
}

// ── main function ──────────────────────────────────────────────────────────

export function printInvoice(invoice) {
  if (!invoice) return;

  const items = invoice.items || [];

  const itemRows = items.map((item, i) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:8px;color:#888;font-size:11px;">${i + 1}</td>
      <td style="padding:8px;">
        <span style="font-weight:600;font-size:12px;color:#1a1a1a;">${item.item_name || '—'}</span>
        ${item.product_name ? `<br><span style="font-size:10px;color:#aaa;">${item.product_code} — ${item.product_name}</span>` : ''}
      </td>
      <td style="padding:8px;text-align:right;font-size:12px;">${parseFloat(item.weight || 0).toFixed(3)} g</td>
      <td style="padding:8px;text-align:right;font-size:12px;">${fmt(item.rate)}</td>
      <td style="padding:8px;text-align:right;font-size:12px;">${fmt(item.making_charge)}</td>
      <td style="padding:8px;text-align:right;font-size:12px;color:#16a34a;">
        ${parseFloat(item.discount) > 0 ? `−${fmt(item.discount)}` : '—'}
      </td>
      <td style="padding:8px;text-align:right;font-weight:700;font-size:12px;color:#1a1a1a;">${fmt(item.line_total)}</td>
    </tr>`).join('');

  const kycBadge = invoice.kyc_required
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:8px 12px;margin-bottom:16px;font-size:11px;color:#92400e;">
        ⚠ KYC Required — Transaction ≥ NPR 5,00,000. Customer KYC documentation required.
       </div>`
    : '';

  const balanceRow = parseFloat(invoice.payment_received) > 0 ? `
    ${row('Amount Paid', fmt(invoice.payment_received))}
    ${row(
      parseFloat(invoice.balance) < 0 ? 'Balance Due' : 'Change',
      parseFloat(invoice.balance) < 0
        ? `−${fmt(Math.abs(invoice.balance))}`
        : fmt(invoice.balance),
      parseFloat(invoice.balance) < 0 ? 'color:#dc2626;font-weight:700;' : 'color:#16a34a;font-weight:700;'
    )}` : '';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1a1a1a;
      font-size: 13px;
      line-height: 1.5;
    }
    @page {
      size: A4;
      margin: 18mm 15mm;
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page { box-shadow: none; margin: 0; max-width: 100%; }
    }
    .page {
      max-width: 780px;
      margin: 30px auto;
      background: #fff;
      padding: 0;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 28px 32px 24px;
      background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
      color: #fff;
      border-radius: 10px 10px 0 0;
    }
    .company-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-gem {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .company-name { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .company-sub  { font-size: 11px; opacity: 0.75; margin-top: 2px; }
    .invoice-badge {
      text-align: right;
    }
    .invoice-label { font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px; }
    .invoice-number { font-size: 22px; font-weight: 700; font-family: monospace; margin-top: 2px; }
    .invoice-date   { font-size: 11px; opacity: 0.75; margin-top: 3px; }

    /* ── Body ── */
    .body { padding: 28px 32px; }

    /* ── Info grid ── */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .info-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .info-box-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 8px;
    }
    .info-name  { font-size: 14px; font-weight: 700; color: #1e293b; }
    .info-line  { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* ── Items table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .items-table thead tr {
      background: #1e3a5f;
      color: #fff;
    }
    .items-table thead th {
      padding: 10px 8px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .items-table thead th.right { text-align: right; }
    .items-table tbody tr:nth-child(even) { background: #f8fafc; }

    /* ── Totals ── */
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 28px;
    }
    .totals-table {
      width: 300px;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .totals-grand {
      background: #1e3a5f;
      color: #fff;
    }
    .totals-grand td {
      padding: 10px 8px !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #fff !important;
    }

    /* ── Footer ── */
    .footer {
      border-top: 2px solid #e2e8f0;
      padding: 20px 32px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-radius: 0 0 10px 10px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-gem {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #1e3a5f, #2563eb);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 14px;
    }
    .footer-name  { font-size: 13px; font-weight: 700; color: #1e3a5f; }
    .footer-tag   { font-size: 10px; color: #94a3b8; }
    .footer-info  { text-align: right; font-size: 10px; color: #94a3b8; line-height: 1.8; }

    /* ── Print button (hidden on print) ── */
    .print-actions {
      max-width: 780px;
      margin: 0 auto 20px;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    .btn-print {
      background: #2563eb;
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover { background: #1d4ed8; }
    .btn-close {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
      padding: 10px 18px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-close:hover { background: #e2e8f0; }
  </style>
</head>
<body>

  <!-- Actions bar (hidden on print) -->
  <div class="print-actions no-print">
    <button class="btn-close" onclick="window.close()">✕ Close</button>
    <button class="btn-print" onclick="window.print()">
      🖨 Print / Save as PDF
    </button>
  </div>

  <div class="page">

    <!-- ── HEADER ── -->
    <div class="header">
      <div class="company-logo">
        <img src="${LOGO_B64}" alt="Professional Edge Global" style="width:54px;height:54px;object-fit:contain;border-radius:10px;background:#ffffff;padding:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
        <div>
          <div class="company-name">${COMPANY.name}</div>
          <div class="company-sub">${COMPANY.tagline}</div>
        </div>
      </div>
      <div class="invoice-badge">
        <div class="invoice-label">Invoice</div>
        <div class="invoice-number">${invoice.invoice_number}</div>
        <div class="invoice-date">Date: ${fmtDate(invoice.invoice_date)}</div>
      </div>
    </div>

    <!-- ── BODY ── -->
    <div class="body">

      ${kycBadge}

      <!-- Bill To / Company Info -->
      <div class="info-grid">
        <div class="info-box">
          <div class="info-box-label">Bill To</div>
          <div class="info-name">${invoice.customer_name || '—'}</div>
          <div class="info-line">${invoice.customer_code || ''}</div>
          ${invoice.phone      ? `<div class="info-line">📞 ${invoice.phone}</div>` : ''}
          ${invoice.pan_number ? `<div class="info-line">PAN: ${invoice.pan_number}</div>` : ''}
          ${invoice.address    ? `<div class="info-line">📍 ${invoice.address}</div>` : ''}
        </div>
        <div class="info-box">
          <div class="info-box-label">Issued By</div>
          <div class="info-name">${COMPANY.name}</div>
          <div class="info-line">${COMPANY.address}</div>
          <div class="info-line">${COMPANY.phone}</div>
          <div class="info-line">${COMPANY.email}</div>
          <div class="info-line">${COMPANY.pan}</div>
        </div>
      </div>

      <!-- Items -->
      <table class="items-table">
        <thead>
          <tr>
            <th style="width:30px;">#</th>
            <th>Item Description</th>
            <th class="right" style="width:80px;">Weight (g)</th>
            <th class="right" style="width:90px;">Rate/10g</th>
            <th class="right" style="width:90px;">Making</th>
            <th class="right" style="width:80px;">Discount</th>
            <th class="right" style="width:100px;">Line Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <!-- Totals -->
      <div class="totals-wrap">
        <table class="totals-table">
          <tbody>
            ${row('Subtotal', fmt(invoice.subtotal))}
            ${parseFloat(invoice.vat_amount) > 0
              ? row('VAT (13%)', fmt(invoice.vat_amount), 'color:#d97706;')
              : ''}
            ${parseFloat(invoice.extra_tax) > 0
              ? row('Service charge (2%)', fmt(invoice.extra_tax), 'color:#2563eb;')
              : ''}
            ${parseFloat(invoice.adjustment_amount) > 0
              ? row('Adjustment (−)', `−${fmt(invoice.adjustment_amount)}`, 'color:#16a34a;')
              : ''}
            <tr class="totals-grand">
              <td style="padding:10px 8px;font-size:13px;font-weight:700;">Grand Total</td>
              <td style="padding:10px 8px;text-align:right;font-size:14px;font-weight:700;">${fmt(invoice.grand_total)}</td>
            </tr>
            ${balanceRow}
          </tbody>
        </table>
      </div>

      <!-- Signature line -->
      <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:20px;border-top:1px dashed #e2e8f0;">
        <div style="text-align:center;width:180px;">
          <div style="border-top:1px solid #94a3b8;padding-top:6px;font-size:11px;color:#94a3b8;">Customer Signature</div>
        </div>
        <div style="text-align:center;width:180px;">
          <div style="border-top:1px solid #94a3b8;padding-top:6px;font-size:11px;color:#94a3b8;">Authorised Signature</div>
        </div>
      </div>

    </div><!-- /body -->

    <!-- ── FOOTER ── -->
    <div class="footer">
      <div class="footer-brand">
        <img src="${LOGO_B64}" alt="Professional Edge Global" style="width:38px;height:38px;object-fit:contain;border-radius:7px;background:#f1f5f9;padding:4px;" />
        <div>
          <div class="footer-name">${COMPANY.name}</div>
          <div class="footer-tag">${COMPANY.tagline}</div>
        </div>
      </div>
      <div class="footer-info">
        <div>${COMPANY.address} &nbsp;|&nbsp; ${COMPANY.phone}</div>
        <div>${COMPANY.email} &nbsp;|&nbsp; ${COMPANY.pan}</div>
        <div style="margin-top:4px;color:#cbd5e1;">
          Generated on ${new Date().toLocaleString('en-NP')} &nbsp;·&nbsp; ${COMPANY.name}
        </div>
      </div>
    </div>

  </div><!-- /page -->

</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    alert('Pop-up blocked. Please allow pop-ups for this site to print invoices.');
    return;
  }
  win.document.write(html);
  win.document.close();
  // Auto-trigger print dialog after a short delay so styles load
  setTimeout(() => win.print(), 400);
}
