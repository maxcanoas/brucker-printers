import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingButton({
  onPress,
  loading = false,
  loadingText,
  children,
  style,
  textStyle,
  disabled,
  color = '#FFFFFF',
  ...props
}) {
  return (
    <TouchableOpacity
      style={[styles.button, style, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={color}
          style={styles.spinner}
        />
      )}
      <Text style={[styles.text, textStyle, { color }]}>
        {loading && loadingText ? loadingText : children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  spinner: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});
