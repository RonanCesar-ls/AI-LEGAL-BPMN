import { useState } from "react";
import { Scale, Mail, Lock, Loader } from "lucide-react";
import { Input } from "../../shared/components/Input";
import { Btn } from "../../shared/components/Btn";
import { BG, SURFACE, BORDER, TEXT, MUTED, GOLD, GOLD_DIM } from "../../styles/theme";

export const Login = ({ onLogin, onCadastro, onBack }) => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true);
    setTimeout(() => { 
      setLoading(false); 
      onLogin({ name: "Usuário Admin", email, role: "Advogado" }); 
    }, 1000);
  };

  return (
    <div style={{ background: BG, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: 24, left: 32, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={onBack}>
        <div style={{ background: `${GOLD}22`, borderRadius: 8, padding: 7 }}><Scale size={18} color={GOLD_DIM} /></div>
        <span style={{ fontWeight: 800, color: TEXT }}>Ai<span style={{ color: GOLD_DIM }}>Legal</span></span>
      </div>
      <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "44px 48px", width: 420, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Bem-vindo! <span style={{ color: GOLD }}>⚖</span></h1>
        <p style={{ color: MUTED, fontSize: 14, marginBottom: 32 }}>Acesse sua conta para continuar</p>
        
        <Input label="E-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" icon={Mail} />
        <Input label="Senha" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon={Lock} />
        
        <Btn onClick={handle} size="lg" disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>
          {loading ? <Loader size={15} style={{ animation: "spin 1s linear infinite" }} /> : "Entrar"}
        </Btn>
        <p style={{ textAlign: "center", marginTop: 24, color: MUTED, fontSize: 14 }}>Não tem conta? <span onClick={onCadastro} style={{ color: GOLD_DIM, cursor: "pointer", fontWeight: 700 }}>Cadastre-se</span></p>
      </div>
    </div>
  );
};