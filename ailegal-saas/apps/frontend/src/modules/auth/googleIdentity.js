const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';
const initializedClients = new WeakMap();
let sdkPromise;
let activeSubscription;

function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
    const created = !script;
    if (!script) {
      script = document.createElement('script');
      script.src = GIS_SCRIPT;
      script.async = true;
    }
    const cleanup = () => {
      script.removeEventListener('load', loaded);
      script.removeEventListener('error', failed);
    };
    const failed = () => {
      cleanup();
      if (created) script.remove();
      reject(new Error('Não foi possível carregar o login com Google.'));
    };
    const loaded = () => {
      if (!window.google?.accounts?.id) { failed(); return; }
      cleanup();
      resolve(window.google.accounts.id);
    };
    script.addEventListener('load', loaded, { once: true });
    script.addEventListener('error', failed, { once: true });
    if (created) document.head.appendChild(script);
  }).catch(error => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}

// The SDK is initialized once; its callback always delegates to the active form.
export function mountGoogleSignIn(element, clientId, { onCredential, onLoadError }) {
  const subscription = { onCredential };
  let disposed = false;
  let observer;
  loadGoogleIdentity().then(api => {
    if (disposed) return;
    const initializedClient = initializedClients.get(api);
    if (initializedClient && initializedClient !== clientId) {
      throw new Error('A configuração do Google mudou. Recarregue a página.');
    }
    activeSubscription = subscription;
    if (!initializedClient) {
      api.initialize({
        client_id: clientId,
        auto_select: false,
        callback: response => activeSubscription?.onCredential(response),
      });
      initializedClients.set(api, clientId);
    }
    let lastWidth;
    const render = () => {
      const width = Math.max(200, Math.min(390, element.clientWidth || 324));
      if (width === lastWidth) return;
      lastWidth = width;
      element.replaceChildren();
      api.renderButton(element, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
        shape: 'rectangular', logo_alignment: 'left', width, locale: 'pt-BR',
      });
    };
    render();
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(render);
      observer.observe(element);
    }
  }).catch(error => {
    if (!disposed) onLoadError?.(error);
  });
  return () => {
    disposed = true;
    observer?.disconnect();
    if (activeSubscription === subscription) activeSubscription = undefined;
  };
}
