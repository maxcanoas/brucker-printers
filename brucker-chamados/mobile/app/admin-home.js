import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  Alert, TextInput, Modal, ScrollView, ActivityIndicator, Clipboard, Platform,
  Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { colors, statusColors, statusLabels, urgenciaColors } from '../lib/theme';
import DatePicker from '../components/DatePicker';

// ─── Bottom Tab Bar ───
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'chamados', label: 'Chamados', icon: '📋' },
  { id: 'clientes', label: 'Clientes', icon: '👥' },
  { id: 'impressoras', label: 'Impressoras', icon: '🖨️' },
  { id: 'tecnicos', label: 'Técnicos', icon: '🔧' },
  { id: 'relatorios', label: 'Relatórios', icon: '📈' },
];

export default function AdminHomeScreen() {
  const [aba, setAba] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    AsyncStorage.getItem('admin').then(d => { if (d) setAdmin(JSON.parse(d)); });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'admin', 'userTipo']);
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSubtitle}>Olá, {admin?.nome}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
          <Text style={{ color: colors.red, fontSize: 14 }}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {aba === 'dashboard' && <DashboardTab router={router} />}
      {aba === 'chamados' && <ChamadosTab router={router} />}
      {aba === 'clientes' && <ClientesTab />}
      {aba === 'impressoras' && <ImpressorasTab />}
      {aba === 'tecnicos' && <TecnicosTab />}
      {aba === 'relatorios' && <RelatoriosTab />}

      {/* Bottom Tabs */}
      <View style={[styles.bottomTabs, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, aba === tab.id && styles.tabBtnAtivo]}
            onPress={() => setAba(tab.id)}
          >
            <Text style={{ fontSize: 16 }}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, aba === tab.id && styles.tabLabelAtivo]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════
// TAB: DASHBOARD
// ═══════════════════════════════════════════
function DashboardTab({ router }) {
  const [dashboard, setDashboard] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const [dashRes, chamadosRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/chamados?status=aberto'),
      ]);
      setDashboard(dashRes.data);
      setChamados(chamadosRes.data.data || chamadosRes.data);
    } catch {}
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  const cards = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, cor: colors.blue },
    { label: 'Atribuídos', valor: dashboard?.atribuidos || 0, cor: colors.purple },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, cor: colors.yellow },
    { label: 'SLA Vencido', valor: dashboard?.sla_vencido || 0, cor: colors.red },
  ];

  return (
    <FlatList
      data={chamados}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      ListHeaderComponent={
        <View>
          <View style={styles.dashGrid}>
            {cards.map(c => (
              <View key={c.label} style={styles.dashCard}>
                <Text style={[styles.dashValor, { color: c.cor }]}>{c.valor}</Text>
                <Text style={styles.dashLabel}>{c.label}</Text>
              </View>
            ))}
          </View>
          {(dashboard?.sla_vencido || 0) > 0 && (
            <View style={[styles.card, { borderColor: colors.red, borderWidth: 1, marginHorizontal: 16, marginBottom: 12 }]}>
              <Text style={{ color: colors.red, fontWeight: '700', fontSize: 14 }}>
                ⚠️ {dashboard.sla_vencido} chamado(s) com SLA vencido!
              </Text>
            </View>
          )}
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginLeft: 16, marginBottom: 8 }}>
            Chamados Abertos
          </Text>
        </View>
      }
      renderItem={({ item }) => <ChamadoCard item={item} onPress={() => router.push(`/chamado/${item.id}`)} />}
      contentContainerStyle={{ paddingBottom: 16 }}
      ListEmptyComponent={<EmptyState text="Nenhum chamado aberto" />}
    />
  );
}

