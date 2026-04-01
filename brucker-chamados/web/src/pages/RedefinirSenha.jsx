import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Sun, Moon } from 'lucide-react';

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sessaoValida, setSessaoValida] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const { theme, themeMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessaoValida(true);
      }
      setVerificando(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessaoValida(true);
      }
      setVerificando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      return toast.error('As senhas não coincidem');
    }
    if (novaSenha.length < 6) {
      return toast.error('A senha deve ter no mínimo 6 caracteres');
    }

    setSalvando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;

      toast.success('Senha redefinida com sucesso!');
      await supabase.auth.signOut();
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error) {
      toast.error(error.message || 'Erro ao redefinir senha');
    } finally {
      setSalvando(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', paddingRight: '48px', backgroundColor: theme.inputBg,
    border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text,
    fontSize: '15px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif"
  };

  const themeBtn = (
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
  );

  if (verificando) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative'
      }}>
        {themeBtn}
        <p style={{ color: theme.textSecondary, fontSize: '16px', fontFamily: "'Barlow', sans-serif" }}>Verificando...</p>
      </div>
    );
  }

  if (!sessaoValida) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: theme.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        position: 'relative'
      }}>
        {themeBtn}
        <div style={{
          backgroundColor: theme.card, borderRadius: '16px', border: `1px solid ${theme.border}`,
          padding: '48px', width: '100%', maxWidth: '440px', textAlign: 'center'
        }}>
          <p style={{ color: theme.accent, fontSize: '16px', marginBottom: '16px', fontFamily: "'Barlow', sans-serif" }}>
            Link inválido ou expirado.
          </p>
          <p style={{ color: theme.textSecondary, fontSize: '14px', fontFamily: "'Barlow', sans-serif" }}>
            Solicite um novo link de redefinição de senha.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: theme.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      position: 'relative'
    }}>
      {themeBtn}
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
            Redefinir Senha
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px' }}>Digite sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Nova Senha
          </label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input type={mostrarNova ? 'text' : 'password'} value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)} placeholder="Mínimo 6 caracteres"
              required style={inputStyle} />
            <button type="button" onClick={() => setMostrarNova(!mostrarNova)} style={{
              position: 'absolute', right: '12px', top: '14px', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, display: 'flex'
            }}>
              {mostrarNova ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
            </button>
          </div>

          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Confirmar Nova Senha
          </label>
          <div style={{ position: 'relative', marginBottom: '24px' }}>
            <input type={mostrarConfirmar ? 'text' : 'password'} value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)} placeholder="Repita a nova senha"
              required style={inputStyle} />
            <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} style={{
              position: 'absolute', right: '12px', top: '14px', background: 'none',
              border: 'none', cursor: 'pointer', padding: 0, display: 'flex'
            }}>
              {mostrarConfirmar ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
            </button>
          </div>

          <button type="submit" disabled={salvando} style={{
            width: '100%', padding: '14px', backgroundColor: theme.accent, color: '#FFFFFF',
            border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
            cursor: salvando ? 'not-allowed' : 'pointer', opacity: salvando ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontFamily: "'Barlow', sans-serif"
          }}>
            <Lock size={18} />
            {salvando ? 'Redefinindo...' : 'Redefinir Senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
