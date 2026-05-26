import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
  Alert, TextInput, Modal, ScrollView, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../lib/api';
import { onRefresh as onRefreshBus } from '../lib/refreshBus';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { statusColors, statusLabels, urgenciaColors } from '../lib/theme';
import { getSlaInfo } from '../lib/sla';
import EmptyState from '../components/EmptyState';

const TABS = [
  { id: 'chamados', label: 'Chamados', icon: 'file-text' },
  { id: 'impressoras', label: 'Impressoras', icon: 'printer' },
  { id: 'abrir', label: 'Abrir', icon: 'plus-circle' },
];

export default function ClienteHomeScreen() {
  const { colors } = useTheme();
  const [aba, setAba] = useState('chamados');
  const [cliente, setCliente] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [impressoras, setImpressoras] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalAbrir, setModalAbrir] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  useEffect(() => onRefreshBus(() => carregar()), [carregar]);

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
        impressoras={impressoras}
      />
    </View>
  );
}

function ModalAbrirChamado({ visible, onClose, onCriado, impressoras = [] }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState({
    impressora_id: '', modelo: '', numero_serie: '',
    tipo: 'corretivo', urgencia: 'normal', descricao: ''
  });
  const [salvando, setSalvando] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [pickerAberto, setPickerAberto] = useState(false);

  const semImpressoras = !impressoras || impressoras.length === 0;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5 - fotos.length,
      quality: 0.7,
    });
    if (!result.canceled) {
      setFotos(prev => [...prev, ...result.assets].slice(0, 5));
    }
  };

  const selecionarImpressora = (imp) => {
    setForm(f => ({ ...f, impressora_id: imp.id, modelo: imp.modelo, numero_serie: imp.numero_serie }));
    setPickerAberto(false);
  };

  const handleSubmit = async () => {
    if (!form.impressora_id) {
      return Alert.alert('Atenção', 'Selecione a impressora');
    }
    if (!form.descricao.trim()) {
      return Alert.alert('Atenção', 'Descreva o problema');
    }
    setSalvando(true);
    try {
      const formData = new FormData();
      formData.append('tipo', form.tipo);
      formData.append('urgencia', form.urgencia);
      formData.append('descricao', form.descricao);
      if (form.impressora_id) formData.append('impressora_id', form.impressora_id);
      fotos.forEach((foto, i) => {
        const uri = foto.uri;
        const ext = uri.split('.').pop() || 'jpg';
        formData.append('fotos', { uri, name: `foto-${i}.${ext}`, type: `image/${ext === 'jpg' ? 'jpeg' : ext}` });
      });

      await api.post('/chamados', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Sucesso', 'Chamado aberto com sucesso!');
      setForm({ impressora_id: '', modelo: '', numero_serie: '', tipo: 'corretivo', urgencia: 'normal', descricao: '' });
      setFotos([]);
      onCriado();
    } catch (err) {
      const titulo = err.response?.status === 409 ? 'Chamado já existe' : 'Erro';
      Alert.alert(titulo, err.response?.data?.error || 'Erro ao abrir chamado');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.modalContent, { paddingBottom: 24 + Math.max(insets.bottom, 12) }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <Text style={styles.modalTitle}>Abrir Chamado</Text>

            <Text style={styles.formLabel}>Impressora *</Text>
            {semImpressoras ? (
              <Text style={{ color: colors.red, fontSize: 13, marginBottom: 12 }}>
                Nenhuma impressora cadastrada. Verifique com o administrador.
              </Text>
            ) : (
              <TouchableOpacity
                style={[styles.formInput, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                onPress={() => setPickerAberto(true)}
              >
                <Text style={{ color: form.impressora_id ? colors.text : colors.textSecondary, fontSize: 14, flex: 1 }} numberOfLines={1}>
                  {form.impressora_id
                    ? `${form.modelo} — ${form.numero_serie}`
                    : 'Selecione a impressora...'}
                </Text>
                <Feather name="chevron-down" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}

            <Modal visible={pickerAberto} animationType="fade" transparent onRequestClose={() => setPickerAberto(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setPickerAberto(false)}
              >
                <View style={[styles.modalContent, { maxHeight: '70%', paddingBottom: 24 + Math.max(insets.bottom, 12) }]} onStartShouldSetResponder={() => true}>
                  <Text style={styles.modalTitle}>Selecione a impressora</Text>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {impressoras.map(imp => (
                      <TouchableOpacity
                        key={imp.id}
                        style={{
                          paddingVertical: 12, paddingHorizontal: 12,
                          borderBottomWidth: 1, borderBottomColor: colors.border,
                          backgroundColor: form.impressora_id === imp.id ? colors.bg : 'transparent',
                        }}
                        onPress={() => selecionarImpressora(imp)}
                      >
                        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{imp.modelo}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>SN: {imp.numero_serie}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </TouchableOpacity>
            </Modal>

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

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: -4, marginBottom: 12 }}>
              <TouchableOpacity onPress={pickImage} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="camera" size={14} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                  {fotos.length > 0 ? `${fotos.length} foto(s)` : 'Anexar fotos'}
                </Text>
              </TouchableOpacity>
              <Text style={{ color: colors.textSecondary, fontSize: 11 }}>SLA: 24 horas úteis</Text>
            </View>
            {fotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                {fotos.map((foto, i) => (
                  <View key={i} style={{ marginRight: 8 }}>
                    <Image source={{ uri: foto.uri }} style={{ width: 56, height: 56, borderRadius: 6 }} />
                    <TouchableOpacity
                      onPress={() => setFotos(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: -4, right: -4, backgroundColor: colors.card, borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: colors.textSecondary, fontSize: 10, lineHeight: 12 }}>&times;</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, (salvando || semImpressoras) && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={salvando || semImpressoras}
            >
              <Text style={styles.submitBtnText}>{salvando ? 'Abrindo...' : 'Abrir Chamado'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors) => StyleSheet.create({
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
