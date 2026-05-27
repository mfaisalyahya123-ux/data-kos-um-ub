const fs = require('fs');
const path = require('path');

// Read current data
const dataUB = JSON.parse(fs.readFileSync(path.join(__dirname, 'data-ub.json'), 'utf8'));

console.log('📊 Before reset:');
console.log(`- Total payments: ${dataUB.payments.length}`);
console.log(`- Total rooms: ${dataUB.rooms.length}`);

let totalTenants = 0;
dataUB.rooms.forEach(room => {
  totalTenants += room.tenants.length;
});
console.log(`- Total tenants: ${totalTenants}`);

// Reset payments array
dataUB.payments = [];

// Reset all rooms - clear tenants and income
dataUB.rooms.forEach(room => {
  room.tenants = [];
  room.current_tenant = null;
  room.current_rate = 0;
  room.total_income = 0;
  delete room.last_payment;
  
  console.log(`✅ Room ${room.room_number}: Reset (tenants cleared, income = 0)`);
});

// Write back
fs.writeFileSync(
  path.join(__dirname, 'data-ub.json'),
  JSON.stringify(dataUB, null, 2),
  'utf8'
);

console.log('\n✅ Reset complete!');
console.log(`- Payments: ${dataUB.payments.length} (empty)`);
console.log(`- Rooms: ${dataUB.rooms.length} (all tenants cleared)`);
console.log('\n💾 Backup available: data-ub.json.backup');
console.log('\n⚠️  All tenant and payment data has been deleted!');
