import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export default function TecnicosTab({ tecnicos, setModalTecnico, setModalEditarTecnico, onExcluido }) {
  const { theme } = useTheme();

  const cardStyle = {
    backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px'
  };
  const btnPrimary = {
    padding: '10px 20px', backgroundColor: theme.accent, color: '#FFFFFF',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
  };

  const excluirTecnico = async (tecnico) => {
    if (!confirm(`Excluir o técnico "${tecnico.nome}"?`)) return;
    try {
      await api.delete(`/tecnicos/${tecnico.id}`);
      toast.success('Técnico excluído!');
      onExcluido();
    } catch {
      toast.error('Erro ao excluir técnico');
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: theme.text, fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Técnicos</h2>
        <button onClick={() => setModalTecnico(true)} className="btn-primary" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Novo Técnico
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {tecnicos.map(t => (
          <div key={t.id} className="card-interactive" style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: theme.text, fontWeight: 600, margin: '0 0 4px' }}>{t.nome}</p>
                <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 2px' }}>{t.email}</p>
                <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>{formatarTelefone(t.whatsapp)}</p>
              </div>
              <span style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                backgroundColor: t.ativo ? 'rgba(61, 158, 107, 0.15)' : 'rgba(138, 148, 166, 0.15)',
                color: t.ativo ? '#3D9E6B' : theme.textSecondary
              }}>
                {t.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${theme.border}` }}>
              <button onClick={() => setModalEditarTecnico(t)} className="btn-secondary" style={{
                padding: '6px 12px', backgroundColor: 'rgba(77, 142, 245, 0.15)', border: 'none',
                borderRadius: '6px', color: '#4D8EF5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                fontFamily: "'Barlow', sans-serif"
              }}>
                <Edit3 size={12} /> Editar
              </button>
              <button onClick={() => excluirTecnico(t)} className="btn-secondary" style={{
                padding: '6px 12px', backgroundColor: theme.accentBg, border: 'none',
                borderRadius: '6px', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                fontFamily: "'Barlow', sans-serif"
              }}>
                <Trash2 size={12} /> Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
