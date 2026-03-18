import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function LoginCliente() {
  const [codigo, setCodigo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { loginCliente } = useAuth();
  const navigate = useNavigate();

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
      backgroundColor: '#0D1117',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#141920',
        borderRadius: '16px',
        border: '1px solid #1E2533',
        padding: '48px',
        width: '100%',
        maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFFFFF',
            marginBottom: '8px'
          }}>
            BRUCKER <span style={{ color: '#E84C1E' }}>PRINTERS</span>
          </h1>
          <p style={{ color: '#8A94A6', fontSize: '14px' }}>
            Área do Cliente — Sistema de Chamados
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            color: '#8A94A6',
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: 500
          }}>
            Código de Acesso
          </label>
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ex: BRK-A1B2C3D4"
            style={{
              width: '100%',
              padding: '14px 16px',
              backgroundColor: '#0D1117',
              border: '1px solid #1E2533',
              borderRadius: '8px',
              color: '#FFFFFF',
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
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#E84C1E',
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
          color: '#8A94A6',
          fontSize: '12px',
          marginTop: '24px'
        }}>
          Não tem o código? Entre em contato com a Brucker Printers.
        </p>
      </div>
    </div>
  );
}
