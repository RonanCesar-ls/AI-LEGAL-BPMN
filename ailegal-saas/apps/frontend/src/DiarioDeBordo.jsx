import React from "react";
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  DollarSign,
  ChevronRight,
  Zap,
  Scale,
  Sparkles,
  Timer,
  Workflow,
  CheckCircle2,
  ArrowUpRight,
  CircleGauge,
  BarChart3,
  Gavel
} from "lucide-react";

// --- DADOS ALINHADOS COM AS DIRETRIZES DO CONSELHO E RCCs ---

const flowNodes = [
  {
    name: "Captação (Leads)",
    status: "success",
    duration: "15 min",
    sla: "SLA: 30 min",
    cases: 184,
    conversion: "94%",
    note: "Tráfego pago (Marketing)",
  },
  {
    name: "Triagem Jurídica",
    status: "warning",
    duration: "3h",
    sla: "SLA: 2h",
    cases: 142,
    conversion: "77%",
    note: "Análise de viabilidade",
  },
  {
    name: "Consulta (Sócio)",
    status: "success",
    duration: "1 dia",
    sla: "SLA: 2 dias",
    cases: 89,
    conversion: "87%",
    note: "Definição de estratégia",
  },
  {
    name: "Proposta de Honorários",
    status: "critical",
    duration: "8 dias",
    sla: "SLA: 3 dias",
    cases: 41,
    conversion: "41%",
    note: "Gargalo da Dir. de Negócios",
  },
  {
    name: "Contrato & Procuração",
    status: "success",
    duration: "2h",
    sla: "SLA: 6h",
    cases: 34,
    conversion: "84%",
    note: "Onboarding finalizado",
  },
];

const kpis = [
  {
    icon: DollarSign,
    title: "Meta de Faturamento",
    value: "68%",
    delta: "+12,4%",
    description: "rumo ao alvo de 250% anual",
    tone: "gold",
  },
  {
    icon: TrendingUp,
    title: "Leads Qualificados",
    value: "184",
    delta: "+62%",
    description: "meta trimestral (+60%) batida",
    tone: "green",
  },
  {
    icon: Scale,
    title: "Taxa de Conversão",
    value: "22,5%",
    delta: "+2,5%",
    description: "acima da meta mensal (20%)",
    tone: "blue",
  },
  {
    icon: Sparkles,
    title: "Engajamento Redes",
    value: "415%",
    delta: "Meta Ok",
    description: "alvo de 400% (Super. Marketing)",
    tone: "red",
  },
];

const insights = [
  {
    title: "Gargalo no Fechamento",
    text: "78% dos atrasos comerciais estão na elaboração da 'Proposta de Honorários', travando o crescimento de faturamento.",
    severity: "critical",
  },
  {
    title: "Desempenho de Marketing",
    text: "A Superintendência de Marketing entregou a cota de leads (+60%). O gargalo agora está inteiramente na Diretoria de Negócios.",
    severity: "warning",
  },
  {
    title: "Ação Estratégica (IA)",
    text: "Padronizar honorários para demandas repetitivas pode reduzir o tempo de proposta de 8 para 2 dias.",
    severity: "success",
  },
];

const heatRows = [
  { name: "Captação via Marketing", value: 15, time: "15 min" },
  { name: "Triagem de Viabilidade", value: 40, time: "3h" },
  { name: "Consulta com Advogado/Sócio", value: 30, time: "1 dia" },
  { name: "Elaboração de Honorários", value: 95, time: "8 dias", critical: true },
  { name: "Assinatura Digital (DocuSign)", value: 10, time: "2h" },
];

const timeline = [
  {
    title: "Lead Capturado",
    time: "09:15",
    description: "Novo contato via tráfego pago (Google Ads).",
    status: "success",
  },
  {
    title: "Triagem Concluída",
    time: "12:21",
    description: "Tese validada pela equipe de atendimento/SDR.",
    status: "warning",
  },
  {
    title: "Consulta Realizada",
    time: "Ontem",
    description: "Sócio alinhou expectativas e estratégia processual com o cliente.",
    status: "success",
  },
  {
    title: "Proposta Atrasada",
    time: "8 dias",
    description: "Aguardando precificação final do Diretor de Negócios.",
    status: "critical",
  },
  {
    title: "Envio de Minutas",
    time: "2h",
    description: "Contrato e procuração prontos para assinatura.",
    status: "neutral",
  },
];

