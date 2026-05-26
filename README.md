# Data Kos UM/UB - Version 1.0.0

## 📋 Fitur Lengkap

### 1. Toggle UM/UB
- Switch antara Kos UM (10 kamar) dan Kos UB (29 kamar)
- Dynamic title berubah sesuai kos yang dipilih

### 2. 📋 Tabel Pembayaran 2025/2026
- Matrix kamar × bulan (12 bulan)
- Toggle year: 2025 / 2026
- Toggle month format: 1-12 ↔ Jan-Des
- Status pembayaran:
  - ✓ Sudah bayar (hijau)
  - X Belum bayar (merah)
  - \- Belum jatuh tempo / tidak applicable (abu-abu)
- Countdown jatuh tempo (hitung mundur hari)

### 3. 🏠 Daftar Kamar & Status Penghuni
- Format compact (5 kolom)
- Status: 🟢 Terisi / 🔴 Kosong
- Info: Kamar, Penghuni, Tarif, Tgl Bayar, Total Pendapatan
- Total pendapatan hanya hitung pembayaran penghuni aktif

### 4. 📊 Riwayat Pembayaran
- **Quick Period Filter:**
  - Semua
  - 1 Bulan
  - 3 Bulan
  - 6 Bulan
- **Advanced Filters:**
  - Filter Kamar (dropdown)
  - Filter Tahun (2025, 2026)
  - Filter Bulan (Januari-Desember, urut kalender)
  - Sort by: Terbaru, Terlama, Jumlah Tertinggi/Terendah, Kamar
- **Result Count:** Menampilkan jumlah transaksi yang ditampilkan
- **Reset Button:** Kembali ke default (semua data)

## 📊 Data

### Kos UM
- Total kamar: 10
- Total transaksi: 238 (66 transaksi 2025 + 172 transaksi 2026)
- Total pendapatan: Rp 243.200.000
- Periode: Januari 2025 - Mei 2026

### Kos UB
- Total kamar: 29
- Total transaksi: 415
- Total pendapatan: Rp 405.500.000
- Periode: Januari 2025 - Mei 2026

## 🛠️ Technical Stack

- **Frontend:** Pure HTML + CSS + JavaScript (no framework)
- **Data Format:** JSON
- **Deployment:** GitHub Pages
- **Repository:** https://github.com/mfaisalyahya123-ux/data-kos-um-ub
- **Website:** https://mfaisalyahya123-ux.github.io/data-kos-um-ub/

## 📝 Files

- `generate.js` - Main generator script
- `data-um.json` - Kos UM data (238 payments)
- `data-ub.json` - Kos UB data (415 payments)
- `index.html` - Generated website (auto-generated, do not edit manually)
- `merge-2025.js` - Script untuk import data 2025 dari CSV
- `convert-ub.js` - Script untuk convert CSV Kos UB ke JSON

## 🚀 How to Update

### Add New Transaction
1. Edit `data-um.json` atau `data-ub.json`
2. Add new payment object to `payments` array
3. Run `node generate.js`
4. Commit and push

### Import from CSV
1. Prepare CSV file (format: Tgl Pembayaran, No Kamar, Nama, Jumlah, Via, Keterangan)
2. Create merge script (see `merge-2025.js` as example)
3. Run merge script
4. Run `node generate.js`
5. Commit and push

## 📅 Changelog

### v1.0.0 (26 Mei 2026)
- ✅ Toggle UM/UB
- ✅ Dynamic title
- ✅ Tabel Pembayaran 2025/2026 dengan toggle month format
- ✅ Daftar Kamar & Status Penghuni (compact format)
- ✅ Riwayat Pembayaran dengan advanced filters
- ✅ Quick period filter (1/3/6 bulan)
- ✅ Import 66 transaksi 2025 dari CSV
- ✅ Case-insensitive month filter
- ✅ Support date format "DD Bulan YYYY"
- ✅ Sort by multiple criteria
- ✅ Result count display

## 🐛 Known Issues

None at the moment.

## 📞 Contact

- Owner: Rahma Cahyani (@Wdynrhmc26)
- Bot: @PembangunanUM_Bot
- Developer: Pembangunan_UM Bot 🦞

---

**Last Updated:** 26 Mei 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready
