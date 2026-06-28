import { useState, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { usersApi } from '../../../shared/services/usersApi';

const BORDER = '#e2e8f0';
const TEXT   = '#1e293b';
const MUTED  = '#64748b';
const GOLD   = '#d4a017';

export function CollaboratorSelector({ currentUser, selectedUserId, onSelect }) {
  const [users, setUsers]     = useState([]);
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.list()
      .then(setUsers)
      .catch(() => setUsers([{ id: currentUser.id, name: currentUser.name }]))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const selected = users.find(u => u.id === selectedUserId) ?? currentUser;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
          background: '#ffffff', cursor: 'pointer', minWidth: 220,
        }}
      >
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${GOLD}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={14} color="#b88a12" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: TEXT, flex: 1, textAlign: 'left' }}>
          {loading ? 'Carregando...' : selected?.name}
        </span>
        <ChevronDown size={14} color={MUTED} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, zIndex: 50,
          background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 220, overflow: 'hidden',
        }}>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => { onSelect(u.id); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '10px 14px', background: u.id === selectedUserId ? '#fffbeb' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13,
                color: TEXT, fontWeight: u.id === selectedUserId ? 700 : 500,
              }}
            >
              {u.name} {u.id === currentUser.id && <span style={{ color: MUTED, fontWeight: 400 }}>(você)</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}