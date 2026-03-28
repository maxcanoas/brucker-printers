import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeChamados } from '../../hooks/useRealtime';
import api from '../../lib/api';
import { StatusBadge, UrgenciaBadge } from '../../components/StatusBadge';
import { SlaIndicator } from '../../components/SlaIndicator';
import { Modal } from '../../components/Modal';
import { LoadingButton } from '../../components/LoadingButton';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, Printer, UserCog, BarChart3,
  LogOut, AlertTriangle, CheckCircle, Clock, Wrench, PlusCircle,
  Search, ChevronDown, Copy, RefreshCw, Edit3, Eye, EyeOff, Phone, Mail, Lock,
  Menu, X, Loader2, Star
} from 'lucide-react';

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

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chamados', label: 'Chamados', icon: FileText },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'impressoras', label: 'Impressoras', icon: Printer },
  { id: 'tecnicos', label: 'Técnicos', icon: UserCog },
  { id: 'avaliacoes', label: 'Avaliações', icon: Star },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
];

export default function DashboardAdmin() {
  const { usuario, logout } = useAuth();
  const [aba, setAba] = useState('dashboard');
  const [sidebarAberta, setSidebarAberta] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [buscaChamado, setBuscaChamado] = useState('');
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [modalChamado, setModalChamado] = useState(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalDetalheCliente, setModalDetalheCliente] = useState(null);
  const [modalEditarCliente, setModalEditarCliente] = useState(null);
  const [modalTecnico, setModalTecnico] = useState(false);
  const [modalEditarTecnico, setModalEditarTecnico] = useState(null);
  const [modalSenha, setModalSenha] = useState(false);

  const carregarDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data);
    } catch {
      toast.error('Erro ao carregar dashboard');
    }
  }, []);

  const carregarChamados = useCallback(async () => {
    try {
      const params = filtroStatus ? `?status=${filtroStatus}` : '';
      const { data } = await api.get(`/chamados${params}`);
      setChamados(data.data || []);
    } catch {
      toast.error('Erro ao carregar chamados');
    }
  }, [filtroStatus]);

  const carregarClientes = useCallback(async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch {
      toast.error('Erro ao carregar clientes');
    }
  }, []);

  const carregarTecnicos = useCallback(async () => {
    try {
      const { data } = await api.get('/tecnicos');
      setTecnicos(data);
    } catch {
      toast.error('Erro ao carregar técnicos');
    }
  }, []);

  useEffect(() => {
    setCarregandoDados(true);
    Promise.all([carregarDashboard(), carregarChamados(), carregarClientes(), carregarTecnicos()])
      .finally(() => setCarregandoDados(false));
  }, [carregarDashboard, carregarChamados, carregarClientes, carregarTecnicos]);

  const chamadosFiltrados = chamados.filter(c => {
    if (!buscaChamado) return true;
    const termo = buscaChamado.toLowerCase();
    return (
      String(c.numero).includes(termo) ||
      c.clientes?.nome?.toLowerCase().includes(termo) ||
      c.descricao?.toLowerCase().includes(termo) ||
      c.tecnicos?.nome?.toLowerCase().includes(termo) ||
      c.impressoras?.numero_serie?.toLowerCase().includes(termo)
    );
  });

  useRealtimeChamados(null, () => {
    carregarDashboard();
    carregarChamados();
  });

  const contadores = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, icon: AlertTriangle, color: '#4D8EF5' },
    { label: 'Atribuídos', valor: dashboard?.atribuidos || 0, icon: UserCog, color: '#9B59B6' },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, icon: Wrench, color: '#C9A227' },
    { label: 'SLA Vencendo', valor: dashboard?.sla_vencendo || 0, icon: Clock, color: '#E84C1E' },
    { label: 'Concluídos Hoje', valor: dashboard?.concluidos_hoje || 0, icon: CheckCircle, color: '#3D9E6B' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D1117' }}>
      {/* Botão Hamburger - Mobile */}
      <button onClick={() => setSidebarAberta(true)} style={{
        position: 'fixed', top: '16px', left: '16px', zIndex: 50,
        background: '#141920', border: '1px solid #1E2533', borderRadius: '8px',
        color: '#FFFFFF', padding: '8px', cursor: 'pointer',
        display: 'none'
      }} className="sidebar-toggle">
        <Menu size={20} />
      </button>

      {/* Overlay mobile */}
      {sidebarAberta && (
        <div onClick={() => setSidebarAberta(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40,
          display: 'none'
        }} className="sidebar-overlay" />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarAberta ? ' aberta' : ''}`} style={{
        width: '240px', backgroundColor: '#141920', borderRight: '1px solid #1E2533',
        padding: '24px 16px', display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 45, flexShrink: 0
      }}>
        <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '48px', height: 'auto', display: 'block', margin: '0 auto 12px' }} />
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px',
          color: '#FFFFFF', margin: '0 0 8px', textAlign: 'center'
        }}>
          BRUCKER <span style={{ color: '#E84C1E' }}>PRINTERS</span>
        </h1>
        <p style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', marginBottom: '32px' }}>
          Painel Administrativo
        </p>

        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setAba(item.id); setSidebarAberta(false); }} style={{
              width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: aba === item.id ? 'rgba(232, 76, 30, 0.15)' : 'transparent',
              color: aba === item.id ? '#E84C1E' : '#8A94A6',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '14px', fontWeight: aba === item.id ? 600 : 400,
              marginBottom: '4px', fontFamily: "'Barlow', sans-serif", textAlign: 'left'
            }}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid #1E2533', paddingTop: '16px' }}>
          <p style={{ color: '#FFFFFF', fontSize: '13px', margin: '0 0 8px' }}>{usuario?.nome}</p>
          <button onClick={() => setModalSenha(true)} style={{
            background: 'none', border: 'none', color: '#8A94A6', cursor: 'pointer',
            padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
            marginBottom: '8px'
          }}>
            <Lock size={14} /> Alterar Senha
          </button>
          <button onClick={logout} style={{
            background: 'none', border: 'none', color: '#8A94A6', cursor: 'pointer',
            padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {carregandoDados && !dashboard && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <Loader2 size={32} color="#E84C1E" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {/* Dashboard */}
        {aba === 'dashboard' && (
          <div>
            <h2 style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '24px', fontFamily: "'Barlow Condensed', sans-serif" }}>
              Dashboard
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {contadores.map(c => (
                <div key={c.label} style={cardStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      backgroundColor: `${c.color}15`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center'
                    }}>
                      <c.icon size={24} color={c.color} />
                    </div>
                    <div>
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{c.label}</p>
                      <p style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 700, margin: 0 }}>{c.valor}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {dashboard?.sla_vencido > 0 && (
              <div style={{
                ...cardStyle, borderColor: '#E84C1E', marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <AlertTriangle size={24} color="#E84C1E" />
                <div>
                  <p style={{ color: '#E84C1E', fontWeight: 600, margin: 0 }}>
                    {dashboard.sla_vencido} chamado(s) com SLA vencido!
                  </p>
                  <p style={{ color: '#8A94A6', fontSize: '13px', margin: '4px 0 0' }}>
                    Verifique os chamados pendentes imediatamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chamados */}
        {aba === 'chamados' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>
                Chamados
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['', 'aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido'].map(s => (
                  <button key={s} onClick={() => setFiltroStatus(s)} style={{
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
                <div key={chamado.id} style={{ ...cardStyle, cursor: 'pointer', padding: '16px 20px' }}
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
        )}

        {/* Clientes */}
        {aba === 'clientes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Clientes</h2>
              <button onClick={() => setModalCliente(true)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={16} /> Novo Cliente
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {clientes.map(c => (
                <div key={c.id} style={{ ...cardStyle, cursor: 'pointer', transition: 'border-color 0.2s' }}
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
                          <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{c.telefone}</p>
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
                      <button onClick={(e) => { e.stopPropagation(); setModalEditarCliente(c); }} style={{
                        padding: '6px 10px', backgroundColor: 'rgba(77, 142, 245, 0.15)', border: 'none',
                        borderRadius: '6px', color: '#4D8EF5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                      }}>
                        <Edit3 size={12} /> Editar
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setModalDetalheCliente(c); }} style={{
                        padding: '6px 10px', backgroundColor: 'rgba(232, 76, 30, 0.15)', border: 'none',
                        borderRadius: '6px', color: '#E84C1E', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
                      }}>
                        <Eye size={12} /> Detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Impressoras */}
        {aba === 'impressoras' && <ImpressorasAdmin />}

        {/* Técnicos */}
        {aba === 'tecnicos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Técnicos</h2>
              <button onClick={() => setModalTecnico(true)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlusCircle size={16} /> Novo Técnico
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {tecnicos.map(t => (
                <div key={t.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ color: '#FFFFFF', fontWeight: 600, margin: '0 0 4px' }}>{t.nome}</p>
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: '0 0 2px' }}>{t.email}</p>
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{t.whatsapp}</p>
                    </div>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '12px',
                      backgroundColor: t.ativo ? 'rgba(61, 158, 107, 0.15)' : 'rgba(138, 148, 166, 0.15)',
                      color: t.ativo ? '#3D9E6B' : '#8A94A6'
                    }}>
                      {t.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1E2533' }}>
                    <button onClick={() => setModalEditarTecnico(t)} style={{
                      padding: '6px 12px', backgroundColor: 'rgba(77, 142, 245, 0.15)', border: 'none',
                      borderRadius: '6px', color: '#4D8EF5', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px',
                      fontFamily: "'Barlow', sans-serif"
                    }}>
                      <Edit3 size={12} /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatórios */}
        {aba === 'relatorios' && <RelatoriosAdmin />}

        {/* Avaliações */}
        {aba === 'avaliacoes' && <AvaliacoesAdmin tecnicos={tecnicos} />}
      </main>

      {/* Modal Chamado */}
      <ModalChamadoAdmin
        chamado={modalChamado}
        tecnicos={tecnicos}
        onClose={() => setModalChamado(null)}
        onAtualizado={() => { setModalChamado(null); carregarChamados(); carregarDashboard(); }}
      />

      {/* Modal Novo Cliente */}
      <ModalNovoCliente
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        onCriado={() => { setModalCliente(false); carregarClientes(); }}
      />

      {/* Modal Detalhes do Cliente */}
      <ModalDetalheCliente
        cliente={modalDetalheCliente}
        onClose={() => setModalDetalheCliente(null)}
        onAtualizado={() => { carregarClientes(); }}
      />

      {/* Modal Editar Cliente */}
      <ModalEditarCliente
        cliente={modalEditarCliente}
        onClose={() => setModalEditarCliente(null)}
        onAtualizado={() => { setModalEditarCliente(null); carregarClientes(); }}
      />

      {/* Modal Novo Técnico */}
      <ModalNovoTecnico
        isOpen={modalTecnico}
        onClose={() => setModalTecnico(false)}
        onCriado={() => { setModalTecnico(false); carregarTecnicos(); }}
      />

      {/* Modal Editar Técnico */}
      <ModalEditarTecnico
        tecnico={modalEditarTecnico}
        onClose={() => setModalEditarTecnico(null)}
        onAtualizado={() => { setModalEditarTecnico(null); carregarTecnicos(); }}
      />

      {/* Modal Alterar Senha */}
      <ModalAlterarSenha
        isOpen={modalSenha}
        onClose={() => setModalSenha(false)}
      />
    </div>
  );
}

function ModalChamadoAdmin({ chamado, tecnicos, onClose, onAtualizado }) {
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

            <LoadingButton onClick={handleSalvar} loading={salvando} loadingText="Salvando..." style={{
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

function ModalNovoCliente({ isOpen, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);
  const [clienteCriado, setClienteCriado] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      const { data } = await api.post('/clientes', form);
      setClienteCriado(data);
      toast.success('Cliente criado com sucesso!');
    } catch {
      toast.error('Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const copiarCodigo = async () => {
    if (clienteCriado?.codigo_acesso) {
      try {
        await navigator.clipboard.writeText(clienteCriado.codigo_acesso);
        toast.success('Código copiado!');
      } catch {
        toast.error('Erro ao copiar');
      }
    }
  };

  const handleClose = () => {
    if (clienteCriado) {
      setForm({ nome: '', email: '', telefone: '' });
      setClienteCriado(null);
      onCriado();
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={clienteCriado ? 'Cliente Criado!' : 'Novo Cliente'}>
      {clienteCriado ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <CheckCircle size={48} color="#3D9E6B" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#FFFFFF', margin: '0 0 8px', fontSize: '18px' }}>
              {clienteCriado.nome}
            </h3>
            <p style={{ color: '#8A94A6', margin: 0, fontSize: '14px' }}>
              Cliente cadastrado com sucesso!
            </p>
          </div>

          <div style={{
            padding: '24px', backgroundColor: '#0D1117', borderRadius: '12px',
            border: '2px solid #E84C1E', marginBottom: '24px'
          }}>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Código de Acesso Gerado
            </p>
            <p style={{
              color: '#E84C1E', fontSize: '32px', fontWeight: 700, margin: '0 0 12px',
              fontFamily: 'monospace', letterSpacing: '3px'
            }}>
              {clienteCriado.codigo_acesso}
            </p>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 16px' }}>
              Envie este código ao cliente para que ele acesse o sistema de chamados
            </p>
            <button onClick={copiarCodigo} style={{
              padding: '12px 24px', backgroundColor: 'rgba(77, 142, 245, 0.15)',
              border: '1px solid #4D8EF5', borderRadius: '8px',
              color: '#4D8EF5', cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600,
              fontFamily: "'Barlow', sans-serif"
            }}>
              <Copy size={16} /> Copiar Código
            </button>
          </div>

          <button onClick={handleClose} style={{ ...btnPrimary, width: '100%' }}>
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} placeholder="Nome completo ou razão social" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@exemplo.com" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Telefone</label>
            <input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} style={inputStyle} placeholder="(51) 99999-9999" />
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Criando..." style={{ ...btnPrimary, width: '100%' }}>
            Cadastrar Cliente
          </LoadingButton>
          <p style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', margin: '12px 0 0' }}>
            O código de acesso será gerado automaticamente
          </p>
        </form>
      )}
    </Modal>
  );
}

function ModalDetalheCliente({ cliente, onClose, onAtualizado }) {
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
              <button onClick={copiarCodigo} style={{
                padding: '10px 20px', backgroundColor: copiado ? 'rgba(61, 158, 107, 0.2)' : 'rgba(77, 142, 245, 0.15)',
                border: '1px solid ' + (copiado ? '#3D9E6B' : '#4D8EF5'), borderRadius: '8px',
                color: copiado ? '#3D9E6B' : '#4D8EF5', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                <Copy size={14} /> {copiado ? 'Copiado!' : 'Copiar Código'}
              </button>
              <button onClick={gerarNovoCodigo} disabled={gerandoCodigo} style={{
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
              <p style={{ color: '#FFFFFF', margin: 0 }}>{cliente.telefone || 'Não informado'}</p>
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

function ModalEditarCliente({ cliente, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || ''
      });
    }
  }, [cliente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/clientes/${cliente.id}`, form);
      toast.success('Cliente atualizado!');
      onAtualizado();
    } catch {
      toast.error('Erro ao atualizar cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!cliente} onClose={onClose} title="Editar Cliente">
      {cliente && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Telefone</label>
            <input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} style={inputStyle} />
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." style={{ ...btnPrimary, width: '100%' }}>
            Salvar Alterações
          </LoadingButton>
        </form>
      )}
    </Modal>
  );
}

