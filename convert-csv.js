const fs = require('fs');
const path = require('path');

// Read CSV
const csvPath = path.join(__dirname, 'Kos um.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(line => line.trim() && !line.startsWith(',,,'));

// Parse CSV
const payments = [];
let id = 1;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const parts = line.split(',');
  
  if (parts.length < 6 || !parts[0].trim()) continue;
  
  const date = parts[0].trim();
  const roomNumber = parseInt(parts[1]);
  const name = parts[2].trim();
  const amount = parseInt(parts[3].replace(/[^0-9]/g, ''));
  const via = parts[4].trim().toLowerCase();
  const month = parts[5].trim().toLowerCase();
  
  if (!date || !roomNumber || !name || !amount || !month) continue;
  
  payments.push({
    id: id++,
    date,
    room_number: roomNumber,
    tenant_name: name,
    amount,
    payment_method: via,
    period: month
  });
}

// Group by room
const rooms = {};
payments.forEach(p => {
  if (!rooms[p.room_number]) {
    rooms[p.room_number] = {
      room_number: p.room_number,
      current_tenant: p.tenant_name,
      current_rate: p.amount,
      payments: []
    };
  }
  rooms[p.room_number].payments.push(p);
});

// Create data structure
const data = {
  project: "Kos UM/UB",
  start_date: "2025-01-01",
  rooms: Object.values(rooms).sort((a, b) => a.room_number - b.room_number),
  payments: payments.sort((a, b) => new Date(b.date) - new Date(a.date)),
  summary: {
    total_rooms: Object.keys(rooms).length,
    occupied_rooms: Object.keys(rooms).length,
    total_income: payments.reduce((sum, p) => sum + p.amount, 0),
    by_month: {}
  }
};

// Calculate monthly income
payments.forEach(p => {
  if (!data.summary.by_month[p.period]) {
    data.summary.by_month[p.period] = 0;
  }
  data.summary.by_month[p.period] += p.amount;
});

// Write JSON
fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
console.log('✅ CSV converted to JSON!');
console.log(`📊 Total payments: ${payments.length}`);
console.log(`🏠 Total rooms: ${Object.keys(rooms).length}`);
console.log(`💰 Total income: Rp ${data.summary.total_income.toLocaleString('id-ID')}`);
