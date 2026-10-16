import { ArrowRight, ArrowUpRight, Check, CheckCheck, ChevronRight, Circle, FileText, GitBranch, LayoutDashboard, ListTodo, Mail, MousePointer2, ScanText, ShieldCheck, Sparkles, Upload, Users } from 'lucide-react';
import { Brand } from '../../shared/components/Brand';
import './Landing.css';

const features = [
  { icon: Upload, label: '01 / DOCUMENTOS', title: 'Do arquivo ao processo.', desc: 'Importe seus documentos e arquivos RCC para organizar as informações que dão início ao trabalho.' },
  { icon: GitBranch, label: '02 / INTELIGÊNCIA ARTIFICIAL', title: 'Fluxos que fazem sentido.', desc: 'Transforme informações em diagramas BPMN. Visualize etapas, responsáveis e conexões com apoio da IA.' },
  { icon: Users, label: '03 / ENTIDADES', title: 'Cada detalhe conectado.', desc: 'Identifique partes, prazos e interdependências para entender o processo por inteiro.' },
  { icon: ShieldCheck, label: '04 / ROTINA JURÍDICA', title: 'Feito para o seu trabalho.', desc: 'Reúna a análise de documentos e o mapeamento de processos em um ambiente pensado para a operação jurídica.' },
  { icon: LayoutDashboard, label: '05 / GESTÃO', title: 'Visibilidade para decidir.', desc: 'Organize projetos, acompanhe tarefas no Diário de Bordo e veja os indicadores no Painel do Gestor.' },
  { icon: Mail, label: '06 / FLUXO DOCUMENTAL', title: 'Informação em movimento.', desc: 'Mantenha documentos e informações do seu fluxo de trabalho organizados em um só lugar.' },
];

function ProductPreview() {
  return (
    <div className="product-preview" aria-label="Prévia ilustrativa de um processo organizado no PBMapp">
      <div className="preview-topbar"><Brand /><span className="preview-environment"><span className="status-dot" /> Ambiente de trabalho</span><div className="preview-avatar">JS</div></div>
      <div className="preview-workspace">
        <aside className="preview-sidebar" aria-hidden="true">
          <span className="preview-sidebar-label">WORKSPACE</span>
          <div className="preview-menu-active"><GitBranch size={15} /> Editor BPMN</div>
          <div><ListTodo size={15} /> Diário de Bordo</div>
          <div><LayoutDashboard size={15} /> Painel do Gestor</div>
          <span className="preview-sidebar-label preview-project-label">SEUS PROJETOS</span>
          <div><span className="status-dot" /> Processo jurídico</div>
          <div><Circle size={8} /> Novo projeto</div>
        </aside>
        <div className="preview-main">
          <div className="preview-breadcrumb">Projetos <ChevronRight size={12} /><strong>Processo jurídico</strong><span className="preview-saved"><CheckCheck size={12} /> Salvo</span></div>
          <div className="preview-heading"><div><span>MAPEAMENTO DE PROCESSOS</span><h3>Um caminho claro para cada etapa.</h3></div><span className="preview-ai"><Sparkles size={12} /> IA</span></div>
          <div className="preview-canvas"><div className="flow-track">
            <div className="flow-start"><span><Check size={15} /></span><small>Início</small></div><div className="flow-connector" />
            <div className="flow-task"><span className="flow-task-icon"><FileText size={16} /></span><strong>Análise documental</strong><small>Secretaria</small><span className="flow-tag"><Check size={10} /> Concluído</span></div><div className="flow-connector" />
            <div className="flow-decision"><div><GitBranch size={19} /></div><small>Aprovação</small></div><div className="flow-connector" />
            <div className="flow-task flow-task--next"><span className="flow-task-icon"><ShieldCheck size={16} /></span><strong>Revisão jurídica</strong><small>Responsável jurídico</small><span className="flow-tag flow-tag--blue">Em andamento</span></div>
          </div><div className="canvas-caption"><MousePointer2 size={12} /> Clareza para acompanhar. Controle para avançar.</div><span className="preview-zoom">− <span>100%</span> +</span></div>
          <div className="preview-bottom"><span><span className="status-dot" /> Fluxo conectado</span><span>Prévia ilustrativa · Padrão BPMN</span></div>
        </div>
      </div>
    </div>
  );
}

