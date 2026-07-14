import { useState, useEffect } from 'react';
import { ChevronDown, User, Shield, Lock} from 'lucide-react';
import { usersApi } from '../../../shared/services/usersApi';
import { CollaboratorAuthModal } from './CollaboratorAuthModal';

const BORDER = '#e2e8f0';
const TEXT   = '#1e293b';
const MUTED  = '#64748b';
const GOLD   = '#d4a017';

export function CollaboratorSelector({ currentUser, selectedUserId, onSelect }) {
  const [users, setUsers]               = useState([]);
  const [open, setOpen]                 = useState(false);
  const [loading, setLoading]           = useState(true);
  const [pendingUser, setPendingUser]   = useState(null);

  useEffect(() => {
    usersApi.list()
      .then(setUsers)
      .catch(() => setUsers([{ id: currentUser.id, name: currentUser.name, email: currentUser.email }]))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const selected = users.find(u => u.id === selectedUserId) ?? currentUser;
  const isActingAs = selectedUserId !== currentUser.id;

  const handleSelectUser = (user) => {
    setOpen(false);

    if (user.id === currentUser.id) {
      onSelect(user.id);
      return;
    }

    setPendingUser(user);
  };

  const handleAuthConfirm = (user) => {
    setPendingUser(null);
    onSelect(user.id, user);
  };

  return (
    <>
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 14px', borderRadius: 10,
            border: `1px solid ${isActingAs ? GOLD : BORDER}`,
            background: isActingAs ? '#fffbeb' : '#ffffff',
            cursor: 'pointer', minWidth: 220,
          }}
        >
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: isActingAs ? `${GOLD}33` : `${GOLD}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isActingAs
              ? <Shield size={13} color="#b88a12" />
              : <User size={13} color="#b88a12" />
            }
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: TEXT, display: 'block' }}>
              {loading ? 'Carregando...' : selected?.name}
            </span>
            {isActingAs && (
              <span style={{ fontSize: 10, color: '#b88a12', fontWeight: 600 }}>
                acesso autorizado
              </span>
            )}
          </div>
          <ChevronDown size={14} color={MUTED} />
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 50,
            background: '#ffffff', border: `1px solid ${BORDER}`,
            borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            minWidth: 240, overflow: 'hidden',
          }}>
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${BORDER}` }}>
              <p style={{ fontSize: 10, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Selecionar colaborador
              </p>
            </div>

            {users.map(u => {
              const isSelf     = u.id === currentUser.id;
              const isSelected = u.id === selectedUserId;
              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 12px',
                    background: isSelected ? '#fffbeb' : 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isSelected ? `${GOLD}33` : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={13} color={isSelected ? '#b88a12' : MUTED} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: TEXT }}>
                      {u.name}
                    </p>
                    <p style={{ fontSize: 11, color: MUTED }}>
                      {isSelf ? 'você' : u.email}
                    </p>
                  </div>
                  {!isSelf && !isSelected && (
                    <Lock size={12} color={MUTED} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {pendingUser && (
        <CollaboratorAuthModal
          collaborator={pendingUser}
          onConfirm={handleAuthConfirm}
          onCancel={() => setPendingUser(null)}
        />
      )}
    </>
  );
}