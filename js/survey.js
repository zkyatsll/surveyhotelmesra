/**
 * ============================================================
 * HOTEL MESRA – Survey Page Logic (survey.js)
 * ============================================================
 */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  let selectedRating = null;
  let selectedLabel  = null;
  let currentStep    = 1;

  // ── DOM Refs ───────────────────────────────────────────────
  const emojiGrid       = document.getElementById('emojiGrid');
  const ratingFill      = document.getElementById('ratingFill');
  const ratingText      = document.getElementById('ratingText');
  const nextBtn         = document.getElementById('nextBtn');
  const backBtn         = document.getElementById('backBtn');
  const submitBtn       = document.getElementById('submitBtn');
  const komentarInput   = document.getElementById('komentarInput');
  const nomorKamarInput = document.getElementById('nomorKamarInput');
  const charCount       = document.getElementById('charCount');
  const step1El         = document.getElementById('step1');
  const step2El         = document.getElementById('step2');
  const sInd1         = document.getElementById('sInd1');
  const sInd2         = document.getElementById('sInd2');
  const sInd3         = document.getElementById('sInd3');
  const selectedDisp  = document.getElementById('selectedRatingDisplay');

  // ── Rating Config ──────────────────────────────────────────
  const RATING_COLORS = {
    1: { fill: '#EF4444', bg: '#FEE2E2', text: '#B91C1C' },
    2: { fill: '#F97316', bg: '#FFEDD5', text: '#9A3412' },
    3: { fill: '#EAB308', bg: '#FEF9C3', text: '#854D0E' },
    4: { fill: '#22C55E', bg: '#DCFCE7', text: '#15803D' },
    5: { fill: '#6B4226', bg: '#F5EDE6', text: '#4A2C14' }
  };

  // ── Emoji Buttons ──────────────────────────────────────────
  emojiGrid.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      // Remove previous selection
      emojiGrid.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));

      // Select this
      this.classList.add('selected');
      selectedRating = parseInt(this.dataset.value);
      selectedLabel  = this.dataset.label;

      // Trigger ripple
      const ripple = this.querySelector('.emoji-ripple');
      ripple.style.animation = 'none';
      ripple.offsetHeight;
      ripple.style.animation = '';

      // Update rating bar
      updateRatingBar(selectedRating, selectedLabel);

      // Enable next button
      nextBtn.disabled = false;
      nextBtn.style.animation = 'bounceIn 0.4s ease';
      setTimeout(() => { nextBtn.style.animation = ''; }, 400);
    });
  });

  function updateRatingBar(rating, label) {
    const pct = (rating / 5) * 100;
    const col = RATING_COLORS[rating];

    ratingFill.style.width = pct + '%';
    ratingFill.style.background = col.fill;
    ratingText.textContent = `${rating}/5 – ${label}`;
    ratingText.style.color = col.text;
  }

  // ── Step Navigation ────────────────────────────────────────
  nextBtn.addEventListener('click', function () {
    if (!selectedRating) return;
    goToStep(2);
  });

  backBtn.addEventListener('click', function () {
    goToStep(1);
  });

  function goToStep(step) {
    if (step === 2) {
      step1El.classList.remove('active');
      step2El.classList.add('active');
      sInd1.classList.remove('active');
      sInd1.classList.add('done');
      sInd1.querySelector('.step-number').textContent = '✓';
      sInd2.classList.add('active');

      // Populate selected rating display
      populateSelectedDisplay();
      currentStep = 2;
    } else {
      step2El.classList.remove('active');
      step1El.classList.add('active');
      sInd2.classList.remove('active');
      sInd1.classList.add('active');
      sInd1.classList.remove('done');
      sInd1.querySelector('.step-number').textContent = '1';
      currentStep = 1;
    }
    // Scroll to top of card
    document.querySelector('.survey-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function populateSelectedDisplay() {
    const col  = RATING_COLORS[selectedRating];
    const emojis = { 1: '😭', 2: '😕', 3: '😊', 4: '😄', 5: '🤩' };
    const stars  = '⭐'.repeat(selectedRating) + '☆'.repeat(5 - selectedRating);

    selectedDisp.style.background = `linear-gradient(135deg, ${col.bg}, white)`;
    selectedDisp.style.borderColor = col.fill + '44';

    selectedDisp.innerHTML = `
      <span class="selected-emoji-large">${emojis[selectedRating]}</span>
      <div class="selected-rating-info">
        <div class="selected-rating-label" style="color:${col.text}">${selectedLabel}</div>
        <div class="selected-rating-score">
          <span style="color:${col.fill}; font-size:1rem;">${stars}</span>
          <span style="font-size:0.75rem; color:var(--muted); margin-left:6px;">${selectedRating}/5</span>
        </div>
      </div>
    `;
  }

  // ── Char Counter ───────────────────────────────────────────
  komentarInput.addEventListener('input', function () {
    const len = this.value.length;
    charCount.textContent = len;
    if (len > 450) {
      charCount.parentElement.style.color = '#EF4444';
    } else {
      charCount.parentElement.style.color = '';
    }
  });

  // ── Form Submit ────────────────────────────────────────────
  document.getElementById('surveyForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!selectedRating) return;

    const komentar    = komentarInput.value.trim();
    const nomorKamarRaw = nomorKamarInput ? nomorKamarInput.value.trim() : '';
    const nomorKamar    = nomorKamarRaw.replace(/\D/g, ''); // hapus semua non-angka

    // Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '';
    submitBtn.classList.add('btn-loading');

    const payload = {
      rating      : selectedRating,
      label       : selectedLabel,
      komentar    : komentar,
      nomorKamar  : nomorKamar,
      hotel       : CONFIG.HOTEL_NAME
    };

    try {
      if (CONFIG.DEMO_MODE || !CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
        // Demo mode – simulate delay
        await sleep(1500);
        showSuccess(komentar, nomorKamar);
      } else {
        // ── Kirim ke Google Apps Script ──────────────────────
        // GAS Web App melakukan redirect 302 saat POST.
        // Solusi: kirim lewat parameter URL (GET request) agar
        // tidak ada masalah redirect & CORS, dan payload lengkap
        // termasuk nomorKamar pasti diterima oleh doGet() / doPost().
        //
        // Kita pakai pendekatan: POST dengan mode 'no-cors' untuk
        // menyimpan data (fire-and-forget — tidak bisa baca response),
        // lalu tampilkan success setelah delay singkat.

        // KODE BARU — KIRIM VIA GET + URL PARAMETER
        const params = new URLSearchParams({
          action     : 'submit',
          rating     : String(selectedRating),
          label      : selectedLabel,
          komentar   : komentar,
          nomorKamar : nomorKamar,
          hotel      : CONFIG.HOTEL_NAME
        });

        await fetch(CONFIG.GOOGLE_SCRIPT_URL + '?' + params.toString(), {
          method : 'GET',
          mode   : 'no-cors'
        });
        // no-cors = opaque response, tidak bisa cek status
        // Tunggu sebentar agar GAS selesai proses, lalu tampilkan sukses
        await sleep(800);
        showSuccess(komentar, nomorKamar);
      }
    } catch (err) {
      console.error('Submit error:', err);
      showError('Gagal mengirim data. Periksa koneksi internet Anda.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn-loading');
      submitBtn.innerHTML = 'Kirim Review ✨';
    }
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ── SweetAlert Success ──────────────────────────────────────
  function showSuccess(komentar, nomorKamar) {
    const emojis = { 1: '😭', 2: '😕', 3: '😊', 4: '😄', 5: '🤩' };
    const col    = RATING_COLORS[selectedRating];

    // Mark step 3 done
    sInd2.classList.remove('active');
    sInd2.classList.add('done');
    sInd2.querySelector('.step-number').textContent = '✓';
    sInd3.classList.add('active');

    Swal.fire({
      html: `
        <div style="text-align:center; padding:12px 0;">
          <div style="font-size:4rem; margin-bottom:16px; animation:bounceIn 0.5s ease;">${emojis[selectedRating]}</div>
          <h2 style="font-family:'Poppins',sans-serif; font-size:1.4rem; font-weight:800; color:#2C1810; margin-bottom:8px;">
            Terima Kasih! 🎉
          </h2>
          <p style="font-family:'Poppins',sans-serif; font-size:0.9rem; color:#8B7355; margin-bottom:16px;">
            Review Anda telah berhasil dikirim ke <strong style="color:#6B4226">Hotel MESRA</strong>
          </p>
          <div style="background:${col.bg}; border-radius:12px; padding:12px 20px; margin-bottom:8px;">
            <span style="font-size:0.85rem; font-weight:700; color:${col.text};">
              Rating: ${selectedLabel} (${selectedRating}/5)
            </span>
          </div>
          ${nomorKamar ? `<div style="font-size:0.8rem; color:#8B7355; margin-top:10px;">🔑 Kamar <strong style="color:#4A2C14">${nomorKamar}</strong></div>` : ''}
          ${komentar ? `<p style="font-size:0.8rem; color:#8B7355; font-style:italic; margin-top:10px;">"${komentar}"</p>` : ''}
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Selesai 👍',
      showClass: { popup: 'animate__animated animate__bounceIn' },
      customClass: {
        popup  : 'swal-success-popup',
        confirm: 'swal-confirm-btn'
      },
      timer: 8000,
      timerProgressBar: true,
      backdrop: 'rgba(107,66,38,0.4)',
      willClose: () => {
        resetForm();
      }
    });
  }

  function showError(message) {
    Swal.fire({
      icon : 'error',
      title: 'Oops! Terjadi Kesalahan',
      html : `<p style="font-family:'Poppins',sans-serif; color:#5C3D2E;">${message || 'Silakan coba beberapa saat lagi.'}</p>`,
      confirmButtonText: 'Coba Lagi',
      backdrop: 'rgba(107,66,38,0.4)'
    });
  }

  // ── Reset Form ─────────────────────────────────────────────
  function resetForm() {
    selectedRating = null;
    selectedLabel  = null;
    currentStep    = 1;

    emojiGrid.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
    komentarInput.value   = '';
    if (nomorKamarInput) nomorKamarInput.value = '';
    charCount.textContent = '0';
    ratingFill.style.width  = '0%';
    ratingText.textContent  = 'Pilih rating Anda';
    ratingText.style.color  = '';
    nextBtn.disabled = true;

    // Reset steps
    step2El.classList.remove('active');
    step1El.classList.add('active');

    [sInd1, sInd2, sInd3].forEach(s => { s.classList.remove('active', 'done'); });
    sInd1.querySelector('.step-number').textContent = '1';
    sInd2.querySelector('.step-number').textContent = '2';
    sInd1.classList.add('active');
  }

})();
