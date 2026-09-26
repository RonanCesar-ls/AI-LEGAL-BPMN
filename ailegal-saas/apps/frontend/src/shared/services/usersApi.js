import { authApi } from './authApi';

import { API_URL as API } from '../config.js';

export const usersApi = {
  async list() {
    const res = await fetch(`${API}/api/users`, {
      headers: authApi.headers(),
    });
    if (!res.ok) throw new Error('Falha ao carregar colaboradores.');
    return res.json();
  },
};
