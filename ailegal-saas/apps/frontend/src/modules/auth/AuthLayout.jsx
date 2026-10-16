import { ArrowLeft, Check, GitBranch, ShieldCheck } from 'lucide-react';
import { Brand } from '../../shared/components/Brand';
import './Auth.css';

export function AuthLayout({ children, onBack, mode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <button className="auth-brand" onClick={onBack} aria-label={mode === 'login' ? 'Voltar para a página inicial' : 'Voltar para o login'}><Brand inverse /></button>
        <div className="auth-story-copy">
          <span className="auth-kicker"><span className="status-dot" /> PROCESSOS MAIS CLAROS</span>
          <h2>Conecte as etapas.<br /><span>Avance com clareza.</span></h2>
          <p>Documentos, fluxos e pessoas em um ambiente feito para sua operação jurídica.</p>
          <div className="auth-flow" aria-hidden="true"><div><GitBranch size={20} /><span>Informação organizada</span><Check size={15} /></div><span className="auth-flow-line" /><div><ShieldCheck size={20} /><span>Próximo passo definido</span><Check size={15} /></div></div>
        </div>
        <p className="auth-story-footer">Inteligência para conectar. Clareza para avançar.</p>
      </aside>
      <div className="auth-content"><button className="auth-back" onClick={onBack}><ArrowLeft size={15} /> {mode === 'login' ? 'Página inicial' : 'Voltar para o login'}</button><main className="auth-card">{children}</main><p className="auth-content-footer">PBMapp · Gestão de processos com inteligência</p></div>
    </div>
  );
}
