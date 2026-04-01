import { PlusCircle, Mail, Phone, Edit3, Eye, Trash2 } from 'lucide-react';
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

export default function ClientesTab({ clientes, setModalCliente, setModalEditarCliente, setModalDetalheCliente, onExcluido }) {
  const { theme } = useTheme();

  const cardStyle = {
    backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px'
  };
  const btnPrimary = {
    padding: '10px 20px', backgroundColor: theme.accent, color: '#FFFFFF',
    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
  };

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
        <h2 style={{ color: theme.text, fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Clientes</h2>
        <button onClick={() => setModalCliente(true)} className="btn-primary" style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Novo Cliente
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
        {clientes.map(c => (
          <div key={c.id} className="card-interactive" style={{ ...cardStyle, cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => setModalDetalheCliente(c)}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.border}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ color: theme.text, fontWeight: 600, margin: '0 0 6px', fontSize: '16px' }}>{c.nome}</p>
                {c.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Mail size={12} color={theme.textSecondary} />
                    <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>{c.email}</p>
                  </div>
                )}
                {c.telefone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={12} color={theme.textSecondary} />
                    <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>{formatarTelefone(c.telefone)}</p>
                  </div>
                )}
              </div>
              <div style={{
                padding: '8px 14px', backgroundColor: theme.bg, borderRadius: '8px',
                border: `1px solid ${theme.border}`, textAlign: 'center'
              }}>
                <p style={{ color: theme.textSecondary, fontSize: '10px', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código de Acesso</p>
                <p style={{ color: theme.accent, fontSize: '14px', fontWeight: 700, margin: 0, fontFamily: 'monospace' }}>
                  {c.codigo_acesso}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border}`, paddingTop: '10px' }}>
              <span style={{ color: theme.textSecondary, fontSize: '11px' }}>
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
                  padding: '6px 10px', backgroundColor: theme.accentBg, border: 'none',
                  borderRadius: '6px', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                }}>
                  <Eye size={12} /> Detalhes
                </button>
                <button onClick={(e) => excluirCliente(e, c)} className="btn-secondary" style={{
                  padding: '6px 10px', backgroundColor: theme.accentBg, border: 'none',
                  borderRadius: '6px', color: theme.accent, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
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