// ═══════════════════════════════════════════
// TAB: CHAMADOS
// ═══════════════════════════════════════════
function ChamadosTab({ router }) {
  const [chamados, setChamados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      const params = filtro ? `?status=${filtro}` : '';
      const { data } = await api.get(`/chamados${params}`);
      setChamados(data.data || data);
    } catch {}
  }, [filtro]);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  const filtros = ['', 'aberto', 'atribuido', 'em_atendimento', 'aguardando_peca', 'concluido'];
  const filtroLabels = { '': 'Todos', aberto: 'Abertos', atribuido: 'Atribuídos', em_atendimento: 'Em Atend.', aguardando_peca: 'Aguard.', concluido: 'Concluídos' };

  return (
    <FlatList
      data={chamados}
      keyExtractor={item => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      ListHeaderComponent={
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {filtros.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text style={[styles.filtroText, filtro === f && styles.filtroTextAtivo]}>
                {filtroLabels[f]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      }
      renderItem={({ item }) => <ChamadoCard item={item} onPress={() => router.push(`/chamado/${item.id}`)} />}
      contentContainerStyle={{ paddingBottom: 16 }}
      ListEmptyComponent={<EmptyState text="Nenhum chamado encontrado" />}
    />
  );
}

// ═══════════════════════════════════════════
// TAB: CLIENTES
// ═══════════════════════════════════════════
function ClientesTab() {
  const [clientes, setClientes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalDetalhe, setModalDetalhe] = useState(null);

  const carregar = async () => {
    try {
      const { data } = await api.get('/clientes');
      setClientes(data);
    } catch {}
  };

  useEffect(() => { carregar(); }, []);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={clientes}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Clientes ({clientes.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalNovo(true)}>
              <Text style={styles.addBtnText}>+ Novo</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, { marginHorizontal: 16, marginBottom: 10 }]} onPress={() => setModalDetalhe(item)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15, marginBottom: 4 }}>{item.nome}</Text>
                {item.email && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>✉ {item.email}</Text>}
                {item.telefone && <Text style={{ color: colors.textSecondary, fontSize: 12 }}>☎ {item.telefone}</Text>}
              </View>
              <View style={{ backgroundColor: colors.bg, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ color: colors.textSecondary, fontSize: 9, textAlign: 'center' }}>CÓDIGO</Text>
                <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                  {item.codigo_acesso}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                Cadastrado em {new Date(item.criado_em).toLocaleDateString('pt-BR')}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => setModalEditar(item)}>
                  <Text style={{ color: colors.blue, fontSize: 12, fontWeight: '600' }}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalDetalhe(item)}>
                  <Text style={{ color: colors.accent, fontSize: 12, fontWeight: '600' }}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<EmptyState text="Nenhum cliente cadastrado" />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <ModalNovoCliente visible={modalNovo} onClose={() => setModalNovo(false)} onCriado={() => { setModalNovo(false); carregar(); }} />
      <ModalEditarCliente cliente={modalEditar} onClose={() => setModalEditar(null)} onAtualizado={() => { setModalEditar(null); carregar(); }} />
      <ModalDetalheCliente cliente={modalDetalhe} onClose={() => setModalDetalhe(null)} onAtualizado={carregar} />
    </View>
  );
}

// ═══════════════════════════════════════════
// TAB: IMPRESSORAS
// ═══════════════════════════════════════════
function ImpressorasTab() {
  const [impressoras, setImpressoras] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalNova, setModalNova] = useState(false);

  const carregar = async () => {
    try {
      const [impRes, cliRes] = await Promise.all([
        api.get('/impressoras'),
        api.get('/clientes'),
      ]);
      setImpressoras(impRes.data);
      setClientes(cliRes.data);
    } catch {}
  };

  useEffect(() => { carregar(); }, []);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={impressoras}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Impressoras ({impressoras.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalNova(true)}>
              <Text style={styles.addBtnText}>+ Nova</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 24 }}>🖨️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{item.modelo}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>S/N: {item.numero_serie}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Cliente: {item.clientes?.nome || 'N/A'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={{
                  paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12,
                  backgroundColor: item.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
                }}>
                  <Text style={{ color: item.ativo ? colors.green : colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                    {item.ativo ? 'Ativa' : 'Inativa'}
                  </Text>
                </View>
                <View style={{
                  paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12,
                  backgroundColor: 'rgba(77,142,245,0.15)',
                }}>
                  <Text style={{ color: colors.blue, fontSize: 11 }}>{item.tipo_contrato}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState text="Nenhuma impressora cadastrada" />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <ModalNovaImpressora visible={modalNova} clientes={clientes} onClose={() => setModalNova(false)} onCriada={() => { setModalNova(false); carregar(); }} />
    </View>
  );
}

// ═══════════════════════════════════════════
// TAB: TÉCNICOS
// ═══════════════════════════════════════════
function TecnicosTab() {
  const [tecnicos, setTecnicos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalNovo, setModalNovo] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);

  const carregar = async () => {
    try {
      const { data } = await api.get('/tecnicos');
      setTecnicos(data);
    } catch {}
  };

  useEffect(() => { carregar(); }, []);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={tecnicos}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListHeaderComponent={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Técnicos ({tecnicos.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setModalNovo(true)}>
              <Text style={styles.addBtnText}>+ Novo</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { marginHorizontal: 16, marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>{item.nome}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>✉ {item.email}</Text>
                {item.whatsapp && <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>☎ {item.whatsapp}</Text>}
              </View>
              <View style={{
                paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20,
                backgroundColor: item.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)',
              }}>
                <Text style={{ color: item.ativo ? colors.green : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border, gap: 8 }}>
              <TouchableOpacity onPress={() => setModalEditar(item)}>
                <Text style={{ color: colors.blue, fontSize: 12, fontWeight: '600' }}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<EmptyState text="Nenhum técnico cadastrado" />}
        contentContainerStyle={{ paddingBottom: 16 }}
      />

      <ModalNovoTecnico visible={modalNovo} onClose={() => setModalNovo(false)} onCriado={() => { setModalNovo(false); carregar(); }} />
      <ModalEditarTecnico tecnico={modalEditar} onClose={() => setModalEditar(null)} onAtualizado={() => { setModalEditar(null); carregar(); }} />
    </View>
  );
}

