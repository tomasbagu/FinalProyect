// utils/notifications.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/**
 * Solicita permisos y devuelve el Expo Push Token.
 * Debe llamarse en un dispositivo físico.
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    alert('Usa un dispositivo físico para recibir notificaciones push');
    return;
  }

  // Handler para mostrar notificaciones en primer plano
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    }),
  });

  // Canal Android (opcional, pero recomendado)
  if (Constants.platform?.android) {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  // Pedir permisos
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Permiso de notificaciones denegado');
    return;
  }

  // Obtener token
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;
  const tokenObj = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenObj.data;
}

