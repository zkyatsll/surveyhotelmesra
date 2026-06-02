/**
 * ============================================================
 * HOTEL MESRA - Google Apps Script Backend  (v2 - with Nomor Kamar)
 * ============================================================
 * PERUBAHAN v2:
 * - Auto-migrasi: Deteksi sheet lama dan sisipkan kolom "Nomor Kamar"
 *   secara otomatis tanpa perlu hapus data yang sudah ada.
 * - doGet() membaca kolom berdasarkan NAMA header (bukan posisi),
 *   sehingga tidak terpengaruh urutan kolom di sheet.
 * - doPost() juga menulis ke kolom yang tepat berdasarkan mapping header.
 * ============================================================
 */

const SHEET_NAME = 'SurveyData';

// Definisi kolom yang diharapkan (urutan ini yang akan dipakai saat buat sheet baru)
const EXPECTED_HEADERS = [
  'Timestamp',
  'Rating',
  'Label',
  'Komentar',
  'Nomor Kamar',
  'Hotel',
  'ID'
];

// ─────────────────────────────────────────────────────────────
// INIT SHEET — Buat sheet jika belum ada, atau migrasi jika
// sheet lama tidak punya kolom "Nomor Kamar"
// ─────────────────────────────────────────────────────────────
function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // Sheet belum ada sama sekali → buat baru
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(EXPECTED_HEADERS);
    formatHeader(sheet);
    setColumnWidths(sheet);
    Logger.log('Sheet baru dibuat dengan ' + EXPECTED_HEADERS.length + ' kolom.');
  } else {
    // Sheet sudah ada → cek apakah perlu migrasi
    migrateSheetIfNeeded(sheet);
  }

  return sheet;
}

/**
 * Cek dan tambahkan kolom "Nomor Kamar" jika belum ada di sheet lama.
 * Kolom disisipkan antara "Komentar" (col 4) dan "Hotel" (col 5).
 */
function migrateSheetIfNeeded(sheet) {
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Cek apakah "Nomor Kamar" sudah ada
  const hasNomorKamar = headerRow.some(function(h) {
    return h.toString().trim().toLowerCase() === 'nomor kamar';
  });

  if (!hasNomorKamar) {
    // Cari posisi kolom "Hotel" untuk menyisipkan sebelumnya
    let hotelColIndex = -1;
    for (var i = 0; i < headerRow.length; i++) {
      if (headerRow[i].toString().trim().toLowerCase() === 'hotel') {
        hotelColIndex = i + 1; // 1-indexed
        break;
      }
    }

    if (hotelColIndex === -1) {
      // "Hotel" tidak ditemukan, sisipkan setelah "Komentar" (kolom 5)
      hotelColIndex = 5;
    }

    // Sisipkan kolom baru di posisi hotelColIndex
    sheet.insertColumnBefore(hotelColIndex);
    sheet.getRange(1, hotelColIndex).setValue('Nomor Kamar');

    // Format header baru
    formatHeader(sheet);
    setColumnWidths(sheet);

    Logger.log('Migrasi berhasil: kolom "Nomor Kamar" ditambahkan di kolom ' + hotelColIndex);
  } else {
    Logger.log('Sheet sudah memiliki kolom "Nomor Kamar", tidak perlu migrasi.');
  }
}

/**
 * Format baris header dengan style coklat
 */
function formatHeader(sheet) {
  const lastCol = sheet.getLastColumn();
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#6B4226');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

/**
 * Set lebar kolom standar
 */
function setColumnWidths(sheet) {
  const widths = {
    'Timestamp'   : 180,
    'Rating'      : 70,
    'Label'       : 180,
    'Komentar'    : 300,
    'Nomor Kamar' : 110,
    'Hotel'       : 120,
    'ID'          : 190
  };

  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headerRow.forEach(function(header, i) {
    var w = widths[header.toString().trim()];
    if (w) sheet.setColumnWidth(i + 1, w);
  });
}

/**
 * Bangun mapping nama-kolom → index (0-based) dari baris header sheet
 */
function buildColMap(sheet) {
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = {};
  headerRow.forEach(function(h, i) {
    map[h.toString().trim().toLowerCase()] = i;
  });
  return map;
}

// ─────────────────────────────────────────────────────────────
// doPost — Terima data survey dari form pelanggan
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validasi rating
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return createResponse({ success: false, message: 'Rating tidak valid (harus 1–5)' });
    }

    const sheet  = initSheet();
    const colMap = buildColMap(sheet);
    const id     = 'MSR-' + Date.now();

    // Format timestamp WIB (Asia/Jakarta)
    const now       = new Date();
    const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');

    // Buat row kosong sesuai jumlah kolom yang ada
    const numCols = sheet.getLastColumn();
    const newRow  = new Array(numCols).fill('');

    // Isi kolom berdasarkan mapping header (kebal terhadap urutan kolom)
    if (colMap['timestamp']    !== undefined) newRow[colMap['timestamp']]    = timestamp;
    if (colMap['rating']       !== undefined) newRow[colMap['rating']]       = parseInt(data.rating);
    if (colMap['label']        !== undefined) newRow[colMap['label']]        = data.label || getRatingLabel(data.rating);
    if (colMap['komentar']     !== undefined) newRow[colMap['komentar']]     = data.komentar  || '';
    if (colMap['nomor kamar']  !== undefined) newRow[colMap['nomor kamar']]  = data.nomorKamar || '';
    if (colMap['hotel']        !== undefined) newRow[colMap['hotel']]        = data.hotel || 'Hotel MESRA';
    if (colMap['id']           !== undefined) newRow[colMap['id']]           = id;

    sheet.appendRow(newRow);

    Logger.log('Data berhasil disimpan: Rating=' + data.rating + ', Kamar=' + (data.nomorKamar || '-') + ', ID=' + id);

    return createResponse({
      success : true,
      message : 'Terima kasih! Review Anda telah berhasil disimpan.',
      id      : id
    });

  } catch (err) {
    Logger.log('Error doPost: ' + err.toString());
    return createResponse({
      success : false,
      message : 'Terjadi kesalahan server: ' + err.toString()
    });
  }
}

