# Version 1.1.0 - Tenant Number System

## 🆕 What's New

### Tenant Number System
- **Unique ID** untuk setiap penghuni: `UM001`, `UM002`, ... (Kos UM) dan `UB001`, `UB002`, ... (Kos UB)
- **Transaksi terikat ke `tenant_number`** (bukan nama atau kamar)
- **Full history tracking** - Bisa track penghuni yang pindah kamar
- **Data integrity** - Tidak ada duplikasi atau kehilangan data saat pindah kamar

## 📊 Data Structure

### Tenants
```json
{
  "tenant_number": "UM001",
  "name": "Nur Qomaria",
  "current_room": 1,
  "status": "aktif",
  "move_in": "30/11/2025",
  "move_out": null
}
```

### Transactions
```json
{
  "id": 1,
  "date": "02 Mei 2026",
  "tenant_number": "UM001",  // Primary key
  "tenant_name": "Nur Qomaria",
  "room_number": 1,
  "amount": 1200000,
  "payment_method": "tf",
  "period": "mei"
}
```

## 🔄 Migration

Semua data existing sudah di-migrate otomatis:
- ✅ 19 tenants Kos UM → UM001 - UM019
- ✅ 29 tenants Kos UB → UB001 - UB029
- ✅ 238 transaksi Kos UM updated
- ✅ 415 transaksi Kos UB updated

## 🎯 Benefits

1. **Tracking Perpindahan Kamar**
   - Desi (UM004): Room 4 → Room 5
   - Shafia (UM007): Room 7 → Room 4
   - Avril (UB024): Room 24 → Room 18
   - Semua transaksi tetap terlacak dengan `tenant_number`

2. **Data Integrity**
   - Tidak ada kehilangan data saat pindah kamar
   - Total pendapatan akurat per penghuni
   - History lengkap di semua kamar

3. **Future-Proof**
   - Siap untuk fitur advanced (laporan per penghuni, analitik, dll)
   - Mudah untuk export/import data
   - Konsisten dengan best practices database design

## 🔙 Rollback

Jika perlu kembali ke v1.0.1:
```bash
git checkout v1.0.1
```

## 📝 Notes

- Website tetap tampil nama penghuni (user-friendly)
- `tenant_number` hanya untuk internal tracking
- Backward compatible dengan data lama
