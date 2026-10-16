export function Brand({ inverse = false }) {
  return (
    <span className={`brand${inverse ? ' brand--inverse' : ''}`} aria-label="PBMapp">
      <img src="/pbmapp-mark.png" alt="" width="38" height="38" />
      <span>PBM<span className="brand-suffix">app</span><span className="brand-dot">.</span></span>
    </span>
  );
}
import './Brand.css';

