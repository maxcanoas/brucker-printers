import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff, Sun, Moon } from 'lucide-react';

export default function LoginTecnico() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { loginTecnico, usuario, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      if (usuario.tipo === 'tecnico') {
        navigate('/tecnico/dashboard');
      } else {
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !senha) return;

    setCarregando(true);
    try {
      await loginTecnico(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate('/tecnico/dashboard');
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
    width: '100%', padding: '14px 16px', backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text,
    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif", marginBottom: '16px'
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
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
        backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`,
        padding: '48px', width: '100%', maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '56px', height: 'auto', margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif", fontSize: '24px',
            fontWeight: 700, color: theme.text, marginBottom: '8px'
          }}>
            Área do Técnico
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Acesso temporário via web</p>
        </div>

        {!modoEsqueciSenha ? (
          <>
            <form onSubmit={handleSubmit}>
              <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tecnico@bruckerprinters.com.br" style={inputStyle} />

              <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input type={mostrarSenha ? 'text' : 'password'} value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••" style={{ ...inputStyle, paddingRight: '48px' }} />
                <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)} style={{
                  position: 'absolute', right: '12px', top: '14px', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '0', display: 'flex'
                }}>
                  {mostrarSenha ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
                </button>
              </div>

              <button type="submit" disabled={carregando} className="btn-primary" style={{
                width: '100%', padding: '14px', backgroundColor: theme.accent, color: '#FFFFFF',
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
              border: 'none', color: theme.textSecondary, fontSize: '13px', marginTop: '20px',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif", opacity: 0.6
            }}>
              Esqueci minha senha
            </button>
          </>
        ) : (
          <>
            <p style={{ color: theme.textSecondary, fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
              Informe seu e-mail para receber o link de redefinição de senha.
            </p>
            <form onSubmit={handleEsqueciSenha}>
              <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                E-mail
              </label>
              <input type="email" value={emailRecuperacao} onChange={(e) => setEmailRecuperacao(e.target.value)}
                placeholder="seu-email@exemplo.com" required style={inputStyle} />

              <button type="submit" disabled={enviando} className="btn-primary" style={{
                width: '100%', padding: '14px', backgroundColor: theme.accent, color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
                fontFamily: "'Barlow', sans-serif"
              }}>
                {enviando ? 'Enviando...' : 'Enviar Link'}
              </button>
            </form>

            <button onClick={() => setModoEsqueciSenha(false)} style={{
              display: 'block', width: '100%', textAlign: 'center', background: 'none',
              border: 'none', color: theme.textSecondary, fontSize: '13px', marginTop: '20px',
              cursor: 'pointer', fontFamily: "'Barlow', sans-serif", opacity: 0.6
            }}>
              Voltar ao login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
