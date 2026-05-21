import { GOLD, GOLD_DIM, TEXT, BORDER, CARD2 } from "../../styles/theme";

export const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style: extraStyle }) => {
  const styles = {
    primary: { background: GOLD, color: "#ffffff", border: "none" },
    outline: { background: "transparent", color: TEXT, border: `1px solid ${BORDER}` },
  };
  const sizes = { sm: { padding: "7px 14px", fontSize: 12 }, md: { padding: "10px 20px", fontSize: 14 }, lg: { padding: "14px 28px", fontSize: 15 } };
  
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...sizes[size], borderRadius: 8, fontFamily: "inherit", fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all .18s", opacity: disabled ? 0.5 : 1, ...extraStyle }}
      onMouseEnter={e => { if (!disabled && variant === "primary") e.currentTarget.style.background = GOLD_DIM; if (!disabled && variant === "outline") e.currentTarget.style.background = CARD2; }}
      onMouseLeave={e => { if (variant === "primary") e.currentTarget.style.background = GOLD; if (variant === "outline") e.currentTarget.style.background = "transparent"; }}>
      {children}
    </button>
  );
};