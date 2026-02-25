import React, {useState} from 'react';
import {FlatList, Linking} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, ConfirmationModal, Icon, InfoModal, Text, TouchableOpacityBox} from '@components';
import {useEmergencyContacts} from '@domain';
import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'EmergencyContacts'>;

export function EmergencyContactsScreen({}: Props) {
  const {top} = useSafeAreaInsets();
  const {contacts, isLoading} = useEmergencyContacts();

  const [selectedContact, setSelectedContact] = useState<{name: string; number: string} | null>(null);
  const [showDialerErrorModal, setShowDialerErrorModal] = useState(false);

  const handleCallContact = async (name: string, number: string) => {
    const url = `tel:${number}`;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      setSelectedContact({name, number});
    } else {
      setShowDialerErrorModal(true);
    }
  };

  if (isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="background">
        <Text preset="paragraphMedium" color="text">
          Carregando contatos...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box paddingHorizontal="s20" paddingBottom="s20" backgroundColor="danger" style={{paddingTop: top + 16}}>
        <Text preset="headingMedium" color="surface" bold mb="s8">
          Contatos de Emergência
        </Text>
        <Text preset="paragraphMedium" color="surface">
          Ligue imediatamente em caso de emergência
        </Text>
      </Box>

      <FlatList
        data={contacts.sort((a, b) => a.priority - b.priority)}
        keyExtractor={item => item.id}
        contentContainerStyle={{padding: 20}}
        renderItem={({item}) => (
          <TouchableOpacityBox
            mb="s16"
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            onPress={() => handleCallContact(item.name, item.number)}
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Box flexDirection="row" alignItems="center" mb="s12">
              <Box
                width={48}
                height={48}
                borderRadius="s12"
                backgroundColor="dangerBg"
                justifyContent="center"
                alignItems="center"
                mr="s16">
                <Icon name={item.icon as any} size={24} color="danger" />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  {item.name}
                </Text>
                {item.description && (
                  <Text preset="paragraphCaptionSmall" color="textSecondary">
                    {item.description}
                  </Text>
                )}
              </Box>
            </Box>

            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingTop="s12"
              borderTopWidth={1}
              borderTopColor="border">
              <Box flexDirection="row" alignItems="center" flex={1}>
                <Icon name="phone" size={18} color="primary" />
                <Text preset="paragraphMedium" color="primary" bold ml="s8">
                  {item.number}
                </Text>
              </Box>

              <Box
                paddingHorizontal="s12"
                paddingVertical="s6"
                backgroundColor="primaryBg"
                borderRadius="s8">
                <Text preset="paragraphCaptionSmall" color="primary" bold>
                  Ligar
                </Text>
              </Box>
            </Box>
          </TouchableOpacityBox>
        )}
        ListEmptyComponent={
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            paddingVertical="s32">
            <Icon name="contact-phone" size={64} color="textSecondary" />
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s16"
              textAlign="center">
              Nenhum contato de emergência disponível
            </Text>
          </Box>
        }
      />

      <ConfirmationModal
        visible={selectedContact != null}
        title={`Ligar para ${selectedContact?.name}?`}
        message={`Você será redirecionado para discar ${selectedContact?.number}`}
        icon="phone"
        iconColor="primary"
        confirmText="Ligar"
        cancelText="Cancelar"
        onConfirm={() => {
          if (selectedContact) {
            Linking.openURL(`tel:${selectedContact.number}`);
          }
          setSelectedContact(null);
        }}
        onCancel={() => setSelectedContact(null)}
      />

      <InfoModal
        visible={showDialerErrorModal}
        title="Erro"
        message="Não foi possível abrir o discador de telefone."
        icon="error"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowDialerErrorModal(false)}
      />
    </Box>
  );
}
