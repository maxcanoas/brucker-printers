import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealtimeChamados } from '../../hooks/useRealtime';
import api from '../../lib/api';
import { StatusBadge, UrgenciaBadge } from '../../components/StatusBadge';
import { SlaIndicator } from '../../components/SlaIndicator';
import { EmptyState } from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { LogOut, Sun, Moon, Printer, Wrench, CheckCircle } from 'lucide-react';
import ModalChamadoTecnico from './modals/ModalChamadoTecnico';

export default function DashboardTecnico() {
  const { usuario, logout } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const [aba, setAba] = useState('ativos');
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalChamado, setModalChamado] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const params = aba === 'concluidos' ? '?status=concluido' : '';
      const { data } = await api.get(`/chamados/meus${params}`);
      setChamados(Array.isArray(data) ? data : data.data || []);
    } catch {
      toast.error('Erro ao carregar chamados');
    } finally {
      setCarregando(false);
    }
  }, [aba]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useRealtimeChamados(null, () => {
    carregar();
  });

  const containerStyle = { minHeight: '100vh', backgroundColor: theme.bg };
  const headerStyle = {
    backgroundColor: theme.card, borderBottom: `1px solid ${theme.border}`,
    padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  };
  const cardStyle = {
    backgroundColor: theme.card, borderRadius: '12px', border: `1px solid ${theme.border}`, padding: '20px'
  };

  const abas = [
    { id: 'ativos', label: 'Ativos', icon: Wrench },
    { id: 'concluidos', label: 'Concluídos', icon: CheckCircle }
  ];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '32px', height: 'auto' }} />
          <div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', color: theme.text, margin: 0 }}>
              BRUCKER <span style={{ color: theme.accent }}>PRINTERS</span>
            </h1>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>
              Área do Técnico — {usuario?.nome}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={toggleTheme} style={{
            background: 'none', border: `1px solid ${theme.border}`, borderRadius: '8px',
            color: theme.textSecondary, padding: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} title={themeMode === 'dark' ? 'Tema claro' : 'Tema escuro'}>
            {themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="btn-secondary" onClick={logout} style={{
            background: 'none', border: `1px solid ${theme.border}`, borderRadius: '8px',
            color: theme.textSecondary, padding: '8px 16px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {abas.map(tab => (
            <button key={tab.id} onClick={() => setAba(tab.id)} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              backgroundColor: aba === tab.id ? theme.accent : theme.card,
              color: aba === tab.id ? '#FFFFFF' : theme.textSecondary,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: 500, fontFamily: "'Barlow', sans-serif"
            }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {carregando ? (
          <SkeletonList count={4} />
        ) : chamados.length === 0 ? (
          <EmptyState
            icon="file-text"
            title={aba === 'ativos' ? 'Nenhum chamado ativo no momento' : 'Nenhum chamado concluído'}
            subtitle={aba === 'ativos' ? 'Quando o admin atribuir um chamado a você, ele aparecerá aqui.' : undefined}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chamados.map(chamado => {
              const precisaAceitar = chamado.status === 'atribuido';
              return (
                <div
                  key={chamado.id}
                  className="card-interactive"
                  onClick={() => setModalChamado(chamado)}
                  style={{
                    ...cardStyle,
                    cursor: 'pointer',
                    border: precisaAceitar ? `1px solid ${theme.accent}` : `1px solid ${theme.border}`,
                    boxShadow: precisaAceitar ? `0 0 0 1px ${theme.accent}40` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: '1 1 300px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ color: theme.text, fontWeight: 600, fontSize: '16px' }}>
                          #{chamado.numero}
                        </span>
                        <StatusBadge status={chamado.status} />
                        <UrgenciaBadge urgencia={chamado.urgencia} />
                        {precisaAceitar && (
                          <span style={{
                            padding: '3px 10px', borderRadius: '12px', fontSize: '11px',
                            backgroundColor: theme.accent, color: '#FFFFFF', fontWeight: 700
                          }}>
                            NOVO
                          </span>
                        )}
                      </div>
                      <p style={{ color: theme.text, fontSize: '14px', margin: '4px 0', fontWeight: 500 }}>
                        {chamado.clientes?.nome || 'Cliente não informado'}
                      </p>
                      <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0' }}>
                        {chamado.descricao?.substring(0, 120)}{chamado.descricao?.length > 120 ? '...' : ''}
                      </p>
                      {chamado.impressoras && (
                        <p style={{ color: theme.textSecondary, fontSize: '12px', margin: '4px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Printer size={12} />
                          {chamado.impressoras.modelo} — {chamado.impressoras.numero_serie}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <SlaIndicator
                        slaVenceEm={chamado.sla_vence_em}
                        slaPausadoEm={chamado.sla_pausado_em}
                        status={chamado.status}
                        slaTempoRestanteMinutos={chamado.sla_tempo_restante_minutos}
                      />
                      <p style={{ color: theme.textSecondary, fontSize: '12px', marginTop: '4px' }}>
                        {new Date(chamado.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ModalChamadoTecnico
        chamado={modalChamado}
        onClose={() => setModalChamado(null)}
        onAtualizado={carregar}
      />
    </div>
  );
}
