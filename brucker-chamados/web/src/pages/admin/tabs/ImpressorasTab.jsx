import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Printer, PlusCircle, PowerOff, RefreshCw, Edit3 } from 'lucide-react';
import ModalNovaImpressora from '../modals/ModalNovaImpressora';
import ModalEditarImpressora from '../modals/ModalEditarImpressora';
import { useTheme } from '../../../contexts/ThemeContext';

export default function ImpressorasTab() {
  const { theme } = useTheme();
  const [impressoras, setImpressoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modalNova, setModalNova] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  const cardStyle = {
    backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px'
  };
  const btnPrimary = {
    padding: '10px 20px', backgroundColor: theme.accent, color: '#FFFFFF',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
  };

  const desativarImpressora = async (imp) => {
    if (!confirm(`Desativar a impressora "${imp.modelo}" (S/N: ${imp.numero_serie})?`)) return;
    try {
      await api.put(`/impressoras/${imp.id}/desativar`);
      toast.success('Impressora desativada!');
      api.get('/impressoras').then(r => setImpressoras(r.data));
    } catch {
      toast.error('Erro ao desativar impressora');
    }
  };

  const reativarImpressora = async (imp) => {
    try {
      await api.put(`/impressoras/${imp.id}/reativar`);
      toast.success('Impressora reativada!');
      api.get('/impressoras').then(r => setImpressoras(r.data));
    } catch {
      toast.error('Erro ao reativar impressora');
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/impressoras').then(r => setImpressoras(r.data)),
      api.get('/clientes').then(r => setClientes(r.data))
    ]).catch(() => toast.error('Erro ao carregar impressoras'));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: theme.text, fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Impressoras</h2>
        <button onClick={() => setModalNova(true)} className="btn-primary" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Nova Impressora
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {impressoras.map(imp => (
          <div key={imp.id} className="card-interactive" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Printer size={20} color={theme.accent} />
              <div>
                <p style={{ color: theme.text, fontWeight: 600, margin: 0 }}>{imp.modelo}</p>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: 0 }}>S/N: {imp.numero_serie}</p>
              </div>
            </div>
            <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '4px 0' }}>
              Cliente: {imp.clientes?.nome || 'N/A'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.border}` }}>
              <span style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
                backgroundColor: imp.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
                color: imp.ativo ? '#3D9E6B' : theme.textSecondary
              }}>
                {imp.ativo ? 'Ativa' : 'Inativa'}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setModalEditar(imp)} className="btn-secondary" style={{
                  padding: '6px 10px', backgroundColor: theme.accentBg, border: 'none',
                  borderRadius: '6px', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                  fontFamily: "'Barlow', sans-serif"
                }}>
                  <Edit3 size={12} /> Editar
                </button>
                {imp.ativo ? (
                  <button onClick={() => desativarImpressora(imp)} className="btn-secondary" style={{
                    padding: '6px 10px', backgroundColor: theme.accentBg, border: 'none',
                    borderRadius: '6px', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                    fontFamily: "'Barlow', sans-serif"
                  }}>
                    <PowerOff size={12} /> Desativar
                  </button>
                ) : (
                  <button onClick={() => reativarImpressora(imp)} className="btn-secondary" style={{
                    padding: '6px 10px', backgroundColor: 'rgba(61,158,107,0.15)', border: 'none',
                    borderRadius: '6px', color: '#3D9E6B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                    fontFamily: "'Barlow', sans-serif"
                  }}>
                    <RefreshCw size={12} /> Reativar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <ModalNovaImpressora
        isOpen={modalNova}
        clientes={clientes}
        onClose={() => setModalNova(false)}
        onCriada={() => {
          setModalNova(false);
          api.get('/impressoras').then(r => setImpressoras(r.data));
        }}
      />

      <ModalEditarImpressora
        impressora={modalEditar}
        clientes={clientes}
        onClose={() => setModalEditar(null)}
        onAtualizado={() => {
          setModalEditar(null);
          api.get('/impressoras').then(r => setImpressoras(r.data));
        }}
      />
    </div>
  );
}
