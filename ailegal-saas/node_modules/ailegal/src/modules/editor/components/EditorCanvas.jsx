// src/modules/editor/components/EditorCanvas.jsx
import { useState, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import { nodeTypes } from '../nodes/nodeTypes';
import { ContextMenu } from './ContextMenu';

export const EditorCanvas = ({ nodes, setNodes, edges, setEdges, isReadOnly, activeTool }) => {
  const reactFlowInstance = useReactFlow();
  const [contextMenu, setContextMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // Correção do aviso: Memorizando os tipos de nós para o Vite não recriar a cada render
  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

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
      data: { label: labelMap[type] || type, actor: 'Ator' },
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

      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} onEdit={handleEdit} onDelete={handleDelete} onClose={() => setContextMenu(null)} />
      )}

      {nodes.length > 0 ? (
        <ReactFlow
          nodes={nodes} edges={edges} nodeTypes={memoizedNodeTypes}
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