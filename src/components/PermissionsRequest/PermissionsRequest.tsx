import React, {useEffect, useState} from 'react';
import {Modal, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Box, Button, Text, Icon} from '@components';
import {useAppPermissions} from '@hooks';

const PERMISSIONS_REQUESTED_KEY = '@navegaja:permissions_requested';

export function PermissionsRequest() {
  const [isVisible, setIsVisible] = useState(false);
  const {requestAllPermissions} = useAppPermissions();

  useEffect(() => {
    checkIfShouldShowPermissions();
  }, []);

  async function checkIfShouldShowPermissions() {
    try {
      const hasRequested = await AsyncStorage.getItem(PERMISSIONS_REQUESTED_KEY);

      if (!hasRequested) {
        // Delay para mostrar depois da tela de login
        setTimeout(() => {
          setIsVisible(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  async function handleRequestPermissions() {
    try {
      await requestAllPermissions();
      await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      // Mesmo com erro, marca como solicitado para não mostrar novamente
      await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, 'true');
      setIsVisible(false);
    }
  }

  async function handleSkip() {
    try {
      await AsyncStorage.setItem(PERMISSIONS_REQUESTED_KEY, 'true');
      setIsVisible(false);
    } catch (error) {
      console.error('Error skipping permissions:', error);
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <Box
        flex={1}
        style={{backgroundColor: 'rgba(0,0,0,0.8)'}}
        alignItems="center"
        justifyContent="center"
        padding="s20">
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s24"
          maxWidth={400}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 4},
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}>
          {/* Header */}
          <Box alignItems="center" mb="s24">
            <Box
              width={80}
              height={80}
              borderRadius="s24"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mb="s16">
              <Icon name="security" size={48} color="primary" />
            </Box>

            <Text preset="headingMedium" color="text" bold textAlign="center" mb="s8">
              Permissões do App
            </Text>

            <Text preset="paragraphMedium" color="textSecondary" textAlign="center">
              Para usar todos os recursos do NavegaJá, precisamos de algumas permissões
            </Text>
          </Box>

          {/* Lista de Permissões */}
          <Box mb="s24" gap="s16">
            {/* Câmera */}
            <Box flexDirection="row" alignItems="flex-start">
              <Box
                width={40}
                height={40}
                borderRadius="s12"
                backgroundColor="infoBg"
                alignItems="center"
                justifyContent="center"
                mr="s12">
                <Icon name="camera-alt" size={24} color="info" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  Câmera
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  Para escanear QR Codes das encomendas e tirar fotos
                </Text>
              </Box>
            </Box>

            {/* Galeria */}
            {Platform.OS === 'android' && (
              <Box flexDirection="row" alignItems="flex-start">
                <Box
                  width={40}
                  height={40}
                  borderRadius="s12"
                  backgroundColor="successBg"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12">
                  <Icon name="photo-library" size={24} color="success" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold mb="s4">
                    Galeria
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    Para selecionar fotos das suas encomendas
                  </Text>
                </Box>
              </Box>
            )}
          </Box>

          {/* Info adicional */}
          <Box
            backgroundColor="warningBg"
            borderRadius="s12"
            padding="s12"
            mb="s24"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: '#FFC107',
            }}>
            <Text preset="paragraphSmall" color="warning" bold mb="s4">
              💡 Você pode alterar depois
            </Text>
            <Text preset="paragraphSmall" color="warning">
              Essas permissões podem ser ativadas ou desativadas a qualquer momento nas
              configurações do seu dispositivo
            </Text>
          </Box>

          {/* Botões */}
          <Box gap="s12">
            <Button
              title="Permitir"
              preset="primary"
              leftIcon="check-circle"
              onPress={handleRequestPermissions}
            />

            <Button
              title="Agora Não"
              preset="outline"
              onPress={handleSkip}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
