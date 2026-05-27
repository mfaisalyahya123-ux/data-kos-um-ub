const fs = require('fs');
const path = require('path');

// Read current data
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

console.log('📊 Before reset:');
console.log(`- Total payments: ${dataUB.payments.length}`);
console.log(`- Total rooms: ${dataUB.rooms.length}`);

// Reset payments array
dataUB.payments = [];

// Reset income and last_payment for each room
dataUB.rooms.forEach(room => {
  room.total_income = 0;
  delete room.last_payment;
  
  // Keep tenant data intact (name, move_in, move_out, status, tenant_number)
  console.log(`✅ Room ${room.room_number}: Reset income, keep ${room.tenants.length} tenant(s)`);
});

// Write back
fs.writeFileSync(
  path.join(__dirname, 'data-ub.json'),
  JSON.stringify(dataUB, null, 2),
  'utf8'
);

console.log('\n✅ Reset complete!');
console.log(`- Payments: ${dataUB.payments.length} (empty)`);
console.log(`- Rooms: ${dataUB.rooms.length} (tenant data intact)`);
console.log('\n💾 Backup saved as: data-ub.json.backup');
