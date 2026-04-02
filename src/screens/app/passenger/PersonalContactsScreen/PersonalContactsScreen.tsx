import React, {useState} from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import {Box, Button, Icon, ScreenHeader, Text, TextInput, TouchableOpacityBox} from '@components';
import {usePersonalContacts} from '@domain';
import {useToast} from '@hooks';
import {formatPhone} from '@utils';
import {useNavigation} from '@react-navigation/native';

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  centeredText: {
    textAlign: 'center',
  },
  contactCard: {
    elevation: 1,
  },
});

export function PersonalContactsScreen() {
  const navigation = useNavigation();
  const toast = useToast();
  const MAX_CONTACTS = 5;
  const {contacts, isLoading, addContact, isAdding, removeContact} = usePersonalContacts();
  const isAtMax = contacts.length >= MAX_CONTACTS;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  async function handleAdd() {
    const trimmedName = name.trim();
    const trimmedPhone = phone.replace(/\D/g, '');
    if (!trimmedName) {
      toast.showError('Informe o nome do contacto');
      return;
    }
    if (trimmedPhone.length < 10) {
      toast.showError('Informe um número de telemóvel válido');
      return;
    }
    try {
      await addContact({name: trimmedName, phone: trimmedPhone});
      setName('');
      setPhone('');
      toast.showSuccess('Contacto adicionado com sucesso');
    } catch {
      toast.showError('Erro ao adicionar contacto');
    }
  }

  function handleRemove(id: string, contactName: string) {
    Alert.alert(
      'Remover contacto',
      `Tem a certeza que quer remover "${contactName}"?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeContact(id);
              toast.showSuccess('Contacto removido');
            } catch {
              toast.showError('Erro ao remover contacto');
            }
          },
        },
      ],
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        <ScreenHeader
          title="Contactos de Emergência"
          onBack={() => navigation.goBack()}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          {/* Info */}
          <Box
            backgroundColor="infoBg"
            borderRadius="s12"
            padding="s16"
            flexDirection="row"
            alignItems="flex-start"
            mb="s24">
            <Icon name="info" size={20} color="info" />
            <Text preset="paragraphSmall" color="info" ml="s12" flex={1}>
              Quando acionar o SOS, os contactos com conta no NavegaJá recebem
              uma notificação com a sua localização. Os restantes recebem via
              WhatsApp ou SMS.
            </Text>
          </Box>

          {/* Add form */}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
            <Text preset="paragraphMedium" color="text" bold>
              Adicionar contacto
            </Text>
            <Text preset="paragraphSmall" color={isAtMax ? 'danger' : 'textSecondary'}>
              {contacts.length}/{MAX_CONTACTS}
            </Text>
          </Box>

          {isAtMax && (
            <Box backgroundColor="warningBg" borderRadius="s12" padding="s12" mb="s16" flexDirection="row" alignItems="center">
              <Icon name="info" size={16} color="warning" />
              <Text preset="paragraphSmall" color="warning" ml="s8" flex={1}>
                Limite de {MAX_CONTACTS} contactos atingido. Remova um para adicionar outro.
              </Text>
            </Box>
          )}
          <Box mb="s12">
            <TextInput
              placeholder="Nome (ex: Mãe, João Silva)"
              value={name}
              onChangeText={setName}
              leftIcon="person"
            />
          </Box>
          <Box mb="s16">
            <TextInput
              placeholder="(92) 99999-9999"
              value={phone}
              onChangeText={text => setPhone(formatPhone(text))}
              keyboardType="phone-pad"
              maxLength={15}
              leftIcon="phone"
            />
          </Box>
          <Box mb="s32">
            <Button
              title={isAdding ? 'A adicionar…' : 'Adicionar Contacto'}
              onPress={handleAdd}
              loading={isAdding}
              disabled={isAdding || isAtMax}
              leftIcon="person-add"
            />
          </Box>

          {/* Contacts list */}
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Os meus contactos
          </Text>

          {isLoading ? (
            <Box alignItems="center" paddingVertical="s24">
              <ActivityIndicator size="small" color="#0a6fbd" />
            </Box>
          ) : contacts.length === 0 ? (
            <Box
              backgroundColor="surface"
              borderRadius="s12"
              padding="s20"
              alignItems="center">
              <Icon name="group-off" size={36} color="textSecondary" />
              <Text preset="paragraphMedium" color="textSecondary" mt="s12" style={styles.centeredText}>
                Ainda não tem contactos de emergência.{'\n'}Adicione pessoas de
                confiança acima.
              </Text>
            </Box>
          ) : (
            <Box>
              {contacts.map(contact => (
                <Box
                  key={contact.id}
                  backgroundColor="surface"
                  borderRadius="s12"
                  padding="s16"
                  mb="s12"
                  flexDirection="row"
                  alignItems="center"
                  style={styles.contactCard}>
                  <Box
                    width={44}
                    height={44}
                    borderRadius="s24"
                    backgroundColor={contact.linkedUserId ? 'secondaryBg' : 'border'}
                    alignItems="center"
                    justifyContent="center"
                    mr="s12">
                    <Icon
                      name={contact.linkedUserId ? 'person' : 'phone'}
                      size={22}
                      color={contact.linkedUserId ? 'secondary' : 'textSecondary'}
                    />
                  </Box>
                  <Box flex={1}>
                    <Text preset="paragraphMedium" color="text" bold>
                      {contact.name}
                    </Text>
                    <Box flexDirection="row" alignItems="center" mt="s4">
                      <Text preset="paragraphSmall" color="textSecondary">
                        {formatPhone(contact.phone)}
                      </Text>
                      {contact.linkedUserId && (
                        <Box
                          backgroundColor="secondaryBg"
                          borderRadius="s8"
                          paddingHorizontal="s8"
                          paddingVertical="s4"
                          ml="s8">
                          <Text preset="paragraphCaptionSmall" color="secondary" bold>
                            No NavegaJá
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <TouchableOpacityBox
                    onPress={() => handleRemove(contact.id, contact.name)}
                    padding="s8">
                    <Icon name="delete" size={20} color="danger" />
                  </TouchableOpacityBox>
                </Box>
              ))}
            </Box>
          )}
        </ScrollView>
      </Box>
    </KeyboardAvoidingView>
  );
}
