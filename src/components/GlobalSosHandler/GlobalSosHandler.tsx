import React, {useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
  Linking,
  Modal,
  NativeModules,
  Platform,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@infra/storage';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {
  PersonalContact,
  SosDuplicateError,
  SosLocation,
  SosType,
  usePersonalContacts,
  useSosAlert,
} from '@domain';
import {useToast, useVolumeButtonSos} from '@hooks';
import {useAuthStore} from '@store';
import {authStorage} from '@services';
import {API_BASE_URL} from '../../api/config';

const SOS_BG_FLAG_KEY = '@navegaja:sos_bg_triggered';

const {SosVolumeModule} = NativeModules;
const isAndroid = Platform.OS === 'android';

// SOS por botao de volume desativado para evitar disparos acidentais
const VOLUME_SOS_ENABLED = false;

export function GlobalSosHandler() {
  const toast = useToast();
  const {createAlert} = useSosAlert();
  const {contacts} = usePersonalContacts();
  const {isLoggedIn} = useAuthStore();

  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [unlinkedContacts, setUnlinkedContacts] = useState<PersonalContact[]>([]);
  const [sosLocation, setSosLocation] = useState<SosLocation | null>(null);

  const isActive = appState === 'active';

  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || !isLoggedIn || !VOLUME_SOS_ENABLED) {
      return;
    }

    authStorage.getToken().then(token => {
      if (token) {
        SosVolumeModule.saveCredentials(token, API_BASE_URL);
      }
    });
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || VOLUME_SOS_ENABLED) {
      return;
    }

    SosVolumeModule.stopService?.();
    SosVolumeModule.clearCredentials?.();
  }, []);

  useEffect(() => {
    if (!isAndroid || !SosVolumeModule) {
      return;
    }

    if (!isLoggedIn) {
      SosVolumeModule.clearCredentials?.();
      SosVolumeModule.stopService();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    async function checkBgSosFlag() {
      try {
        const flag = await AsyncStorage.getItem(SOS_BG_FLAG_KEY);
        if (flag === 'true') {
          await AsyncStorage.removeItem(SOS_BG_FLAG_KEY);
          setUnlinkedContacts(contacts.filter(contact => !contact.linkedUserId));
          setShowResultModal(true);
        }
      } catch {
        // Silencioso.
      }
    }

    checkBgSosFlag();
  }, [contacts]);

  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || !isLoggedIn || !VOLUME_SOS_ENABLED) {
      return;
    }

    const subscription = AppState.addEventListener('change', (next: AppStateStatus) => {
      setAppState(next);

      if (next === 'background') {
        SosVolumeModule.startService();
      } else if (next === 'active') {
        SosVolumeModule.stopService();
      }
    });

    return () => subscription.remove();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isAndroid) {
      return;
    }

    const subscription = DeviceEventEmitter.addListener(
      'SosTriggerFromBackground',
      async () => {
        try {
          await AsyncStorage.setItem(SOS_BG_FLAG_KEY, 'true');
        } catch {
          // Silencioso.
        }

        setUnlinkedContacts(contacts.filter(contact => !contact.linkedUserId));
        setShowResultModal(true);
      },
    );

    return () => subscription.remove();
  }, [contacts]);

  async function handleSosTrigger() {
    if (sosTriggering) {
      return;
    }

    setSosTriggering(true);

    try {
      const alert = await createAlert(SosType.GENERAL, {
        description: 'SOS acionado pelo passageiro',
      });

      if (alert?.location) {
        setSosLocation(alert.location);
      }

      setUnlinkedContacts(contacts.filter(contact => !contact.linkedUserId));
      setShowResultModal(true);
    } catch (error) {
      if (error instanceof SosDuplicateError) {
        if (error.existingAlert?.location) {
          setSosLocation(error.existingAlert.location);
        }

        setUnlinkedContacts(contacts.filter(contact => !contact.linkedUserId));
        setShowResultModal(true);
        toast.showWarning('Alerta SOS ja esta ativo.');
      } else {
        toast.showError(
          error instanceof Error
            ? error.message
            : 'Erro ao enviar SOS. Verifique sua conexao.',
        );
      }
    } finally {
      setSosTriggering(false);
    }
  }

  function handleWhatsApp(contact: PersonalContact) {
    let message = 'EMERGENCIA! Preciso de ajuda urgente!';

    if (sosLocation?.latitude != null && sosLocation?.longitude != null) {
      const lat = sosLocation.latitude.toFixed(6);
      const lng = sosLocation.longitude.toFixed(6);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      message += ` Minha localizacao: ${mapsUrl}`;
    }

    Linking.openURL(
      `whatsapp://send?phone=55${contact.phone}&text=${encodeURIComponent(message)}`,
    ).catch(() => {
      Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(message)}`);
    });
  }

  useVolumeButtonSos({
    onTrigger: handleSosTrigger,
    onHint: remaining =>
      toast.showInfo(
        `SOS: pressione mais ${remaining} vez${remaining === 1 ? '' : 'es'} o volume para baixo`,
      ),
    enabled: VOLUME_SOS_ENABLED && isActive && !sosTriggering,
  });

  return (
    <Modal
      visible={showResultModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowResultModal(false)}>
      <Box flex={1} style={styles.backdrop} justifyContent="flex-end">
        <Box
          backgroundColor="surface"
          padding="s24"
          paddingBottom="s32"
          style={styles.sheet}>
          <Box alignItems="center" mb="s20">
            <Box
              width={64}
              height={64}
              borderRadius="s48"
              backgroundColor="dangerBg"
              alignItems="center"
              justifyContent="center"
              mb="s12">
              <Icon name="crisis-alert" size={32} color="danger" />
            </Box>
            <Text preset="headingSmall" color="text" bold>
              SOS Enviado!
            </Text>
            <Text
              preset="paragraphSmall"
              color="textSecondary"
              mt="s8"
              style={styles.centerText}>
              {unlinkedContacts.length > 0
                ? 'A equipe NavegaJa foi notificada. Notifique os demais contatos via WhatsApp:'
                : 'A equipe NavegaJa e seus contatos foram notificados.'}
            </Text>
          </Box>

          {unlinkedContacts.length > 0 && (
            <Box mb="s20">
              {unlinkedContacts.map(contact => (
                <TouchableOpacityBox
                  key={contact.id}
                  backgroundColor="successBg"
                  borderRadius="s12"
                  padding="s12"
                  mb="s8"
                  flexDirection="row"
                  alignItems="center"
                  onPress={() => handleWhatsApp(contact)}>
                  <Icon name="phone" size={20} color="success" />
                  <Box flex={1} ml="s12">
                    <Text preset="paragraphMedium" color="text" bold>
                      {contact.name}
                    </Text>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {contact.phone}
                    </Text>
                  </Box>
                  <Icon name="open-in-new" size={16} color="success" />
                </TouchableOpacityBox>
              ))}
            </Box>
          )}

          <Button title="Fechar" onPress={() => setShowResultModal(false)} />
        </Box>
      </Box>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  centerText: {
    textAlign: 'center',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
