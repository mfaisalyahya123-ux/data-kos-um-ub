const fs = require('fs');
const path = require('path');

// Read data
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Build payment table
const paymentTable = {};

// Initialize table structure
data.tenants.forEach(tenant => {
  paymentTable[tenant.tenant_number] = {
    tenant_number: tenant.tenant_number,
    room_number: tenant.room_number,
    name: tenant.name,
    status: tenant.status,
    payments: {}
  };
});

// Populate payments
data.payments.forEach(payment => {
  const tenant = paymentTable[payment.tenant_number];
  if (tenant) {
    const month = payment.period.toLowerCase();
    if (!tenant.payments[month]) {
      tenant.payments[month] = [];
    }
    tenant.payments[month].push({
      date: payment.date,
      amount: payment.amount,
      method: payment.payment_method
    });
  }
});

// Get all unique months (sorted chronologically)
const monthOrder = [
  'januari', 'februari', 'maret', 'april', 'mei', 'juni',
  'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
];

const allMonths = new Set();
data.payments.forEach(p => allMonths.add(p.period.toLowerCase()));
const sortedMonths = Array.from(allMonths).sort((a, b) => {
  return monthOrder.indexOf(a) - monthOrder.indexOf(b);
});

// Generate HTML table
let tableHTML = `
<div class="table-container">
  <table class="payment-table">
    <thead>
      <tr>
        <th>Kode</th>
        <th>No Kamar</th>
        <th>Nama Penghuni</th>
        <th>Status</th>
        ${sortedMonths.map(month => `<th>${month.charAt(0).toUpperCase() + month.slice(1)}</th>`).join('')}
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(paymentTable).map(tenant => {
        const totalPayments = Object.values(tenant.payments).flat().reduce((sum, p) => sum + p.amount, 0);
        return `
          <tr class="${tenant.status === 'aktif' ? 'active-tenant' : 'inactive-tenant'}">
            <td>${tenant.tenant_number}</td>
            <td>${tenant.room_number}</td>
            <td>${tenant.name}</td>
            <td><span class="status-badge ${tenant.status}">${tenant.status}</span></td>
            ${sortedMonths.map(month => {
              const payments = tenant.payments[month] || [];
              if (payments.length === 0) {
                return '<td class="no-payment">-</td>';
              }
              const total = payments.reduce((sum, p) => sum + p.amount, 0);
              return `<td class="has-payment" title="${payments.map(p => p.date + ': Rp ' + p.amount.toLocaleString('id-ID')).join('\\n')}">Rp ${total.toLocaleString('id-ID')}</td>`;
            }).join('')}
            <td class="total-payment">Rp ${totalPayments.toLocaleString('id-ID')}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
</div>

<style>
  .table-container {
    overflow-x: auto;
    margin: 20px 0;
  }
  
  .payment-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    font-size: 0.9em;
  }
  
  .payment-table th,
  .payment-table td {
    padding: 12px 8px;
    text-align: left;
    border: 1px solid #ddd;
  }
  
  .payment-table th {
    background: #667eea;
    color: white;
    font-weight: bold;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .payment-table tbody tr:hover {
    background: #f8f9fa;
  }
  
  .active-tenant {
    background: #f0fff4;
  }
  
  .inactive-tenant {
    background: #f8f9fa;
    opacity: 0.7;
  }
  
  .status-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: bold;
  }
  
  .status-badge.aktif {
    background: #28a745;
    color: white;
  }
  
  .status-badge.keluar {
    background: #dc3545;
    color: white;
  }
  
  .no-payment {
    text-align: center;
    color: #ccc;
  }
  
  .has-payment {
    text-align: right;
    color: #28a745;
    font-weight: bold;
    cursor: help;
  }
  
  .total-payment {
    text-align: right;
    font-weight: bold;
    background: #f0f0f0;
    color: #667eea;
  }
  
  @media (max-width: 768px) {
    .payment-table {
      font-size: 0.75em;
    }
    
    .payment-table th,
    .payment-table td {
      padding: 8px 4px;
    }
  }
</style>
`;

// Save to file
const tablePath = path.join(__dirname, 'payment-table.html');
fs.writeFileSync(tablePath, tableHTML);

console.log('✅ Payment table generated!');
console.log(`📊 Months: ${sortedMonths.join(', ')}`);
console.log(`👥 Tenants: ${Object.keys(paymentTable).length}`);
