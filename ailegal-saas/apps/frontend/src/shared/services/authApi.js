const API = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'pbmapp_token';
const USER_KEY  = 'pbmapp_user';

export const authApi = {

  saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  loadSession() {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user  = localStorage.getItem(USER_KEY);
      if (!token || !user) return null;
      return { token, user: JSON.parse(user) };
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  headers() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  },

  async google(credential) {
    const res = await fetch(`${API}/api/auth/google`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ credential }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Falha ao entrar com Google.');

    this.saveSession(data.token, data.user);
    return data;
  },

  async me() {
    const res = await fetch(`${API}/api/auth/me`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      this.clearSession();
      return null;
    }

    return res.json();
  },
  async verifyCollaborator(targetUserId, password) {
    const res = await fetch(`${API}/api/auth/verify-collaborator`, {
      method:  'POST',
      headers: this.headers(),
      body:    JSON.stringify({ targetUserId, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Falha ao verificar colaborador.');
    return data;
  },
};
