import { useState, useEffect } from 'react';
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

export default function ModalEditarTecnico({ tecnico, onClose, onAtualizado }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', ativo: true });
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

  useEffect(() => {
    if (tecnico) {
      setForm({ nome: tecnico.nome || '', email: tecnico.email || '', whatsapp: tecnico.whatsapp || '', ativo: tecnico.ativo !== false });
    }
  }, [tecnico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast.error('E-mail inválido');
      return;
    }
    const emailMudou = form.email !== tecnico.email;
    setSalvando(true);
    try {
      await api.put(`/tecnicos/${tecnico.id}`, form);
      toast.success('Técnico atualizado!');
      if (emailMudou) {
        toast('Técnico precisará logar com o novo e-mail', { icon: 'ℹ️', duration: 5000 });
      }
      onAtualizado();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erro ao atualizar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!tecnico} onClose={onClose} title="Editar Técnico">
      {tecnico && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail *</label>
            <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
            <input value={formatarTelefone(form.whatsapp)} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: true }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: form.ativo ? '#3D9E6B' : theme.border,
                backgroundColor: form.ativo ? 'rgba(61, 158, 107, 0.15)' : 'transparent',
                color: form.ativo ? '#3D9E6B' : theme.textSecondary, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                Ativo
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: false }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: !form.ativo ? theme.accent : theme.border,
                backgroundColor: !form.ativo ? 'rgba(232, 76, 30, 0.15)' : 'transparent',
                color: !form.ativo ? theme.accent : theme.textSecondary, cursor: 'pointer', fontSize: '14px', fontWeight: 600,
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
