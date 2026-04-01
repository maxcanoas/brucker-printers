import { useState } from 'react';
import { UrgenciaBadge } from '../../../components/StatusBadge';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../../contexts/ThemeContext';

export default function RelatoriosTab() {
  const { theme } = useTheme();
  const [tipo, setTipo] = useState('periodo');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const cardStyle = {
    backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '24px'
  };
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

  const gerarRelatorio = async () => {
    if (['periodo', 'sla'].includes(tipo) && (!inicio || !fim)) {
      toast.error('Selecione o período');
      return;
    }
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.set('inicio', inicio);
      if (fim) params.set('fim', fim);
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/admin/relatorios/${tipo}${query}`);
      setDados(data);
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const exportar = async (formato) => {
    try {
      const params = new URLSearchParams();
      if (inicio) params.set('inicio', inicio);
      if (fim) params.set('fim', fim);
      params.set('formato', formato);
      const response = await api.get(`/admin/relatorios/${tipo}?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${tipo}.${formato === 'xlsx' ? 'xlsx' : 'pdf'}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Exportado em ${formato.toUpperCase()}`);
    } catch {
      toast.error('Erro ao exportar');
    }
  };

  const thStyle = { color: theme.textSecondary, fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, backgroundColor: theme.bg };
  const tdStyle = { color: theme.text, fontSize: '14px', textAlign: 'center', padding: '12px 16px', borderBottom: `1px solid ${theme.border}` };
  const exportBtnStyle = {
    padding: '8px 16px', borderRadius: '6px', border: `1px solid ${theme.border}`,
    backgroundColor: 'transparent', color: theme.textSecondary, cursor: 'pointer',
    fontSize: '12px', fontFamily: "'Barlow', sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: '4px'
  };

  return (
    <div>
      <h2 style={{ color: theme.text, fontSize: '24px', marginBottom: '24px', fontFamily: "'Barlow Condensed', sans-serif" }}>
        Relatórios
      </h2>

      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Tipo</label>
            <select value={tipo} onChange={(e) => { setTipo(e.target.value); setDados(null); }} style={{ ...inputStyle, width: 'auto' }}>
              <option value="periodo">Por Período</option>
              <option value="clientes">Por Cliente</option>
              <option value="tecnicos">Por Técnico</option>
              <option value="sla">SLA (Cumprido vs Estourado)</option>
              <option value="pecas">Peças Utilizadas</option>
            </select>
          </div>
          <div>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Início</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>Fim</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} style={inputStyle} />
          </div>
          <LoadingButton onClick={gerarRelatorio} loading={carregando} loadingText="Gerando..." className="btn-primary" style={btnPrimary}>
            Gerar
          </LoadingButton>
        </div>
      </div>

      {/* Botões de exportação */}
      {dados && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => exportar('pdf')} className="btn-ghost" style={exportBtnStyle}>
            Exportar PDF
          </button>
          <button onClick={() => exportar('xlsx')} className="btn-ghost" style={exportBtnStyle}>
            Exportar Excel
          </button>
        </div>
      )}

      {/* Relatório por Período */}
      {dados && tipo === 'periodo' && dados.resumo && (
        <div style={cardStyle}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '16px' }}>Resumo do Período</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total', valor: dados.resumo.total },
              { label: 'Concluídos', valor: dados.resumo.concluidos },
              { label: 'Dentro SLA', valor: dados.resumo.dentro_sla },
              { label: 'Fora SLA', valor: dados.resumo.fora_sla },
              { label: '% SLA', valor: `${dados.resumo.percentual_sla}%` },
              { label: 'Tempo Médio', valor: `${dados.resumo.tempo_medio}min` },
              { label: 'Preventivos', valor: dados.resumo.por_tipo?.preventivo || 0 },
              { label: 'Corretivos', valor: dados.resumo.por_tipo?.corretivo || 0 }
            ].map(item => (
              <div key={item.label} style={{ padding: '12px', backgroundColor: theme.bg, borderRadius: '8px' }}>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: theme.text, fontSize: '20px', fontWeight: 700, margin: 0 }}>{item.valor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relatório por Cliente/Técnico */}
      {dados && ['clientes', 'tecnicos'].includes(tipo) && Array.isArray(dados) && (
        <div style={cardStyle}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '16px' }}>
            {tipo === 'clientes' ? 'Por Cliente' : 'Por Técnico'}
          </h3>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left' }}>{tipo === 'clientes' ? 'Cliente' : 'Técnico'}</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Concluídos</th>
                <th style={thStyle}>Dentro SLA</th>
                {tipo === 'tecnicos' && <th style={thStyle}>% SLA</th>}
                {tipo === 'tecnicos' && <th style={thStyle}>Tempo Médio</th>}
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => (
                <tr key={i} className="table-row" style={{ backgroundColor: i % 2 === 1 ? 'rgba(30, 37, 51, 0.5)' : 'transparent' }}>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>{item.cliente || item.tecnico}</td>
                  <td style={tdStyle}>{item.total}</td>
                  <td style={tdStyle}>{item.concluidos}</td>
                  <td style={tdStyle}>{item.dentro_sla}</td>
                  {tipo === 'tecnicos' && <td style={tdStyle}>{item.percentual_sla}%</td>}
                  {tipo === 'tecnicos' && <td style={tdStyle}>{item.tempo_medio} min</td>}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Relatório de SLA */}
      {dados && tipo === 'sla' && dados.resumo && (
        <div style={cardStyle}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '16px' }}>Relatório de SLA</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Concluídos', valor: dados.resumo.total_concluidos },
              { label: 'Dentro do SLA', valor: dados.resumo.dentro_sla, color: '#3D9E6B' },
              { label: 'Fora do SLA', valor: dados.resumo.fora_sla, color: '#E84C1E' },
              { label: '% Cumprimento', valor: `${dados.resumo.percentual_sla}%` }
            ].map(item => (
              <div key={item.label} style={{ padding: '12px', backgroundColor: theme.bg, borderRadius: '8px' }}>
                <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: item.color || theme.text, fontSize: '20px', fontWeight: 700, margin: 0 }}>{item.valor}</p>
              </div>
            ))}
          </div>
          <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'left' }}>#</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Cliente</th>
                <th style={{ ...thStyle, textAlign: 'left' }}>Técnico</th>
                <th style={thStyle}>Urgência</th>
                <th style={thStyle}>SLA</th>
                <th style={thStyle}>Criado</th>
                <th style={thStyle}>Concluído</th>
              </tr>
            </thead>
            <tbody>
              {dados.chamados?.map((c, index) => (
                <tr key={c.id} className="table-row" style={{ backgroundColor: index % 2 === 1 ? 'rgba(30, 37, 51, 0.5)' : 'transparent' }}>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>#{c.numero}</td>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>{c.clientes?.nome || '-'}</td>
                  <td style={{ ...tdStyle, textAlign: 'left' }}>{c.tecnicos?.nome || '-'}</td>
                  <td style={tdStyle}><UrgenciaBadge urgencia={c.urgencia} /></td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: c.sla_cumprido ? 'rgba(61,158,107,0.15)' : 'rgba(232,76,30,0.15)',
                      color: c.sla_cumprido ? '#3D9E6B' : '#E84C1E'
                    }}>
                      {c.sla_cumprido ? 'Cumprido' : 'Estourado'}
                    </span>
                  </td>
                  <td style={tdStyle}>{new Date(c.criado_em).toLocaleDateString('pt-BR')}</td>
                  <td style={tdStyle}>{new Date(c.atualizado_em).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Relatório de Peças */}
      {dados && tipo === 'pecas' && Array.isArray(dados) && (
        <div style={cardStyle}>
          <h3 style={{ color: theme.text, fontSize: '18px', marginBottom: '16px' }}>Peças Utilizadas</h3>
          {dados.length === 0 ? (
            <p style={{ color: theme.textSecondary, textAlign: 'center', padding: '24px' }}>
              Nenhuma peça encontrada no período
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, textAlign: 'left' }}>#</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Cliente</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Técnico</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Impressora</th>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Peças</th>
                  <th style={thStyle}>Data</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((item, i) => (
                  <tr key={i} className="table-row" style={{ backgroundColor: i % 2 === 1 ? 'rgba(30, 37, 51, 0.5)' : 'transparent' }}>
                    <td style={{ ...tdStyle, textAlign: 'left' }}>#{item.numero}</td>
                    <td style={{ ...tdStyle, textAlign: 'left' }}>{item.cliente}</td>
                    <td style={{ ...tdStyle, textAlign: 'left' }}>{item.tecnico}</td>
                    <td style={{ ...tdStyle, textAlign: 'left' }}>{item.impressora}</td>
                    <td style={{ ...tdStyle, textAlign: 'left' }}>{item.pecas_utilizadas}</td>
                    <td style={tdStyle}>{item.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
