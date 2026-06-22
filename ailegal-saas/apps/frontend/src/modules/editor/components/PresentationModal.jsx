import { Maximize2, PlayCircle, X } from 'lucide-react';

export function PresentationModal({ onClose, onSelectMode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: '#00000066',
        backdropFilter: 'blur(4px)', zIndex: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff', borderRadius: 16, padding: 32, width: 480,
          border: '1px solid #e2e8f0', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
              🎬 Modo Apresentação
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
              Escolha como deseja apresentar este fluxograma
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* Fullscreen */}
          <button
            onClick={() => onSelectMode('fullscreen')}
            style={{
              padding: '20px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: '2px solid #e2e8f0', background: '#ffffff', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#d4a017'; e.currentTarget.style.background = '#fffbeb'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
          >
            <Maximize2 size={22} color="#d4a017" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              Tela Cheia
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Visualização limpa do fluxo completo, sem painéis. Ideal pra navegar livremente.
            </div>
          </button>

          {/* Walkthrough */}
          <button
            onClick={() => onSelectMode('walkthrough')}
            style={{
              padding: '20px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: '2px solid #e2e8f0', background: '#ffffff', transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#f0f0ff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
          >
            <PlayCircle size={22} color="#6366f1" style={{ marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
              Walkthrough Guiado
            </div>
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
              Avança passo a passo, com zoom automático e detalhes de cada etapa. Ideal pra explicar pra um cliente.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}