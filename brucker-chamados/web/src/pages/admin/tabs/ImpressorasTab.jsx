import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Printer, PlusCircle } from 'lucide-react';
import ModalNovaImpressora from '../modals/ModalNovaImpressora';

const cardStyle = {
  backgroundColor: '#141920', borderRadius: '12px', border: '1px solid #1E2533', padding: '24px'
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#E84C1E', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
};

export default function ImpressorasTab() {
  const [impressoras, setImpressoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modalNova, setModalNova] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/impressoras').then(r => setImpressoras(r.data)),
      api.get('/clientes').then(r => setClientes(r.data))
    ]).catch(() => toast.error('Erro ao carregar impressoras'));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Impressoras</h2>
        <button onClick={() => setModalNova(true)} className="btn-primary" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Nova Impressora
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {impressoras.map(imp => (
          <div key={imp.id} className="card-interactive" style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Printer size={20} color="#E84C1E" />
              <div>
                <p style={{ color: '#FFFFFF', fontWeight: 600, margin: 0 }}>{imp.modelo}</p>
                <p style={{ color: '#8A94A6', fontSize: '12px', margin: 0 }}>S/N: {imp.numero_serie}</p>
              </div>
            </div>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '4px 0' }}>
              Cliente: {imp.clientes?.nome || 'N/A'}
            </p>
            <span style={{
              padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
              backgroundColor: imp.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
              color: imp.ativo ? '#3D9E6B' : '#8A94A6'
            }}>
              {imp.ativo ? 'Ativa' : 'Inativa'}
            </span>
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
    </div>
  );
}
