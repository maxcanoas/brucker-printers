import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRoute = error.config?.url?.includes('/auth/');
    if (error.response?.status === 401 && !isLoginRoute) {
      let destino = '/cliente';
      try {
        const usuarioSalvo = JSON.parse(localStorage.getItem('usuario') || 'null');
        if (usuarioSalvo?.tipo === 'tecnico') destino = '/tecnico';
        else if (usuarioSalvo?.tipo === 'admin') destino = '/admin';
      } catch {
        // fallback para /cliente
      }
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = destino;
    }
    return Promise.reject(error);
  }
);

export default api;
