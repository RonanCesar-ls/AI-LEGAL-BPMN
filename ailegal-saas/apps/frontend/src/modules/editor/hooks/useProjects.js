import { useState } from 'react';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;
  const nodes = activeProject?.nodes || [];
  const edges = activeProject?.edges || [];
  const generated = activeProject?.status === 'done';

  const updateProject = (projectId, patch) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...patch } : p));
  };

  const addLog = (projectId, msg) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, aiLog: [...(p.aiLog || []), msg] } : p
    ));
  };

  const setActiveNodes = (updater) => {
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, nodes: typeof updater === 'function' ? updater(p.nodes) : updater } : p
    ));
  };

  const setActiveEdges = (updater) => {
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, edges: typeof updater === 'function' ? updater(p.edges) : updater } : p
    ));
  };

  return {
    projects, setProjects, activeProjectId, setActiveProjectId,
    activeProject, nodes, edges, generated,
    updateProject, addLog, setActiveNodes, setActiveEdges
  };
};