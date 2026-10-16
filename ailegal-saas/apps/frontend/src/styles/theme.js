// PBMapp identity — Conceito e Cores. Dark variants keep small text readable.
export const NAVY = '#111E38';
export const GREEN = '#00C875';
export const GREEN_DARK = '#007A49';
export const BLUE = '#2563EB';
export const BLUE_DARK = '#1D4ED8';
export const BG = '#F8FAFC';
export const SURFACE = '#FFFFFF';
export const CARD = SURFACE;
export const CARD2 = BG;
export const BORDER = '#E2E8F0';
export const TEXT = NAVY;
export const MUTED = '#475569';
export const DANGER = '#DC2626';
// Compatibility for existing flow components; new components use semantic names.
export const GOLD = GREEN;
export const GOLD_DIM = GREEN_DARK;
export const BPMN_COLORS = {
  start: { fill: '#E6FAF1', stroke: GREEN_DARK },
  end: { fill: '#FEF2F2', stroke: DANGER },
  task: { fill: '#EFF6FF', stroke: BLUE },
  gateway: { fill: '#FFFBEB', stroke: '#A16207' },
  document: { fill: BG, stroke: '#64748B' },
};