// ─────────────────────────────────────────────────────────────
// doGet — Kirim semua data ke dashboard admin
// ─────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const sheet = initSheet();
    const rows  = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return createResponse({ success: true, data: [], total: 0 });
    }

    // Bangun mapping kolom dari baris header (row 0)
    const colMap = {};
    rows[0].forEach(function(h, i) {
      colMap[h.toString().trim().toLowerCase()] = i;
    });

    // Fungsi bantu ambil nilai kolom (aman jika kolom tidak ada)
    function col(row, name) {
      var idx = colMap[name.toLowerCase()];
      return (idx !== undefined) ? row[idx] : '';
    }

    // Parse setiap baris data (skip header)
    const data = rows.slice(1)
      .map(function(row, index) {
        return {
          id         : col(row, 'id')          || ('MSR-' + (index + 1)),
          timestamp  : col(row, 'timestamp'),
          rating     : parseInt(col(row, 'rating')) || 0,
          label      : col(row, 'label'),
          komentar   : col(row, 'komentar'),
          nomorKamar : col(row, 'nomor kamar'),   // ← kunci fix utama
          hotel      : col(row, 'hotel')
        };
      })
      .filter(function(row) {
        return row.rating >= 1 && row.rating <= 5;
      });

    // Hitung statistik ringkasan
    const total      = data.length;
    const sumRating  = data.reduce(function(s, d) { return s + d.rating; }, 0);
    const avgRating  = total > 0 ? (sumRating / total).toFixed(2) : '0';
    const satisfied  = data.filter(function(d) { return d.rating >= 4; }).length;
    const satRate    = total > 0 ? ((satisfied / total) * 100).toFixed(1) : '0';
    const withCmt    = data.filter(function(d) { return d.komentar && d.komentar.trim(); }).length;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(function(d) { distribution[d.rating]++; });

    return createResponse({
      success : true,
      data    : data.reverse(),   // Terbaru di atas
      total   : total,
      stats   : {
        avgRating        : parseFloat(avgRating),
        satisfactionRate : parseFloat(satRate),
        withComment      : withCmt,
        distribution     : distribution
      }
    });

  } catch (err) {
    Logger.log('Error doGet: ' + err.toString());
    return createResponse({
      success : false,
      message : 'Terjadi kesalahan: ' + err.toString()
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function createResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getRatingLabel(rating) {
  var labels = {
    1: 'Sangat Tidak Memuaskan',
    2: 'Kurang Memuaskan',
    3: 'Memuaskan',
    4: 'Baik',
    5: 'Cemerlang'
  };
  return labels[rating] || 'Tidak Diketahui';
}

// ─────────────────────────────────────────────────────────────
// Fungsi Utilitas — Jalankan manual dari Apps Script editor
// ─────────────────────────────────────────────────────────────

/** Jalankan ini satu kali untuk migrasi sheet lama secara manual */
function runMigration() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('Sheet "' + SHEET_NAME + '" tidak ditemukan!');
    return;
  }
  migrateSheetIfNeeded(sheet);
  Logger.log('Selesai. Silakan refresh Google Sheets Anda.');
}

/** Test submit data */
function testPost() {
  var testData = {
    postData: {
      contents: JSON.stringify({
        rating     : 5,
        label      : 'Cemerlang',
        komentar   : 'Pelayanan sangat memuaskan!',
        nomorKamar : '205',
        hotel      : 'Hotel MESRA'
      })
    }
  };
  var result = doPost(testData);
  Logger.log(result.getContent());
}

/** Test GET data */
function testGet() {
  var result = doGet({});
  var json   = JSON.parse(result.getContent());
  Logger.log('Total data: ' + json.total);
  if (json.data && json.data.length > 0) {
    Logger.log('Contoh baris pertama: ' + JSON.stringify(json.data[0]));
  }
}
