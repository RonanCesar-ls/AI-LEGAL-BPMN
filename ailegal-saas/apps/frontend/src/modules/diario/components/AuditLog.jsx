import { useState, useEffect, useMemo } from 'react';
import { History, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { tasksApi } from '../../../shared/services/tasksApi';

const BORDER = '#e2e8f0';
const MUTED  = '#64748b';
const TEXT   = '#1e293b';

const ACTION_LABELS = {
  update_status: 'alterou o status de',
  delete:        'removeu a tarefa',
  create:        'criou a tarefa',
};

const STATUS_COLORS = {
  todo:        { label: 'A Fazer',      color: '#64748b' },
  in_progress: { label: 'Em Andamento', color: '#b45309' },
  blocked:     { label: 'Impedido',     color: '#dc2626' },
  done:        { label: 'Concluído',    color: '#16a34a' },
};

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function AuditEntry({ entry }) {
  const actionLabel = ACTION_LABELS[entry.action] ?? entry.action;
  const fromCfg     = STATUS_COLORS[entry.fromStatus];
  const toCfg       = STATUS_COLORS[entry.toStatus];

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', marginTop: 4 }} />
        <div style={{ width: 1, flex: 1, background: BORDER, marginTop: 4 }} />
      </div>

      <div style={{ flex: 1, paddingBottom: 8 }}>
        <p style={{ fontSize: 12, color: TEXT, fontWeight: 600, lineHeight: 1.5, marginBottom: 2 }}>
          <span style={{ color: '#6366f1' }}>{entry.description}</span>
          {' '}{actionLabel}{' '}
          {entry.taskTitle && (
            <span style={{ fontStyle: 'italic' }}>"{entry.taskTitle}"</span>
          )}
        </p>

        {entry.fromStatus && entry.toStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {fromCfg && (
              <span style={{ fontSize: 11, fontWeight: 700, color: fromCfg.color }}>
                {fromCfg.label}
              </span>
            )}
            <span style={{ fontSize: 11, color: MUTED }}>→</span>
            {toCfg && (
              <span style={{ fontSize: 11, fontWeight: 700, color: toCfg.color }}>
                {toCfg.label}
              </span>
            )}
          </div>
        )}

        {entry.note && (
          <p style={{ fontSize: 11, color: MUTED, fontStyle: 'italic', marginBottom: 4 }}>
            "{entry.note}"
          </p>
        )}

        <p style={{ fontSize: 10, color: MUTED }}>
          {formatDateTime(entry.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function AuditLog({ dateFrom, dateTo, refreshKey }) {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [error, setError]       = useState(null);
  const [filterMode, setFilterMode] = useState('day');

  const { from, to } = useMemo(() => {
    if (!dateFrom) return { from: null, to: null };

    if (filterMode === 'day') {
      return { from: dateFrom, to: dateTo ?? dateFrom };
    }

    const date = new Date(dateFrom + 'T12:00:00');
    const day  = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const mon  = new Date(date); mon.setDate(date.getDate() + diff);
    const sun  = new Date(mon);  sun.setDate(mon.getDate() + 6);

    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { from: fmt(mon), to: fmt(sun) };
  }, [dateFrom, dateTo, filterMode]);

  useEffect(() => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    tasksApi.getAudit(from, to)
      .then(setLogs)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to, refreshKey]);

  return (
    <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>

      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: expanded ? `1px solid ${BORDER}` : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={15} color="#6366f1" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
            Histórico de Auditoria
          </span>
          {logs.length > 0 && (
            <span style={{ fontSize: 11, background: '#ede9fe', color: '#6366f1', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
              {logs.length}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} color={MUTED} /> : <ChevronDown size={14} color={MUTED} />}
      </button>

      {expanded && (
        <div>
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: `1px solid ${BORDER}` }}>
            {['day', 'week'].map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  border: `1px solid ${filterMode === mode ? '#6366f1' : BORDER}`,
                  background: filterMode === mode ? '#ede9fe' : 'transparent',
                  color: filterMode === mode ? '#6366f1' : MUTED,
                }}
              >
                {mode === 'day' ? '📅 Este dia' : '📆 Esta semana'}
              </button>
            ))}
            {from && (
              <span style={{ fontSize: 10, color: MUTED, alignSelf: 'center', marginLeft: 4 }}>
                {filterMode === 'day' ? from : `${from} → ${to}`}
              </span>
            )}
          </div>

          <div style={{ padding: '16px 16px 8px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite', color: MUTED }} />
              </div>
            ) : error ? (
              <p style={{ fontSize: 12, color: '#dc2626', textAlign: 'center', padding: 16 }}>{error}</p>
            ) : logs.length === 0 ? (
              <p style={{ fontSize: 12, color: MUTED, textAlign: 'center', padding: 24 }}>
                Nenhuma ação registrada {filterMode === 'day' ? 'neste dia' : 'nesta semana'}.
              </p>
            ) : (
              logs.map(entry => <AuditEntry key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
