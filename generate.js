const fs = require('fs');
const path = require('path');

// Read data
const dataPath = path.join(__dirname, 'data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Helper: Format currency
function formatRupiah(amount) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Helper: Format date
function formatDate(dateStr) {
  return dateStr;
}

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Data Kos UM/UB - Keuangan</title>
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
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
    }
    
    .stat-label {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 10px;
    }
    
    .stat-value {
      font-size: 2em;
      font-weight: bold;
      color: #667eea;
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
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .section-title:hover {
      color: #667eea;
    }
    
    .toggle-icon {
      font-size: 0.8em;
      transition: transform 0.3s ease;
    }
    
    .toggle-icon.collapsed {
      transform: rotate(-90deg);
    }
    
    .section-content {
      max-height: 2000px;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .section-content.collapsed {
      max-height: 0;
    }
    
    .room-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .room-card {
      background: #f8f9fa;
      border-radius: 10px;
      padding: 15px;
      border-left: 4px solid #667eea;
    }
    
    .room-card.vacant {
      border-left-color: #dc3545;
      opacity: 0.7;
    }
    
    .room-number {
      font-size: 1.5em;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 5px;
    }
    
    .room-tenant {
      font-size: 0.9em;
      color: #666;
      margin-bottom: 10px;
    }
    
    .room-rate {
      font-size: 1.1em;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }
    
    .room-income {
      font-size: 0.9em;
      color: #28a745;
      font-weight: bold;
    }
    
    .tenant-history {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-size: 0.85em;
    }
    
    .tenant-item {
      padding: 5px 0;
      color: #666;
    }
    
    .tenant-item.active {
      color: #28a745;
      font-weight: bold;
    }
    
    .tenant-item.inactive {
      color: #999;
      text-decoration: line-through;
    }
    
    .payment-list {
      display: grid;
      gap: 10px;
    }
    
    .payment-item {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      display: grid;
      grid-template-columns: auto 1fr auto auto;
      gap: 15px;
      align-items: center;
    }
    
    .payment-date {
      font-weight: bold;
      color: #667eea;
    }
    
    .payment-info {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .payment-tenant {
      font-weight: bold;
      color: #333;
    }
    
    .payment-period {
      font-size: 0.9em;
      color: #666;
    }
    
    .payment-amount {
      font-size: 1.2em;
      font-weight: bold;
      color: #28a745;
    }
    
    .payment-method {
      font-size: 0.9em;
      color: #666;
      text-transform: uppercase;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 1.8em;
      }
      
      .stats {
        grid-template-columns: 1fr 1fr;
      }
      
      .payment-item {
        grid-template-columns: 1fr;
        gap: 10px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>💰 Data Kos UM/UB</h1>
      <p class="subtitle">Monitoring Keuangan & Pembayaran</p>
    </header>
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Total Kamar</div>
        <div class="stat-value">${data.total_rooms}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Kamar Terisi</div>
        <div class="stat-value">${data.summary.occupied_rooms}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Penghuni</div>
        <div class="stat-value">${data.summary.total_tenants}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Penghuni Aktif</div>
        <div class="stat-value">${data.summary.active_tenants}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Pemasukan</div>
        <div class="stat-value">${formatRupiah(data.summary.total_income)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Transaksi</div>
        <div class="stat-value">${data.payments.length}</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title" onclick="toggleSection('rooms')">
        <span>🏠 Daftar Kamar (${data.total_rooms} Kamar)</span>
        <span class="toggle-icon" id="rooms-icon">▼</span>
      </div>
      <div class="section-content" id="rooms-content">
        <div class="room-grid">
          ${data.rooms.map(room => `
            <div class="room-card ${room.current_tenant ? '' : 'vacant'}">
              <div class="room-number">Kamar ${room.room_number}</div>
              <div class="room-tenant">${room.current_tenant || 'Kosong'}</div>
              <div class="room-rate">${room.current_rate ? formatRupiah(room.current_rate) + '/bulan' : '-'}</div>
              <div class="room-income">Total: ${formatRupiah(room.total_income)}</div>
              ${room.tenants.length > 1 ? `
                <div class="tenant-history">
                  <strong>Riwayat Penghuni:</strong>
                  ${room.tenants.map(t => `
                    <div class="tenant-item ${t.status === 'aktif' ? 'active' : 'inactive'}">
                      ${t.name} (${t.move_in}${t.move_out ? ' - ' + t.move_out : ''})
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title" onclick="toggleSection('payments')">
        <span>📋 Riwayat Pembayaran</span>
        <span class="toggle-icon" id="payments-icon">▼</span>
      </div>
      <div class="section-content" id="payments-content">
        <div class="payment-list">
          ${data.payments.map(payment => `
            <div class="payment-item">
              <div class="payment-date">${formatDate(payment.date)}</div>
              <div class="payment-info">
                <div class="payment-tenant">Kamar ${payment.room_number} - ${payment.tenant_name}</div>
                <div class="payment-period">Periode: ${payment.period} | Penghuni #${payment.tenant_number}</div>
              </div>
              <div class="payment-amount">${formatRupiah(payment.amount)}</div>
              <div class="payment-method">${payment.payment_method}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function toggleSection(sectionId) {
      const content = document.getElementById(sectionId + '-content');
      const icon = document.getElementById(sectionId + '-icon');
      
      content.classList.toggle('collapsed');
      icon.classList.toggle('collapsed');
    }
  </script>
</body>
</html>`;

const htmlPath = path.join(__dirname, 'index.html');
fs.writeFileSync(htmlPath, html);
console.log('✅ index.html generated successfully!');
