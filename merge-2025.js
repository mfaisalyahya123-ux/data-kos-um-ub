const fs = require('fs');
const path = require('path');

// Read existing data
const dataPath = path.join(__dirname, 'data-um.json');
const existingData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Read CSV
const csvPath = 'C:\\Users\\1molu\\OneDrive\\Desktop\\Kos um - restored.csv';
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

// Parse date format "DD Bulan YYYY"
function parseDate(dateStr) {
  const monthMap = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
  };
  
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = monthMap[parts[1].toLowerCase()];
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  return null;
}

// Parse CSV payments
const newPayments = [];
let maxId = Math.max(...existingData.payments.map(p => p.id));

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  
  const parts = parseCSVLine(line);
  if (parts.length < 6) continue;
  
  const dateStr = parts[0].trim();
  const roomNumber = parseInt(parts[1]);
  const name = parts[2].trim();
  const amountRaw = parts[3].trim().replace(/"/g, '').replace(/,/g, '').replace(/\s/g, '');
  const amount = parseInt(amountRaw) || 0;
  const via = parts[4].trim();
  const period = parts[5].trim().toLowerCase();
  
  if (!dateStr || isNaN(roomNumber) || !name || !amount || !period) continue;
  
  // Check if already exists (avoid duplicates)
  const exists = existingData.payments.some(p => 
    p.date === dateStr && 
    p.room_number === roomNumber && 
    p.period.toLowerCase() === period
  );
  
  if (!exists) {
    maxId++;
    newPayments.push({
      id: maxId,
      date: dateStr,
      tenant_number: null,
      room_number: roomNumber,
      tenant_name: name,
      amount: amount,
      payment_method: via.toLowerCase(),
      period: period
    });
  }
}

// Sort new payments by date
newPayments.sort((a, b) => {
  const dateA = parseDate(a.date);
  const dateB = parseDate(b.date);
  return dateA - dateB;
});

// Merge with existing payments
const allPayments = [...existingData.payments, ...newPayments];

// Sort all payments by date (newest first)
allPayments.sort((a, b) => {
  const dateA = parseDate(a.date);
  const dateB = parseDate(b.date);
  return dateB - dateA;
});

// Update data
existingData.payments = allPayments;

// Recalculate summary
existingData.summary.total_income = allPayments.reduce((sum, p) => sum + p.amount, 0);

// Write back
fs.writeFileSync(dataPath, JSON.stringify(existingData, null, 2));

console.log('✅ Data 2025 merged successfully!');
console.log(`📊 New payments added: ${newPayments.length}`);
console.log(`📊 Total payments: ${allPayments.length}`);
console.log(`💰 Total income: Rp ${existingData.summary.total_income.toLocaleString('id-ID')}`);
