/**
 * ============================================================
 * HOTEL MESRA – Dashboard Logic (dashboard.js)
 * ============================================================
 */

(function () {
  'use strict';

  const SESSION_KEY = 'mesra_admin_session';

  // ── Auth Guard ─────────────────────────────────────────────
  if (!isLoggedIn()) {
    window.location.href = 'admin.html';
    return;
  }

  // ── State ──────────────────────────────────────────────────
  let allData        = [];
  let filteredData   = [];
  let currentPage    = 1;
  const ROWS_PER_PAGE = 10;
  let donutChart     = null;
  let activeTab      = 'overview';

  // ── Rating Config ──────────────────────────────────────────
  const RATING_CONFIG = {
    1: { emoji: '😭', color: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
    2: { emoji: '😕', color: '#F97316', bg: '#FFEDD5', text: '#9A3412' },
    3: { emoji: '😊', color: '#EAB308', bg: '#FEF9C3', text: '#854D0E' },
    4: { emoji: '😄', color: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
    5: { emoji: '🤩', color: '#6B4226', bg: '#F5EDE6', text: '#4A2C14' }
  };

  // ── Demo Data ──────────────────────────────────────────────
  const DEMO_DATA = [
    { id: 'MSR-001', timestamp: '18/05/2024 08:30:15', rating: 5, label: 'Cemerlang',              nomorKamar: '205', komentar: 'Pelayanan sangat luar biasa! Staf sangat ramah dan kamar sangat bersih. Pasti akan kembali lagi.', hotel: 'Hotel MESRA' },
    { id: 'MSR-002', timestamp: '18/05/2024 09:12:44', rating: 4, label: 'Baik',                   nomorKamar: '310', komentar: 'Fasilitas bagus dan lokasi strategis. Sarapan perlu ditingkatkan varietasnya.', hotel: 'Hotel MESRA' },
    { id: 'MSR-003', timestamp: '18/05/2024 10:05:22', rating: 5, label: 'Cemerlang',              nomorKamar: '101', komentar: 'Pengalaman menginap terbaik! Kolam renang terawat dan pemandangan indah.', hotel: 'Hotel MESRA' },
    { id: 'MSR-004', timestamp: '17/05/2024 14:30:10', rating: 3, label: 'Memuaskan',              nomorKamar: '402', komentar: 'Standar, tidak ada yang istimewa. WiFi kadang lambat.', hotel: 'Hotel MESRA' },
    { id: 'MSR-005', timestamp: '17/05/2024 15:45:33', rating: 5, label: 'Cemerlang',              nomorKamar: '115', komentar: 'Sangat puas! Harga sebanding dengan kualitas. Rekomendasi!', hotel: 'Hotel MESRA' },
    { id: 'MSR-006', timestamp: '17/05/2024 16:20:08', rating: 4, label: 'Baik',                   nomorKamar: '220', komentar: 'Kamar bersih dan nyaman. Staff helpful. Akan kembali lagi.', hotel: 'Hotel MESRA' },
    { id: 'MSR-007', timestamp: '16/05/2024 09:00:55', rating: 2, label: 'Kurang Memuaskan',       nomorKamar: '307', komentar: 'AC di kamar saya bermasalah dan respon maintenance lama.', hotel: 'Hotel MESRA' },
    { id: 'MSR-008', timestamp: '16/05/2024 11:15:29', rating: 5, label: 'Cemerlang',              nomorKamar: '',    komentar: '', hotel: 'Hotel MESRA' },
    { id: 'MSR-009', timestamp: '15/05/2024 13:40:17', rating: 4, label: 'Baik',                   nomorKamar: '408', komentar: 'Breakfast enak dan beragam. Lokasi dekat pusat kota.', hotel: 'Hotel MESRA' },
    { id: 'MSR-010', timestamp: '15/05/2024 17:55:42', rating: 3, label: 'Memuaskan',              nomorKamar: '103', komentar: 'Cukup baik untuk harga yang dibayarkan.', hotel: 'Hotel MESRA' },
    { id: 'MSR-011', timestamp: '14/05/2024 08:10:30', rating: 5, label: 'Cemerlang',              nomorKamar: '501', komentar: 'Pelayanan 24 jam sangat responsif. Kamar mewah dan bersih.', hotel: 'Hotel MESRA' },
    { id: 'MSR-012', timestamp: '14/05/2024 10:25:14', rating: 1, label: 'Sangat Tidak Memuaskan', nomorKamar: '212', komentar: 'Sangat kecewa. Kamar tidak sesuai foto di website.', hotel: 'Hotel MESRA' },
    { id: 'MSR-013', timestamp: '13/05/2024 12:05:08', rating: 4, label: 'Baik',                   nomorKamar: '',    komentar: '', hotel: 'Hotel MESRA' },
    { id: 'MSR-014', timestamp: '13/05/2024 14:50:22', rating: 5, label: 'Cemerlang',              nomorKamar: '318', komentar: 'Spa di sini luar biasa! Wajib dicoba.', hotel: 'Hotel MESRA' },
    { id: 'MSR-015', timestamp: '12/05/2024 09:30:44', rating: 3, label: 'Memuaskan',              nomorKamar: '104', komentar: 'Parkiran sempit dan sulit untuk kendaraan besar.', hotel: 'Hotel MESRA' },
  ];

  // ── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setCurrentDate();
    injectErrorBanner();
    loadData();
  }

  // ── Error Banner ───────────────────────────────────────────
  function injectErrorBanner() {
    if (document.getElementById('fetchErrorBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'fetchErrorBanner';
    banner.style.cssText = [
      'display:none',
      'margin:16px 24px',
      'padding:16px 20px',
      'border-radius:12px',
      'background:#FEF2F2',
      'border:1.5px solid #FECACA',
      'color:#991B1B',
      'font-family:Poppins,sans-serif',
      'font-size:0.88rem',
      'line-height:1.6',
      'box-shadow:0 2px 8px rgba(239,68,68,0.10)'
    ].join(';');
    banner.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:12px;">
        <span style="font-size:1.4rem;flex-shrink:0;">⚠️</span>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:4px;">Gagal memuat data dari Google Sheets</div>
          <div id="fetchErrorDetail" style="color:#B91C1C;margin-bottom:10px;"></div>
          <div style="background:#FEE2E2;border-radius:8px;padding:10px 14px;margin-bottom:10px;font-size:0.82rem;color:#7F1D1D;">
            <b>Kemungkinan penyebab:</b>
            <ul style="margin:6px 0 0 16px;padding:0;">
              <li>Google Apps Script belum di-deploy atau URL sudah kadaluarsa</li>
              <li>Pengaturan akses bukan <b>Anyone</b> (harus publik)</li>
              <li>Browser memblokir request (CORS) dari GitHub Pages</li>
            </ul>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;">
            <button onclick="window.refreshData()" style="background:#DC2626;color:#fff;border:none;border-radius:8px;padding:7px 18px;font-family:Poppins,sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;">🔄 Coba Lagi</button>
            <a href="https://script.google.com/home/projects" target="_blank" style="background:#fff;color:#DC2626;border:1.5px solid #FECACA;border-radius:8px;padding:7px 18px;font-family:Poppins,sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;text-decoration:none;">🔧 Buka Apps Script</a>
            <button onclick="window.loadDemoFallback()" style="background:#f5f5f5;color:#555;border:1.5px solid #ddd;border-radius:8px;padding:7px 18px;font-family:Poppins,sans-serif;font-size:0.83rem;font-weight:600;cursor:pointer;">👁️ Tampilkan Data Demo</button>
          </div>
        </div>
        <button onclick="document.getElementById('fetchErrorBanner').style.display='none'" style="background:none;border:none;font-size:1.2rem;color:#EF4444;cursor:pointer;flex-shrink:0;padding:0;">✕</button>
      </div>
    `;
    // Sisipkan setelah header / sebelum konten utama
    const main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    main.insertBefore(banner, main.firstChild);
  }

  function showError(message) {
    const banner = document.getElementById('fetchErrorBanner');
    const detail = document.getElementById('fetchErrorDetail');
    if (!banner || !detail) return;
    detail.textContent = message;
    banner.style.display = 'block';
    banner.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideError() {
    const banner = document.getElementById('fetchErrorBanner');
    if (banner) banner.style.display = 'none';
  }

  function setCurrentDate() {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent =
      now.toLocaleDateString('id-ID', opts);
  }

  // ── Tab Switching ──────────────────────────────────────────
  window.switchTab = function (tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));

    if (tab === 'overview') {
      document.getElementById('tabOverview').classList.add('active');
      document.getElementById('navOverview').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Overview';
      document.getElementById('pageSubtitle').textContent = 'Ringkasan analitik survey kepuasan pelanggan';
    } else {
      document.getElementById('tabData').classList.add('active');
      document.getElementById('navData').classList.add('active');
      document.getElementById('pageTitle').textContent = 'Data Survey';
      document.getElementById('pageSubtitle').textContent = 'Seluruh data responden survey';
      renderTable(filteredData);
    }
  };

  // ── Data Loading ───────────────────────────────────────────
  window.refreshData = function () {
    loadData();
  };

  async function loadData() {
    showLoading(true);
    hideError();

    try {
      if (CONFIG.DEMO_MODE || !CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Mode demo — sengaja pakai data dummy
        await sleep(800);
        allData = DEMO_DATA;
        renderDashboard(allData);
      } else {
        // Fetch dari Google Sheets (dengan timeout 10 detik)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        let res;
        try {
          res = await fetch(CONFIG.GOOGLE_SCRIPT_URL, { signal: controller.signal });
        } catch (fetchErr) {
          clearTimeout(timeout);
          if (fetchErr.name === 'AbortError') {
            throw new Error('Request timeout (>10 detik). Periksa koneksi atau URL Apps Script.');
          }
          throw new Error(
            'Tidak bisa terhubung ke Google Apps Script. ' +
            'Kemungkinan CORS diblokir atau URL tidak valid. Detail: ' + fetchErr.message
          );
        }
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Server merespons dengan status HTTP ${res.status} (${res.statusText}).`);
        }

        let json;
        try {
          json = await res.json();
        } catch {
          throw new Error('Respons dari Apps Script bukan format JSON yang valid.');
        }

        if (json.success) {
          hideError();
          allData = json.data || [];
          renderDashboard(allData);
        } else {
          throw new Error('Apps Script melaporkan error: ' + (json.message || 'Tidak ada keterangan.'));
        }
      }
    } catch (err) {
      console.error('Load error:', err);
      // Tampilkan error banner — TIDAK fallback ke data dummy secara diam-diam
      showError(err.message);
      // Render tabel kosong agar halaman tidak blank
      allData = [];
      renderDashboard([]);
    } finally {
      showLoading(false);
    }
  }

  // Tombol "Tampilkan Data Demo" di banner error
  window.loadDemoFallback = function () {
    hideError();
    allData = DEMO_DATA;
    renderDashboard(allData);
  };

  // ── Render Dashboard ───────────────────────────────────────
  function renderDashboard(data) {
    filteredData = [...data];

    // Stats
    renderStats(data);

    // Charts
    renderDonutChart(data);
    renderRatingDistBars(data);

    // Latest comments
    renderLatestComments(data);

    // Table
    renderTable(filteredData);
  }

  // ── Stat Cards ──────────────────────────────────────────────
  function renderStats(data) {
    const total      = data.length;
    const sumRating  = data.reduce((s, d) => s + (d.rating || 0), 0);
    const avgRating  = total > 0 ? (sumRating / total) : 0;
    const satisfied  = data.filter(d => d.rating >= 4).length;
    const satRate    = total > 0 ? ((satisfied / total) * 100) : 0;
    const withComment = data.filter(d => d.komentar && d.komentar.trim()).length;

    // Animate counter
    animateCounter('statTotal',    0, total,    0, '');
    animateCounter('statAvg',      0, avgRating, 1, '');
    animateCounter('statSatisfied',0, satRate,   1, '%');
    animateCounter('statComments', 0, withComment, 0, '');

    // Trends (mock)
    setTrend('statAvgTrend',       avgRating >= 4 ? 'up' : 'neu', avgRating >= 4 ? '↑ Sangat baik' : '→ Perlu perhatian');
    setTrend('statSatisfiedTrend', satRate >= 70   ? 'up' : 'neu', satRate >= 70  ? '↑ Target tercapai' : '→ Masih berkembang');
  }

  function animateCounter(id, from, to, decimals, suffix) {
    const el = document.getElementById(id);
    if (!el) return;
    const duration = 1200;
    const start    = performance.now();

    function update(now) {
      const elapsed = Math.min(now - start, duration);
      const progress = elapsed / duration;
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      const val = from + (to - from) * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (elapsed < duration) requestAnimationFrame(update);
      else el.textContent = to.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(update);
  }

  function setTrend(id, type, text) {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = `stat-trend trend-${type}`;
    el.textContent = text;
  }

  // ── Donut Chart ────────────────────────────────────────────
  function renderDonutChart(data) {
    const dist   = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(d => { if (d.rating >= 1 && d.rating <= 5) dist[d.rating]++; });

    const labels = ['Sangat Tidak\nMemuaskan', 'Kurang\nMemuaskan', 'Memuaskan', 'Baik', 'Cemerlang'];
    const values = [dist[1], dist[2], dist[3], dist[4], dist[5]];
    const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#6B4226'];

    const ctx = document.getElementById('donutChart').getContext('2d');

    if (donutChart) donutChart.destroy();

    donutChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
        datasets: [{
          data  : values,
          backgroundColor: colors,
          borderColor    : colors.map(c => c),
          borderWidth    : 2,
          hoverOffset    : 8
        }]
      },
      options: {
        responsive        : true,
        maintainAspectRatio: true,
        cutout            : '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct   = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0;
                return ` ${CONFIG.RATING_LABELS[ctx.dataIndex + 1]}: ${ctx.parsed} (${pct}%)`;
              }
            },
            titleFont    : { family: 'Poppins', weight: '700' },
            bodyFont     : { family: 'Poppins' },
            backgroundColor: 'rgba(44,24,16,0.9)',
            titleColor   : '#FFFFFF',
            bodyColor    : '#E8D5C4',
            borderColor  : 'rgba(255,255,255,0.1)',
            borderWidth  : 1,
            padding      : 12
          }
        },
        animation: { animateRotate: true, duration: 1200 }
      }
    });

    // Custom legend
    const legendEl = document.getElementById('donutLegend');
    const total = data.length;
    legendEl.innerHTML = [1,2,3,4,5].map(r => {
      const pct = total > 0 ? ((dist[r] / total) * 100).toFixed(0) : 0;
      return `
        <div style="display:flex; align-items:center; gap:5px; font-size:0.72rem; font-family:'Poppins',sans-serif;">
          <span style="width:10px; height:10px; border-radius:50%; background:${RATING_CONFIG[r].color}; flex-shrink:0;"></span>
          <span style="color:var(--muted);">${RATING_CONFIG[r].emoji} ${pct}%</span>
        </div>
      `;
    }).join('');
  }

  // ── Rating Distribution Bars ────────────────────────────────
  function renderRatingDistBars(data) {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    data.forEach(d => { if (d.rating >= 1 && d.rating <= 5) dist[d.rating]++; });

    const max   = Math.max(...Object.values(dist)) || 1;
    const total = data.length;

    const container = document.getElementById('ratingDistList');
    container.innerHTML = [5,4,3,2,1].map(r => {
      const count = dist[r];
      const pct   = ((count / max) * 100).toFixed(1);
      return `
        <div class="rating-dist-item">
          <div class="rating-dist-label">${r}★</div>
          <div class="rating-dist-bar-track">
            <div class="rating-dist-bar-fill"
                 style="width:0%; background:${RATING_CONFIG[r].color};"
                 data-target="${pct}">
            </div>
          </div>
          <div class="rating-dist-count">${count}</div>
        </div>
      `;
    }).join('');

    // Animate bars
    setTimeout(() => {
      container.querySelectorAll('.rating-dist-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    }, 200);
  }

  // ── Latest Comments ─────────────────────────────────────────
  function renderLatestComments(data) {
    const withComment = data.filter(d => d.komentar && d.komentar.trim()).slice(0, 5);
    const container   = document.getElementById('latestComments');

    if (withComment.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">💬</div><p>Belum ada komentar</p></div>`;
      return;
    }

    container.innerHTML = withComment.map(d => {
      const cfg = RATING_CONFIG[d.rating] || RATING_CONFIG[3];
      const kamarBadge = d.nomorKamar
        ? `<span style="font-size:0.72rem; background:var(--primary-50); color:var(--primary); padding:2px 8px; border-radius:var(--radius-full); font-weight:600; margin-left:6px;">🔑 Kamar ${escapeHtml(d.nomorKamar)}</span>`
        : '';
      return `
        <div class="comment-item">
          <div class="comment-header">
            <div class="comment-rating">
              <span class="comment-emoji">${cfg.emoji}</span>
              <span class="comment-label badge" style="background:${cfg.bg}; color:${cfg.text};">${d.label}</span>
              ${kamarBadge}
            </div>
            <span class="comment-time">${d.timestamp}</span>
          </div>
          <div class="comment-text">"${escapeHtml(d.komentar)}"</div>
        </div>
      `;
    }).join('');
  }

  // ── Data Table ──────────────────────────────────────────────
  window.filterTable = function () {
    const search       = (document.getElementById('searchInput').value || '').toLowerCase();
    const ratingFilter = document.getElementById('filterRating').value;

    filteredData = allData.filter(d => {
      const matchSearch = !search ||
        (d.komentar   && d.komentar.toLowerCase().includes(search)) ||
        (d.label      && d.label.toLowerCase().includes(search)) ||
        (d.timestamp  && d.timestamp.toLowerCase().includes(search)) ||
        (d.nomorKamar && d.nomorKamar.toLowerCase().includes(search));

      const matchRating = !ratingFilter || String(d.rating) === ratingFilter;
      return matchSearch && matchRating;
    });

    currentPage = 1;
    renderTable(filteredData);
  };

  function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end   = start + ROWS_PER_PAGE;
    const page  = data.slice(start, end);

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <div class="empty-icon">📋</div>
              <p>Tidak ada data yang ditemukan</p>
            </div>
          </td>
        </tr>
      `;
      document.getElementById('paginationInfo').textContent = '0 data';
      document.getElementById('paginationBtns').innerHTML  = '';
      return;
    }

    tbody.innerHTML = page.map((d, i) => {
      const cfg   = RATING_CONFIG[d.rating] || RATING_CONFIG[3];
      const kmt   = d.komentar ? escapeHtml(d.komentar) : '<span style="color:var(--muted-light);font-style:italic;">–</span>';
      const kamar = d.nomorKamar ? `<span class="badge badge-primary" style="font-size:0.78rem;">🔑 ${escapeHtml(d.nomorKamar)}</span>` : '<span style="color:var(--muted-light);font-style:italic;">–</span>';
      return `
        <tr>
          <td style="color:var(--muted); font-size:0.8rem;">${start + i + 1}</td>
          <td style="font-size:0.82rem; white-space:nowrap;">${d.timestamp}</td>
          <td>
            <span style="font-size:1.1rem;">${cfg.emoji}</span>
            <span style="font-weight:700; color:${cfg.color}; margin-left:4px;">${d.rating}</span>
          </td>
          <td>
            <span class="badge" style="background:${cfg.bg}; color:${cfg.text};">${d.label}</span>
          </td>
          <td style="text-align:center;">${kamar}</td>
          <td style="max-width:260px; font-size:0.85rem; color:var(--text-secondary);">${kmt}</td>
          <td style="font-size:0.75rem; color:var(--muted-light); font-family:monospace;">${d.id}</td>
        </tr>
      `;
    }).join('');

    // Pagination info
    const from = start + 1;
    const to   = Math.min(end, data.length);
    document.getElementById('paginationInfo').textContent =
      `Menampilkan ${from}–${to} dari ${data.length} data`;

    renderPagination(data.length);
  }

  function renderPagination(total) {
    const totalPages = Math.ceil(total / ROWS_PER_PAGE);
    const container  = document.getElementById('paginationBtns');

    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';

    // Prev
    html += `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>`;

    // Pages
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
      } else if (Math.abs(i - currentPage) === 2) {
        html += `<button class="page-btn" disabled>…</button>`;
      }
    }

    // Next
    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>`;

    container.innerHTML = html;
  }

  window.changePage = function (page) {
    const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTable(filteredData);
  };

  // ── CSV Export ──────────────────────────────────────────────
  window.exportCSV = function () {
    if (filteredData.length === 0) { alert('Tidak ada data untuk diexport.'); return; }

    const headers = ['No', 'Timestamp', 'Rating', 'Label', 'No. Kamar', 'Komentar', 'Hotel', 'ID'];
    const rows    = filteredData.map((d, i) => [
      i + 1,
      `"${d.timestamp}"`,
      d.rating,
      `"${d.label}"`,
      `"${(d.nomorKamar || '')}"`,
      `"${(d.komentar || '').replace(/"/g, '""')}"`,
      `"${d.hotel}"`,
      d.id
    ].join(','));

    const csv  = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `Survey_HotelMESRA_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ── Logout ──────────────────────────────────────────────────
  window.doLogout = function () {
    if (confirm('Yakin ingin keluar dari dashboard?')) {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'admin.html';
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
  }

  // ── Helpers ─────────────────────────────────────────────────
  function isLoggedIn() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return false;
      const session = JSON.parse(raw);
      return session && session.expiresAt && Date.now() < session.expiresAt;
    } catch {
      return false;
    }
  }

  // KODE BARU — tambahkan konversi toString() di awal
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)         // ← konversi apapun ke string dulu
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();
