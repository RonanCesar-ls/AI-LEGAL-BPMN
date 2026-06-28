import { useState } from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useDateNavigation } from './hooks/useDateNavigation';
import { DateHierarchyNav } from './components/DateHierarchyNav';
import { CollaboratorSelector } from './components/CollaboratorSelector';

const BG       = '#f4f5f7';
const SURFACE  = '#ffffff';
const BORDER   = '#e2e8f0';
const TEXT     = '#1e293b';
const MUTED    = '#64748b';
const GOLD_DIM = '#b88a12';

export function DiarioDeBordoPage({ user, onVoltar }) {
  const nav = useDateNavigation();
  const [selectedUserId, setSelectedUserId] = useState(user.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, fontFamily: "'DM Sans', sans-serif" }}>

      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onVoltar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 13, fontWeight: 600 }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ width: 1, height: 20, background: BORDER }} />
        <LayoutDashboard size={18} color={GOLD_DIM} />
        <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Diário de Bordo Operacional</span>
      </div>

      <DateHierarchyNav nav={nav} />

      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
          Colaborador
        </span>
        <CollaboratorSelector
          currentUser={user}
          selectedUserId={selectedUserId}
          onSelect={setSelectedUserId}
        />
      </div>

      <div style={{ flex: 1, padding: '0 24px 24px', overflow: 'auto' }}>
        <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: 'center', color: MUTED }}>
          <p style={{ fontSize: 14 }}>
            Microtarefas de <strong>{nav.selectedDateISO}</strong> aparecerão aqui na próxima etapa.
          </p>
        </div>
      </div>
    </div>
  );
}