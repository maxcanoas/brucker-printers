import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

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

export default function ModalEditarTecnico({ tecnico, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', whatsapp: '', ativo: true });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tecnico) {
      setForm({ nome: tecnico.nome || '', whatsapp: tecnico.whatsapp || '', ativo: tecnico.ativo !== false });
    }
  }, [tecnico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/tecnicos/${tecnico.id}`, form);
      toast.success('Técnico atualizado!');
      onAtualizado();
    } catch {
      toast.error('Erro ao atualizar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!tecnico} onClose={onClose} title="Editar Técnico">
      {tecnico && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input value={tecnico.email} disabled style={{ ...inputStyle, opacity: 0.5 }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
            <input value={formatarTelefone(form.whatsapp)} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: true }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: form.ativo ? '#3D9E6B' : '#1E2533',
                backgroundColor: form.ativo ? 'rgba(61, 158, 107, 0.15)' : 'transparent',
                color: form.ativo ? '#3D9E6B' : '#8A94A6', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                Ativo
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: false }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: !form.ativo ? '#E84C1E' : '#1E2533',
                backgroundColor: !form.ativo ? 'rgba(232, 76, 30, 0.15)' : 'transparent',
                color: !form.ativo ? '#E84C1E' : '#8A94A6', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                Inativo
              </button>
            </div>
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
            Salvar Alterações
          </LoadingButton>
        </form>
      )}
    </Modal>
  );
}
