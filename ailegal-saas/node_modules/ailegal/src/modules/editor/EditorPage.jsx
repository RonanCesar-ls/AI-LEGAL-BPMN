import { useState, useRef } from "react";
import { Scale, Upload, FileText, Save, User, LogOut, ChevronRight, Plus, X, Zap, Loader, GitBranch, Menu } from "lucide-react";
import { useProjects } from "./hooks/useProjects";
import { useFlowGenerate } from "./hooks/useFlowGenerate";
import { FlowChartEditor } from "./components/FlowChartEditor";
import { GlobalTimeline } from './components/GlobalTimeline';
import { Badge } from "../../shared/components/Badge";
import { Btn } from "../../shared/components/Btn";
import { Modal } from "../../shared/components/Modal";
import { BG, SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, DANGER, CARD, CARD2 } from "../../styles/theme";

export const EditorPage = ({ user, onLogout }) => {
  const [view, setView] = useState("editor");
  const [modal, setModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promptFullscreen, setPromptFullscreen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadChoiceModal, setUploadChoiceModal] = useState(null);

  const projectsHook = useProjects();
  const { projects, setProjects, activeProjectId, setActiveProjectId, activeProject, nodes, edges, generated, setActiveNodes, setActiveEdges } = projectsHook;

  // CORRIGIDO: Adicionado o handleExtractPrompt que estava faltando
  const { generating, runQueueExtraction, runQueueGeneration, runTextGeneration, handleExtractPrompt } = useFlowGenerate({
    activeProjectId,
    setProjects,
  });

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    e.target.value = '';

    if (files.length === 1) {
      // Um arquivo → sempre cria aba nova (comportamento original)
      handleCreateProjectFromFiles(files, 'separate');
      return;
    }

    // Múltiplos arquivos → pergunta ao usuário
    setUploadChoiceModal({ files });
  };

  const handleCreateProjectFromFiles = (files, mode) => {
    setUploadChoiceModal(null);

    if (mode === 'separate') {
      // Cada arquivo vira uma aba independente
      files.forEach(file => {
        const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;

        setProjects(prev => [...prev, {
          id:              projectId,
          name:            file.name.replace(/\.(pdf|docx)$/i, ''),
          type:            'Automático',
          status:          'idle',
          nodes:           [],
          edges:           [],
          aiLog:           [],
          promptText:      '',
          processingQueue: [],
        }]);

        setActiveProjectId(projectId);

        // ← CORREÇÃO: usa runQueueExtraction em vez de handleExtractPrompt
        setTimeout(() => {
          runQueueExtraction([file], projectId);
        }, 50);
      });

    } else {
      // Modo merged: todos na mesma aba
      const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const name = files.length <= 2
        ? files.map(f => f.name.replace(/\.(pdf|docx)$/i, '')).join(' + ')
        : `${files[0].name.replace(/\.(pdf|docx)$/i, '')} +${files.length - 1} outros`;

      setProjects(prev => [...prev, {
        id:              projectId,
        name,
        type:            'Automático',
        status:          'idle',
        nodes:           [],
        edges:           [],
        aiLog:           [],
        promptText:      '',
        processingQueue: [],
      }]);

      setActiveProjectId(projectId);

      setTimeout(() => {
        runQueueExtraction(files, projectId);
      }, 50);
    }
  };

  const handleRunGenerate = () => {
    const hasQueue = activeProject?.processingQueue?.length > 0
      && activeProject.processingQueue.some(item => item.extractedPrompt);

    if (hasQueue) {
      runQueueGeneration(activeProjectId);
    } else {
      runQueueGeneration(activeProjectId); // texto direto também passa pelo mesmo caminho
    }
  };

  const sidebarMenu = [
    { id: "editor", icon: GitBranch, label: "Editor BPMN" },
    { id: "novo", icon: Plus, label: "Novo Projeto" },
    { id: "conta", icon: User, label: "Minha Conta" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", background: BG, color: TEXT, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      
      {/* SIDEBAR ESQUERDA */}
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
        <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600 }}>
              <span style={{ color: MUTED }}>Projetos</span> <ChevronRight size={14} color={MUTED}/>
              <span>{activeProject?.name || 'Nenhum projeto'}</span> {generated && <Badge>IA Gerou</Badge>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Btn variant="outline" size="sm" onClick={() => setModal("salvar")} disabled={!generated}><Save size={14}/> Salvar</Btn>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${GOLD}33`, border: `2px solid ${GOLD}`, display: "flex", alignItems: "center", justifyContent: "center" }}><User size={14} color={GOLD_DIM} /></div>
            </div>
          </div>
          
          {projects.length > 0 && (
            <div style={{ display: "flex", gap: 2, padding: "0 16px", overflowX: "auto" }}>
              {projects.map(proj => (
                <div key={proj.id} onClick={() => setActiveProjectId(proj.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", borderBottom: proj.id === activeProjectId ? `2px solid ${GOLD}` : "2px solid transparent", color: proj.id === activeProjectId ? TEXT : MUTED }}>
                  {proj.status === 'extracting' || proj.status === 'generating' ? <Loader size={10} style={{ animation: "spin 1s linear infinite" }} /> : proj.status === 'done' ? <span style={{ color: "#22c55e" }}>●</span> : proj.status === 'error' ? <span style={{ color: DANGER }}>●</span> : <span style={{ color: GOLD }}>○</span>}
                  {proj.name}
                  <button onClick={e => { e.stopPropagation(); const remaining = projects.filter(p => p.id !== proj.id); setProjects(remaining); if (activeProjectId === proj.id) setActiveProjectId(remaining[remaining.length - 1]?.id || null); }} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 0, display: "flex" }}><X size={11} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {view === "editor" && (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px 1fr 260px", overflow: "hidden" }}>
            
            <div style={{ background: SURFACE, borderRight: `1px solid ${BORDER}`, padding: 16, overflow: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>Descreva o Processo</p>
                <button onClick={() => setPromptFullscreen(true)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, cursor: "pointer", padding: "3px 7px", color: MUTED, fontSize: 11, display: "flex", alignItems: "center", gap: 4, fontFamily: "inherit" }}>
                  Expandir
                </button>
              </div>

              <div style={{ marginBottom: 12 }}>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx" multiple style={{ display: "none" }} />
                <button onClick={() => fileInputRef.current.click()} style={{ width: "100%", padding: "10px", background: "#f8fafc", border: `2px dashed ${BORDER}`, borderRadius: 8, color: MUTED, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <Upload size={16} /> Importar Arquivos RCC
                </button>
              </div>

              <textarea value={activeProject?.promptText || ''} onChange={e => setProjects(prev => prev.map(p =>p.id === activeProjectId ? { ...p, promptText: e.target.value } : p))} placeholder="Descreva o processo..." style={{ width: "100%", height: 160, padding: 12, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, color: TEXT, fontFamily: "inherit", resize: "vertical", marginBottom: 12, outline: "none", boxSizing: "border-box", flexShrink: 0 }} />
              <Btn onClick={handleRunGenerate} disabled={generating || !activeProject?.promptText?.trim()} style={{ width: "100%", justifyContent: "center", marginBottom: 24, flexShrink: 0 }}>
                {generating ? <Loader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />} {generating ? "Gerando..." : "Gerar Fluxograma"}
              </Btn>

              {/* FILA DE PROCESSAMENTO */}
              {activeProject?.processingQueue?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                    Fila de Arquivos
                  </p>
                  {activeProject.processingQueue.map(item => {
                    const statusConfig = {
                      waiting:    { icon: '⏳', color: '#94a3b8' },
                      extracting: { icon: '📄', color: '#eab308' },
                      generating: { icon: '⚡', color: '#6366f1' },
                      done:       { icon: '✅', color: '#22c55e' },
                      error:      { icon: '❌', color: '#ef4444' },
                    }[item.status] ?? { icon: '⏳', color: '#94a3b8' };

                    return (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px', borderRadius: 6, marginBottom: 4,
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                      }}>
                        <span style={{ fontSize: 14 }}>{statusConfig.icon}</span>
                        <span style={{
                          fontSize: 11, color: '#1e293b', flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {item.fileName}
                        </span>
                        <span style={{ fontSize: 10, color: statusConfig.color, fontWeight: 700, flexShrink: 0 }}>
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 'auto' }}>Log de Processamento</p>
              <div style={{ background: "#1e293b", borderRadius: 8, padding: 10, minHeight: 120, fontFamily: "monospace", fontSize: 11, lineHeight: 1.8, flexShrink: 0 }}>
                {!activeProject?.aiLog?.length && <span style={{ color: MUTED }}>Aguardando prompt...</span>}
                {activeProject?.aiLog?.map((l, i) => (<div key={i} style={{ color: l.startsWith("✓") ? "#4ecdc4" : GOLD }}>{l}</div>))}
                {generating && <div style={{ color: GOLD, animation: "pulse 1s infinite" }}>▊</div>}
              </div>
            </div>

            <div style={{ position: "relative", overflow: "hidden", display: "flex", background: BG, backgroundImage: `radial-gradient(${BORDER} 1px, transparent 1px)`, backgroundSize: "24px 24px" }}>
              {!activeProject ? (
                <div style={{ margin: "auto", textAlign: "center", color: MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}><GitBranch size={48} color={BORDER} /><p style={{ fontSize: 16, fontWeight: 600 }}>Nenhum projeto aberto.</p></div>
              ) : activeProject.status === 'generating' ? (
                <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}><Loader size={42} color={GOLD_DIM} style={{ animation: "spin 1s linear infinite" }}/><p style={{ color: GOLD_DIM, fontSize: 16, fontWeight: 700 }}>IA analisando o documento...</p></div>
              ) : nodes.length > 0 ? (
                <FlowChartEditor nodes={nodes} setNodes={setActiveNodes} edges={edges} setEdges={setActiveEdges} projectId={activeProjectId}/>
              ) : (
                <div style={{ margin: "auto", textAlign: "center", color: MUTED, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}><GitBranch size={48} color={BORDER} /><p style={{ fontSize: 16, fontWeight: 600 }}>Pronto para gerar.</p></div>
              )}
            </div>

            {/* PAINEL DIREITO: Propriedades + Timeline Global */}
            <div style={{ background: SURFACE, borderLeft: `1px solid ${BORDER}`, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
              
              <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}` }}>
                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Propriedades</p>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ color: MUTED, fontSize: 12, display: "block", marginBottom: 6, fontWeight: 600 }}>Título do processo</label>
                  <input value={activeProject?.name || ''} onChange={e => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, name: e.target.value } : p))} style={{ width: "100%", padding: "9px 12px", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 13, outline: "none", color: TEXT }} disabled={!activeProject} />
                </div>
                <div style={{ opacity: generated ? 1 : 0.5 }}>
                  <p style={{ color: MUTED, fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Resumo de Entidades</p>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${BORDER}` }}><span style={{ color: MUTED, fontSize: 13 }}>Nós Extraídos</span> <Badge>{nodes.length}</Badge></div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}><span style={{ color: MUTED, fontSize: 13 }}>Decisões Identificadas</span> <Badge>{nodes.filter(n => n.type === 'gateway').length}</Badge></div>
                </div>
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
                <p style={{ color: MUTED, fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Timeline do Processo</p>
                <GlobalTimeline nodes={nodes} />
              </div>

            </div>
          </div>
        )}

        {view === "conta" && (
          <div style={{ padding: 40, overflow: "auto", background: BG, flex: 1 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 24 }}>Minha Conta</h2>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28, display: "flex", alignItems: "center", gap: 20, maxWidth: 600 }}>
              <div style={{ width: 70, height: 70, borderRadius: "50%", background: `${GOLD}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>👤</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
                <div style={{ color: MUTED, fontSize: 14 }}>{user.email}</div>
                <Badge>Plano Pro</Badge>
              </div>
            </div>
          </div>
        )}

        {promptFullscreen && (
          <div style={{ position: "fixed", inset: 0, background: "#00000077", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: SURFACE, borderRadius: 16, border: `1px solid ${BORDER}`, width: "80vw", maxWidth: 900, height: "80vh", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><FileText size={14} color={GOLD_DIM} /><span style={{ fontWeight: 700, fontSize: 15 }}>Editor de Prompt</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => { setPromptFullscreen(false); handleRunGenerate(); }} disabled={generating || !activeProject?.promptText?.trim()} size="sm"><Zap size={13} /> {generating ? "Gerando..." : "Gerar Fluxograma"}</Btn>
                  <button onClick={() => setPromptFullscreen(false)} style={{ background: "none", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: MUTED }}><X size={16} /></button>
                </div>
              </div>
              <textarea autoFocus value={activeProject?.promptText || ''} onChange={e => setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, promptText: e.target.value } : p))} style={{ flex: 1, padding: 24, background: CARD2, border: "none", fontSize: 15, fontFamily: "inherit", resize: "none", outline: "none" }} />
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE ESCOLHA: separado ou junto */}
      {uploadChoiceModal && (
        <div style={{
          position: 'fixed', inset: 0, background: '#00000066',
          backdropFilter: 'blur(4px)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setUploadChoiceModal(null)}>
          <div style={{
            background: '#ffffff', borderRadius: 16, padding: 32, width: 480,
            border: '1px solid #e2e8f0', boxShadow: '0 24px 80px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                📁 {uploadChoiceModal.files.length} arquivos selecionados
              </h2>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                Como você quer processar esses arquivos?
              </p>
            </div>

            {/* Lista de arquivos */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 24 }}>
              {uploadChoiceModal.files.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: 14 }}>📄</span>
                  <span style={{ fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Opções */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

              {/* Opção A: separado */}
              <button
                onClick={() => handleCreateProjectFromFiles(uploadChoiceModal.files, 'separate')}
                style={{
                  padding: '16px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: '2px solid #e2e8f0', background: '#ffffff',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a017'; e.currentTarget.style.background = '#fffbeb'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🗂️</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  Abas separadas
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                  Cada arquivo gera seu próprio fluxograma em uma aba independente.
                </div>
              </button>

              {/* Opção B: juntos */}
              <button
                onClick={() => handleCreateProjectFromFiles(uploadChoiceModal.files, 'merged')}
                style={{
                  padding: '16px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: '2px solid #e2e8f0', background: '#ffffff',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f0f0ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔗</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  Mesma aba
                </div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                  A IA analisa todos juntos e conecta os processos que tiverem relação.
                </div>
              </button>
            </div>

            <button
              onClick={() => setUploadChoiceModal(null)}
              style={{ marginTop: 16, width: '100%', padding: '8px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};