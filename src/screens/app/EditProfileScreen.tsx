import React, {useState} from 'react';
import {Alert, ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {useAuthStore} from '../../store/auth.store';
import {useUpdateProfile} from '../../domain/Auth/User';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

export function EditProfileScreen({navigation}: Props) {
  const {user, updateUser} = useAuthStore();
  const {updateProfile, isLoading} = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(user?.cpf || '');

  async function handleSave() {
    try {
      const updatedUser = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        cpf: cpf.trim() || undefined,
      });

      // Atualiza o store com os novos dados
      updateUser(updatedUser);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s56"
        paddingBottom="s24"
        backgroundColor="primary"
        flexDirection="row"
        alignItems="center">
        <TouchableOpacityBox mr="s16" onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="surface" />
        </TouchableOpacityBox>
        <Text preset="headingLarge" color="surface" bold>
          Editar Perfil
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 24}}>
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
              onChangeText={setCpf}
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
    </Box>
  );
}
