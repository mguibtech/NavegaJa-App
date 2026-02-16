import {useEffect, useState} from 'react';
import {Alert, Linking} from 'react-native';
import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';

export function useAppPermissions() {
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>('not-determined');
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  async function checkPermissions() {
    setIsCheckingPermissions(true);

    try {
      // Verificar permissão da câmera
      const status = await Camera.getCameraPermissionStatus();
      setCameraPermission(status);
    } catch (error) {
      console.error('Error checking permissions:', error);
    } finally {
      setIsCheckingPermissions(false);
    }
  }

  async function requestCameraPermission(): Promise<boolean> {
    try {
      const status = await Camera.requestCameraPermission();
      setCameraPermission(status);

      if (status === 'denied') {
        Alert.alert(
          'Permissão Necessária',
          'Para usar o scanner de QR Code, precisamos acessar sua câmera. Você pode ativar essa permissão nas configurações do app.',
          [
            {text: 'Cancelar', style: 'cancel'},
            {text: 'Abrir Configurações', onPress: () => Linking.openSettings()},
          ],
        );
        return false;
      }

      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  async function requestAllPermissions(): Promise<void> {
    const granted = await requestCameraPermission();

    if (granted) {
      console.log('✅ Permissões concedidas com sucesso');
    }
  }

  return {
    cameraPermission,
    isCheckingPermissions,
    requestCameraPermission,
    requestAllPermissions,
    checkPermissions,
  };
}
