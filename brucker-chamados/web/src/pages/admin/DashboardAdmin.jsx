import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeChamados } from '../../hooks/useRealtime';
import api from '../../lib/api';
import { StatusBadge, UrgenciaBadge } from '../../components/StatusBadge';
import { SlaIndicator } from '../../components/SlaIndicator';
import { Modal } from '../../components/Modal';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, Printer, UserCog, BarChart3,
  LogOut, AlertTriangle, CheckCircle, Clock, Wrench, PlusCircle,
  Search, ChevronDown
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
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 }
];

export default function DashboardAdmin() {
  const { usuario, logout } = useAuth();
  const [aba, setAba] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [modalChamado, setModalChamado] = useState(null);
  const [modalCliente, setModalCliente] = useState(false);
  const [modalTecnico, setModalTecnico] = useState(false);

  const carregarDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data);
    } catch { /* silent */ }
  }, []);

  const carregarChamados = useCallback(async () => {
    try {
      const params = filtroStatus ? `?status=${filtroStatus}` : '';
      const { data } = await api.get(`/chamados${params}`);
      setChamados(data.data || []);
    } catch { /* silent */ }
  }, [filtroStatus]);

  const carregarClientes = useCallback(async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch { /* silent */ }
  }, []);

  const carregarTecnicos = useCallback(async () => {
    try {
      const { data } = await api.get('/tecnicos');
      setTecnicos(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    carregarDashboard();
    carregarChamados();
    carregarClientes();
    carregarTecnicos();
  }, [carregarDashboard, carregarChamados, carregarClientes, carregarTecnicos]);

  useRealtimeChamados(null, () => {
    carregarDashboard();
    carregarChamados();
  });

  const contadores = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, icon: AlertTriangle, color: '#4D8EF5' },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, icon: Wrench, color: '#C9A227' },
    { label: 'SLA Vencendo', valor: dashboard?.sla_vencendo || 0, icon: Clock, color: '#E84C1E' },
    { label: 'Concluídos Hoje', valor: dashboard?.concluidos_hoje || 0, icon: CheckCircle, color: '#3D9E6B' }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0D1117' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', backgroundColor: '#141920', borderRight: '1px solid #1E2533',
        padding: '24px 16px', display: 'flex', flexDirection: 'column'
      }}>
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
            <button key={item.id} onClick={() => setAba(item.id)} style={{
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
          <p style={{ color: '#FFFFFF', fontSize: '13px', margin: '0 0 4px' }}>{usuario?.nome}</p>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ color: '#FFFFFF', fontSize: '24px', margin: 0, fontFamily: "'Barlow Condensed', sans-serif" }}>
                Chamados
              </h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['', 'aberto', 'em_atendimento', 'aguardando_peca', 'concluido'].map(s => (
                  <button key={s} onClick={() => setFiltroStatus(s)} style={{
                    padding: '8px 16px', borderRadius: '6px', border: '1px solid #1E2533',
                    backgroundColor: filtroStatus === s ? '#E84C1E' : 'transparent',
                    color: filtroStatus === s ? '#FFFFFF' : '#8A94A6',
                    cursor: 'pointer', fontSize: '12px', fontFamily: "'Barlow', sans-serif"
                  }}>
                    {s === '' ? 'Todos' : s === 'aberto' ? 'Abertos' : s === 'em_atendimento' ? 'Em Atendimento' :
                      s === 'aguardando_peca' ? 'Aguardando' : 'Concluídos'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chamados.map(chamado => (
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
                      <SlaIndicator slaVenceEm={chamado.sla_vence_em} slaPausadoEm={chamado.sla_pausado_em} status={chamado.status} />
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {clientes.map(c => (
                <div key={c.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ color: '#FFFFFF', fontWeight: 600, margin: '0 0 4px', fontSize: '16px' }}>{c.nome}</p>
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: '0 0 2px' }}>{c.email}</p>
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>{c.telefone}</p>
                    </div>
                    <div style={{
                      padding: '6px 12px', backgroundColor: '#0D1117', borderRadius: '6px',
                      border: '1px solid #1E2533'
                    }}>
                      <p style={{ color: '#8A94A6', fontSize: '10px', margin: '0 0 2px' }}>Código</p>
                      <p style={{ color: '#E84C1E', fontSize: '13px', fontWeight: 600, margin: 0, fontFamily: 'monospace' }}>
                        {c.codigo_acesso}
                      </p>
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relatórios */}
        {aba === 'relatorios' && <RelatoriosAdmin />}
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

      {/* Modal Novo Técnico */}
      <ModalNovoTecnico
        isOpen={modalTecnico}
        onClose={() => setModalTecnico(false)}
        onCriado={() => { setModalTecnico(false); carregarTecnicos(); }}
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
      }).catch(() => {});
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

            <button onClick={handleSalvar} disabled={salvando} style={{
              ...btnPrimary, width: '100%', opacity: salvando ? 0.7 : 1
            }}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      const { data } = await api.post('/clientes', form);
      toast.success(`Cliente criado! Código: ${data.codigo_acesso}`);
      setForm({ nome: '', email: '', telefone: '' });
      onCriado();
    } catch {
      toast.error('Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Cliente">
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
        <button type="submit" disabled={salvando} style={{ ...btnPrimary, width: '100%' }}>
          {salvando ? 'Criando...' : 'Criar Cliente'}
        </button>
      </form>
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
        <button type="submit" disabled={salvando} style={{ ...btnPrimary, width: '100%' }}>
          {salvando ? 'Criando...' : 'Criar Técnico'}
        </button>
      </form>
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
    ]).catch(() => {});
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
        <button type="submit" disabled={salvando} style={{ ...btnPrimary, width: '100%' }}>
          {salvando ? 'Cadastrando...' : 'Cadastrar Impressora'}
        </button>
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
    if (tipo === 'periodo' && (!inicio || !fim)) {
      toast.error('Selecione o período');
      return;
    }
    setCarregando(true);
    try {
      const params = inicio && fim ? `?inicio=${inicio}&fim=${fim}` : '';
      const { data } = await api.get(`/admin/relatorios/${tipo}${params}`);
      setDados(data);
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
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
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
              <option value="periodo">Por Período</option>
              <option value="clientes">Por Cliente</option>
              <option value="tecnicos">Por Técnico</option>
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
          <button onClick={gerarRelatorio} disabled={carregando} style={btnPrimary}>
            {carregando ? 'Gerando...' : 'Gerar'}
          </button>
        </div>
      </div>

      {dados && tipo === 'periodo' && dados.resumo && (
        <div style={cardStyle}>
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>Resumo do Período</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Total', valor: dados.resumo.total },
              { label: 'Concluídos', valor: dados.resumo.concluidos },
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

      {dados && tipo !== 'periodo' && Array.isArray(dados) && (
        <div style={cardStyle}>
          <h3 style={{ color: '#FFFFFF', fontSize: '18px', marginBottom: '16px' }}>
            {tipo === 'clientes' ? 'Por Cliente' : 'Por Técnico'}
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1E2533' }}>
                  {tipo === 'clientes' ? 'Cliente' : 'Técnico'}
                </th>
                <th style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #1E2533' }}>Total</th>
                <th style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #1E2533' }}>Concluídos</th>
                <th style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', padding: '8px 12px', borderBottom: '1px solid #1E2533' }}>
                  {tipo === 'tecnicos' ? '% SLA' : 'Dentro SLA'}
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, i) => (
                <tr key={i}>
                  <td style={{ color: '#FFFFFF', padding: '10px 12px', borderBottom: '1px solid #1E2533' }}>
                    {item.cliente || item.tecnico}
                  </td>
                  <td style={{ color: '#FFFFFF', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #1E2533' }}>
                    {item.total}
                  </td>
                  <td style={{ color: '#FFFFFF', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #1E2533' }}>
                    {item.concluidos}
                  </td>
                  <td style={{ color: '#FFFFFF', textAlign: 'center', padding: '10px 12px', borderBottom: '1px solid #1E2533' }}>
                    {tipo === 'tecnicos' ? `${item.percentual_sla}%` : item.dentro_sla}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
