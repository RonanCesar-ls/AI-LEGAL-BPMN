import { useCallback, useState } from 'react';
import { Eye, EyeOff, Loader, Lock, Mail, Scale } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';
import { GoogleSignInButton } from './GoogleSignInButton';

const GOLD = '#d4a017'; const GOLD_DIM = '#b88a12'; const BG = '#f4f5f7'; const SURFACE = '#fff';
const BORDER = '#e2e8f0'; const TEXT = '#1e293b'; const MUTED = '#64748b'; const DANGER = '#ef4444';

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

  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#f8f9fa', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: '12px 40px', outline: 'none' };
  return <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}><div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}><Scale size={18} color={GOLD_DIM} /></div><span style={{ fontWeight: 800, color: TEXT }}>PBM<span style={{ color: GOLD_DIM }}>app</span></span></div>
    <main style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '44px 48px', width: 420, boxShadow: '0 20px 40px rgba(0,0,0,.04)' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 6 }}>Bem-vindo! <span style={{ color: GOLD }}>⚖</span></h1>
      <p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Acesse sua conta para continuar</p>
      <label style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>E-MAIL</label>
      <div style={{ position: 'relative', marginBottom: 16 }}><Mail size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} /><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} /></div>
      <label style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>SENHA</label>
      <div style={{ position: 'relative' }}><Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="••••••••" style={inputStyle} /><button type="button" onClick={() => setShowPassword(value => !value)} style={{ position: 'absolute', right: 12, top: 10, border: 0, background: 'none', color: MUTED }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginTop: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>{error}</div>}
      <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: 13, background: GOLD, color: '#fff', border: 0, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 18 }}>{loading ? <Loader size={16} /> : 'Entrar'}</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}><span style={{ height: 1, flex: 1, background: BORDER }} /><span style={{ color: MUTED, fontSize: 12 }}>ou</span><span style={{ height: 1, flex: 1, background: BORDER }} /></div>
      <GoogleSignInButton onCredential={finishGoogleLogin} disabled={loading} onLoadError={() => setError('Não foi possível carregar o login com Google.')} />
      <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>Não tem conta? <button type="button" onClick={onCadastro} style={{ color: GOLD_DIM, background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}>Cadastre-se</button></p>
    </main>
  </div>;
};
