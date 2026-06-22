import { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import { X } from 'lucide-react';
import { nodeTypes } from '../nodes/nodeTypes';

export function FullscreenPresentation({ nodes, edges, onExit }) {
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#0f172a',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
    }}>
      {/* Header minimalista */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 24px', flexShrink: 0,
      }}>
        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Modo Apresentação
        </span>
        <button
          onClick={onExit}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8, padding: '8px 14px', color: '#e2e8f0', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
          }}
        >
          <X size={14} /> Sair (Esc)
        </button>
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={memoizedNodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={24} size={2} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}