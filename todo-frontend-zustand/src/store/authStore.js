import { create } from 'zustand';

const API_URL = 'http://127.0.0.1:8000/api/';

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access);
        set({ token: data.access, isAuthenticated: true });
        return { success: true };
      }
      return { success: false, message: 'Credenciales incorrectas' };
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, message: 'Error de red' };
    }
  },

  signup: async (username, password) => {
    try {
      const response = await fetch(`${API_URL}register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, message: data.username ? 'El usuario ya existe' : 'Error al registrarse' };
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      return { success: false, message: 'Error de red al registrarse' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, isAuthenticated: false });
  },
}));