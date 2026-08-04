import { useState } from "react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { ArrowLeft } from 'lucide-react';

const G = "#d4a017", I = "#6366f1", C = "#22c55e", W = "#eab308", D = "#ef4444";
const B = "#3b82f6", T = "#1e293b", M = "#64748b", SURF = "#ffffff", BRD = "#e2e8f0";

const DATA = {
  dia: {
    kpis: [
      { label: "Total", value: "47", delta: "+3", up: true, color: I },
      { label: "Concluídos", value: "12", delta: "+2", up: true, color: C },
      { label: "Em Execução", value: "23", delta: "+1", up: true, color: G },
      { label: "Bloqueados", value: "3", delta: "+1", up: false, color: D },
      { label: "SLA", value: "91%", delta: "+2pp", up: true, color: C },
    ],
    funnel: [
      { label: "Entrada", value: 47, color: B },
      { label: "Em Execução", value: 23, color: G },
      { label: "Concluído", value: 12, color: C },
      { label: "Bloqueado", value: 3, color: D },
    ],
    crossref: [
      { t: "Seg", p: 8, h: 6 },
      { t: "Ter", p: 12, h: 7 },
      { t: "Qua", p: 7, h: 6 },
      { t: "Qui", p: 9, h: 7 },
      { t: "Sex", p: 11, h: 7 },
    ],
    team: [
      { name: "Ronan César", done: 8, total: 12 },
      { name: "Dir. Negócios", done: 5, total: 9 },
      { name: "Financeiro", done: 4, total: 7 },
    ],
    monitoring: [
      { name: "WhatsApp", value: 44, color: "#25d366" },
      { name: "E-mail", value: 18, color: "#4285f4" },
      { name: "LinkedIn", value: 15, color: "#0077b5" },
      { name: "Instagram", value: 8, color: "#e1306c" },
      { name: "Outros", value: 15, color: "#94a3b8" },
    ],
    insights: [
      { type: "danger", title: "Gargalo detectado", desc: "3 processos bloqueados em Aprovação de Contratos" },
      { type: "accent", title: "Pico de atividade", desc: "Equipe 23% acima da média às 14h" },
      { type: "success", title: "SLA excelente", desc: "91% das tarefas dentro do prazo hoje" },
    ],
  },
  semana: {
    kpis: [
      { label: "Total", value: "234", delta: "+18", up: true, color: I },
      { label: "Concluídos", value: "89", delta: "+15", up: true, color: C },
      { label: "Em Execução", value: "102", delta: "+6", up: true, color: G },
      { label: "Bloqueados", value: "12", delta: "+2", up: false, color: D },
      { label: "SLA", value: "87%", delta: "-1pp", up: false, color: W },
    ],
    funnel: [
      { label: "Entrada", value: 234, color: B },
      { label: "Em Execução", value: 102, color: G },
      { label: "Concluído", value: 89, color: C },
      { label: "Bloqueado", value: 12, color: D },
    ],
    crossref: [
      { t: "Sem 1", p: 52, h: 38 },
      { t: "Sem 2", p: 67, h: 42 },
      { t: "Sem 3", p: 58, h: 35 },
      { t: "Sem 4", p: 71, h: 48 },
    ],
    team: [
      { name: "Ronan César", done: 32, total: 45 },
      { name: "Dir. Negócios", done: 28, total: 38 },
      { name: "Financeiro", done: 19, total: 31 },
    ],
    monitoring: [
      { name: "WhatsApp", value: 54, color: "#25d366" },
      { name: "E-mail", value: 21, color: "#4285f4" },
      { name: "Instagram", value: 9, color: "#e1306c" },
      { name: "LinkedIn", value: 8, color: "#0077b5" },
      { name: "Outros", value: 8, color: "#94a3b8" },
    ],
    insights: [
      { type: "warning", title: "SLA em risco", desc: "12 processos com prazo crítico esta semana" },
      { type: "accent", title: "Sugestão da IA", desc: "Realocar 4 tarefas de Financeiro para Ronan" },
      { type: "success", title: "Tendência positiva", desc: "Conclusões 18% acima da semana anterior" },
    ],
  },
  mes: {
    kpis: [
      { label: "Total", value: "892", delta: "+67", up: true, color: I },
      { label: "Concluídos", value: "341", delta: "+28", up: true, color: C },
      { label: "Em Execução", value: "387", delta: "+31", up: true, color: G },
      { label: "Bloqueados", value: "47", delta: "+8", up: false, color: D },
      { label: "SLA", value: "84%", delta: "-3pp", up: false, color: D },
    ],
    funnel: [
      { label: "Entrada", value: 892, color: B },
      { label: "Em Execução", value: 387, color: G },
      { label: "Concluído", value: 341, color: C },
      { label: "Bloqueado", value: 47, color: D },
    ],
    crossref: [
      { t: "Jan", p: 142, h: 128 },
      { t: "Fev", p: 158, h: 145 },
      { t: "Mar", p: 161, h: 152 },
      { t: "Abr", p: 148, h: 138 },
      { t: "Mai", p: 139, h: 129 },
      { t: "Jun", p: 144, h: 141 },
    ],
    team: [
      { name: "Ronan César", done: 112, total: 156 },
      { name: "Dir. Negócios", done: 98, total: 134 },
      { name: "Financeiro", done: 76, total: 112 },
    ],
    monitoring: [
      { name: "WhatsApp", value: 51, color: "#25d366" },
      { name: "E-mail", value: 19, color: "#4285f4" },
      { name: "Instagram", value: 11, color: "#e1306c" },
      { name: "LinkedIn", value: 10, color: "#0077b5" },
      { name: "Outros", value: 9, color: "#94a3b8" },
    ],
    insights: [
      { type: "danger", title: "Gargalo crítico", desc: "47 bloqueios acumulados em Aprovação de Contratos" },
      { type: "accent", title: "Padrão identificado", desc: "Produtividade cai 22% toda segunda-feira" },
      { type: "gold", title: "Recomendação", desc: "Automatizar integração via API: economia de 15h/mês" },
    ],
  },
};

