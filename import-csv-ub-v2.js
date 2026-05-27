const fs = require('fs');

// Read CSV
const csv = fs.readFileSync('C:\\Users\\1molu\\OneDrive\\Desktop\\Kos UB.csv', 'utf8');
const lines = csv.trim().split('\n');
const header = lines[0];

const monthMap = {
  'januari': 'januari', 'februari': 'februari', 'maret': 'maret',
  'april': 'april', 'mei': 'mei', 'juni': 'juni',
  'juli': 'juli', 'agustus': 'agustus', 'september': 'september',
  'oktober': 'oktober', 'november': 'november', 'desember': 'desember'
};

const monthNumMap = {
  'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
  'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
  'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
};

const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

// Parse CSV lines
const rawPayments = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Parse CSV with quoted fields
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const ch = line[j];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  
  if (parts.length < 6) continue;
  
  const [dateStr, tenantNum, name, amountStr, via, periodRaw] = parts;
  
  // Parse date: DD-Mon-YY
  const dateMatch = dateStr.match(/(\d+)-([A-Za-z]+)-(\d+)/);
  if (!dateMatch) continue;
  
  const day = parseInt(dateMatch[1]);
  const mon = dateMatch[2].toLowerCase();
  const yy = parseInt(dateMatch[3]);
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  
  const monthIdx = Object.keys(monthMap).find(m => m.startsWith(mon));
  if (!monthIdx) continue;
  
  const monthName = monthNames[monthNumMap[monthIdx]];
  const dateFormatted = `${day} ${monthName} ${year}`;
  
  // Parse amount
  const amount = parseInt(amountStr.replace(/[^0-9]/g, ''));
  
  // Parse period
  const period = periodRaw.trim().toLowerCase();
  
  rawPayments.push({
    date: dateFormatted,
    tenant_number: parseInt(tenantNum),
    name: name.trim(),
    amount,
    payment_method: via.trim().toLowerCase(),
    period
  });
}

// Build rooms data
const tenantMap = new Map();
for (const p of rawPayments) {
  if (!tenantMap.has(p.tenant_number)) {
    tenantMap.set(p.tenant_number, {
      tenant_number: p.tenant_number,
      name: p.name,
      payments: [],
      rates: new Map()
    });
  }
  const t = tenantMap.get(p.tenant_number);
  t.payments.push(p);
  const rateKey = p.amount;
  t.rates.set(rateKey, (t.rates.get(rateKey) || 0) + 1);
}

// Determine rate for each tenant (most frequent amount)
for (const [num, t] of tenantMap) {
  let bestRate = 0, bestCount = 0;
  for (const [rate, count] of t.rates) {
    if (count > bestCount) {
      bestCount = count;
      bestRate = rate;
    }
  }
  t.current_rate = bestRate;
}

// Sort payments by date
const allPayments = rawPayments.sort((a, b) => {
  const parseDate = (d) => {
    const parts = d.split(' ');
    const day = parseInt(parts[0]);
    const month = monthNames.indexOf(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month - 1, day);
  };
  return parseDate(a.date) - parseDate(b.date) || a.tenant_number - b.tenant_number;
});

// Build rooms array
const rooms = [];
const totalRooms = 29;
for (let i = 1; i <= totalRooms; i++) {
  const t = tenantMap.get(i);
  if (t) {
    rooms.push({
      room_number: i,
      tenants: [{
        tenant_number: `UB${String(i).padStart(3, '0')}`,
        name: t.name,
        move_in: t.payments[0].date,
        move_out: null,
        status: 'aktif'
      }],
      current_tenant: t.name,
      current_rate: t.current_rate,
      total_income: t.payments.reduce((sum, p) => sum + p.amount, 0)
    });
  } else {
    rooms.push({
      room_number: i,
      tenants: [],
      current_tenant: null,
      current_rate: 0,
      total_income: 0
    });
  }
}

// Build payments array with IDs
const payments = allPayments.map((p, idx) => ({
  id: idx + 1,
  date: p.date,
  tenant_number: `UB${String(p.tenant_number).padStart(3, '0')}`,
  room_number: p.tenant_number,
  tenant_name: p.name,
  amount: p.amount,
  payment_method: p.payment_method,
  period: p.period
}));

// Calculate total income
const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);

const ubData = {
  project: 'Kos UB',
  start_date: '2025-01-01',
  total_rooms: totalRooms,
  rooms,
  payments,
  summary: {
    total_income: totalIncome,
    total_transactions: payments.length,
    total_rooms: totalRooms,
    active_rooms: rooms.filter(r => r.current_tenant !== null).length
  }
};

fs.writeFileSync('data-ub.json', JSON.stringify(ubData, null, 2));
console.log(`✅ Imported: ${payments.length} payments, ${rooms.filter(r=>r.current_tenant).length} active rooms`);
console.log(`💰 Total income: Rp ${totalIncome.toLocaleString('id-ID')}`);