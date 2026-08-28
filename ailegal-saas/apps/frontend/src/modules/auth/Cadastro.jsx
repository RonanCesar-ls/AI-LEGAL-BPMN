import { useCallback, useState } from 'react';
import { Eye, EyeOff, Loader, Lock, Mail, Scale, User } from 'lucide-react';
import { authApi } from '../../shared/services/authApi';
import { GoogleSignInButton } from './GoogleSignInButton';

const GOLD = '#d4a017'; const GOLD_DIM = '#b88a12'; const BG = '#f4f5f7'; const SURFACE = '#fff';
const BORDER = '#e2e8f0'; const TEXT = '#1e293b'; const MUTED = '#64748b'; const DANGER = '#ef4444';

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
  const field = (label, icon, props) => <><label style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>{label}</label><div style={{ position: 'relative', marginBottom: 16 }}>{icon}{props}</div></>;
  const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#f8f9fa', border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: '12px 40px', outline: 'none' };
  return <div style={{ background: BG, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
    <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}><div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}><Scale size={18} color={GOLD_DIM} /></div><span style={{ fontWeight: 800, color: TEXT }}>PBM<span style={{ color: GOLD_DIM }}>app</span></span></div>
    <main style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '44px 48px', width: 440, boxShadow: '0 20px 40px rgba(0,0,0,.04)' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 6 }}>Criar conta <span style={{ color: GOLD }}>⚖</span></h1><p style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>Cadastre-se com seus dados ou com sua conta Google.</p>
      {field('NOME COMPLETO', <User size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. João Silva" style={inputStyle} />)}
      {field('E-MAIL', <Mail size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" style={inputStyle} />)}
      {field('SENHA', <Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" style={inputStyle} /><button type="button" onClick={() => setShowPassword(value => !value)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 0, color: MUTED }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></>)}
      {field('CONFIRMAR SENHA', <Lock size={15} style={{ position: 'absolute', left: 14, top: 13, color: MUTED }} />, <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRegister()} placeholder="Repita sua senha" style={inputStyle} />)}
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>{error}</div>}
      <button onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: 13, background: GOLD, color: '#fff', border: 0, borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>{loading ? <Loader size={16} /> : 'Criar conta grátis'}</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}><span style={{ height: 1, flex: 1, background: BORDER }} /><span style={{ color: MUTED, fontSize: 12 }}>ou</span><span style={{ height: 1, flex: 1, background: BORDER }} /></div>
      <GoogleSignInButton onCredential={finishGoogleSignup} disabled={loading} onLoadError={() => setError('Não foi possível carregar o login com Google.')} />
      <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>Já tem conta? <button type="button" onClick={onBack} style={{ color: GOLD_DIM, background: 'none', border: 0, cursor: 'pointer', fontWeight: 700 }}>Fazer login</button></p>
    </main>
  </div>;
};
