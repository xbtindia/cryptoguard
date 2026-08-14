
// CryptoGuard Popup v1.2.2 

const BUILT_IN = [
  'trezor.io','suite.trezor.io','wallet.trezor.io',
  'ledger.com','shop.ledger.com',
  'metamask.io','portfolio.metamask.io',
  'myetherwallet.com','www.myetherwallet.com',
  'exodus.com','www.exodus.com',
  'electrum.org','sparrowwallet.com','www.sparrowwallet.com',
  'bluewallet.io','blockstream.info','mempool.space',
  'github.com','raw.githubusercontent.com',
  'chrome.google.com','chromewebstore.google.com'
];

let countdownId = null;
let isReady = false;

// Wait a bit for Android service worker
setTimeout(init, 150);

function init() {
  bindEvents();
  refresh().then(() => {
    isReady = true;
    startCountdown();
  }).catch(err => {
    console.error('CryptoGuard init error:', err);
    showStaticUI();
  });
}

function bindEvents() {
  // Timer preset buttons
  document.querySelectorAll('[data-min]').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.min);
      if (m > 0) startTimer(m);
    });
  });

  // Custom timer
  const btnCustom = document.getElementById('btnCustom');
  if (btnCustom) btnCustom.addEventListener('click', () => {
    hide('timerButtons');
    show('customRow');
  });

  const btnCustomBack = document.getElementById('btnCustomBack');
  if (btnCustomBack) btnCustomBack.addEventListener('click', showTimerButtons);

  const btnCustomStart = document.getElementById('btnCustomStart');
  if (btnCustomStart) btnCustomStart.addEventListener('click', () => {
    const v = parseInt(document.getElementById('customMin').value);
    if (v > 0 && v <= 480) startTimer(v);
  });

  // Cancel timer
  const btnCancel = document.getElementById('btnCancelTimer');
  if (btnCancel) btnCancel.addEventListener('click', cancelTimer);

  // Toggle
  const btnToggle = document.getElementById('btnToggle');
  if (btnToggle) btnToggle.addEventListener('click', toggleMode);

  // Add domain
  const btnAdd = document.getElementById('btnAdd');
  if (btnAdd) btnAdd.addEventListener('click', addDomain);

  const domainInput = document.getElementById('domainInput');
  if (domainInput) {
    domainInput.addEventListener('keypress', e => { if (e.key === 'Enter') addDomain(); });
  }

  // Reset
  const btnReset = document.getElementById('btnReset');
  if (btnReset) btnReset.addEventListener('click', resetCounter);
}

// ─── Messaging ───

