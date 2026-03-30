import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const STAR_FILLED_COLOR = '#C9A227';
const STAR_EMPTY_COLOR = '#8A94A6';

export default function StarRating({ rating = 0, onRate, size = 24, gap = 6 }) {
  return (
    <View style={[styles.container, { gap }]}>
      {[1, 2, 3, 4, 5].map(i => {
        const filled = i <= rating;
        const icon = (
          <MaterialCommunityIcons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? STAR_FILLED_COLOR : STAR_EMPTY_COLOR}
          />
        );

        if (onRate) {
          return (
            <TouchableOpacity key={i} onPress={() => onRate(i)} activeOpacity={0.7}>
              {icon}
            </TouchableOpacity>
          );
        }

        return <View key={i}>{icon}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
