const fs = require('fs');
const path = require('path');

// Read both datasets
const dataUM = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-um.json'), 'utf8'));
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

// Generate HTML with embedded data
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
      background: #f8f9fa;
      font-weight: bold;
      color: #333;
    }
    
    tr:hover {
      background: #f8f9fa;
    }
    
    .amount {
      font-weight: bold;
      color: #28a745;
    }
    
    @media (max-width: 768px) {
      h1 {
        font-size: 1.8em;
      }
      
      .stats {
        grid-template-columns: 1fr;
      }
      
      .room-grid {
        grid-template-columns: 1fr;
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
      <p class="subtitle">Sistem Monitoring Keuangan</p>
    </header>
    
    <!-- Toggle Switch -->
    <div class="toggle-container">
      <div class="toggle-switch">
        <button class="toggle-btn active" onclick="switchKos('um')">🏠 Kos UM</button>
        <button class="toggle-btn" onclick="switchKos('ub')">🏢 Kos UB</button>
      </div>
    </div>
    
    <!-- Stats Cards -->
    <div class="stats" id="stats-container">
      <!-- Will be populated by JavaScript -->
    </div>
    
    <!-- Room Status -->
    <div class="section">
      <div class="section-title" onclick="toggleSection('rooms')">
        <span>🏠 Status Kamar</span>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="rooms-content">
        <div class="room-grid" id="rooms-grid">
          <!-- Will be populated by JavaScript -->
        </div>
      </div>
    </div>
    
    <!-- Payment History -->
    <div class="section">
      <div class="section-title" onclick="toggleSection('payments')">
        <span>📊 Riwayat Pembayaran</span>
        <span class="toggle-icon">▼</span>
      </div>
      <div class="section-content" id="payments-content">
        <div class="filter-controls">
          <label>Filter Kamar:</label>
          <select id="room-filter" onchange="filterPayments()">
            <option value="">Semua Kamar</option>
          </select>
          
          <label>Filter Bulan:</label>
          <select id="month-filter" onchange="filterPayments()">
            <option value="">Semua Bulan</option>
          </select>
          
          <button class="reset-btn" onclick="resetFilters()">Reset</button>
        </div>
        
        <table id="payments-table">
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
    let allPayments = dataUM.payments;
    
    // Initialize
    function init() {
      renderStats();
      renderRooms();
      renderPayments();
      populateFilters();
    }
    
    // Switch between UM and UB
    function switchKos(kos) {
      currentKos = kos;
      currentData = kos === 'um' ? dataUM : dataUB;
      allPayments = currentData.payments;
      
      // Update page title
      document.getElementById('page-title').textContent = 
        kos === 'um' ? '💰 Data Kos UM' : '💰 Data Kos UB';
      
      // Update toggle buttons
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Re-render everything
      renderStats();
      renderRooms();
      renderPayments();
      populateFilters();
      resetFilters();
    }
    
    // Render stats cards
    function renderStats() {
      const stats = currentData.summary;
      const html = \`
        <div class="stat-card">
          <div class="stat-label">Total Kamar</div>
          <div class="stat-value">\${stats.total_rooms}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Kamar Terisi</div>
          <div class="stat-value">\${stats.occupied_rooms}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pendapatan</div>
          <div class="stat-value">\${formatRupiah(stats.total_income)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Transaksi</div>
          <div class="stat-value">\${currentData.payments.length}</div>
        </div>
      \`;
      document.getElementById('stats-container').innerHTML = html;
    }
    
    // Render rooms
    function renderRooms() {
      const html = currentData.rooms.map(room => \`
        <div class="room-card \${room.current_tenant ? '' : 'vacant'}">
          <div class="room-number">Kamar \${room.room_number}</div>
          <div class="room-tenant">\${room.current_tenant || 'Kosong'}</div>
          <div class="room-rate">\${formatRupiah(room.current_rate)}/bulan</div>
          <div style="font-size: 0.85em; color: #666; margin-top: 5px;">
            Total: \${formatRupiah(room.total_income)}
          </div>
        </div>
      \`).join('');
      document.getElementById('rooms-grid').innerHTML = html;
    }
    
    // Render payments
    function renderPayments() {
      const html = allPayments.map(p => \`
        <tr>
          <td>\${p.date}</td>
          <td>Kamar \${p.room_number}</td>
          <td>\${p.tenant_name}</td>
          <td class="amount">\${formatRupiah(p.amount)}</td>
          <td>\${p.payment_method}</td>
          <td>\${p.period}</td>
        </tr>
      \`).join('');
      document.getElementById('payments-tbody').innerHTML = html;
    }
    
    // Populate filter dropdowns
    function populateFilters() {
      // Room filter
      const roomOptions = currentData.rooms.map(r => 
        \`<option value="\${r.room_number}">Kamar \${r.room_number}</option>\`
      ).join('');
      document.getElementById('room-filter').innerHTML = 
        '<option value="">Semua Kamar</option>' + roomOptions;
      
      // Month filter
      const months = [...new Set(currentData.payments.map(p => p.period))];
      const monthOptions = months.map(m => 
        \`<option value="\${m}">\${m}</option>\`
      ).join('');
      document.getElementById('month-filter').innerHTML = 
        '<option value="">Semua Bulan</option>' + monthOptions;
    }
    
    // Filter payments
    function filterPayments() {
      const roomFilter = document.getElementById('room-filter').value;
      const monthFilter = document.getElementById('month-filter').value;
      
      allPayments = currentData.payments.filter(p => {
        const matchRoom = !roomFilter || p.room_number == roomFilter;
        const matchMonth = !monthFilter || p.period === monthFilter;
        return matchRoom && matchMonth;
      });
      
      renderPayments();
    }
    
    // Reset filters
    function resetFilters() {
      document.getElementById('room-filter').value = '';
      document.getElementById('month-filter').value = '';
      allPayments = currentData.payments;
      renderPayments();
    }
    
    // Toggle section
    function toggleSection(section) {
      const content = document.getElementById(section + '-content');
      const icon = event.currentTarget.querySelector('.toggle-icon');
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

console.log('✅ index.html generated with UM/UB toggle!');
console.log(`📊 Kos UM: ${dataUM.payments.length} transaksi, ${dataUM.summary.total_rooms} kamar`);
console.log(`📊 Kos UB: ${dataUB.payments.length} transaksi, ${dataUB.summary.total_rooms} kamar`);
