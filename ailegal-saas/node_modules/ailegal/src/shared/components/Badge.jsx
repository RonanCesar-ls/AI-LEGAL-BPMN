import { GOLD } from "../../styles/theme";

export const Badge = ({ children, color = GOLD }) => (
  <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 4, fontSize: 11, padding: "2px 8px", fontWeight: 700 }}>{children}</span>
);