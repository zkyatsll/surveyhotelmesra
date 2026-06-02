/**
 * ============================================================
 * HOTEL MESRA – Admin Login Logic (admin.js)
 * ============================================================
 */

(function () {
  'use strict';

  const SESSION_KEY = 'mesra_admin_session';

  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // ── DOM Refs ───────────────────────────────────────────────
  const loginForm   = document.getElementById('loginForm');
  const usernameEl  = document.getElementById('username');
  const passwordEl  = document.getElementById('password');
  const loginBtn    = document.getElementById('loginBtn');
  const loginError  = document.getElementById('loginError');

  // ── Form Submit ────────────────────────────────────────────
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();

    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();

    let valid = true;

    if (!username) {
      showFieldError('usernameError', usernameEl);
      valid = false;
    }

    if (!password) {
      showFieldError('passwordError', passwordEl);
      valid = false;
    }

    if (!valid) return;

    // Loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Memverifikasi...';

    // Simulate auth delay
    setTimeout(() => {
      if (username === CONFIG.ADMIN_USERNAME && password === CONFIG.ADMIN_PASSWORD) {
        // Save session
        const session = {
          username   : username,
          loginTime  : Date.now(),
          expiresAt  : Date.now() + CONFIG.SESSION_DURATION
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // Redirect
        loginBtn.textContent = 'Berhasil! Mengalihkan...';
        loginBtn.style.background = 'linear-gradient(135deg, #22C55E, #15803D)';
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      } else {
        // Wrong credentials
        loginBtn.disabled = false;
        loginBtn.textContent = 'Masuk ke Dashboard';
        loginError.classList.add('show');

        usernameEl.classList.add('is-invalid');
        passwordEl.classList.add('is-invalid');

        // Shake animation
        loginBtn.style.animation = 'none';
        document.querySelector('.login-card').style.animation = 'shake 0.4s ease';
        setTimeout(() => {
          document.querySelector('.login-card').style.animation = '';
        }, 400);
      }
    }, 800);
  });

  // ── Helpers ────────────────────────────────────────────────
  function showFieldError(id, inputEl) {
    document.getElementById(id).classList.add('show');
    inputEl.classList.add('is-invalid');
  }

  function clearErrors() {
    loginError.classList.remove('show');
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('is-invalid'));
  }

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

  // Clear error on input
  [usernameEl, passwordEl].forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('is-invalid');
      loginError.classList.remove('show');
      document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    });
  });

  // Enter key support
  passwordEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      loginForm.dispatchEvent(new Event('submit'));
    }
  });

})();
