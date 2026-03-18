import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator
} from 'react-native';
import api from '../lib/api';
import { colors } from '../lib/theme';

export default function PerfilScreen() {
  const [perfil, setPerfil] = useState(null);
  const [metricas, setMetricas] = useState(null);

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
    </ScrollView>
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
  metricValue: { fontSize: 28, fontWeight: '700' }
});
