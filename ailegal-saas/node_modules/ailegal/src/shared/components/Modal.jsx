import { X } from "lucide-react";
import { SURFACE, BORDER, TEXT, MUTED } from "../../styles/theme";

export const Modal = ({ title, onClose, children, width = 540 }) => (
  <div style={{ position: "fixed", inset: 0, background: "#00000066", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, width, maxWidth: "95vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 24px 80px #00000022" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
        <span style={{ color: TEXT, fontWeight: 700, fontSize: 16 }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex" }}><X size={18} /></button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);