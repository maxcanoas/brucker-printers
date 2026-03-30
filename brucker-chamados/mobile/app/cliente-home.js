import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  Alert, TextInput, Modal, ScrollView, ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { Feather } from '@expo/vector-icons';
import { colors, statusColors, statusLabels, urgenciaColors } from '../lib/theme';
import { getSlaInfo } from '../lib/sla';
import EmptyState from '../components/EmptyState';

const TABS = [
  { id: 'chamados', label: 'Chamados', icon: 'file-text' },
  { id: 'impressoras', label: 'Impressoras', icon: 'printer' },
  { id: 'abrir', label: 'Abrir', icon: 'plus-circle' },
];

export default function ClienteHomeScreen() {
  const [aba, setAba] = useState('chamados');
  const [cliente, setCliente] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [impressoras, setImpressoras] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalAbrir, setModalAbrir] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const carregar = useCallback(async () => {
    try {
      const clienteData = await AsyncStorage.getItem('cliente');
      if (clienteData) setCliente(JSON.parse(clienteData));

      const [chamRes, impRes] = await Promise.all([
        api.get('/clientes/me/chamados'),
        api.get('/clientes/me/impressoras'),
      ]);
      setChamados(chamRes.data);
      setImpressoras(impRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.multiRemove(['token', 'cliente', 'userTipo']);
        router.replace('/');
      }
    }
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'cliente', 'userTipo']);
    router.replace('/');
  };

  const handleTabPress = (tabId) => {
    if (tabId === 'abrir') {
      setModalAbrir(true);
    } else {
      setAba(tabId);
    }
  };

  // Contadores rápidos
  const ativos = chamados.filter(c => !['concluido', 'cancelado'].includes(c.status)).length;
  const concluidos = chamados.filter(c => c.status === 'concluido').length;
  const pendentesAvaliacao = chamados.filter(c =>
    c.status === 'concluido' && (!c.avaliacoes || c.avaliacoes.length === 0)
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Meus Chamados</Text>
          <Text style={styles.headerSubtitle}>Olá, {cliente?.nome}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
          <Text style={{ color: colors.red, fontSize: 14 }}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Resumo rápido */}
      <View style={styles.resumoRow}>
        <View style={[styles.resumoCard, { borderColor: colors.blue + '40' }]}>
          <Text style={[styles.resumoValor, { color: colors.blue }]}>{ativos}</Text>
          <Text style={styles.resumoLabel}>Ativos</Text>
        </View>
        <View style={[styles.resumoCard, { borderColor: colors.green + '40' }]}>
          <Text style={[styles.resumoValor, { color: colors.green }]}>{concluidos}</Text>
          <Text style={styles.resumoLabel}>Concluídos</Text>
        </View>
        {pendentesAvaliacao > 0 && (
          <View style={[styles.resumoCard, { borderColor: colors.yellow + '40' }]}>
            <Text style={[styles.resumoValor, { color: colors.yellow }]}>{pendentesAvaliacao}</Text>
            <Text style={styles.resumoLabel}>Avaliar</Text>
          </View>
        )}
      </View>

      {/* Conteúdo */}
      {aba === 'chamados' && (
        <FlatList
          data={chamados}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          renderItem={({ item }) => {
            const sla = getSlaInfo(item);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push(`/chamado/${item.id}`)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.numero}>#{item.numero}</Text>
                  <View style={[styles.badge, { backgroundColor: (statusColors[item.status] || colors.textSecondary) + '25' }]}>
                    <Text style={[styles.badgeText, { color: statusColors[item.status] || colors.textSecondary }]}>
                      {statusLabels[item.status] || item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>

                <View style={styles.cardFooter}>
                  <View style={[styles.urgenciaBadge, { backgroundColor: (urgenciaColors[item.urgencia] || colors.blue) + '25' }]}>
                    <Text style={[styles.badgeText, { color: urgenciaColors[item.urgencia] || colors.blue, fontSize: 11 }]}>
                      {item.urgencia}
                    </Text>
                  </View>
                  {item.impressoras && (
                    <Text style={styles.impressoraText}>
                      {item.impressoras.modelo}
                    </Text>
                  )}
                </View>

                {sla && (
                  <Text style={[styles.sla, { color: sla.color }]}>{sla.text}</Text>
                )}
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="file-text"
              title="Nenhum chamado encontrado"
              subtitle="Abra seu primeiro chamado de suporte"
              actionLabel="Abrir Chamado"
              onAction={() => setModalAbrir(true)}
            />
          }
        />
      )}

      {aba === 'impressoras' && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {impressoras.length === 0 ? (
            <EmptyState
              icon="printer"
              title="Nenhuma impressora cadastrada"
            />
          ) : impressoras.map(imp => (
            <View key={imp.id} style={styles.card}>
              <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{imp.modelo}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                S/N: {imp.numero_serie}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.blue + '25', alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={[styles.badgeText, { color: colors.blue }]}>
                  {imp.tipo_contrato === 'locacao' ? 'Locação' : imp.tipo_contrato}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Bottom Tabs */}
      <View style={[styles.bottomTabs, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabBtn,
              tab.id === 'abrir' ? styles.tabBtnAbrir : (aba === tab.id && styles.tabBtnAtivo)
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={tab.id === 'abrir' ? 22 : 20}
              color={tab.id === 'abrir' ? colors.accent : (aba === tab.id ? colors.accent : colors.textSecondary)}
            />
            <Text style={[
              styles.tabLabel,
              tab.id === 'abrir' ? styles.tabLabelAbrir : (aba === tab.id && styles.tabLabelAtivo)
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal Abrir Chamado */}
      <ModalAbrirChamado
        visible={modalAbrir}
        onClose={() => setModalAbrir(false)}
        onCriado={() => { setModalAbrir(false); carregar(); }}
      />
    </View>
  );
}

function ModalAbrirChamado({ visible, onClose, onCriado }) {
  const [form, setForm] = useState({
    numero_serie: '', impressora_id: '', modelo: '',
    tipo: 'corretivo', urgencia: 'normal', descricao: ''
  });
  const [salvando, setSalvando] = useState(false);

  const buscarImpressora = async (serie) => {
    setForm(f => ({ ...f, numero_serie: serie, impressora_id: '', modelo: '' }));
    if (serie.length < 3) return;
    try {
      const { data } = await api.get(`/impressoras/buscar/${serie}`);
      setForm(f => ({ ...f, impressora_id: data.id, modelo: data.modelo }));
    } catch { }
  };

  const handleSubmit = async () => {
    if (!form.descricao.trim()) {
      return Alert.alert('Atenção', 'Descreva o problema');
    }
    setSalvando(true);
    try {
      await api.post('/chamados', {
        impressora_id: form.impressora_id || null,
        tipo: form.tipo,
        urgencia: form.urgencia,
        descricao: form.descricao
      });
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!');
      setForm({ numero_serie: '', impressora_id: '', modelo: '', tipo: 'corretivo', urgencia: 'normal', descricao: '' });
      onCriado();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao abrir chamado');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Abrir Chamado</Text>

            <Text style={styles.formLabel}>Número de Série</Text>
            <TextInput
              style={styles.formInput}
              value={form.numero_serie}
              onChangeText={buscarImpressora}
              placeholder="Digite o número de série..."
              placeholderTextColor={colors.textSecondary}
            />
            {form.modelo ? (
              <Text style={{ color: colors.green, fontSize: 12, marginTop: -8, marginBottom: 12 }}>
                Impressora: {form.modelo}
              </Text>
            ) : form.numero_serie.length >= 3 ? (
              <Text style={{ color: colors.yellow, fontSize: 12, marginTop: -8, marginBottom: 12 }}>
                Não encontrada — você ainda pode abrir
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Tipo</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['corretivo', 'preventivo'].map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.chipBtn, form.tipo === t && styles.chipBtnAtivo]}
                      onPress={() => setForm(f => ({ ...f, tipo: t }))}
                    >
                      <Text style={[styles.chipText, form.tipo === t && styles.chipTextAtivo]}>
                        {t === 'corretivo' ? 'Corretivo' : 'Preventivo'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.formLabel}>Urgência</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['normal', 'alta', 'critica'].map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.chipBtn, form.urgencia === u && { backgroundColor: urgenciaColors[u], borderColor: urgenciaColors[u] }]}
                      onPress={() => setForm(f => ({ ...f, urgencia: u }))}
                    >
                      <Text style={[styles.chipText, form.urgencia === u && { color: '#FFF' }]}>
                        {u === 'normal' ? 'Normal' : u === 'alta' ? 'Alta' : 'Crítica'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.formLabel}>Descrição do Problema *</Text>
            <TextInput
              style={[styles.formInput, { minHeight: 100, textAlignVertical: 'top' }]}
              value={form.descricao}
              onChangeText={v => setForm(f => ({ ...f, descricao: v }))}
              placeholder="Descreva o problema em detalhes..."
              placeholderTextColor={colors.textSecondary}
              multiline
            />

            <Text style={{ color: colors.textSecondary, fontSize: 11, textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
              SLA: 24 horas úteis
            </Text>

            <TouchableOpacity
              style={[styles.submitBtn, salvando && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={salvando}
            >
              <Text style={styles.submitBtnText}>{salvando ? 'Abrindo...' : 'Abrir Chamado'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card, padding: 20, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', alignItems: 'center'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  headerBtn: { padding: 8 },
  resumoRow: {
    flexDirection: 'row', padding: 16, paddingBottom: 0, gap: 10
  },
  resumoCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 10,
    padding: 12, alignItems: 'center', borderWidth: 1
  },
  resumoValor: { fontSize: 24, fontWeight: '700' },
  resumoLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  numero: { fontSize: 16, fontWeight: '700', color: colors.text },
  badge: { paddingVertical: 3, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  urgenciaBadge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 8 },
  descricao: { fontSize: 14, color: colors.textSecondary, marginBottom: 8, lineHeight: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  impressoraText: { fontSize: 12, color: colors.textSecondary },
  sla: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 16, marginBottom: 16 },
  emptyBtn: {
    backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 24
  },
  emptyBtnText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  bottomTabs: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingTop: 10, paddingHorizontal: 8
  },
  tabBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 6
  },
  tabBtnAtivo: {},
  tabBtnAbrir: {},
  tabLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 3 },
  tabLabelAtivo: { color: colors.accent, fontWeight: '600' },
  tabLabelAbrir: { color: colors.accent, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, maxHeight: '90%',
    borderWidth: 1, borderColor: colors.border
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  formLabel: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  formInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 14, marginBottom: 16
  },
  chipBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: 'center'
  },
  chipBtnAtivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 11, fontWeight: '500' },
  chipTextAtivo: { color: '#FFF', fontWeight: '600' },
  submitBtn: {
    backgroundColor: colors.accent, borderRadius: 10, padding: 16, alignItems: 'center'
  },
  submitBtnText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cancelBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { color: colors.textSecondary, fontSize: 14 },
});
