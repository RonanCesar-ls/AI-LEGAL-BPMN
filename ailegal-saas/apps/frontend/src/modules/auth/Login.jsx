import { useEffect, useRef, useState } from 'react';
import { Scale, Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';

const GOLD     = '#d4a017';
const GOLD_DIM = '#b88a12';
const BG       = '#f4f5f7';
const SURFACE  = '#ffffff';
const BORDER   = '#e2e8f0';
const TEXT     = '#1e293b';
const MUTED    = '#64748b';
const CARD2    = '#f8f9fa';
const DANGER   = '#ef4444';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />}
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: Icon ? '12px 14px 12px 40px' : '12px 14px', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = GOLD}
          onBlur={e => e.target.style.borderColor = BORDER}
        />
        {type === 'password' && (
          <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};

export const Login = ({ onLogin, onCadastro, onBack }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const googleButtonRef          = useRef(null);
  const googleClientId           = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
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
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: 324,
        locale: 'pt-BR',
      });
    };

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      initializeGoogle();
      return undefined;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = initializeGoogle;
    script.onerror = () => setError('N\u00e3o foi poss\u00edvel carregar o login com Google.');
    document.head.appendChild(script);

    return () => { script.onload = null; };
  }, [googleClientId, onLogin]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authApi.login({ email, password });
      onLogin(data.user); // passa o user real pro App
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      {/* Logo */}
      <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}>
        <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}>
          <Scale size={18} color={GOLD_DIM} />
        </div>
        <span style={{ fontWeight: 800, color: TEXT }}>
          PBM<span style={{ color: GOLD_DIM }}>app</span>
        </span>
      </div>

      {/* Card */}
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '44px 48px', width: 420, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Bem-vindo! <span style={{ color: GOLD }}>⚖</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>
          Acesse sua conta para continuar
        </p>

        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          icon={Mail}
        />
        <div onKeyDown={handleKeyDown}>
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
          />
        </div>

        {/* Erro */}
        {error && (
          <div style={{ background: '#fef2f2', border: `1px solid #fca5a5`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', padding: '13px', background: loading ? GOLD_DIM : GOLD, color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, transition: 'background .18s' }}
        >
          {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        {googleClientId && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
              <span style={{ height: 1, flex: 1, background: BORDER }} />
              <span style={{ color: MUTED, fontSize: 12 }}>ou</span>
              <span style={{ height: 1, flex: 1, background: BORDER }} />
            </div>
            <div ref={googleButtonRef} style={{ display: 'flex', justifyContent: 'center', opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }} />
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>
          Não tem conta?{' '}
          <span onClick={onCadastro} style={{ color: GOLD_DIM, cursor: 'pointer', fontWeight: 700 }}>
            Cadastre-se
          </span>
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};
