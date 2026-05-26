const fs = require('fs');
const path = require('path');

// Read data
const dataPath = path.join(__dirname, 'data-ub.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('🔄 Updating Kos UB data...\n');

// 1. Nadiatul no 1 keluar sejak Januari, kamar kosong
const room1 = data.rooms.find(r => r.room_number === 1);
if (room1) {
  room1.tenants[0].status = 'keluar';
  room1.tenants[0].move_out = '31/01/2026';
  room1.current_tenant = null;
  room1.current_rate = 0;
  console.log('✅ Room 1: Nadiatul keluar, kamar kosong');
}

// 2. Aisyah no 5 keluar sejak Januari
const room5 = data.rooms.find(r => r.room_number === 5);
if (room5) {
  const aisyah = room5.tenants.find(t => t.name === 'Aisyah');
  if (aisyah) {
    aisyah.status = 'keluar';
    aisyah.move_out = '31/01/2026';
  }
  console.log('✅ Room 5: Aisyah keluar');
}

// 3. Reane no 9 keluar sejak Januari
const room9 = data.rooms.find(r => r.room_number === 9);
if (room9) {
  const reane = room9.tenants.find(t => t.name.toLowerCase().includes('reane'));
  if (reane) {
    reane.status = 'keluar';
    reane.move_out = '31/01/2026';
  }
  console.log('✅ Room 9: Reane keluar');
}

// 4. Desi pindah ke no 5 sejak Januari
const room4 = data.rooms.find(r => r.room_number === 4);
if (room4 && room5) {
  const desi = room4.tenants.find(t => t.name === 'Desi');
  if (desi) {
    desi.status = 'keluar';
    desi.move_out = '31/01/2026';
  }
  
  // Add Desi to room 5
  room5.tenants.push({
    name: 'Desi',
    move_in: '01/02/2026',
    status: 'aktif'
  });
  room5.current_tenant = 'Desi';
  room5.current_rate = 1200000;
  console.log('✅ Room 4: Desi keluar, pindah ke Room 5');
}

// 5. Shafia pindah ke no 4 sejak Januari, no 7 kosong
const room7 = data.rooms.find(r => r.room_number === 7);
if (room7 && room4) {
  const shafia = room7.tenants.find(t => t.name === 'Shafia');
  if (shafia) {
    shafia.status = 'keluar';
    shafia.move_out = '31/01/2026';
  }
  
  // Add Shafia to room 4
  room4.tenants.push({
    name: 'Shafia',
    move_in: '01/02/2026',
    status: 'aktif'
  });
  room4.current_tenant = 'Shafia';
  room4.current_rate = 1200000;
  
  // Room 7 kosong
  room7.current_tenant = null;
  room7.current_rate = 0;
  console.log('✅ Room 7: Shafia keluar, pindah ke Room 4, kamar kosong');
}

// 6. Riris no 18 keluar sejak Januari
const room18 = data.rooms.find(r => r.room_number === 18);
if (room18) {
  const riris = room18.tenants.find(t => t.name === 'Riris');
  if (riris) {
    riris.status = 'keluar';
    riris.move_out = '31/01/2026';
  }
  console.log('✅ Room 18: Riris keluar');
}

// 7. Avril no 24 pindah ke no 18 sejak Januari
const room24 = data.rooms.find(r => r.room_number === 24);
if (room24 && room18) {
  const avril = room24.tenants.find(t => t.name.toLowerCase().includes('avril'));
  if (avril) {
    avril.status = 'keluar';
    avril.move_out = '31/01/2026';
  }
  
  // Add Avril to room 18
  room18.tenants.push({
    name: 'Avril',
    move_in: '01/02/2026',
    status: 'aktif'
  });
  room18.current_tenant = 'Avril';
  room18.current_rate = 750000;
  
  // Room 24 kosong
  room24.current_tenant = null;
  room24.current_rate = 0;
  console.log('✅ Room 24: Avril keluar, pindah ke Room 18');
}

// Update summary
data.summary.occupied_rooms = data.rooms.filter(r => r.current_tenant).length;

// Write back
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('\n✅ Data updated successfully!');
console.log(`📊 Occupied rooms: ${data.summary.occupied_rooms}/${data.total_rooms}`);
console.log(`📊 Empty rooms: ${data.total_rooms - data.summary.occupied_rooms}`);
