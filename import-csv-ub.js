const fs = require('fs');
const path = require('path');

// Read CSV file
const csvPath = 'C:\\Users\\1molu\\OneDrive\\Desktop\\Kos UB.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');

// Read current data-ub.json
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

// Parse CSV
const lines = csvContent.split('\n').slice(1); // Skip header
const payments = [];

// Helper: Parse date from DD-Mon-YY to DD/MM/YYYY
function parseDate(dateStr) {
  const months = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
    'Mei': '05', 'Jun': '06', 'Jul': '07', 'Agu': '08',
    'Sep': '09', 'Okt': '10', 'Nov': '11', 'Des': '12'
  };
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  
  const day = parts[0].padStart(2, '0');
  const month = months[parts[1]];
  const year = '20' + parts[2];
  
  return `${day}/${month}/${year}`;
}

// Helper: Find tenant in room on specific date
function findTenantInRoom(roomNumber, dateStr) {
  // Convert DD/MM/YYYY to Date object
  const [day, month, year] = dateStr.split('/');
  const paymentDate = new Date(year, month - 1, day);
  
  // Find the room
  const room = dataUB.rooms.find(r => r.room_number === roomNumber);
  if (!room) return null;
  
  // Search tenants in this room
  for (const tenant of room.tenants) {
    // Parse move_in date
    const [inDay, inMonth, inYear] = tenant.move_in.split('/');
    const moveInDate = new Date(inYear, inMonth - 1, inDay);
    
    // Parse move_out date (if exists)
    let moveOutDate = null;
    if (tenant.move_out) {
      const [outDay, outMonth, outYear] = tenant.move_out.split('/');
      moveOutDate = new Date(outYear, outMonth - 1, outDay);
    }
    
    // Check if payment date is within tenant's stay
    if (paymentDate >= moveInDate) {
      if (!moveOutDate || paymentDate <= moveOutDate) {
        return {
          name: tenant.name,
          tenant_number: tenant.tenant_number
        };
      }
    }
  }
  
  return null;
}

// Helper: Parse CSV line with quoted fields
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

console.log('📊 Starting CSV import...\n');

let successCount = 0;
let errorCount = 0;
let currentId = 1;

// Process each CSV line
for (const line of lines) {
  if (!line.trim()) continue;
  
  const parts = parseCSVLine(line);
  if (parts.length < 6) continue;
  
  const dateStr = parts[0];
  const roomNumber = parseInt(parts[1]); // CSV "No Penghuni" = room number
  const csvName = parts[2];
  const amountStr = parts[3].replace(/,/g, '');
  const amount = parseInt(amountStr);
  const method = parts[4].toLowerCase();
  const period = parts[5].toLowerCase();
  
  // Parse date
  const parsedDate = parseDate(dateStr);
  if (!parsedDate) {
    console.log(`❌ Invalid date: ${dateStr}`);
    errorCount++;
    continue;
  }
  
  // Find tenant in this room on this date
  const tenant = findTenantInRoom(roomNumber, parsedDate);
  if (!tenant) {
    console.log(`⚠️  No tenant found in Room ${roomNumber} on ${parsedDate} (CSV: ${csvName})`);
    errorCount++;
    continue;
  }
  
  // Create payment record
  payments.push({
    id: currentId++,
    date: parsedDate,
    room_number: roomNumber,
    tenant_name: tenant.name,
    amount: amount,
    payment_method: method,
    period: period,
    tenant_number: tenant.tenant_number
  });
  
  successCount++;
}

console.log(`\n✅ Import complete!`);
console.log(`- Success: ${successCount} payments`);
console.log(`- Errors: ${errorCount}`);
console.log(`- Total: ${payments.length} payments\n`);

// Update data-ub.json
dataUB.payments = payments;

// Update room totals
const roomTotals = {};
const roomLastPayment = {};

for (const payment of payments) {
  const room = payment.room_number;
  
  if (!roomTotals[room]) {
    roomTotals[room] = 0;
  }
  roomTotals[room] += payment.amount;
  
  // Track last payment date
  if (!roomLastPayment[room] || payment.date > roomLastPayment[room]) {
    roomLastPayment[room] = payment.date;
  }
}

// Update rooms
for (const room of dataUB.rooms) {
  room.total_income = roomTotals[room.room_number] || 0;
  room.last_payment = roomLastPayment[room.room_number] || null;
}

// Write back
fs.writeFileSync(
  path.join(__dirname, 'data-ub.json'),
  JSON.stringify(dataUB, null, 2),
  'utf8'
);

console.log('💾 data-ub.json updated!');
console.log('\n📊 Summary by room:');
for (let i = 1; i <= 29; i++) {
  const total = roomTotals[i] || 0;
  const count = payments.filter(p => p.room_number === i).length;
  if (count > 0) {
    console.log(`Room ${i}: ${count} payments, Rp ${total.toLocaleString('id-ID')}`);
  }
}