function msg(data) {
  return new Promise((resolve, reject) => {
    try {
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error('Runtime not available'));
        return;
      }
      chrome.runtime.sendMessage(data, resp => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(resp || {});
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ─── UI Actions ───

async function startTimer(minutes) {
  try {
    await msg({ action: 'startSafeMode', minutes: minutes });
    await refresh();
    showTimerActive();
  } catch (e) {
    alert('Error: ' + e.message);
  }
}

async function cancelTimer() {
  try {
    await msg({ action: 'cancelSafeMode' });
    await refresh();
    showTimerButtons();
  } catch (e) {
    console.error(e);
  }
}

async function toggleMode() {
  try {
    await msg({ action: 'toggleProtection' });
    await refresh();
  } catch (e) {
    console.error(e);
  }
}

async function addDomain() {
  const input = document.getElementById('domainInput');
  const errEl = document.getElementById('addError');
  if (!input) return;
  const domain = input.value.trim();
  if (!domain) return;

  try {
    const res = await msg({ action: 'addDomain', domain: domain });
    if (res.success) {
      input.value = '';
      if (errEl) errEl.classList.add('hidden');
      await refresh();
    } else {
      if (errEl) { errEl.textContent = res.error || 'Failed'; errEl.classList.remove('hidden'); }
    }
  } catch (e) {
    if (errEl) { errEl.textContent = e.message; errEl.classList.remove('hidden'); }
  }
}

async function removeDomain(domain) {
  try {
    await msg({ action: 'removeDomain', domain: domain });
    await refresh();
  } catch (e) {
    console.error(e);
  }
}

async function resetCounter() {
  try {
    await msg({ action: 'resetCounter' });
    await refresh();
  } catch (e) {
    console.error(e);
  }
}

// ─── Refresh UI ───

async function refresh() {
  const data = await msg({ action: 'getStatus' });

  // Stats
  setText('blockedCount', data.blockedCount || 0);
  const userDomains = data.userAllowedDomains || [];
  setText('allowedCount', BUILT_IN.length + userDomains.length);

  // Status badge
  const isEnabled = data.enabled === true;
  const isTimer = data.tempSafeModeUntil && Date.now() < data.tempSafeModeUntil;

  const badge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');

  if (badge) {
    badge.classList.remove('on', 'timer', 'off');
    if (isTimer) badge.classList.add('timer');
    else if (isEnabled) badge.classList.add('on');
    else badge.classList.add('off');
  }

  if (statusText) {
    statusText.textContent = isTimer ? 'Safe Mode On' : (isEnabled ? 'Protected' : 'All Sites Allowed');
  }

  // Toggle button
  const btnToggle = document.getElementById('btnToggle');
  const toggleLabel = document.getElementById('toggleLabel');
  const toggleIcon = document.getElementById('toggleIcon');

  if (btnToggle) {
    btnToggle.style.display = isTimer ? 'none' : 'block';
    if (toggleLabel) toggleLabel.textContent = isEnabled ? 'Disable Safe Mode' : 'Enable Safe Mode';
    if (toggleIcon) toggleIcon.textContent = isEnabled ? '\u{1F512}' : '\u{1F513}';
    if (isEnabled) {
      btnToggle.classList.add('btn-green');
      btnToggle.classList.remove('btn-red');
      btnToggle.style.background = 'linear-gradient(135deg,#059669,#10b981)';
      btnToggle.style.color = 'white';
    } else {
      btnToggle.classList.remove('btn-green');
      btnToggle.style.background = '#1f2937';
      btnToggle.style.color = '#e5e7eb';
    }
  }

  // Timer section visibility
  if (isTimer) showTimerActive();
  else showTimerButtons();

  // Domain list
  renderDomains(userDomains);
}

function renderDomains(userDomains) {
  const list = document.getElementById('domainList');
  if (!list) return;
  list.innerHTML = '';

  BUILT_IN.forEach(d => {
    const el = document.createElement('div');
    el.className = 'domain-item';
    el.innerHTML = `<span>${esc(d)} <span class="tag">built-in</span></span>`;
    list.appendChild(el);
  });

  userDomains.forEach(d => {
    const el = document.createElement('div');
    el.className = 'domain-item';
    el.innerHTML = `<span>${esc(d)} <span class="tag user">user</span></span>
      <button class="btn-remove" title="Remove">&times;</button>`;
    el.querySelector('.btn-remove').addEventListener('click', () => removeDomain(d));
    list.appendChild(el);
  });
}

function showTimerButtons() {
  show('timerButtons');
  hide('customRow');
  hide('timerActive');
}

function showTimerActive() {
  hide('timerButtons');
  hide('customRow');
  show('timerActive');
}

// ─── Countdown ───

function startCountdown() {
  if (countdownId) clearInterval(countdownId);
  updateCountdown();
  countdownId = setInterval(updateCountdown, 1000);
}

async function updateCountdown() {
  try {
    const data = await msg({ action: 'getStatus' });
    const until = data.tempSafeModeUntil;
    const el = document.getElementById('timerCountdown');
    if (!el) return;

    if (!until || Date.now() >= until) {
      el.textContent = '00:00';
      return;
    }
    const remaining = Math.max(0, until - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    el.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  } catch (e) {
    // silent
  }
}

// ─── Helpers ───

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function esc(text) {
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function showStaticUI() {
  setText('statusText', 'All Sites Allowed');
  setText('blockedCount', '0');
  setText('allowedCount', String(BUILT_IN.length));
  renderDomains([]);
  showTimerButtons();
}
