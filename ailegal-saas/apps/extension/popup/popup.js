const API_URL_KEY = 'apiUrl';
const TOKEN_KEY   = 'token';
const USER_KEY    = 'userName';

function formatSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

async function getStorage(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

async function setStorage(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

async function sendMessage(msg) {
  return new Promise(resolve => chrome.runtime.sendMessage(msg, resolve));
}

// ── Atualiza o painel principal ──────────────────────────────────────────────

async function refreshMain() {
  const status = await sendMessage({ type: 'GET_STATUS' });
  if (!status) return;

  // Aba atual
  const domainEl = document.getElementById('currentDomain');
  domainEl.textContent = status.currentDomain ?? '—';

  // Toggle
  const toggle = document.getElementById('monitoringToggle');
  toggle.checked = status.monitoringEnabled !== false;

  // Status dot
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot ' + (toggle.checked ? 'active' : 'inactive');

  // Acumulado
  const list = document.getElementById('accumulatedList');
  list.innerHTML = '';
  const acc = status.accumulated ?? {};
  const entries = Object.entries(acc).filter(([, v]) => v > 0);

  if (entries.length === 0) {
    list.innerHTML = '<p style="font-size:12px;color:#94a3b8;text-align:center;padding:8px 0">Nenhum dado acumulado</p>';
  } else {
    entries.sort((a, b) => b[1] - a[1]).forEach(([domain, seconds]) => {
      const row = document.createElement('div');
      row.className = 'acc-row';
      row.innerHTML = `
        <span class="acc-domain">${domain}</span>
        <span class="acc-time">${formatSeconds(seconds)}</span>
      `;
      list.appendChild(row);
    });
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

async function init() {
  const { token, userName, apiUrl } = await getStorage([TOKEN_KEY, USER_KEY, API_URL_KEY]);

  const loginSection = document.getElementById('loginSection');
  const mainSection  = document.getElementById('mainSection');

  if (token && userName) {
    // Já logado
    document.getElementById('userName').textContent = userName;
    loginSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    await refreshMain();

    // Atualiza a cada 5s enquanto o popup estiver aberto
    setInterval(refreshMain, 5000);
  } else {
    // Mostra login
    if (apiUrl) document.getElementById('apiUrl').value = apiUrl;
    loginSection.classList.remove('hidden');
    mainSection.classList.add('hidden');
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

document.getElementById('loginBtn').addEventListener('click', async () => {
  const apiUrl   = document.getElementById('apiUrl').value.trim().replace(/\/$/, '');
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl  = document.getElementById('loginError');

  errorEl.classList.add('hidden');

  if (!apiUrl || !email || !password) {
    errorEl.textContent = 'Preencha todos os campos.';
    errorEl.classList.remove('hidden');
    return;
  }

  try {
    const res  = await fetch(`${apiUrl}/api/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error ?? 'Falha ao fazer login.');

    await setStorage({
      [TOKEN_KEY]:   data.token,
      [USER_KEY]:    data.user.name,
      [API_URL_KEY]: apiUrl,
    });

    init();
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove('hidden');
  }
});

// ── Logout ───────────────────────────────────────────────────────────────────

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await setStorage({ [TOKEN_KEY]: null, [USER_KEY]: null });
  init();
});

// ── Toggle monitoramento ──────────────────────────────────────────────────────

document.getElementById('monitoringToggle').addEventListener('change', async (e) => {
  await sendMessage({ type: 'TOGGLE_MONITORING', enabled: e.target.checked });
  const dot = document.getElementById('statusDot');
  dot.className = 'status-dot ' + (e.target.checked ? 'active' : 'inactive');
});

// ── Enviar agora ─────────────────────────────────────────────────────────────

document.getElementById('sendNowBtn').addEventListener('click', async () => {
  const btn = document.getElementById('sendNowBtn');
  btn.textContent = 'Enviando...';
  btn.disabled = true;
  await sendMessage({ type: 'SEND_NOW' });
  await refreshMain();
  btn.textContent = '↑ Enviar agora';
  btn.disabled = false;
});

// ── Start ─────────────────────────────────────────────────────────────────────

init();