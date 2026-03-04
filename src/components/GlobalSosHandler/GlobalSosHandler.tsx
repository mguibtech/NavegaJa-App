import React, {useState} from 'react';
import {Linking, Modal} from 'react-native';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {PersonalContact, SosType, usePersonalContacts, useSosAlert} from '@domain';
import {useToast, useVolumeButtonSos} from '@hooks';

/**
 * Componente global que vive na raiz da app (apenas quando autenticado).
 * Activa o SOS por botão físico (Volume ↓ 3×) em qualquer tela.
 * Mostra modal de resultado com botões WhatsApp para contactos não vinculados.
 */
export function GlobalSosHandler() {
  const toast = useToast();
  const {createAlert} = useSosAlert();
  const {contacts} = usePersonalContacts();

  const [sosTriggering, setSosTriggering] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [unlinkedContacts, setUnlinkedContacts] = useState<PersonalContact[]>([]);

  async function handleSosTrigger() {
    if (sosTriggering) {return;}
    setSosTriggering(true);
    try {
      await createAlert(SosType.GENERAL, {description: 'SOS acionado pelo passageiro'});
      const unlinked = contacts.filter(c => !c.linkedUserId);
      setUnlinkedContacts(unlinked);
      setShowResultModal(true);
    } catch {
      toast.showError('Erro ao enviar SOS. Verifique a sua ligação.');
    } finally {
      setSosTriggering(false);
    }
  }

  function handleWhatsApp(contact: PersonalContact) {
    const msg =
      '🆘 EMERGÊNCIA! Preciso de ajuda urgente! Abra o NavegaJá para ver a minha localização.';
    Linking.openURL(
      `whatsapp://send?phone=55${contact.phone}&text=${encodeURIComponent(msg)}`,
    ).catch(() => {
      Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`);
    });
  }

  // Volume ↓ 3× em 2s → dispara SOS em qualquer tela (Android)
  useVolumeButtonSos({
    onTrigger: handleSosTrigger,
    onHint: remaining =>
      toast.showInfo(
        `SOS: prima mais ${remaining} vez${remaining === 1 ? '' : 'es'} o volume ↓`,
      ),
    enabled: !sosTriggering,
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
