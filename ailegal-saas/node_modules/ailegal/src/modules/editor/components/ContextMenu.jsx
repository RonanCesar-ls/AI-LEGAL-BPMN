import { useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'todo',        label: '⚪  A Fazer',       color: '#64748b' },
  { value: 'in_progress', label: '🟡  Em Andamento',  color: '#eab308' },
  { value: 'done',        label: '🟢  Concluído',     color: '#22c55e' },
  { value: 'blocked',     label: '🔴  Impedimento',   color: '#ef4444' },
];

const btnStyle = (color) => ({
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '9px 14px', background: 'none', border: 'none',
  cursor: 'pointer', fontSize: 12, fontWeight: 600,
  fontFamily: 'inherit', color,
  borderBottom: '1px solid #f1f5f9',
});

export const ContextMenu = ({ x, y, type, onEdit, onDelete, onStatusChange, onTimeline, onClose }) => {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'fixed', top: y, left: x, zIndex: 1000,
        background: '#ffffff', border: '1px solid #e2e8f0',
        borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: 180, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onEdit}   style={btnStyle('#1e293b')}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        ✏️  Editar texto
      </button>

      {type === 'node' && (
        <button onClick={onTimeline} style={btnStyle('#6366f1')}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          📋  Ver Timeline
        </button>
      )}

      {type === 'node' && (
        <>
          <div style={{ padding: '6px 14px 4px', fontSize: 10, color: '#94a3b8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Mudar Status
          </div>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onStatusChange(opt.value); onClose(); }}
              style={{ ...btnStyle(opt.color), borderBottom: 'none', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {opt.label}
            </button>
          ))}
        </>
      )}

      <button onClick={onDelete} style={{ ...btnStyle('#ef4444'), borderTop: '1px solid #f1f5f9', borderBottom: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
        🗑️  Excluir
      </button>
    </div>
  );
};