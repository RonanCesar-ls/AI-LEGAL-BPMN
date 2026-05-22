import { useEffect } from "react";

export const ContextMenu = ({ x, y, onEdit, onDelete, onClose }) => {
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
        minWidth: 160, overflow: 'hidden'
      }}
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onEdit}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 13, color: '#1e293b', fontWeight: 600,
          borderBottom: '1px solid #f1f5f9', fontFamily: 'inherit'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        ✏️  Editar texto
      </button>
      <button
        onClick={onDelete}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          width: '100%', padding: '10px 14px', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: 13, color: '#ef4444', fontWeight: 600,
          fontFamily: 'inherit'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        🗑️  Excluir
      </button>
    </div>
  );
};