// ═══════════════════════════════════════════
// TAB: RELATÓRIOS
// ═══════════════════════════════════════════
function RelatoriosTab() {
  const [tipo, setTipo] = useState('periodo');
  const [inicio, setInicio] = useState(null);
  const [fim, setFim] = useState(null);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const formatarParaAPI = (date) => {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  };

  const gerarRelatorio = async () => {
    if (['periodo', 'sla'].includes(tipo) && (!inicio || !fim)) {
      Alert.alert('Atenção', 'Selecione o período');
      return;
    }
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      if (inicio) params.append('inicio', formatarParaAPI(inicio));
      if (fim) params.append('fim', formatarParaAPI(fim));
      const query = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/admin/relatorios/${tipo}${query}`);
      setDados(data);
    } catch {
      Alert.alert('Erro', 'Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const tipos = [
    { id: 'periodo', label: 'Período' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'tecnicos', label: 'Técnicos' },
    { id: 'sla', label: 'SLA' },
    { id: 'pecas', label: 'Peças' },
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Relatórios</Text>

      {/* Tipo selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {tipos.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.filtroBtn, tipo === t.id && styles.filtroBtnAtivo]}
              onPress={() => { setTipo(t.id); setDados(null); }}
            >
              <Text style={[styles.filtroText, tipo === t.id && styles.filtroTextAtivo]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Date picker nativo */}
      <View style={styles.card}>
        <DatePicker label="Data Início" value={inicio} onChange={setInicio} placeholder="Selecionar início" />
        <DatePicker label="Data Fim" value={fim} onChange={setFim} placeholder="Selecionar fim" />
        <TouchableOpacity style={[styles.addBtn, { alignSelf: 'stretch', alignItems: 'center', marginTop: 8 }]} onPress={gerarRelatorio} disabled={carregando}>
          <Text style={styles.addBtnText}>{carregando ? 'Gerando...' : 'Gerar Relatório'}</Text>
        </TouchableOpacity>
      </View>

      {/* Results: periodo */}
      {dados && tipo === 'periodo' && dados.resumo && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Resumo do Período</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'Total', valor: dados.resumo.total },
              { label: 'Concluídos', valor: dados.resumo.concluidos },
              { label: 'Dentro SLA', valor: dados.resumo.dentro_sla },
              { label: 'Fora SLA', valor: dados.resumo.fora_sla },
              { label: '% SLA', valor: `${dados.resumo.percentual_sla}%` },
              { label: 'Tempo Médio', valor: `${dados.resumo.tempo_medio}min` },
            ].map(item => (
              <View key={item.label} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, minWidth: '45%', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.label}</Text>
                <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>{item.valor}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Results: clientes/tecnicos */}
      {dados && ['clientes', 'tecnicos'].includes(tipo) && Array.isArray(dados) && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
            {tipo === 'clientes' ? 'Por Cliente' : 'Por Técnico'}
          </Text>
          {dados.map((item, i) => (
            <View key={i} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 6 }}>{item.cliente || item.tecnico}</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Total</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.total}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Concluídos</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>{item.concluidos}</Text>
                </View>
                <View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{tipo === 'tecnicos' ? '% SLA' : 'Dentro SLA'}</Text>
                  <Text style={{ color: colors.text, fontWeight: '700' }}>
                    {tipo === 'tecnicos' ? `${item.percentual_sla}%` : item.dentro_sla}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {dados.length === 0 && <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Sem dados para o período</Text>}
        </View>
      )}

      {/* Results: SLA */}
      {dados && tipo === 'sla' && dados.resumo && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Relatório de SLA</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Total', valor: dados.resumo.total_concluidos },
              { label: 'Cumprido', valor: dados.resumo.dentro_sla, cor: colors.green },
              { label: 'Estourado', valor: dados.resumo.fora_sla, cor: colors.red },
              { label: '% SLA', valor: `${dados.resumo.percentual_sla}%` },
            ].map(item => (
              <View key={item.label} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, minWidth: '45%', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.label}</Text>
                <Text style={{ color: item.cor || colors.text, fontSize: 20, fontWeight: '700' }}>{item.valor}</Text>
              </View>
            ))}
          </View>
          {dados.chamados?.map(c => (
            <View key={c.id} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: colors.text, fontWeight: '600' }}>#{c.numero}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{c.clientes?.nome}</Text>
              </View>
              <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.sla_cumprido ? colors.green + '25' : colors.red + '25' }}>
                <Text style={{ color: c.sla_cumprido ? colors.green : colors.red, fontSize: 11, fontWeight: '600' }}>
                  {c.sla_cumprido ? 'Cumprido' : 'Estourado'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Results: Peças */}
      {dados && tipo === 'pecas' && Array.isArray(dados) && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Peças Utilizadas</Text>
          {dados.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Nenhuma peça encontrada</Text>
          ) : dados.map((item, i) => (
            <View key={i} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>#{item.numero}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.data}</Text>
              </View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.cliente} — {item.tecnico}</Text>
              <Text style={{ color: colors.accent, fontSize: 13, marginTop: 6 }}>{item.pecas_utilizadas}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// SHARED: Chamado Card
// ═══════════════════════════════════════════
function ChamadoCard({ item, onPress }) {
  const getSlaInfo = (chamado) => {
    if (!chamado.sla_vence_em || ['concluido', 'cancelado'].includes(chamado.status)) return null;
    if (chamado.sla_pausado_em) return { text: 'SLA pausado', color: colors.yellow };

    const minutos = chamado.sla_tempo_restante_minutos;
    if (minutos != null) {
      if (minutos <= 0) return { text: 'SLA vencido', color: colors.red };
      const h = Math.floor(minutos / 60);
      const m = Math.floor(minutos % 60);
      if (minutos <= 360) return { text: `${h}h ${m}m`, color: colors.yellow };
      return { text: `${h}h restantes`, color: colors.green };
    }

    const diff = new Date(chamado.sla_vence_em) - new Date();
    const horas = diff / (1000 * 60 * 60);
    if (horas <= 0) return { text: 'SLA vencido', color: colors.red };
    if (horas <= 6) return { text: `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m`, color: colors.yellow };
    return { text: `${Math.floor(horas)}h restantes`, color: colors.green };
  };

  const sla = getSlaInfo(item);

  return (
    <TouchableOpacity style={[styles.card, { marginHorizontal: 16, marginBottom: 10 }]} onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>#{item.numero}</Text>
        <View style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12, backgroundColor: (statusColors[item.status] || colors.textSecondary) + '25' }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors[item.status] }}>{statusLabels[item.status]}</Text>
        </View>
      </View>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }} numberOfLines={2}>{item.descricao}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.clientes?.nome}</Text>
        <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8, backgroundColor: (urgenciaColors[item.urgencia] || colors.textSecondary) + '25' }}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: urgenciaColors[item.urgencia] }}>{item.urgencia}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
          {item.tecnicos?.nome || 'Sem técnico'}
        </Text>
        {sla && <Text style={{ color: sla.color, fontSize: 12, fontWeight: '600' }}>{sla.text}</Text>}
      </View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════
// SHARED: Empty State
// ═══════════════════════════════════════════
function EmptyState({ text }) {
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <Text style={{ color: colors.textSecondary, fontSize: 15 }}>{text}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════
// MODAL: Novo Cliente
// ═══════════════════════════════════════════
function ModalNovoCliente({ visible, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);
  const [clienteCriado, setClienteCriado] = useState(null);

  const handleSubmit = async () => {
    if (!form.nome) { Alert.alert('Atenção', 'Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      const { data } = await api.post('/clientes', form);
      setClienteCriado(data);
    } catch {
      Alert.alert('Erro', 'Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const copiarCodigo = () => {
    if (clienteCriado?.codigo_acesso) {
      Clipboard.setString(clienteCriado.codigo_acesso);
      Alert.alert('Copiado!', `Código ${clienteCriado.codigo_acesso} copiado para a área de transferência`);
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
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{clienteCriado ? 'Cliente Criado!' : 'Novo Cliente'}</Text>

          {clienteCriado ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: colors.green, fontSize: 40, marginBottom: 12 }}>✓</Text>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>{clienteCriado.nome}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 20 }}>Cliente cadastrado com sucesso!</Text>

              <View style={{ backgroundColor: colors.bg, borderRadius: 12, borderWidth: 2, borderColor: colors.accent, padding: 20, alignItems: 'center', width: '100%', marginBottom: 20 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>CÓDIGO DE ACESSO</Text>
                <Text style={{ color: colors.accent, fontSize: 28, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 3, marginBottom: 12 }}>
                  {clienteCriado.codigo_acesso}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginBottom: 16 }}>
                  Envie este código ao cliente para que ele acesse o sistema
                </Text>
                <TouchableOpacity style={{ backgroundColor: 'rgba(77,142,245,0.15)', borderWidth: 1, borderColor: colors.blue, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 }} onPress={copiarCodigo}>
                  <Text style={{ color: colors.blue, fontWeight: '600', fontSize: 14 }}>📋 Copiar Código</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.addBtn, { width: '100%', alignItems: 'center' }]} onPress={handleClose}>
                <Text style={styles.addBtnText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.formLabel}>Nome *</Text>
              <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} placeholder="Nome completo ou razão social" placeholderTextColor={colors.textSecondary} />
              <Text style={styles.formLabel}>E-mail</Text>
              <TextInput style={styles.formInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="email@exemplo.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" />
              <Text style={styles.formLabel}>Telefone</Text>
              <TextInput style={styles.formInput} value={form.telefone} onChangeText={v => setForm(f => ({ ...f, telefone: v }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />

              <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
                <Text style={styles.addBtnText}>{salvando ? 'Criando...' : 'Cadastrar Cliente'}</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 8 }}>O código de acesso será gerado automaticamente</Text>
              <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Editar Cliente
// ═══════════════════════════════════════════
function ModalEditarCliente({ cliente, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (cliente) {
      setForm({ nome: cliente.nome || '', email: cliente.email || '', telefone: cliente.telefone || '' });
    }
  }, [cliente]);

  const handleSubmit = async () => {
    if (!form.nome) { Alert.alert('Atenção', 'Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/clientes/${cliente.id}`, form);
      Alert.alert('Sucesso', 'Cliente atualizado!');
      onAtualizado();
    } catch {
      Alert.alert('Erro', 'Erro ao atualizar cliente');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={!!cliente} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Cliente</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} />
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput style={styles.formInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.formLabel}>Telefone</Text>
          <TextInput style={styles.formInput} value={form.telefone} onChangeText={v => setForm(f => ({ ...f, telefone: v }))} keyboardType="phone-pad" />

          <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
            <Text style={styles.addBtnText}>{salvando ? 'Salvando...' : 'Salvar Alterações'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Detalhe Cliente
// ═══════════════════════════════════════════
function ModalDetalheCliente({ cliente, onClose, onAtualizado }) {
  const [detalhes, setDetalhes] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [gerandoCodigo, setGerandoCodigo] = useState(false);

  useEffect(() => {
    if (cliente) {
      api.get(`/clientes/${cliente.id}`).then(res => setDetalhes(res.data)).catch(() => {});
      api.get(`/chamados?cliente_id=${cliente.id}`).then(res => setChamados(res.data?.data || [])).catch(() => setChamados([]));
    } else {
      setDetalhes(null);
      setChamados([]);
    }
  }, [cliente]);

  const copiarCodigo = () => {
    const codigo = detalhes?.codigo_acesso || cliente?.codigo_acesso;
    if (codigo) {
      Clipboard.setString(codigo);
      Alert.alert('Copiado!', `Código ${codigo} copiado`);
    }
  };

  const gerarNovoCodigo = () => {
    Alert.alert('Confirmar', 'Gerar novo código? O anterior será invalidado.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Gerar', style: 'destructive', onPress: async () => {
          setGerandoCodigo(true);
          try {
            const { data } = await api.post(`/clientes/${cliente.id}/novo-codigo`);
            setDetalhes(prev => prev ? { ...prev, codigo_acesso: data.codigo_acesso } : prev);
            Alert.alert('Sucesso', `Novo código: ${data.codigo_acesso}`);
            onAtualizado();
          } catch {
            Alert.alert('Erro', 'Erro ao gerar novo código');
          } finally {
            setGerandoCodigo(false);
          }
        }
      },
    ]);
  };

  const codigoAtual = detalhes?.codigo_acesso || cliente?.codigo_acesso;

  return (
    <Modal visible={!!cliente} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{cliente?.nome}</Text>

            {/* Código de acesso */}
            <View style={{ backgroundColor: colors.bg, borderRadius: 12, borderWidth: 2, borderColor: colors.accent, padding: 16, alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>CÓDIGO DE ACESSO</Text>
              <Text style={{ color: colors.accent, fontSize: 24, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 2, marginBottom: 12 }}>
                {codigoAtual}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ backgroundColor: 'rgba(77,142,245,0.15)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }} onPress={copiarCodigo}>
                  <Text style={{ color: colors.blue, fontWeight: '600', fontSize: 12 }}>📋 Copiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'rgba(201,162,39,0.15)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }} onPress={gerarNovoCodigo} disabled={gerandoCodigo}>
                  <Text style={{ color: colors.yellow, fontWeight: '600', fontSize: 12 }}>{gerandoCodigo ? 'Gerando...' : '🔄 Novo Código'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dados */}
            <View style={{ marginBottom: 20 }}>
              <InfoRow label="E-mail" value={cliente?.email || 'Não informado'} />
              <InfoRow label="Telefone" value={cliente?.telefone || 'Não informado'} />
              <InfoRow label="Cadastrado em" value={cliente ? new Date(cliente.criado_em).toLocaleDateString('pt-BR') : ''} />
            </View>

            {/* Impressoras */}
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>
              🖨️ Impressoras ({detalhes?.impressoras?.length || 0})
            </Text>
            {detalhes?.impressoras?.length > 0 ? detalhes.impressoras.map(imp => (
              <View key={imp.id} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: colors.text, fontWeight: '500' }}>{imp.modelo}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>S/N: {imp.numero_serie}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, backgroundColor: imp.ativo ? 'rgba(61,158,107,0.15)' : 'rgba(138,148,166,0.15)' }}>
                    <Text style={{ color: imp.ativo ? colors.green : colors.textSecondary, fontSize: 10 }}>{imp.ativo ? 'Ativa' : 'Inativa'}</Text>
                  </View>
                  <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 4, backgroundColor: 'rgba(77,142,245,0.15)' }}>
                    <Text style={{ color: colors.blue, fontSize: 10 }}>{imp.tipo_contrato}</Text>
                  </View>
                </View>
              </View>
            )) : (
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginBottom: 16 }}>Nenhuma impressora cadastrada</Text>
            )}

            {/* Chamados */}
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginTop: 12, marginBottom: 8 }}>
              📋 Chamados Recentes ({chamados.length})
            </Text>
            {chamados.length > 0 ? chamados.slice(0, 5).map(ch => (
              <View key={ch.id} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 10, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 12 }}>#{ch.numero}</Text>
                  <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8, backgroundColor: (statusColors[ch.status] || '#888') + '25' }}>
                    <Text style={{ color: statusColors[ch.status], fontSize: 10, fontWeight: '600' }}>{statusLabels[ch.status]}</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{new Date(ch.criado_em).toLocaleDateString('pt-BR')}</Text>
              </View>
            )) : (
              <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: 'italic' }}>Nenhum chamado</Text>
            )}

            <TouchableOpacity onPress={onClose} style={{ marginTop: 20, alignItems: 'center', paddingVertical: 14, backgroundColor: colors.accent, borderRadius: 8 }}>
              <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Nova Impressora
