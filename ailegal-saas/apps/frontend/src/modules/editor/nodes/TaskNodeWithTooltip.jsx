import { useState } from 'react';
import { Handle, Position } from 'reactflow';


function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDuration(startIso, endIso) {
  if (!startIso) return '—';
  const start = new Date(startIso).getTime();
  const end   = endIso ? new Date(endIso).getTime() : Date.now();
  const ms    = end - start;

  const totalMinutes = Math.floor(ms / 60000);
  const hours        = Math.floor(totalMinutes / 60);
  const minutes      = totalMinutes % 60;

  if (hours === 0) return `${minutes}min`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}min`;
}


const STATUS_CONFIG = {
  todo:        { border: 'border-slate-300',  bg: 'bg-slate-50',   dot: 'bg-slate-400',   label: 'A Fazer'       },
  in_progress: { border: 'border-yellow-400', bg: 'bg-yellow-50',  dot: 'bg-yellow-400',  label: 'Em Andamento'  },
  done:        { border: 'border-green-400',  bg: 'bg-green-50',   dot: 'bg-green-500',   label: 'Concluído'     },
  blocked:     { border: 'border-red-400',    bg: 'bg-red-50',     dot: 'bg-red-500',     label: 'Impedimento'   },
};


function SlaTooltip({ timeline, status, sla }) {
  const sorted     = [...(timeline ?? [])].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const firstEvent = sorted[0];
  const lastEvent  = sorted[sorted.length - 1];

  const startEvent = sorted.find(e => e.toStatus === 'in_progress');
  const endEvent   = sorted.find(e => e.toStatus === 'done');

  const hasData = sorted.length > 0;

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 w-64 pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0
        border-l-[6px] border-l-transparent
        border-r-[6px] border-r-transparent
        border-t-[6px] border-t-slate-800" />

      <div className="bg-slate-800 text-white rounded-xl shadow-2xl p-4 text-xs">
        <div className="font-bold text-sm mb-3 text-white flex items-center gap-2">
          <span>📊</span> Informações de SLA
        </div>

        {!hasData ? (
          <p className="text-slate-400 text-center py-2">Nenhuma atividade registrada.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400"> Início</span>
              <span className="text-white font-medium">
                {startEvent ? formatDateTime(startEvent.timestamp) : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">🏁 Fim</span>
              <span className="text-white font-medium">
                {endEvent ? formatDateTime(endEvent.timestamp) : status === 'done' ? formatDateTime(lastEvent?.timestamp) : '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">⏱ Duração</span>
              <span className={`font-bold ${sla?.isViolated ? 'text-red-400' : 'text-green-400'}`}>
                {formatDuration(startEvent?.timestamp, endEvent?.timestamp)}
              </span>
            </div>

            {sla?.expectedMinutes && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400"> SLA esperado</span>
                <span className="text-slate-300">
                  {Math.round(sla.expectedMinutes / 60)}h
                </span>
              </div>
            )}

            {sla?.isViolated && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <div className="flex items-center gap-1.5 text-red-400 font-bold">
                  <span>⚠</span>
                  <span>SLA violado em +{Math.round(sla.delayMinutes / 60)}h</span>
                </div>
              </div>
            )}

            {lastEvent && (
              <div className="mt-2 pt-2 border-t border-slate-600">
                <p className="text-slate-400 mb-1">Última ação</p>
                <p className="text-slate-200">
                  <span className="font-medium">{lastEvent.actor}</span>
                  {' → '}<span className="font-medium">{lastEvent.toStatus}</span>
                </p>
                {lastEvent.note && (
                  <p className="text-slate-400 italic mt-1">"{lastEvent.note}"</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export function TaskNodeWithTooltip({ data }) {
  const [hovered, setHovered] = useState(false);
  const status = data.status ?? 'todo';
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.todo;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <SlaTooltip
          timeline={data.timeline}
          status={status}
          sla={data.sla}
        />
      )}

      <div className={`
        relative px-3 py-2.5 rounded-lg border-2 w-40 text-center
        shadow-sm cursor-pointer transition-all duration-150
        ${cfg.bg} ${cfg.border}
        ${hovered ? 'shadow-lg scale-105' : ''}
      `}>
        <Handle
          type="target"
          position={Position.Left}
          className="!w-2.5 !h-2.5 !border-2 !border-white"
          style={{ background: cfg.border.replace('border-', '#') }}
        />

        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} ${status === 'in_progress' ? 'animate-pulse' : ''}`} />
          <span className="text-xs font-bold text-slate-700 truncate">
            {data.label}
          </span>
        </div>

        <div className="text-xs text-slate-500 truncate">
          👤 {data.actor || 'Sistema'}
        </div>

        {data.sla?.isViolated && (
          <div className="mt-1.5 text-xs font-bold text-red-600 bg-red-100 rounded px-1.5 py-0.5">
            ⚠ +{Math.round(data.sla.delayMinutes / 60)}h atraso
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!w-2.5 !h-2.5 !border-2 !border-white"
          style={{ background: cfg.border.replace('border-', '#') }}
        />
      </div>
    </div>
  );
}