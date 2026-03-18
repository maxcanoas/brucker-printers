import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { colors, statusColors, statusLabels, urgenciaColors } from '../lib/theme';

export default function HomeScreen() {
  const [chamados, setChamados] = useState([]);
  const [tecnico, setTecnico] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('ativos');
  const router = useRouter();

  const carregarDados = useCallback(async () => {
    try {
      const tecnicoData = await AsyncStorage.getItem('tecnico');
      if (tecnicoData) setTecnico(JSON.parse(tecnicoData));

      const status = filtro === 'ativos' ? '' : '?status=concluido';
      const { data } = await api.get(`/chamados/meus${status}`);
      setChamados(data);
    } catch (err) {
      if (err.response?.status === 401) {
        await AsyncStorage.multiRemove(['token', 'tecnico']);
        router.replace('/');
      }
    }
  }, [filtro]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const onRefresh = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['token', 'tecnico']);
    router.replace('/');
  };

  const getSlaInfo = (chamado) => {
    if (!chamado.sla_vence_em || ['concluido', 'cancelado'].includes(chamado.status)) return null;
    if (chamado.sla_pausado_em) return { text: 'SLA pausado', color: colors.yellow };

    const diff = new Date(chamado.sla_vence_em) - new Date();
    const horas = diff / (1000 * 60 * 60);

    if (horas <= 0) return { text: 'SLA vencido', color: colors.red };
    if (horas <= 6) return { text: `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m`, color: colors.yellow };
    return { text: `${Math.floor(horas)}h restantes`, color: colors.green };
  };

  const renderChamado = ({ item }) => {
    const sla = getSlaInfo(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/chamado/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.numero}>#{item.numero}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors[item.status] + '25' }]}>
            <Text style={[styles.badgeText, { color: statusColors[item.status] }]}>
              {statusLabels[item.status]}
            </Text>
          </View>
        </View>

        <Text style={styles.descricao} numberOfLines={2}>{item.descricao}</Text>

        <View style={styles.cardFooter}>
          <Text style={styles.cliente}>{item.clientes?.nome}</Text>
          <View style={[styles.urgenciaBadge, { backgroundColor: urgenciaColors[item.urgencia] + '25' }]}>
            <Text style={[styles.badgeText, { color: urgenciaColors[item.urgencia], fontSize: 11 }]}>
              {item.urgencia}
            </Text>
          </View>
        </View>

        {item.impressoras && (
          <Text style={styles.impressora}>
            {item.impressoras.modelo} — {item.impressoras.numero_serie}
          </Text>
        )}

        {sla && (
          <Text style={[styles.sla, { color: sla.color }]}>{sla.text}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Meus Chamados</Text>
          <Text style={styles.headerSubtitle}>Olá, {tecnico?.nome}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/perfil')} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerBtn}>
            <Text style={[styles.headerBtnText, { color: colors.red }]}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtros}>
        {['ativos', 'concluido'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filtroBtn, filtro === f && styles.filtroBtnAtivo]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filtroText, filtro === f && styles.filtroTextAtivo]}>
              {f === 'ativos' ? 'Em andamento' : 'Concluídos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={chamados}
        keyExtractor={item => item.id}
        renderItem={renderChamado}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhum chamado encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card, padding: 20, paddingTop: 60,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  headerSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: { padding: 8 },
  headerBtnText: { color: colors.textSecondary, fontSize: 14 },
  filtros: { flexDirection: 'row', padding: 16, gap: 8 },
  filtroBtn: {
    paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border
  },
  filtroBtnAtivo: { backgroundColor: colors.accent, borderColor: colors.accent },
  filtroText: { color: colors.textSecondary, fontSize: 14 },
  filtroTextAtivo: { color: colors.text, fontWeight: '600' },
  lista: { padding: 16, gap: 12 },
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
  cliente: { fontSize: 13, color: colors.textSecondary },
  impressora: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  sla: { fontSize: 13, fontWeight: '600', marginTop: 8 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: colors.textSecondary, fontSize: 16 }
});
