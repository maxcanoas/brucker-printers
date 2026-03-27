import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { colors } from '../lib/theme';

export default function RootLayout() {
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Listener para notificações recebidas com app aberto
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificação recebida:', notification);
    });

    // Listener para quando o usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.chamado_id) {
        router.push(`/chamado/${data.chamado_id}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="admin-home" options={{ headerShown: false }} />
        <Stack.Screen name="cliente-home" options={{ headerShown: false }} />
        <Stack.Screen name="chamado/[id]" options={{ title: 'Detalhes do Chamado' }} />
        <Stack.Screen name="relatorio" options={{ title: 'Relatório de Atendimento' }} />
        <Stack.Screen name="perfil" options={{ title: 'Meu Perfil' }} />
      </Stack>
    </>
  );
}
