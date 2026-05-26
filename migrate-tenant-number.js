const fs = require('fs');

console.log('🔄 Migrating to tenant_number system...\n');

// Read both datasets
const dataUM = JSON.parse(fs.readFileSync('data-um.json', 'utf8'));
const dataUB = JSON.parse(fs.readFileSync('data-ub.json', 'utf8'));

// Migration function
function migrateTenantNumber(data, prefix) {
  let tenantCounter = 1;
  const tenantMap = {}; // name -> tenant_number
  
  // Step 1: Assign tenant_number to all unique tenants
  data.rooms.forEach(room => {
    room.tenants.forEach(tenant => {
      if (!tenantMap[tenant.name]) {
        const tenantNumber = `${prefix}${String(tenantCounter).padStart(3, '0')}`;
        tenantMap[tenant.name] = tenantNumber;
        tenant.tenant_number = tenantNumber;
        tenantCounter++;
      } else {
        tenant.tenant_number = tenantMap[tenant.name];
      }
    });
  });
  
  // Step 2: Update payments with tenant_number
  data.payments.forEach(payment => {
    const tenantNumber = tenantMap[payment.tenant_name];
    if (tenantNumber) {
      payment.tenant_number = tenantNumber;
    } else {
      console.warn(`⚠️  Warning: No tenant_number for ${payment.tenant_name}`);
    }
  });
  
  return { data, tenantMap };
}

// Migrate Kos UM
console.log('📊 Migrating Kos UM...');
const umResult = migrateTenantNumber(dataUM, 'UM');
fs.writeFileSync('data-um.json', JSON.stringify(umResult.data, null, 2));
console.log(`✅ Kos UM: ${Object.keys(umResult.tenantMap).length} unique tenants`);

// Migrate Kos UB
console.log('📊 Migrating Kos UB...');
const ubResult = migrateTenantNumber(dataUB, 'UB');
fs.writeFileSync('data-ub.json', JSON.stringify(ubResult.data, null, 2));
console.log(`✅ Kos UB: ${Object.keys(ubResult.tenantMap).length} unique tenants`);

console.log('\n✅ Migration completed!');
console.log('\n📋 Tenant Number Format:');
console.log('  - Kos UM: UM001, UM002, UM003, ...');
console.log('  - Kos UB: UB001, UB002, UB003, ...');
console.log('\n🔗 All transactions now linked to tenant_number');
