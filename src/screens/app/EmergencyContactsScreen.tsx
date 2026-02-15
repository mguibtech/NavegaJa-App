import React from 'react';
import {FlatList, Linking, Alert} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useEmergencyContacts} from '@domain';
import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'EmergencyContacts'>;

export function EmergencyContactsScreen({}: Props) {
  const {contacts, isLoading} = useEmergencyContacts();

  const handleCallContact = async (name: string, number: string) => {
    const url = `tel:${number}`;

    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      Alert.alert(
        `Ligar para ${name}?`,
        `Você será redirecionado para discar ${number}`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Ligar',
            style: 'default',
            onPress: () => Linking.openURL(url),
          },
        ],
      );
    } else {
      Alert.alert('Erro', 'Não foi possível abrir o discador de telefone.');
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
      <Box padding="s20" backgroundColor="danger">
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
    </Box>
  );
}
