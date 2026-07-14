import { authApi } from './authApi';

const API = import.meta.env.VITE_API_URL;

export const tasksApi = {
  
  async list(from, to, userId) {
    const params = new URLSearchParams({ from, to });
    if (userId) params.set('userId', userId);

    const res = await fetch(`${API}/api/tasks?${params.toString()}`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao carregar tarefas.');
    return res.json();
  },

  async create({ title, description, taskDate, status, assignedTo, projectId, nodeId }) {
    const res = await fetch(`${API}/api/tasks`, {
      method:  'POST',
      headers: authApi.headers(),
      body:    JSON.stringify({ title, description, taskDate, status, assignedTo, projectId, nodeId }),
    });
    if (!res.ok) throw new Error('Falha ao criar tarefa.');
    return res.json();
  },

  async updateStatus(id, status, actingAs = null) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method:  'PATCH',
      headers: authApi.headers(),
      body:    JSON.stringify({
        status,
        actingAsId:   actingAs?.id   ?? null,
        actingAsName: actingAs?.name ?? null,
      }),
    });
    if (!res.ok) throw new Error('Falha ao atualizar status.');
    return res.json();
  },

  async remove(id, actingAs = null) {
    const params = new URLSearchParams();
    if (actingAs?.id)   params.set('actingAsId',   actingAs.id);
    if (actingAs?.name) params.set('actingAsName', actingAs.name);

    const res = await fetch(`${API}/api/tasks/${id}?${params}`, {
      method:  'DELETE',
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao remover tarefa.');
    return res.json();
  },

  async update(id, data) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method:  'PATCH',
      headers: authApi.headers(),
      body:    JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Falha ao atualizar tarefa.');
    return res.json();
  },

  async remove(id) {
    const res = await fetch(`${API}/api/tasks/${id}`, {
      method:  'DELETE',
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao remover tarefa.');
    return res.json();
  },

  async reallocate(taskIds, newDate) {
    const res = await fetch(`${API}/api/tasks/reallocate`, {
      method:  'PATCH',
      headers: authApi.headers(),
      body:    JSON.stringify({ taskIds, newDate }),
    });
    if (!res.ok) throw new Error('Falha ao realocar tarefas.');
    return res.json();
  },

  async generateFromProject(projectId, taskDate) {
    const res = await fetch(`${API}/api/tasks/generate-from-project`, {
      method:  'POST',
      headers: authApi.headers(),
      body:    JSON.stringify({ projectId, taskDate }),
    });
    if (!res.ok) throw new Error('Falha ao gerar tarefas.');
    return res.json();
  },

  async getInsight(userId, taskDate) {
    const res = await fetch(`${API}/api/tasks/insight`, {
      method:  'POST',
      headers: authApi.headers(),
      body:    JSON.stringify({ userId, taskDate }),
    });
    if (!res.ok) throw new Error('Falha ao gerar insight.');
    return res.json();
  },
};