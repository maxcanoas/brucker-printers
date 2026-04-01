import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function DatePicker({ label, value, onChange, placeholder }) {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (event, selectedDate) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {label && (
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={{
          backgroundColor: colors.bg,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 14,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{
          color: value ? colors.text : colors.textSecondary,
          fontSize: 14,
        }}>
          {value ? formatDate(value) : (placeholder || 'Selecionar data')}
        </Text>
        <Feather name="calendar" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          locale="pt-BR"
          themeVariant="dark"
        />
      )}
    </View>
  );
}
