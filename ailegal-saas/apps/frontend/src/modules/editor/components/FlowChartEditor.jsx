import { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { MousePointer2, ArrowRight } from "lucide-react";
import { EditorCanvas } from './EditorCanvas';
import { BPMN_COLORS } from '../../../styles/theme';

export const FlowChartEditor = ({ nodes, setNodes, edges, setEdges, isReadOnly = false }) => {
  const [activeTool, setActiveTool] = useState('select');

  const BPMN_TOOLS = [
    { type: "select",   label: "Selecionar", icon: () => <MousePointer2 size={18} color="#64748b" /> },
    { type: "connect",  label: "Conectar",   icon: () => <ArrowRight size={18} color="#64748b" /> },
    { type: "start",    label: "Início",     icon: (c) => <circle cx="12" cy="12" r="8" fill={c?.fill} stroke={c?.stroke} strokeWidth="2" /> },
    { type: "task",     label: "Tarefa",     icon: (c) => <rect x="2" y="6" width="20" height="12" rx="2" fill={c?.fill} stroke={c?.stroke} strokeWidth="2" /> },
    { type: "gateway",  label: "Decisão",    icon: (c) => <polygon points="12,2 22,12 12,22 2,12" fill={c?.fill} stroke={c?.stroke} strokeWidth="2" /> },
    { type: "document", label: "Doc",        icon: (c) => <path d="M4,2 L14,2 L20,8 L20,22 L4,22 Z" fill={c?.fill} stroke={c?.stroke} strokeWidth="2" /> },
    { type: "end",      label: "Fim",        icon: (c) => <circle cx="12" cy="12" r="8" fill={c?.fill} stroke={c?.stroke} strokeWidth="4" /> },
  ];

  return (
    <ReactFlowProvider>
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        {!isReadOnly && (
          <div style={{
            width: 64, background: "#ffffff", borderRight: `1px solid #e2e8f0`,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "16px 0", gap: 8, zIndex: 10
          }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, marginBottom: 4 }}>TOOLS</div>

            {BPMN_TOOLS.map(tool => {
              const isDraggable = !['select', 'connect'].includes(tool.type);
              const isActive = activeTool === tool.type;

              return (
                <div
                  key={tool.type}
                  draggable={isDraggable}
                  onClick={() => {
                    if (!isDraggable) setActiveTool(tool.type);
                  }}
                  onDragStart={isDraggable ? (e) => {
                    e.dataTransfer.setData("application/reactflow", tool.type);
                    e.dataTransfer.effectAllowed = "move";
                    setActiveTool('select');
                  } : undefined}
                  title={tool.label}
                  style={{
                    cursor: isDraggable ? "grab" : "pointer",
                    padding: 8, borderRadius: 8,
                    background: isActive ? "#fef3c7" : "transparent",
                    border: isActive ? "1.5px solid #d4a017" : "1px solid #e2e8f0",
                    transition: "all .15s",
                  }}
                >
                  <svg width="24" height="24">
                    {tool.icon(BPMN_COLORS[tool.type])}
                  </svg>
                </div>
              );
            })}
          </div>
        )}

        <EditorCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          isReadOnly={isReadOnly}
          activeTool={activeTool}  
        />
      </div>
    </ReactFlowProvider>
  );
};