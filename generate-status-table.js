const fs = require('fs');
const path = require('path');

// Read data
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Build payment status table for 2026
const paymentStatus = {};

// Initialize table for active tenants
data.rooms.forEach(room => {
  if (room.current_tenant) {
    const currentTenant = room.tenants.find(t => t.status === 'aktif');
    if (currentTenant) {
      const paymentDate = currentTenant.move_in.split('/')[0];
      
      paymentStatus[room.room_number] = {
        room_number: room.room_number,
        tenant_name: room.current_tenant,
        payment_date: paymentDate,
        months: {
          1: false, 2: false, 3: false, 4: false, 5: false, 6: false,
          7: false, 8: false, 9: false, 10: false, 11: false, 12: false
        }
      };
    }
  }
});

// Mark paid months for 2026
const monthMap = {
  'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
  'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
};

data.payments.forEach(payment => {
  // Only 2026 payments
  if (payment.date.includes('2026')) {
    const room = paymentStatus[payment.room_number];
    if (room) {
      const month = monthMap[payment.period.toLowerCase()];
      if (month) {
        room.months[month] = true;
      }
    }
  }
});

// Generate HTML table
let tableHTML = `
<div class="status-table-container">
  <h2>📊 Status Pembayaran 2026</h2>
  <table class="status-table">
    <thead>
      <tr>
        <th>No Kamar</th>
        <th>Nama Penghuni</th>
        <th>Tgl Tagihan</th>
        <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
        <th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th>
      </tr>
    </thead>
    <tbody>
      ${Object.values(paymentStatus).sort((a, b) => a.room_number - b.room_number).map(room => `
        <tr>
          <td class="room-col">${room.room_number}</td>
          <td class="name-col">${room.tenant_name}</td>
          <td class="date-col">${room.payment_date}</td>
          ${[1,2,3,4,5,6,7,8,9,10,11,12].map(month => `
            <td class="status-col ${room.months[month] ? 'paid' : 'unpaid'}">
              ${room.months[month] ? '✓' : '-'}
            </td>
          `).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<style>
  .status-table-container {
    margin: 30px 0;
  }
  
  .status-table-container h2 {
    color: #333;
    margin-bottom: 20px;
  }
  
  .status-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    font-size: 0.9em;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  
  .status-table th,
  .status-table td {
    padding: 10px 8px;
    text-align: center;
    border: 1px solid #ddd;
  }
  
  .status-table th {
    background: #667eea;
    color: white;
    font-weight: bold;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .status-table tbody tr:hover {
    background: #f8f9fa;
  }
  
  .status-table .room-col {
    font-weight: bold;
    color: #667eea;
  }
  
  .status-table .name-col {
    text-align: left;
    font-weight: bold;
  }
  
  .status-table .date-col {
    color: #666;
  }
  
  .status-table .status-col {
    font-weight: bold;
    font-size: 1.2em;
  }
  
  .status-table .status-col.paid {
    background: #d4edda;
    color: #28a745;
  }
  
  .status-table .status-col.unpaid {
    background: #f8d7da;
    color: #dc3545;
  }
  
  @media (max-width: 768px) {
    .status-table {
      font-size: 0.75em;
    }
    
    .status-table th,
    .status-table td {
      padding: 6px 4px;
    }
  }
</style>
`;

// Save to file
const tablePath = path.join(__dirname, 'status-table.html');
fs.writeFileSync(tablePath, tableHTML);

console.log('✅ Payment status table generated!');
console.log(`📊 Active rooms: ${Object.keys(paymentStatus).length}`);
