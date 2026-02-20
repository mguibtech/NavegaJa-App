import React, {useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, Image, Alert, ActionSheetIOS} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal, UserAvatar} from '@components';
import {useAuthStore} from '@store';
import {useUpdateProfile, userAPI} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';
import {API_BASE_URL} from '../../api/config';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'EditProfile'>;

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {return digits;}
  if (digits.length <= 6) {return `${digits.slice(0, 3)}.${digits.slice(3)}`;}
  if (digits.length <= 9) {return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;}
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

const AM_CITIES = [
  'Manaus', 'Parintins', 'Itacoatiara', 'Tefé', 'Barreirinha', 'Coari',
  'Maués', 'Tabatinga', 'Lábrea', 'Humaitá', 'Benjamin Constant',
  'São Gabriel da Cachoeira', 'Borba', 'Autazes', 'Nova Olinda do Norte',
  'Presidente Figueiredo', 'Iranduba', 'Manacapuru', 'Careiro', 'Anori',
];

export function EditProfileScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const toast = useToast();
  const {user, updateUser} = useAuthStore();
  const {updateProfile, isLoading} = useUpdateProfile();

  const isCaptain = user?.role === 'captain';

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(formatCPF(user?.cpf || ''));
  const [city, setCity] = useState(user?.city || 'Manaus');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [licensePhotoUrl, setLicensePhotoUrl] = useState<string | null>(
    user?.licensePhotoUrl ?? null,
  );
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState<string | null>(
    user?.certificatePhotoUrl ?? null,
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingLicense, setIsUploadingLicense] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);

  // Alterar senha
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function handleCpfChange(value: string) {
    setCpf(formatCPF(value));
  }

  async function handleChangeAvatar() {
    const options = ['Tirar foto', 'Escolher da galeria', 'Cancelar'];
    const cancelIdx = 2;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({options, cancelButtonIndex: cancelIdx}, idx => {
        if (idx === 0) pickAvatarFrom('camera');
        if (idx === 1) pickAvatarFrom('gallery');
      });
    } else {
      Alert.alert('Alterar foto', 'Escolha uma opção', [
        {text: 'Tirar foto', onPress: () => pickAvatarFrom('camera')},
        {text: 'Galeria', onPress: () => pickAvatarFrom('gallery')},
        {text: 'Cancelar', style: 'cancel'},
      ]);
    }
  }

  async function pickAvatarFrom(source: 'camera' | 'gallery') {
    setIsUploadingAvatar(true);
    try {
      const opts = {mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 512, maxHeight: 512};
      const result = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);

      if (result.didCancel || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {uri: asset.uri ?? '', type: asset.type ?? 'image/jpeg', name: asset.fileName ?? 'avatar.jpg'} as any);

      const response = await api.upload<{url: string}>('/upload/image?folder=avatars', formData);
      const url = response.url.startsWith('http') ? response.url : `${API_BASE_URL}${response.url}`;

      await userAPI.updateAvatar(url);
      setAvatarUrl(url);
      updateUser({...user!, avatarUrl: url});
      toast.showSuccess('Foto atualizada!');
    } catch {
      toast.showError('Não foi possível atualizar a foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function uploadCaptainPhoto(field: 'license' | 'certificate') {
    const setter =
      field === 'license' ? setIsUploadingLicense : setIsUploadingCertificate;
    setter(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (result.didCancel || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri || '',
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'doc.jpg',
      } as any);

      const response = await api.upload<{url: string}>(
        '/upload/image?folder=captains',
        formData,
      );
      const url = response.url.startsWith('http')
        ? response.url
        : `${API_BASE_URL}${response.url}`;

      if (field === 'license') {
        setLicensePhotoUrl(url);
      } else {
        setCertificatePhotoUrl(url);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível fazer o upload da foto');
    } finally {
      setter(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.showError('Preencha todos os campos de senha.');
      return;
    }
    if (newPassword.length < 6) {
      toast.showError('A nova senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.showError('As senhas não conferem.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await userAPI.updatePassword({currentPassword, newPassword});
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPasswordSection(false);
      toast.showSuccess('Senha alterada com sucesso!');
    } catch (err: any) {
      toast.showError(err?.message ?? 'Senha atual incorreta.');
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleSave() {
    try {
      const updatedUser = await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        cpf: cpf.replace(/\D/g, '') || undefined,
        city: city.trim() || undefined,
        state: 'AM',
        licensePhotoUrl: licensePhotoUrl ?? undefined,
        certificatePhotoUrl: certificatePhotoUrl ?? undefined,
      });

      updateUser(updatedUser);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          'Não foi possível atualizar o perfil. Tente novamente.',
      );
      setShowErrorModal(true);
    }
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    navigation.goBack();
  }

  return (
    <>
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

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={{padding: 24, paddingBottom: 40}}
            keyboardShouldPersistTaps="handled">
            {/* Avatar */}
            <Box alignItems="center" mb="s32">
              <TouchableOpacityBox
                onPress={handleChangeAvatar}
                disabled={isUploadingAvatar}
                mb="s12"
                style={{opacity: isUploadingAvatar ? 0.6 : 1}}>
                <UserAvatar
                  userId={user?.id}
                  avatarUrl={avatarUrl}
                  name={user?.name}
                  size="xl"
                />
                {/* Camera badge */}
                <Box
                  position="absolute"
                  style={{
                    bottom: 0, right: 0,
                    backgroundColor: '#0B5D8A',
                    borderRadius: 16,
                    width: 32, height: 32,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 2, borderColor: '#fff',
                    elevation: 3,
                  }}>
                  {isUploadingAvatar
                    ? <Icon name="hourglass-empty" size={16} color="surface" />
                    : <Icon name="photo-camera" size={16} color="surface" />
                  }
                </Box>
              </TouchableOpacityBox>
              <TouchableOpacityBox onPress={handleChangeAvatar} disabled={isUploadingAvatar}>
                <Text preset="paragraphMedium" color="primary" bold>
                  {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
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
                <Text
                  preset="paragraphCaptionSmall"
                  color="textSecondary"
                  mt="s4">
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

              {/* Cidade */}
              <Box>
                <Text preset="paragraphMedium" color="text" bold mb="s8">
                  Cidade
                </Text>
                <TouchableOpacityBox
                  onPress={() => setShowCityPicker(true)}
                  backgroundColor="surface"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor="border"
                  paddingHorizontal="s16"
                  paddingVertical="s16"
                  flexDirection="row"
                  alignItems="center"
                  style={{elevation: 1}}>
                  <Icon name="location-city" size={20} color="textSecondary" />
                  <Text
                    preset="paragraphMedium"
                    color={city ? 'text' : 'textSecondary'}
                    ml="s12"
                    flex={1}>
                    {city || 'Selecione sua cidade'}
                  </Text>
                  <Icon
                    name="keyboard-arrow-down"
                    size={20}
                    color="textSecondary"
                  />
                </TouchableOpacityBox>
              </Box>

              {/* Documentos do Capitão */}
              {isCaptain && (
                <Box
                  backgroundColor="surface"
                  borderRadius="s16"
                  padding="s16"
                  mt="s8"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                    elevation: 2,
                  }}>
                  <Box flexDirection="row" alignItems="center" mb="s16">
                    <Icon name="verified" size={20} color="primary" />
                    <Text preset="paragraphMedium" color="text" bold ml="s8">
                      Documentos de Habilitação
                    </Text>
                  </Box>
                  <Text
                    preset="paragraphSmall"
                    color="textSecondary"
                    mb="s16">
                    Envie seus documentos para verificação. Após análise, seu
                    perfil receberá o selo de capitão verificado.
                  </Text>

                  <CaptainDocField
                    label="Licença de Navegação"
                    photoUrl={licensePhotoUrl}
                    isUploading={isUploadingLicense}
                    onPress={() => uploadCaptainPhoto('license')}
                    onRemove={() => setLicensePhotoUrl(null)}
                  />

                  <CaptainDocField
                    label="Certificado de Habilitação"
                    photoUrl={certificatePhotoUrl}
                    isUploading={isUploadingCertificate}
                    onPress={() => uploadCaptainPhoto('certificate')}
                    onRemove={() => setCertificatePhotoUrl(null)}
                  />
                </Box>
              )}
            </Box>

            {/* Alterar Senha */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              mt="s24"
              overflow="hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <TouchableOpacityBox
                flexDirection="row"
                alignItems="center"
                paddingHorizontal="s16"
                paddingVertical="s16"
                onPress={() => setShowPasswordSection(!showPasswordSection)}>
                <Box
                  width={36}
                  height={36}
                  borderRadius="s8"
                  backgroundColor="primaryBg"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12">
                  <Icon name="lock" size={18} color="primary" />
                </Box>
                <Text preset="paragraphMedium" color="text" bold flex={1}>
                  Alterar Senha
                </Text>
                <Icon
                  name={showPasswordSection ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color="textSecondary"
                />
              </TouchableOpacityBox>

              {showPasswordSection && (
                <Box paddingHorizontal="s16" paddingBottom="s16" gap="s12">
                  <TextInput
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Senha atual"
                    secureTextEntry
                  />
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nova senha (mín. 6 caracteres)"
                    secureTextEntry
                  />
                  <TextInput
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="Confirmar nova senha"
                    secureTextEntry
                  />
                  <Button
                    title="Salvar Nova Senha"
                    onPress={handleChangePassword}
                    loading={isChangingPassword}
                    disabled={isChangingPassword}
                  />
                </Box>
              )}
            </Box>

            <Box mt="s24">
              <Button
                title="Salvar Alterações"
                onPress={handleSave}
                loading={isLoading}
                disabled={isLoading || !name.trim()}
              />
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Box>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacityBox
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}
          onPress={() => setShowCityPicker(false)}
        />
        <Box
          backgroundColor="surface"
          borderTopLeftRadius="s20"
          borderTopRightRadius="s20"
          paddingTop="s16"
          style={{maxHeight: '60%'}}>
          <Box
            flexDirection="row"
            alignItems="center"
            paddingHorizontal="s20"
            paddingBottom="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Text preset="paragraphMedium" color="text" bold flex={1}>
              Selecione sua cidade
            </Text>
            <TouchableOpacityBox
              onPress={() => setShowCityPicker(false)}
              padding="s4">
              <Icon name="close" size={24} color="textSecondary" />
            </TouchableOpacityBox>
          </Box>
          <FlatList
            data={AM_CITIES}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacityBox
                onPress={() => {
                  setCity(item);
                  setShowCityPicker(false);
                }}
                paddingHorizontal="s20"
                paddingVertical="s16"
                flexDirection="row"
                alignItems="center"
                backgroundColor={city === item ? 'primaryBg' : 'surface'}
                borderBottomWidth={1}
                borderBottomColor="border">
                <Text
                  preset="paragraphMedium"
                  color={city === item ? 'primary' : 'text'}
                  bold={city === item}
                  flex={1}>
                  {item}
                </Text>
                {city === item && (
                  <Icon name="check" size={20} color="primary" />
                )}
              </TouchableOpacityBox>
            )}
          />
        </Box>
      </Modal>

      <InfoModal
        visible={showSuccessModal}
        title="Sucesso"
        message="Perfil atualizado com sucesso!"
        icon="check-circle"
        iconColor="success"
        buttonText="OK"
        onClose={handleSuccessClose}
      />
      <InfoModal
        visible={showErrorModal}
        title="Erro"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowErrorModal(false)}
      />
    </>
  );
}

