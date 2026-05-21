import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MUTED, CARD2, BORDER, TEXT, GOLD } from "../../styles/theme";

export const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {Icon && <Icon size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED }} />}
        <input
          type={type === "password" ? (show ? "text" : "password") : type}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", boxSizing: "border-box", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontFamily: "inherit", fontSize: 14, padding: Icon ? "12px 14px 12px 40px" : "12px 14px", outline: "none", transition: "border .18s" }}
          onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = BORDER}
        />
        {type === "password" && (
          <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: MUTED, cursor: "pointer", display: "flex", alignItems: "center" }}>
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
};