import React, {useEffect, useState} from 'react';
import {
  AppState,
  AppStateStatus,
  DeviceEventEmitter,
  Linking,
  Modal,
  NativeModules,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {PersonalContact, SosType, SosLocation, usePersonalContacts, useSosAlert, SosDuplicateError} from '@domain';
import {useToast, useVolumeButtonSos} from '@hooks';
import {useAuthStore} from '@store';
import {authStorage} from '@services';
import {API_BASE_URL} from '../../api/config';

const SOS_BG_FLAG_KEY = '@navegaja:sos_bg_triggered';

const {SosVolumeModule} = NativeModules;
const isAndroid = Platform.OS === 'android';

// TODO: SOS por botão de volume em standby até resolução do conflito de som
const VOLUME_SOS_ENABLED = false;

/**
 * Componente global montado na raiz do AppStack.
 *
 * Estratégia por estado do app:
 *  - Foreground (active)   → useVolumeButtonSos (JS) detecta volume ↓ 3×
 *  - Background / fechado  → SosVolumeService (Kotlin) detecta volume ↓ 3×
 *
 * Transição:
 *  - active → background : para JS listener, inicia Foreground Service
 *  - background → active : para Foreground Service, retoma JS listener
 */
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

  // ── Credenciais → SharedPreferences nativas ─────────────────────────────────
  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || !isLoggedIn || !VOLUME_SOS_ENABLED) {return;}
    authStorage.getToken().then(token => {
      if (token) {
        SosVolumeModule.saveCredentials(token, API_BASE_URL);
      }
    });
  }, [isLoggedIn]);

  // Garante que o serviço nativo está parado enquanto VOLUME_SOS_ENABLED = false
  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || VOLUME_SOS_ENABLED) {return;}
    SosVolumeModule.stopService?.();
    SosVolumeModule.clearCredentials?.();
  }, []);

  // Limpa credenciais e para serviço no logout
  useEffect(() => {
    if (!isAndroid || !SosVolumeModule) {return;}
    if (!isLoggedIn) {
      SosVolumeModule.clearCredentials?.();
      SosVolumeModule.stopService();
    }
  }, [isLoggedIn]);

  // ── Verifica flag de SOS em background ao montar e ao voltar ao foreground ────
  useEffect(() => {
    async function checkBgSosFlag() {
      try {
        const flag = await AsyncStorage.getItem(SOS_BG_FLAG_KEY);
        if (flag === 'true') {
          await AsyncStorage.removeItem(SOS_BG_FLAG_KEY);
          const unlinked = contacts.filter(c => !c.linkedUserId);
          setUnlinkedContacts(unlinked);
          setShowResultModal(true);
        }
      } catch {
        // silencioso
      }
    }
    checkBgSosFlag();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contacts]);

  // ── AppState — troca entre JS listener e Foreground Service ─────────────────
  useEffect(() => {
    if (!isAndroid || !SosVolumeModule || !isLoggedIn || !VOLUME_SOS_ENABLED) {return;}

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      setAppState(next);
      if (next === 'background') {
        SosVolumeModule.startService();
      } else if (next === 'active') {
        SosVolumeModule.stopService();
      }
    });

    return () => sub.remove();
  }, [isLoggedIn]);

  // ── Evento do Foreground Service (JS ainda vivo em background) ───────────────
  useEffect(() => {
    if (!isAndroid) {return;}
    const sub = DeviceEventEmitter.addListener('SosTriggerFromBackground', async () => {
      // SOS já enviado pelo serviço nativo — grava flag para mostrar modal no foreground
      try {
        await AsyncStorage.setItem(SOS_BG_FLAG_KEY, 'true');
      } catch {
        // silencioso
      }
      // Se o JS já está ativo (app em background mas não morto), mostra modal imediatamente
      const unlinked = contacts.filter(c => !c.linkedUserId);
      setUnlinkedContacts(unlinked);
      setShowResultModal(true);
    });
    return () => sub.remove();
  }, [contacts]);

  // ── SOS trigger (Volume ↓ em foreground ou SosHoldButton virtual) ────────────
  async function handleSosTrigger() {
    if (sosTriggering) {return;}
    setSosTriggering(true);
    try {
      const alert = await createAlert(SosType.GENERAL, {description: 'SOS acionado pelo passageiro'});
      if (alert?.location) {
        setSosLocation(alert.location);
      }
      const unlinked = contacts.filter(c => !c.linkedUserId);
      setUnlinkedContacts(unlinked);
      setShowResultModal(true);
    } catch (err: any) {
      if (err instanceof SosDuplicateError) {
        // 409 — already have an active SOS, show the result modal with existing info
        if (err.existingAlert?.location) {
          setSosLocation(err.existingAlert.location);
        }
        const unlinked = contacts.filter(c => !c.linkedUserId);
        setUnlinkedContacts(unlinked);
        setShowResultModal(true);
        toast.showWarning('Alerta SOS já está activo.');
      } else {
        toast.showError(err?.message ?? 'Erro ao enviar SOS. Verifique a sua ligação.');
      }
    } finally {
      setSosTriggering(false);
    }
  }

  function handleWhatsApp(contact: PersonalContact) {
    let msg = '🆘 EMERGÊNCIA! Preciso de ajuda urgente!';
    if (sosLocation?.latitude != null && sosLocation?.longitude != null) {
      const lat = sosLocation.latitude.toFixed(6);
      const lng = sosLocation.longitude.toFixed(6);
      const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
      msg += ` A minha localização: ${mapsUrl}`;
    }
    Linking.openURL(
      `whatsapp://send?phone=55${contact.phone}&text=${encodeURIComponent(msg)}`,
    ).catch(() => {
      Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`);
    });
  }

  // Volume ↓ 3× — activo apenas em foreground (background usa o serviço nativo)
  useVolumeButtonSos({
    onTrigger: handleSosTrigger,
    onHint: remaining =>
      toast.showInfo(
        `SOS: prima mais ${remaining} vez${remaining === 1 ? '' : 'es'} o volume ↓`,
      ),
    enabled: VOLUME_SOS_ENABLED && isActive && !sosTriggering,
  });

  return (
    <Modal
      visible={showResultModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowResultModal(false)}>
      <Box
        flex={1}
        style={{backgroundColor: 'rgba(0,0,0,0.6)'}}
        justifyContent="flex-end">
        <Box
          backgroundColor="surface"
          padding="s24"
          paddingBottom="s32"
          style={{borderTopLeftRadius: 20, borderTopRightRadius: 20}}>
          {/* Header */}
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
              style={{textAlign: 'center'}}>
              {unlinkedContacts.length > 0
                ? 'A equipa NavegaJá foi notificada. Notifique os restantes contactos via WhatsApp:'
                : 'A equipa NavegaJá e os seus contactos foram notificados.'}
            </Text>
          </Box>

          {/* WhatsApp buttons for unlinked contacts */}
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
