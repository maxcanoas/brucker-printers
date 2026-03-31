import { PlusCircle, Mail, Phone, Edit3, Eye, Trash2 } from 'lucide-react';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

const cardStyle = {
  backgroundColor: '#141920', borderRadius: '12px', border: '1px solid #1E2533', padding: '24px'
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#E84C1E', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
};

export default function ClientesTab({ clientes, setModalCliente, setModalEditarCliente, setModalDetalheCliente, onExcluido }) {
  const excluirCliente = async (e, cliente) => {
    e.stopPropagation();
    if (!confirm(`Excluir o cliente "${cliente.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/clientes/${cliente.id}`);
      toast.success('Cliente excluído!');
      onExcluido();
    } catch {
      toast.error('Erro ao excluir cliente');
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Clientes</h2>
        <button onClick={() => setModalCliente(true)} className="btn-primary" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Novo Cliente
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {clientes.map(c => (
          <div key={c.id} className="card-interactive" style={{ ...cardStyle, cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => setModalDetalheCliente(c)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#E84C1E'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1E2533'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ color: '#FFFFFF', fontWeight: 600, margin: '0 0 6px', fontSize: '16px' }}>{c.nome}</p>
                {c.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Mail size={12} color="#8A94A6" />
                    <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{c.email}</p>
                  </div>
                )}
                {c.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color="#8A94A6" />
                    <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{formatarTelefone(c.telefone)}</p>
                  </div>
                )}
              </div>
              <div style={{
                padding: '8px 14px', backgroundColor: '#0D1117', borderRadius: '8px',
                border: '1px solid #1E2533', textAlign: 'center'
              }}>
                <p style={{ color: '#8A94A6', fontSize: '10px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código de Acesso</p>
                <p style={{ color: '#E84C1E', fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                  {c.codigo_acesso}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1E2533', paddingTop: '10px' }}>
              <span style={{ color: '#8A94A6', fontSize: '11px' }}>
                Cadastrado em {new Date(c.criado_em).toLocaleDateString('pt-BR')}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={(e) => { e.stopPropagation(); setModalEditarCliente(c); }} className="btn-secondary" style={{
                  padding: '6px 10px', backgroundColor: 'rgba(77, 142, 245, 0.15)', border: 'none',
                  borderRadius: '6px', color: '#4D8EF5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}>
                  <Edit3 size={12} /> Editar
                </button>
                <button onClick={(e) => { e.stopPropagation(); setModalDetalheCliente(c); }} className="btn-secondary" style={{
                  padding: '6px 10px', backgroundColor: 'rgba(232, 76, 30, 0.15)', border: 'none',
                  borderRadius: '6px', color: '#E84C1E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}>
                  <Eye size={12} /> Detalhes
                </button>
                <button onClick={(e) => excluirCliente(e, c)} className="btn-secondary" style={{
                  padding: '6px 10px', backgroundColor: 'rgba(232, 76, 30, 0.15)', border: 'none',
                  borderRadius: '6px', color: '#E84C1E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}>
                  <Trash2 size={12} /> Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
