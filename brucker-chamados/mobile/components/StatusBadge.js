import { View, Text, StyleSheet } from 'react-native';
import { statusColors, statusLabels, urgenciaColors } from '../lib/theme';

export function StatusBadge({ status }) {
  const color = statusColors[status] || '#8A94A6';
  const label = statusLabels[status] || status;

  return (
    <View style={[styles.badge, { backgroundColor: color + '25' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

const urgenciaLabels = {
  normal: 'Normal',
  alta: 'Alta',
  critica: 'Crítica',
};

export function UrgenciaBadge({ urgencia }) {
  const color = urgenciaColors[urgencia] || '#4D8EF5';
  const label = urgenciaLabels[urgencia] || urgencia;

  return (
    <View style={[styles.urgenciaBadge, { backgroundColor: color + '25' }]}>
      <Text style={[styles.urgenciaText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  urgenciaBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  urgenciaText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
