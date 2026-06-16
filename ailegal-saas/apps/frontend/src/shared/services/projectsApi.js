import { authApi } from './authApi';

const API = import.meta.env.VITE_API_URL;

export const projectsApi = {

  async list() {
    const res = await fetch(`${API}/api/projects`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao carregar projetos.');
    return res.json();
  },

  async create(project) {
    const res = await fetch(`${API}/api/projects`, {
      method:  'POST',
      headers: authApi.headers(),
      body:    JSON.stringify({
        name:            project.name,
        type:            project.type            ?? 'Automático',
        status:          project.status          ?? 'idle',
        promptText:      project.promptText      ?? '',
        nodes:           project.nodes           ?? [],
        edges:           project.edges           ?? [],
        processingQueue: project.processingQueue ?? [],
      }),
    });
    if (!res.ok) throw new Error('Falha ao criar projeto.');
    return res.json();
  },

  async save(project) {
    const res = await fetch(`${API}/api/projects/${project.id}`, {
      method:  'PATCH',
      headers: authApi.headers(),
      body:    JSON.stringify({
        name:            project.name,
        type:            project.type,
        status:          project.status,
        promptText:      project.promptText,
        nodes:           project.nodes,
        edges:           project.edges,
        processingQueue: project.processingQueue,
      }),
    });
    if (!res.ok) throw new Error('Falha ao salvar projeto.');
    return res.json();
  },

  async remove(projectId) {
    const res = await fetch(`${API}/api/projects/${projectId}`, {
      method:  'DELETE',
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao deletar projeto.');
    return res.json();
  },
};