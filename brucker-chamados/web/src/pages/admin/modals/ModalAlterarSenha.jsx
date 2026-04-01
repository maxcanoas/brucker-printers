import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function ModalAlterarSenha({ isOpen, onClose }) {
  const { theme } = useTheme();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrar, setMostrar] = useState({ atual: false, nova: false, confirmar: false });

  const inputStyle = {
    width: '100%', padding: '12px 14px', backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif"
  };
  const btnPrimary = {
    padding: '10px 20px', backgroundColor: theme.accent, color: '#FFFFFF',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      return toast.error('As senhas não coincidem');
    }
    if (novaSenha.length < 6) {
      return toast.error('A nova senha deve ter no mínimo 6 caracteres');
    }
    setSalvando(true);
    try {
      await api.put('/auth/alterar-senha', { senha_atual: senhaAtual, nova_senha: novaSenha });
      toast.success('Senha alterada com sucesso');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setSalvando(false);
    }
  };

  const toggleIcon = (field) => (
    <button type="button" onClick={() => setMostrar(prev => ({ ...prev, [field]: !prev[field] }))} style={{
      position: 'absolute', right: '12px', top: '12px', background: 'none',
      border: 'none', cursor: 'pointer', padding: 0, display: 'flex'
    }}>
      {mostrar[field] ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Senha">
      <form onSubmit={handleSubmit}>
        <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Senha Atual</label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input type={mostrar.atual ? 'text' : 'password'} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('atual')}
        </div>

        <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nova Senha</label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input type={mostrar.nova ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('nova')}
        </div>

        <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Confirmar Nova Senha</label>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input type={mostrar.confirmar ? 'text' : 'password'} value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('confirmar')}
        </div>

        <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." className="btn-primary" style={{
          ...btnPrimary, width: '100%'
        }}>
          Alterar Senha
        </LoadingButton>
      </form>
    </Modal>
  );
}
