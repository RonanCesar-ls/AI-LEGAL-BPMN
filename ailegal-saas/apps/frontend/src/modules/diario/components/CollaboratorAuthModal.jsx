import { useState } from 'react';
import { Lock, Loader, X, User } from 'lucide-react';
import { authApi } from '../../../shared/services/authApi';

const BORDER  = '#e2e8f0';
const TEXT    = '#1e293b';
const MUTED   = '#64748b';
const DANGER  = '#ef4444';
const GOLD    = '#d4a017';

export function CollaboratorAuthModal({ collaborator, onConfirm, onCancel }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleVerify = async () => {
    if (!password.trim()) {
      setError('Digite a senha do colaborador.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authApi.verifyCollaborator(collaborator.id, password);
      if (result.ok) {
        onConfirm(collaborator);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#00000055',
        backdropFilter: 'blur(4px)', zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#ffffff', borderRadius: 16, padding: 28, width: 380,
          border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${GOLD}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={16} color="#b88a12" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{collaborator.name}</p>
              <p style={{ fontSize: 12, color: MUTED }}>{collaborator.email}</p>
            </div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
          Para acessar o contexto de <strong style={{ color: TEXT }}>{collaborator.name}</strong>, confirme a senha deste colaborador.
        </p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
            Senha do colaborador
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: MUTED }} />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              autoFocus
              placeholder="••••••••"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 36px 10px 36px',
                border: `1px solid ${error ? DANGER : BORDER}`,
                borderRadius: 8, fontSize: 13, outline: 'none',
                fontFamily: 'inherit', color: TEXT,
              }}
              onFocus={e => e.target.style.borderColor = error ? DANGER : GOLD}
              onBlur={e => e.target.style.borderColor = error ? DANGER : BORDER}
            />
            <button
              onClick={() => setShowPass(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 11, fontWeight: 600 }}
            >
              {showPass ? 'ocultar' : 'ver'}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: DANGER, fontWeight: 600, marginTop: 6 }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
          <p style={{ fontSize: 11, color: '#92400e', lineHeight: 1.5 }}>
            ⚠ Todas as ações realizadas neste contexto serão registradas no histórico de auditoria com seu nome e o do colaborador.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '10px', borderRadius: 8,
              border: `1px solid ${BORDER}`, background: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: MUTED,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, border: 'none',
              background: loading ? '#b88a12' : GOLD,
              color: '#ffffff', cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 13, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {loading ? <Loader size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={13} />}
            {loading ? 'Verificando...' : 'Confirmar acesso'}
          </button>
        </div>
      </div>
    </div>
  );
}