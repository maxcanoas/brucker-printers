import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRealtimeChamados } from '../../hooks/useRealtime';
import api from '../../lib/api';
import { StatusBadge, UrgenciaBadge } from '../../components/StatusBadge';
import { SlaIndicator } from '../../components/SlaIndicator';
import { Modal } from '../../components/Modal';
import toast from 'react-hot-toast';
import {
  FileText, Printer, PlusCircle, LogOut, Clock, CheckCircle,
  AlertCircle, Wrench, LayoutDashboard
} from 'lucide-react';

const containerStyle = { minHeight: '100vh', backgroundColor: '#0D1117' };
const headerStyle = {
  backgroundColor: '#141920', borderBottom: '1px solid #1E2533',
  padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
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
  padding: '12px 24px', backgroundColor: '#E84C1E', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
};

export default function DashboardCliente() {
  const { usuario, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [impressoras, setImpressoras] = useState([]);
  const [aba, setAba] = useState('dashboard');
  const [modalAbrir, setModalAbrir] = useState(false);
  const [modalDetalhe, setModalDetalhe] = useState(null);

  const carregarDados = useCallback(async () => {
    try {
      const [dashRes, chamRes, impRes] = await Promise.all([
        api.get('/clientes/me/dashboard'),
        api.get('/clientes/me/chamados'),
        api.get('/clientes/me/impressoras')
      ]);
      setDashboard(dashRes.data);
      setChamados(chamRes.data);
      setImpressoras(impRes.data);
    } catch {
      toast.error('Erro ao carregar dados');
    }
  }, []);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  useRealtimeChamados(usuario?.id, () => { carregarDados(); });

  const contadores = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, icon: AlertCircle, color: '#4D8EF5' },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, icon: Wrench, color: '#C9A227' },
    { label: 'Aguardando Peça', valor: dashboard?.aguardando_peca || 0, icon: Clock, color: '#E84C1E' },
    { label: 'Concluídos', valor: dashboard?.concluidos || 0, icon: CheckCircle, color: '#3D9E6B' }
  ];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '20px', color: '#FFFFFF', margin: 0 }}>
            BRUCKER <span style={{ color: '#E84C1E' }}>PRINTERS</span>
          </h1>
          <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>Olá, {usuario?.nome}</p>
        </div>
        <button onClick={logout} style={{
          background: 'none', border: '1px solid #1E2533', borderRadius: '8px',
          color: '#8A94A6', padding: '8px 16px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
        }}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'chamados', label: 'Chamados', icon: FileText },
            { id: 'impressoras', label: 'Impressoras', icon: Printer }
          ].map(tab => (
            <button key={tab.id} onClick={() => setAba(tab.id)} style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              backgroundColor: aba === tab.id ? '#E84C1E' : '#141920',
              color: aba === tab.id ? '#FFFFFF' : '#8A94A6',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '14px', fontWeight: 500, fontFamily: "'Barlow', sans-serif"
            }}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
          <button onClick={() => setModalAbrir(true)} style={{
            ...btnPrimary, marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <PlusCircle size={16} /> Abrir Chamado
          </button>
        </div>

        {/* Dashboard */}
        {aba === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
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
        )}

        {/* Lista de Chamados */}
        {aba === 'chamados' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chamados.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', color: '#8A94A6', padding: '48px' }}>
                Nenhum chamado encontrado
              </div>
            ) : chamados.map(chamado => (
              <div key={chamado.id} style={{ ...cardStyle, cursor: 'pointer' }}
                onClick={() => setModalDetalhe(chamado)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '16px' }}>
                        #{chamado.numero}
                      </span>
                      <StatusBadge status={chamado.status} />
                      <UrgenciaBadge urgencia={chamado.urgencia} />
                    </div>
                    <p style={{ color: '#8A94A6', fontSize: '14px', margin: '4px 0' }}>
                      {chamado.descricao?.substring(0, 100)}{chamado.descricao?.length > 100 ? '...' : ''}
                    </p>
                    {chamado.impressoras && (
                      <p style={{ color: '#8A94A6', fontSize: '12px', margin: '4px 0' }}>
                        <Printer size={12} style={{ marginRight: '4px' }} />
                        {chamado.impressoras.modelo} — {chamado.impressoras.numero_serie}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <SlaIndicator slaVenceEm={chamado.sla_vence_em} slaPausadoEm={chamado.sla_pausado_em} status={chamado.status} />
                    <p style={{ color: '#8A94A6', fontSize: '12px', marginTop: '4px' }}>
                      {new Date(chamado.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de Impressoras */}
        {aba === 'impressoras' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {impressoras.map(imp => (
              <div key={imp.id} style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <Printer size={24} color="#E84C1E" />
                  <div>
                    <p style={{ color: '#FFFFFF', fontWeight: 600, margin: 0 }}>{imp.modelo}</p>
                    <p style={{ color: '#8A94A6', fontSize: '13px', margin: 0 }}>S/N: {imp.numero_serie}</p>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                  backgroundColor: 'rgba(77, 142, 245, 0.15)', color: '#4D8EF5'
                }}>
                  {imp.tipo_contrato === 'locacao' ? 'Locação' : imp.tipo_contrato}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Abrir Chamado */}
      <ModalAbrirChamado
        isOpen={modalAbrir}
        onClose={() => setModalAbrir(false)}
        impressoras={impressoras}
        onCriado={() => { setModalAbrir(false); carregarDados(); }}
      />

      {/* Modal Detalhe Chamado */}
      <ModalDetalheChamado
        chamado={modalDetalhe}
        onClose={() => setModalDetalhe(null)}
      />
    </div>
  );
}

function ModalAbrirChamado({ isOpen, onClose, impressoras, onCriado }) {
  const [form, setForm] = useState({
    numero_serie: '', impressora_id: '', modelo: '',
    tipo: 'corretivo', urgencia: 'normal', descricao: ''
  });
  const [carregando, setCarregando] = useState(false);

  const buscarImpressora = async (serie) => {
    setForm(f => ({ ...f, numero_serie: serie, impressora_id: '', modelo: '' }));
    if (serie.length < 3) return;

    try {
      const { data } = await api.get(`/impressoras/buscar/${serie}`);
      setForm(f => ({ ...f, impressora_id: data.id, modelo: data.modelo }));
    } catch {
      // Impressora não encontrada
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descricao.trim()) {
      toast.error('Descreva o problema');
      return;
    }
    setCarregando(true);
    try {
      await api.post('/chamados', {
        impressora_id: form.impressora_id || null,
        tipo: form.tipo,
        urgencia: form.urgencia,
        descricao: form.descricao
      });
      toast.success('Chamado aberto com sucesso!');
      setForm({ numero_serie: '', impressora_id: '', modelo: '', tipo: 'corretivo', urgencia: 'normal', descricao: '' });
      onCriado();
    } catch {
      toast.error('Erro ao abrir chamado');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Abrir Novo Chamado">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Número de Série da Impressora
          </label>
          <input
            value={form.numero_serie}
            onChange={(e) => buscarImpressora(e.target.value)}
            placeholder="Digite o número de série..."
            style={inputStyle}
          />
          {form.modelo && (
            <p style={{ color: '#3D9E6B', fontSize: '13px', marginTop: '4px' }}>
              Impressora encontrada: {form.modelo}
            </p>
          )}
          {form.numero_serie.length >= 3 && !form.modelo && (
            <p style={{ color: '#C9A227', fontSize: '13px', marginTop: '4px' }}>
              Impressora não encontrada. Você ainda pode abrir o chamado.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="corretivo">Corretivo</option>
              <option value="preventivo">Preventivo</option>
            </select>
          </div>
          <div>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Urgência</label>
            <select value={form.urgencia} onChange={(e) => setForm(f => ({ ...f, urgencia: e.target.value }))}
              style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="normal">Normal (24h SLA)</option>
              <option value="alta">Alta (16h SLA)</option>
              <option value="critica">Crítica (8h SLA)</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Descrição do Problema *
          </label>
          <textarea
            value={form.descricao}
            onChange={(e) => setForm(f => ({ ...f, descricao: e.target.value }))}
            placeholder="Descreva o problema em detalhes..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <button type="submit" disabled={carregando} style={{
          ...btnPrimary, width: '100%', opacity: carregando ? 0.7 : 1
        }}>
          {carregando ? 'Abrindo...' : 'Abrir Chamado'}
        </button>
      </form>
    </Modal>
  );
}

function ModalDetalheChamado({ chamado, onClose }) {
  const [detalhes, setDetalhes] = useState(null);

  useEffect(() => {
    if (chamado) {
      api.get(`/chamados/${chamado.id}`).then(res => setDetalhes(res.data)).catch(() => {});
    } else {
      setDetalhes(null);
    }
  }, [chamado]);

  return (
    <Modal isOpen={!!chamado} onClose={onClose} title={`Chamado #${chamado?.numero}`} width="700px">
      {detalhes ? (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Status</p>
              <StatusBadge status={detalhes.status} />
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Urgência</p>
              <UrgenciaBadge urgencia={detalhes.urgencia} />
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Tipo</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{detalhes.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo'}</p>
            </div>
            <div>
              <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 4px' }}>Técnico</p>
              <p style={{ color: '#FFFFFF', margin: 0 }}>{detalhes.tecnicos?.nome || 'Não atribuído'}</p>
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

          {/* Histórico de atualizações */}
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
                    {at.observacao && (
                      <p style={{ color: '#8A94A6', fontSize: '13px', margin: '8px 0 0' }}>{at.observacao}</p>
                    )}
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
