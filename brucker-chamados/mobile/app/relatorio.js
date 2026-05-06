import { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';

export default function RelatorioScreen() {
  const { colors } = useTheme();
  const { chamado_id, numero } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [form, setForm] = useState({
    descricao_servico: '',
    pecas_utilizadas: '',
    duracao_minutos: ''
  });
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async () => {
    if (!form.descricao_servico.trim()) {
      Alert.alert('Atenção', 'Descreva o serviço realizado');
      return;
    }

    setSalvando(true);
    try {
      await api.post('/relatorios', {
        chamado_id,
        descricao_servico: form.descricao_servico,
        pecas_utilizadas: form.pecas_utilizadas || null,
        duracao_minutos: form.duracao_minutos ? parseInt(form.duracao_minutos) : null
      });

      Alert.alert(
        'Chamado Encerrado',
        `Chamado #${numero} concluído com sucesso! O relatório foi salvo.`,
        [{ text: 'OK', onPress: () => router.replace('/home') }]
      );
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao salvar relatório');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
      <View style={styles.card}>
        <Text style={styles.title}>Relatório de Atendimento</Text>
        <Text style={styles.subtitle}>Chamado #{numero}</Text>

        <Text style={styles.label}>Descrição do Serviço Realizado *</Text>
        <TextInput
          style={[styles.input, { minHeight: 120 }]}
          value={form.descricao_servico}
          onChangeText={(v) => setForm(f => ({ ...f, descricao_servico: v }))}
          placeholder="Descreva detalhadamente o que foi feito..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Peças Utilizadas</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={form.pecas_utilizadas}
          onChangeText={(v) => setForm(f => ({ ...f, pecas_utilizadas: v }))}
          placeholder="Ex: Toner preto, Rolo fusor..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.label}>Duração do Atendimento (minutos)</Text>
        <TextInput
          style={styles.input}
          value={form.duracao_minutos}
          onChangeText={(v) => setForm(f => ({ ...f, duracao_minutos: v.replace(/\D/g, '') }))}
          placeholder="Ex: 90"
          placeholderTextColor={colors.textSecondary}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={[styles.button, salvando && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={salvando}
        >
          <Text style={styles.buttonText}>
            {salvando ? 'Salvando...' : 'Encerrar Chamado e Salvar Relatório'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.card, borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: colors.border
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 14
  },
  button: {
    backgroundColor: colors.green, borderRadius: 8,
    padding: 16, alignItems: 'center', marginTop: 24
  },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: '600' }
});
