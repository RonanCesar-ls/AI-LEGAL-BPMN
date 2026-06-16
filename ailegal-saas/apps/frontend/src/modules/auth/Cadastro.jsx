import { useState } from 'react';
import { Scale, Mail, Lock, User, Loader, Eye, EyeOff } from 'lucide-react';
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
const SUCCESS  = '#22c55e';

const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: 'block', color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: error ? DANGER : MUTED }} />}
        <input
          type={type === 'password' ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', background: CARD2, border: `1px solid ${error ? DANGER : BORDER}`, borderRadius: 8, color: TEXT, fontFamily: 'inherit', fontSize: 14, padding: Icon ? '12px 14px 12px 40px' : '12px 14px', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = error ? DANGER : GOLD}
          onBlur={e => e.target.style.borderColor = error ? DANGER : BORDER}
        />
        {type === 'password' && (
          <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: MUTED, cursor: 'pointer', display: 'flex' }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p style={{ color: DANGER, fontSize: 11, marginTop: 4, fontWeight: 600 }}>{error}</p>}
    </div>
  );
};

export const Cadastro = ({ onLogin, onBack }) => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!name.trim())           errors.name     = 'Nome é obrigatório.';
    if (!email.trim())          errors.email    = 'E-mail é obrigatório.';
    if (!email.includes('@'))   errors.email    = 'E-mail inválido.';
    if (password.length < 6)   errors.password  = 'Mínimo de 6 caracteres.';
    if (password !== confirmPass) errors.confirmPass = 'As senhas não coincidem.';
    return errors;
  };

  const handleRegister = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      const data = await authApi.register({ name, email, password });
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6)   return { label: 'Fraca',  color: DANGER,   width: '33%' };
    if (password.length < 10)  return { label: 'Média',  color: '#eab308', width: '66%' };
    return                            { label: 'Forte',  color: SUCCESS,   width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>

      <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onBack}>
        <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}>
          <Scale size={18} color={GOLD_DIM} />
        </div>
        <span style={{ fontWeight: 800, color: TEXT }}>
          Ai<span style={{ color: GOLD_DIM }}>Legal</span>
        </span>
      </div>

      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: '44px 48px', width: 440, boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Criar conta <span style={{ color: GOLD }}>⚖</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>
          Comece a mapear seus processos jurídicos com IA
        </p>

        <Input
          label="Nome completo"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Dr. João Silva"
          icon={User}
          error={fieldErrors.name}
        />

        <Input
          label="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.com"
          icon={Mail}
          error={fieldErrors.email}
        />

        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          icon={Lock}
          error={fieldErrors.password}
        />

        {strength && (
          <div style={{ marginTop: -8, marginBottom: 16 }}>
            <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: strength.width, background: strength.color, borderRadius: 2, transition: 'width .3s, background .3s' }} />
            </div>
            <p style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 600 }}>
              Senha {strength.label}
            </p>
          </div>
        )}

        <Input
          label="Confirmar senha"
          type="password"
          value={confirmPass}
          onChange={e => setConfirmPass(e.target.value)}
          placeholder="Repita a senha"
          icon={Lock}
          error={fieldErrors.confirmPass}
        />

        {error && (
          <div style={{ background: '#fef2f2', border: `1px solid #fca5a5`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: DANGER, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{ width: '100%', padding: '13px', background: loading ? GOLD_DIM : GOLD, color: '#fff', border: 'none', borderRadius: 8, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8, transition: 'background .18s' }}
        >
          {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? 'Criando conta...' : 'Criar conta grátis'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 24, color: MUTED, fontSize: 14 }}>
          Já tem conta?{' '}
          <span onClick={onBack} style={{ color: GOLD_DIM, cursor: 'pointer', fontWeight: 700 }}>
            Fazer login
          </span>
        </p>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
};