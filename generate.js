const fs = require('fs');
const path = require('path');

// Read both datasets
const dataUM = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-um.json'), 'utf8'));
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

// Helper: Format currency
function formatRupiah(amount) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Generate timestamp
const timestamp = new Date().toISOString();

// Generate HTML with toggle and payment table
const html = `<!DOCTYPE html>
<!-- Generated: ${timestamp} -->
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Keuangan Kos UM/UB v1.2</title>
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
    
    /* Toggle Switch */
    .toggle-container {
      display: flex;
      justify-content: center;
      margin-bottom: 30px;
    }
    
    .toggle-switch {
      background: white;
      border-radius: 50px;
      padding: 5px;
      display: flex;
      gap: 5px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    
    .toggle-btn {
      padding: 12px 30px;
      border: none;
      border-radius: 50px;
      font-size: 1.1em;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s ease;
      background: transparent;
      color: #666;
    }
    
    .toggle-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .toggle-btn:hover:not(.active) {
      background: #f0f0f0;
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
      max-height: none;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .section-content.collapsed {
      max-height: 0;
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
    
    /* Building Groups (Kos UB) */
    .building-group {
      margin-bottom: 15px;
    }
    
    .building-header {
      background: white;
      padding: 15px 20px;
      border-radius: 12px;
      font-size: 1.2em;
      font-weight: bold;
      color: #333;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      margin-bottom: 5px;
    }
    
    .building-header:hover {
      background: #667eea;
      color: white;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
    }
    
    .building-content {
      max-height: none;
      overflow: hidden;
      transition: max-height 0.4s ease, padding 0.4s ease;
      padding: 15px 0;
    }
    
    .building-content.collapsed {
      max-height: 0;
      padding: 0;
    }
    
    /* Room Cards */
    .room-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .room-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      padding: 0;
      transition: all 0.3s ease;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .room-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.3);
    }
    
    .room-card.empty {
      background: linear-gradient(135deg, #999 0%, #666 100%);
      opacity: 0.8;
    }
    
    .room-card-header {
      background: rgba(255, 255, 255, 0.95);
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid rgba(102, 126, 234, 0.3);
    }
    
    .room-card.empty .room-card-header {
      border-bottom-color: rgba(153, 153, 153, 0.3);
    }
    
    .room-number {
      font-size: 1.5em;
      font-weight: bold;
      color: #333;
    }
    
    .room-status {
      font-size: 0.9em;
      font-weight: 600;
      padding: 5px 15px;
      border-radius: 20px;
      background: #28a745;
      color: white;
    }
    
    .room-card.empty .room-status {
      background: #dc3545;
    }
    
    .room-card-body {
      padding: 20px;
      color: white;
    }
    
    .room-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .room-info:last-child {
      border-bottom: none;
    }
    
    .room-info.total {
      margin-top: 10px;
      padding-top: 15px;
      border-top: 2px solid rgba(255, 255, 255, 0.3);
      border-bottom: none;
    }
    
    .info-label {
      font-size: 0.9em;
      opacity: 0.9;
      font-weight: 500;
    }
    
    .info-value {
      font-weight: bold;
      font-size: 1.1em;
      text-align: right;
    }
    
    .info-value.amount {
      color: #ffd700;
      font-size: 1.2em;
    }
    
    @media (max-width: 768px) {
      .room-cards-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .month-format-toggle {
      margin-bottom: 15px;
    }
    
    .month-format-toggle label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95em;
      color: #333;
      cursor: pointer;
    }
    
    .month-format-toggle input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
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
    
    .status-table .status-col.not-applicable,
    .status-table .status-col.not-due {
      background: #e9ecef;
      color: #6c757d;
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
      <h1 id="page-title">💰 Data Keuangan Kos UB <span style="font-size: 0.5em; opacity: 0.7;">v3</span></h1>
      <p class="subtitle">Monitoring Keuangan & Pembayaran</p>
    </header>
    
    <!-- Toggle Switch -->
    <div class="toggle-container">
      <div class="toggle-switch">
        <button class="toggle-btn" onclick="switchKos('um')">🏠 Kos UM</button>
        <button class="toggle-btn active" onclick="switchKos('ub')">🏢 Kos UB</button>
      </div>
    </div>
    
    <!-- Tabel Pembayaran -->
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
        
        <div class="month-format-toggle">
          <label>
            <input type="checkbox" id="monthFormatToggle" onchange="toggleMonthFormat()">
            Tampilkan nama bulan
          </label>
        </div>
        
        <div class="status-table-wrapper">
          <table class="status-table" id="statusTable">
            <thead>
              <tr>
                <th>No Kamar</th>
                <th>Nama Penghuni</th>
                <th>Jatuh Tempo</th>
                <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th>
                <th>7</th><th>8</th><th>9</th><th>10</th><th>11</th><th>12</th>
              </tr>
            </thead>
            <tbody id="statusTableBody">
              <!-- Will be populated by JavaScript -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Daftar Kamar -->
    <div class="section">
      <div class="section-title" onclick="toggleSection('rooms')">
        <span>🏠 Daftar Kamar & Status Penghuni</span>
        <span class="toggle-icon" id="rooms-icon">▼</span>
      </div>
      <div class="section-content" id="rooms-content">
        <div class="room-cards-grid" id="rooms-grid">
          <!-- Will be populated by JavaScript -->
        </div>
      </div>
    </div>
    
    <!-- Riwayat Pembayaran -->
    <div class="section">
      <div class="section-title" onclick="toggleSection('payments')">
        <span>📊 Riwayat Pembayaran</span>
        <span class="toggle-icon" id="payments-icon">▼</span>
      </div>
      <div class="section-content" id="payments-content">
        <!-- Quick Period Filter -->
        <div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">
          <label style="font-weight: bold; color: #333;">Periode:</label>
          <button class="period-btn" onclick="quickFilter('all')">Semua</button>
          <button class="period-btn" onclick="quickFilter(1)">1 Bulan</button>
          <button class="period-btn" onclick="quickFilter(3)">3 Bulan</button>
          <button class="period-btn" onclick="quickFilter(6)">6 Bulan</button>
        </div>
        
        <div class="filter-controls">
          <label>Kamar:</label>
          <select id="room-filter" onchange="filterPayments()">
            <option value="">Semua</option>
          </select>
          
          <label>Nama:</label>
          <select id="tenant-filter" onchange="filterPayments()">
            <option value="">Semua</option>
          </select>
          
          <label>Tahun:</label>
          <select id="year-filter" onchange="filterPayments()">
            <option value="">Semua</option>
          </select>
          
          <label>Bulan:</label>
          <select id="month-filter" onchange="filterPayments()">
            <option value="">Semua</option>
          </select>
          
          <label>Urutkan:</label>
          <select id="sort-filter" onchange="filterPayments()">
            <option value="date-desc">Terbaru</option>
            <option value="date-asc">Terlama</option>
            <option value="amount-desc">Jumlah Tertinggi</option>
            <option value="amount-asc">Jumlah Terendah</option>
            <option value="room-asc">Kamar (A-Z)</option>
          </select>
          
          <button class="reset-btn" onclick="resetFilters()">Reset</button>
          <span id="result-count" style="margin-left: 15px; color: #666; font-weight: bold;"></span>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kamar</th>
              <th>No Penghuni</th>
              <th>Nama</th>
              <th>Jumlah</th>
              <th>Via</th>
              <th>Periode</th>
            </tr>
          </thead>
          <tbody id="payments-tbody">
            <!-- Will be populated by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <script>
    // Embedded data
    const dataUM = ${JSON.stringify(dataUM)};
    const dataUB = ${JSON.stringify(dataUB)};
    
    let currentKos = 'ub';
    let currentData = dataUB;
    let currentYear = 2026;
    
    // Parse date (support multiple formats)
    function parseDate(dateStr) {
      if (!dateStr || typeof dateStr !== 'string') return new Date(0);
      
      // Format: DD/MM/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
      }
      
      // Format: DD Bulan YYYY (e.g., "02 Mei 2026")
      const monthMap = {
        'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
        'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
      };
      
      const parts = dateStr.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = monthMap[parts[1].toLowerCase()];
        const year = parseInt(parts[2]);
        if (!isNaN(day) && month !== undefined && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      
      return new Date(0);
    }
    
    // Extract year from date string
    function extractYear(dateStr) {
      if (!dateStr) return '';
      if (dateStr.includes('/')) {
        return dateStr.split('/')[2] || '';
      }
      // Format: DD Bulan YYYY
      const parts = dateStr.split(' ');
      return parts.length === 3 ? parts[2] : '';
    }
    
    // Initialize
    function init() {
      renderPaymentTable();
      renderRoomsList();
      renderPaymentHistory();
      populateFilters();
    }
    
    // Switch between UM and UB
    function switchKos(kos) {
      currentKos = kos;
      currentData = kos === 'um' ? dataUM : dataUB;
      
      // Update title
      const version = '<span style="font-size: 0.5em; opacity: 0.7;">v1.2.0</span>';
      document.getElementById('page-title').innerHTML = 
        kos === 'um' ? '💰 Data Keuangan Kos UM <span style="font-size: 0.5em; opacity: 0.7;">v3</span>' : '💰 Data Keuangan Kos UB <span style="font-size: 0.5em; opacity: 0.7;">v3</span>';
      
      // Update toggle buttons
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Re-render
      renderPaymentTable();
      renderRoomsList();
      renderPaymentHistory();
      populateFilters();
    }
    
    // Switch year
    function switchYear(year) {
      currentYear = year;
      document.getElementById('statusYear').textContent = year;
      
      document.querySelectorAll('.year-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById('year-' + year).classList.add('active');
      
      renderPaymentTable();
    }
    
    // Toggle month format
    function toggleMonthFormat() {
      const checked = document.getElementById('monthFormatToggle').checked;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      const headers = document.querySelectorAll('#statusTable thead th');
      for (let i = 3; i < 15; i++) {
        headers[i].textContent = checked ? monthNames[i - 3] : (i - 2);
      }
    }
    
    // Render payment table
    function renderPaymentTable() {
      const monthMap = {
        'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6,
        'juli': 7, 'agustus': 8, 'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
      };
      
      const paymentStatus = {};
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentDay = now.getDate();
      
      // Initialize for active tenants
      currentData.rooms.forEach(room => {
        if (room.current_tenant) {
          const currentTenant = room.tenants.find(t => t.status === 'aktif');
          if (currentTenant) {
            // Parse move_in (supports DD/MM/YYYY and "DD Bulan YYYY")
            let moveInDay, moveInMonth, moveInYear;
            if (currentTenant.move_in.includes('/')) {
              const parts = currentTenant.move_in.split('/');
              moveInDay = parseInt(parts[0]);
              moveInMonth = parseInt(parts[1]);
              moveInYear = parseInt(parts[2]);
            } else {
              const parts = currentTenant.move_in.split(' ');
              moveInDay = parseInt(parts[0]);
              moveInMonth = monthMap[parts[1].toLowerCase()];
              moveInYear = parseInt(parts[2]);
            }
            const paymentDate = moveInDay;
            
            const months = {};
            for (let m = 1; m <= 12; m++) {
              if (currentYear < moveInYear) {
                months[m] = null;
              } else if (currentYear === moveInYear && m < moveInMonth) {
                months[m] = null;
              } else {
                if (currentYear === now.getFullYear()) {
                  if (m > currentMonth) {
                    months[m] = 'not-due';
                  } else if (m === currentMonth && currentDay < paymentDate) {
                    months[m] = 'not-due';
                  } else {
                    months[m] = false;
                  }
                } else if (currentYear > now.getFullYear()) {
                  months[m] = 'not-due';
                } else {
                  months[m] = false;
                }
              }
            }
            
            paymentStatus[room.room_number] = {
              room_number: room.room_number,
              tenant_name: room.current_tenant,
              tenant_number: currentTenant.tenant_number,
              payment_date: paymentDate,
              months: months
            };
          }
        }
      });
      
      // Mark paid months
      currentData.payments.forEach(payment => {
        const periodParts = payment.period.toLowerCase().split(' ');
        const periodYear = parseInt(periodParts[periodParts.length - 1]);
        if (periodYear === currentYear) {
          // Find room by tenant_number instead of room_number
          const room = Object.values(paymentStatus).find(r => r.tenant_number === payment.tenant_number);
          if (room) {
            const periodMonth = payment.period.toLowerCase().split(' ')[0];
            const month = monthMap[periodMonth];
            if (month && room.months[month] !== null) {
              room.months[month] = true;
            }
          }
        }
      });
      
      // Generate table rows
      const tbody = document.getElementById('statusTableBody');
      const rows = Object.values(paymentStatus).sort((a, b) => a.room_number - b.room_number).map(room => {
        const nextDue = new Date(now.getFullYear(), now.getMonth(), room.payment_date);
        if (nextDue < now) {
          nextDue.setMonth(nextDue.getMonth() + 1);
        }
        const daysUntil = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
        
        let html = '<tr>';
        html += \`<td class="room-col">\${room.room_number}</td>\`;
        html += \`<td class="name-col">\${room.tenant_name}</td>\`;
        html += \`<td class="date-col">\${room.payment_date} (\${daysUntil} hari)</td>\`;
        
        for (let m = 1; m <= 12; m++) {
          const status = room.months[m];
          if (status === null) {
            html += '<td class="status-col not-applicable">-</td>';
          } else if (status === 'not-due') {
            html += '<td class="status-col not-due">-</td>';
          } else if (status === true) {
            html += '<td class="status-col paid">✓</td>';
          } else {
            html += '<td class="status-col unpaid">X</td>';
          }
        }
        
        html += '</tr>';
        return html;
      }).join('');
      
      tbody.innerHTML = rows;
    }
    
    // Render rooms list as cards
    function renderRoomsList() {
      const rooms = currentData.rooms.sort((a, b) => a.room_number - b.room_number);
      
      function roomCard(room) {
        const currentTenant = room.tenants.find(t => t.status === 'aktif');
        const paymentDate = currentTenant ? currentTenant.move_in.split('/')[0] : '-';
        const isEmpty = !room.current_tenant;
        let tenantIncome = 0;
        if (room.current_tenant) {
          tenantIncome = currentData.payments
            .filter(p => p.room_number === room.room_number && p.tenant_name === room.current_tenant)
            .reduce((sum, p) => sum + p.amount, 0);
        }
        return \`
          <div class="room-card \${isEmpty ? 'empty' : ''}">
            <div class="room-card-header">
              <div class="room-number">\${isEmpty ? '🔴' : '🟢'} Kamar \${room.room_number}</div>
              <div class="room-status">\${isEmpty ? 'Kosong' : 'Terisi'}</div>
            </div>
            <div class="room-card-body">
              <div class="room-info">
                <div class="info-label">👤 Penghuni</div>
                <div class="info-value">\${room.current_tenant || '-'}</div>
              </div>
              <div class="room-info">
                <div class="info-label">💰 Tarif/Bulan</div>
                <div class="info-value amount">\${room.current_rate ? formatRupiah(room.current_rate) : '-'}</div>
              </div>
              <div class="room-info">
                <div class="info-label">📅 Tgl Bayar</div>
                <div class="info-value">\${paymentDate}</div>
              </div>
              <div class="room-info total">
                <div class="info-label">📊 Total Pendapatan</div>
                <div class="info-value amount">\${formatRupiah(tenantIncome)}</div>
              </div>
            </div>
          </div>
        \`;
      }
      
      if (currentKos === 'ub') {
        // Kos UB: grouped by building
        const groups = [
          { name: '🏗️ Bangunan Baru', range: [1, 14] },
          { name: '🏚️ Bangunan Lama', range: [15, 24] },
          { name: '🏠 Bangunan Induk', range: [25, 29] }
        ];
        let html = '';
        groups.forEach((g, gi) => {
          const groupRooms = rooms.filter(r => r.room_number >= g.range[0] && r.room_number <= g.range[1]);
          const activeCount = groupRooms.filter(r => r.current_tenant).length;
          const groupIncome = groupRooms.reduce((s, r) => {
            const tp = currentData.payments.filter(p => p.room_number === r.room_number && p.tenant_name === r.current_tenant);
            return s + tp.reduce((ss, pp) => ss + pp.amount, 0);
          }, 0);
          html += \`
            <div class="building-group">
              <div class="building-header" onclick="toggleBuilding('bldg\${gi}')">
                <span>\${g.name} <span style="font-size:0.8em;opacity:0.7">(Kamar \${g.range[0]}-\${g.range[1]} | \${activeCount}/\${groupRooms.length} terisi)</span></span>
                <span class="toggle-icon" id="bldg\${gi}-icon">▼</span>
              </div>
              <div class="building-content" id="bldg\${gi}-content">
                <div class="room-cards-grid">\${groupRooms.map(r => roomCard(r)).join('')}</div>
              </div>
            </div>
          \`;
        });
        document.getElementById('rooms-grid').innerHTML = html;
      } else {
        // Kos UM: flat layout
        const html = \`<div class="room-cards-grid">\${rooms.map(r => roomCard(r)).join('')}</div>\`;
        document.getElementById('rooms-grid').innerHTML = html;
      }
    }
    
    function toggleBuilding(id) {
      const content = document.getElementById(id + '-content');
      const icon = document.getElementById(id + '-icon');
      content.classList.toggle('collapsed');
      icon.classList.toggle('collapsed');
    }
    
    // Render payment history
    function renderPaymentHistory() {
      // Show all payments by default (no date filter)
      const html = currentData.payments.map(p => {
        const year = extractYear(p.date);
        const tenantNum = p.tenant_number ? p.tenant_number.replace('UB', '').replace('UM', '') : '-';
        return \`
          <tr data-room="\${p.room_number}" data-tenant="\${p.tenant_name}" data-period="\${p.period}" data-date="\${p.date}" data-amount="\${p.amount}" data-year="\${year}">
            <td>\${p.date}</td>
            <td>Kamar \${p.room_number}</td>
            <td>\${tenantNum}</td>
            <td>\${p.tenant_name}</td>
            <td class="amount">\${formatRupiah(p.amount)}</td>
            <td>\${p.payment_method}</td>
            <td>\${p.period}</td>
          </tr>
        \`;
      }).join('');
      document.getElementById('payments-tbody').innerHTML = html;
      updateResultCount();
    }
    
    // Populate filters
    function populateFilters() {
      // Room filter
      const roomOptions = currentData.rooms.map(r => 
        \`<option value="\${r.room_number}">Kamar \${r.room_number}</option>\`
      ).join('');
      document.getElementById('room-filter').innerHTML = 
        '<option value="">Semua</option>' + roomOptions;
      
      // Tenant filter
      const tenants = [...new Set(currentData.payments.map(p => p.tenant_name))].sort();
      const tenantOptions = tenants.map(t => 
        \`<option value="\${t}">\${t}</option>\`
      ).join('');
      document.getElementById('tenant-filter').innerHTML = 
        '<option value="">Semua</option>' + tenantOptions;
      
      // Year filter
      const years = [...new Set(currentData.payments.map(p => extractYear(p.date)))].filter(y => y).sort().reverse();
      const yearOptions = years.map(y => 
        \`<option value="\${y}">\${y}</option>\`
      ).join('');
      document.getElementById('year-filter').innerHTML = 
        '<option value="">Semua</option>' + yearOptions;
      
      // Month filter (sorted by calendar order)
      const monthOrder = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
      const months = [...new Set(currentData.payments.map(p => {
        const parts = p.period.toLowerCase().split(' ');
        return parts[0]; // Just the month name for filter
      }))];
      const sortedMonths = months.sort((a, b) => {
        const indexA = monthOrder.indexOf(a);
        const indexB = monthOrder.indexOf(b);
        return indexA - indexB;
      });
      const monthOptions = sortedMonths.map(m => 
        \`<option value="\${m}">\${m.charAt(0).toUpperCase() + m.slice(1)}</option>\`
      ).join('');
      document.getElementById('month-filter').innerHTML = 
        '<option value="">Semua</option>' + monthOptions;
    }
    
    // Filter payments
    function filterPayments() {
      const roomFilter = document.getElementById('room-filter').value;
      const tenantFilter = document.getElementById('tenant-filter').value;
      const yearFilter = document.getElementById('year-filter').value;
      const monthFilter = document.getElementById('month-filter').value;
      const sortFilter = document.getElementById('sort-filter').value;
      
      const rows = Array.from(document.querySelectorAll('#payments-tbody tr'));
      
      // Filter
      rows.forEach(row => {
        const room = row.getAttribute('data-room');
        const tenant = row.getAttribute('data-tenant');
        const year = row.getAttribute('data-year');
        const period = row.getAttribute('data-period');
        
        const matchRoom = !roomFilter || room === roomFilter;
        const matchTenant = !tenantFilter || tenant === tenantFilter;
        const matchYear = !yearFilter || year === yearFilter;
        const matchMonth = !monthFilter || period.toLowerCase().split(' ')[0] === monthFilter.toLowerCase();
        
        if (matchRoom && matchTenant && matchYear && matchMonth) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
      
      // Sort visible rows
      const visibleRows = rows.filter(row => row.style.display !== 'none');
      visibleRows.sort((a, b) => {
        if (sortFilter === 'date-desc') {
          return parseDate(b.getAttribute('data-date')) - parseDate(a.getAttribute('data-date'));
        } else if (sortFilter === 'date-asc') {
          return parseDate(a.getAttribute('data-date')) - parseDate(b.getAttribute('data-date'));
        } else if (sortFilter === 'amount-desc') {
          return parseInt(b.getAttribute('data-amount')) - parseInt(a.getAttribute('data-amount'));
        } else if (sortFilter === 'amount-asc') {
          return parseInt(a.getAttribute('data-amount')) - parseInt(b.getAttribute('data-amount'));
        } else if (sortFilter === 'room-asc') {
          return parseInt(a.getAttribute('data-room')) - parseInt(b.getAttribute('data-room'));
        }
        return 0;
      });
      
      // Re-append sorted rows
      const tbody = document.getElementById('payments-tbody');
      visibleRows.forEach(row => tbody.appendChild(row));
      
      updateResultCount();
    }
    
    // Update result count
    function updateResultCount() {
      const visibleRows = Array.from(document.querySelectorAll('#payments-tbody tr')).filter(row => row.style.display !== 'none');
      document.getElementById('result-count').textContent = \`Menampilkan \${visibleRows.length} transaksi\`;
    }
    
    // Reset filters
    function resetFilters() {
      document.getElementById('room-filter').value = '';
      document.getElementById('tenant-filter').value = '';
      document.getElementById('year-filter').value = '';
      document.getElementById('month-filter').value = '';
      document.getElementById('sort-filter').value = 'date-desc';
      
      // Reset period buttons
      document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
      
      renderPaymentHistory();
    }
    
    // Quick period filter
    function quickFilter(months) {
      // Update button states
      document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      // Reset other filters
      document.getElementById('room-filter').value = '';
      document.getElementById('year-filter').value = '';
      document.getElementById('month-filter').value = '';
      
      const now = new Date();
      const rows = Array.from(document.querySelectorAll('#payments-tbody tr'));
      
      if (months === 'all') {
        // Show all
        rows.forEach(row => row.style.display = '');
      } else {
        // Filter by months
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
        
        rows.forEach(row => {
          const dateStr = row.getAttribute('data-date');
          const paymentDate = parseDate(dateStr);
          
          if (paymentDate >= cutoffDate) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }
      
      updateResultCount();
    }
    
    // Toggle section
    function toggleSection(section) {
      const content = document.getElementById(section + '-content');
      const icon = document.getElementById(section + '-icon');
      content.classList.toggle('collapsed');
      icon.classList.toggle('collapsed');
    }
    
    // Format currency
    function formatRupiah(amount) {
      return 'Rp ' + amount.toLocaleString('id-ID');
    }
    
    // Initialize on load
    init();
  </script>
</body>
</html>`;

// Write HTML
fs.writeFileSync(path.join(__dirname, 'index.html'), html);

console.log('✅ index.html generated with toggle & payment table!');
console.log(`📊 Kos UM: ${dataUM.payments.length} transaksi, ${dataUM.summary.total_rooms} kamar`);
console.log(`📊 Kos UB: ${dataUB.payments.length} transaksi, ${dataUB.summary.total_rooms} kamar`);
