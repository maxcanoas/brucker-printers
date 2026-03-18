import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

// Configurar como as notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registrarPushNotifications() {
  try {
    // Verificar permissões
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return null;
    }

    // Configurar canal no Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('chamados', {
        name: 'Chamados',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    // Obter o push token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: undefined,
    });
    const pushToken = tokenData.data;

    // Enviar token para o backend (rota depende do tipo de usuário)
    const authToken = await AsyncStorage.getItem('token');
    const userTipo = await AsyncStorage.getItem('userTipo');

    if (authToken) {
      const endpoint = userTipo === 'admin' ? '/admin/push-token' : '/tecnicos/me/push-token';
      await api.post(endpoint, { push_token: pushToken });
      console.log(`Push token registrado (${userTipo}):`, pushToken);
    }

    return pushToken;
  } catch (error) {
    console.error('Erro ao registrar push notifications:', error);
    return null;
  }
}
