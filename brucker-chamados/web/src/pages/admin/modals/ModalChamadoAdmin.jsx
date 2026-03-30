import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { StatusBadge, UrgenciaBadge } from '../../../components/StatusBadge';
import { SlaIndicator } from '../../../components/SlaIndicator';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

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

export default function ModalChamadoAdmin({ chamado, tecnicos, onClose, onAtualizado }) {
  const [detalhes, setDetalhes] = useState(null);
  const [status, setStatus] = useState('');
  const [tecnicoId, setTecnicoId] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (chamado) {
      api.get(`/chamados/${chamado.id}`).then(res => {
        setDetalhes(res.data);
        setStatus(res.data.status);
        setTecnicoId(res.data.tecnico_id || '');
      }).catch(() => toast.error('Erro ao carregar detalhes do chamado'));
    } else {
      setDetalhes(null);
    }
  }, [chamado]);

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await api.put(`/chamados/${chamado.id}`, { status, tecnico_id: tecnicoId || null, observacao });

      // Se atribuiu técnico novo
      if (tecnicoId && tecnicoId !== detalhes?.tecnico_id) {
        await api.put(`/chamados/${chamado.id}/atribuir`, { tecnico_id: tecnicoId });
      }

      toast.success('Chamado atualizado!');
      onAtualizado();
    } catch {
      toast.error('Erro ao atualizar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!chamado} onClose={onClose} title={`Chamado #${chamado?.numero}`} width="700px">
      {detalhes ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Cliente</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{detalhes.clientes?.nome}</p>
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Tipo / Urgência</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ color: '#FFFFFF' }}>{detalhes.tipo}</span>
                <UrgenciaBadge urgencia={detalhes.urgencia} />
              </div>
            </div>
            {detalhes.impressoras && (
              <>
                <div>
                  <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Impressora</p>
                  <p style={{ color: '#FFFFFF', margin: 0 }}>{detalhes.impressoras.modelo}</p>
                </div>
                <div>
                  <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>N° Série</p>
                  <p style={{ color: '#FFFFFF', margin: 0 }}>{detalhes.impressoras.numero_serie}</p>
                </div>
              </>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Descrição</p>
            <p style={{ color: '#FFFFFF', margin: 0, lineHeight: 1.6 }}>{detalhes.descricao}</p>
          </div>

          <SlaIndicator slaVenceEm={detalhes.sla_vence_em} slaPausadoEm={detalhes.sla_pausado_em} status={detalhes.status} />

          <div style={{ borderTop: '1px solid #1E2533', marginTop: '20px', paddingTop: '20px' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '16px' }}>Atualizar Chamado</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="aberto">Aberto</option>
                  <option value="atribuido">Atribuído</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="aguardando_peca">Aguardando Peça</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Técnico</label>
                <select value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">Selecionar técnico...</option>
                  {tecnicos.filter(t => t.ativo).map(t => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Observação</label>
              <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)}
                placeholder="Observação opcional..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <LoadingButton onClick={handleSalvar} loading={salvando} loadingText="Salvando..." className="btn-primary" style={{
              ...btnPrimary, width: '100%'
            }}>
              Salvar Alterações
            </LoadingButton>
          </div>

          {/* Avaliação */}
          {detalhes.avaliacoes?.length > 0 && (
            <div style={{
              marginTop: '24px', padding: '16px', backgroundColor: '#0D1117',
              borderRadius: '12px', border: '1px solid #1E2533'
            }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={16} color="#C9A227" /> Avaliação do Cliente
              </h3>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={20}
                    fill={i <= detalhes.avaliacoes[0].nota ? '#C9A227' : 'transparent'}
                    color="#C9A227"
                  />
                ))}
                <span style={{ color: '#FFFFFF', marginLeft: '8px', fontWeight: 600 }}>{detalhes.avaliacoes[0].nota}/5</span>
              </div>
              {detalhes.avaliacoes[0].comentario && (
                <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
                  "{detalhes.avaliacoes[0].comentario}"
                </p>
              )}
            </div>
          )}

          {/* Histórico */}
          {detalhes.chamado_atualizacoes?.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '12px' }}>Histórico</h3>
              {detalhes.chamado_atualizacoes
                .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
                .map(at => (
                  <div key={at.id} style={{
                    padding: '12px', backgroundColor: '#0D1117', borderRadius: '8px',
                    marginBottom: '8px', borderLeft: '3px solid #E84C1E'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <StatusBadge status={at.status_novo} />
                      <span style={{ color: '#8A94A6', fontSize: '12px' }}>
                        {new Date(at.criado_em).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {at.observacao && <p style={{ color: '#8A94A6', fontSize: '13px', margin: '8px 0 0' }}>{at.observacao}</p>}
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        <p style={{ color: '#8A94A6', textAlign: 'center' }}>Carregando...</p>
      )}
    </Modal>
  );
}
