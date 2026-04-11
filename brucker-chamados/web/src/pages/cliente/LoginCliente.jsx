import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { LogIn, Sun, Moon } from 'lucide-react';

export default function LoginCliente() {
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { loginCliente, usuario, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      if (usuario.tipo === 'cliente') {
        navigate('/cliente/dashboard');
      } else {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setCarregando(true);
    try {
      await loginCliente(codigo.trim());
      toast.success('Login realizado com sucesso!');
      navigate('/cliente/dashboard');
    } catch {
      toast.error('Código de acesso inválido');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: '20px', right: '20px',
          background: 'none', border: `1px solid ${theme.border}`,
          borderRadius: '8px', padding: '8px',
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: theme.textSecondary
        }}
        title={themeMode === 'dark' ? 'Tema claro' : 'Tema escuro'}
      >
        {themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div style={{
        backgroundColor: theme.card,
        borderRadius: '16px',
        border: `1px solid ${theme.border}`,
        padding: '48px',
        width: '100%',
        maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '64px', height: 'auto', marginBottom: '16px' }} />
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: theme.text,
            marginBottom: '8px'
          }}>
            BRUCKER <span style={{ color: theme.accent }}>PRINTERS</span>
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>
            Área do Cliente — Sistema de Chamados
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            color: theme.textSecondary,
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Código de Acesso
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="Ex: BRKXXXXXXXX"
            style={{
              width: '100%',
              padding: '14px 16px',
              backgroundColor: theme.inputBg,
              border: `1px solid ${theme.border}`,
              borderRadius: '8px',
              color: theme.text,
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '24px',
              fontFamily: "'Barlow', sans-serif"
            }}
          />

          <button
            type="submit"
            disabled={carregando}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: carregando ? 'not-allowed' : 'pointer',
              opacity: carregando ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Barlow', sans-serif"
            }}
          >
            <LogIn size={18} />
            {carregando ? 'Entrando...' : 'Acessar'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          color: theme.textSecondary,
          fontSize: '12px',
          marginTop: '24px'
        }}>
          Não tem o código? Entre em contato com a Brucker Printers.
        </p>

        <Link
          to="/admin"
          style={{
            display: 'block',
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '12px',
            marginTop: '16px',
            textDecoration: 'none',
            fontFamily: "'Barlow', sans-serif",
            opacity: 0.6
          }}
        >
          Acesso Administrativo
        </Link>

        <Link
          to="/tecnico"
          style={{
            display: 'block',
            textAlign: 'center',
            color: theme.textSecondary,
            fontSize: '12px',
            marginTop: '8px',
            textDecoration: 'none',
            fontFamily: "'Barlow', sans-serif",
            opacity: 0.6
          }}
        >
          Área do Técnico
        </Link>
      </div>
    </div>
  );
}
