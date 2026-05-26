const fs = require('fs');
const path = require('path');

// Helper: Parse date format (DD-MMM-YY)
function parseDate(dateStr) {
  const monthMap = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'Jun': 5,
    'Jul': 6, 'Agu': 7, 'Sep': 8, 'Okt': 9, 'Nov': 10, 'Des': 11
  };
  
  const parts = dateStr.split('-');
  const day = parseInt(parts[0]);
  const month = monthMap[parts[1]];
  const year = 2000 + parseInt(parts[2]);
  
  return new Date(year, month, day);
}

// Helper: Format date to DD/MM/YYYY
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

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

// Read CSV
const csvPath = 'C:\\Users\\1molu\\OneDrive\\Desktop\\Kos UB.csv';
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(line => line.trim());

// Parse CSV
const payments = [];
let id = 1;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = parseCSVLine(line);
  
  if (parts.length < 6) continue;
  
  const dateStr = parts[0].trim();
  const roomNumber = parseInt(parts[1]);
  const name = parts[2].trim();
  // Handle quoted amounts with commas: "1,200,000"
  const amountRaw = parts[3].trim().replace(/"/g, '').replace(/,/g, '');
  const amount = parseInt(amountRaw) || 0;
  const via = parts[4].trim();
  const period = parts[5].trim().toLowerCase();
  
  if (!dateStr || isNaN(roomNumber) || !name || !amount || !period) continue;
  
  try {
    const date = parseDate(dateStr);
    
    payments.push({
      id: id++,
      date: formatDate(date),
      room_number: roomNumber,
      tenant_name: name,
      amount,
      payment_method: via,
      period,
      _timestamp: date.getTime()
    });
  } catch (e) {
    console.log(`⚠️ Skipping invalid date: ${dateStr}`);
  }
}

// Build room data (29 kamar)
const rooms = {};
for (let i = 1; i <= 29; i++) {
  rooms[i] = {
    room_number: i,
    tenants: [],
    current_tenant: null,
    current_rate: 0,
    total_income: 0,
    last_payment: null
  };
}

// Group payments by room and tenant
const roomTenants = {};
payments.forEach(p => {
  const key = `${p.room_number}-${p.tenant_name}`;
  if (!roomTenants[key]) {
    roomTenants[key] = {
      room_number: p.room_number,
      tenant_name: p.tenant_name,
      first_payment: p.date,
      last_payment: p.date,
      total_paid: 0,
      payments: []
    };
  }
  roomTenants[key].total_paid += p.amount;
  roomTenants[key].payments.push(p);
  if (p._timestamp > new Date(roomTenants[key].last_payment.split('/').reverse().join('-')).getTime()) {
    roomTenants[key].last_payment = p.date;
  }
});

// Populate room data
Object.values(roomTenants).forEach(tenant => {
  const room = rooms[tenant.room_number];
  if (!room) return;
  
  room.tenants.push({
    name: tenant.tenant_name,
    move_in: tenant.first_payment,
    last_payment: tenant.last_payment,
    total_paid: tenant.total_paid
  });
  
  room.total_income += tenant.total_paid;
  
  // Set current tenant (last payment)
  if (!room.last_payment || new Date(tenant.last_payment.split('/').reverse().join('-')) > new Date(room.last_payment.split('/').reverse().join('-'))) {
    room.current_tenant = tenant.tenant_name;
    room.last_payment = tenant.last_payment;
    room.current_rate = tenant.payments[tenant.payments.length - 1].amount;
  }
});

// Create data structure
const data = {
  project: "Kos UB",
  start_date: "2025-01-01",
  total_rooms: 29,
  rooms: Object.values(rooms).sort((a, b) => a.room_number - b.room_number),
  payments: payments.sort((a, b) => b._timestamp - a._timestamp).map(p => {
    const { _timestamp, ...payment } = p;
    return payment;
  }),
  summary: {
    total_rooms: 29,
    occupied_rooms: Object.values(rooms).filter(r => r.current_tenant).length,
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
const dataPath = path.join(__dirname, 'data-ub.json');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Kos UB CSV converted to JSON!');
console.log(`📊 Total payments: ${payments.length}`);
console.log(`🏠 Total rooms: 29`);
console.log(`🏠 Occupied rooms: ${data.summary.occupied_rooms}`);
console.log(`💰 Total income: Rp ${data.summary.total_income.toLocaleString('id-ID')}`);
