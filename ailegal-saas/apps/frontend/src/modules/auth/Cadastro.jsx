import { AuthLayout } from './AuthLayout';
import { GOLD, BORDER, TEXT, MUTED, DANGER } from '../../styles/theme';
import { useCallback, useState } from 'react';
import { Eye, EyeOff, Loader, Lock, Mail, User } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';
import { GoogleSignInButton } from './GoogleSignInButton';

export const Cadastro = ({ onLogin, onBack }) => {
  const [name, setName] = useState(''); const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const finishGoogleSignup = useCallback(async ({ credential }) => {
    setLoading(true); setError('');
    try { onLogin((await authApi.google(credential)).user); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [onLogin]);
  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) return setError('Preencha todos os campos.');
    if (!email.includes('@')) return setError('Informe um e-mail válido.');
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.');
    if (password !== confirmPassword) return setError('As senhas não coincidem.');
    setLoading(true); setError('');
    try { onLogin((await authApi.register({ name, email, password })).user); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  const field = (label, id, icon, props) => <><label htmlFor={id} style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>{label}</label><div style={{ position: 'relative', marginBottom: 16 }}>{icon}{props}</div></>;
  const googleEnabled = Boolean(window.__PBMAPP_CONFIG__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: '12px 40px', outline: 'none' };
  return <AuthLayout onBack={onBack} mode="signup">
      <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, marginBottom: 6 }}>Criar conta</h1><p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>{googleEnabled ? 'Cadastre-se com seus dados ou com sua conta Google.' : 'Cadastre-se para organizar seus processos.'}</p>
      {field('NOME COMPLETO', 'signup-name', <User size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input id="signup-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. João Silva" style={inputStyle} />)}
      {field('E-MAIL', 'signup-email', <Mail size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input id="signup-email" autoComplete="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />)}
      {field('SENHA', 'signup-password', <Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <><input id="signup-password" autoComplete="new-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} /><button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(value => !value)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 0, color: MUTED }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></>)}
      {field('CONFIRMAR SENHA', 'signup-confirm', <Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input id="signup-confirm" autoComplete="new-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} placeholder="Repita sua senha" style={inputStyle} />)}
      {error && <div role="alert" style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>{error}</div>}
      <button className="auth-submit" onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: 13, background: GOLD, color: TEXT, border: 0, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{loading ? <Loader size={16} /> : 'Criar conta grátis'}</button>
      {googleEnabled && <><div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}><span style={{ height: 1, flex: 1, background: BORDER }} /><span style={{ color: MUTED, fontSize: 12 }}>ou</span><span style={{ height: 1, flex: 1, background: BORDER }} /></div>
      <GoogleSignInButton onCredential={finishGoogleSignup} disabled={loading} onLoadError={() => setError('Não foi possível carregar o login com Google.')} /></>}
      <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>Já tem conta? <button type="button" onClick={onBack} style={{ color: '#2563EB', background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}>Fazer login</button></p>
  </AuthLayout>;
};
