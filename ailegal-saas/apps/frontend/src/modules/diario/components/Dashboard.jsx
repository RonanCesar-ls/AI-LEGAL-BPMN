import { useMemo } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';

const BORDER = '#e2e8f0';
const MUTED  = '#64748b';
const TEXT   = '#1e293b';

const STATUS_CONFIG = {
  todo:        { label: 'A Fazer',      color: '#94a3b8', bg: '#f1f5f9' },
  in_progress: { label: 'Em Andamento', color: '#eab308', bg: '#fffbeb' },
  blocked:     { label: 'Impedido',     color: '#ef4444', bg: '#fef2f2' },
  done:        { label: 'Concluído',    color: '#22c55e', bg: '#f0fdf4' },
};

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function DonutChart({ byStatus, total }) {
  const segments = useMemo(() => {
    const colors = { todo: '#94a3b8', in_progress: '#eab308', blocked: '#ef4444', done: '#22c55e' };
    let offset = 0;
    const radius = 40;
    const circ   = 2 * Math.PI * radius;

    return Object.entries(byStatus)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => {
        const pct  = value / total;
        const dash = pct * circ;
        const seg  = { key, value, color: colors[key], dash, offset };
        offset += dash;
        return seg;
      });
  }, [byStatus, total]);

  return (
    <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {total === 0 ? (
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="12" />
        ) : segments.map(s => (
          <circle
            key={s.key}
            cx="50" cy="50" r="40"
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${s.dash} ${2 * Math.PI * 40 - s.dash}`}
            strokeDashoffset={-s.offset}
            transform="rotate(-90 50 50)"
            style={{ transition: 'all .5s ease' }}
          />
        ))}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: TEXT }}>
          {total > 0 ? Math.round(((byStatus.done ?? 0) / total) * 100) : 0}%
        </span>
        <span style={{ fontSize: 9, color: MUTED, fontWeight: 600 }}>feito</span>
      </div>
    </div>
  );
}

function CollaboratorBar({ collab }) {
  const pct = collab.total > 0 ? Math.round((collab.done / collab.total) * 100) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{collab.name}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {collab.blocked > 0 && (
            <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>
              {collab.blocked} bloq.
            </span>
          )}
          <span style={{ fontSize: 11, color: MUTED }}>{collab.done}/{collab.total}</span>
        </div>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${pct}%`,
          background: collab.blocked > 0 ? '#ef4444' : pct === 100 ? '#22c55e' : '#6366f1',
          transition: 'width .6s ease',
        }} />
      </div>
    </div>
  );
}

const ACTION_LABELS = {
  create:        'criou',
  update_status: 'atualizou',
  delete:        'removeu',
};

export function Dashboard({ metrics, loading, lastUpdate }) {
  if (loading || !metrics) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, height: 100, animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  const { byStatus, byCollaborator, total, blocked, completion, recentActivity } = metrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {lastUpdate && (
        <p style={{ fontSize: 10, color: MUTED, textAlign: 'right' }}>
          Atualizado às {formatTime(lastUpdate.toISOString())} · em tempo real
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginLeft: 6, verticalAlign: 'middle' }} />
        </p>
      )}

      <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <DonutChart byStatus={byStatus} total={total} />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ background: cfg.bg, borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: cfg.color, fontWeight: 700 }}>{cfg.label}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: cfg.color }}>{byStatus[key] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {blocked > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#ef4444" />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
              {blocked} tarefa{blocked > 1 ? 's' : ''} impedida{blocked > 1 ? 's' : ''} hoje
            </p>
            <p style={{ fontSize: 11, color: '#ef4444' }}>
              Requer atenção imediata — verifique os impedimentos no histórico.
            </p>
          </div>
        </div>
      )}

      {byCollaborator.length > 0 && (
        <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <TrendingUp size={14} color="#6366f1" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
              Progresso por colaborador
            </span>
          </div>
          {byCollaborator.map(c => <CollaboratorBar key={c.name} collab={c} />)}
        </div>
      )}

      {recentActivity?.length > 0 && (
        <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Activity size={14} color="#6366f1" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
              Atividade recente
            </span>
          </div>
          {recentActivity.map(event => (
            <div key={event.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 700, color: '#6366f1' }}>{event.description}</span>
                  {' '}{ACTION_LABELS[event.action] ?? event.action}{' '}
                  {event.taskTitle && <span style={{ fontStyle: 'italic' }}>"{event.taskTitle}"</span>}
                  {event.toStatus && (
                    <span style={{ color: STATUS_CONFIG[event.toStatus]?.color ?? MUTED, fontWeight: 600 }}>
                      {' → '}{STATUS_CONFIG[event.toStatus]?.label ?? event.toStatus}
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{formatTime(event.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {total === 0 && (
        <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 32, textAlign: 'center', color: MUTED }}>
          <CheckCircle size={32} color="#e2e8f0" style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhuma tarefa neste dia.</p>
          <p style={{ fontSize: 12, marginTop: 4 }}>Gere tarefas a partir de um fluxograma ou adicione manualmente.</p>
        </div>
      )}
    </div>
  );
}