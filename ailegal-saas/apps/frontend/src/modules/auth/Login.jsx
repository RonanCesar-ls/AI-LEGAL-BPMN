import { useEffect, useRef, useState } from 'react';
import { Loader, Scale } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';

const GOLD = '#d4a017';
const GOLD_DIM = '#b88a12';
const BG = '#f4f5f7';
const SURFACE = '#ffffff';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';
const MUTED = '#64748b';
const DANGER = '#ef4444';
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export const Login = ({ onLogin, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    const handleCredential = async ({ credential }) => {
      setLoading(true);
      setError('');
      try {
        const data = await authApi.google(credential);
        onLogin(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const renderGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({ client_id: googleClientId, callback: handleCredential, auto_select: false, cancel_on_tap_outside: true });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', logo_alignment: 'left', width: 340, locale: 'pt-BR',
      });
    };

    const script = document.querySelector(`script[src="${GOOGLE_SCRIPT_URL}"]`);
    if (script) {
      if (window.google?.accounts?.id) renderGoogleButton();
      else script.addEventListener('load', renderGoogleButton, { once: true });
      return () => script.removeEventListener('load', renderGoogleButton);
    }

    const newScript = document.createElement('script');
    newScript.src = GOOGLE_SCRIPT_URL;
    newScript.async = true;
    newScript.onload = renderGoogleButton;
    newScript.onerror = () => setError('Não foi possível carregar o login com Google. Tente novamente.');
    document.head.appendChild(newScript);
    return () => { newScript.onload = null; };
  }, [googleClientId, onLogin]);

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}>
        <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}><Scale size={18} color={GOLD_DIM} /></div>
        <span style={{ fontWeight: 800, color: TEXT }}>PBM<span style={{ color: GOLD_DIM }}>app</span></span>
      </div>

      <main style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '44px 48px', width: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.04)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: TEXT, marginBottom: 10 }}>Acesse o PBMapp</h1>
        <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, marginBottom: 30 }}>Entre ou crie sua conta com o Google para continuar.</p>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: DANGER, fontWeight: 600 }}>{error}</div>}
        {googleClientId ? (
          <div style={{ minHeight: 44, display: 'flex', justifyContent: 'center', opacity: loading ? 0.65 : 1, pointerEvents: loading ? 'none' : 'auto' }} ref={googleButtonRef} />
        ) : (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '12px 14px', fontSize: 13, color: '#9a3412', textAlign: 'left' }}>O login Google ainda não foi configurado neste ambiente.</div>
        )}
        {loading && <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: MUTED, fontSize: 13, marginTop: 16 }}><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />Entrando...</p>}
      </main>
    </div>
  );
};
