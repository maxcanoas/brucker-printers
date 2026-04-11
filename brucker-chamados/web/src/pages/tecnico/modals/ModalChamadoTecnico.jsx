import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../../../components/Modal';
import { StatusBadge, UrgenciaBadge } from '../../../components/StatusBadge';
import { SlaIndicator } from '../../../components/SlaIndicator';
import { LoadingButton } from '../../../components/LoadingButton';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Play, PauseCircle, FileCheck } from 'lucide-react';
import ModalRelatorioTecnico from './ModalRelatorioTecnico';

export default function ModalChamadoTecnico({ chamado, onClose, onAtualizado }) {
  const { theme } = useTheme();
  const [detalhes, setDetalhes] = useState(null);
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [modalRelatorio, setModalRelatorio] = useState(null);

  const carregar = useCallback(async () => {
    if (!chamado) return;
    try {
      const { data } = await api.get(`/chamados/${chamado.id}`);
      setDetalhes(data);
    } catch {
      toast.error('Erro ao carregar detalhes do chamado');
    }
  }, [chamado]);

  useEffect(() => {
    if (chamado) {
      carregar();
    } else {
      setDetalhes(null);
      setObservacao('');
    }
  }, [chamado, carregar]);

  const aceitarChamado = async () => {
    setSalvando(true);
    try {
      await api.put(`/chamados/${chamado.id}/aceitar`);
      toast.success('Chamado aceito!');
      await carregar();
      onAtualizado?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao aceitar chamado');
    } finally {
      setSalvando(false);
    }
  };

  const atualizarStatus = async (novoStatus) => {
    if (detalhes?.status === novoStatus) return;
    setSalvando(true);
    try {
      await api.put(`/chamados/${chamado.id}/status`, {
        status: novoStatus,
        observacao: observacao.trim() || undefined
      });
      toast.success('Status atualizado!');
      setObservacao('');
      await carregar();
      onAtualizado?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar status');
    } finally {
      setSalvando(false);
    }
  };

  const abrirRelatorio = () => {
    if (detalhes?.status === 'aguardando_peca') {
      const ok = confirm('Este chamado está aguardando peça. Deseja mesmo encerrar sem receber a peça?');
      if (!ok) return;
    }
    setModalRelatorio(detalhes);
  };

  const handleConcluido = () => {
    setModalRelatorio(null);
    onClose();
    onAtualizado?.();
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif"
  };

  const isAtribuido = detalhes?.status === 'atribuido';
  const isAtivo = detalhes && ['em_atendimento', 'aguardando_peca'].includes(detalhes.status);
  const isFinalizado = detalhes && ['concluido', 'cancelado'].includes(detalhes.status);

  return (
    <>
      <Modal isOpen={!!chamado && !modalRelatorio} onClose={onClose} title={`Chamado #${chamado?.numero}`} width="720px">
        {detalhes ? (
          <div>
            {/* Status + SLA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <StatusBadge status={detalhes.status} />
              <SlaIndicator
                slaVenceEm={detalhes.sla_vence_em}
                slaPausadoEm={detalhes.sla_pausado_em}
                status={detalhes.status}
                slaTempoRestanteMinutos={detalhes.sla_tempo_restante_minutos}
              />
            </div>

            {/* Informações */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Cliente</p>
                <p style={{ color: theme.text, margin: 0 }}>{detalhes.clientes?.nome || '—'}</p>
              </div>
              <div>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Tipo / Urgência</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: theme.text, fontSize: '14px', textTransform: 'capitalize' }}>{detalhes.tipo}</span>
                  <UrgenciaBadge urgencia={detalhes.urgencia} />
                </div>
              </div>
              {detalhes.impressoras && (
                <>
                  <div>
                    <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Impressora</p>
                    <p style={{ color: theme.text, margin: 0 }}>{detalhes.impressoras.modelo}</p>
                  </div>
                  <div>
                    <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>N° Série</p>
                    <p style={{ color: theme.text, margin: 0 }}>{detalhes.impressoras.numero_serie}</p>
                  </div>
                </>
              )}
              <div>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Aberto em</p>
                <p style={{ color: theme.text, margin: 0 }}>{new Date(detalhes.criado_em).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Descrição */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Descrição do Problema</p>
              <p style={{ color: theme.text, margin: 0, lineHeight: 1.6 }}>{detalhes.descricao}</p>
            </div>

            {/* Fotos */}
            {detalhes.fotos?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 8px' }}>Fotos</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {detalhes.fotos.map((url, i) => (
                    <img key={i} src={url} alt={`Foto ${i + 1}`}
                      onClick={() => window.open(url, '_blank')}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `1px solid ${theme.border}` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Aceitar chamado */}
            {isAtribuido && (
              <div style={{
                marginTop: '20px', padding: '20px', backgroundColor: theme.bg,
                borderRadius: '12px', border: `1px solid ${theme.border}`
              }}>
                <p style={{ color: theme.text, fontSize: '14px', fontWeight: 600, margin: '0 0 6px' }}>
                  Aceitar Chamado
                </p>
                <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 16px' }}>
                  Este chamado foi atribuído a você. Aceite para iniciar o atendimento.
                </p>
                <LoadingButton
                  onClick={aceitarChamado}
                  loading={salvando}
                  loadingText="Aceitando..."
                  style={{
                    padding: '12px 24px', backgroundColor: '#3D9E6B', color: '#FFFFFF',
                    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    fontFamily: "'Barlow', sans-serif", width: '100%'
                  }}
                >
                  <CheckCircle size={16} /> Aceitar Chamado
                </LoadingButton>
              </div>
            )}

            {/* Ações em atendimento / aguardando peça */}
            {isAtivo && (
              <div style={{
                marginTop: '20px', padding: '20px', backgroundColor: theme.bg,
                borderRadius: '12px', border: `1px solid ${theme.border}`
              }}>
                <p style={{ color: theme.text, fontSize: '14px', fontWeight: 600, margin: '0 0 16px' }}>
                  Ações
                </p>

                <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                  Observação (opcional)
                </label>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Adicionar observação ao mudar de status..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }}
                />

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <LoadingButton
                    onClick={() => atualizarStatus('em_atendimento')}
                    loading={salvando}
                    disabled={salvando || detalhes.status === 'em_atendimento'}
                    style={{
                      flex: '1 1 160px',
                      padding: '10px 16px',
                      backgroundColor: detalhes.status === 'em_atendimento' ? theme.border : '#C9A227',
                      color: '#FFFFFF',
                      border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      opacity: detalhes.status === 'em_atendimento' ? 0.5 : 1,
                      fontFamily: "'Barlow', sans-serif"
                    }}
                  >
                    <Play size={14} /> Em Atendimento
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => atualizarStatus('aguardando_peca')}
                    loading={salvando}
                    disabled={salvando || detalhes.status === 'aguardando_peca'}
                    style={{
                      flex: '1 1 160px',
                      padding: '10px 16px',
                      backgroundColor: detalhes.status === 'aguardando_peca' ? theme.border : '#E84C1E',
                      color: '#FFFFFF',
                      border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                      opacity: detalhes.status === 'aguardando_peca' ? 0.5 : 1,
                      fontFamily: "'Barlow', sans-serif"
                    }}
                  >
                    <PauseCircle size={14} /> Aguardando Peça
                  </LoadingButton>
                </div>

                <LoadingButton
                  onClick={abrirRelatorio}
                  loading={false}
                  disabled={salvando}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: '#3D9E6B',
                    color: '#FFFFFF',
                    border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    fontFamily: "'Barlow', sans-serif"
                  }}
                >
                  <FileCheck size={16} /> Encerrar e Gerar Relatório
                </LoadingButton>
              </div>
            )}

            {/* Relatório já criado */}
            {detalhes.relatorios_atendimento?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: theme.text, fontSize: '16px', marginBottom: '12px' }}>Relatório de Atendimento</h3>
                {detalhes.relatorios_atendimento.map(r => (
                  <div key={r.id} style={{
                    padding: '16px', backgroundColor: theme.bg, borderRadius: '8px',
                    border: `1px solid ${theme.border}`
                  }}>
                    <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Serviço</p>
                    <p style={{ color: theme.text, margin: '0 0 12px', lineHeight: 1.5 }}>{r.descricao_servico}</p>
                    {r.pecas_utilizadas && (
                      <>
                        <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Peças utilizadas</p>
                        <p style={{ color: theme.text, margin: '0 0 12px', lineHeight: 1.5 }}>{r.pecas_utilizadas}</p>
                      </>
                    )}
                    {r.duracao_minutos != null && (
                      <>
                        <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>Duração</p>
                        <p style={{ color: theme.text, margin: 0 }}>{r.duracao_minutos} min</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Chamado finalizado sem relatório (cancelado, etc) */}
            {isFinalizado && !detalhes.relatorios_atendimento?.length && (
              <div style={{
                marginTop: '20px', padding: '16px', backgroundColor: theme.bg,
                borderRadius: '12px', border: `1px solid ${theme.border}`, textAlign: 'center'
              }}>
                <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>
                  Chamado {detalhes.status === 'cancelado' ? 'cancelado' : 'finalizado'}.
                </p>
              </div>
            )}

            {/* Histórico */}
            {detalhes.chamado_atualizacoes?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ color: theme.text, fontSize: '16px', marginBottom: '12px' }}>Histórico</h3>
                {detalhes.chamado_atualizacoes
                  .slice()
                  .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
                  .map(at => (
                    <div key={at.id} style={{
                      padding: '12px', backgroundColor: theme.bg, borderRadius: '8px',
                      marginBottom: '8px', borderLeft: `3px solid ${theme.accent}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <StatusBadge status={at.status_novo} />
                        <span style={{ color: theme.textSecondary, fontSize: '12px' }}>
                          {new Date(at.criado_em).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {at.observacao && (
                        <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '8px 0 0' }}>{at.observacao}</p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: theme.textSecondary, textAlign: 'center' }}>Carregando...</p>
        )}
      </Modal>

      <ModalRelatorioTecnico
        chamado={modalRelatorio}
        onClose={() => setModalRelatorio(null)}
        onConcluido={handleConcluido}
      />
    </>
  );
}
