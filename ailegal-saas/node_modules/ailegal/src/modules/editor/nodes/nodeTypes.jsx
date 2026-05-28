import { useState } from 'react';
import { Handle, Position } from 'reactflow';

const STATUS_STYLES = {
  todo:        { border: '2px solid #94a3b8', background: '#f1f5f9', label: '⚪' },
  in_progress: { border: '2px solid #eab308', background: '#fef9c3', label: '🟡', pulse: true },
  done:        { border: '2px solid #22c55e', background: '#dcfce7', label: '🟢' },
  blocked:     { border: '2px solid #ef4444', background: '#fee2e2', label: '🔴' },
};

function getNodeStyle(defaultStyle, status) {
  if (!status || status === 'todo') return defaultStyle;
  const s = STATUS_STYLES[status];
  return { border: s.border, background: s.background };
}

function StatusBadge({ status }) {
  if (!status || status === 'todo') return null;
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      fontSize: 9, marginLeft: 4, verticalAlign: 'middle',
      animation: s.pulse ? 'pulse 1s infinite' : 'none'
    }}>
      {s.label}
    </span>
  );
}

function SlaWarning({ sla }) {
  if (!sla?.isViolated) return null;
  const hours = Math.round(sla.delayMinutes / 60);
  return (
    <div style={{
      fontSize: 9, color: '#ef4444', fontWeight: 700, marginTop: 4,
      background: '#fee2e2', borderRadius: 4, padding: '1px 4px'
    }}>
      ⚠ +{hours}h de atraso
    </div>
  );
}

export const TaskNode = ({ data }) => {
  const style = getNodeStyle(
    { background: '#eff6ff', border: '2px solid #3b82f6' },
    data.status
  );
  return (
    <div style={{ ...style, padding: 12, borderRadius: 8, width: 150, textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#1e293b', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 10, height: 10 }} />
      <div>
        {data.label}
        <StatusBadge status={data.status} />
      </div>
      <div style={{ fontSize: 9, color: '#64748b', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        👤 {data.actor || 'Sistema'}
      </div>
      <SlaWarning sla={data.sla} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 10, height: 10 }} />
    </div>
  );
};

export const TaskNodeWithTooltip = (props) => {
  const [isHovered, setIsHovered] = useState(false);
  const { data } = props;
  const timeline = data.timeline || [];

  const hasStarted = timeline.length > 0;
  const startTime = hasStarted ? new Date(timeline[0].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const isDone = data.status === 'done';
  const endTime = isDone && timeline.length > 0 ? new Date(timeline[timeline.length - 1].timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <div 
      style={{ position: 'relative' }} 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <TaskNode {...props} />

      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          background: '#1e293b',
          color: '#f8fafc',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          width: 140,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{ fontWeight: 700, borderBottom: '1px solid #334155', paddingBottom: 4, marginBottom: 4 }}>
            ⏱️ Tempos do Processo
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ color: '#94a3b8' }}>Início:</span> <span>{startTime}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
            <span style={{ color: '#94a3b8' }}>Fim:</span> <span>{endTime}</span>
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: -4,
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 8,
            height: 8,
            background: '#1e293b'
          }} />
        </div>
      )}
    </div>
  );
};

export const GatewayNode = ({ data }) => {
  const style = getNodeStyle(
    { background: '#fef9c3', border: '2px solid #eab308' },
    data.status
  );
  return (
    <div style={{ position: 'relative', width: 80, height: 80, margin: 'auto' }}>
      <div style={{ ...style, width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(45deg)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ transform: 'rotate(-45deg)', textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#1e293b', padding: 4 }}>
          {data.label}
        </div>
      </div>
      <Handle type="target" position={Position.Left}  style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#eab308', width: 10, height: 10 }} />
    </div>
  );
};

export const StartNode = ({ data }) => (
  <div style={{ position: 'relative', width: 40, height: 40 }}>
    <div style={{ background: '#dcfce7', border: '3px solid #22c55e', width: 40, height: 40, borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
    <Handle type="source" position={Position.Right} style={{ background: '#22c55e', width: 10, height: 10, top: '50%' }} />
  </div>
);

export const EndNode = ({ data }) => (
  <div style={{ position: 'relative', width: 40, height: 40 }}>
    <div style={{ background: '#fee2e2', border: '4px solid #ef4444', width: 40, height: 40, borderRadius: '50%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }} />
    <Handle type="target" position={Position.Left} style={{ background: '#ef4444', width: 10, height: 10, top: '50%' }} />
  </div>
);

export const SwimlaneNode = ({ data }) => (
  <div style={{ width: data.width, height: data.height, borderBottom: '1px solid #cbd5e1', backgroundColor: data.odd ? 'transparent' : '#f1f5f980', display: 'flex' }}>
    <div style={{ width: 40, borderRight: '1px solid #cbd5e1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: 12, fontWeight: 800, color: '#64748b', letterSpacing: 1 }}>
        {data.label.toUpperCase()}
      </div>
    </div>
  </div>
);

export const nodeTypes = {
  task:     TaskNodeWithTooltip,
  gateway:  GatewayNode,
  start:    StartNode,
  end:      EndNode,
  swimlane: SwimlaneNode,
  default:  TaskNodeWithTooltip,
};