function ModalNovoTecnico({ isOpen, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', whatsapp: '', senha: '' });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.email || !form.senha) {
      toast.error('Nome, email e senha são obrigatórios');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/tecnicos', form);
      toast.success('Técnico criado!');
      setForm({ nome: '', email: '', whatsapp: '', senha: '' });
      onCriado();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Técnico">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
          <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail *</label>
          <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
          <input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="51999999999" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Senha *</label>
          <input type="password" value={form.senha} onChange={(e) => setForm(f => ({ ...f, senha: e.target.value }))} style={inputStyle} />
        </div>
        <LoadingButton type="submit" loading={salvando} loadingText="Criando..." style={{ ...btnPrimary, width: '100%' }}>
          Criar Técnico
        </LoadingButton>
      </form>
    </Modal>
  );
}

function ModalEditarTecnico({ tecnico, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', whatsapp: '', ativo: true });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tecnico) {
      setForm({ nome: tecnico.nome || '', whatsapp: tecnico.whatsapp || '', ativo: tecnico.ativo !== false });
    }
  }, [tecnico]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/tecnicos/${tecnico.id}`, form);
      toast.success('Técnico atualizado!');
      onAtualizado();
    } catch {
      toast.error('Erro ao atualizar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!tecnico} onClose={onClose} title="Editar Técnico">
      {tecnico && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input value={tecnico.email} disabled style={{ ...inputStyle, opacity: 0.5 }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="51999999999" style={inputStyle} />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Status</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: true }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: form.ativo ? '#3D9E6B' : '#1E2533',
                backgroundColor: form.ativo ? 'rgba(61, 158, 107, 0.15)' : 'transparent',
                color: form.ativo ? '#3D9E6B' : '#8A94A6', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                Ativo
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, ativo: false }))} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid',
                borderColor: !form.ativo ? '#E84C1E' : '#1E2533',
                backgroundColor: !form.ativo ? 'rgba(232, 76, 30, 0.15)' : 'transparent',
                color: !form.ativo ? '#E84C1E' : '#8A94A6', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: "'Barlow', sans-serif"
              }}>
                Inativo
              </button>
            </div>
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." style={{ ...btnPrimary, width: '100%' }}>
            Salvar Alterações
          </LoadingButton>
        </form>
      )}
    </Modal>
  );
}

function ImpressorasAdmin() {
  const [impressoras, setImpressoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modalNova, setModalNova] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/impressoras').then(r => setImpressoras(r.data)),
      api.get('/clientes').then(r => setClientes(r.data))
    ]).catch(() => toast.error('Erro ao carregar impressoras'));
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>Impressoras</h2>
        <button onClick={() => setModalNova(true)} style={{ ...btnPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={16} /> Nova Impressora
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {impressoras.map(imp => (
          <div key={imp.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Printer size={20} color="#E84C1E" />
              <div>
                <p style={{ color: '#FFFFFF', fontWeight: 600, margin: 0 }}>{imp.modelo}</p>
                <p style={{ color: '#8A94A6', fontSize: '12px', margin: 0 }}>S/N: {imp.numero_serie}</p>
              </div>
            </div>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '4px 0' }}>
              Cliente: {imp.clientes?.nome || 'N/A'}
            </p>
            <span style={{
              padding: '3px 8px', borderRadius: '4px', fontSize: '11px',
              backgroundColor: imp.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
              color: imp.ativo ? '#3D9E6B' : '#8A94A6'
            }}>
              {imp.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        ))}
      </div>

      <ModalNovaImpressora
        isOpen={modalNova}
        clientes={clientes}
        onClose={() => setModalNova(false)}
        onCriada={() => {
          setModalNova(false);
          api.get('/impressoras').then(r => setImpressoras(r.data));
        }}
      />
    </div>
  );
}

function ModalNovaImpressora({ isOpen, clientes, onClose, onCriada }) {
  const [form, setForm] = useState({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.cliente_id || !form.modelo || !form.numero_serie) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/impressoras', form);
      toast.success('Impressora cadastrada!');
      setForm({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
      onCriada();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Impressora">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Cliente *</label>
          <select value={form.cliente_id} onChange={(e) => setForm(f => ({ ...f, cliente_id: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Selecionar...</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Modelo *</label>
          <input value={form.modelo} onChange={(e) => setForm(f => ({ ...f, modelo: e.target.value }))} placeholder="Ex: Ricoh Pro C5200" style={inputStyle} />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Número de Série *</label>
          <input value={form.numero_serie} onChange={(e) => setForm(f => ({ ...f, numero_serie: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Tipo de Contrato</label>
          <select value={form.tipo_contrato} onChange={(e) => setForm(f => ({ ...f, tipo_contrato: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="locacao">Locação</option>
            <option value="venda">Venda</option>
            <option value="manutencao">Manutenção</option>
          </select>
        </div>
        <LoadingButton type="submit" loading={salvando} loadingText="Cadastrando..." style={{ ...btnPrimary, width: '100%' }}>
          Cadastrar Impressora
        </LoadingButton>
      </form>
    </Modal>
  );
}

function RelatoriosAdmin() {
  const [tipo, setTipo] = useState('periodo');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

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

  const thStyle = { color: '#8A94A6', fontSize: '12px', textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #1E2533' };
  const tdStyle = { color: '#FFFFFF', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #1E2533' };
  const exportBtnStyle = {
    padding: '8px 16px', borderRadius: '6px', border: '1px solid #1E2533',
    backgroundColor: 'transparent', color: '#8A94A6', cursor: 'pointer',
    fontSize: '12px', fontFamily: "'Barlow', sans-serif",
    display: 'inline-flex', alignItems: 'center', gap: '4px'
  };

  return (
    <div>
      <h2 style={{ color: '#FFFFFF', fontSize: '24px', marginBottom: '24px', fontFamily: "'Barlow Condensed', sans-serif" }}>
        Relatórios
      </h2>

      <div style={{ ...cardStyle, marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Tipo</label>
            <select value={tipo} onChange={(e) => { setTipo(e.target.value); setDados(null); }} style={{ ...inputStyle, width: 'auto' }}>
              <option value="periodo">Por Período</option>
              <option value="clientes">Por Cliente</option>
              <option value="tecnicos">Por Técnico</option>
              <option value="sla">SLA (Cumprido vs Estourado)</option>
              <option value="pecas">Peças Utilizadas</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Início</label>
            <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Fim</label>
            <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} style={inputStyle} />
          </div>
          <LoadingButton onClick={gerarRelatorio} loading={carregando} loadingText="Gerando..." style={btnPrimary}>
            Gerar
          </LoadingButton>
        </div>
      </div>

      {/* Botões de exportação */}
      {dados && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={() => exportar('pdf')} style={exportBtnStyle}>
            Exportar PDF
          </button>
          <button onClick={() => exportar('xlsx')} style={exportBtnStyle}>
            Exportar Excel
          </button>
        </div>
      )}

      {/* Relatório por Período */}
      {dados && tipo === 'periodo' && dados.resumo && (
        <div style={cardStyle}>
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>Resumo do Período</h3>
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
              <div key={item.label} style={{ padding: '12px', backgroundColor: '#0D1117', borderRadius: '8px' }}>
                <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: 0 }}>{item.valor}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Relatório por Cliente/Técnico */}
      {dados && ['clientes', 'tecnicos'].includes(tipo) && Array.isArray(dados) && (
        <div style={cardStyle}>
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>
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
                <tr key={i}>
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
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>Relatório de SLA</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Total Concluídos', valor: dados.resumo.total_concluidos },
              { label: 'Dentro do SLA', valor: dados.resumo.dentro_sla, color: '#3D9E6B' },
              { label: 'Fora do SLA', valor: dados.resumo.fora_sla, color: '#E84C1E' },
              { label: '% Cumprimento', valor: `${dados.resumo.percentual_sla}%` }
            ].map(item => (
              <div key={item.label} style={{ padding: '12px', backgroundColor: '#0D1117', borderRadius: '8px' }}>
                <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>{item.label}</p>
                <p style={{ color: item.color || '#FFFFFF', fontSize: '20px', fontWeight: 700, margin: 0 }}>{item.valor}</p>
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
              {dados.chamados?.map(c => (
                <tr key={c.id}>
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
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>Peças Utilizadas</h3>
          {dados.length === 0 ? (
            <p style={{ color: '#8A94A6', textAlign: 'center', padding: '24px' }}>
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
                  <tr key={i}>
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

function ModalAlterarSenha({ isOpen, onClose }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [mostrar, setMostrar] = useState({ atual: false, nova: false, confirmar: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (novaSenha !== confirmarSenha) {
      return toast.error('As senhas não coincidem');
    }
    if (novaSenha.length < 6) {
      return toast.error('A nova senha deve ter no mínimo 6 caracteres');
    }
    setSalvando(true);
    try {
      await api.put('/auth/alterar-senha', { senha_atual: senhaAtual, nova_senha: novaSenha });
      toast.success('Senha alterada com sucesso');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setSalvando(false);
    }
  };

  const toggleIcon = (field) => (
    <button type="button" onClick={() => setMostrar(prev => ({ ...prev, [field]: !prev[field] }))} style={{
      position: 'absolute', right: '12px', top: '12px', background: 'none',
      border: 'none', cursor: 'pointer', padding: 0, display: 'flex'
    }}>
      {mostrar[field] ? <EyeOff size={18} color="#8A94A6" /> : <Eye size={18} color="#8A94A6" />}
    </button>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Senha">
      <form onSubmit={handleSubmit}>
        <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Senha Atual</label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input type={mostrar.atual ? 'text' : 'password'} value={senhaAtual} onChange={e => setSenhaAtual(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('atual')}
        </div>

        <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nova Senha</label>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input type={mostrar.nova ? 'text' : 'password'} value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('nova')}
        </div>

        <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Confirmar Nova Senha</label>
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <input type={mostrar.confirmar ? 'text' : 'password'} value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
            required style={{ ...inputStyle, paddingRight: '48px' }} />
          {toggleIcon('confirmar')}
        </div>

        <LoadingButton type="submit" loading={salvando} loadingText="Salvando..." style={{
          ...btnPrimary, width: '100%'
        }}>
          Alterar Senha
        </LoadingButton>
      </form>
    </Modal>
  );
}

function AvaliacoesAdmin({ tecnicos }) {
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

  const thStyle = { color: '#8A94A6', fontSize: '12px', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1E2533' };
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
          <LoadingButton onClick={() => buscar(1)} loading={carregando} loadingText="Buscando..." style={btnPrimary}>
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
                  {avaliacoes.map(a => (
                    <tr key={a.id}>
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