const IS = {
  danger:  { bg: "#fef2f2", border: "#fecaca", dot: D,  text: "#dc2626" },
  warning: { bg: "#fffbeb", border: "#fde68a", dot: W,  text: "#b45309" },
  accent:  { bg: "#eef2ff", border: "#c7d2fe", dot: I,  text: "#4338ca" },
  success: { bg: "#f0fdf4", border: "#bbf7d0", dot: C,  text: "#16a34a" },
  gold:    { bg: "#fffbeb", border: "#fde68a", dot: G,  text: "#92400e" },
};

const card = { background: SURF, border: `0.5px solid ${BRD}`, borderRadius: 12, padding: "14px 16px" };
const sectionTitle = { fontSize: 12, fontWeight: 500, color: T, marginBottom: 2 };
const sectionSub = { fontSize: 11, color: M, marginBottom: 12 };

function KpiCard({ label, value, delta, up, color }) {
  return (
    <div style={{ ...card, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: M, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 500, color, marginBottom: 4, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: up ? C : D, fontWeight: 500 }}>
        {up ? "↑" : "↓"} {delta}
      </div>
    </div>
  );
}

function Funnel({ items }) {
  const max = items[0].value;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <div key={item.label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: M, fontWeight: 500 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: T, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                {item.value.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 7, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: 4 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamBar({ name, done, total }) {
  const pct = Math.round((done / total) * 100);
  const barColor = pct >= 70 ? C : pct >= 50 ? W : D;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: T, fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: 11, color: barColor, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
          {done}/{total} · {pct}%
        </span>
      </div>
      <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 3 }} />
      </div>
    </div>
  );
}

function InsightCard({ type, title, desc }) {
  const s = IS[type] || IS.accent;
  return (
    <div style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: 8, padding: "9px 11px", marginBottom: 7 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: s.text }}>{title}</span>
      </div>
      <p style={{ fontSize: 11, color: M, margin: 0, lineHeight: 1.5, paddingLeft: 11 }}>{desc}</p>
    </div>
  );
}

const CTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: SURF, border: `0.5px solid ${BRD}`, borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
      <div style={{ fontWeight: 500, marginBottom: 3, color: T }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
};

export default function PainelGestor({ user, onVoltar }) {
  const [period, setPeriod] = useState("semana");
  const d = DATA[period];
  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const convRate = Math.round((d.funnel[2].value / d.funnel[0].value) * 100);
  const teamAvg = Math.round(d.team.reduce((s, t) => s + (t.done / t.total * 100), 0) / d.team.length);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: T, padding: "2px" }}> 

      {/* ── Voltar ── */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={onVoltar} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, fontWeight: 600, padding: 0 }}>
          <ArrowLeft size={14} /> Voltar
        </button>
      </div>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: T, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>⚖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.2 }}>Painel do Gestor</div>
            <div style={{ fontSize: 11, color: M }}>{today}</div>
          </div>
        </div>
        <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3, border: `0.5px solid ${BRD}`, gap: 2 }}>
          {["dia", "semana", "mes"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "5px 13px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "inherit",
              border: period === p ? `0.5px solid ${BRD}` : "none",
              background: period === p ? SURF : "transparent",
              color: period === p ? T : M,
            }}>
              {p === "dia" ? "Dia" : p === "semana" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "nowrap" }}>
        {d.kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── Main 3-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>

        {/* Funnel */}
        <div style={card}>
          <div style={sectionTitle}>Funil de processos</div>
          <div style={sectionSub}>do total ao entregue</div>
          <Funnel items={d.funnel} />
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `0.5px solid #f1f5f9`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: M }}>Taxa de conclusão</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C }}>{convRate}%</span>
          </div>
        </div>

        {/* Team */}
        <div style={card}>
          <div style={sectionTitle}>Desempenho individual</div>
          <div style={sectionSub}>tarefas concluídas / total</div>
          {d.team.map((t) => <TeamBar key={t.name} {...t} />)}
          <div style={{ marginTop: 8, paddingTop: 10, borderTop: `0.5px solid #f1f5f9`, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: M }}>Média da equipe</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: teamAvg >= 70 ? C : teamAvg >= 50 ? W : D }}>{teamAvg}%</span>
          </div>
        </div>

        {/* Insights */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
            <span style={{ fontSize: 10, color: I }}>✦</span>
            <div style={sectionTitle}>Insights da IA</div>
          </div>
          <div style={sectionSub}>análise automática</div>
          {d.insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
        </div>
      </div>

      {/* ── Bottom 2-col ── */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: 10 }}>

        {/* Cross-ref chart */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={sectionTitle}>Processos × produtividade</div>
              <div style={{ fontSize: 11, color: M }}>correlação entre conclusões e horas ativas</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
              {[{ color: I, label: "Processos" }, { color: C, label: "Horas" }].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: M }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={d.crossref} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: M }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: M }} axisLine={false} tickLine={false} />
              <Tooltip content={<CTip />} />
              <Area type="monotone" dataKey="p" name="Processos" stroke={I} strokeWidth={2} fill={I} fillOpacity={0.08} dot={false} />
              <Area type="monotone" dataKey="h" name="Horas" stroke={C} strokeWidth={2} fill={C} fillOpacity={0.08} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monitoring donut */}
        <div style={card}>
          <div style={sectionTitle}>Monitoramento</div>
          <div style={sectionSub}>distribuição por plataforma</div>
          <ResponsiveContainer width="100%" height={110}>
            <PieChart>
              <Pie data={d.monitoring} cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={2} dataKey="value">
                {d.monitoring.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [`${v}%`, n]}
                contentStyle={{ fontSize: 11, border: `0.5px solid ${BRD}`, borderRadius: 6 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 6px" }}>
            {d.monitoring.map((item) => (
              <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: M }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.name} {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}