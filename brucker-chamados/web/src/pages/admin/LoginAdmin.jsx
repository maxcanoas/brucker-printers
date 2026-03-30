import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react';

export default function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { loginAdmin, usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Se já está logado como admin, vai direto ao dashboard
  // Se está logado como outro tipo, limpa a sessão para permitir login admin
  useEffect(() => {
    if (usuario) {
      if (usuario.tipo === 'admin') {
        navigate('/admin/dashboard');
      } else {
        logout();
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) return;

    setCarregando(true);
    try {
      await loginAdmin(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/admin/dashboard');
    } catch {
      toast.error('Credenciais inválidas');
    } finally {
      setCarregando(false);
    }
  };

  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    if (!emailRecuperacao) return;
    setEnviando(true);
    try {
      await api.post('/auth/esqueci-senha', { email: emailRecuperacao });
      toast.success('Se o e-mail estiver cadastrado, você receberá um link de redefinição.');
      setModoEsqueciSenha(false);
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', backgroundColor: '#0D1117',
    border: '1px solid #1E2533', borderRadius: '8px', color: '#FFFFFF',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif", marginBottom: '16px'
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0D1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#141920', borderRadius: '16px', border: '1px solid #1E2533',
        padding: '48px', width: '100%', maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '56px', height: 'auto', margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '24px',
            fontWeight: 700, color: '#FFFFFF', marginBottom: '8px'
          }}>
            Painel Administrativo
          </h1>
          <p style={{ color: '#8A94A6', fontSize: '14px' }}>Brucker Printers</p>
        </div>

        {!modoEsqueciSenha ? (
          <>
            <form onSubmit={handleSubmit}>
              <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bruckerprinters.com.br" style={inputStyle} />

              <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••" style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{
                  position: 'absolute', right: '12px', top: '14px', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '0', display: 'flex'
                }}>
                  {mostrarSenha ? <EyeOff size={18} color="#8A94A6" /> : <Eye size={18} color="#8A94A6" />}
                </button>
              </div>

              <button type="submit" disabled={carregando} className="btn-primary" style={{
                width: '100%', padding: '14px', backgroundColor: '#E84C1E', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                cursor: carregando ? 'not-allowed' : 'pointer', opacity: carregando ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: "'Barlow', sans-serif", marginTop: '8px'
              }}>
                <LogIn size={18} />
                {carregando ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <button onClick={() => setModoEsqueciSenha(true)} style={{
              display: 'block', width: '100%', textAlign: 'center', background: 'none',
              border: 'none', color: '#555D6B', fontSize: '13px', marginTop: '20px',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
            }}>
              Esqueci minha senha
            </button>
          </>
        ) : (
          <>
            <p style={{ color: '#8A94A6', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              Informe seu e-mail para receber o link de redefinição de senha.
            </p>
            <form onSubmit={handleEsqueciSenha}>
              <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input type="email" value={emailRecuperacao} onChange={(e) => setEmailRecuperacao(e.target.value)}
                placeholder="seu-email@exemplo.com" required style={inputStyle} />

              <button type="submit" disabled={enviando} className="btn-primary" style={{
                width: '100%', padding: '14px', backgroundColor: '#E84C1E', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
                fontFamily: "'Barlow', sans-serif"
              }}>
                {enviando ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>

            <button onClick={() => setModoEsqueciSenha(false)} style={{
              display: 'block', width: '100%', textAlign: 'center', background: 'none',
              border: 'none', color: '#555D6B', fontSize: '13px', marginTop: '20px',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
            }}>
              Voltar ao login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
