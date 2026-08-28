import { useEffect, useRef } from 'react';

const GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

export const GoogleSignInButton = ({ onCredential, disabled, onLoadError }) => {
  const elementRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId || !elementRef.current) return undefined;

    const render = () => {
      if (!window.google?.accounts?.id || !elementRef.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: onCredential, auto_select: false });
      elementRef.current.replaceChildren();
      window.google.accounts.id.renderButton(elementRef.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
        shape: 'rectangular', logo_alignment: 'left', width: 324, locale: 'pt-BR',
      });
    };

    const script = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
    if (script) {
      if (window.google?.accounts?.id) render();
      else script.addEventListener('load', render, { once: true });
      return () => script.removeEventListener('load', render);
    }

    const newScript = document.createElement('script');
    newScript.src = GIS_SCRIPT;
    newScript.async = true;
    newScript.onload = render;
    newScript.onerror = onLoadError;
    document.head.appendChild(newScript);
    return () => { newScript.onload = null; };
  }, [clientId, onCredential, onLoadError]);

  if (!clientId) return null;
  return <div ref={elementRef} style={{ display: 'flex', justifyContent: 'center', opacity: disabled ? 0.6 : 1, pointerEvents: disabled ? 'none' : 'auto' }} />;
};
