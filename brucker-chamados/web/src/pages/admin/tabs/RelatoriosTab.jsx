import { useState, useMemo } from 'react';
import { StatusBadge, UrgenciaBadge } from '../../../components/StatusBadge';
import { LoadingButton } from '../../../components/LoadingButton';
import ModalChamadoAdmin from '../modals/ModalChamadoAdmin';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';
import { FileText, FileSpreadsheet, Filter as FilterIcon } from 'lucide-react';

const STATUS_OPCOES = [
  { value: '', label: 'Todos' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'atribuido', label: 'Atribuído' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'aguardando_peca', label: 'Aguardando Peça' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

const TIPO_OPCOES = [
  { value: '', label: 'Todos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'corretivo', label: 'Corretivo' },
];

const URGENCIA_OPCOES = [
  { value: '', label: 'Todas' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const FILTROS_VAZIOS = {
  numero: '',
  inicio: '',
  fim: '',
  cliente_id: '',
  tecnico_id: '',
  status: '',
  tipo: '',
  urgencia: '',
};

export default function RelatoriosTab({ clientes = [], tecnicos = [] }) {
  const { theme } = useTheme();
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(null); // 'pdf' | 'xlsx' | null
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const cardStyle = {
    backgroundColor: theme.card,
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    padding: '24px',
  };
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: '8px',
    color: theme.text,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif",
  };
  const labelStyle = {
    color: theme.textSecondary,
    fontSize: '12px',
    display: 'block',
    marginBottom: '6px',
    fontWeight: 500,
  };
  const btnPrimary = {
    padding: '10px 20px',
    backgroundColor: theme.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Barlow', sans-serif",
  };
  const btnExport = {
    padding: '10px 16px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Barlow', sans-serif",
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };
  const thStyle = {
    color: theme.textSecondary,
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'left',
    padding: '12px 14px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    whiteSpace: 'nowrap',
  };
  const tdStyle = {
    color: theme.text,
    fontSize: '13px',
    padding: '12px 14px',
    borderBottom: `1px solid ${theme.border}`,
  };

  const setF = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setDados(null);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_VAZIOS);
    setDados(null);
  };

  const buildParams = (extra = {}) => {
    const params = new URLSearchParams();
    Object.entries({ ...filtros, ...extra }).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    return params;
  };

  const gerarRelatorio = async () => {
    setCarregando(true);
    try {
      const params = buildParams();
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/admin/relatorios/historico${query}`);
      setDados(data);
      if ((data?.chamados || []).length === 0) {
        toast('Nenhum chamado encontrado para os filtros aplicados', { icon: 'ℹ️' });
      }
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const exportar = async (formato) => {
    setExportando(formato);
    try {
      const params = buildParams({ formato });
      const response = await api.get(`/admin/relatorios/historico?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-historico.${formato === 'xlsx' ? 'xlsx' : 'pdf'}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exportado em ${formato.toUpperCase()}`);
    } catch {
      toast.error('Erro ao exportar');
    } finally {
      setExportando(null);
    }
  };

  const resumo = dados?.resumo || null;
  const chamados = dados?.chamados || [];

  const cardsResumo = useMemo(() => {
    if (!resumo) return [];
    return [
      { label: 'Total', valor: resumo.total ?? 0 },
      { label: 'Concluídos', valor: resumo.concluidos ?? 0 },
      { label: 'Dentro do SLA', valor: resumo.dentro_sla ?? 0, color: '#3D9E6B' },
      { label: 'Fora do SLA', valor: resumo.fora_sla ?? 0, color: '#E84C1E' },
      { label: '% SLA', valor: `${resumo.percentual_sla ?? 0}%` },
      { label: 'Tempo Médio', valor: resumo.tempo_medio ? `${resumo.tempo_medio} min` : '-' },
      { label: 'Avaliação Média', valor: resumo.avaliacao_media ? `${resumo.avaliacao_media} ★` : '-' },
      { label: 'Cancelados', valor: resumo.cancelados ?? 0 },
    ];
  }, [resumo]);

  const slaInfo = (c) => {
    if (c.status !== 'concluido' || !c.sla_vence_em) return { texto: '-', cor: theme.textSecondary };
    const cumprido = new Date(c.atualizado_em) <= new Date(c.sla_vence_em);
    return cumprido
      ? { texto: 'Cumprido', cor: '#3D9E6B' }
      : { texto: 'Estourado', cor: '#E84C1E' };
  };

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <h2 style={{ color: theme.text, fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Relatórios
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0 20px' }}>
          Histórico de chamados e documento de comprovação de atendimentos
        </p>
      </div>

      {/* ============ Painel de filtros ============ */}
      <div style={{ ...cardStyle, marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FilterIcon size={16} color={theme.accent} />
          <span style={{ color: theme.text, fontWeight: 600, fontSize: '14px' }}>Filtros</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}>
          <div>
            <label style={labelStyle}>Número do chamado</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Ex: 1234"
              value={filtros.numero}
              onChange={(e) => setF('numero', e.target.value.replace(/[^\d]/g, ''))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Data início</label>
            <input
              type="date"
              value={filtros.inicio}
              onChange={(e) => setF('inicio', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Data fim</label>
            <input
              type="date"
              value={filtros.fim}
              onChange={(e) => setF('fim', e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cliente</label>
            <select
              value={filtros.cliente_id}
              onChange={(e) => setF('cliente_id', e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Técnico</label>
            <select
              value={filtros.tecnico_id}
              onChange={(e) => setF('tecnico_id', e.target.value)}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {tecnicos.filter(t => t.ativo).map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              value={filtros.status}
              onChange={(e) => setF('status', e.target.value)}
              style={inputStyle}
            >
              {STATUS_OPCOES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select
              value={filtros.tipo}
              onChange={(e) => setF('tipo', e.target.value)}
              style={inputStyle}
            >
              {TIPO_OPCOES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Urgência</label>
            <select
              value={filtros.urgencia}
              onChange={(e) => setF('urgencia', e.target.value)}
              style={inputStyle}
            >
              {URGENCIA_OPCOES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <LoadingButton
            onClick={gerarRelatorio}
            loading={carregando}
            loadingText="Gerando..."
            className="btn-primary"
            style={btnPrimary}
          >
            Gerar Relatório
          </LoadingButton>
          <button onClick={limparFiltros} className="btn-ghost" style={{
            ...btnExport, border: 'none', backgroundColor: 'transparent',
          }}>
            Limpar
          </button>
        </div>
      </div>

      {/* ============ Resultado ============ */}
      {dados && (
        <>
          {/* Botões de export */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => exportar('pdf')}
              disabled={exportando !== null || chamados.length === 0}
              className="btn-ghost"
              style={{
                ...btnExport,
                opacity: chamados.length === 0 ? 0.5 : 1,
                cursor: chamados.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <FileText size={16} />
              {exportando === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
            </button>
            <button
              onClick={() => exportar('xlsx')}
              disabled={exportando !== null || chamados.length === 0}
              className="btn-ghost"
              style={{
                ...btnExport,
                opacity: chamados.length === 0 ? 0.5 : 1,
                cursor: chamados.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <FileSpreadsheet size={16} />
              {exportando === 'xlsx' ? 'Exportando...' : 'Exportar Excel'}
            </button>
          </div>

          {/* Cards de resumo */}
          {resumo && (
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <h3 style={{ color: theme.text, fontSize: '16px', margin: '0 0 16px' }}>Resumo</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
              }}>
                {cardsResumo.map(item => (
                  <div key={item.label} style={{
                    padding: '14px',
                    backgroundColor: theme.bg,
                    borderRadius: '8px',
                    border: `1px solid ${theme.border}`,
                  }}>
                    <p style={{ color: theme.textSecondary, fontSize: '11px', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {item.label}
                    </p>
                    <p style={{
                      color: item.color || theme.text,
                      fontSize: '22px',
                      fontWeight: 700,
                      margin: 0,
                    }}>
                      {item.valor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabela de chamados */}
          <div style={cardStyle}>
            <h3 style={{ color: theme.text, fontSize: '16px', margin: '0 0 16px' }}>
              Chamados encontrados ({chamados.length})
            </h3>
            {chamados.length === 0 ? (
              <p style={{ color: theme.textSecondary, textAlign: 'center', padding: '32px 0', margin: 0 }}>
                Nenhum chamado encontrado para os filtros aplicados.
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>#</th>
                      <th style={thStyle}>Cliente</th>
                      <th style={thStyle}>Impressora</th>
                      <th style={thStyle}>Técnico</th>
                      <th style={thStyle}>Tipo</th>
                      <th style={thStyle}>Urgência</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>Aberto em</th>
                      <th style={thStyle}>Concluído em</th>
                      <th style={thStyle}>SLA</th>
                      <th style={thStyle}>Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chamados.map((c, i) => {
                      const sla = slaInfo(c);
                      const relatorio = c.relatorios_atendimento?.[0];
                      const avaliacao = c.avaliacoes?.[0];
                      return (
                        <tr
                          key={c.id}
                          className="table-row"
                          onClick={() => setChamadoSelecionado(c)}
                          style={{
                            backgroundColor: i % 2 === 1 ? theme.zebraBg : 'transparent',
                            cursor: 'pointer',
                          }}
                        >
                          <td style={{ ...tdStyle, fontWeight: 600 }}>#{c.numero}</td>
                          <td style={tdStyle}>{c.clientes?.nome || '-'}</td>
                          <td style={tdStyle}>{c.impressoras?.modelo || '-'}</td>
                          <td style={tdStyle}>{c.tecnicos?.nome || '-'}</td>
                          <td style={tdStyle}>{c.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo'}</td>
                          <td style={tdStyle}><UrgenciaBadge urgencia={c.urgencia} /></td>
                          <td style={tdStyle}><StatusBadge status={c.status} /></td>
                          <td style={tdStyle}>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
                          <td style={tdStyle}>
                            {c.status === 'concluido'
                              ? new Date(relatorio?.criado_em || c.atualizado_em).toLocaleDateString('pt-BR')
                              : '-'}
                          </td>
                          <td style={tdStyle}>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: sla.cor === '#3D9E6B'
                                ? 'rgba(61,158,107,0.15)'
                                : sla.cor === '#E84C1E'
                                  ? 'rgba(232,76,30,0.15)'
                                  : 'transparent',
                              color: sla.cor,
                            }}>
                              {sla.texto}
                            </span>
                          </td>
                          <td style={tdStyle}>{avaliacao?.nota ? `${avaliacao.nota} ★` : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de detalhes (reusa o modal padrão de chamados) */}
      <ModalChamadoAdmin
        chamado={chamadoSelecionado}
        tecnicos={tecnicos}
        onClose={() => setChamadoSelecionado(null)}
        onAtualizado={() => {
          setChamadoSelecionado(null);
          gerarRelatorio();
        }}
      />
    </div>
  );
}
