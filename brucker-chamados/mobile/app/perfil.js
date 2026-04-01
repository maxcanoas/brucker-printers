import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, TextInput, Alert, Modal as RNModal
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

const THEME_OPTIONS = [
  { key: 'dark', label: 'Escuro', desc: 'Tema escuro para ambientes com pouca luz', icon: 'moon' },
  { key: 'light', label: 'Claro', desc: 'Tema claro para uso durante o dia', icon: 'sun' },
  { key: 'system', label: 'Sistema', desc: 'Segue a preferência do dispositivo', icon: 'smartphone' },
];

export default function PerfilScreen() {
  const { colors, preference, setPreference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <Feather name="mail" size={13} color={colors.textSecondary} />
          <Text style={styles.info}>{perfil.email}</Text>
        </View>
        {perfil.whatsapp && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Feather name="phone" size={13} color={colors.textSecondary} />
            <Text style={styles.info}>{perfil.whatsapp}</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => setModalSenha(true)} style={styles.btnSenha}>
          <Text style={styles.btnSenhaText}>Alterar Senha</Text>
        </TouchableOpacity>
      </View>

      {/* Tema */}
      <View style={styles.card}>
        <View style={styles.themeSectionHeader}>
          <Feather name="sun" size={18} color={colors.accent} />
          <Text style={styles.sectionTitle}>Tema</Text>
        </View>
        {THEME_OPTIONS.map(opt => {
          const selected = preference === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.themeOption, selected && styles.themeOptionSelected]}
              onPress={() => setPreference(opt.key)}
              activeOpacity={0.7}
            >
              <View style={styles.themeOptionLeft}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <Feather
                  name={opt.icon}
                  size={16}
                  color={selected ? colors.accent : colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.themeLabel, selected && { color: colors.accent }]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.themeDesc}>{opt.desc}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Metricas */}
      {metricas && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Minhas Metricas</Text>
          <View style={styles.metricsGrid}>
            <MetricCard label="Total" value={metricas.total} color={colors.blue} colors={colors} />
            <MetricCard label="Concluidos" value={metricas.concluidos} color={colors.green} colors={colors} />
            <MetricCard label="Em Andamento" value={metricas.em_andamento} color={colors.yellow} colors={colors} />
            <MetricCard label="% SLA" value={`${metricas.percentual_sla}%`} color={
              metricas.percentual_sla >= 80 ? colors.green :
              metricas.percentual_sla >= 60 ? colors.yellow : colors.red
            } colors={colors} />
          </View>
        </View>
      )}

      <ModalAlterarSenha visible={modalSenha} onClose={() => setModalSenha(false)} colors={colors} />
    </ScrollView>
  );
}

function ModalAlterarSenha({ visible, onClose, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      return Alert.alert('Erro', 'Preencha todos os campos');
    }
    if (novaSenha !== confirmarSenha) {
      return Alert.alert('Erro', 'As senhas nao coincidem');
    }
    if (novaSenha.length < 6) {
      return Alert.alert('Erro', 'A nova senha deve ter no minimo 6 caracteres');
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

function MetricCard({ label, value, color, colors }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={[styles.metric, { borderColor: color + '40' }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
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
  // Theme selector
  themeSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16
  },
  themeOption: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.bg, marginBottom: 8
  },
  themeOptionSelected: {
    borderColor: colors.accent + '80',
    backgroundColor: colors.accent + '10'
  },
  themeOptionLeft: {
    flexDirection: 'row', alignItems: 'center', flex: 1
  },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: colors.border, marginRight: 10,
    justifyContent: 'center', alignItems: 'center'
  },
  radioSelected: {
    borderColor: colors.accent
  },
  radioDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.accent
  },
  themeLabel: {
    fontSize: 15, fontWeight: '600', color: colors.text
  },
  themeDesc: {
    fontSize: 12, color: colors.textSecondary, marginTop: 2
  },
  // Modal
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
