const fs = require('fs');
const path = require('path');

// Read both datasets
const dataUM = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-um.json'), 'utf8'));
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

// Helper: Format currency
function formatRupiah(amount) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

// Generate HTML with toggle and payment table
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
      max-height: 2000px;
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
      <h1 id="page-title">💰 Data Kos UM</h1>
      <p class="subtitle">Monitoring Keuangan & Pembayaran</p>
    </header>
    
    <!-- Toggle Switch -->
    <div class="toggle-container">
      <div class="toggle-switch">
        <button class="toggle-btn active" onclick="switchKos('um')">🏠 Kos UM</button>
        <button class="toggle-btn" onclick="switchKos('ub')">🏢 Kos UB</button>
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
        <table>
          <thead>
            <tr>
              <th>Kamar</th>
              <th>Penghuni</th>
              <th>Tarif</th>
              <th>Tgl Bayar</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody id="rooms-tbody">
            <!-- Will be populated by JavaScript -->
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Riwayat Pembayaran -->
    <div class="section">
      <div class="section-title" onclick="toggleSection('payments')">
        <span>📊 Riwayat Pembayaran</span>
        <span class="toggle-icon" id="payments-icon">▼</span>
      </div>
      <div class="section-content" id="payments-content">
        <div class="filter-controls">
          <label>Kamar:</label>
          <select id="room-filter" onchange="filterPayments()">
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
    
    let currentKos = 'um';
    let currentData = dataUM;
    let currentYear = 2026;
    
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
      document.getElementById('page-title').textContent = 
        kos === 'um' ? '💰 Data Kos UM' : '💰 Data Kos UB';
      
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
            const paymentDate = parseInt(currentTenant.move_in.split('/')[0]);
            const moveInParts = currentTenant.move_in.split('/');
            const moveInMonth = parseInt(moveInParts[1]);
            const moveInYear = parseInt(moveInParts[2]);
            
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
              payment_date: paymentDate,
              months: months
            };
          }
        }
      });
      
      // Mark paid months
      currentData.payments.forEach(payment => {
        if (payment.date.includes(currentYear.toString())) {
          const room = paymentStatus[payment.room_number];
          if (room) {
            const month = monthMap[payment.period.toLowerCase()];
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
    
    // Render rooms list
    function renderRoomsList() {
      const html = currentData.rooms.sort((a, b) => a.room_number - b.room_number).map(room => {
        const currentTenant = room.tenants.find(t => t.status === 'aktif');
        const paymentDate = currentTenant ? currentTenant.move_in.split('/')[0] : '-';
        const status = room.current_tenant ? '🟢' : '🔴';
        
        // Calculate total income for current tenant only
        let tenantIncome = 0;
        if (room.current_tenant) {
          tenantIncome = currentData.payments
            .filter(p => p.room_number === room.room_number && p.tenant_name === room.current_tenant)
            .reduce((sum, p) => sum + p.amount, 0);
        }
        
        return \`
          <tr>
            <td class="room-col">\${status} \${room.room_number}</td>
            <td>\${room.current_tenant || '<em style="color: #999;">Kosong</em>'}</td>
            <td class="amount">\${room.current_rate ? formatRupiah(room.current_rate) : '-'}</td>
            <td style="text-align: center;">\${paymentDate}</td>
            <td class="amount">\${formatRupiah(tenantIncome)}</td>
          </tr>
        \`;
      }).join('');
      document.getElementById('rooms-tbody').innerHTML = html;
    }
    
    // Render payment history
    function renderPaymentHistory() {
      // Get last 3 months by default
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      
      const filteredPayments = currentData.payments.filter(p => {
        const paymentDate = parseDate(p.date);
        return paymentDate >= threeMonthsAgo;
      });
      
      const html = filteredPayments.map(p => \`
        <tr data-room="\${p.room_number}" data-period="\${p.period}" data-date="\${p.date}" data-amount="\${p.amount}" data-year="\${p.date.split('/')[2]}">
          <td>\${p.date}</td>
          <td>Kamar \${p.room_number}</td>
          <td>\${p.tenant_name}</td>
          <td class="amount">\${formatRupiah(p.amount)}</td>
          <td>\${p.payment_method}</td>
          <td>\${p.period}</td>
        </tr>
      \`).join('');
      document.getElementById('payments-tbody').innerHTML = html;
      updateResultCount();
    }
    
    // Parse date DD/MM/YYYY
    function parseDate(dateStr) {
      const parts = dateStr.split('/');
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    
    // Populate filters
    function populateFilters() {
      // Room filter
      const roomOptions = currentData.rooms.map(r => 
        \`<option value="\${r.room_number}">Kamar \${r.room_number}</option>\`
      ).join('');
      document.getElementById('room-filter').innerHTML = 
        '<option value="">Semua</option>' + roomOptions;
      
      // Year filter
      const years = [...new Set(currentData.payments.map(p => p.date.split('/')[2]))].sort().reverse();
      const yearOptions = years.map(y => 
        \`<option value="\${y}">\${y}</option>\`
      ).join('');
      document.getElementById('year-filter').innerHTML = 
        '<option value="">Semua</option>' + yearOptions;
      
      // Month filter
      const months = [...new Set(currentData.payments.map(p => p.period))];
      const monthOptions = months.map(m => 
        \`<option value="\${m}">\${m}</option>\`
      ).join('');
      document.getElementById('month-filter').innerHTML = 
        '<option value="">Semua</option>' + monthOptions;
    }
    
    // Filter payments
    function filterPayments() {
      const roomFilter = document.getElementById('room-filter').value;
      const yearFilter = document.getElementById('year-filter').value;
      const monthFilter = document.getElementById('month-filter').value;
      const sortFilter = document.getElementById('sort-filter').value;
      
      const rows = Array.from(document.querySelectorAll('#payments-tbody tr'));
      
      // Filter
      rows.forEach(row => {
        const room = row.getAttribute('data-room');
        const year = row.getAttribute('data-year');
        const period = row.getAttribute('data-period');
        
        const matchRoom = !roomFilter || room === roomFilter;
        const matchYear = !yearFilter || year === yearFilter;
        const matchMonth = !monthFilter || period === monthFilter;
        
        if (matchRoom && matchYear && matchMonth) {
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
      document.getElementById('year-filter').value = '';
      document.getElementById('month-filter').value = '';
      document.getElementById('sort-filter').value = 'date-desc';
      renderPaymentHistory();
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