function CaptainDocField({
  label,
  photoUrl,
  isUploading,
  onPress,
  onRemove,
}: {
  label: string;
  photoUrl: string | null;
  isUploading: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <Box mb="s16">
      <Text preset="paragraphSmall" color="text" bold mb="s8">
        {label}
      </Text>
      {photoUrl ? (
        <Box flexDirection="row" alignItems="center" gap="s12">
          <Image
            source={{uri: photoUrl}}
            style={{width: 80, height: 80, borderRadius: 8}}
            resizeMode="cover"
          />
          <Box flex={1}>
            <TouchableOpacityBox
              onPress={onPress}
              backgroundColor="primaryBg"
              borderRadius="s8"
              paddingVertical="s8"
              paddingHorizontal="s12"
              flexDirection="row"
              alignItems="center"
              mb="s8">
              <Icon name="refresh" size={16} color="primary" />
              <Text preset="paragraphSmall" color="primary" bold ml="s4">
                Substituir
              </Text>
            </TouchableOpacityBox>
            <TouchableOpacityBox
              onPress={onRemove}
              backgroundColor="dangerBg"
              borderRadius="s8"
              paddingVertical="s8"
              paddingHorizontal="s12"
              flexDirection="row"
              alignItems="center">
              <Icon name="delete" size={16} color="danger" />
              <Text preset="paragraphSmall" color="danger" bold ml="s4">
                Remover
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>
      ) : (
        <TouchableOpacityBox
          onPress={isUploading ? undefined : onPress}
          borderWidth={2}
          borderColor="border"
          borderRadius="s12"
          paddingVertical="s16"
          alignItems="center"
          justifyContent="center"
          backgroundColor="background"
          style={{opacity: isUploading ? 0.5 : 1}}>
          <Icon
            name={isUploading ? 'hourglass-empty' : 'upload-file'}
            size={32}
            color="textSecondary"
          />
          <Text preset="paragraphSmall" color="textSecondary" mt="s8">
            {isUploading ? 'Enviando...' : 'Toque para selecionar'}
          </Text>
        </TouchableOpacityBox>
      )}
    </Box>
  );
}
