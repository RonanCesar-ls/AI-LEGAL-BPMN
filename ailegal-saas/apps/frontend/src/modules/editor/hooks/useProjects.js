import { useState, useEffect, useCallback, useRef } from 'react';
import { projectsApi } from '../../../shared/services/projectsApi';

const STORAGE_KEY  = 'ailegal_projects';
const SAVE_DELAY   = 2000; // salva 2s após última mudança (debounce)

function loadLocal() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocal(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {}
}

export function useProjects(user) {
  const [projects, setProjectsRaw]        = useState(loadLocal);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    const saved = loadLocal();
    return saved.length > 0 ? saved[saved.length - 1].id : null;
  });
  const [dbReady, setDbReady]   = useState(false);
  const [syncing, setSyncing]   = useState(false);
  const saveTimerRef            = useRef({});

  // ─── WRAPPER: salva no estado + localStorage ───────────────────────────────
  const setProjects = useCallback((updater) => {
    setProjectsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveLocal(next);
      return next;
    });
  }, []);

  // ─── CARREGA DO BANCO quando o usuário loga ───────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setDbReady(false);
      return;
    }

    async function loadFromDb() {
      setSyncing(true);
      try {
        const dbProjects = await projectsApi.list();

        if (dbProjects.length > 0) {
          // Banco tem dados — usa eles como fonte de verdade
          const withLog = dbProjects.map(p => ({ ...p, aiLog: [] }));
          setProjectsRaw(withLog);
          saveLocal(withLog);
          setActiveProjectId(withLog[0].id);
        } else {
          // Banco vazio mas localStorage tem dados — sincroniza pro banco
          const local = loadLocal();
          if (local.length > 0) {
            await Promise.all(
              local.map(p => projectsApi.create(p).catch(() => {}))
            );
          }
        }

        setDbReady(true);
      } catch (err) {
        console.warn('[useProjects] Banco indisponível, usando localStorage.', err.message);
        setDbReady(false);
      } finally {
        setSyncing(false);
      }
    }

    loadFromDb();
  }, [user?.id]);

  // ─── AUTO-SAVE com debounce: salva no banco após 2s de inatividade ─────────
  useEffect(() => {
    if (!dbReady || !user?.id || projects.length === 0) return;

    // No useEffect de auto-save, quando o projeto não existe no banco ainda,
// cria e atualiza o ID local com o UUID retornado pelo banco
projects.forEach(project => {
  if (project.status !== 'done' && project.status !== 'ready') return;

  if (saveTimerRef.current[project.id]) {
    clearTimeout(saveTimerRef.current[project.id]);
  }

  saveTimerRef.current[project.id] = setTimeout(async () => {
    try {
      // Tenta atualizar — se falhar (ID inválido), cria novo
      const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(project.id);

      if (!isValidUuid) {
        // ID local — cria no banco e substitui o ID
        const created = await projectsApi.create(project);
        // Atualiza o ID no estado local pelo UUID real do banco
        setProjectsRaw(prev => {
          const updated = prev.map(p =>
            p.id === project.id ? { ...p, id: created.id } : p
          );
          saveLocal(updated);
          return updated;
        });
        setActiveProjectId(prev =>
          prev === project.id ? created.id : prev
        );
        console.log(`[useProjects] Criado no banco: ${project.name} → ${created.id}`);
      } else {
        // UUID válido — só atualiza
        await projectsApi.save(project);
        console.log(`[useProjects] Auto-saved: ${project.name}`);
      }
    } catch (err) {
      console.warn(`[useProjects] Falha ao salvar ${project.name}:`, err.message);
    }
  }, SAVE_DELAY);
});

    // Cleanup: cancela todos os timers ao desmontar
    return () => {
      Object.values(saveTimerRef.current).forEach(clearTimeout);
    };
  }, [projects, dbReady, user?.id]);

  // ─── HELPERS DERIVADOS ────────────────────────────────────────────────────
  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const nodes         = activeProject?.nodes || [];
  const edges         = activeProject?.edges || [];
  const generated     = activeProject?.status === 'done';

  const setActiveNodes = useCallback((updater) =>
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId
        ? { ...p, nodes: typeof updater === 'function' ? updater(p.nodes) : updater }
        : p
    )), [activeProjectId, setProjects]);

  const setActiveEdges = useCallback((updater) =>
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId
        ? { ...p, edges: typeof updater === 'function' ? updater(p.edges) : updater }
        : p
    )), [activeProjectId, setProjects]);

  // Salva manualmente um projeto específico (botão "Salvar")
  const saveProject = useCallback(async (projectId) => {
    if (!user?.id || !dbReady) return;
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setSyncing(true);
    try {
      // Se o projeto ainda não existe no banco, cria
      // Se já existe, atualiza
      await projectsApi.save(project).catch(async () => {
        await projectsApi.create(project);
      });
    } catch (err) {
      console.error('[useProjects] Erro ao salvar:', err.message);
    } finally {
      setSyncing(false);
    }
  }, [user?.id, dbReady, projects]);

  // Remove projeto do estado local e do banco
  const removeProject = useCallback(async (projectId) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));

    const remaining = projects.filter(p => p.id !== projectId);
    setActiveProjectId(remaining[remaining.length - 1]?.id ?? null);

    if (dbReady && user?.id) {
      await projectsApi.remove(projectId).catch(() => {});
    }
  }, [projects, dbReady, user?.id, setProjects]);

  // Limpa tudo
  const clearProjects = useCallback(() => {
    setProjectsRaw([]);
    setActiveProjectId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    nodes,
    edges,
    generated,
    setActiveNodes,
    setActiveEdges,
    saveProject,
    removeProject,
    clearProjects,
    syncing,
    dbReady,
  };
}