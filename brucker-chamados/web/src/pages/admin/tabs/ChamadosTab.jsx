import { StatusBadge, UrgenciaBadge } from '../../../components/StatusBadge';
import { SlaIndicator } from '../../../components/SlaIndicator';
import { Search } from 'lucide-react';

const cardStyle = {
  backgroundColor: '#141920', borderRadius: '12px', border: '1px solid #1E2533', padding: '24px'
};
const inputStyle = {
  width: '100%', padding: '12px 14px', backgroundColor: '#0D1117',
  border: '1px solid #1E2533', borderRadius: '8px', color: '#FFFFFF',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Barlow', sans-serif"
};

export default function ChamadosTab({ chamadosFiltrados, filtroStatus, setFiltroStatus, buscaChamado, setBuscaChamado, setModalChamado }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Chamados
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['', 'aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido'].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)} className="btn-ghost" style={{
              padding: '8px 16px', borderRadius: '6px', border: '1px solid #1E2533',
              backgroundColor: filtroStatus === s ? '#E84C1E' : 'transparent',
              color: filtroStatus === s ? '#FFFFFF' : '#8A94A6',
              cursor: 'pointer', fontSize: '12px', fontFamily: "'Barlow', sans-serif"
            }}>
              {s === '' ? 'Todos' : s === 'aberto' ? 'Abertos' : s === 'atribuido' ? 'Atribuídos' :
                s === 'em_atendimento' ? 'Em Atendimento' : s === 'aguardando_peca' ? 'Aguardando' : 'Concluídos'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#8A94A6' }} />
        <input
          value={buscaChamado}
          onChange={(e) => setBuscaChamado(e.target.value)}
          placeholder="Buscar por número, cliente, técnico, descrição ou série..."
          style={{ ...inputStyle, paddingLeft: '40px' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {chamadosFiltrados.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: 'center', color: '#8A94A6', padding: '48px' }}>
            {buscaChamado ? 'Nenhum chamado encontrado para esta busca' : 'Nenhum chamado encontrado'}
          </div>
        ) : null}
        {chamadosFiltrados.map(chamado => (
          <div key={chamado.id} className="card-interactive" style={{ ...cardStyle, cursor: 'pointer', padding: '16px 20px' }}
            onClick={() => setModalChamado(chamado)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>#{chamado.numero}</span>
                <StatusBadge status={chamado.status} />
                <UrgenciaBadge urgencia={chamado.urgencia} />
                <span style={{ color: '#8A94A6', fontSize: '13px' }}>{chamado.clientes?.nome}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <SlaIndicator slaVenceEm={chamado.sla_vence_em} slaPausadoEm={chamado.sla_pausado_em} status={chamado.status} slaTempoRestanteMinutos={chamado.sla_tempo_restante_minutos} />
                <span style={{ color: '#8A94A6', fontSize: '12px' }}>
                  {chamado.tecnicos?.nome || 'Sem técnico'}
                </span>
              </div>
            </div>
            <p style={{ color: '#8A94A6', fontSize: '13px', margin: '8px 0 0' }}>
              {chamado.descricao?.substring(0, 120)}{chamado.descricao?.length > 120 ? '...' : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
