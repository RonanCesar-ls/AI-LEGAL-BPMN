import { useState, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';
import { ContextMenu } from './ContextMenu';

export const EditorCanvas = ({ nodes, setNodes, edges, setEdges, isReadOnly, activeTool, projectId }) => {
  const reactFlowInstance = useReactFlow();
  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [timelineModal, setTimelineModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusNote, setStatusNote] = useState('');

  

  const onNodesChange = useCallback((changes) => {
    if (setNodes) setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  const onEdgesChange = useCallback((changes) => {
    if (setEdges) setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  const onConnect = useCallback((params) => {
    if (setEdges) setEdges((eds) => addEdge({
      ...params, type: 'smoothstep',
      markerEnd: { type: 'arrowclosed', color: '#64748b' },
      style: { stroke: '#64748b', strokeWidth: 2 }
    }, eds));
  }, [setEdges]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (isReadOnly || !setNodes) return;
    const type = e.dataTransfer.getData('application/reactflow');
    if (!type || !reactFlowInstance) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const labelMap = { start: 'Início', end: 'Fim', task: 'Nova Tarefa', gateway: 'Decisão', document: 'Documento' };
    setNodes((nds) => nds.concat({
      id: `node_${Date.now()}`, type, position,
      data: { label: labelMap[type] || type, actor: 'Ator', timeline: [] },
      zIndex: 10,
    }));
  }, [reactFlowInstance, setNodes, isReadOnly]);

  const onNodeContextMenu = useCallback((e, node) => {
    e.preventDefault();
    setContextMenu({ type: 'node', id: node.id, x: e.clientX, y: e.clientY });
  }, []);

  const onEdgeContextMenu = useCallback((e, edge) => {
    e.preventDefault();
    setContextMenu({ type: 'edge', id: edge.id, x: e.clientX, y: e.clientY });
  }, []);

  const handleEdit = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'node') {
      const node = nodes.find(n => n.id === contextMenu.id);
      setEditingValue(node?.data?.label || '');
    } else {
      const edge = edges.find(e => e.id === contextMenu.id);
      setEditingValue(edge?.label || '');
    }
    setEditingId(contextMenu.id);
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (!contextMenu) return;
    if (contextMenu.type === 'node') {
      setNodes(nds => nds.filter(n => n.id !== contextMenu.id));
      setEdges(eds => eds.filter(e => e.source !== contextMenu.id && e.target !== contextMenu.id));
    } else {
      setEdges(eds => eds.filter(e => e.id !== contextMenu.id));
    }
    setContextMenu(null);
  };

  const handleStatusChange = async (newStatus) => {
    if (!contextMenu) return;
    const nodeId = contextMenu.id;
    setContextMenu(null);

    if (newStatus === 'blocked') {
      setStatusNote('');
      setStatusModal({ nodeId, newStatus });
      return;
    }

    await applyStatusChange(nodeId, newStatus, undefined);
  };

  const applyStatusChange = async (nodeId, newStatus, note) => {
    const actor = 'Usuário';

    setNodes(nds => nds.map(n => {
      if (n.id !== nodeId) return n;
      
      const newEvent = {
        id:         Date.now().toString(),
        nodeId,
        projectId,
        actor:      actor,
        fromStatus: n.data.status ?? null,
        toStatus:   newStatus,
        timestamp:  new Date().toISOString(),
        note:       note ?? undefined,
      };

      return {
        ...n,
        data: {
          ...n.data,
          status:   newStatus,
          timeline: [...(n.data.timeline || []), newEvent],
        }
      };
    }));

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/process/nodes/${nodeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, actor, note, projectId }),
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleTimeline = async () => {
    if (!contextMenu) return;
    const nodeId = contextMenu.id;
    const node   = nodes.find(n => n.id === nodeId);
    setContextMenu(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/nodes/${nodeId}/timeline?projectId=${projectId}`);
      const data = await res.json();
      setTimelineModal({ nodeId, nodeLabel: node?.data?.label || nodeId, ...data });
    } catch {
      setTimelineModal({ nodeId, nodeLabel: node?.data?.label || nodeId, timeline: [], sla: null, status: null });
    }
  };

  const commitEdit = () => {
    if (!editingId) return;
    setNodes(nds => nds.map(n => n.id === editingId ? { ...n, data: { ...n.data, label: editingValue } } : n));
    setEdges(eds => eds.map(e => e.id === editingId ? { ...e, label: editingValue } : e));
    setEditingId(null);
    setEditingValue('');
  };

  const cursorStyle = activeTool === 'connect' ? 'crosshair' : 'default';

  return (
    <div style={{ flex: 1, position: "relative", cursor: cursorStyle }}>
      {editingId && (
        <div style={{
          position: 'absolute', inset: 0, background: '#00000033',
          zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setEditingId(null)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, width: 340,
            border: '1px solid #e2e8f0', boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: '#1e293b' }}>Editar texto do elemento</p>
            <input
              autoFocus
              value={editingValue}
              onChange={e => setEditingValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, fontSize: 14,
                border: '1.5px solid #d4a017', outline: 'none', color: '#1e293b',
                fontFamily: 'inherit', marginBottom: 12, boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingId(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancelar</button>
              <button onClick={commitEdit} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#d4a017', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>Salvar — Enter</button>
            </div>
          </div>
        </div>
      )}

      {statusModal && (
        <div style={{
          position: 'absolute', inset: 0, background: '#00000044', zIndex: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setStatusModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, width: 380,
            border: '1px solid #fca5a5', boxShadow: '0 16px 48px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#fee2e2', borderRadius: 8, padding: '6px 10px', fontSize: 18 }}>🔴</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>Registrar Impedimento</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Explique o que está bloqueando esta tarefa
                </div>
              </div>
            </div>

            <textarea
              autoFocus
              value={statusNote}
              onChange={e => setStatusNote(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  applyStatusChange(statusModal.nodeId, statusModal.newStatus, statusNote.trim() || undefined);
                  setStatusModal(null);
                }
                if (e.key === 'Escape') setStatusModal(null);
              }}
              placeholder="Ex: Faltou o documento X. Aguardando o cliente enviar."
              style={{
                width: '100%', minHeight: 80, padding: '10px 12px',
                borderRadius: 8, fontSize: 13, color: '#1e293b',
                border: '1.5px solid #fca5a5', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical',
                boxSizing: 'border-box', marginBottom: 16,
                lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.borderColor = '#ef4444'}
              onBlur={e => e.target.style.borderColor = '#fca5a5'}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setStatusModal(null)}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                  color: '#64748b'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  applyStatusChange(statusModal.nodeId, statusModal.newStatus, statusNote.trim() || undefined);
                  setStatusModal(null);
                }}
                style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#ef4444', color: '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
                }}
              >
                🔴 Confirmar Impedimento
              </button>
            </div>

            <div style={{ textAlign: 'right', marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
              Ctrl+Enter para confirmar · Esc para cancelar
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={contextMenu.type}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onTimeline={handleTimeline}
          onClose={() => setContextMenu(null)}
        />
      )}

      {timelineModal && (
        <div style={{
          position: 'absolute', inset: 0, background: '#00000044', zIndex: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setTimelineModal(null)}>
          <div style={{
            background: '#fff', borderRadius: 12, width: 420, maxHeight: '80vh',
            overflow: 'auto', boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>📋 Timeline</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{timelineModal.nodeLabel}</div>
              </div>
              <button onClick={() => setTimelineModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>✕</button>
            </div>

            {timelineModal.sla && (
              <div style={{
                margin: '12px 16px', padding: '10px 14px', borderRadius: 8,
                background: timelineModal.sla.isViolated ? '#fee2e2' : '#dcfce7',
                border: `1px solid ${timelineModal.sla.isViolated ? '#fca5a5' : '#86efac'}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: timelineModal.sla.isViolated ? '#dc2626' : '#16a34a' }}>
                  {timelineModal.sla.isViolated ? '⚠ SLA Violado' : '✓ SLA OK'}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                  Esperado: {Math.round(timelineModal.sla.expectedMinutes / 60)}h
                  {timelineModal.sla.actualMinutes != null && (
                    <> · Real: {Math.round(timelineModal.sla.actualMinutes / 60)}h
                      {timelineModal.sla.isViolated && <span style={{ color: '#dc2626', fontWeight: 700 }}> · +{Math.round(timelineModal.sla.delayMinutes / 60)}h de atraso</span>}
                    </>
                  )}
                </div>
              </div>
            )}

            <div style={{ padding: '8px 16px 16px' }}>
              {timelineModal.timeline?.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '24px 0', fontSize: 13 }}>
                  Nenhuma alteração registrada ainda.
                </div>
              ) : (
                timelineModal.timeline?.map((event, i) => (
                  <div key={event.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 4 }} />
                      {i < timelineModal.timeline.length - 1 && (
                        <div style={{ width: 2, flex: 1, background: '#e2e8f0', marginTop: 4 }} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                        {event.actor} alterou o status
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {event.fromStatus ? `${event.fromStatus} →` : 'Início →'} <strong>{event.toStatus}</strong>
                      </div>
                      {event.note && (
                        <div style={{ fontSize: 11, color: '#6366f1', marginTop: 4, fontStyle: 'italic' }}>
                          "{event.note}"
                        </div>
                      )}
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                        {new Date(event.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes} 
          edges={edges} 
          nodeTypes={nodeTypes} // ← A MÁGICA AQUI: Passando a constante importada direto!
          onNodesChange={isReadOnly ? undefined : onNodesChange}
          onEdgesChange={isReadOnly ? undefined : onEdgesChange}
          onConnect={isReadOnly ? undefined : onConnect}
          onDrop={isReadOnly ? undefined : onDrop}
          onDragOver={isReadOnly ? undefined : onDragOver}
          onNodeContextMenu={isReadOnly ? undefined : onNodeContextMenu}
          onEdgeContextMenu={isReadOnly ? undefined : onEdgeContextMenu}
          nodesDraggable={activeTool !== 'connect'}
          deleteKeyCode="Delete"
          fitView
        >
          <Background color="#cbd5e1" gap={24} size={2} />
          <Controls />
          <MiniMap nodeColor={n => n.type === 'gateway' ? '#eab308' : '#3b82f6'} />
        </ReactFlow>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>
          Aguardando fluxo...
        </div>
      )}
    </div>
  );
};