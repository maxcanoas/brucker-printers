import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { StatusBadge, UrgenciaBadge } from '../../../components/StatusBadge';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Printer, FileText, Copy, RefreshCw } from 'lucide-react';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

export default function ModalDetalheCliente({ cliente, onClose, onAtualizado }) {
  const [detalhes, setDetalhes] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [gerandoCodigo, setGerandoCodigo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (cliente) {
      setCopiado(false);
      api.get(`/clientes/${cliente.id}`).then(res => setDetalhes(res.data)).catch(() => toast.error('Erro ao carregar detalhes do cliente'));
      api.get(`/chamados?cliente_id=${cliente.id}`).then(res => setChamados(res.data?.data || [])).catch(() => { setChamados([]); toast.error('Erro ao carregar chamados do cliente'); });
    } else {
      setDetalhes(null);
      setChamados([]);
    }
  }, [cliente]);

  const copiarCodigo = async () => {
    const codigo = detalhes?.codigo_acesso || cliente?.codigo_acesso;
    if (codigo) {
      try {
        await navigator.clipboard.writeText(codigo);
        setCopiado(true);
        toast.success('Código copiado!');
        setTimeout(() => setCopiado(false), 3000);
      } catch {
        toast.error('Erro ao copiar');
      }
    }
  };

  const gerarNovoCodigo = async () => {
    if (!confirm('Gerar um novo código de acesso? O código anterior será invalidado.')) return;
    setGerandoCodigo(true);
    try {
      const { data } = await api.post(`/clientes/${cliente.id}/novo-codigo`);
      setDetalhes(prev => prev ? { ...prev, codigo_acesso: data.codigo_acesso } : prev);
      toast.success(`Novo código gerado: ${data.codigo_acesso}`);
      onAtualizado();
    } catch {
      toast.error('Erro ao gerar novo código');
    } finally {
      setGerandoCodigo(false);
    }
  };

  const codigoAtual = detalhes?.codigo_acesso || cliente?.codigo_acesso;

  return (
    <Modal isOpen={!!cliente} onClose={onClose} title={`Cliente: ${cliente?.nome}`} width="700px">
      {cliente && (
        <div>
          {/* Código de Acesso - Destaque */}
          <div style={{
            padding: '20px', backgroundColor: '#0D1117', borderRadius: '12px',
            border: '2px solid #E84C1E', marginBottom: '24px', textAlign: 'center'
          }}>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Código de Acesso do Cliente
            </p>
            <p style={{
              color: '#E84C1E', fontSize: '28px', fontWeight: 700, margin: '0 0 16px',
              fontFamily: 'monospace', letterSpacing: '2px'
            }}>
              {codigoAtual}
            </p>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 16px' }}>
              O cliente usa este código para fazer login e abrir chamados
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={copiarCodigo} className="btn-secondary" style={{
                padding: '10px 20px', backgroundColor: copiado ? 'rgba(61, 158, 107, 0.2)' : 'rgba(77, 142, 245, 0.15)',
                border: '1px solid ' + (copiado ? '#3D9E6B' : '#4D8EF5'), borderRadius: '8px',
                color: copiado ? '#3D9E6B' : '#4D8EF5', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                <Copy size={14} /> {copiado ? 'Copiado!' : 'Copiar Código'}
              </button>
              <button onClick={gerarNovoCodigo} disabled={gerandoCodigo} className="btn-secondary" style={{
                padding: '10px 20px', backgroundColor: 'rgba(201, 162, 39, 0.15)',
                border: '1px solid #C9A227', borderRadius: '8px',
                color: '#C9A227', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                opacity: gerandoCodigo ? 0.6 : 1, fontFamily: "'Barlow', sans-serif"
              }}>
                <RefreshCw size={14} /> {gerandoCodigo ? 'Gerando...' : 'Gerar Novo Código'}
              </button>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Nome</p>
              <p style={{ color: '#FFFFFF', margin: 0, fontWeight: 600 }}>{cliente.nome}</p>
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Cadastrado em</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{new Date(cliente.criado_em).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>E-mail</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{cliente.email || 'Não informado'}</p>
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Telefone</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{cliente.telefone ? formatarTelefone(cliente.telefone) : 'Não informado'}</p>
            </div>
          </div>

          {/* Impressoras do Cliente */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} color="#E84C1E" /> Impressoras ({detalhes?.impressoras?.length || 0})
            </h3>
            {detalhes?.impressoras?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {detalhes.impressoras.map(imp => (
                  <div key={imp.id} style={{
                    padding: '12px 16px', backgroundColor: '#0D1117', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <p style={{ color: '#FFFFFF', margin: 0, fontWeight: 500 }}>{imp.modelo}</p>
                      <p style={{ color: '#8A94A6', fontSize: '12px', margin: '2px 0 0' }}>S/N: {imp.numero_serie}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
                        backgroundColor: imp.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
                        color: imp.ativo ? '#3D9E6B' : '#8A94A6'
                      }}>
                        {imp.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                      <span style={{
                        padding: '3px 10px', borderRadius: '4px', fontSize: '11px',
                        backgroundColor: 'rgba(77,142,245,0.15)', color: '#4D8EF5'
                      }}>
                        {imp.tipo_contrato}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#8A94A6', fontSize: '13px', fontStyle: 'italic' }}>Nenhuma impressora cadastrada</p>
            )}
          </div>

          {/* Chamados Recentes */}
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#E84C1E" /> Chamados Recentes ({chamados.length})
            </h3>
            {chamados.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {chamados.slice(0, 5).map(ch => (
                  <div key={ch.id} style={{
                    padding: '12px 16px', backgroundColor: '#0D1117', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '13px' }}>#{ch.numero}</span>
                      <StatusBadge status={ch.status} />
                      <UrgenciaBadge urgencia={ch.urgencia} />
                    </div>
                    <span style={{ color: '#8A94A6', fontSize: '12px' }}>
                      {new Date(ch.criado_em).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))}
                {chamados.length > 5 && (
                  <p style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', margin: '8px 0 0' }}>
                    + {chamados.length - 5} chamado(s) anteriores
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: '#8A94A6', fontSize: '13px', fontStyle: 'italic' }}>Nenhum chamado aberto</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
