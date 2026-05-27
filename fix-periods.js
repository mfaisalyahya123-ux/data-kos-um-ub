const fs = require('fs');
const d = JSON.parse(fs.readFileSync('data-ub.json', 'utf8'));

const monthMap = {
  'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
  'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
  'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
};
const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

let changes = 0;

for (const p of d.payments) {
  // Parse payment date: "4 Januari 2026"
  const dateParts = p.date.split(' ');
  const payDay = parseInt(dateParts[0]);
  const payMonth = monthMap[dateParts[1].toLowerCase()];
  const payYear = parseInt(dateParts[2]);

  // Parse current period
  const periodLower = p.period.toLowerCase().trim();
  let periodMonth = monthMap[periodLower];
  
  if (!periodMonth) {
    console.log('SKIP unknown period:', p.period, '|', p.tenant_name, p.date);
    continue;
  }

  // Determine period year
  let periodYear;
  
  // Rule: if paying in Jan-Mar for Oct-Dec → previous year
  if (payMonth <= 3 && periodMonth >= 10) {
    periodYear = payYear - 1;
  }
  // Rule: if paying in Oct-Dec for Jan-Mar → next year
  else if (payMonth >= 10 && periodMonth <= 3) {
    periodYear = payYear + 1;
  }
  // Otherwise: same year
  else {
    periodYear = payYear;
  }

  const newPeriod = `${monthNames[periodMonth]} ${periodYear}`;
  
  if (p.period !== newPeriod.toLowerCase() && p.period !== newPeriod) {
    console.log(`${p.tenant_name} | bayar ${p.date} | "${p.period}" → "${newPeriod}" | Rp ${p.amount.toLocaleString('id-ID')}`);
    p.period = newPeriod;
    changes++;
  }
}

fs.writeFileSync('data-ub.json', JSON.stringify(d, null, 2));
console.log(`\n✅ Updated ${changes} period fields`);