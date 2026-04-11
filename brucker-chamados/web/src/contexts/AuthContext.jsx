import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');
    if (token && usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  const loginCliente = async (codigoAcesso) => {
    const { data } = await api.post('/auth/cliente/login', { codigo_acesso: codigoAcesso });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ ...data.cliente, tipo: 'cliente' }));
    setUsuario({ ...data.cliente, tipo: 'cliente' });
    return data;
  };

  const loginAdmin = async (email, senha) => {
    const { data } = await api.post('/auth/admin/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ ...data.admin, tipo: 'admin' }));
    setUsuario({ ...data.admin, tipo: 'admin' });
    return data;
  };

  const loginTecnico = async (email, senha) => {
    const { data } = await api.post('/auth/tecnico/login', { email, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ ...data.tecnico, tipo: 'tecnico' }));
    setUsuario({ ...data.tecnico, tipo: 'tecnico' });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, loginCliente, loginAdmin, loginTecnico, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
