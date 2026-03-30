import { useState, useCallback, useEffect } from 'react';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { Star, Loader2 } from 'lucide-react';

const cardStyle = {
  backgroundColor: '#141920', borderRadius: '12px', border: '1px solid #1E2533', padding: '24px'
};
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

export default function AvaliacoesTab({ tecnicos }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [stats, setStats] = useState({ total: 0, media: '0', distribuicao: [] });
  const [carregando, setCarregando] = useState(false);
  const [filtros, setFiltros] = useState({ nota: '', tecnico_id: '', inicio: '', fim: '' });
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const limite = 20;

  const buscar = useCallback(async (pag = 1) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pag);
      params.set('limit', limite);
      if (filtros.nota) params.set('nota', filtros.nota);
      if (filtros.tecnico_id) params.set('tecnico_id', filtros.tecnico_id);
      if (filtros.inicio) params.set('inicio', filtros.inicio);
      if (filtros.fim) params.set('fim', filtros.fim);
      const { data } = await api.get(`/admin/avaliacoes?${params.toString()}`);
      setAvaliacoes(data.data);
      setStats(data.stats);
      setTotal(data.total || 0);
      setPagina(pag);
    } catch {
      toast.error('Erro ao buscar avaliações');
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => { buscar(); }, []);

  const thStyle = { color: '#8A94A6', fontSize: '12px', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1E2533', backgroundColor: '#0D1117' };
  const tdStyle = { color: '#FFFFFF', fontSize: '14px', padding: '10px 12px', borderBottom: '1px solid #1E2533' };

  const renderEstrelas = (nota) => (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14} fill={n <= nota ? '#C9A227' : 'transparent'} color={n <= nota ? '#C9A227' : '#3A4553'} />
      ))}
    </span>
  );

  const totalPaginas = Math.ceil(total / limite);

  return (
    <div>
      <h2 style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '24px', fontFamily: "'Barlow Condensed', sans-serif" }}>
        Avaliações
      </h2>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <p style={{ color: '#8A94A6', fontSize: '13px', margin: '0 0 8px' }}>Nota Média</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#C9A227', fontSize: '32px', fontWeight: 700 }}>{stats.media}</span>
            {renderEstrelas(Math.round(Number(stats.media)))}
          </div>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#8A94A6', fontSize: '13px', margin: '0 0 8px' }}>Total de Avaliações</p>
          <span style={{ color: '#FFFFFF', fontSize: '32px', fontWeight: 700 }}>{stats.total}</span>
        </div>
        <div style={cardStyle}>
          <p style={{ color: '#8A94A6', fontSize: '13px', margin: '0 0 8px' }}>Distribuição</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[5, 4, 3, 2, 1].map(n => {
              const item = stats.distribuicao?.find(d => d.nota === n) || { count: 0 };
              const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#8A94A6', width: '15px' }}>{n}</span>
                  <Star size={10} fill="#C9A227" color="#C9A227" />
                  <div style={{ flex: 1, height: '8px', backgroundColor: '#1E2533', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#C9A227', borderRadius: '4px' }} />
                  </div>
                  <span style={{ color: '#8A94A6', width: '25px', textAlign: 'right' }}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nota</label>
            <select value={filtros.nota} onChange={e => setFiltros(f => ({ ...f, nota: e.target.value }))} style={{ ...inputStyle, width: 'auto' }}>
              <option value="">Todas</option>
              {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} estrela{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Técnico</label>
            <select value={filtros.tecnico_id} onChange={e => setFiltros(f => ({ ...f, tecnico_id: e.target.value }))} style={{ ...inputStyle, width: 'auto' }}>
              <option value="">Todos</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Início</label>
            <input type="date" value={filtros.inicio} onChange={e => setFiltros(f => ({ ...f, inicio: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Fim</label>
            <input type="date" value={filtros.fim} onChange={e => setFiltros(f => ({ ...f, fim: e.target.value }))} style={inputStyle} />
          </div>
          <LoadingButton onClick={() => buscar(1)} loading={carregando} loadingText="Buscando..." className="btn-primary" style={btnPrimary}>
            Buscar
          </LoadingButton>
        </div>
      </div>

      {/* Tabela */}
      <div style={cardStyle}>
        {carregando && avaliacoes.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} color="#E84C1E" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : avaliacoes.length === 0 ? (
          <p style={{ color: '#8A94A6', textAlign: 'center', padding: '40px' }}>Nenhuma avaliação encontrada</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Chamado</th>
                    <th style={thStyle}>Cliente</th>
                    <th style={thStyle}>Técnico</th>
                    <th style={thStyle}>Nota</th>
                    <th style={thStyle}>Comentário</th>
                    <th style={thStyle}>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {avaliacoes.map((a, index) => (
                    <tr key={a.id} className="table-row" style={{ backgroundColor: index % 2 === 1 ? 'rgba(30, 37, 51, 0.5)' : 'transparent' }}>
                      <td style={tdStyle}>#{a.chamados?.numero || '—'}</td>
                      <td style={tdStyle}>{a.clientes?.nome || '—'}</td>
                      <td style={tdStyle}>{a.chamados?.tecnicos?.nome || '—'}</td>
                      <td style={tdStyle}>{renderEstrelas(a.nota)} <span style={{ color: '#8A94A6', fontSize: '12px', marginLeft: '4px' }}>{a.nota}/5</span></td>
                      <td style={{ ...tdStyle, maxWidth: '350px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {a.comentario || <span style={{ color: '#3A4553' }}>—</span>}
                      </td>
                      <td style={{ ...tdStyle, color: '#8A94A6', fontSize: '13px' }}>
                        {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1E2533' }}>
                <button
                  onClick={() => buscar(pagina - 1)}
                  disabled={pagina <= 1}
                  className="btn-secondary"
                  style={{ ...btnPrimary, backgroundColor: 'transparent', border: '1px solid #1E2533', color: '#8A94A6', opacity: pagina <= 1 ? 0.5 : 1 }}
                >
                  Anterior
                </button>
                <span style={{ color: '#8A94A6', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  {pagina} / {totalPaginas}
                </span>
                <button
                  onClick={() => buscar(pagina + 1)}
                  disabled={pagina >= totalPaginas}
                  className="btn-secondary"
                  style={{ ...btnPrimary, backgroundColor: 'transparent', border: '1px solid #1E2533', color: '#8A94A6', opacity: pagina >= totalPaginas ? 0.5 : 1 }}
                >
                  Próxima
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
