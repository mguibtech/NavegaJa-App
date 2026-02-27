/**
 * @format
 */

if (__DEV__) {
  require("./ReactotronConfig");
}
import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// OBRIGATÓRIO: handler de mensagens FCM com app em background/fechado
// Deve estar no index.js, fora de qualquer componente React
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Android: system tray já mostra notification.title/body automaticamente
  // iOS: precisa que o payload tenha notification.title + notification.body
  // Aqui apenas garantimos que o handler existe (Firebase exige o registro)
  const data = remoteMessage.data;
  if (!data) { return; }
  // Log silencioso — não há acesso a React context aqui
});

AppRegistry.registerComponent(appName, () => App);
