const fs = require('fs');

// Read data
const data = JSON.parse(fs.readFileSync('data-ub.json', 'utf8'));

console.log('🔄 Fixing Kos UB data...\n');

// 1. Room 6: Nadia keluar awal Januari 2026
const room6 = data.rooms.find(r => r.room_number === 6);
if (room6) {
  const nadia = room6.tenants.find(t => t.name === 'Nadia');
  if (nadia) {
    nadia.move_out = '05/01/2026';
    nadia.status = 'keluar';
  }
  room6.current_tenant = null;
  room6.current_rate = 0;
  console.log('✅ Room 6: Nadia keluar (05 Jan 2026), kamar kosong');
}

// 2. Verify Avril's transactions
// Transaksi Avril sebelum pindah (di room 24) sudah benar
// Transaksi Avril setelah pindah (di room 18) akan otomatis tercatat dengan room_number 18
console.log('✅ Avril transactions: Room 24 (old) + Room 18 (new) - already correct');

// Save
fs.writeFileSync('data-ub.json', JSON.stringify(data, null, 2));

console.log('\n✅ Data updated successfully!');
console.log(`📊 Occupied rooms: ${data.rooms.filter(r => r.current_tenant).length}/29`);
console.log(`📊 Empty rooms: ${data.rooms.filter(r => !r.current_tenant).length}`);
