# 📖 Panduan Setup Google Sheets – Hotel MESRA Survey

Panduan ini menjelaskan cara menghubungkan web survey dengan Google Sheets sebagai database backend.

---

## ✅ Prasyarat

- Akun Google (Gmail)
- Akses ke Google Drive dan Google Sheets

---

## Langkah 1: Buat Google Spreadsheet

1. Buka [Google Drive](https://drive.google.com)
2. Klik **+ Baru** → **Google Spreadsheet**
3. Beri nama: **"Survey Hotel MESRA"**
4. Biarkan tab pertama kosong (akan diisi otomatis oleh script)

---

## Langkah 2: Buka Google Apps Script

1. Di Google Sheets, klik menu **Extensions** (Ekstensi)
2. Pilih **Apps Script**
3. Editor script akan terbuka di tab baru

---

## Langkah 3: Paste Kode Backend

1. Hapus semua kode default di editor (`function myFunction() {}`)
2. Buka file `Code.gs` yang ada di folder proyek ini
3. **Copy semua isinya** dan paste ke editor Apps Script
4. Klik ikon 💾 **Save** (atau Ctrl+S)
5. Beri nama project: **"Hotel MESRA Survey"**

---

## Langkah 4: Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas)
2. Pilih **New deployment**
3. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**
4. Isi form deployment:
   - **Description**: `Hotel MESRA Survey API v1`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
5. Klik **Deploy**
6. Jika diminta izin, klik **Authorize access** → pilih akun Google → klik **Allow**

> ⚠️ **Penting**: Pastikan "Who has access" diset ke **Anyone** agar form survey bisa submit data tanpa login.

---

## Langkah 5: Copy URL Web App

1. Setelah deploy berhasil, Anda akan melihat **Web app URL**
   - Contoh: `https://script.google.com/macros/s/AKfycbXXXXXXXXXXXXXXXXXXX/exec`
2. **Copy URL tersebut**

---

## Langkah 6: Update Konfigurasi Web

1. Buka file `js/config.js` di folder proyek
2. Ganti nilai `GOOGLE_SCRIPT_URL`:

```javascript
// Sebelum:
GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',

// Sesudah (paste URL Anda):
GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbXXXXXXXXXX/exec',
```

3. Ubah `DEMO_MODE` dari `true` menjadi `false`:

```javascript
// Sebelum:
DEMO_MODE: true

// Sesudah:
DEMO_MODE: false
```

4. Simpan file `config.js`

---

## Langkah 7: Test Koneksi

1. Buka `index.html` di browser
2. Pilih emoji rating
3. Tambahkan komentar (opsional)
4. Klik **Kirim Review**
5. Buka Google Sheets → Sheet "SurveyData" → data baru harus muncul ✅

---

## 🔄 Update Script (jika ada perubahan kode)

Jika Anda mengubah `Code.gs`:
1. Buka Apps Script editor
2. Klik **Deploy** → **Manage deployments**
3. Klik ✏️ edit → ubah version ke **New version**
4. Klik **Deploy**

---

## 📱 Setup QR Code

1. Buka `assets/qr.html`
2. Pastikan URL sudah benar (otomatis terisi)
3. Klik **Generate** → QR Code akan muncul
4. Klik **Download QR** untuk menyimpan gambar
5. Print dan pasang di area hotel:
   - Lobby / Resepsionis
   - Kamar tamu (meja atau pintu)
   - Restoran hotel
   - Area kolam renang

---

## 🔐 Mengubah Password Admin

Edit file `js/config.js`:

```javascript
ADMIN_USERNAME: 'admin',      // Ganti username
ADMIN_PASSWORD: 'hotel2024',  // Ganti password
```

> 💡 Untuk keamanan lebih baik di produksi, pertimbangkan menggunakan autentikasi server-side.

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Data tidak masuk ke Sheets | Pastikan "Who has access" = **Anyone** dan re-deploy |
| Error CORS | Gunakan `fetch` dengan mode `no-cors` atau periksa kembali deployment |
| Dashboard tidak load data | Cek `DEMO_MODE: false` dan URL sudah benar di `config.js` |
| QR tidak terbaca | Gunakan kamera HP dengan koneksi internet aktif |

---

## 📞 Struktur Data di Google Sheets

Sheet `SurveyData` akan berisi kolom:

| Timestamp | Rating | Label | Komentar | Hotel | ID |
|-----------|--------|-------|----------|-------|-----|
| 18/05/2024 08:30 | 5 | Cemerlang | Sangat puas! | Hotel MESRA | MSR-1716015015000 |

---

*Panduan ini dibuat untuk Hotel MESRA Survey System v1.0*
