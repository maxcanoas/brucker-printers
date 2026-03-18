import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../lib/api';
import { colors, statusColors, statusLabels, urgenciaColors } from '../../lib/theme';

export default function ChamadoDetalhe() {
  const { id } = useLocalSearchParams();
  const [chamado, setChamado] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [userTipo, setUserTipo] = useState('tecnico');
  const [tecnicos, setTecnicos] = useState([]);
  const [mostrarTecnicos, setMostrarTecnicos] = useState(false);
  const router = useRouter();

  useEffect(() => {
    carregarChamado();
    AsyncStorage.getItem('userTipo').then(tipo => {
      setUserTipo(tipo || 'tecnico');
      if (tipo === 'admin') carregarTecnicos();
    });
  }, [id]);

  const carregarChamado = async () => {
    try {
      const { data } = await api.get(`/chamados/${id}`);
      setChamado(data);
      setNovoStatus(data.status);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar o chamado');
    }
  };

  const carregarTecnicos = async () => {
    try {
      const { data } = await api.get('/tecnicos');
      setTecnicos(data.filter(t => t.ativo));
    } catch {
      console.log('Erro ao carregar técnicos');
    }
  };

  const atualizarStatus = async (status) => {
    setSalvando(true);
    try {
      await api.put(`/chamados/${id}/status`, { status, observacao });
      Alert.alert('Sucesso', 'Status atualizado!');
      setObservacao('');
      carregarChamado();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao atualizar');
    } finally {
      setSalvando(false);
    }
  };

  const atribuirTecnico = async (tecnicoId) => {
    setSalvando(true);
    try {
      await api.put(`/chamados/${id}/atribuir`, { tecnico_id: tecnicoId });
      Alert.alert('Sucesso', 'Técnico atribuído!');
      setMostrarTecnicos(false);
      carregarChamado();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao atribuir técnico');
    } finally {
      setSalvando(false);
    }
  };

  const encerrarChamado = () => {
    router.push({ pathname: '/relatorio', params: { chamado_id: id, numero: chamado?.numero } });
  };

  if (!chamado) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const slaInfo = () => {
    if (!chamado.sla_vence_em || ['concluido', 'cancelado'].includes(chamado.status)) return null;
    if (chamado.sla_pausado_em) return { text: 'SLA pausado (aguardando peça)', color: colors.yellow };
    const diff = new Date(chamado.sla_vence_em) - new Date();
    const horas = diff / (1000 * 60 * 60);
    if (horas <= 0) return { text: 'SLA VENCIDO', color: colors.red };
    if (horas <= 6) return { text: `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m restantes`, color: colors.yellow };
    return { text: `${Math.floor(horas)}h restantes`, color: colors.green };
  };

  const sla = slaInfo();
  const isAdmin = userTipo === 'admin';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header info */}
      <View style={styles.headerCard}>
        <View style={styles.row}>
          <Text style={styles.numero}>Chamado #{chamado.numero}</Text>
          <View style={[styles.badge, { backgroundColor: statusColors[chamado.status] + '25' }]}>
            <Text style={[styles.badgeText, { color: statusColors[chamado.status] }]}>
              {statusLabels[chamado.status]}
            </Text>
          </View>
        </View>

        {sla && (
          <View style={[styles.slaBar, { borderColor: sla.color }]}>
            <Text style={[styles.slaText, { color: sla.color }]}>{sla.text}</Text>
          </View>
        )}
      </View>

      {/* Informações */}
      <View style={styles.card}>
        <InfoRow label="Cliente" value={chamado.clientes?.nome} />
        <InfoRow label="Tipo" value={chamado.tipo === 'preventivo' ? 'Preventivo' : 'Corretivo'} />
        <InfoRow label="Urgência" value={chamado.urgencia} valueColor={urgenciaColors[chamado.urgencia]} />
        {chamado.impressoras && (
          <>
            <InfoRow label="Impressora" value={chamado.impressoras.modelo} />
            <InfoRow label="N° Série" value={chamado.impressoras.numero_serie} />
          </>
        )}
        <InfoRow label="Técnico" value={chamado.tecnicos?.nome || 'Não atribuído'} valueColor={!chamado.tecnicos ? colors.yellow : undefined} />
        <InfoRow label="Aberto em" value={new Date(chamado.criado_em).toLocaleString('pt-BR')} />
      </View>

      {/* Descrição */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Descrição do Problema</Text>
        <Text style={styles.descricao}>{chamado.descricao}</Text>
      </View>

      {/* Admin: Atribuir técnico */}
      {isAdmin && !['concluido', 'cancelado'].includes(chamado.status) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Atribuir Técnico</Text>

          {chamado.tecnicos && (
            <Text style={styles.tecnicoAtual}>Atual: {chamado.tecnicos.nome}</Text>
          )}

          <TouchableOpacity
            style={styles.atribuirBtn}
            onPress={() => setMostrarTecnicos(!mostrarTecnicos)}
          >
            <Text style={styles.atribuirBtnText}>
              {mostrarTecnicos ? 'Fechar' : chamado.tecnicos ? 'Reatribuir Técnico' : 'Selecionar Técnico'}
            </Text>
          </TouchableOpacity>

          {mostrarTecnicos && tecnicos.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.tecnicoItem,
                chamado.tecnico_id === t.id && styles.tecnicoItemAtivo
              ]}
              onPress={() => atribuirTecnico(t.id)}
              disabled={salvando}
            >
              <Text style={styles.tecnicoItemNome}>{t.nome}</Text>
              <Text style={styles.tecnicoItemEmail}>{t.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Ações (se não concluído/cancelado) */}
      {!['concluido', 'cancelado'].includes(chamado.status) && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ações</Text>

          <Text style={styles.label}>Atualizar Status</Text>
          <View style={styles.statusBtns}>
            {['em_atendimento', 'aguardando_peca'].map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusBtn,
                  chamado.status === s && styles.statusBtnDisabled
                ]}
                onPress={() => atualizarStatus(s)}
                disabled={chamado.status === s || salvando}
              >
                <Text style={styles.statusBtnText}>{statusLabels[s]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={styles.input}
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Adicionar observação..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />

          {!isAdmin && (
            <TouchableOpacity style={styles.encerrarBtn} onPress={encerrarChamado}>
              <Text style={styles.encerrarBtnText}>Encerrar e Gerar Relatório</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Histórico */}
      {chamado.chamado_atualizacoes?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Histórico</Text>
          {chamado.chamado_atualizacoes
            .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
            .map(at => (
              <View key={at.id} style={styles.historicoItem}>
                <View style={styles.row}>
                  <View style={[styles.badge, { backgroundColor: statusColors[at.status_novo] + '25' }]}>
                    <Text style={[styles.badgeText, { color: statusColors[at.status_novo] }]}>
                      {statusLabels[at.status_novo]}
                    </Text>
                  </View>
                  <Text style={styles.historicoData}>
                    {new Date(at.criado_em).toLocaleString('pt-BR')}
                  </Text>
                </View>
                {at.observacao && <Text style={styles.historicoObs}>{at.observacao}</Text>}
              </View>
            ))}
        </View>
      )}

      {/* Relatório (se concluído) */}
      {chamado.relatorios_atendimento?.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Relatório de Atendimento</Text>
          {chamado.relatorios_atendimento.map(r => (
            <View key={r.id}>
              <InfoRow label="Serviço" value={r.descricao_servico} />
              {r.pecas_utilizadas && <InfoRow label="Peças" value={r.pecas_utilizadas} />}
              {r.duracao_minutos && <InfoRow label="Duração" value={`${r.duracao_minutos} min`} />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value, valueColor }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: colors.card, borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: colors.border
  },
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 20,
    borderWidth: 1, borderColor: colors.border
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numero: { fontSize: 20, fontWeight: '700', color: colors.text },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  slaBar: {
    marginTop: 12, padding: 10, borderRadius: 8,
    borderWidth: 1, borderLeftWidth: 3
  },
  slaText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  descricao: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border
  },
  infoLabel: { fontSize: 13, color: colors.textSecondary },
  infoValue: { fontSize: 13, color: colors.text, fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 14, minHeight: 60,
    textAlignVertical: 'top'
  },
  statusBtns: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    flex: 1, padding: 12, borderRadius: 8,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, alignItems: 'center'
  },
  statusBtnDisabled: { opacity: 0.4 },
  statusBtnText: { color: colors.text, fontSize: 13, fontWeight: '500' },
  encerrarBtn: {
    backgroundColor: colors.green, borderRadius: 8,
    padding: 16, alignItems: 'center', marginTop: 20
  },
  encerrarBtnText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  tecnicoAtual: { fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  atribuirBtn: {
    backgroundColor: colors.accent, borderRadius: 8,
    padding: 12, alignItems: 'center', marginBottom: 12
  },
  atribuirBtnText: { color: colors.text, fontSize: 14, fontWeight: '600' },
  tecnicoItem: {
    backgroundColor: colors.bg, borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8
  },
  tecnicoItemAtivo: { borderColor: colors.accent },
  tecnicoItemNome: { fontSize: 14, fontWeight: '600', color: colors.text },
  tecnicoItemEmail: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historicoItem: {
    padding: 12, backgroundColor: colors.bg, borderRadius: 8,
    marginBottom: 8, borderLeftWidth: 3, borderLeftColor: colors.accent
  },
  historicoData: { fontSize: 11, color: colors.textSecondary },
  historicoObs: { fontSize: 13, color: colors.textSecondary, marginTop: 6 }
});
