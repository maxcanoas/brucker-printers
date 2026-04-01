import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ModalNovaImpressora({ isOpen, clientes, onClose, onCriada }) {
  const { theme } = useTheme();
  const [form, setForm] = useState({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
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
    if (!form.cliente_id || !form.modelo || !form.numero_serie) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/impressoras', form);
      toast.success('Impressora cadastrada!');
      setForm({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
      onCriada();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Impressora">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Cliente *</label>
          <select value={form.cliente_id} onChange={(e) => setForm(f => ({ ...f, cliente_id: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Selecionar...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Modelo *</label>
          <input value={form.modelo} onChange={(e) => setForm(f => ({ ...f, modelo: e.target.value }))} placeholder="Ex: Ricoh Pro C5200" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Número de Série *</label>
          <input value={form.numero_serie} onChange={(e) => setForm(f => ({ ...f, numero_serie: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Tipo de Contrato</label>
          <select value={form.tipo_contrato} onChange={(e) => setForm(f => ({ ...f, tipo_contrato: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="locacao">Locação</option>
            <option value="venda">Venda</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
        <LoadingButton type="submit" loading={salvando} loadingText="Cadastrando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
          Cadastrar Impressora
        </LoadingButton>
      </form>
    </Modal>
  );
}
