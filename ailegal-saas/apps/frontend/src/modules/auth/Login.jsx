import { AuthLayout } from './AuthLayout';
import { GOLD, BORDER, TEXT, MUTED, DANGER } from '../../styles/theme';
import { useCallback, useState } from 'react';
import { Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';
import { GoogleSignInButton } from './GoogleSignInButton';

export const Login = ({ onLogin, onCadastro, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finishGoogleLogin = useCallback(async ({ credential }) => {
    setLoading(true); setError('');
    try { onLogin((await authApi.google(credential)).user); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [onLogin]);

  const handleLogin = async () => {
    if (!email.trim() || !password) return setError('Preencha e-mail e senha.');
    setLoading(true); setError('');
    try { onLogin((await authApi.login({ email, password })).user); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const googleEnabled = Boolean(window.__PBMAPP_CONFIG__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: '12px 40px', outline: 'none' };
  return <AuthLayout onBack={onBack} mode="login">
      <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, marginBottom: 6 }}>Bem-vindo!</h1>
      <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Acesse sua conta para continuar</p>
      <label htmlFor="login-email" style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>E-MAIL</label>
      <div style={{ position: 'relative', marginBottom: 16 }}><Mail size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} /><input id="login-email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} /></div>
      <label htmlFor="login-password" style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>SENHA</label>
      <div style={{ position: 'relative' }}><Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} /><input id="login-password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" style={inputStyle} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(value => !value)} style={{ position: 'absolute', right: 12, top: 10, border: 0, background: 'none', color: MUTED }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginTop: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>{error}</div>}
      <button className="auth-submit" onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, background: GOLD, color: TEXT, border: 0, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 18 }}>{loading ? <Loader size={16} /> : 'Entrar'}</button>
      {googleEnabled && <><div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}><span style={{ height: 1, flex: 1, background: BORDER }} /><span style={{ color: MUTED, fontSize: 12 }}>ou</span><span style={{ height: 1, flex: 1, background: BORDER }} /></div>
      <GoogleSignInButton onCredential={finishGoogleLogin} disabled={loading} onLoadError={() => setError('Não foi possível carregar o login com Google.')} /></>}
      <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>Não tem conta? <button type="button" onClick={onCadastro} style={{ color: '#2563EB', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}>Cadastre-se</button></p>
  </AuthLayout>;
};
