// ─── DOMÍNIOS MONITORADOS ────────────────────────────────────────────────────

const MONITORED_DOMAINS = {
  'web.whatsapp.com':   'whatsapp',
  'mail.google.com':    'email',
  'outlook.office.com': 'email',
  'outlook.live.com':   'email',
  'instagram.com':      'instagram',
  'www.instagram.com':  'instagram',
  'www.facebook.com':   'facebook',
  'twitter.com':        'twitter',
  'x.com':              'twitter',
  'www.linkedin.com':   'linkedin',
  'www.youtube.com':    'youtube',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getMonitoredDomain(url) {
  const hostname = extractDomain(url);
  if (!hostname) return null;
  return MONITORED_DOMAINS[hostname] ?? null;
}

async function getStorage(keys) {
  return new Promise(resolve => chrome.storage.local.get(keys, resolve));
}

async function setStorage(data) {
  return new Promise(resolve => chrome.storage.local.set(data, resolve));
}

// ─── ACUMULA TEMPO DA ABA ANTERIOR ───────────────────────────────────────────

async function flushCurrentSession() {
  const { currentDomain, sessionStart, accumulated = {} } = await getStorage([
    'currentDomain', 'sessionStart', 'accumulated'
  ]);

  if (!currentDomain || !sessionStart) return;

  const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
  if (elapsed <= 0) return;

  accumulated[currentDomain] = (accumulated[currentDomain] ?? 0) + elapsed;

  await setStorage({ accumulated, sessionStart: null, currentDomain: null });
}

// ─── INICIA NOVA SESSÃO ───────────────────────────────────────────────────────

async function startSession(domain) {
  if (!domain) {
    await setStorage({ currentDomain: null, sessionStart: null });
    return;
  }
  await setStorage({ currentDomain: domain, sessionStart: Date.now() });
}

// ─── ENVIA DADOS ACUMULADOS PRO BACKEND ──────────────────────────────────────

async function sendAccumulated() {
  const { accumulated = {}, token, apiUrl, monitoringEnabled } = await getStorage([
    'accumulated', 'token', 'apiUrl', 'monitoringEnabled'
  ]);

  // Flush a sessão atual antes de enviar
  await flushCurrentSession();

  // Re-lê após flush
  const { accumulated: updated = {} } = await getStorage(['accumulated']);

  if (!token || !apiUrl) return;
  if (monitoringEnabled === false) return;

  const entries = Object.entries(updated).filter(([, v]) => v > 0);
  if (entries.length === 0) return;

  // Data local do dispositivo
  const now   = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  for (const [domain, durationSeconds] of entries) {
    try {
      const res = await fetch(`${apiUrl}/api/tracking`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ domain, durationSeconds, date: today }),
      });

      if (res.ok) {
        // Remove do acumulado só o que foi enviado com sucesso
        updated[domain] = 0;
      }
    } catch (err) {
      console.error('[AILegal Monitor] Falha ao enviar:', domain, err);
    }
  }

  await setStorage({ accumulated: updated });
}

// ─── DETECTA MUDANÇA DE ABA ───────────────────────────────────────────────────

async function handleTabChange(tabId) {
  const { monitoringEnabled } = await getStorage(['monitoringEnabled']);
  if (monitoringEnabled === false) return;

  await flushCurrentSession();

  try {
    const tab = await chrome.tabs.get(tabId);
    const domain = getMonitoredDomain(tab.url ?? '');
    await startSession(domain);
  } catch {
    await startSession(null);
  }
}

// ─── LISTENERS ───────────────────────────────────────────────────────────────

// Usuário trocou de aba
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  await handleTabChange(tabId);
});

// Aba atual navegou pra outra URL
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab?.id !== tabId) return;

  await flushCurrentSession();
  const domain = getMonitoredDomain(changeInfo.url ?? activeTab?.url ?? '');
  await startSession(domain);
});

// Janela perdeu foco — para o cronômetro
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    await flushCurrentSession();
  } else {
    const [activeTab] = await chrome.tabs.query({ active: true, windowId });
    if (activeTab) {
      const domain = getMonitoredDomain(activeTab.url ?? '');
      await startSession(domain);
    }
  }
});

// Alarme a cada 60s — envia os dados acumulados
chrome.alarms.create('send_tracking', { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'send_tracking') {
    await sendAccumulated();
  }
});

// Quando a extensão inicia ou é instalada
chrome.runtime.onInstalled.addListener(async () => {
  await setStorage({ accumulated: {}, monitoringEnabled: true });
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    const domain = getMonitoredDomain(activeTab.url ?? '');
    await startSession(domain);
  }
});

// Mensagens do popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TOGGLE_MONITORING') {
    setStorage({ monitoringEnabled: message.enabled }).then(() => {
      if (!message.enabled) flushCurrentSession();
      sendResponse({ ok: true });
    });
    return true; // async
  }

  if (message.type === 'SEND_NOW') {
    sendAccumulated().then(() => sendResponse({ ok: true }));
    return true;
  }

  if (message.type === 'GET_STATUS') {
    getStorage(['currentDomain', 'accumulated', 'monitoringEnabled', 'token', 'apiUrl'])
      .then(sendResponse);
    return true;
  }
});