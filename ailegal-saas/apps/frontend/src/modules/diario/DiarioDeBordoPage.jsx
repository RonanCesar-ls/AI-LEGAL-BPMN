import { useState } from 'react';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useDateNavigation } from './hooks/useDateNavigation';
import { useTasks } from './hooks/useTasks';
import { useDashboard }  from './hooks/useDashboard';
import { DateHierarchyNav } from './components/DateHierarchyNav';
import { CollaboratorSelector } from './components/CollaboratorSelector';
import { TaskList } from './components/TaskList';
import { InsightPanel } from './components/InsightPanel';
import { Dashboard }     from './components/Dashboard';
import { tasksApi } from '../../shared/services/tasksApi';
import { AuditLog } from './components/AuditLog';

const BG       = '#f4f5f7';
const SURFACE  = '#ffffff';
const BORDER   = '#e2e8f0';
const TEXT     = '#1e293b';
const MUTED    = '#64748b';
const GOLD_DIM = '#b88a12';

export function DiarioDeBordoPage({ user, onVoltar, diarioContext, onContextChange }) {
  const nav = useDateNavigation();

  const selectedUserId       = diarioContext?.selectedUserId       ?? user.id;
  const selectedCollaborator = diarioContext?.selectedCollaborator ?? null;

  const [auditRefreshKey, setAuditRefreshKey] = useState(0);
  const triggerAuditRefresh = () => setAuditRefreshKey(k => k + 1);

  const { metrics, loading: metricsLoading, lastUpdate, refetch: refreshDashboard } = useDashboard(nav.selectedDateISO);

  const { tasks, loading, addTask, updateStatus, removeTask, reload } = useTasks(
    selectedUserId,
    nav.selectedDateISO,
    user,
    selectedCollaborator,
    triggerAuditRefresh,
    refreshDashboard
  );

  const handleSelectCollaborator = (userId, collaborator) => {
    onContextChange({
      selectedUserId:       userId,
      selectedCollaborator: collaborator ?? null,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

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
          onSelect={handleSelectCollaborator}
        />
      </div>

      <div style={{ flex: 1, padding: '0 24px 24px', overflow: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 20,
          maxWidth: 1200,
          alignItems: 'start',
        }}>

          <div>
            <InsightPanel
              userId={selectedUserId}
              taskDate={nav.selectedDateISO}
              onReallocate={async (taskIds) => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const tomorrowISO = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
                
                await tasksApi.reallocate(taskIds, tomorrowISO);
                reload();
                triggerAuditRefresh();
                refreshDashboard();
              }}
            />
            
            <p style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 }}>
              Microtarefas de {nav.selectedDateISO}
            </p>
            
            <TaskList
              tasks={tasks}
              loading={loading}
              onAdd={addTask}
              onStatusChange={updateStatus}
              onRemove={removeTask}
            />
            
            <div style={{ marginTop: 24 }}>
              <AuditLog 
                userId={selectedUserId}
                dateFrom={nav.selectedDateISO}
                dateTo={nav.selectedDateISO}
                refreshKey={auditRefreshKey}
              />
            </div>
          </div>

          <div style={{ position: 'sticky', top: 0 }}>
            <p style={{ fontSize: 12, color: MUTED, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
              Dashboard do dia
            </p>
            <Dashboard
              metrics={metrics}
              loading={metricsLoading}
              lastUpdate={lastUpdate}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
