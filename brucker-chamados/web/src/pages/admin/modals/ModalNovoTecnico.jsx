import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '12px 14px', backgroundColor: '#0D1117',
  border: '1px solid #1E2533', borderRadius: '8px', color: '#FFFFFF',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Barlow', sans-serif"
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#E84C1E', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
};

export default function ModalNovoTecnico({ isOpen, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', senha: '' });
  const [salvando, setSalvando] = useState(false);

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
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
          <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail *</label>
          <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="51999999999" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Senha *</label>
          <input type="password" value={form.senha} onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))} style={inputStyle} />
        </div>
        <LoadingButton type="submit" loading={salvando} loadingText="Criando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
          Criar Técnico
        </LoadingButton>
      </form>
    </Modal>
  );
}