const statusConfig = {
  success: {
    label: "Saudável",
    color: "#16a34a",
    soft: "#ecfdf3",
    border: "#bbf7d0",
    icon: CheckCircle2,
  },
  warning: {
    label: "Atenção",
    color: "#b45309",
    soft: "#fffbeb",
    border: "#fde68a",
    icon: CircleGauge,
  },
  critical: {
    label: "Crítico",
    color: "#dc2626",
    soft: "#fef2f2",
    border: "#fecaca",
    icon: AlertTriangle,
  },
  neutral: {
    label: "Neutro",
    color: "#64748b",
    soft: "#f8fafc",
    border: "#e2e8f0",
    icon: Clock,
  },
};

export default function DiarioDeBordo({ onBack = () => {} }) {
  const criticalNode = flowNodes.find((node) => node.status === "critical");

  return (
    <div className="db-page">
      <style>{styles}</style>

      <div className="db-bg-orb db-bg-orb-one" />
      <div className="db-bg-orb db-bg-orb-two" />

      <header className="db-header">
        <div className="db-container">
          <button onClick={onBack} className="db-back-button">
            <ArrowLeft size={16} />
            Voltar ao Editor
          </button>

          <div className="db-hero">
            <div>
              <div className="db-eyebrow">
                <Scale size={15} />
                Conselho de Sócios · Gestão Estratégica
              </div>

              <h1>Painel de Crescimento</h1>

              <p>
                Acompanhamento das diretrizes de Marketing e Diretoria de Negócios.
                Identificação de gargalos operacionais e conversão de honorários em tempo real.
              </p>
            </div>

            <div className="db-hero-card">
              <div className="db-ai-badge">
                <Zap size={14} fill="currentColor" />
                IA Ativa
              </div>

              <div className="db-risk-score">
                <span>Risco à meta anual</span>
                <strong>Alto</strong>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="db-container db-main">
        <section className="db-kpi-grid">
          {kpis.map((item) => (
            <KpiCard key={item.title} {...item} />
          ))}
        </section>

        <section className="db-grid">
          <div className="db-left-column">
            <Panel
              icon={Workflow}
              title="Funil de Captação e Contratos"
              subtitle="Volume, conversão e retenção por etapa do atendimento"
              action="Atualizado agora"
            >
              <div className="db-flow">
                {flowNodes.map((node, index) => (
                  <React.Fragment key={node.name}>
                    <NodeCard node={node} />
                    {index < flowNodes.length - 1 && (
                      <div className="db-connector">
                        <ChevronRight size={19} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="db-alert-strip">
                <div className="db-alert-icon">
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <strong>Ponto Crítico de Retenção: {criticalNode?.name}</strong>
                  <span>
                    O tempo médio está em {criticalNode?.duration}, muito acima do{" "}
                    {criticalNode?.sla.toLowerCase()} estipulado pelo conselho.
                  </span>
                </div>

                <button className="db-alert-button">
                  Cobrar Diretoria
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </Panel>

            <Panel
              icon={BarChart3}
              title="Heatmap do Gargalo Comercial"
              subtitle="Tempo consumido em cada fase até o fechamento de honorários"
            >
              <div className="db-heat-list">
                {heatRows.map((row) => (
                  <HeatRow key={row.name} {...row} />
                ))}
              </div>
            </Panel>
          </div>

          <aside className="db-right-column">
            <Panel icon={Brain} title="Insights da IA" compact>
              <div className="db-insights">
                {insights.map((item) => (
                  <InsightCard key={item.title} {...item} />
                ))}
              </div>
            </Panel>

            <Panel icon={Timer} title="Auditoria (Último Cliente)" compact>
              <div className="db-timeline">
                {timeline.map((item, index) => (
                  <TimelineItem
                    key={item.title}
                    {...item}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </div>
            </Panel>

            <div className="db-decision-card">
              <div className="db-decision-icon">
                <Gavel size={20} />
              </div>

              <div>
                <span>Diretriz do Sócio Gerente (CEO)</span>
                <strong>Desobstruir Precificações</strong>
                <p>
                  O Marketing superou a meta de leads, mas o Comercial trava na proposta. 
                  Reunião de alinhamento com o Diretor de Negócios sugerida para amanhã.
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function Panel({ icon: Icon, title, subtitle, action, compact, children }) {
  return (
    <section className={compact ? "db-panel db-panel-compact" : "db-panel"}>
      <div className="db-panel-header">
        <div className="db-panel-title-wrap">
          <div className="db-panel-icon">
            <Icon size={18} />
          </div>

          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>

        {action && <span className="db-panel-action">{action}</span>}
      </div>

      {children}
    </section>
  );
}

function KpiCard({ icon: Icon, title, value, delta, description, tone }) {
  return (
    <article className={`db-kpi db-kpi-${tone}`}>
      <div className="db-kpi-top">
        <span>{title}</span>
        <div className="db-kpi-icon">
          <Icon size={19} />
        </div>
      </div>

      <strong>{value}</strong>

      <div className="db-kpi-footer">
        <span>{delta}</span>
        <p>{description}</p>
      </div>
    </article>
  );
}

function NodeCard({ node }) {
  const config = statusConfig[node.status];
  const StatusIcon = config.icon;

  return (
    <article
      className="db-node"
      style={{
        "--node-color": config.color,
        "--node-bg": config.soft,
        "--node-border": config.border,
      }}
    >
      <div className="db-node-status">
        <StatusIcon size={14} />
        {config.label}
      </div>

      <h3>{node.name}</h3>

      <div className="db-node-duration">{node.duration}</div>

      <div className="db-node-meta">
        <span>{node.sla}</span>
        <span>{node.cases} casos</span>
      </div>

      <div className="db-node-bottom">
        <span>Conversão</span>
        <strong>{node.conversion}</strong>
      </div>

      <p>{node.note}</p>
    </article>
  );
}

function HeatRow({ name, value, time, critical }) {
  return (
    <div className="db-heat-row">
      <div className="db-heat-info">
        <div>
          <strong>{name}</strong>
          <span>{time}</span>
        </div>

        <b className={critical ? "db-danger-text" : ""}>{value}%</b>
      </div>

      <div className="db-heat-track">
        <div
          className={critical ? "db-heat-fill db-heat-critical" : "db-heat-fill"}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({ title, text, severity }) {
  const config = statusConfig[severity];

  return (
    <article
      className="db-insight-card"
      style={{
        "--insight-color": config.color,
        "--insight-bg": config.soft,
        "--insight-border": config.border,
      }}
    >
      <div className="db-insight-dot" />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </article>
  );
}

function TimelineItem({ title, time, description, status, isLast }) {
  const config = statusConfig[status];

  return (
    <div
      className="db-timeline-item"
      style={{
        "--timeline-color": config.color,
        "--timeline-bg": config.soft,
        "--timeline-border": config.border,
      }}
    >
      <div className="db-timeline-marker-wrap">
        <div className="db-timeline-marker" />
        {!isLast && <div className="db-timeline-line" />}
      </div>

      <div className="db-timeline-content">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>

        <span>{time}</span>
      </div>
    </div>
  );
}

const styles = `
  .db-page {
    min-height: 100vh;
    position: relative;
    overflow: auto;
    background:
      radial-gradient(circle at top left, rgba(212, 160, 23, 0.14), transparent 34%),
      radial-gradient(circle at 85% 10%, rgba(15, 118, 110, 0.12), transparent 30%),
      #f8fafc;
    color: #172033;
    font-family: "DM Sans", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .db-bg-orb {
    position: fixed;
    pointer-events: none;
    border-radius: 999px;
    filter: blur(30px);
    opacity: 0.45;
    z-index: 0;
  }

  .db-bg-orb-one {
    width: 260px;
    height: 260px;
    top: 110px;
    right: 10%;
    background: rgba(212, 160, 23, 0.16);
  }

  .db-bg-orb-two {
    width: 320px;
    height: 320px;
    bottom: -80px;
    left: 5%;
    background: rgba(13, 148, 136, 0.12);
  }

  .db-container {
    width: min(1280px, calc(100% - 48px));
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  .db-header {
    background: rgba(255, 255, 255, 0.82);
    border-bottom: 1px solid rgba(226, 232, 240, 0.85);
    backdrop-filter: blur(18px);
  }

  .db-header .db-container {
    padding: 30px 0 34px;
  }

  .db-back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    border: 0;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.01em;
    transition: 0.2s ease;
  }

  .db-back-button:hover {
    color: #0f172a;
    transform: translateX(-2px);
  }

  .db-hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
  }

  .db-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: #b45309;
    background: #fffbeb;
    border: 1px solid #fde68a;
    padding: 7px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .db-hero h1 {
    margin: 0;
    color: #0f172a;
    font-family: "Playfair Display", Georgia, serif;
    font-size: clamp(34px, 4vw, 54px);
    line-height: 0.98;
    font-weight: 900;
    letter-spacing: -1.4px;
  }

  .db-hero p {
    margin: 14px 0 0;
    max-width: 720px;
    color: #64748b;
    font-size: 15px;
    line-height: 1.7;
  }

  .db-hero-card {
    min-width: 230px;
    padding: 18px;
    border-radius: 22px;
    background: linear-gradient(135deg, #0f172a, #1e293b);
    box-shadow: 0 20px 60px rgba(15, 23, 42, 0.22);
    color: #fff;
  }

  .db-ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 18px;
    padding: 8px 12px;
    background: rgba(250, 204, 21, 0.13);
    border: 1px solid rgba(250, 204, 21, 0.25);
    color: #fde68a;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 900;
  }

  .db-risk-score span {
    display: block;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .db-risk-score strong {
    display: block;
    margin-top: 6px;
    color: #fff;
    font-size: 28px;
    font-family: "Playfair Display", Georgia, serif;
  }

  .db-main {
    padding: 30px 0 56px;
  }

  .db-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 24px;
  }

  .db-kpi {
    position: relative;
    overflow: hidden;
    padding: 22px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(226, 232, 240, 0.95);
    box-shadow: 0 18px 50px rgba(15, 23, 42, 0.055);
    transition: 0.2s ease;
  }

  .db-kpi:hover {
    transform: translateY(-3px);
    box-shadow: 0 22px 70px rgba(15, 23, 42, 0.09);
  }

  .db-kpi::after {
    content: "";
    position: absolute;
    width: 120px;
    height: 120px;
    right: -50px;
    top: -50px;
    border-radius: 999px;
    opacity: 0.16;
  }

  .db-kpi-gold::after { background: #d4a017; }
  .db-kpi-green::after { background: #16a34a; }
  .db-kpi-blue::after { background: #2563eb; }
  .db-kpi-red::after { background: #ef4444; }

  .db-kpi-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 14px;
  }

  .db-kpi-top span {
    color: #64748b;
    font-size: 12px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .db-kpi-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border-radius: 14px;
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .db-kpi strong {
    display: block;
    color: #0f172a;
    font-size: 34px;
    line-height: 1;
    font-family: "Playfair Display", Georgia, serif;
    letter-spacing: -0.8px;
  }

  .db-kpi-footer {
    margin-top: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .db-kpi-footer span {
    color: #0f766e;
    background: #f0fdfa;
    border: 1px solid #ccfbf1;
    padding: 4px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
  }

  .db-kpi-red .db-kpi-footer span {
    color: #dc2626;
    background: #fef2f2;
    border-color: #fecaca;
  }

  .db-kpi-footer p {
    margin: 0;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
  }

  .db-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.8fr) minmax(340px, 0.9fr);
    gap: 24px;
    align-items: start;
  }

  .db-left-column,
  .db-right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .db-panel {
    padding: 26px;
    border-radius: 26px;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(226, 232, 240, 0.92);
    box-shadow: 0 18px 60px rgba(15, 23, 42, 0.06);
  }

  .db-panel-compact {
    padding: 22px;
  }

  .db-panel-header {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .db-panel-title-wrap {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .db-panel-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    flex: 0 0 auto;
    border-radius: 15px;
    background: linear-gradient(135deg, #fffbeb, #fef3c7);
    color: #b45309;
    border: 1px solid #fde68a;
  }

  .db-panel h2 {
    margin: 0;
    color: #172033;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: -0.2px;
  }

  .db-panel-header p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.55;
  }

  .db-panel-action {
    white-space: nowrap;
    padding: 7px 10px;
    border-radius: 999px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .db-flow {
    display: grid;
    grid-template-columns: repeat(5, minmax(140px, 1fr));
    gap: 10px;
    align-items: stretch;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .db-connector {
    display: none;
  }

  .db-node {
    min-width: 150px;
    padding: 16px;
    border-radius: 20px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.78), rgba(255,255,255,0.92)),
      var(--node-bg);
    border: 1px solid var(--node-border);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
    transition: 0.2s ease;
  }

  .db-node:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  }

  .db-node-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 999px;
    background: #fff;
    border: 1px solid var(--node-border);
    color: var(--node-color);
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .db-node h3 {
    margin: 14px 0 8px;
    color: #0f172a;
    font-size: 15px;
    font-weight: 950;
    letter-spacing: -0.2px;
  }

  .db-node-duration {
    display: inline-flex;
    padding: 6px 10px;
    border-radius: 12px;
    color: var(--node-color);
    background: var(--node-bg);
    border: 1px solid var(--node-border);
    font-size: 18px;
    font-weight: 950;
  }

  .db-node-meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    margin-top: 14px;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
  }

  .db-node-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(226, 232, 240, 0.8);
  }

  .db-node-bottom span {
    color: #94a3b8;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .db-node-bottom strong {
    color: #0f172a;
    font-size: 18px;
  }

  .db-node p {
    margin: 10px 0 0;
    color: #64748b;
    font-size: 12px;
    font-weight: 700;
  }

  .db-alert-strip {
    margin-top: 22px;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 16px;
    border-radius: 20px;
    background: linear-gradient(135deg, #fff7ed, #fef2f2);
    border: 1px solid #fed7aa;
  }

  .db-alert-icon {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 15px;
    color: #dc2626;
    background: #fff;
    border: 1px solid #fecaca;
  }

  .db-alert-strip strong {
    display: block;
    color: #7f1d1d;
    font-size: 14px;
    font-weight: 950;
  }

  .db-alert-strip span {
    display: block;
    margin-top: 3px;
    color: #9f1239;
    font-size: 13px;
    line-height: 1.5;
  }

  .db-alert-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 0;
    cursor: pointer;
    border-radius: 999px;
    padding: 10px 13px;
    background: #0f172a;
    color: #fff;
    font-size: 12px;
    font-weight: 900;
    transition: 0.2s ease;
  }

  .db-alert-button:hover {
    transform: translateY(-1px);
    background: #1e293b;
  }

  .db-heat-list {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .db-heat-info {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 8px;
  }

  .db-heat-info strong {
    display: block;
    color: #334155;
    font-size: 13px;
    font-weight: 950;
  }

  .db-heat-info span {
    display: block;
    margin-top: 2px;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 800;
  }

  .db-heat-info b {
    color: #64748b;
    font-size: 12px;
  }

  .db-danger-text {
    color: #dc2626 !important;
  }

  .db-heat-track {
    height: 9px;
    border-radius: 999px;
    background: #f1f5f9;
    overflow: hidden;
  }

  .db-heat-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #cbd5e1, #94a3b8);
    transition: width 0.8s ease;
  }

  .db-heat-critical {
    background: linear-gradient(90deg, #f97316, #ef4444);
    box-shadow: 0 0 18px rgba(239, 68, 68, 0.35);
  }

  .db-insights {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .db-insight-card {
    display: flex;
    gap: 12px;
    padding: 14px;
    border-radius: 18px;
    background: var(--insight-bg);
    border: 1px solid var(--insight-border);
  }

  .db-insight-dot {
    width: 10px;
    height: 10px;
    margin-top: 4px;
    border-radius: 999px;
    background: var(--insight-color);
    box-shadow: 0 0 0 4px rgba(255,255,255,0.8);
    flex: 0 0 auto;
  }

  .db-insight-card strong {
    display: block;
    color: #172033;
    font-size: 13px;
    font-weight: 950;
  }

  .db-insight-card p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 12.5px;
    line-height: 1.55;
    font-weight: 650;
  }

  .db-timeline {
    display: flex;
    flex-direction: column;
  }

  .db-timeline-item {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
    position: relative;
  }

  .db-timeline-marker-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .db-timeline-marker {
    width: 13px;
    height: 13px;
    border-radius: 999px;
    margin-top: 5px;
    background: var(--timeline-color);
    border: 3px solid #fff;
    box-shadow: 0 0 0 1px var(--timeline-border);
  }

  .db-timeline-line {
    width: 2px;
    flex: 1;
    min-height: 46px;
    margin-top: 5px;
    background: #e2e8f0;
  }

  .db-timeline-content {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 18px;
  }

  .db-timeline-content strong {
    display: block;
    color: #334155;
    font-size: 13px;
    font-weight: 950;
  }

  .db-timeline-content p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12.5px;
    line-height: 1.5;
  }

  .db-timeline-content span {
    flex: 0 0 auto;
    height: fit-content;
    padding: 4px 8px;
    border-radius: 999px;
    color: var(--timeline-color);
    background: var(--timeline-bg);
    border: 1px solid var(--timeline-border);
    font-size: 11px;
    font-weight: 950;
  }

  .db-decision-card {
    display: flex;
    gap: 14px;
    padding: 20px;
    border-radius: 24px;
    color: #fff;
    background:
      linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96)),
      radial-gradient(circle at top right, rgba(212, 160, 23, 0.25), transparent 40%);
    box-shadow: 0 22px 60px rgba(15, 23, 42, 0.2);
  }

  .db-decision-icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    border-radius: 16px;
    background: rgba(212, 160, 23, 0.18);
    color: #fde68a;
    border: 1px solid rgba(253, 230, 138, 0.25);
  }

  .db-decision-card span {
    display: block;
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 950;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .db-decision-card strong {
    display: block;
    margin-top: 5px;
    color: #fff;
    font-size: 15px;
    line-height: 1.35;
    font-weight: 950;
  }

  .db-decision-card p {
    margin: 8px 0 0;
    color: #cbd5e1;
    font-size: 12.5px;
    line-height: 1.55;
  }

  @media (max-width: 1100px) {
    .db-kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .db-grid {
      grid-template-columns: 1fr;
    }

    .db-right-column {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .db-decision-card {
      grid-column: 1 / -1;
    }

    .db-flow {
      grid-template-columns: repeat(5, minmax(170px, 1fr));
    }
  }

  @media (max-width: 760px) {
    .db-container {
      width: min(100% - 28px, 1280px);
    }

    .db-hero {
      align-items: stretch;
      flex-direction: column;
    }

    .db-hero-card {
      min-width: 0;
    }

    .db-kpi-grid,
    .db-right-column {
      grid-template-columns: 1fr;
    }

    .db-panel {
      padding: 18px;
      border-radius: 22px;
    }

    .db-panel-header {
      flex-direction: column;
      margin-bottom: 18px;
    }

    .db-alert-strip {
      grid-template-columns: 1fr;
    }

    .db-alert-button {
      justify-content: center;
      width: 100%;
    }
  }
`;