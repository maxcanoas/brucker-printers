import { useState, useEffect } from 'react';
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

export default function ModalEditarCliente({ cliente, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || ''
      });
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/clientes/${cliente.id}`, form);
      toast.success('Cliente atualizado!');
      onAtualizado();
    } catch {
      toast.error('Erro ao atualizar cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!cliente} onClose={onClose} title="Editar Cliente">
      {cliente && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Telefone</label>
            <input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} style={inputStyle} />
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
            Salvar Alterações
          </LoadingButton>
        </form>
      )}
    </Modal>
  );
}
