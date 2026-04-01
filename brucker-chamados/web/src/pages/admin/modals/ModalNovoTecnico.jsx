import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export default function ModalNovoTecnico({ isOpen, onClose, onCriado }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', senha: '' });
  const [salvando, setSalvando] = useState(false);

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
    if (!form.nome || !form.email || !form.senha) {
      toast.error('Nome, email e senha são obrigatórios');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/tecnicos', form);
      toast.success('Técnico criado!');
      setForm({ nome: '', email: '', whatsapp: '', senha: '' });
      onCriado();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Técnico">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
          <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail *</label>
          <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
          <input value={formatarTelefone(form.whatsapp)} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Senha *</label>
          <input type="password" value={form.senha} onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))} style={inputStyle} />
        </div>
        <LoadingButton type="submit" loading={salvando} loadingText="Criando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
          Criar Técnico
        </LoadingButton>
      </form>
    </Modal>
  );
}
