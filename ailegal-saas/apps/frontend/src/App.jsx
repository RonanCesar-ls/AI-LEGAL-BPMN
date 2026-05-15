  import { useState, useRef, useEffect } from "react";
  import dagre from "dagre";
  import { Scale, Upload, FileText, FolderOpen, Save, User, Settings, LogOut, ChevronRight, Plus, ArrowRight, X, Eye, EyeOff, Zap, Loader, GitBranch, Cpu, Shield, Menu, MousePointer2, Mail, Lock, BarChart2 } from "lucide-react";
  import ReactFlow, { Background, Controls, MiniMap, Handle, Position, applyNodeChanges, applyEdgeChanges, addEdge, useReactFlow, ReactFlowProvider } from 'reactflow';
  import { useCallback } from 'react';
  import 'reactflow/dist/style.css';

  // --- PALETA DE CORES (MODO CLARO) ---
  const GOLD = "#d4a017";
  const GOLD_DIM = "#b88a12";
  const BG = "#f4f5f7"; 
  const SURFACE = "#ffffff"; 
  const CARD = "#ffffff"; 
  const CARD2 = "#f8f9fa"; 
  const BORDER = "#e2e8f0"; 
  const TEXT = "#1e293b"; 
  const MUTED = "#64748b"; 
  const DANGER = "#ef4444"; 

  // --- CORES BPMN ---
  const BPMN_COLORS = {
    start: { fill: "#dcfce7", stroke: "#22c55e" },
    end: { fill: "#fee2e2", stroke: "#ef4444" },
    task: { fill: "#eff6ff", stroke: "#3b82f6" },
    gateway: { fill: "#fef9c3", stroke: "#eab308" },
    document: { fill: "#f8fafc", stroke: "#94a3b8" }
  };

  // --- AUTO-LAYOUT COM DAGRE E SWIMLANES NO REACT FLOW ---
 const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: 'LR', nodesep: 80, ranksep: 200 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 60 });
  });
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  dagre.layout(dagreGraph);

  const uniqueActors = [...new Set(nodes.map(n => n.data?.actor || 'Sistema'))];

  // Agrupa por [actor, coluna_arredondada] para detectar colisões reais
  const columnBuckets = {};
  nodes.forEach((node) => {
    const pos = dagreGraph.node(node.id);
    const actor = node.data?.actor || 'Sistema';
    const col = Math.round(pos.x / 50); // bucket de 50px = mesma "coluna"
    const key = `${actor}__${col}`;
    if (!columnBuckets[key]) columnBuckets[key] = [];
    columnBuckets[key].push(node.id);
  });

  // Calcula altura máxima de stack por swimlane
  const maxStack = Math.max(1, ...Object.values(columnBuckets).map(b => b.length));
  const NODE_H = 80;
  const LANE_PADDING = 60;
  const swimlaneHeight = Math.max(200, maxStack * NODE_H + LANE_PADDING * 2);

  // Posiciona cada nó: centralizado verticalmente dentro do bucket
  const placedCount = {};
  const layoutedNodes = nodes.map((node) => {
    const pos = dagreGraph.node(node.id);
    const actor = node.data?.actor || 'Sistema';
    const actorIndex = uniqueActors.indexOf(actor);
    const col = Math.round(pos.x / 50);
    const key = `${actor}__${col}`;
    const bucket = columnBuckets[key];
    const totalInBucket = bucket.length;

    if (!placedCount[key]) placedCount[key] = 0;
    const indexInBucket = placedCount[key]++;

    // Centraliza o grupo verticalmente na swimlane
    const groupHeight = totalInBucket * NODE_H;
    const groupStartY = (swimlaneHeight - groupHeight) / 2;
    const nodeY = groupStartY + indexInBucket * NODE_H;

    return {
      ...node,
      position: {
        x: pos.x + 80,
        y: actorIndex * swimlaneHeight + nodeY,
      },
      zIndex: 10,
    };
  });

  const allX = nodes.map(n => dagreGraph.node(n.id).x);
  const swimlaneWidth = Math.max(1400, Math.max(...allX) + 600);

  const swimlaneNodes = uniqueActors.map((actor, i) => ({
    id: `swimlane-${i}`,
    type: 'swimlane',
    position: { x: 0, y: i * swimlaneHeight },
    data: { label: actor, width: swimlaneWidth, height: swimlaneHeight, odd: i % 2 !== 0 },
    draggable: false, selectable: false, zIndex: -1,
  }));

  const layoutedEdges = edges.map(e => ({
    id: e.id || `e${e.source}-${e.target}`,
    source: e.source, target: e.target,
    label: e.label || "",
    type: 'smoothstep',
    markerEnd: { type: 'arrowclosed', color: "#64748b" },
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#b45309", fontWeight: 700, fontSize: 11 },
    labelBgStyle: { fill: "#ffffff" },
  }));

  return { nodes: [...swimlaneNodes, ...layoutedNodes], edges: layoutedEdges };
};

  // ─── COMPONENTES BASE ─────────────────────────────────────────────────────────

  const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon }) => {
    const [show, setShow] = useState(false);
    return (
      <div style={{ marginBottom: 16 }}>
        {label && <label style={{ display: "block", color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>}
        <div style={{ position: "relative" }}>
          {Icon && <Icon size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED }} />}
          <input
            type={type === "password" ? (show ? "text" : "password") : type}
            value={value} onChange={onChange} placeholder={placeholder}
            style={{ width: "100%", boxSizing: "border-box", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: "inherit", fontSize: 14, padding: Icon ? "12px 14px 12px 40px" : "12px 14px", outline: "none", transition: "border .18s" }}
            onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = BORDER}
          />
          {type === "password" && (
            <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center" }}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style: extraStyle }) => {
    const styles = {
      primary: { background: GOLD, color: "#ffffff", border: "none" },
      outline: { background: "transparent", color: TEXT, border: `1px solid ${BORDER}` },
    };
    const sizes = { sm: { padding: "7px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 15 } };
    return (
      <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...sizes[size], borderRadius: 8, fontFamily: "inherit", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all .18s", opacity: disabled ? 0.5 : 1, ...extraStyle }}
        onMouseEnter={e => { if (!disabled && variant === "primary") e.currentTarget.style.background = GOLD_DIM; if (!disabled && variant === "outline") e.currentTarget.style.background = CARD2; }}
        onMouseLeave={e => { if (variant === "primary") e.currentTarget.style.background = GOLD; if (variant === "outline") e.currentTarget.style.background = "transparent"; }}>
        {children}
      </button>
    );
  };

  const Badge = ({ children, color = GOLD }) => (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 4, fontSize: 11, padding: "2px 8px", fontWeight: 700 }}>{children}</span>
  );

  const Modal = ({ title, onClose, children, width = 540 }) => (
    <div style={{ position: "fixed", inset: 0, background: "#00000066", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, width, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 80px #00000022" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ color: TEXT, fontWeight: 700, fontSize: 16 }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex" }}><X size={18} /></button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );

  // ─── EDITOR BPMN INTERATIVO ──────────────────────────────────────────────────

  const BPMN_TOOLS = [
    { type: "start", label: "Início", icon: (c) => <circle cx="12" cy="12" r="8" fill={c.fill} stroke={c.stroke} strokeWidth="2" /> },
    { type: "task", label: "Tarefa", icon: (c) => <rect x="2" y="6" width="20" height="12" rx="2" fill={c.fill} stroke={c.stroke} strokeWidth="2" /> },
    { type: "gateway", label: "Decisão", icon: (c) => <polygon points="12,2 22,12 12,22 2,12" fill={c.fill} stroke={c.stroke} strokeWidth="2" /> },
    { type: "document", label: "Doc", icon: (c) => <path d="M4,2 L14,2 L20,8 L20,22 L4,22 Z" fill={c.fill} stroke={c.stroke} strokeWidth="2" /> },
    { type: "end", label: "Fim", icon: (c) => <circle cx="12" cy="12" r="8" fill={c.fill} stroke={c.stroke} strokeWidth="4" /> },
  ];

  // ─── EDITOR REACT FLOW OFICIAL (AGORA EDITÁVEL E COM MENU) ───────────────────


  const ContextMenu = ({ x, y, onEdit, onDelete, onClose }) => {
    useEffect(() => {
      const close = () => onClose();
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }, [onClose]);

    return (
      <div
        style={{
          position: 'fixed', top: y, left: x, zIndex: 1000,
          background: '#ffffff', border: '1px solid #e2e8f0',
          borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          minWidth: 160, overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onEdit}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '10px 14px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, color: '#1e293b', fontWeight: 600,
            borderBottom: '1px solid #f1f5f9', fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          ✏️  Editar texto
        </button>
        <button
          onClick={onDelete}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '10px 14px', background: 'none', border: 'none',
            cursor: 'pointer', fontSize: 13, color: '#ef4444', fontWeight: 600,
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          🗑️  Excluir
        </button>
      </div>
    );
  };
  // ─── COMPONENTE INTERNO DO EDITOR (ONDE A MÁGICA ACONTECE) ───────────────
  const EditorCanvas = ({ nodes, setNodes, edges, setEdges, isReadOnly, activeTool }) => {
    const reactFlowInstance = useReactFlow();
    const [contextMenu, setContextMenu] = useState(null);
    // contextMenu: { type: 'node'|'edge', id, x, y }
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState('');

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

    // ─── CONTEXT MENU ────────────────────────────────────────────────
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
      // Tenta nos nós primeiro
      setNodes(nds => nds.map(n =>
        n.id === editingId ? { ...n, data: { ...n.data, label: editingValue } } : n
      ));
      // Depois nas edges
      setEdges(eds => eds.map(e =>
        e.id === editingId ? { ...e, label: editingValue } : e
      ));
      setEditingId(null);
      setEditingValue('');
    };

    // Cursor muda conforme tool ativo
    const cursorStyle = activeTool === 'connect' ? 'crosshair' : 'default';

    return (
      <div style={{ flex: 1, position: "relative", cursor: cursorStyle }}>

        {/* MODAL DE EDIÇÃO INLINE */}
        {editingId && (
          <div style={{
            position: 'absolute', inset: 0, background: '#00000033',
            zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={() => setEditingId(null)}>
            <div style={{
              background: '#fff', borderRadius: 12, padding: 24, width: 340,
              border: '1px solid #e2e8f0', boxShadow: '0 16px 48px rgba(0,0,0,0.15)'
            }} onClick={e => e.stopPropagation()}>
              <p style={{ fontWeight: 700, marginBottom: 12, fontSize: 14, color: '#1e293b' }}>
                Editar texto do elemento
              </p>
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
                <button onClick={() => setEditingId(null)} style={{
                  padding: '8px 16px', borderRadius: 8, border: '1px solid #e2e8f0',
                  background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit'
                }}>Cancelar</button>
                <button onClick={commitEdit} style={{
                  padding: '8px 16px', borderRadius: 8, border: 'none',
                  background: '#d4a017', color: '#fff', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'inherit'
                }}>Salvar — Enter</button>
              </div>
            </div>
          </div>
        )}

        {/* MENU DE CONTEXTO */}
        {contextMenu && (
          <ContextMenu
            x={contextMenu.x} y={contextMenu.y}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setContextMenu(null)}
          />
        )}

        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={nodeTypes}
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

  // ─── O COMPONENTE PRINCIPAL QUE ENVOLVE O CANVAS COM O PROVIDER ─────────

  // O ReactFlowProvider precisa estar FORA, e o useReactFlow() DENTRO do mesmo contexto.
  // Troca a estrutura: Provider envolve tudo, EditorCanvas vira filho direto do ReactFlow.

  const FlowChartEditor = ({ nodes, setNodes, edges, setEdges, isReadOnly = false }) => {
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
                // select e connect são clicáveis, os outros são draggable
                const isDraggable = !['select', 'connect'].includes(tool.type);
                const isActive = activeTool === tool.type;

                return (
                  <div
                    key={tool.type}
                    draggable={isDraggable}
                    onClick={() => {
                      // select e connect mudam o tool ativo ao clicar
                      if (!isDraggable) setActiveTool(tool.type);
                    }}
                    onDragStart={isDraggable ? (e) => {
                      e.dataTransfer.setData("application/reactflow", tool.type);
                      e.dataTransfer.effectAllowed = "move";
                      // volta pro select depois de soltar um nó
                      setActiveTool('select');
                    } : undefined}
                    title={tool.label}
                    style={{
                      cursor: isDraggable ? "grab" : "pointer",
                      padding: 8,
                      borderRadius: 8,
                      // destaca o tool ativo em dourado
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
  // ─── A LANDING PAGE ORIGINAL COMPLETA E BELA DE VOLTA ───────────────────────────

  const Landing = ({ onLogin, onCadastro }) => {
    const features = [
      { icon: Upload, title: "Importação RCC", desc: "Carregue arquivos RCC e o sistema processa automaticamente as entidades jurídicas." },
      { icon: GitBranch, title: "Fluxograma com IA", desc: "A LLM analisa e gera diagramas BPMN interativos e personalizados." },
      { icon: Cpu, title: "Correlação de Entidades", desc: "Identificação automática de partes, prazos e interdependências processuais." },
      { icon: Shield, title: "Integração com Advocacia", desc: "Compatível com os principais softwares jurídicos do mercado." },
      { icon: BarChart2, title: "Gestão de Projetos", desc: "Organize e gerencie múltiplos processos em um único ambiente." },
      { icon: Mail, title: "Integração Gmail", desc: "Conecte sua caixa de entrada e automatize o fluxo documental." },
    ];

    // O React Flow exige IDs em formato de texto (string) e as propriedades position e data!
    const previewNodes = [
      { id: '1', type: "start", position: { x: 60, y: 84 }, data: { label: "Entrada RCC" } },
      { id: '2', type: "task", position: { x: 200, y: 60 }, data: { label: "Análise Documental", actor: "Secretaria" } },
      { id: '3', type: "gateway", position: { x: 420, y: 60 }, data: { label: "Despacho?" } }
    ];
    
    const previewEdges = [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', markerEnd: { type: 'arrowclosed', color: "#64748b" }, style: { stroke: "#64748b", strokeWidth: 2 } }, 
      { id: 'e2-3', source: '2', target: '3', type: 'smoothstep', markerEnd: { type: 'arrowclosed', color: "#64748b" }, style: { stroke: "#64748b", strokeWidth: 2 } }
    ];
    

    return (
      <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: "'DM Sans', sans-serif" }}>
        {/* Header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 60px", borderBottom: `1px solid ${BORDER}`, background: SURFACE, position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: `${GOLD}22`, borderRadius: 10, padding: 8 }}><Scale size={20} color={GOLD_DIM} /></div>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Ai<span style={{ color: GOLD_DIM }}>Legal</span></span>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={onLogin} style={{ background: "none", border: `1px solid ${BORDER}`, color: TEXT, padding: "8px 18px", borderRadius: 8, fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Login</button>
            <Btn onClick={onCadastro} size="sm">Cadastro</Btn>
            <button style={{ background: "none", border: "none", color: MUTED, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Contate-Nos</button>
          </nav>
        </header>

        {/* Hero */}
        <section style={{ padding: "100px 60px 80px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${GOLD}15`, border: `1px solid ${GOLD}33`, borderRadius: 100, padding: "5px 14px", marginBottom: 24 }}>
              <Zap size={12} color={GOLD_DIM} />
              <span style={{ color: GOLD_DIM, fontSize: 12, fontWeight: 700 }}>Plataforma Jurídica com IA Generativa</span>
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, marginBottom: 20, fontFamily: "'Playfair Display', serif" }}>
              Automatize seu<br />
              <span style={{ color: GOLD }}>escritório jurídico</span>
            </h1>
            <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
              Importe arquivos RCC, mapeie gargalos operacionais e gere fluxogramas precisos (padrão BPMN) com o poder da Inteligência Artificial Generativa.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={onCadastro} size="lg"><Zap size={16} />Começar Grátis</Btn>
              <Btn onClick={onLogin} variant="outline" size="lg">Ver Demo</Btn>
            </div>
            
            {/* Estatísticas Originais que você pediu pra voltar */}
            <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
              {[["500+", "Escritórios"], ["12k+", "Processos"], ["98%", "Precisão"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: GOLD_DIM }}>{v}</div>
                  <div style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* App Preview com o nosso novo BPMN */}
          <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", height: 400, display: "flex", flexDirection: "column" }}>
            <div style={{ background: CARD2, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: DANGER }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ecdc4" }} />
              <span style={{ color: MUTED, fontSize: 12, marginLeft: 8, fontWeight: 500 }}>AiLegal — Processo Penal.rcc</span>
            </div>
            <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
              <FlowChartEditor isReadOnly={true} nodes={previewNodes} edges={previewEdges} />
            </div>
          </div>
        </section>

        {/* Features Originais */}
        <section style={{ background: SURFACE, padding: "80px 60px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>Tudo que seu escritório precisa</h2>
            <p style={{ textAlign: "center", color: MUTED, marginBottom: 52 }}>Uma plataforma completa, do arquivo RCC ao fluxo otimizado.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 24, boxShadow: "0 4px 6px rgba(0,0,0,0.02)" }}>
                  <div style={{ background: `${GOLD}18`, borderRadius: 8, padding: 10, display: "inline-flex", marginBottom: 16 }}>
                    <Icon size={18} color={GOLD_DIM} />
                  </div>
                  <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 15 }}>{title}</h3>
                  <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Original */}
        <section style={{ padding: "80px 60px", textAlign: "center", background: BG }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Pronto para começar?</h2>
          <p style={{ color: MUTED, marginBottom: 32 }}>Crie sua conta gratuitamente e transforme seu fluxo jurídico hoje.</p>
          <Btn onClick={onCadastro} size="lg"><ArrowRight size={16} />Criar conta grátis</Btn>
        </section>
      </div>
    );
  };

  // ─── LOGIN ────────────────────────────────────────────────────────────────────

  const Login = ({ onLogin, onCadastro, onBack }) => {
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);

    const handle = () => {
      setLoading(true);
      setTimeout(() => { setLoading(false); onLogin({ name: "Usuário Admin", email, role: "Advogado" }); }, 1000);
    };

    return (
      <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onBack}>
          <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}><Scale size={18} color={GOLD_DIM} /></div>
          <span style={{ fontWeight: 800, color: TEXT }}>Ai<span style={{ color: GOLD_DIM }}>Legal</span></span>
        </div>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "44px 48px", width: 420, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Bem-vindo! <span style={{ color: GOLD }}>⚖</span></h1>
          <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>Acesse sua conta para continuar</p>
          
          <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" icon={Mail} />
          <Input label="Senha" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon={Lock} />
          
          <Btn onClick={handle} size="lg" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
            {loading ? <Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> : "Entrar"}
          </Btn>
          <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>Não tem conta? <span onClick={onCadastro} style={{ color: GOLD_DIM, cursor: "pointer", fontWeight: 700 }}>Cadastre-se</span></p>
        </div>
      </div>
    );
  };

  // ─── COMPONENTES VISUAIS BPMN PARA O REACT FLOW ──────────────────────────────

  const TaskNode = ({ data }) => (
    <div style={{ background: "#eff6ff", border: "2px solid #3b82f6", padding: 12, borderRadius: 8, width: 140, textAlign: "center", fontSize: 11, fontWeight: "bold", color: "#1e293b", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 10, height: 10 }} />
      {data.label}
      <div style={{ fontSize: 9, color: "#64748b", marginTop: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>👤 {data.actor || 'Sistema'}</div>
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 10, height: 10 }} />
    </div>
  );

  const GatewayNode = ({ data }) => (
    <div style={{ position: 'relative', width: 70, height: 70, margin: 'auto' }}>
      <div style={{ background: "#fef9c3", border: "2px solid #eab308", width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(45deg)", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <div style={{ transform: "rotate(-45deg)", textAlign: "center", fontSize: 10, fontWeight: "bold", color: "#1e293b", padding: 4 }}>{data.label}</div>
      </div>
      <Handle type="target" position={Position.Left} style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#eab308', width: 10, height: 10, top: '50%' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ background: '#eab308', width: 10, height: 10 }} />
    </div>
  );

  const StartNode = ({ data }) => (
    <div style={{ position: 'relative', width: 40, height: 40 }}>
      <div style={{ background: "#dcfce7", border: "3px solid #22c55e", width: 40, height: 40, borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} />
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e', width: 10, height: 10, top: '50%' }} />
    </div>
  );

  const EndNode = ({ data }) => (
    <div style={{ position: 'relative', width: 40, height: 40 }}>
      <div style={{ background: "#fee2e2", border: "4px solid #ef4444", width: 40, height: 40, borderRadius: "50%", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }} />
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444', width: 10, height: 10, top: '50%' }} />
    </div>
  );

  // O componente visual da Raia
  const SwimlaneNode = ({ data }) => (
    <div style={{ width: data.width, height: data.height, borderBottom: "1px solid #cbd5e1", backgroundColor: data.odd ? "transparent" : "#f1f5f980", display: "flex" }}>
      <div style={{ width: 40, borderRight: "1px solid #cbd5e1", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-90deg)", whiteSpace: "nowrap", fontSize: 12, fontWeight: 800, color: "#64748b", letterSpacing: 1 }}>
          {data.label.toUpperCase()}
        </div>
      </div>
    </div>
  );

  // Atualize o nodeTypes para incluir a swimlane
  const nodeTypes = {
    task: TaskNode,
    gateway: GatewayNode,
    start: StartNode,
    end: EndNode,
    swimlane: SwimlaneNode,
    default: TaskNode
  };

  // ─── MAIN APP (O SISTEMA COMPLETO) ────────────────────────────────────────────

  const App = ({ user, onLogout }) => {
    const [view, setView] = useState("editor");
    const [modal, setModal] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [generating, setGenerating] = useState(false);
    const fileInputRef = useRef(null);
    // ESTADO INICIAL VAZIO
    
    const [promptFullscreen, setPromptFullscreen] = useState(false);
    // helpers derivados — sem estado extra
    const activeProject = projects.find(p => p.id === activeProjectId) || null;
    const nodes = activeProject?.nodes || [];
    const edges = activeProject?.edges || [];
    const generated = activeProject?.status === 'done';

    // SIMULA A IMPORTAÇÃO E GERAÇÃO DINÂMICA
    const runGenerate = async () => {
      if (!activeProject || !activeProject.promptText.trim()) return;
      const projectId = activeProject.id;

      const updateProject = (patch) =>
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...patch } : p));

      const addLog = (msg) =>
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, aiLog: [...(p.aiLog || []), msg] } : p
        ));

      setGenerating(true);
      updateProject({ status: 'generating', nodes: [], edges: [] });

      try {
        addLog('→ Enviando prompt para a IA (Gemini)...');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: activeProject.promptText })
        });
        if (!res.ok) throw new Error('Erro na API');

        addLog('→ Estruturando JSON retornado...');
        const data = await res.json();

        addLog('→ Aplicando algoritmo Dagre para Auto-Layout...');
        const layout = getLayoutedElements(data.nodes, data.edges);

        updateProject({ nodes: layout.nodes, edges: layout.edges, status: 'done' });
        addLog(`✓ Fluxograma gerado! (${layout.nodes.length} nós)`);
      } catch (err) {
        addLog('❌ Erro: Falha ao gerar fluxograma.');
        updateProject({ status: 'error' });
      } finally {
        setGenerating(false);
      }
    };

    const setActiveNodes = (updater) =>
      setProjects(prev => prev.map(p =>
        p.id === activeProjectId
          ? { ...p, nodes: typeof updater === 'function' ? updater(p.nodes) : updater }
          : p
      ));

    const setActiveEdges = (updater) =>
      setProjects(prev => prev.map(p =>
        p.id === activeProjectId
          ? { ...p, edges: typeof updater === 'function' ? updater(p.edges) : updater }
          : p
      ));

    const handleFileUpload = (e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => handleExtractPrompt(file));
      e.target.value = ''; // reset input para permitir reupload do mesmo arquivo
    };

    const handleDropArea = (e) => {
      e.preventDefault();
      Array.from(e.dataTransfer.files).forEach(file => handleExtractPrompt(file));
    };

    const handleExtractPrompt = async (file) => {
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      setProjects(prev => [...prev, {
        id: projectId,
        name: file.name.replace(/\.(pdf|docx)$/i, ''),
        promptText: '',
        nodes: [],
        edges: [],
        status: 'extracting',
        aiLog: [`→ Lendo arquivo: ${file.name}...`],
        type: 'Automático',
      }]);
    setActiveProjectId(projectId);

    const updateProject = (patch) =>
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...patch } : p));

    const addLog = (msg) =>
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, aiLog: [...(p.aiLog || []), msg] } : p
      ));

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/process/extract-prompt`, {
          method: 'POST', body: formData
        });
        if (!res.ok) throw new Error('Erro ao processar arquivo');
        const data = await res.json();
        updateProject({ promptText: data.suggestedPrompt, status: 'ready' });
        addLog('✓ Rascunho gerado! Revise e clique em Gerar Fluxograma.');
      } catch (err) {
        addLog('❌ Erro ao processar o arquivo.');
        updateProject({ status: 'error' });
      }
    };

    const sidebarMenu = [
      { id: "editor", icon: GitBranch, label: "Editor BPMN" },
      { id: "novo", icon: Plus, label: "Novo Projeto" },
      { id: "conta", icon: User, label: "Minha Conta" },
    ];

    return (
      <div style={{ display: "flex", height: "100vh", background: BG, color: TEXT, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
        
        {/* 1. SIDEBAR ESQUERDA */}
        <div style={{ width: sidebarOpen ? 220 : 64, background: SURFACE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", transition: "width .2s" }}>
          <div style={{ padding: "18px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 8, flexShrink: 0 }}><Scale size={18} color={GOLD_DIM} /></div>
            {sidebarOpen && <span style={{ fontWeight: 800, fontSize: 16 }}>AiLegal</span>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}><Menu size={18} color={MUTED}/></button>
          </div>
          <div style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
            {sidebarMenu.map(item => (
              <button key={item.id} onClick={() => setView(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 8, border: "none", cursor: "pointer", background: view === item.id ? `${GOLD}15` : "transparent", color: view === item.id ? GOLD_DIM : MUTED, fontWeight: view === item.id ? 700 : 500, whiteSpace: "nowrap" }}>
                <item.icon size={18} /> {sidebarOpen && item.label}
              </button>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: `1px solid ${BORDER}` }}>
            <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: 12, background: "none", border: "none", color: DANGER, fontWeight: 700, cursor: "pointer" }}><LogOut size={18} /> {sidebarOpen && "Sair"}</button>
          </div>
        </div>

        {/* ÁREA PRINCIPAL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          
          {/* HEADER DO PROJETO */}
          <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
                <span style={{ color: MUTED }}>Projetos</span>
                <ChevronRight size={14} color={MUTED}/>
                <span>{activeProject?.name || 'Nenhum projeto'}</span>
                {generated && <Badge>IA Gerou</Badge>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Btn variant="outline" size="sm" onClick={() => setModal("salvar")} disabled={!generated}><Save size={14}/> Salvar</Btn>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}33`, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}><User size={14} color={GOLD_DIM} /></div>
              </div>
            </div>

            {/* ABAS DOS PROJETOS */}
            {projects.length > 0 && (
              <div style={{ display: "flex", gap: 2, padding: "0 16px", overflowX: "auto" }}>
                {projects.map(proj => (
                  <div key={proj.id} onClick={() => setActiveProjectId(proj.id)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    whiteSpace: "nowrap",
                    borderBottom: proj.id === activeProjectId ? `2px solid ${GOLD}` : "2px solid transparent",
                    color: proj.id === activeProjectId ? TEXT : MUTED,
                  }}>
                    {proj.status === 'extracting' || proj.status === 'generating'
                      ? <Loader size={10} style={{ animation: "spin 1s linear infinite" }} />
                      : proj.status === 'done' ? <span style={{ color: "#22c55e" }}>●</span>
                      : proj.status === 'error' ? <span style={{ color: DANGER }}>●</span>
                      : <span style={{ color: GOLD }}>○</span>}
                    {proj.name}
                    <button onClick={e => {
                      e.stopPropagation();
                      const remaining = projects.filter(p => p.id !== proj.id);
                      setProjects(remaining);
                      if (activeProjectId === proj.id) setActiveProjectId(remaining[remaining.length - 1]?.id || null);
                    }} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 0, display: "flex" }}>
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TELAS INTERNAS */}
          {view === "editor" && (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 260px", overflow: "hidden" }}>
              
              {/* PAINEL ESQUERDO DO EDITOR (Prompt e Log IA) */} 
              
              <div style={{ background: SURFACE, borderRight: `1px solid ${BORDER}`, padding: 16, overflow: "auto" }}>
                
                {/* HEADER DO PROMPT COM BOTÃO FULLSCREEN */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                    Descreva o Processo
                  </p>
                  <button
                    onClick={() => setPromptFullscreen(true)}
                    title="Expandir editor"
                    style={{
                      background: "none", border: `1px solid ${BORDER}`, borderRadius: 6,
                      cursor: "pointer", padding: "3px 7px", color: MUTED, fontSize: 11,
                      display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit"
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                    </svg>
                    Expandir
                  </button>
                </div>

                {/* BOTÃO DE IMPORTAÇÃO DE ARQUIVO */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx"
                    multiple
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "#f8fafc",
                      border: `2px dashed ${BORDER}`,
                      borderRadius: 8,
                      color: MUTED,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { e.target.style.borderColor = GOLD; e.target.style.background = "#fffbeb"; }}
                    onMouseLeave={e => { e.target.style.borderColor = BORDER; e.target.style.background = "#f8fafc"; }}
                  >
                    <Upload size={16} />
                    Importar Arquivo RCC (PDF/DOCX)
                  </button>
                </div>

                <textarea
                  value={activeProject?.promptText || ''}
                  onChange={e => setProjects(prev => prev.map(p =>p.id === activeProjectId ? { ...p, promptText: e.target.value } : p))}
                  placeholder="Ex: O cliente envia os documentos. O advogado analisa. Se faltarem documentos, pede novamente. Se ok, protocola no PJe."
                  style={{ width: "100%", height: 160, padding: 12, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, color: TEXT, fontFamily: "inherit", resize: "vertical", marginBottom: 12, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e => e.target.style.borderColor = BORDER}
                />

                <Btn
                  onClick={runGenerate}
                  disabled={generating || !activeProject?.promptText?.trim()}
                  style={{ width: "100%", justifyContent: "center", marginBottom: 24 }}
                >
                  {generating ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
                  {generating ? "Gerando..." : "Gerar Fluxograma"}
                </Btn>

                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Log de Processamento</p>
                <div style={{ background: "#1e293b", borderRadius: 8, padding: 10, minHeight: 120, fontFamily: "monospace", fontSize: 11, lineHeight: 1.8 }}>
                  {(!activeProject?.aiLog?.length) && <span style={{ color: MUTED }}>Aguardando prompt...</span>}
                  {activeProject?.aiLog?.map((l, i) => (<div key={i} style={{ color: l.startsWith("✓") ? "#4ecdc4" : GOLD }}>{l}</div>))}
                  {generating && <div style={{ color: GOLD, animation: "pulse 1s infinite" }}>▊</div>}
                </div>
              </div>

              {/* CENTRO (O CANVAS BPMN) */}
              <div style={{ position: "relative", overflow: "hidden", display: "flex", background: BG, backgroundImage: `radial-gradient(${BORDER} 1px, transparent 1px)`, backgroundSize: "24px 24px" }}>
                {!activeProject ? (
                  <div style={{ margin: "auto", textAlign: "center", color: MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <GitBranch size={48} color={BORDER} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Nenhum projeto aberto.</p>
                    <p style={{ fontSize: 14 }}>Importe um arquivo RCC para começar.</p>
                  </div>
                ) : activeProject.status === 'generating' ? (
                  <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <Loader size={42} color={GOLD_DIM} style={{ animation: "spin 1s linear infinite" }}/>
                    <p style={{ color: GOLD_DIM, fontSize: 16, fontWeight: 700 }}>IA analisando o documento...</p>
                  </div>
                ) : nodes.length > 0 ? (
                  <FlowChartEditor nodes={nodes} setNodes={setActiveNodes} edges={edges} setEdges={setActiveEdges}/>
                ) : (
                  <div style={{ margin: "auto", textAlign: "center", color: MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <GitBranch size={48} color={BORDER} />
                    <p style={{ fontSize: 16, fontWeight: 600 }}>Pronto para gerar.</p>
                    <p style={{ fontSize: 14 }}>Revise o rascunho e clique em Gerar Fluxograma.</p>
                  </div>
                )}
              </div>

              {/* PAINEL DIREITO DO EDITOR (Propriedades) */}
              <div style={{ background: SURFACE, borderLeft: `1px solid ${BORDER}`, padding: 16, overflow: "auto" }}>
                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Propriedades do Projeto</p>
                
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: MUTED, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>Título do processo</label>
                  <input
                    value={activeProject?.name || ''}
                    onChange={e => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, name: e.target.value } : p))}
                    style={{ width: "100%", padding: "9px 12px", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: "none", color: TEXT }}
                    disabled={!activeProject}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: MUTED, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>Tipo de Fluxo</label>
                  <select
                    value={activeProject?.type || 'Automático'}
                    onChange={e => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, type: e.target.value } : p))}
                    style={{ width: "100%", padding: "9px 12px", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: "none", color: TEXT }}
                    disabled={!activeProject}
                  ></select>
                </div>
                
                <div style={{ opacity: generated ? 1 : 0.5 }}>
                  <p style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Resumo de Entidades</p>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}><span style={{ color: MUTED, fontSize: 13 }}>Nós Extraídos</span> <Badge>{nodes.length}</Badge></div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}><span style={{ color: MUTED, fontSize: 13 }}>Decisões Identificadas</span> <Badge>{nodes.filter(n => n.type === 'gateway').length}</Badge></div>
                </div>
              </div>
            </div>
          )}

          {/* OUTRAS TELAS */}
          {view === "conta" && (
            <div style={{ padding: 40, overflow: "auto", background: BG, flex: 1 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Minha Conta</h2>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, display: "flex", alignItems: "center", gap: 20, maxWidth: 600 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: `${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                  <div style={{ color: MUTED, fontSize: 14 }}>{user.email || "admin@ailegal.com"}</div>
                  <Badge>Plano Pro</Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* MODAIS */}
        {modal === "salvar" && (
          <Modal title="Salvar Projeto" onClose={() => setModal(null)}>
            <Input label="Nome do arquivo" value={activeProject?.name || ''} onChange={()=>{}} />
            <Btn onClick={() => setModal(null)} style={{width: "100%", justifyContent: "center"}}><Save size={16}/> Salvar no Sistema</Btn>
          </Modal>
        )}

        {/* MODAL FULLSCREEN DO PROMPT */}   {/* ← cola aqui em baixo */}
        {promptFullscreen && (
          <div style={{
            position: "fixed", inset: 0, background: "#00000077",
            backdropFilter: "blur(4px)", zIndex: 200,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`,
              width: "80vw", maxWidth: 900, height: "80vh",
              display: "flex", flexDirection: "column",
              boxShadow: "0 24px 80px #00000033"
            }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 24px", borderBottom: `1px solid ${BORDER}`
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ background: `${GOLD}22`, borderRadius: 6, padding: 6 }}>
                    <FileText size={14} color={GOLD_DIM} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: TEXT }}>Editor de Prompt</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn
                    onClick={() => { setPromptFullscreen(false); runGenerate(); }}
                    disabled={generating || !activeProject?.promptText?.trim()}
                    size="sm"
                  >
                    <Zap size={13} />
                    {generating ? "Gerando..." : "Gerar Fluxograma"}
                  </Btn>
                  <button
                    onClick={() => setPromptFullscreen(false)}
                    style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: MUTED, display: "flex" }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <textarea
                autoFocus
                value={activeProject?.promptText || ''}
                onChange={e => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, promptText: e.target.value } : p))}
                placeholder="Descreva o processo jurídico em detalhes..."
                style={{
                  flex: 1, width: "100%", padding: 24,
                  background: CARD2, border: "none",
                  fontSize: 15, color: TEXT, fontFamily: "inherit",
                  resize: "none", outline: "none", lineHeight: 1.8,
                  boxSizing: "border-box"
                }}
              />

              <div style={{
                padding: "10px 24px", borderTop: `1px solid ${BORDER}`,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{ color: MUTED, fontSize: 12 }}>
                  {(activeProject?.promptText || '').length} caracteres · {(activeProject?.promptText || '').trim().split(/\s+/).filter(Boolean).length} palavras
                </span>
                <span style={{ color: MUTED, fontSize: 12 }}>
                  Dica: descreva atores, decisões e loops explicitamente
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


  // ─── ROOT ─────────────────────────────────────────────────────────────────────
  export default function AiLegalApp() {
    const [screen, setScreen] = useState("landing");
    const [user, setUser] = useState(null);

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
          html, body { margin: 0 !important; padding: 0 !important; min-height: 100vh; width: 100%; background-color: ${BG}; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          ::-webkit-scrollbar { width: 6px; height: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
          @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0} }
        `}</style>
        
        {screen === "landing" && <Landing onLogin={() => setScreen("login")} onCadastro={() => setScreen("login")} />}
        {screen === "login" && <Login onLogin={(u)=>{setUser(u); setScreen("app");}} onCadastro={() => setScreen("login")} onBack={() => setScreen("landing")} />}
        {screen === "app" && <App user={user} onLogout={() => {setUser(null); setScreen("landing");}} />}
      </>
    );
  }