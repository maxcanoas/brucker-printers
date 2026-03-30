import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginCliente from './pages/cliente/LoginCliente';
import DashboardCliente from './pages/cliente/DashboardCliente';
import LoginAdmin from './pages/admin/LoginAdmin';
import DashboardAdmin from './pages/admin/DashboardAdmin';
import RedefinirSenha from './pages/RedefinirSenha';

function RotaProtegida({ tipo, children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) return null;
  if (!usuario) return <Navigate to={tipo === 'admin' ? '/admin' : '/cliente'} />;
  if (usuario.tipo !== tipo) return <Navigate to="/" />;

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Cliente */}
          <Route path="/cliente" element={<LoginCliente />} />
          <Route path="/cliente/dashboard" element={
            <RotaProtegida tipo="cliente"><DashboardCliente /></RotaProtegida>
          } />

          {/* Admin */}
          <Route path="/admin" element={<LoginAdmin />} />
          <Route path="/admin/dashboard" element={
            <RotaProtegida tipo="admin"><DashboardAdmin /></RotaProtegida>
          } />

          {/* Redefinir Senha */}
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/cliente" />} />
          <Route path="*" element={<Navigate to="/cliente" />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#141920',
            color: '#FFFFFF',
            border: '1px solid #1E2533',
            fontFamily: "'Barlow', sans-serif",
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#3D9E6B', secondary: '#141920' },
          },
          error: {
            iconTheme: { primary: '#E84C1E', secondary: '#141920' },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
