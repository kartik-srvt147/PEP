import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Register
  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      set({ user: data, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ error: 'Logout failed', isLoading: false });
    }
  },

  // Check auth status (persistent login)
  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  // Clear errors manually if needed
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
