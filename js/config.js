/**
 * ============================================================
 * HOTEL MESRA - Survey App Configuration
 * ============================================================
 * 
 * LANGKAH SETUP:
 * 1. Buat Google Spreadsheet baru di drive.google.com
 * 2. Buka Extensions → Apps Script
 * 3. Paste isi file Code.gs ke dalam editor
 * 4. Klik Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy URL deployment dan paste di GOOGLE_SCRIPT_URL di bawah
 * 6. Simpan file ini
 * 
 * Lihat SETUP_GUIDE.md untuk panduan lengkap dengan gambar.
 * ============================================================
 */

const CONFIG = {
  // 🔗 URL Google Apps Script Web App (untuk simpan & ambil data)
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzQzX_GVp2e6VG4U7X9xd_6YXJhJDk0Nb-Kjo_uVkCBiUpdQ8Xcw2n1802p0CYz8BCU/exec',

  // 📋 URL Google Spreadsheet (untuk portal langsung ke sheet)
  // Cara dapat URL: buka Google Sheets Anda → copy URL dari address bar browser
  // Contoh: 'https://docs.google.com/spreadsheets/d/1xxxxx.../edit'
  SPREADSHEET_URL: 'https://docs.google.com/spreadsheets/d/1-n3K_3oeHQDjRvxlJ-uyLyAR7P5kRQRWovHZx8H5w0/edit',

  // 🏨 Informasi Hotel
  HOTEL_NAME: 'Hotel MESRA',
  HOTEL_TAGLINE: 'Tempat Tinggal Terbaik Anda',

  // 🔐 Admin Credentials (ubah sesuai kebutuhan)
  ADMIN_USERNAME: 'ITMesra',
  ADMIN_PASSWORD: 'mesra123',

  // ⏱️ Session duration (dalam milidetik) - default 8 jam
  SESSION_DURATION: 8 * 60 * 60 * 1000,

  // 📊 Rating labels
  RATING_LABELS: {
    1: 'Sangat Tidak Memuaskan',
    2: 'Kurang Memuaskan',
    3: 'Memuaskan',
    4: 'Baik',
    5: 'Cemerlang'
  },

  // 😀 Rating emojis
  RATING_EMOJIS: {
    1: '😭',
    2: '😕',
    3: '😊',
    4: '😄',
    5: '🤩'
  },

  // 🎨 Rating colors
  RATING_COLORS: {
    1: '#EF4444',
    2: '#F97316',
    3: '#EAB308',
    4: '#22C55E',
    5: '#6B4226'
  },

  // ✅ Mode demo (true = gunakan data dummy, false = pakai Google Sheets)
  // Set ke false setelah Google Apps Script dikonfigurasi
  DEMO_MODE: false
};

// Freeze config to prevent accidental modification
Object.freeze(CONFIG);
