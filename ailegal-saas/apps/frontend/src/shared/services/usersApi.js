import { authApi } from './authApi';

const API = import.meta.env.VITE_API_URL;

export const usersApi = {
  async list() {
    const res = await fetch(`${API}/api/users`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao carregar colaboradores.');
    return res.json();
  },
};