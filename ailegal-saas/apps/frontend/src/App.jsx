import { useState, useEffect } from 'react';
import { Landing }            from './modules/landing/Landing';
import { Login }              from './modules/auth/Login';
import { Cadastro }           from './modules/auth/Cadastro';
import { EditorPage }         from './modules/editor/EditorPage';
import { DiarioDeBordoPage }  from './modules/diario/DiarioDeBordoPage';
import { authApi }            from './shared/services/authApi';

export default function App() {
  const [screen, setScreen]   = useState('loading');
  const [user, setUser]       = useState(null);

  const [diarioContext, setDiarioContext] = useState({
    selectedUserId:       null,
    selectedCollaborator: null,
  });

  useEffect(() => {
    async function checkSession() {
      const session = authApi.loadSession();

      if (!session) {
        setScreen('landing');
        return;
      }

      try {
        const me = await authApi.me();
        if (me) {
          setUser({ ...session.user, ...me });
          setScreen('app');
        } else {
          authApi.clearSession();
          setScreen('landing');
        }
      } catch {
        authApi.clearSession();
        setScreen('landing');
      }
    }

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setScreen('app');
  };

  const handleLogout = () => {
    authApi.clearSession();
    setUser(null);
    setDiarioContext({ selectedUserId: null, selectedCollaborator: null });
    setScreen('landing');
  };

  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f5f7' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>⚖</div>
          <p style={{ color: '#64748b', fontSize: 14 }}>Carregando AiLegal...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        html, body { margin: 0; padding: 0; min-height: 100vh; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>

      {screen === 'landing'  && <Landing   onLogin={() => setScreen('login')} onCadastro={() => setScreen('cadastro')} />}
      {screen === 'login'    && <Login     onLogin={handleLogin} onCadastro={() => setScreen('cadastro')} onBack={() => setScreen('landing')} />}
      {screen === 'cadastro' && <Cadastro  onLogin={handleLogin} onBack={() => setScreen('login')} />}

      {screen === 'app' && user && (
        <EditorPage
          user={user}
          onLogout={handleLogout}
          onAbrirDiario={() => setScreen('diario')}
        />
      )}

      {screen === 'diario' && user && (
        <DiarioDeBordoPage
          user={user}
          onVoltar={() => setScreen('app')}
          diarioContext={diarioContext}
          onContextChange={setDiarioContext}
        />
      )}
    </>
  );
}