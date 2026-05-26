const fs = require('fs');
const path = require('path');

// Read UM data only
const dataUM = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-um.json'), 'utf8'));

// Helper: Format currency
function formatRupiah(amount) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Generate simple HTML
const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Kos UM - Riwayat Pembayaran</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      color: white;
      margin-bottom: 30px;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 1.2em;
      opacity: 0.9;
    }
    
    .section {
      background: white;
      border-radius: 15px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .section-title {
      font-size: 1.5em;
      margin-bottom: 20px;
      color: #333;
    }
    
    .filter-controls {
      display: flex;
      gap: 15px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    
    .filter-controls label {
      font-weight: bold;
      color: #333;
    }
    
    .filter-controls select {
      padding: 8px 12px;
      border: 2px solid #667eea;
      border-radius: 5px;
      font-size: 0.9em;
      background: white;
      cursor: pointer;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    th {
      background: #667eea;
      color: white;
      font-weight: bold;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    .amount {
      font-weight: bold;
      color: #28a745;
      text-align: right;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 1.8em;
      }
      
      table {
        font-size: 0.85em;
      }
      
      th, td {
        padding: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>💰 Data Kos UM</h1>
      <p class="subtitle">Riwayat Pembayaran</p>
    </header>
    
    <div class="section">
      <div class="section-title">📊 Riwayat Pembayaran</div>
      
      <div class="filter-controls">
        <label>Filter Kamar:</label>
        <select id="room-filter" onchange="filterPayments()">
          <option value="">Semua Kamar</option>
          ${dataUM.rooms.map(r => `<option value="${r.room_number}">Kamar ${r.room_number}</option>`).join('')}
        </select>
        
        <label>Filter Bulan:</label>
        <select id="month-filter" onchange="filterPayments()">
          <option value="">Semua Bulan</option>
          ${[...new Set(dataUM.payments.map(p => p.period))].map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kamar</th>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Via</th>
            <th>Periode</th>
          </tr>
        </thead>
        <tbody id="payments-tbody">
          ${dataUM.payments.map(p => `
            <tr data-room="${p.room_number}" data-period="${p.period}">
              <td>${p.date}</td>
              <td>Kamar ${p.room_number}</td>
              <td>${p.tenant_name}</td>
              <td class="amount">${formatRupiah(p.amount)}</td>
              <td>${p.payment_method}</td>
              <td>${p.period}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  </div>
  
  <script>
    function filterPayments() {
      const roomFilter = document.getElementById('room-filter').value;
      const monthFilter = document.getElementById('month-filter').value;
      
      const rows = document.querySelectorAll('#payments-tbody tr');
      rows.forEach(row => {
        const room = row.getAttribute('data-room');
        const period = row.getAttribute('data-period');
        
        const matchRoom = !roomFilter || room === roomFilter;
        const matchMonth = !monthFilter || period === monthFilter;
        
        if (matchRoom && matchMonth) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

// Write HTML
fs.writeFileSync(path.join(__dirname, 'index.html'), html);

console.log('✅ Simple index.html generated!');
console.log(`📊 Total payments: ${dataUM.payments.length}`);
