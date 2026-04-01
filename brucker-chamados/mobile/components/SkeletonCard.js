import { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

function SkeletonPulse({ width = '100%', height = 20, borderRadius = 8, style }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function SkeletonCard({ style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, style]}>
      <SkeletonPulse width="40%" height={14} style={{ marginBottom: 12 }} />
      <SkeletonPulse width={60} height={28} borderRadius={6} />
    </View>
  );
}

export function SkeletonDashboard() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={{ padding: 16 }}>
      <View style={styles.metricsRow}>
        {[1, 2, 3].map(i => (
          <SkeletonCard key={i} style={{ flex: 1 }} />
        ))}
      </View>
      <SkeletonPulse width={160} height={14} style={{ marginVertical: 16 }} />
      {[1, 2, 3].map(i => (
        <SkeletonListItem key={i} />
      ))}
    </View>
  );
}

export function SkeletonListItem({ style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, { marginBottom: 10 }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <SkeletonPulse width={80} height={16} />
        <SkeletonPulse width={90} height={22} borderRadius={12} />
      </View>
      <SkeletonPulse width="85%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonPulse width="50%" height={12} />
    </View>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <View style={{ padding: 16 }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
