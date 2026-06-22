import { useState, useMemo, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, ReactFlowProvider, useReactFlow } from 'reactflow';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { nodeTypes } from '../nodes/nodeTypes';

function WalkthroughCanvas({ nodes, edges, currentIndex, steps }) {
  const { setCenter } = useReactFlow();

  useEffect(() => {
    const currentNode = steps[currentIndex];
    if (!currentNode) return;

    const x = currentNode.position.x + 75;
    const y = currentNode.position.y + 30;

    setCenter(x, y, { zoom: 1.3, duration: 600 });
  }, [currentIndex, steps, setCenter]);

  const styledNodes = useMemo(() => {
    const currentId = steps[currentIndex]?.id;
    return nodes.map(n => {
      if (n.type === 'swimlane') {
        return { ...n, style: { ...n.style, opacity: 0.4 } };
      }
      const isCurrent = n.id === currentId;
      return {
        ...n,
        style: { ...n.style, opacity: isCurrent ? 1 : 0.2, transition: 'opacity .3s' },
        zIndex: isCurrent ? 100 : 10,
      };
    });
  }, [nodes, steps, currentIndex]);

  const styledEdges = useMemo(() => {
    const currentId = steps[currentIndex]?.id;
    return edges.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity: (e.source === currentId || e.target === currentId) ? 1 : 0.1,
        transition: 'opacity .3s',
      },
    }));
  }, [edges, steps, currentIndex]);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <ReactFlow
      nodes={styledNodes}
      edges={styledEdges}
      nodeTypes={memoizedNodeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      proOptions={{ hideAttribution: true }}
      minZoom={0.3}
      maxZoom={2}
    >
      <Background color="#1e293b" gap={24} size={2} />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

const STATUS_LABELS = {
  todo:        { label: 'A Fazer',      color: '#94a3b8' },
  in_progress: { label: 'Em Andamento', color: '#eab308' },
  done:        { label: 'Concluído',    color: '#22c55e' },
  blocked:     { label: 'Impedimento',  color: '#ef4444' },
};

export function WalkthroughPresentation({ nodes, edges, onExit }) {
  const steps = useMemo(() => {
    return nodes
      .filter(n => n.type !== 'swimlane')
      .sort((a, b) => a.position.x - b.position.x);
  }, [nodes]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentNode = steps[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, steps.length - 1));
  }, [steps.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onExit]);

  if (!currentNode) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <p>Nenhuma etapa encontrada neste fluxo.</p>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[currentNode.data?.status] ?? STATUS_LABELS.todo;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0f172a', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexShrink: 0 }}>
        <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
          Walkthrough Guiado
        </span>
        <button
          onClick={onExit}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 14px', color: '#e2e8f0', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
        >
          <X size={14} /> Sair (Esc)
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        <div style={{ flex: 1, position: 'relative' }}>
          <ReactFlowProvider>
            <WalkthroughCanvas nodes={nodes} edges={edges} currentIndex={currentIndex} steps={steps} />
          </ReactFlowProvider>
        </div>

        <div style={{ width: 320, background: '#1e293b', borderLeft: '1px solid rgba(255,255,255,0.08)', padding: 24, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Etapa {currentIndex + 1} de {steps.length}
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, lineHeight: 1.3 }}>
            {currentNode.data?.label}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusInfo.color }} />
            <span style={{ fontSize: 13, color: statusInfo.color, fontWeight: 600 }}>{statusInfo.label}</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Responsável</p>
            <p style={{ fontSize: 14, color: '#e2e8f0' }}>👤 {currentNode.data?.actor ?? 'Sistema'}</p>
          </div>

          {currentNode.data?.sla?.expectedMinutes && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>SLA</p>
              <p style={{ fontSize: 14, color: '#e2e8f0' }}>
                {Math.round(currentNode.data.sla.expectedMinutes / 60)}h esperadas
              </p>
              {currentNode.data.sla.isViolated && (
                <p style={{ fontSize: 13, color: '#f87171', fontWeight: 600, marginTop: 4 }}>
                  ⚠ +{Math.round(currentNode.data.sla.delayMinutes / 60)}h de atraso
                </p>
              )}
            </div>
          )}

          {currentNode.data?.sourceFile && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#64748b', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Origem</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>📄 {currentNode.data.sourceFile}</p>
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{
                height: '100%',
                width: `${((currentIndex + 1) / steps.length) * 100}%`,
                background: '#d4a017',
                borderRadius: 2,
                transition: 'width .3s',
              }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)', color: currentIndex === 0 ? '#475569' : '#e2e8f0',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === steps.length - 1}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', borderRadius: 8, border: 'none',
                  background: currentIndex === steps.length - 1 ? 'rgba(255,255,255,0.05)' : '#d4a017',
                  color: currentIndex === steps.length - 1 ? '#475569' : '#1e293b',
                  cursor: currentIndex === steps.length - 1 ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700,
                }}
              >
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}