import { Handle, Position } from 'reactflow';

export const TaskNode = ({ data }) => (
  <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", padding: 12, borderRadius: 8, width: 140, textAlign: "center", fontSize: 11, fontWeight: "bold", color: "#1e293b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
    <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 10, height: 10 }} />
    {data.label}
    <div style={{ fontSize: 9, color: "#64748b", marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>👤 {data.actor || 'Sistema'}</div>
    <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 10, height: 10 }} />
  </div>
);

export const GatewayNode = ({ data }) => (
  <div style={{ position: 'relative', width: 70, height: 70, margin: 'auto' }}>
    <div style={{ background: "#fef9c3", border: "2px solid #eab308", width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(45deg)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      <div style={{ transform: "rotate(-45deg)", textAlign: "center", fontSize: 10, fontWeight: "bold", color: "#1e293b", padding: 4 }}>{data.label}</div>
    </div>
    <Handle type="target" position={Position.Left} style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
    <Handle type="source" position={Position.Right} style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
    <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#eab308', width: 10, height: 10 }} />
  </div>
);

export const StartNode = () => (
  <div style={{ position: 'relative', width: 40, height: 40 }}>
    <div style={{ background: "#dcfce7", border: "3px solid #22c55e", width: 40, height: 40, borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} />
    <Handle type="source" position={Position.Right} style={{ background: '#22c55e', width: 10, height: 10, top: '50%' }} />
  </div>
);

export const EndNode = () => (
  <div style={{ position: 'relative', width: 40, height: 40 }}>
    <div style={{ background: "#fee2e2", border: "4px solid #ef4444", width: 40, height: 40, borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} />
    <Handle type="target" position={Position.Left} style={{ background: '#ef4444', width: 10, height: 10, top: '50%' }} />
  </div>
);

export const SwimlaneNode = ({ data }) => (
  <div style={{ width: data.width, height: data.height, borderBottom: "1px solid #cbd5e1", backgroundColor: data.odd ? "transparent" : "#f1f5f980", display: "flex" }}>
    <div style={{ width: 40, borderRight: "1px solid #cbd5e1", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: 1 }}>
        {data.label.toUpperCase()}
      </div>
    </div>
  </div>
);

export const nodeTypes = {
  task: TaskNode,
  gateway: GatewayNode,
  start: StartNode,
  end: EndNode,
  swimlane: SwimlaneNode,
  default: TaskNode
};