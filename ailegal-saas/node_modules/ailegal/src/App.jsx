import { useState } from "react";
import { Landing } from "./modules/landing/Landing";
import { Login } from "./modules/auth/Login";
import { EditorPage } from "./modules/editor/EditorPage";
import { BG } from "./styles/theme";

export default function AiLegalApp() {
  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        html, body { margin: 0 !important; padding: 0 !important; min-height: 100vh; width: 100%; background-color: ${BG}; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
      
      {screen === "landing" && <Landing onLogin={() => setScreen("login")} onCadastro={() => setScreen("login")} />}
      {screen === "login" && <Login onLogin={(u)=>{setUser(u); setScreen("app");}} onCadastro={() => setScreen("login")} onBack={() => setScreen("landing")} />}
      {screen === "app" && <EditorPage user={user} onLogout={() => {setUser(null); setScreen("landing");}} />}
    </>
  );
}