import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, Alert, Modal as RNModal
} from 'react-native';
import api from '../lib/api';
import { colors } from '../lib/theme';

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState(null);
  const [metricas, setMetricas] = useState(null);
  const [modalSenha, setModalSenha] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/tecnicos/me').then(r => setPerfil(r.data)),
      api.get('/tecnicos/me/metricas').then(r => setMetricas(r.data))
    ]).catch(() => {});
  }, []);

  if (!perfil) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Perfil */}
      <View style={styles.card}>
        <Text style={styles.nome}>{perfil.nome}</Text>
        <Text style={styles.info}>{perfil.email}</Text>
        {perfil.whatsapp && <Text style={styles.info}>{perfil.whatsapp}</Text>}
        <TouchableOpacity onPress={() => setModalSenha(true)} style={styles.btnSenha}>
          <Text style={styles.btnSenhaText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      {/* Métricas */}
      {metricas && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Minhas Métricas</Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Total" value={metricas.total} color={colors.blue} />
            <MetricCard label="Concluídos" value={metricas.concluidos} color={colors.green} />
            <MetricCard label="Em Andamento" value={metricas.em_andamento} color={colors.yellow} />
            <MetricCard label="% SLA" value={`${metricas.percentual_sla}%`} color={
              metricas.percentual_sla >= 80 ? colors.green :
              metricas.percentual_sla >= 60 ? colors.yellow : colors.red
            } />
          </View>
        </View>
      )}

      <ModalAlterarSenha visible={modalSenha} onClose={() => setModalSenha(false)} />
    </ScrollView>
  );
}

function ModalAlterarSenha({ visible, onClose }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return Alert.alert('Erro', 'Preencha todos os campos');
    }
    if (novaSenha !== confirmarSenha) {
      return Alert.alert('Erro', 'As senhas não coincidem');
    }
    if (novaSenha.length < 6) {
      return Alert.alert('Erro', 'A nova senha deve ter no mínimo 6 caracteres');
    }
    setSalvando(true);
    try {
      await api.put('/auth/alterar-senha', { senha_atual: senhaAtual, nova_senha: novaSenha });
      Alert.alert('Sucesso', 'Senha alterada com sucesso');
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
      onClose();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <RNModal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Alterar Senha</Text>

          <Text style={styles.label}>Senha Atual</Text>
          <TextInput style={styles.input} secureTextEntry value={senhaAtual}
            onChangeText={setSenhaAtual} placeholderTextColor={colors.textSecondary} placeholder="Digite a senha atual" />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput style={styles.input} secureTextEntry value={novaSenha}
            onChangeText={setNovaSenha} placeholderTextColor={colors.textSecondary} placeholder="Digite a nova senha" />

          <Text style={styles.label}>Confirmar Nova Senha</Text>
          <TextInput style={styles.input} secureTextEntry value={confirmarSenha}
            onChangeText={setConfirmarSenha} placeholderTextColor={colors.textSecondary} placeholder="Confirme a nova senha" />

          <TouchableOpacity onPress={handleSubmit} disabled={salvando}
            style={[styles.btnPrimary, salvando && { opacity: 0.7 }]}>
            <Text style={styles.btnPrimaryText}>{salvando ? 'Salvando...' : 'Alterar Senha'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.btnCancelar}>
            <Text style={styles.btnCancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </RNModal>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <View style={[styles.metric, { borderColor: color + '40' }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: colors.border
  },
  nome: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 8 },
  info: { fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 },
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12
  },
  metric: {
    flex: 1, minWidth: '45%', padding: 16, borderRadius: 10,
    backgroundColor: colors.bg, borderWidth: 1, alignItems: 'center'
  },
  metricLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  metricValue: { fontSize: 28, fontWeight: '700' },
  btnSenha: {
    marginTop: 16, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignSelf: 'flex-start'
  },
  btnSenhaText: { color: colors.textSecondary, fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', padding: 24
  },
  modalContent: {
    backgroundColor: colors.card, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: colors.border
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 20 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 6 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 15, marginBottom: 16
  },
  btnPrimary: {
    backgroundColor: colors.accent, borderRadius: 8, padding: 14, alignItems: 'center'
  },
  btnPrimaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  btnCancelar: { padding: 14, alignItems: 'center', marginTop: 8 },
  btnCancelarText: { color: colors.textSecondary, fontSize: 14 }
});
