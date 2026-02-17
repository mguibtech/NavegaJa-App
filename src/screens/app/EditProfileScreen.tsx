import React, {useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal} from '@components';
import {useAuthStore} from '@store';
import {useUpdateProfile} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function EditProfileScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const {user, updateUser} = useAuthStore();
  const {updateProfile, isLoading} = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  // Inicializa já formatado caso o CPF salvo seja apenas dígitos
  const [cpf, setCpf] = useState(formatCPF(user?.cpf || ''));
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  function handleCpfChange(value: string) {
    setCpf(formatCPF(value));
  }

  async function handleSave() {
    try {
      const updatedUser = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        // Envia apenas dígitos para o backend
        cpf: cpf.replace(/\D/g, '') || undefined,
      });

      updateUser(updatedUser);
      setShowSuccessModal(true);
    } catch {
      setShowErrorModal(true);
    }
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    navigation.goBack();
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          alignItems="center"
          justifyContent="center"
          onPress={() => navigation.goBack()}
          mr="s12">
          <Icon name="arrow-back" size={24} color="text" />
        </TouchableOpacityBox>
        <Text preset="headingSmall" color="text" bold>
          Editar Perfil
        </Text>
      </Box>

      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{padding: 24}} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <Box alignItems="center" mb="s32">
          <Box
            width={96}
            height={96}
            borderRadius="s48"
            backgroundColor="primaryBg"
            alignItems="center"
            justifyContent="center"
            mb="s12">
            <Icon name="person" size={48} color="primary" />
          </Box>
          <TouchableOpacityBox>
            <Text preset="paragraphMedium" color="primary" bold>
              Alterar foto
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* Form */}
        <Box gap="s16">
          <Box>
            <Text preset="paragraphMedium" color="text" bold mb="s8">
              Nome completo
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Digite seu nome"
              autoCapitalize="words"
            />
          </Box>

          <Box>
            <Text preset="paragraphMedium" color="text" bold mb="s8">
              Telefone
            </Text>
            <TextInput
              value={user?.phone}
              editable={false}
              placeholder="Telefone"
              style={{backgroundColor: '#F5F5F5'}}
            />
            <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
              O telefone não pode ser alterado
            </Text>
          </Box>

          <Box>
            <Text preset="paragraphMedium" color="text" bold mb="s8">
              E-mail
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Box>

          <Box>
            <Text preset="paragraphMedium" color="text" bold mb="s8">
              CPF
            </Text>
            <TextInput
              value={cpf}
              onChangeText={handleCpfChange}
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
            />
          </Box>
        </Box>

        {/* Save Button */}
        <Box mt="s32">
          <Button
            title="Salvar Alterações"
            onPress={handleSave}
            loading={isLoading}
            disabled={isLoading || !name.trim()}
          />
        </Box>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <InfoModal
        visible={showSuccessModal}
        title="Sucesso"
        message="Perfil atualizado com sucesso!"
        icon="check-circle"
        iconColor="success"
        buttonText="OK"
        onClose={handleSuccessClose}
      />

      {/* Error Modal */}
      <InfoModal
        visible={showErrorModal}
        title="Erro"
        message="Não foi possível atualizar o perfil. Tente novamente."
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowErrorModal(false)}
      />
    </Box>
  );
}
