import { FlowChartEditor } from "../editor/components/FlowChartEditor";
import { Scale, Upload, GitBranch, Cpu, Shield, BarChart2, Mail, Zap, ArrowRight } from "lucide-react";
import { Btn } from "../../shared/components/Btn";
import { BG, SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM, DANGER, CARD, CARD2 } from "../../styles/theme";

export const Landing = ({ onLogin }) => {
  const features = [
    { icon: Upload, title: "Importação RCC", desc: "Carregue arquivos RCC e o sistema processa automaticamente as entidades jurídicas." },
    { icon: GitBranch, title: "Fluxograma com IA", desc: "A LLM analisa e gera diagramas BPMN interativos e personalizados." },
    { icon: Cpu, title: "Correlação de Entidades", desc: "Identificação automática de partes, prazos e interdependências processuais." },
    { icon: Shield, title: "Integração com Advocacia", desc: "Compatível com os principais softwares jurídicos do mercado." },
    { icon: BarChart2, title: "Gestão de Projetos", desc: "Organize e gerencie múltiplos processos em um único ambiente." },
    { icon: Mail, title: "Integração Gmail", desc: "Conecte sua caixa de entrada e automatize o fluxo documental." },
  ];

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
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 60px", borderBottom: `1px solid ${BORDER}`, background: SURFACE, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: `${GOLD}22`, borderRadius: 10, padding: 8 }}><Scale size={20} color={GOLD_DIM} /></div>
          <span style={{ fontWeight: 800, fontSize: 18 }}>PBM<span style={{ color: GOLD_DIM }}>app</span></span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Btn onClick={onLogin} size="sm">Entrar com Google</Btn>
          <button style={{ background: "none", border: "none", color: MUTED, padding: "8px 16px", fontFamily: "inherit", fontSize: 14, cursor: "pointer", fontWeight: 600 }}>Contate-Nos</button>
        </nav>
      </header>

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
            <Btn onClick={onLogin} size="lg"><Zap size={16} />Começar com Google</Btn>
            <Btn onClick={onLogin} variant="outline" size="lg">Entrar com Google</Btn>
          </div>
          
          <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
            {[["500+", "Escritórios"], ["12k+", "Processos"], ["98%", "Precisão"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 800, color: GOLD_DIM }}>{v}</div>
                <div style={{ color: MUTED, fontSize: 13, fontWeight: 600 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ background: CARD, borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", height: 400, display: "flex", flexDirection: "column" }}>
          <div style={{ background: CARD2, padding: "12px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${BORDER}` }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: DANGER }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ecdc4" }} />
            <span style={{ color: MUTED, fontSize: 12, marginLeft: 8, fontWeight: 500 }}>PBMapp — Processo Penal.rcc</span>
          </div>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <FlowChartEditor isReadOnly={true} nodes={previewNodes} edges={previewEdges} />
          </div>
        </div>
      </section>

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

      <section style={{ padding: "80px 60px", textAlign: "center", background: BG }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Pronto para começar?</h2>
        <p style={{ color: MUTED, marginBottom: 32 }}>Crie sua conta gratuitamente e transforme seu fluxo jurídico hoje.</p>
        <Btn onClick={onLogin} size="lg"><ArrowRight size={16} />Continuar com Google</Btn>
      </section>
    </div>
  );
};
