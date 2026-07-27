import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Monitor, Clock, Wifi, WifiOff, RefreshCw, Users } from 'lucide-react';
import { trackingApi } from '../../shared/services/trackingApi';
import { usersApi }    from '../../shared/services/usersApi';
import { getLocalISODate } from '../../shared/utils/date';

const BG      = '#f4f5f7';
const SURFACE = '#ffffff';
const BORDER  = '#e2e8f0';
const TEXT    = '#1e293b';
const MUTED   = '#64748b';
const GOLD    = '#d4a017';

const DOMAIN_CONFIG = {
  whatsapp:  { label: 'WhatsApp',   color: '#25d366', bg: '#f0fdf4', icon: '💬' },
  email:     { label: 'E-mail',     color: '#4285f4', bg: '#eff6ff', icon: '📧' },
  instagram: { label: 'Instagram',  color: '#e1306c', bg: '#fdf2f8', icon: '📸' },
  facebook:  { label: 'Facebook',   color: '#1877f2', bg: '#eff6ff', icon: '👥' },
  twitter:   { label: 'Twitter/X',  color: '#1da1f2', bg: '#eff6ff', icon: '🐦' },
  linkedin:  { label: 'LinkedIn',   color: '#0077b5', bg: '#eff6ff', icon: '💼' },
  youtube:   { label: 'YouTube',    color: '#ff0000', bg: '#fef2f2', icon: '▶️' },
};

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function BarChart({ data, maxSeconds }) {
  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: 32, color: MUTED, fontSize: 13 }}>
      Nenhum dado registrado hoje.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map(item => {
        const cfg = DOMAIN_CONFIG[item.domain] ?? { label: item.domain, color: '#6366f1', bg: '#ede9fe', icon: '🌐' };
        const pct = maxSeconds > 0 ? (item.total_seconds / maxSeconds) * 100 : 0;

        return (
          <div key={item.domain}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>
                {cfg.icon} {cfg.label}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>
                {formatTime(item.total_seconds)}
              </span>
            </div>
            <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${pct}%`,
                background: cfg.color,
                transition: 'width .6s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ background: bg ?? SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <p style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: color ?? TEXT, marginTop: 2 }}>{value}</p>
      </div>
    </div>
  );
}

export function MonitoramentoPage({ user, onVoltar }) {
  const [selectedUserId, setSelectedUserId]     = useState(user.id);
  const [users, setUsers]                       = useState([]);
  const [data, setData]                         = useState(null);
  const [teamData, setTeamData]                 = useState([]);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [loading, setLoading]                   = useState(true);
  const [lastUpdate, setLastUpdate]             = useState(null);
  const [view, setView]                         = useState('individual');

  const today = getLocalISODate();

  const loadData = useCallback(async () => {
    try {
      const [userData, team, status] = await Promise.all([
        trackingApi.getByUser(selectedUserId, today, today),
        trackingApi.getTeam(today),
        trackingApi.getStatus(),
      ]);
      setData(userData);
      setTeamData(team);
      setMonitoringEnabled(status.enabled);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('[MonitoramentoPage]', err);
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, today]);

  useEffect(() => {
    usersApi.list().then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleToggleMonitoring = async () => {
    const newVal = !monitoringEnabled;
    setMonitoringEnabled(newVal);
    await trackingApi.setStatus(newVal);
  };

  const aggregated = data?.aggregated ?? [];
  const maxSeconds = aggregated.length > 0 ? Math.max(...aggregated.map(d => d.total_seconds)) : 0;
  const totalSeconds = aggregated.reduce((sum, d) => sum + d.total_seconds, 0);

  const whatsappSeconds = aggregated.find(d => d.domain === 'whatsapp')?.total_seconds ?? 0;
  const emailSeconds    = aggregated.find(d => d.domain === 'email')?.total_seconds    ?? 0;
  const socialSeconds   = aggregated.filter(d => ['instagram', 'facebook', 'twitter'].includes(d.domain))
    .reduce((sum, d) => sum + d.total_seconds, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BG, fontFamily: "'DM Sans', sans-serif" }}>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onVoltar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: MUTED, fontSize: 13, fontWeight: 600 }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div style={{ width: 1, height: 20, background: BORDER }} />
          <Monitor size={18} color="#6366f1" />
          <span style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>Monitoramento de Produtividade</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {lastUpdate && (
            <span style={{ fontSize: 11, color: MUTED }}>
              Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}

          <button onClick={loadData} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: MUTED, fontSize: 12 }}>
            <RefreshCw size={13} /> Atualizar
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 8, border: `1px solid ${monitoringEnabled ? '#bbf7d0' : '#fecaca'}`, background: monitoringEnabled ? '#f0fdf4' : '#fef2f2' }}>
            {monitoringEnabled
              ? <Wifi size={14} color="#16a34a" />
              : <WifiOff size={14} color="#dc2626" />
            }
            <span style={{ fontSize: 12, fontWeight: 700, color: monitoringEnabled ? '#16a34a' : '#dc2626' }}>
              {monitoringEnabled ? 'Coleta ativa' : 'Coleta pausada'}
            </span>
            <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20 }}>
              <input type="checkbox" checked={monitoringEnabled} onChange={handleToggleMonitoring} style={{ opacity: 0, width: 0, height: 0 }} />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: 20, cursor: 'pointer',
                background: monitoringEnabled ? '#22c55e' : '#cbd5e1', transition: 'background .2s',
              }}>
                <span style={{
                  position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: '#fff',
                  top: 3, left: monitoringEnabled ? 19 : 3, transition: 'left .2s',
                }} />
              </span>
            </label>
          </div>
        </div>
      </div>

      <div style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: '0 24px', display: 'flex', gap: 24 }}>
        {[
          { id: 'individual', label: 'Minha visão', icon: <Clock size={14} /> },
          { id: 'team',       label: 'Equipe',      icon: <Users size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              color: view === tab.id ? '#6366f1' : MUTED,
              borderBottom: view === tab.id ? '2px solid #6366f1' : '2px solid transparent',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>

        {view === 'individual' && (
          <div style={{ maxWidth: 900 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Colaborador</span>
              <select
                value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: SURFACE }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.id === user.id ? '(você)' : ''}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: MUTED }}>· {today}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              <MetricCard icon="⏱"  label="Total hoje"   value={formatTime(totalSeconds)}    color="#6366f1" />
              <MetricCard icon="💬" label="WhatsApp"     value={formatTime(whatsappSeconds)} color="#25d366" bg="#f0fdf4" />
              <MetricCard icon="📧" label="E-mail"       value={formatTime(emailSeconds)}    color="#4285f4" bg="#eff6ff" />
              <MetricCard icon="📱" label="Redes Sociais" value={formatTime(socialSeconds)}  color="#e1306c" bg="#fdf2f8" />
            </div>

            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
                Distribuição por plataforma
              </p>
              {loading
                ? <div style={{ textAlign: 'center', padding: 32, color: MUTED }}>Carregando...</div>
                : <BarChart data={aggregated} maxSeconds={maxSeconds} />
              }
            </div>
          </div>
        )}

        {view === 'team' && (
          <div style={{ maxWidth: 900 }}>
            <p style={{ fontSize: 12, color: MUTED, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Tempo registrado hoje · {today}
            </p>

            {teamData.length === 0 ? (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: 40, textAlign: 'center', color: MUTED }}>
                <Monitor size={32} color="#e2e8f0" style={{ marginBottom: 8 }} />
                <p style={{ fontSize: 13 }}>Nenhum dado registrado hoje pela equipe.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Os dados aparecem aqui automaticamente quando a extensão está ativa.</p>
              </div>
            ) : (
              <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, padding: '10px 20px', background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                  {['Colaborador', 'Plataforma', 'Tempo', 'Data'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
                  ))}
                </div>

                {teamData.map((row, i) => {
                  const cfg = DOMAIN_CONFIG[row.domain] ?? { label: row.domain, color: '#6366f1', icon: '🌐' };
                  return (
                    <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 0, padding: '12px 20px', borderBottom: i < teamData.length - 1 ? `1px solid ${BORDER}` : 'none', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{row.user_name}</span>
                      <span style={{ fontSize: 13, color: cfg.color, fontWeight: 600 }}>{cfg.icon} {cfg.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{formatTime(row.duration_seconds)}</span>
                      <span style={{ fontSize: 12, color: MUTED }}>{row.tracking_date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}