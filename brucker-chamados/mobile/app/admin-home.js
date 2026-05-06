import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  Alert, TextInput, Modal, ScrollView, ActivityIndicator, Clipboard, Platform,
  Dimensions, KeyboardAvoidingView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../lib/api';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { statusColors, statusLabels, urgenciaColors } from '../lib/theme';
import DatePicker from '../components/DatePicker';

function formatarTelefone(valor) {
  if (!valor) return '';
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
}

// ─── Bottom Tab Bar ───
const TABS = [
  { id: 'dashboard', label: 'Painel', icon: 'bar-chart-2' },
  { id: 'chamados', label: 'Chamados', icon: 'file-text' },
  { id: 'clientes', label: 'Clientes', icon: 'users' },
  { id: 'impressoras', label: 'Impress.', icon: 'printer' },
  { id: 'tecnicos', label: 'Técnicos', icon: 'tool' },
  { id: 'avaliacoes', label: 'Aval.', icon: 'star' },
  { id: 'relatorios', label: 'Relatórios', icon: 'trending-up' },
];

export default function AdminHomeScreen() {
  const { colors } = useTheme();
  const [aba, setAba] = useState('dashboard');
  const [admin, setAdmin] = useState(null);
  const [abertosCount, setAbertosCount] = useState(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    AsyncStorage.getItem('admin').then(d => { if (d) setAdmin(JSON.parse(d)); });
    api.get('/admin/dashboard').then(res => {
      setAbertosCount(res.data?.abertos || 0);
    }).catch(() => {});
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
      {aba === 'dashboard' && <DashboardTab router={router} onAbertosChange={setAbertosCount} />}
      {aba === 'chamados' && <ChamadosTab router={router} />}
      {aba === 'clientes' && <ClientesTab />}
      {aba === 'impressoras' && <ImpressorasTab />}
      {aba === 'tecnicos' && <TecnicosTab />}
      {aba === 'avaliacoes' && <AvaliacoesTab />}
      {aba === 'relatorios' && <RelatoriosTab />}

      {/* Bottom Tabs */}
      <View style={[styles.bottomTabs, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabBtn, aba === tab.id && styles.tabBtnAtivo]}
            onPress={() => setAba(tab.id)}
          >
            <View style={{ position: 'relative' }}>
              <Feather name={tab.icon} size={20} color={aba === tab.id ? colors.accent : colors.textSecondary} />
              {tab.id === 'chamados' && abertosCount > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -8,
                  backgroundColor: colors.red,
                  borderRadius: 8, minWidth: 16, height: 16,
                  alignItems: 'center', justifyContent: 'center',
                  paddingHorizontal: 4,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '700' }}>{abertosCount}</Text>
                </View>
              )}
            </View>
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
function DashboardTab({ router, onAbertosChange }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
      onAbertosChange?.(dashRes.data?.abertos || 0);
    } catch {}
  }, [onAbertosChange]);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = async () => { setRefreshing(true); await carregar(); setRefreshing(false); };

  const cards = [
    { label: 'Abertos', valor: dashboard?.abertos || 0, cor: colors.blue },
    { label: 'Atribuídos', valor: dashboard?.atribuidos || 0, cor: colors.purple },
    { label: 'Em Atendimento', valor: dashboard?.em_atendimento || 0, cor: colors.yellow },
    { label: 'SLA Vencido', valor: dashboard?.sla_vencido || 0, cor: colors.red },
    { label: 'Concluídos Hoje', valor: dashboard?.concluidos_hoje || 0, cor: colors.green },
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
                <Feather name="alert-triangle" size={14} color={colors.red} />{' '}{dashboard.sla_vencido} chamado(s) com SLA vencido!
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const excluirCliente = (item) => {
    Alert.alert('Confirmar', `Excluir o cliente "${item.nome}"? Esta ação não pode ser desfeita.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/clientes/${item.id}`);
          Alert.alert('Sucesso', 'Cliente excluído!');
          carregar();
        } catch {
          Alert.alert('Erro', 'Erro ao excluir cliente');
        }
      }},
    ]);
  };

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
                {item.email && <Text style={{ color: colors.textSecondary, fontSize: 12 }}><Feather name="mail" size={11} color={colors.textSecondary} /> {item.email}</Text>}
                {item.telefone && <Text style={{ color: colors.textSecondary, fontSize: 12 }}><Feather name="phone" size={11} color={colors.textSecondary} /> {formatarTelefone(item.telefone)}</Text>}
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
                <TouchableOpacity onPress={() => excluirCliente(item)}>
                  <Text style={{ color: colors.red, fontSize: 12, fontWeight: '600' }}>Excluir</Text>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const excluirImpressora = (item) => {
    Alert.alert('Confirmar', `Excluir a impressora "${item.modelo}" (S/N: ${item.numero_serie})?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/impressoras/${item.id}`);
          Alert.alert('Sucesso', 'Impressora excluída!');
          carregar();
        } catch {
          Alert.alert('Erro', 'Erro ao excluir impressora');
        }
      }},
    ]);
  };

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
              <Feather name="printer" size={24} color={colors.accent} />
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
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border }}>
              <TouchableOpacity onPress={() => excluirImpressora(item)}>
                <Text style={{ color: colors.red, fontSize: 12, fontWeight: '600' }}>Excluir</Text>
              </TouchableOpacity>
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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

  const excluirTecnico = (item) => {
    Alert.alert('Confirmar', `Excluir o técnico "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          await api.delete(`/tecnicos/${item.id}`);
          Alert.alert('Sucesso', 'Técnico excluído!');
          carregar();
        } catch {
          Alert.alert('Erro', 'Erro ao excluir técnico');
        }
      }},
    ]);
  };

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
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}><Feather name="mail" size={11} color={colors.textSecondary} /> {item.email}</Text>
                {item.whatsapp && <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}><Feather name="phone" size={11} color={colors.textSecondary} /> {formatarTelefone(item.whatsapp)}</Text>}
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
              <TouchableOpacity onPress={() => excluirTecnico(item)}>
                <Text style={{ color: colors.red, fontSize: 12, fontWeight: '600' }}>Excluir</Text>
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
const STATUS_OPCOES_REL = [
  { value: '', label: 'Todos' },
  { value: 'aberto', label: 'Aberto' },
  { value: 'atribuido', label: 'Atribuído' },
  { value: 'em_atendimento', label: 'Em Atend.' },
  { value: 'aguardando_peca', label: 'Aguard. Peça' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
];

const TIPO_OPCOES_REL = [
  { value: '', label: 'Todos' },
  { value: 'preventivo', label: 'Preventivo' },
  { value: 'corretivo', label: 'Corretivo' },
];

const URGENCIA_OPCOES_REL = [
  { value: '', label: 'Todas' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const FILTROS_REL_VAZIOS = {
  inicio: null,
  fim: null,
  cliente_id: '',
  tecnico_id: '',
  status: '',
  tipo: '',
  urgencia: '',
};

function ChipsFiltro({ label, opcoes, valor, onChange, colors, styles }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {opcoes.map(o => (
            <TouchableOpacity
              key={o.value || 'todos'}
              style={[styles.filtroBtn, valor === o.value && styles.filtroBtnAtivo]}
              onPress={() => onChange(o.value)}
            >
              <Text style={[styles.filtroText, valor === o.value && styles.filtroTextAtivo]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function PickerSeletor({ label, valor, opcoes, onChange, placeholder, colors }) {
  const [aberto, setAberto] = useState(false);
  const selecionado = opcoes.find(o => o.id === valor);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</Text>
      <TouchableOpacity
        onPress={() => setAberto(true)}
        style={{
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: selecionado ? colors.text : colors.textSecondary, fontSize: 14 }}>
          {selecionado ? selecionado.nome : (placeholder || 'Todos')}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      <Modal visible={aberto} animationType="slide" transparent onRequestClose={() => setAberto(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '70%', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{label}</Text>
              <TouchableOpacity onPress={() => setAberto(false)}>
                <Feather name="x" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
                onPress={() => { onChange(''); setAberto(false); }}
              >
                <Text style={{ color: !valor ? colors.accent : colors.text, fontSize: 14, fontWeight: !valor ? '700' : '400' }}>
                  Todos
                </Text>
              </TouchableOpacity>
              {opcoes.map(o => (
                <TouchableOpacity
                  key={o.id}
                  style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}
                  onPress={() => { onChange(o.id); setAberto(false); }}
                >
                  <Text style={{
                    color: valor === o.id ? colors.accent : colors.text,
                    fontSize: 14,
                    fontWeight: valor === o.id ? '700' : '400',
                  }}>
                    {o.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function RelatoriosTab() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [filtros, setFiltros] = useState(FILTROS_REL_VAZIOS);
  const [clientes, setClientes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    api.get('/clientes').then(r => setClientes(r.data || [])).catch(() => {});
    api.get('/tecnicos').then(r => setTecnicos((r.data || []).filter(t => t.ativo))).catch(() => {});
  }, []);

  const setF = (k, v) => {
    setFiltros(prev => ({ ...prev, [k]: v }));
    setDados(null);
  };

  const limparFiltros = () => {
    setFiltros(FILTROS_REL_VAZIOS);
    setDados(null);
  };

  const formatarDataAPI = (d) => (d ? d.toISOString().split('T')[0] : null);

  const buildParams = (extra = {}) => {
    const params = {};
    Object.entries({ ...filtros, ...extra }).forEach(([k, v]) => {
      if (!v) return;
      if (k === 'inicio' || k === 'fim') params[k] = formatarDataAPI(v);
      else params[k] = v;
    });
    return params;
  };

  const gerarRelatorio = async () => {
    setCarregando(true);
    try {
      const { data } = await api.get('/admin/relatorios/historico', { params: buildParams() });
      setDados(data);
      if ((data?.chamados || []).length === 0) {
        Alert.alert('Sem resultados', 'Nenhum chamado encontrado para os filtros aplicados.');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao gerar relatório');
    } finally {
      setCarregando(false);
    }
  };

  const exportarPDF = async () => {
    if (!dados || (dados.chamados || []).length === 0) {
      Alert.alert('Atenção', 'Gere o relatório antes de exportar.');
      return;
    }
    setExportando(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const params = new URLSearchParams();
      Object.entries(buildParams({ formato: 'pdf' })).forEach(([k, v]) => params.append(k, v));
      const url = `${api.defaults.baseURL}/admin/relatorios/historico?${params.toString()}`;
      const fileUri = FileSystem.cacheDirectory + 'relatorio-historico.pdf';
      const result = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (result.status !== 200) {
        throw new Error(`Falha ao baixar (${result.status})`);
      }
      const podeCompartilhar = await Sharing.isAvailableAsync();
      if (!podeCompartilhar) {
        Alert.alert('PDF salvo', `Arquivo salvo em: ${result.uri}`);
        return;
      }
      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Compartilhar relatório',
      });
    } catch (err) {
      Alert.alert('Erro', err?.message || 'Falha ao exportar PDF');
    } finally {
      setExportando(false);
    }
  };

  const resumo = dados?.resumo;
  const chamados = dados?.chamados || [];

  const slaInfo = (c) => {
    if (c.status !== 'concluido' || !c.sla_vence_em) return null;
    const cumprido = new Date(c.atualizado_em) <= new Date(c.sla_vence_em);
    return { texto: cumprido ? 'Cumprido' : 'Estourado', cor: cumprido ? colors.green : colors.red };
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}>
      <View>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Relatórios</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
          Histórico e comprovação de atendimentos
        </Text>
      </View>

      {/* ============ Filtros ============ */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Feather name="filter" size={16} color={colors.accent} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>Filtros</Text>
        </View>

        <DatePicker label="Data início" value={filtros.inicio} onChange={(d) => setF('inicio', d)} placeholder="Início" />
        <DatePicker label="Data fim" value={filtros.fim} onChange={(d) => setF('fim', d)} placeholder="Fim" />

        <PickerSeletor
          label="Cliente"
          valor={filtros.cliente_id}
          opcoes={clientes}
          onChange={(v) => setF('cliente_id', v)}
          placeholder="Todos"
          colors={colors}
        />
        <PickerSeletor
          label="Técnico"
          valor={filtros.tecnico_id}
          opcoes={tecnicos}
          onChange={(v) => setF('tecnico_id', v)}
          placeholder="Todos"
          colors={colors}
        />
        <ChipsFiltro
          label="Status"
          opcoes={STATUS_OPCOES_REL}
          valor={filtros.status}
          onChange={(v) => setF('status', v)}
          colors={colors}
          styles={styles}
        />
        <ChipsFiltro
          label="Tipo"
          opcoes={TIPO_OPCOES_REL}
          valor={filtros.tipo}
          onChange={(v) => setF('tipo', v)}
          colors={colors}
          styles={styles}
        />
        <ChipsFiltro
          label="Urgência"
          opcoes={URGENCIA_OPCOES_REL}
          valor={filtros.urgencia}
          onChange={(v) => setF('urgencia', v)}
          colors={colors}
          styles={styles}
        />

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.addBtn, { flex: 1, alignItems: 'center', opacity: carregando ? 0.6 : 1 }]}
            onPress={gerarRelatorio}
            disabled={carregando}
          >
            <Text style={styles.addBtnText}>{carregando ? 'Gerando...' : 'Gerar Relatório'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={limparFiltros}
          >
            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ============ Botão de Export ============ */}
      {dados && chamados.length > 0 && (
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent,
            padding: 14,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            opacity: exportando ? 0.6 : 1,
          }}
          onPress={exportarPDF}
          disabled={exportando}
        >
          {exportando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Feather name="file-text" size={18} color="#FFFFFF" />
          )}
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
            {exportando ? 'Exportando...' : 'Exportar PDF'}
          </Text>
        </TouchableOpacity>
      )}

      {/* ============ Resumo ============ */}
      {resumo && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Resumo</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { label: 'Total', valor: String(resumo.total ?? 0) },
              { label: 'Concluídos', valor: String(resumo.concluidos ?? 0) },
              { label: 'Dentro SLA', valor: String(resumo.dentro_sla ?? 0), cor: colors.green },
              { label: 'Fora SLA', valor: String(resumo.fora_sla ?? 0), cor: colors.red },
              { label: '% SLA', valor: `${resumo.percentual_sla ?? 0}%` },
              { label: 'Tempo Médio', valor: resumo.tempo_medio ? `${resumo.tempo_medio} min` : '-' },
              { label: 'Avaliação', valor: resumo.avaliacao_media ? `${resumo.avaliacao_media} ★` : '-' },
              { label: 'Cancelados', valor: String(resumo.cancelados ?? 0) },
            ].map(item => (
              <View key={item.label} style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 12, minWidth: '45%', flex: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{item.label}</Text>
                <Text style={{ color: item.cor || colors.text, fontSize: 20, fontWeight: '700' }}>{item.valor}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ============ Lista de chamados ============ */}
      {dados && (
        <View style={styles.card}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 12 }}>
            Chamados ({chamados.length})
          </Text>
          {chamados.length === 0 ? (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingVertical: 24 }}>
              Nenhum chamado encontrado.
            </Text>
          ) : (
            chamados.map(c => {
              const sla = slaInfo(c);
              const stCor = statusColors[c.status] || colors.textSecondary;
              const stLbl = statusLabels[c.status] || c.status;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={{
                    backgroundColor: colors.bg,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 8,
                    borderLeftWidth: 3,
                    borderLeftColor: stCor,
                  }}
                  onPress={() => router.push(`/chamado/${c.id}`)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>#{c.numero}</Text>
                    <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, backgroundColor: stCor + '25' }}>
                      <Text style={{ color: stCor, fontSize: 11, fontWeight: '600' }}>{stLbl}</Text>
                    </View>
                  </View>
                  <Text style={{ color: colors.text, fontSize: 13, marginBottom: 2 }}>
                    {c.clientes?.nome || '-'}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                    {c.tecnicos?.nome ? `Téc.: ${c.tecnicos.nome}` : 'Sem técnico'} · {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                  </Text>
                  {sla && (
                    <View style={{ marginTop: 6, alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, backgroundColor: sla.cor + '25' }}>
                      <Text style={{ color: sla.cor, fontSize: 10, fontWeight: '600' }}>SLA {sla.texto}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// TAB: AVALIAÇÕES
// ═══════════════════════════════════════════
function AvaliacoesTab() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [stats, setStats] = useState({ total: 0, media: '0', distribuicao: [] });
  const [tecnicos, setTecnicos] = useState([]);
  const [filtros, setFiltros] = useState({ nota: '', tecnico_id: '', inicio: null, fim: null });
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filtrosVisiveis, setFiltrosVisiveis] = useState(false);
  const limite = 20;

  const buscar = useCallback(async (pag = 1) => {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.set('page', pag);
      params.set('limit', limite);
      if (filtros.nota) params.set('nota', filtros.nota);
      if (filtros.tecnico_id) params.set('tecnico_id', filtros.tecnico_id);
      if (filtros.inicio) params.set('inicio', filtros.inicio.toISOString().split('T')[0]);
      if (filtros.fim) params.set('fim', filtros.fim.toISOString().split('T')[0]);
      const { data } = await api.get(`/admin/avaliacoes?${params.toString()}`);
      setAvaliacoes(data.data);
      setStats(data.stats);
      setTotal(data.total || 0);
      setPagina(pag);
    } catch {
      Alert.alert('Erro', 'Erro ao buscar avaliações');
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    buscar();
    api.get('/tecnicos').then(({ data }) => setTecnicos(data)).catch(() => {});
  }, []);

  const onRefresh = async () => { setRefreshing(true); await buscar(1); setRefreshing(false); };

  const totalPaginas = Math.ceil(total / limite);

  const renderEstrelas = (nota) => (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Feather key={n} name="star" size={14} color={n <= nota ? colors.yellow : colors.border} />
      ))}
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>Avaliações</Text>

      {/* Cards de resumo */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Nota Média */}
          <View style={[styles.card, { minWidth: 140 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 6 }}>Nota Média</Text>
            <Text style={{ color: colors.yellow, fontSize: 28, fontWeight: '700' }}>{stats.media}</Text>
            {renderEstrelas(Math.round(Number(stats.media)))}
          </View>

          {/* Total */}
          <View style={[styles.card, { minWidth: 120 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 6 }}>Total</Text>
            <Text style={{ color: colors.text, fontSize: 28, fontWeight: '700' }}>{stats.total}</Text>
          </View>

          {/* Distribuição */}
          <View style={[styles.card, { minWidth: 180 }]}>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginBottom: 6 }}>Distribuição</Text>
            {[5, 4, 3, 2, 1].map(n => {
              const item = stats.distribuicao?.find(d => d.nota === n) || { count: 0 };
              const pct = stats.total > 0 ? (item.count / stats.total) * 100 : 0;
              return (
                <View key={n} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, width: 12 }}>{n}</Text>
                  <Feather name="star" size={8} color={colors.yellow} />
                  <View style={{ flex: 1, height: 6, backgroundColor: colors.bg, borderRadius: 3, overflow: 'hidden' }}>
                    <View style={{ width: `${pct}%`, height: '100%', backgroundColor: colors.yellow, borderRadius: 3 }} />
                  </View>
                  <Text style={{ color: colors.textSecondary, fontSize: 10, width: 20, textAlign: 'right' }}>{item.count}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Filtros toggle */}
      <TouchableOpacity
        style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setFiltrosVisiveis(v => !v)}
      >
        <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>Filtros</Text>
        <Feather name={filtrosVisiveis ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {filtrosVisiveis && (
        <View style={[styles.card, { gap: 12 }]}>
          {/* Filtro por nota */}
          <View>
            <Text style={styles.formLabel}>Nota</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.filtroBtn, !filtros.nota && styles.filtroBtnAtivo]}
                  onPress={() => setFiltros(f => ({ ...f, nota: '' }))}
                >
                  <Text style={[styles.filtroText, !filtros.nota && styles.filtroTextAtivo]}>Todas</Text>
                </TouchableOpacity>
                {[5, 4, 3, 2, 1].map(n => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.filtroBtn, filtros.nota === String(n) && styles.filtroBtnAtivo]}
                    onPress={() => setFiltros(f => ({ ...f, nota: String(n) }))}
                  >
                    <Text style={[styles.filtroText, filtros.nota === String(n) && styles.filtroTextAtivo]}>{n} ★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Filtro por técnico */}
          <View>
            <Text style={styles.formLabel}>Técnico</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.filtroBtn, !filtros.tecnico_id && styles.filtroBtnAtivo]}
                  onPress={() => setFiltros(f => ({ ...f, tecnico_id: '' }))}
                >
                  <Text style={[styles.filtroText, !filtros.tecnico_id && styles.filtroTextAtivo]}>Todos</Text>
                </TouchableOpacity>
                {tecnicos.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.filtroBtn, filtros.tecnico_id === t.id && styles.filtroBtnAtivo]}
                    onPress={() => setFiltros(f => ({ ...f, tecnico_id: t.id }))}
                  >
                    <Text style={[styles.filtroText, filtros.tecnico_id === t.id && styles.filtroTextAtivo]}>{t.nome}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Filtro por data */}
          <DatePicker label="Data Início" value={filtros.inicio} onChange={v => setFiltros(f => ({ ...f, inicio: v }))} placeholder="Selecionar início" />
          <DatePicker label="Data Fim" value={filtros.fim} onChange={v => setFiltros(f => ({ ...f, fim: v }))} placeholder="Selecionar fim" />

          <TouchableOpacity style={[styles.addBtn, { alignSelf: 'stretch', alignItems: 'center', marginTop: 4 }]} onPress={() => buscar(1)}>
            <Text style={styles.addBtnText}>{carregando ? 'Buscando...' : 'Buscar'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de avaliações */}
      {carregando && avaliacoes.length === 0 ? (
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 32 }} />
      ) : avaliacoes.length === 0 ? (
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 40 }]}>
          <Feather name="star" size={32} color={colors.border} />
          <Text style={{ color: colors.textSecondary, marginTop: 12 }}>Nenhuma avaliação encontrada</Text>
        </View>
      ) : (
        <>
          {avaliacoes.map(a => (
            <View key={a.id} style={[styles.card, { gap: 8 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 14 }}>
                  #{a.chamados?.numero || '—'}
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {renderEstrelas(a.nota)}
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{a.nota}/5</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Cliente</Text>
                  <Text style={{ color: colors.text, fontSize: 13 }}>{a.clientes?.nome || '—'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Técnico</Text>
                  <Text style={{ color: colors.text, fontSize: 13 }}>{a.chamados?.tecnicos?.nome || '—'}</Text>
                </View>
              </View>

              {a.comentario ? (
                <View style={{ backgroundColor: colors.bg, borderRadius: 8, padding: 10, marginTop: 4 }}>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{a.comentario}</Text>
                </View>
              ) : null}
            </View>
          ))}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
              <TouchableOpacity
                style={[styles.filtroBtn, pagina <= 1 && { opacity: 0.4 }]}
                onPress={() => pagina > 1 && buscar(pagina - 1)}
                disabled={pagina <= 1}
              >
                <Text style={styles.filtroText}>Anterior</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{pagina} / {totalPaginas}</Text>
              <TouchableOpacity
                style={[styles.filtroBtn, pagina >= totalPaginas && { opacity: 0.4 }]}
                onPress={() => pagina < totalPaginas && buscar(pagina + 1)}
                disabled={pagina >= totalPaginas}
              >
                <Text style={styles.filtroText}>Próxima</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// SHARED: Chamado Card
// ═══════════════════════════════════════════
function ChamadoCard({ item, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
  const { colors } = useTheme();
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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>{clienteCriado ? 'Cliente Criado!' : 'Novo Cliente'}</Text>

          {clienteCriado ? (
            <View style={{ alignItems: 'center' }}>
              <Feather name="check-circle" size={40} color={colors.green} style={{ marginBottom: 12 }} />
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
                  <Text style={{ color: colors.blue, fontWeight: '600', fontSize: 14 }}><Feather name="copy" size={14} color={colors.blue} /> Copiar Código</Text>
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
              <TextInput style={styles.formInput} value={formatarTelefone(form.telefone)} onChangeText={v => setForm(f => ({ ...f, telefone: v.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />

              <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
                <Text style={styles.addBtnText}>{salvando ? 'Criando...' : 'Cadastrar Cliente'}</Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 8 }}>O código de acesso será gerado automaticamente</Text>
              <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Editar Cliente
// ═══════════════════════════════════════════
function ModalEditarCliente({ cliente, onClose, onAtualizado }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={!!cliente} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>Editar Cliente</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} />
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput style={styles.formInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.formLabel}>Telefone</Text>
          <TextInput style={styles.formInput} value={formatarTelefone(form.telefone)} onChangeText={v => setForm(f => ({ ...f, telefone: v.replace(/\D/g, '').slice(0, 11) }))} keyboardType="phone-pad" placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} />

          <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
            <Text style={styles.addBtnText}>{salvando ? 'Salvando...' : 'Salvar Alterações'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Detalhe Cliente
// ═══════════════════════════════════════════
function ModalDetalheCliente({ cliente, onClose, onAtualizado }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={!!cliente} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { maxHeight: '85%', paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>{cliente?.nome}</Text>

            {/* Código de acesso */}
            <View style={{ backgroundColor: colors.bg, borderRadius: 12, borderWidth: 2, borderColor: colors.accent, padding: 16, alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 10, letterSpacing: 1, marginBottom: 6 }}>CÓDIGO DE ACESSO</Text>
              <Text style={{ color: colors.accent, fontSize: 24, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 2, marginBottom: 12 }}>
                {codigoAtual}
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={{ backgroundColor: 'rgba(77,142,245,0.15)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }} onPress={copiarCodigo}>
                  <Text style={{ color: colors.blue, fontWeight: '600', fontSize: 12 }}><Feather name="copy" size={12} color={colors.blue} /> Copiar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ backgroundColor: 'rgba(201,162,39,0.15)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 }} onPress={gerarNovoCodigo} disabled={gerandoCodigo}>
                  <Text style={{ color: colors.yellow, fontWeight: '600', fontSize: 12 }}>{gerandoCodigo ? 'Gerando...' : <><Feather name="refresh-cw" size={12} color={colors.yellow} /> Novo Código</>}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dados */}
            <View style={{ marginBottom: 20 }}>
              <InfoRow label="E-mail" value={cliente?.email || 'Não informado'} />
              <InfoRow label="Telefone" value={cliente?.telefone ? formatarTelefone(cliente.telefone) : 'Não informado'} />
              <InfoRow label="Cadastrado em" value={cliente ? new Date(cliente.criado_em).toLocaleDateString('pt-BR') : ''} />
            </View>

            {/* Impressoras */}
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>
              <Feather name="printer" size={14} color={colors.text} /> Impressoras ({detalhes?.impressoras?.length || 0})
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
              <Feather name="file-text" size={14} color={colors.text} /> Chamados Recentes ({chamados.length})
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Nova Impressora
// ═══════════════════════════════════════════
function ModalNovaImpressora({ visible, clientes, onClose, onCriada }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { maxHeight: '85%', paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Novo Técnico
// ═══════════════════════════════════════════
function ModalNovoTecnico({ visible, onClose, onCriado }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>Novo Técnico</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} placeholder="Nome completo" placeholderTextColor={colors.textSecondary} />
          <Text style={styles.formLabel}>E-mail *</Text>
          <TextInput style={styles.formInput} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} placeholder="tecnico@email.com" placeholderTextColor={colors.textSecondary} keyboardType="email-address" autoCapitalize="none" />
          <Text style={styles.formLabel}>Senha *</Text>
          <TextInput style={styles.formInput} value={form.senha} onChangeText={v => setForm(f => ({ ...f, senha: v }))} placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.textSecondary} secureTextEntry />
          <Text style={styles.formLabel}>WhatsApp</Text>
          <TextInput style={styles.formInput} value={formatarTelefone(form.whatsapp)} onChangeText={v => setForm(f => ({ ...f, whatsapp: v.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />

          <TouchableOpacity style={[styles.addBtn, { alignItems: 'center', marginTop: 8 }]} onPress={handleSubmit} disabled={salvando}>
            <Text style={styles.addBtnText}>{salvando ? 'Criando...' : 'Cadastrar Técnico'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>Cancelar</Text>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// MODAL: Editar Técnico
// ═══════════════════════════════════════════
function ModalEditarTecnico({ tecnico, onClose, onAtualizado }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
    <Modal visible={!!tecnico} transparent animationType="slide" statusBarTranslucent>
      <KeyboardAvoidingView style={styles.modalOverlay} behavior="padding">
        <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalTitle}>Editar Técnico</Text>
          <Text style={styles.formLabel}>Nome *</Text>
          <TextInput style={styles.formInput} value={form.nome} onChangeText={v => setForm(f => ({ ...f, nome: v }))} />
          <Text style={styles.formLabel}>E-mail</Text>
          <TextInput style={[styles.formInput, { color: colors.textSecondary }]} value={tecnico?.email || ''} editable={false} />
          <Text style={styles.formLabel}>WhatsApp</Text>
          <TextInput style={styles.formInput} value={formatarTelefone(form.whatsapp)} onChangeText={v => setForm(f => ({ ...f, whatsapp: v.replace(/\D/g, '').slice(0, 11) }))} placeholder="(51) 99999-9999" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
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
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ═══════════════════════════════════════════
// SHARED: InfoRow
// ═══════════════════════════════════════════
function InfoRow({ label, value }) {
  const { colors } = useTheme();
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
const createStyles = (colors) => StyleSheet.create({
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
  tabLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  tabLabelAtivo: { color: colors.accent, fontWeight: '600' },

  // Dashboard
  dashGrid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10,
    justifyContent: 'center',
  },
  dashCard: {
    width: (Dimensions.get('window').width - 32 - 20) / 3,
    backgroundColor: colors.card, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  dashValor: { fontSize: 24, fontWeight: '700' },
  dashLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

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
