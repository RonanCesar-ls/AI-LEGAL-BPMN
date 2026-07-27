import { authApi } from './authApi';

const API = import.meta.env.VITE_API_URL;

export const trackingApi = {
  async getByUser(userId, from, to) {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (from)   params.set('from', from);
    if (to)     params.set('to', to);

    const res = await fetch(`${API}/api/tracking?${params}`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao buscar dados de monitoramento.');
    return res.json();
  },

  async getTeam(date) {
    const params = new URLSearchParams();
    if (date) params.set('date', date);

    const res = await fetch(`${API}/api/tracking/team?${params}`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao buscar dados da equipe.');
    return res.json();
  },

  async getStatus() {
    const res = await fetch(`${API}/api/tracking/status`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao buscar status.');
    return res.json();
  },

  async setStatus(enabled) {
    const res = await fetch(`${API}/api/tracking/status`, {
      method:  'PATCH',
      headers: authApi.headers(),
      body:    JSON.stringify({ enabled }),
    });
    if (!res.ok) throw new Error('Falha ao atualizar status.');
    return res.json();
  },
};