// ═══════════════════════════════════════════
function ModalNovaImpressora({ visible, clientes, onClose, onCriada }) {
  const [form, setForm] = useState({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
  const [salvando, setSalvando] = useState(false);
  const [showClientes, setShowClientes] = useState(false);
  const [showContrato, setShowContrato] = useState(false);

  const contratos = [
    { id: 'locacao', label: 'Locação' },
    { id: 'venda', label: 'Venda' },
    { id: 'manutencao', label: 'Manutenção' },
  ];

  const clienteSelecionado = clientes.find(c => c.id === form.cliente_id);

  const handleSubmit = async () => {
    if (!form.cliente_id || !form.modelo || !form.numero_serie) {
      Alert.alert('Atenção', 'Todos os campos obrigatórios devem ser preenchidos');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/impressoras', form);
      Alert.alert('Sucesso', 'Impressora cadastrada!');
      setForm({ cliente_id: '', modelo: '', numero_serie: '', tipo_contrato: 'locacao' });
      onCriada();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao cadastrar');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Nova Impressora</Text>

            <Text style={styles.formLabel}>Cliente *</Text>
            <TouchableOpacity style={styles.formInput} onPress={() => setShowClientes(!showClientes)}>
              <Text style={{ color: clienteSelecionado ? colors.text : colors.textSecondary }}>
                {clienteSelecionado ? clienteSelecionado.nome : 'Selecionar cliente...'}
              </Text>
            </TouchableOpacity>
            {showClientes && clientes.map(c => (
              <TouchableOpacity key={c.id} style={{ backgroundColor: colors.bg, padding: 12, borderRadius: 6, marginBottom: 4, borderWidth: form.cliente_id === c.id ? 1 : 0, borderColor: colors.accent }}
                onPress={() => { setForm(f => ({ ...f, cliente_id: c.id })); setShowClientes(false); }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>{c.nome}</Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.formLabel}>Modelo *</Text>
            <TextInput style={styles.formInput} value={form.modelo} onChangeText={v => setForm(f => ({ ...f, modelo: v }))} placeholder="Ex: Ricoh Pro C5200" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.formLabel}>Número de Série *</Text>
            <TextInput style={styles.formInput} value={form.numero_serie} onChangeText={v => setForm(f => ({ ...f, numero_serie: v }))} placeholder="Ex: W123456789" placeholderTextColor={colors.textSecondary} />

            <Text style={styles.formLabel}>Tipo de Contrato</Text>
            <TouchableOpacity style={styles.formInput} onPress={() => setShowContrato(!showContrato)}>
              <Text style={{ color: colors.text }}>{contratos.find(c => c.id === form.tipo_contrato)?.label}</Text>
            </TouchableOpacity>
            {showContrato && contratos.map(c => (
              <TouchableOpacity key={c.id} style={{ backgroundColor: colors.bg, padding: 12, borderRadius: 6, marginBottom: 4, borderWidth: form.tipo_contrato === c.id ? 1 : 0, borderColor: colors.accent }}
                onPress={() => { setForm(f => ({ ...f, tipo_contrato: c.id })); setShowContrato(false); }}>
                <Text style={{ color: colors.text, fontSize: 14 }}>{c.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 12 }]} onPress={handleSubmit} disabled={salvando}>
              <Text style={styles.addBtnText}>{salvando ? 'Cadastrando...' : 'Cadastrar Impressora'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Novo Técnico
// ═══════════════════════════════════════════
function ModalNovoTecnico({ visible, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', whatsapp: '' });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async () => {
    if (!form.nome || !form.email || !form.senha) {
      Alert.alert('Atenção', 'Nome, e-mail e senha são obrigatórios');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/tecnicos', form);
      Alert.alert('Sucesso', 'Técnico cadastrado!');
      setForm({ nome: '', email: '', senha: '', whatsapp: '' });
      onCriado();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao cadastrar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Novo Técnico</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} placeholder="Nome completo" placeholderTextColor={colors.textSecondary} />
          <Text style={styles.formLabel}>E-mail *</Text>
          <TextInput style={styles.formInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="tecnico@email.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.formLabel}>Senha *</Text>
          <TextInput style={styles.formInput} value={form.senha} onChangeText={v => setForm(f => ({ ...f, senha: v }))} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textSecondary} secureTextEntry />
          <Text style={styles.formLabel}>WhatsApp</Text>
          <TextInput style={styles.formInput} value={form.whatsapp} onChangeText={v => setForm(f => ({ ...f, whatsapp: v }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />

          <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
            <Text style={styles.addBtnText}>{salvando ? 'Criando...' : 'Cadastrar Técnico'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Editar Técnico
// ═══════════════════════════════════════════
function ModalEditarTecnico({ tecnico, onClose, onAtualizado }) {
  const [form, setForm] = useState({ nome: '', whatsapp: '', ativo: true });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (tecnico) {
      setForm({ nome: tecnico.nome || '', whatsapp: tecnico.whatsapp || '', ativo: tecnico.ativo !== false });
    }
  }, [tecnico]);

  const handleSubmit = async () => {
    if (!form.nome) { Alert.alert('Atenção', 'Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      await api.put(`/tecnicos/${tecnico.id}`, form);
      Alert.alert('Sucesso', 'Técnico atualizado!');
      onAtualizado();
    } catch {
      Alert.alert('Erro', 'Erro ao atualizar técnico');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={!!tecnico} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Técnico</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} />
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput style={[styles.formInput, { color: colors.textSecondary }]} value={tecnico?.email || ''} editable={false} />
          <Text style={styles.formLabel}>WhatsApp</Text>
          <TextInput style={styles.formInput} value={form.whatsapp} onChangeText={v => setForm(f => ({ ...f, whatsapp: v }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
          <Text style={styles.formLabel}>Status</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <TouchableOpacity
              style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: form.ativo ? 'rgba(61,158,107,0.2)' : colors.bg, borderWidth: 1, borderColor: form.ativo ? colors.green : colors.border }}
              onPress={() => setForm(f => ({ ...f, ativo: true }))}>
              <Text style={{ color: form.ativo ? colors.green : colors.textSecondary, fontWeight: '600' }}>Ativo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', backgroundColor: !form.ativo ? 'rgba(232,76,30,0.2)' : colors.bg, borderWidth: 1, borderColor: !form.ativo ? colors.red : colors.border }}
              onPress={() => setForm(f => ({ ...f, ativo: false }))}>
              <Text style={{ color: !form.ativo ? colors.red : colors.textSecondary, fontWeight: '600' }}>Inativo</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 16 }]} onPress={handleSubmit} disabled={salvando}>
            <Text style={styles.addBtnText}>{salvando ? 'Salvando...' : 'Salvar Alterações'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// SHARED: InfoRow
// ═══════════════════════════════════════════
function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>{value}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card, padding: 20, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  headerBtn: { padding: 8 },

  // Bottom tabs
  bottomTabs: {
    flexDirection: 'row', backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 8,
  },
  tabBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 4,
  },
  tabBtnAtivo: {},
  tabLabel: { fontSize: 9, color: colors.textSecondary, marginTop: 2 },
  tabLabelAtivo: { color: colors.accent, fontWeight: '600' },

  // Dashboard
  dashGrid: { flexDirection: 'row', padding: 16, gap: 8 },
  dashCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  dashValor: { fontSize: 22, fontWeight: '700' },
  dashLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  // Cards
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },

  // Filtros
  filtroBtn: {
    paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginRight: 8,
  },
  filtroBtnAtivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  filtroText: { color: colors.textSecondary, fontSize: 12 },
  filtroTextAtivo: { color: colors.text, fontWeight: '600' },

  // Add button
  addBtn: {
    backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 20,
  },
  addBtnText: { color: colors.text, fontWeight: '600', fontSize: 14 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, paddingBottom: 40,
    maxHeight: '85%',
  },
  modalTitle: {
    color: colors.text, fontSize: 20, fontWeight: '700', marginBottom: 20, textAlign: 'center',
  },

  // Forms
  formLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 6, marginTop: 12 },
  formInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 14,
  },
});
