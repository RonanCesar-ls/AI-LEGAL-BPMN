import { useState } from 'react';
import { Plus, Trash2, Loader, ChevronDown } from 'lucide-react';

const BORDER = '#e2e8f0';
const TEXT   = '#1e293b';
const MUTED  = '#64748b';
const SURFACE = '#ffffff';

const STATUS_CONFIG = {
  todo:        { label: 'A Fazer',      color: '#64748b', bg: '#f1f5f9', dot: '#94a3b8' },
  in_progress: { label: 'Em Andamento', color: '#b45309', bg: '#fffbeb', dot: '#eab308' },
  blocked:     { label: 'Impedido',     color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
  done:        { label: 'Concluído',    color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
};

function StatusDropdown({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`,
          background: cfg.bg, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: cfg.color,
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot }} />
        {cfg.label}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0, zIndex: 50,
          background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', minWidth: 160, overflow: 'hidden',
        }}>
          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
            <button
              key={key}
              onClick={() => { onChange(key); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '9px 12px', background: key === status ? c.bg : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600, color: c.color,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot }} />
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onStatusChange, onRemove }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10, border: `1px solid ${BORDER}`,
      background: SURFACE, marginBottom: 8,
    }}>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: TEXT }}>
        {task.title}
      </span>
      <StatusDropdown status={task.status} onChange={(s) => onStatusChange(task.id, s)} />
      <button
        onClick={() => onRemove(task.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function TaskList({ tasks, loading, onAdd, onStatusChange, onRemove }) {
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle);
    setNewTitle('');
  };

  const counts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {tasks.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Object.entries(STATUS_CONFIG).map(([key, c]) => (
            counts[key] ? (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 20, background: c.bg, fontSize: 12, fontWeight: 700, color: c.color,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
                {counts[key]} {c.label.toLowerCase()}
              </div>
            ) : null
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="Nova microtarefa..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${BORDER}`,
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            background: '#d4a017', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700,
          }}
        >
          <Plus size={15} /> Adicionar
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: MUTED }} />
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: MUTED, fontSize: 13 }}>
          Nenhuma microtarefa para este dia ainda.
        </div>
      ) : (
        tasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onRemove={onRemove}
          />
        ))
      )}
    </div>
  );
}