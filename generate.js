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
    
    .payment-schedule {
      font-size: 0.85em;
      color: #667eea;
      font-weight: bold;
      background: #e8eaf6;
      padding: 5px 10px;
      border-radius: 5px;
      margin-top: 5px;
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
    
    .filter-controls select:focus {
      outline: none;
      border-color: #764ba2;
    }
    
    .reset-btn {
      padding: 8px 16px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    
    .reset-btn:hover {
      background: #c82333;
    }
    
    .period-filter {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    
    .period-filter label {
      font-weight: bold;
      color: #333;
    }
    
    .period-btn {
      padding: 8px 16px;
      background: #f8f9fa;
      color: #333;
      border: 2px solid #667eea;
      border-radius: 5px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .period-btn:hover {
      background: #667eea;
      color: white;
    }
    
    .period-btn.active {
      background: #667eea;
      color: white;
    }
    
    .year-toggle {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .year-btn {
      padding: 10px 20px;
      background: #f8f9fa;
      color: #333;
      border: 2px solid #667eea;
      border-radius: 5px;
      font-weight: bold;
      font-size: 1.1em;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .year-btn:hover {
      background: #667eea;
      color: white;
    }
    
    .year-btn.active {
      background: #667eea;
      color: white;
    }
    
    .status-table-wrapper {
      overflow-x: auto;
      margin: 20px 0;
    }
    
    .status-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 0.9em;
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
      font-size: 1.1em;
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
    
    .status-table .status-col.not-applicable {
      background: #e9ecef;
      color: #6c757d;
    }
    
    .payment-table-wrapper {
      overflow-x: auto;
      margin: 20px 0;
    }
    
    .payment-history-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 0.9em;
    }
    
    .payment-history-table th,
    .payment-history-table td {
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #ddd;
    }
    
    .payment-history-table th {
      background: #667eea;
      color: white;
      font-weight: bold;
      font-size: 1.1em;
      position: sticky;
      top: 0;
      z-index: 10;
      padding: 10px 12px;
    }
    
    .payment-history-table tbody tr:hover {
      background: #f8f9fa;
    }
    
    .payment-history-table td.amount {
      text-align: right;
      color: #28a745;
      font-weight: bold;
    }
    
    .payment-history-table td.method {
      text-align: center;
      color: #666;
      font-size: 0.85em;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 1.8em;
      }
      
      .stats {
        grid-template-columns: 1fr 1fr;
      }
      
      .payment-history-table {
        font-size: 0.75em;
      }
      
      .payment-history-table th,
      .payment-history-table td {
        padding: 8px 4px;
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
          ${data.rooms.map(room => {
            // Get current tenant info
            const currentTenant = room.tenants.find(t => t.status === 'aktif');
            const paymentDate = currentTenant ? currentTenant.move_in.split('/')[0] : '-';
            
            return `
            <div class="room-card ${room.current_tenant ? '' : 'vacant'}">
              <div class="room-number">Kamar ${room.room_number}</div>
              <div class="room-tenant">${room.current_tenant || 'Kosong'}</div>
              <div class="room-rate">${room.current_rate ? formatRupiah(room.current_rate) + '/bulan' : '-'}</div>
              ${currentTenant ? `<div class="payment-schedule">Bayar setiap tanggal ${paymentDate}</div>` : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title" onclick="toggleSection('status')">
        <span>📋 Tabel Pembayaran <span id="statusYear">2026</span></span>
        <span class="toggle-icon" id="status-icon">▼</span>
      </div>
      <div class="section-content" id="status-content">
        <div class="year-toggle">
          <button onclick="switchYear(2025)" class="year-btn" id="year-2025">2025</button>
          <button onclick="switchYear(2026)" class="year-btn active" id="year-2026">2026</button>
        </div>
        
        <div class="status-table-wrapper">
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
            <tbody id="statusTableBody">
              ${(() => {
                // Build payment status for 2026 (default)
                const paymentStatus = {};
                const monthMap = {
                  'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
                  'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
                };
                const year = 2026;
                
                // Initialize for active tenants
                data.rooms.forEach(room => {
                  if (room.current_tenant) {
                    const currentTenant = room.tenants.find(t => t.status === 'aktif');
                    if (currentTenant) {
                      const paymentDate = currentTenant.move_in.split('/')[0];
                      
                      // Parse move-in date
                      const moveInParts = currentTenant.move_in.split('/');
                      const moveInMonth = parseInt(moveInParts[1]);
                      const moveInYear = parseInt(moveInParts[2]);
                      
                      // Initialize months
                      const months = {};
                      for (let m = 1; m <= 12; m++) {
                        if (year < moveInYear) {
                          months[m] = null;
                        } else if (year === moveInYear && m < moveInMonth) {
                          months[m] = null;
                        } else {
                          months[m] = false;
                        }
                      }
                      
                      paymentStatus[room.room_number] = {
                        room_number: room.room_number,
                        tenant_name: room.current_tenant,
                        payment_date: paymentDate,
                        months: months
                      };
                    }
                  }
                });
                
                // Mark paid months for 2026
                data.payments.forEach(payment => {
                  if (payment.date.includes('2026')) {
                    const room = paymentStatus[payment.room_number];
                    if (room) {
                      const month = monthMap[payment.period.toLowerCase()];
                      if (month && room.months[month] !== null) room.months[month] = true;
                    }
                  }
                });
                
                return Object.values(paymentStatus).sort((a, b) => a.room_number - b.room_number).map(room => `
                  <tr data-room="${room.room_number}">
                    <td class="room-col">${room.room_number}</td>
                    <td class="name-col">${room.tenant_name}</td>
                    <td class="date-col">${room.payment_date}</td>
                    ${[1,2,3,4,5,6,7,8,9,10,11,12].map(month => {
                      const status = room.months[month];
                      if (status === null) {
                        return '<td class="status-col not-applicable" data-month="' + month + '">-</td>';
                      } else if (status === true) {
                        return '<td class="status-col paid" data-month="' + month + '">✓</td>';
                      } else {
                        return '<td class="status-col unpaid" data-month="' + month + '">X</td>';
                      }
                    }).join('')}
                  </tr>
                `).join('');
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title" onclick="toggleSection('payments')">
        <span>📋 Riwayat Pembayaran</span>
        <span class="toggle-icon" id="payments-icon">▼</span>
      </div>
      <div class="section-content" id="payments-content">
        <div class="filter-controls">
          <label for="filterTenant">Filter Penghuni:</label>
          <select id="filterTenant" onchange="filterPayments()">
            <option value="all">Semua Penghuni</option>
            ${data.tenants.sort((a, b) => a.tenant_number - b.tenant_number).map(tenant => `
              <option value="${tenant.tenant_number}">${tenant.tenant_number} - ${tenant.name}</option>
            `).join('')}
          </select>
          
          <label for="filterMonth">Filter Bulan:</label>
          <select id="filterMonth" onchange="filterPayments()">
            <option value="all">Semua Bulan</option>
            <option value="januari">Januari</option>
            <option value="februari">Februari</option>
            <option value="maret">Maret</option>
            <option value="april">April</option>
            <option value="mei">Mei</option>
            <option value="juni">Juni</option>
            <option value="juli">Juli</option>
            <option value="agustus">Agustus</option>
            <option value="september">September</option>
            <option value="oktober">Oktober</option>
            <option value="november">November</option>
            <option value="desember">Desember</option>
          </select>
          
          <button onclick="resetFilters()" class="reset-btn">Reset Filter</button>
        </div>
        
        <div class="period-filter">
          <label>Tampilkan:</label>
          <button onclick="filterByPeriod(1)" class="period-btn">1 Bulan</button>
          <button onclick="filterByPeriod(2)" class="period-btn">2 Bulan</button>
          <button onclick="filterByPeriod(3)" class="period-btn">3 Bulan</button>
          <button onclick="filterByPeriod(4)" class="period-btn active">4 Bulan</button>
          <button onclick="filterByPeriod(0)" class="period-btn">Semua</button>
        </div>
        
        <div class="payment-table-wrapper">
          <table class="payment-history-table">
            <thead>
              <tr>
                <th>Tgl Bayar</th>
                <th>Penghuni No</th>
                <th>Nama Penghuni</th>
                <th>Bulan</th>
                <th>Jumlah</th>
                <th>Metode Bayar</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${data.payments.map((payment, index) => {
                // Parse date to get timestamp
                const dateParts = payment.date.split(' ');
                const day = parseInt(dateParts[0]);
                const monthMap = {
                  'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3, 'Mei': 4, 'Juni': 5,
                  'Juli': 6, 'Agustus': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
                };
                const month = monthMap[dateParts[1]];
                const year = parseInt(dateParts[2]);
                const timestamp = new Date(year, month, day).getTime();
                
                return `
                <tr data-tenant="${payment.tenant_number}" data-month="${payment.period.toLowerCase()}" data-timestamp="${timestamp}">
                  <td>${formatDate(payment.date)}</td>
                  <td>${payment.tenant_number}</td>
                  <td>${payment.tenant_name}</td>
                  <td>${payment.period.charAt(0).toUpperCase() + payment.period.slice(1)}</td>
                  <td class="amount">${formatRupiah(payment.amount)}</td>
                  <td class="method">${payment.payment_method.toUpperCase()}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let currentPeriodMonths = 4; // Default 4 bulan
    let currentYear = 2026; // Default year
    
    // Embed payment data
    const paymentsData = ${JSON.stringify(data.payments)};
    const roomsData = ${JSON.stringify(data.rooms)};
    
    function toggleSection(sectionId) {
      const content = document.getElementById(sectionId + '-content');
      const icon = document.getElementById(sectionId + '-icon');
      
      content.classList.toggle('collapsed');
      icon.classList.toggle('collapsed');
    }
    
    function switchYear(year) {
      currentYear = year;
      
      // Update title
      document.getElementById('statusYear').textContent = year;
      
      // Update active button
      document.querySelectorAll('.year-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById('year-' + year).classList.add('active');
      
      // Rebuild table
      rebuildStatusTable(year);
    }
    
    function rebuildStatusTable(year) {
      const monthMap = {
        'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
        'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
      };
      
      const paymentStatus = {};
      
      // Initialize for active tenants
      roomsData.forEach(room => {
        if (room.current_tenant) {
          const currentTenant = room.tenants.find(t => t.status === 'aktif');
          if (currentTenant) {
            const paymentDate = currentTenant.move_in.split('/')[0];
            
            // Parse move-in date
            const moveInParts = currentTenant.move_in.split('/');
            const moveInDay = parseInt(moveInParts[0]);
            const moveInMonth = parseInt(moveInParts[1]);
            const moveInYear = parseInt(moveInParts[2]);
            
            // Initialize months (null = not applicable, false = unpaid, true = paid)
            const months = {};
            for (let m = 1; m <= 12; m++) {
              // Check if tenant was already living in this month
              if (year < moveInYear) {
                months[m] = null; // Belum masuk
              } else if (year === moveInYear && m < moveInMonth) {
                months[m] = null; // Belum masuk
              } else {
                months[m] = false; // Sudah masuk, belum bayar
              }
            }
            
            paymentStatus[room.room_number] = {
              room_number: room.room_number,
              tenant_name: room.current_tenant,
              payment_date: paymentDate,
              move_in_year: moveInYear,
              move_in_month: moveInMonth,
              months: months
            };
          }
        }
      });
      
      // Mark paid months for selected year
      paymentsData.forEach(payment => {
        if (payment.date.includes(year.toString())) {
          const room = paymentStatus[payment.room_number];
          if (room) {
            const month = monthMap[payment.period.toLowerCase()];
            if (month && room.months[month] !== null) {
              room.months[month] = true;
            }
          }
        }
      });
      
      // Rebuild table body
      const tbody = document.getElementById('statusTableBody');
      const rows = Object.values(paymentStatus).sort((a, b) => a.room_number - b.room_number).map(room => {
        const monthCells = [1,2,3,4,5,6,7,8,9,10,11,12].map(month => {
          const status = room.months[month];
          if (status === null) {
            // Belum masuk
            return '<td class="status-col not-applicable" data-month="' + month + '">-</td>';
          } else if (status === true) {
            // Sudah bayar
            return '<td class="status-col paid" data-month="' + month + '">✓</td>';
          } else {
            // Belum bayar
            return '<td class="status-col unpaid" data-month="' + month + '">X</td>';
          }
        }).join('');
        
        return '<tr data-room="' + room.room_number + '">' +
          '<td class="room-col">' + room.room_number + '</td>' +
          '<td class="name-col">' + room.tenant_name + '</td>' +
          '<td class="date-col">' + room.payment_date + '</td>' +
          monthCells +
          '</tr>';
      }).join('');
      
      tbody.innerHTML = rows;
    }
    
    function filterPayments() {
      const tenantFilter = document.getElementById('filterTenant').value;
      const monthFilter = document.getElementById('filterMonth').value;
      const rows = document.querySelectorAll('#paymentTableBody tr');
      
      // Get latest payment date
      let latestTimestamp = 0;
      rows.forEach(row => {
        const timestamp = parseInt(row.getAttribute('data-timestamp'));
        if (timestamp > latestTimestamp) {
          latestTimestamp = timestamp;
        }
      });
      
      // Calculate cutoff date (N months before latest)
      const cutoffDate = new Date(latestTimestamp);
      cutoffDate.setMonth(cutoffDate.getMonth() - currentPeriodMonths);
      const cutoffTimestamp = cutoffDate.getTime();
      
      rows.forEach(row => {
        const tenant = row.getAttribute('data-tenant');
        const month = row.getAttribute('data-month');
        const timestamp = parseInt(row.getAttribute('data-timestamp'));
        
        const tenantMatch = tenantFilter === 'all' || tenant === tenantFilter;
        const monthMatch = monthFilter === 'all' || month === monthFilter;
        const periodMatch = currentPeriodMonths === 0 || timestamp >= cutoffTimestamp;
        
        if (tenantMatch && monthMatch && periodMatch) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
    
    function filterByPeriod(months) {
      currentPeriodMonths = months;
      
      // Update active button
      document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      filterPayments();
    }
    
    function resetFilters() {
      document.getElementById('filterTenant').value = 'all';
      document.getElementById('filterMonth').value = 'all';
      filterPayments();
    }
    
    // Apply default 4 months filter on load
    window.addEventListener('DOMContentLoaded', () => {
      filterPayments();
    });
  </script>
</body>
</html>`;

const htmlPath = path.join(__dirname, 'index.html');
fs.writeFileSync(htmlPath, html);
console.log('✅ index.html generated successfully!');
