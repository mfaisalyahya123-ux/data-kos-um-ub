const fs = require('fs');
const path = require('path');

// Mapping penghuni ke kamar (dari data yang diberikan)
const tenantToRoom = {
  1: { name: 'Resti', room: 1, move_in: '10/02/2025', move_out: '30/11/2025' },
  2: { name: 'Meisya Syafira', room: 2, move_in: '02/02/2025', move_out: '05/03/2026' },
  3: { name: 'Shefiratul Rohma', room: 3, move_in: '28/01/2025', move_out: '30/11/2025' },
  4: { name: 'Erliz Rizqiyani', room: 4, move_in: '12/01/2025', move_out: '30/08/2025' },
  5: { name: 'Puspita Wulandari', room: 5, move_in: '12/01/2025', move_out: '06/08/2025' },
  6: { name: 'Feby', room: 6, move_in: '29/01/2025', move_out: '07/07/2025' },
  7: { name: 'Halizza', room: 7, move_in: '08/01/2025', move_out: '30/08/2025' },
  8: { name: 'Giska Putri', room: 8, move_in: '03/02/2025', move_out: '05/03/2026' },
  9: { name: 'Viona Wahyu', room: 9, move_in: '04/02/2025', move_out: '12/08/2025' },
  10: { name: 'Maritza', room: 10, move_in: '28/01/2025', move_out: null },
  11: { name: 'Maulidita', room: 6, move_in: '07/07/2025', move_out: null },
  12: { name: 'Al Naina', room: 5, move_in: '06/08/2025', move_out: null },
  13: { name: 'Ridha Maghfirah Amin', room: 9, move_in: '12/08/2025', move_out: null },
  14: { name: 'Danila Mutiara', room: 7, move_in: '30/08/2025', move_out: null },
  15: { name: 'Louise Valenza Asbi', room: 4, move_in: '30/08/2025', move_out: null },
  16: { name: 'Nur Qomaria', room: 1, move_in: '30/11/2025', move_out: null },
  17: { name: 'Aniela Nabila', room: 3, move_in: '30/11/2025', move_out: null },
  18: { name: 'Adinda Suci Nurhidaya', room: 2, move_in: '05/03/2026', move_out: null },
  19: { name: 'Nailah Resendriya Maheswari', room: 8, move_in: '05/03/2026', move_out: null }
};

// Read CSV
const csvPath = path.join(__dirname, 'Kos um.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(line => line.trim());

// Parse CSV with proper quote handling
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse CSV
const payments = [];
let id = 1;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.startsWith(',,,')) continue;
  
  const parts = parseCSVLine(line);
  
  if (parts.length < 6 || !parts[0].trim()) continue;
  
  const date = parts[0].trim();
  const tenantNumber = parseInt(parts[1]);
  const name = parts[2].trim();
  const amountStr = parts[3].replace(/[^0-9]/g, '');
  const amount = parseInt(amountStr) || 0;
  const via = parts[4].trim().toLowerCase();
  const month = parts[5].trim().toLowerCase();
  
  if (!date || !tenantNumber || !name || !amount || !month) continue;
  if (isNaN(tenantNumber) || isNaN(amount)) continue;
  
  // Get room number from mapping
  const tenant = tenantToRoom[tenantNumber];
  const roomNumber = tenant ? tenant.room : tenantNumber;
  
  payments.push({
    id: id++,
    date,
    tenant_number: tenantNumber,
    room_number: roomNumber,
    tenant_name: name,
    amount,
    payment_method: via,
    period: month
  });
}

// Build room data (10 kamar)
const rooms = {};
for (let i = 1; i <= 10; i++) {
  rooms[i] = {
    room_number: i,
    tenants: [],
    current_tenant: null,
    current_rate: 0,
    total_income: 0
  };
}

// Populate room data
Object.values(tenantToRoom).forEach(tenant => {
  const room = rooms[tenant.room];
  room.tenants.push({
    tenant_number: Object.keys(tenantToRoom).find(k => tenantToRoom[k] === tenant),
    name: tenant.name,
    move_in: tenant.move_in,
    move_out: tenant.move_out,
    status: tenant.move_out ? 'keluar' : 'aktif'
  });
  
  if (!tenant.move_out) {
    room.current_tenant = tenant.name;
  }
});

// Calculate room income & current rate
payments.forEach(p => {
  const room = rooms[p.room_number];
  if (room) {
    room.total_income += p.amount;
    room.current_rate = p.amount; // Last payment amount
  }
});

// Create data structure
const data = {
  project: "Kos UM/UB",
  start_date: "2025-01-01",
  total_rooms: 10,
  rooms: Object.values(rooms).sort((a, b) => a.room_number - b.room_number),
  tenants: Object.entries(tenantToRoom).map(([num, tenant]) => ({
    tenant_number: parseInt(num),
    name: tenant.name,
    room_number: tenant.room,
    move_in: tenant.move_in,
    move_out: tenant.move_out,
    status: tenant.move_out ? 'keluar' : 'aktif'
  })),
  payments: payments.sort((a, b) => new Date(b.date) - new Date(a.date)),
  summary: {
    total_rooms: 10,
    occupied_rooms: Object.values(rooms).filter(r => r.current_tenant).length,
    total_tenants: Object.keys(tenantToRoom).length,
    active_tenants: Object.values(tenantToRoom).filter(t => !t.move_out).length,
    total_income: payments.reduce((sum, p) => sum + p.amount, 0),
    by_month: {},
    by_room: {}
  }
};

// Calculate monthly income
payments.forEach(p => {
  if (!data.summary.by_month[p.period]) {
    data.summary.by_month[p.period] = 0;
  }
  data.summary.by_month[p.period] += p.amount;
});

// Calculate room income
Object.values(rooms).forEach(room => {
  data.summary.by_room[room.room_number] = room.total_income;
});

// Write JSON
const dataPath = path.join(__dirname, 'data.json');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ CSV converted to JSON!');
console.log(`📊 Total payments: ${payments.length}`);
console.log(`🏠 Total rooms: 10`);
console.log(`👥 Total tenants: ${data.summary.total_tenants} (${data.summary.active_tenants} aktif)`);
console.log(`💰 Total income: Rp ${data.summary.total_income.toLocaleString('id-ID')}`);