export const Landing = ({ onLogin, onCadastro }) => (
  <div className="landing">
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <header className="landing-header"><div className="landing-container landing-header-inner">
      <a className="brand-link" href="#inicio" aria-label="PBMapp — início"><Brand /></a>
      <nav className="landing-nav" aria-label="Navegação principal"><a href="#recursos">Recursos</a><a href="#como-funciona">Como funciona</a></nav>
      <div className="landing-header-actions"><button className="text-button" onClick={onLogin}>Acessar conta <ArrowUpRight size={14} /></button><button className="site-button site-button--small" onClick={onCadastro}>Começar agora <ArrowRight size={15} /></button></div>
    </div></header>
    <main id="conteudo">
      <section className="landing-hero landing-container" id="inicio"><div className="hero-copy">
        <div className="eyebrow"><span className="status-dot" /> INTELIGÊNCIA QUE CONECTA PROCESSOS</div>
        <h1>Clareza em cada etapa.<br /><span>Eficiência em todo o fluxo.</span></h1>
        <p>Transforme documentos em processos visuais com inteligência artificial. Organize sua operação jurídica e dê à sua equipe uma visão clara do próximo passo.</p>
        <div className="hero-actions"><button className="site-button" onClick={onCadastro}>Criar minha conta <ArrowRight size={17} /></button><a className="site-button site-button--secondary" href="#plataforma">Conhecer a plataforma <ArrowUpRight size={17} /></a></div>
        <div className="hero-notes"><span><Check size={14} /> Fluxogramas BPMN</span><span><Check size={14} /> IA generativa</span><span><Check size={14} /> Gestão integrada</span></div>
      </div><div className="hero-preview" id="plataforma"><div className="preview-label"><span>DA INFORMAÇÃO À AÇÃO</span><span>Uma visão. Todo o processo.</span></div><ProductPreview /><div className="preview-footnote"><span className="preview-footnote-line" /> Menos complexidade. Mais fluidez.</div></div></section>
      <div className="capabilities-strip"><div className="landing-container"><span>SEU TRABALHO, CONECTADO.</span><span><ScanText size={19} /> Documentos</span><ChevronRight size={14} /><span><GitBranch size={19} /> Processos</span><ChevronRight size={14} /><span><Users size={19} /> Pessoas</span><ChevronRight size={14} /><span><LayoutDashboard size={19} /> Gestão</span></div></div>
      <section className="features-section landing-container" id="recursos"><div className="section-heading"><div><span className="section-kicker">DO DETALHE À VISÃO COMPLETA</span><h2>Uma operação mais organizada.<br />Uma equipe mais conectada.</h2></div><p>Da primeira análise ao acompanhamento diário, reúna o que importa para fazer seu trabalho fluir.</p></div><div className="feature-grid">{features.map(({ icon: Icon, label, title, desc }) => <article className="feature-card" key={title}><div className="feature-icon"><Icon size={22} strokeWidth={1.6} /></div><span className="feature-label">{label}</span><h3>{title}</h3><p>{desc}</p></article>)}</div></section>
      <section className="how-section" id="como-funciona"><div className="landing-container"><div className="section-heading"><div><span className="section-kicker">SIMPLES EM CADA PASSO</span><h2>Do documento ao fluxo.<br />Do fluxo à ação.</h2></div><p>Um caminho mais claro para transformar informação em trabalho organizado.</p></div><div className="steps-grid">{[
        { number: '01', icon: Upload, title: 'Traga seus documentos', desc: 'Crie um projeto e importe os arquivos que fazem parte do seu processo.' },
        { number: '02', icon: Sparkles, title: 'Deixe a IA conectar', desc: 'Gere o fluxograma e revise as etapas, conexões e responsabilidades.' },
        { number: '03', icon: CheckCheck, title: 'Acompanhe a execução', desc: 'Transforme o fluxo em tarefas e acompanhe sua equipe em um só lugar.' },
      ].map(({ number, icon: Icon, title, desc }) => <article className="step" key={number}><div className="step-top"><span>{number}</span><Icon size={21} /></div><h3>{title}</h3><p>{desc}</p></article>)}</div></div></section>
      <section className="cta-section landing-container"><div className="cta-copy"><span className="section-kicker">SEU PRÓXIMO PASSO COMEÇA AQUI</span><h2>Mais clareza para sua equipe.<br /><span>Mais movimento para sua operação.</span></h2><p>Conheça uma nova forma de visualizar e gerenciar seus processos.</p><button className="site-button" onClick={onCadastro}>Começar agora <ArrowRight size={17} /></button></div><div className="cta-art" aria-hidden="true"><div /><div /><div /><div><Check size={42} strokeWidth={1.5} /></div></div></section>
    </main>
    <footer className="landing-footer"><div className="landing-container"><Brand /><p>Inteligência para conectar. Clareza para avançar.</p><span>© {new Date().getFullYear()} PBMapp</span></div></footer>
  </div>
);
