import { useState, useEffect } from 'react';
import { Landing }            from './modules/landing/Landing';
import { Login }              from './modules/auth/Login';
import { Cadastro }           from './modules/auth/Cadastro';
import { EditorPage }         from './modules/editor/EditorPage';
import { DiarioDeBordoPage }  from './modules/diario/DiarioDeBordoPage';
import { authApi }            from './shared/services/authApi';
import { MonitoramentoPage }  from "./modules/monitoramento/MonitoramentoPage";
import { PainelGestor }       from './modules/gestor/PainelGestor';

export default function App() {
  const [screen, setScreen]   = useState('loading');
  const [user, setUser]       = useState(null);

  const [diarioContext, setDiarioContext] = useState(null);

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
          const userData = { ...session.user, ...me };
          setUser(userData);
          setDiarioContext(prev => prev ?? {
            selectedUserId:       userData.id,
            selectedCollaborator: null,
          });
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
    setDiarioContext({
      selectedUserId:       userData.id,
      selectedCollaborator: null,
    });
    setScreen('app');
  };

  const handleLogout = () => {
    authApi.clearSession();
    setUser(null);
    setDiarioContext(null);
    setScreen('landing');
  };

  if (screen === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/pbmapp-mark.png" alt="PBMapp" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 16 }} />
          <p style={{ color: '#475569', fontSize: 14 }}>Carregando PBMapp...</p>
        </div>
      </div>
    );
  }

  return (
    <>

      {screen === 'landing'  && <Landing onLogin={() => setScreen('login')} onCadastro={() => setScreen('cadastro')} />}
      {screen === 'login'    && <Login onLogin={handleLogin} onCadastro={() => setScreen('cadastro')} onBack={() => setScreen('landing')} />}
      {screen === 'cadastro' && <Cadastro onLogin={handleLogin} onBack={() => setScreen('login')} />}

      {screen === 'app' && user && (
        <EditorPage
          user={user}
          onLogout={handleLogout}
          onAbrirDiario={() => setScreen('diario')}
          onAbrirMonitoramento={() => setScreen('monitoramento')}
          onAbrirGestor={() => setScreen('gestor')}
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

      {screen === 'gestor' && user && (
        <PainelGestor
          user={user}
          onVoltar={() => setScreen('app')}
        />
      )}

      {screen === 'monitoramento' && user && (
        <MonitoramentoPage
          user={user}
          onVoltar={() => setScreen('app')}
        />
      )}
    </>
  );
}
