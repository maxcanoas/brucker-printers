import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useRealtimeChamados } from '../../hooks/useRealtime';
import api from '../../lib/api';
import { SkeletonDashboard } from '../../components/Skeleton';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, FileText, Users, Printer, UserCog, BarChart3,
  LogOut, Lock, Menu, X, Star, Sun, Moon
} from 'lucide-react';

// Tabs
import DashboardTab from './tabs/DashboardTab';
import ChamadosTab from './tabs/ChamadosTab';
import ClientesTab from './tabs/ClientesTab';
import ImpressorasTab from './tabs/ImpressorasTab';
import TecnicosTab from './tabs/TecnicosTab';
import RelatoriosTab from './tabs/RelatoriosTab';
import AvaliacoesTab from './tabs/AvaliacoesTab';

// Modals
import ModalChamadoAdmin from './modals/ModalChamadoAdmin';
import ModalNovoCliente from './modals/ModalNovoCliente';
import ModalEditarCliente from './modals/ModalEditarCliente';
import ModalDetalheCliente from './modals/ModalDetalheCliente';
import ModalNovoTecnico from './modals/ModalNovoTecnico';
import ModalEditarTecnico from './modals/ModalEditarTecnico';
import ModalAlterarSenha from './modals/ModalAlterarSenha';

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
  const { theme, themeMode, toggleTheme } = useTheme();
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg }}>
      {/* Botão Hamburger - Mobile */}
      <button onClick={() => setSidebarAberta(true)} style={{
        position: 'fixed', top: '16px', left: '16px', zIndex: 50,
        background: theme.card, border: `1px solid ${theme.border}`, borderRadius: '8px',
        color: theme.text, padding: '8px', cursor: 'pointer',
        display: 'none'
      }} className="sidebar-toggle">
        <Menu size={20} />
      </button>

      {/* Overlay mobile */}
      {sidebarAberta && (
        <div onClick={() => setSidebarAberta(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: theme.overlayBg, zIndex: 40,
          display: 'none'
        }} className="sidebar-overlay" />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarAberta ? ' aberta' : ''}`} style={{
        width: '240px', backgroundColor: theme.card, borderRight: `1px solid ${theme.border}`,
        padding: '24px 16px', display: 'flex', flexDirection: 'column',
        position: 'relative', zIndex: 45, flexShrink: 0
      }}>
        <img src="/logo-icon.png" alt="Brucker Printers" style={{ width: '48px', height: 'auto', display: 'block', margin: '0 auto 12px' }} />
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px',
          color: theme.text, margin: '0 0 8px', textAlign: 'center'
        }}>
          BRUCKER <span style={{ color: theme.accent }}>PRINTERS</span>
        </h1>
        <p style={{ color: theme.textSecondary, fontSize: '12px', textAlign: 'center', marginBottom: '32px' }}>
          Painel Administrativo
        </p>

        <nav style={{ flex: 1 }}>
          {menuItems.map(item => (
            <button key={item.id} className="sidebar-item" onClick={() => { setAba(item.id); setSidebarAberta(false); }} style={{
              width: '100%', padding: '12px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: aba === item.id ? theme.accentBg : 'transparent',
              color: aba === item.id ? theme.accent : theme.textSecondary,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              fontSize: '14px', fontWeight: aba === item.id ? 600 : 400,
              marginBottom: '4px', fontFamily: "'Barlow', sans-serif", textAlign: 'left'
            }}>
              <item.icon size={18} /> {item.label}
              {item.id === 'chamados' && dashboard?.abertos > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: '#E84C1E',
                  color: '#FFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 6px',
                }}>
                  {dashboard.abertos}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
          <p style={{ color: theme.text, fontSize: '13px', margin: '0 0 8px' }}>{usuario?.nome}</p>
          <button onClick={toggleTheme} className="btn-ghost" style={{
            background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer',
            padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
            marginBottom: '8px'
          }}>
            {themeMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            {themeMode === 'dark' ? ' Tema Claro' : ' Tema Escuro'}
          </button>
          <button onClick={() => setModalSenha(true)} className="btn-ghost" style={{
            background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer',
            padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px',
            marginBottom: '8px'
          }}>
            <Lock size={14} /> Alterar Senha
          </button>
          <button onClick={logout} className="btn-ghost" style={{
            background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer',
            padding: 0, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
        {carregandoDados && !dashboard && (
          <SkeletonDashboard />
        )}

        {aba === 'dashboard' && <DashboardTab dashboard={dashboard} />}

        {aba === 'chamados' && (
          <ChamadosTab
            chamadosFiltrados={chamadosFiltrados}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            buscaChamado={buscaChamado}
            setBuscaChamado={setBuscaChamado}
            setModalChamado={setModalChamado}
          />
        )}

        {aba === 'clientes' && (
          <ClientesTab
            clientes={clientes}
            setModalCliente={setModalCliente}
            setModalEditarCliente={setModalEditarCliente}
            setModalDetalheCliente={setModalDetalheCliente}
            onExcluido={carregarClientes}
          />
        )}

        {aba === 'impressoras' && <ImpressorasTab />}

        {aba === 'tecnicos' && (
          <TecnicosTab
            tecnicos={tecnicos}
            setModalTecnico={setModalTecnico}
            setModalEditarTecnico={setModalEditarTecnico}
            onExcluido={carregarTecnicos}
          />
        )}

        {aba === 'relatorios' && <RelatoriosTab clientes={clientes} tecnicos={tecnicos} />}

        {aba === 'avaliacoes' && <AvaliacoesTab tecnicos={tecnicos} />}
      </main>

      {/* Modals */}
      <ModalChamadoAdmin
        chamado={modalChamado}
        tecnicos={tecnicos}
        onClose={() => setModalChamado(null)}
        onAtualizado={() => { setModalChamado(null); carregarChamados(); carregarDashboard(); }}
      />

      <ModalNovoCliente
        isOpen={modalCliente}
        onClose={() => setModalCliente(false)}
        onCriado={() => { setModalCliente(false); carregarClientes(); }}
      />

      <ModalDetalheCliente
        cliente={modalDetalheCliente}
        onClose={() => setModalDetalheCliente(null)}
        onAtualizado={() => { carregarClientes(); }}
      />

      <ModalEditarCliente
        cliente={modalEditarCliente}
        onClose={() => setModalEditarCliente(null)}
        onAtualizado={() => { setModalEditarCliente(null); carregarClientes(); }}
      />

      <ModalNovoTecnico
        isOpen={modalTecnico}
        onClose={() => setModalTecnico(false)}
        onCriado={() => { setModalTecnico(false); carregarTecnicos(); }}
      />

      <ModalEditarTecnico
        tecnico={modalEditarTecnico}
        onClose={() => setModalEditarTecnico(null)}
        onAtualizado={() => { setModalEditarTecnico(null); carregarTecnicos(); }}
      />

      <ModalAlterarSenha
        isOpen={modalSenha}
        onClose={() => setModalSenha(false)}
      />
    </div>
  );
}
