import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, CheckCircle, Info, Loader, RefreshCw, CalendarCheck } from 'lucide-react';
import { tasksApi } from '../../../shared/services/tasksApi';

const BORDER = '#e2e8f0';
const MUTED  = '#64748b';

const RISK_CONFIG = {
  high:   { label: 'Risco Alto',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: AlertTriangle },
  medium: { label: 'Risco Médio',   color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: Info },
  low:    { label: 'Dentro do esperado', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle },
};

export function InsightPanel({ userId, taskDate, onReallocate }) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [refused, setRefused]   = useState(false);

  const loadInsight = async () => {
    if (!userId || !taskDate) return;
    setLoading(true);
    setAccepted(false);
    setRefused(false);
    try {
      const result = await tasksApi.getInsight(userId, taskDate);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Recarrega quando muda o dia ou o colaborador
  useEffect(() => {
    setData(null);
  }, [userId, taskDate]);

  if (!data && !loading) {
    return (
      <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Brain size={16} color="#6366f1" />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
            Insight da IA
          </span>
        </div>
        <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
          Analise a carga de trabalho de hoje e receba uma recomendação inteligente.
        </p>
        <button
          onClick={loadInsight}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8, border: 'none',
            background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          <Brain size={13} /> Analisar agora
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ background: '#ffffff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6366f1' }}>
          <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>IA analisando a carga do dia...</span>
        </div>
      </div>
    );
  }

  const cfg = RISK_CONFIG[data.riskLevel] ?? RISK_CONFIG.low;
  const RiskIcon = cfg.icon;
  const hasReallocation = data.tasksToReallocate?.length > 0;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Card de risco */}
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: 12, padding: 16, marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Brain size={14} color="#6366f1" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: 1 }}>
              Insight da IA
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RiskIcon size={13} color={cfg.color} />
            <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.6, marginBottom: 12 }}>
          {data.insight}
        </p>

        {/* Stats rápidos */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Total', value: data.stats.totalToday, color: '#64748b' },
            { label: 'Concluídas', value: data.stats.doneToday, color: '#16a34a' },
            { label: 'Pendentes', value: data.stats.pendingToday, color: '#b45309' },
            { label: 'Impedidas', value: data.stats.blockedToday, color: '#dc2626' },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', background: 'rgba(255,255,255,0.6)', borderRadius: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, color: MUTED, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações — só aparece se há sugestão de realocação e usuário ainda não decidiu */}
      {hasReallocation && !accepted && !refused && (
        <div style={{
          background: '#ffffff', border: `1px solid ${BORDER}`,
          borderRadius: 12, padding: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', marginBottom: 2 }}>
              💡 Sugestão: realocar {data.tasksToReallocate.length} tarefa(s) para amanhã
            </p>
            <p style={{ fontSize: 11, color: MUTED }}>
              Média histórica: {data.stats.avgPerDay} tarefas/dia
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => { setRefused(true); }}
              style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: MUTED }}
            >
              Recusar
            </button>
            <button
              onClick={() => {
                setAccepted(true);
                onReallocate(data.tasksToReallocate);
              }}
              style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}
            >
              <CalendarCheck size={12} style={{ marginRight: 4 }} />
              Aceitar
            </button>
          </div>
        </div>
      )}

      {accepted && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
          ✓ Tarefas realocadas para amanhã com sucesso.
        </div>
      )}

      {refused && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f8fafc', border: `1px solid ${BORDER}`, fontSize: 12, color: MUTED }}>
          Sugestão recusada — você está no controle.
        </div>
      )}

      {/* Botão de reanalisar */}
      <button
        onClick={loadInsight}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, marginTop: 8,
          background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 11,
        }}
      >
        <RefreshCw size={11} /> Reanalisar
      </button>
    </div>
  );
}