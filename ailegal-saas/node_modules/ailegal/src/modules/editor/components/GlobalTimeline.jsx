// ─── HELPERS ──────────────────────────────────────────────────────────────────

function formatTime(isoString) {
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_LABELS = {
  todo:        { label: 'A Fazer',      color: 'text-slate-500',  dot: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600'   },
  in_progress: { label: 'Em Andamento', color: 'text-yellow-600', dot: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700' },
  done:        { label: 'Concluído',    color: 'text-green-600',  dot: 'bg-green-500',   badge: 'bg-green-100 text-green-700'   },
  blocked:     { label: 'Impedimento',  color: 'text-red-600',    dot: 'bg-red-500',     badge: 'bg-red-100 text-red-700'       },
};

// ─── EXTRAI E UNIFICA TODOS OS EVENTOS DE TODOS OS NÓS ───────────────────────

function extractAllEvents(nodes) {
  const events = [];

  nodes.forEach(node => {
    if (!node.data?.timeline?.length) return;

    node.data.timeline.forEach(event => {
      events.push({
        ...event,
        nodeLabel: node.data.label || node.id,
        nodeActor: node.data.actor || 'Sistema',
      });
    });
  });

  // Ordena do mais antigo para o mais novo
  return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function GlobalTimeline({ nodes = [] }) {
  const allEvents = extractAllEvents(nodes);

  const blockedCount     = allEvents.filter(e => e.toStatus === 'blocked').length;
  const doneCount        = allEvents.filter(e => e.toStatus === 'done').length;
  const inProgressCount  = allEvents.filter(e => e.toStatus === 'in_progress').length;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200">

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Auditoria Global
        </h2>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-slate-700">{allEvents.length}</div>
            <div className="text-xs text-slate-400">eventos</div>
          </div>
          <div className="bg-red-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-600">{blockedCount}</div>
            <div className="text-xs text-red-400">bloqueios</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-600">{doneCount}</div>
            <div className="text-xs text-green-400">concluídos</div>
          </div>
        </div>
      </div>

      {/* Feed de eventos */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {allEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium text-slate-500">Nenhuma atividade ainda.</p>
            <p className="text-xs text-slate-400 mt-1">
              Altere o status de um nó para ver o histórico aqui.
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Linha vertical contínua */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />

            <div className="space-y-4">
              {allEvents.map((event, i) => {
                const cfg = STATUS_LABELS[event.toStatus] ?? STATUS_LABELS.todo;

                return (
                  <div key={event.id ?? i} className="flex gap-3 relative">

                    {/* Dot na linha */}
                    <div className={`
                      w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
                      border-2 border-white shadow-sm z-10
                      ${cfg.dot}
                    `} />

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pb-1">

                      {/* Linha principal */}
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          <span className="font-semibold">{event.actor}</span>
                          {' alterou '}
                          <span className="font-semibold text-indigo-600">
                            "{event.nodeLabel}"
                          </span>
                        </p>
                      </div>

                      {/* Status badge */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {event.fromStatus && (
                          <>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_LABELS[event.fromStatus]?.badge ?? 'bg-slate-100 text-slate-600'}`}>
                              {STATUS_LABELS[event.fromStatus]?.label ?? event.fromStatus}
                            </span>
                            <span className="text-slate-300 text-xs">→</span>
                          </>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Nota de impedimento */}
                      {event.note && (
                        <div className="mt-1.5 flex items-start gap-1">
                          <span className="text-red-400 text-xs flex-shrink-0 mt-px">💬</span>
                          <p className="text-xs text-slate-500 italic leading-relaxed">
                            "{event.note}"
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <p className="text-xs text-slate-400 mt-1">
                        {formatTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}