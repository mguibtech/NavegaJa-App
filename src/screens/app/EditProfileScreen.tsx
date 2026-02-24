import React, {useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, Modal, FlatList, Image, Alert, ActionSheetIOS, Linking, Dimensions, View, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal, UserAvatar, AvatarEditorModal} from '@components';
import {useAuthStore} from '@store';
import {useUpdateProfile, userAPI} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';
import {apiImageSource, normalizeFileUrl} from '../../api/config';
import {pickDocument, isDocumentPickerCancelled} from '../../native/documentPicker';

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

  // Rastreia se documentos do capitão foram alterados (para aviso de re-aprovação)
  const originalLicenseUrl = user?.licensePhotoUrl ?? null;
  const originalCertificateUrl = user?.certificatePhotoUrl ?? null;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(formatCPF(user?.cpf || ''));
  const [city, setCity] = useState(user?.city || 'Manaus');
  const [showCityPicker, setShowCityPicker] = useState(false);

  const [licensePhotoUrl, setLicensePhotoUrl] = useState<string | null>(
    normalizeFileUrl(user?.licensePhotoUrl) || null,
  );
  const [licensePhotoType, setLicensePhotoType] = useState<'image' | 'pdf'>(
    user?.licensePhotoUrl?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
  );
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState<string | null>(
    normalizeFileUrl(user?.certificatePhotoUrl) || null,
  );
  const [certificatePhotoType, setCertificatePhotoType] = useState<'image' | 'pdf'>(
    user?.certificatePhotoUrl?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
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

  const [showDocPicker, setShowDocPicker] = useState(false);
  const [docPickerField, setDocPickerField] = useState<'license' | 'certificate' | null>(null);

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
      const url = normalizeFileUrl(response.url);

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

  async function handleSaveDiceBearAvatar(dicebearUrl: string) {
    setShowAvatarEditor(false);
    setIsUploadingAvatar(true);
    try {
      await userAPI.updateAvatar(dicebearUrl);
      setAvatarUrl(dicebearUrl);
      updateUser({...user!, avatarUrl: dicebearUrl});
      toast.showSuccess('Avatar atualizado!');
    } catch {
      toast.showError('Não foi possível salvar o avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  function uploadCaptainDoc(field: 'license' | 'certificate') {
    setDocPickerField(field);
    setShowDocPicker(true);
  }

  function handleDocPickerOption(option: 'camera' | 'gallery' | 'pdf') {
    const field = docPickerField;
    setShowDocPicker(false);
    setDocPickerField(null);
    if (!field) return;
    const setter = field === 'license' ? setIsUploadingLicense : setIsUploadingCertificate;
    if (option === 'pdf') {
      pickCaptainDocFromPdf(field, setter);
    } else {
      pickCaptainDocFrom(option, field, setter);
    }
  }

  async function pickCaptainDocFromPdf(
    field: 'license' | 'certificate',
    setter: (v: boolean) => void,
  ) {
    setter(true);
    try {
      const doc = await pickDocument(['application/pdf']);
      const formData = new FormData();
      formData.append('file', {
        uri: doc.uri,
        type: doc.type || 'application/pdf',
        name: doc.name || 'document.pdf',
      } as any);

      const response = await api.upload<{url: string}>(
        '/upload/document?folder=documents',
        formData,
      );
      const url = normalizeFileUrl(response.url);

      if (field === 'license') {
        setLicensePhotoUrl(url);
        setLicensePhotoType('pdf');
      } else {
        setCertificatePhotoUrl(url);
        setCertificatePhotoType('pdf');
      }
    } catch (error: any) {
      if (!isDocumentPickerCancelled(error)) {
        const msg = error?.message ?? 'Não foi possível fazer o upload do PDF';
        toast.showError(msg);
      }
    } finally {
      setter(false);
    }
  }

  async function pickCaptainDocFrom(
    source: 'camera' | 'gallery',
    field: 'license' | 'certificate',
    setter: (v: boolean) => void,
  ) {
    setter(true);
    try {
      const opts = {mediaType: 'photo' as const, quality: 0.8 as const, maxWidth: 1920, maxHeight: 1920};
      const result = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);
      if (result.didCancel || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri || '',
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'doc.jpg',
      } as any);

      const response = await api.upload<{url: string}>(
        '/upload/document?folder=documents',
        formData,
      );
      const url = normalizeFileUrl(response.url);

      if (field === 'license') {
        setLicensePhotoUrl(url);
        setLicensePhotoType('image');
      } else {
        setCertificatePhotoUrl(url);
        setCertificatePhotoType('image');
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível fazer o upload do documento');
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

  const docsChanged = isCaptain && (
    licensePhotoUrl !== originalLicenseUrl ||
    certificatePhotoUrl !== originalCertificateUrl
  );

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

      // PATCH /users/profile não retorna capabilities nem rejectionReason.
      // Fazer merge explícito para não apagar esses campos do store.
      updateUser({
        ...user!,
        ...updatedUser,
        capabilities: updatedUser.capabilities !== undefined
          ? updatedUser.capabilities
          : (user?.capabilities ?? null),
        rejectionReason: updatedUser.rejectionReason !== undefined
          ? updatedUser.rejectionReason
          : (user?.rejectionReason ?? null),
      });
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
              <Box flexDirection="row" alignItems="center" g="s12">
                <TouchableOpacityBox onPress={handleChangeAvatar} disabled={isUploadingAvatar}>
                  <Text preset="paragraphMedium" color="primary" bold>
                    {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
                  </Text>
                </TouchableOpacityBox>
                <Text preset="paragraphSmall" color="border">|</Text>
                <TouchableOpacityBox
                  onPress={() => setShowAvatarEditor(true)}
                  disabled={isUploadingAvatar}>
                  <Text preset="paragraphMedium" color="secondary" bold>
                    Criar avatar
                  </Text>
                </TouchableOpacityBox>
              </Box>
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
                    isPdf={licensePhotoType === 'pdf'}
                    isUploading={isUploadingLicense}
                    onPress={() => uploadCaptainDoc('license')}
                    onRemove={() => { setLicensePhotoUrl(null); setLicensePhotoType('image'); }}
                  />

                  <CaptainDocField
                    label="Certificado de Habilitação"
                    photoUrl={certificatePhotoUrl}
                    isPdf={certificatePhotoType === 'pdf'}
                    isUploading={isUploadingCertificate}
                    onPress={() => uploadCaptainDoc('certificate')}
                    onRemove={() => { setCertificatePhotoUrl(null); setCertificatePhotoType('image'); }}
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

      <AvatarEditorModal
        visible={showAvatarEditor}
        currentAvatarUrl={avatarUrl}
        userName={user?.name}
        onConfirm={handleSaveDiceBearAvatar}
        onClose={() => setShowAvatarEditor(false)}
      />

      {/* Bottom sheet — seleção de documento */}
      <Modal
        visible={showDocPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDocPicker(false)}>
        <TouchableOpacityBox
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.45)'}}
          onPress={() => setShowDocPicker(false)}
          activeOpacity={1}
        />
        <Box
          backgroundColor="surface"
          borderTopLeftRadius="s24"
          borderTopRightRadius="s24"
          paddingHorizontal="s20"
          paddingTop="s20"
          paddingBottom="s24"
          style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
          <Box
            alignSelf="center"
            width={40}
            height={4}
            borderRadius="s8"
            backgroundColor="border"
            mb="s20"
          />
          <Text preset="paragraphMedium" color="text" bold mb="s4">
            Selecionar documento
          </Text>
          <Text preset="paragraphSmall" color="textSecondary" mb="s20">
            Escolha como enviar seu documento
          </Text>

          <TouchableOpacityBox
            onPress={() => handleDocPickerOption('camera')}
            flexDirection="row"
            alignItems="center"
            paddingVertical="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s16">
              <Icon name="photo-camera" size={22} color="primary" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Câmera
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Fotografar documento agora
              </Text>
            </Box>
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          <TouchableOpacityBox
            onPress={() => handleDocPickerOption('gallery')}
            flexDirection="row"
            alignItems="center"
            paddingVertical="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s16">
              <Icon name="photo-library" size={22} color="primary" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Galeria
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Selecionar imagem da galeria
              </Text>
            </Box>
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          <TouchableOpacityBox
            onPress={() => handleDocPickerOption('pdf')}
            flexDirection="row"
            alignItems="center"
            paddingVertical="s16"
            mb="s8">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              alignItems="center"
              justifyContent="center"
              mr="s16"
              style={{backgroundColor: '#FEE2E2'}}>
              <Icon name="picture-as-pdf" size={22} color={'#DC2626' as any} />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphMedium" color="text" bold>
                Arquivo PDF
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Selecionar PDF do armazenamento
              </Text>
            </Box>
            <Icon name="chevron-right" size={20} color="textSecondary" />
          </TouchableOpacityBox>

          <TouchableOpacityBox
            onPress={() => setShowDocPicker(false)}
            backgroundColor="background"
            borderRadius="s12"
            paddingVertical="s16"
            alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary" bold>
              Cancelar
            </Text>
          </TouchableOpacityBox>
        </Box>
      </Modal>

      <InfoModal
        visible={showSuccessModal}
        title="Sucesso"
        message={
          docsChanged
            ? 'Perfil atualizado! Seus documentos serão reanalisados pelo NavegaJá. Você será notificado após a aprovação.'
            : 'Perfil atualizado com sucesso!'
        }
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
  isPdf,
  isUploading,
  onPress,
  onRemove,
}: {
  label: string;
  photoUrl: string | null;
  isPdf: boolean;
  isUploading: boolean;
  onPress: () => void;
  onRemove: () => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);

  function handlePreview() {
    if (!photoUrl) {return;}
    if (isPdf) {
      Linking.openURL(photoUrl).catch(() =>
        Alert.alert('Erro', 'Não foi possível abrir o documento'),
      );
    } else {
      setPreviewLoading(true);
      setPreviewError(false);
      setShowPreview(true);
    }
  }

  return (
    <Box mb="s16">
      <Text preset="paragraphSmall" color="text" bold mb="s8">
        {label}
      </Text>
      {photoUrl ? (
        <Box flexDirection="row" alignItems="flex-start" gap="s12">
          {/* Thumbnail tappable — toca para abrir preview */}
          <TouchableOpacityBox
            onPress={handlePreview}
            width={80}
            height={80}
            borderRadius="s8"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
            style={{borderWidth: 1, borderColor: '#D1D5DB'}}>
            {isPdf ? (
              <>
                <Icon name="picture-as-pdf" size={30} color={'#DC2626' as any} />
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                  PDF
                </Text>
              </>
            ) : (
              <Image
                source={apiImageSource(photoUrl)}
                style={{width: 80, height: 80}}
                resizeMode="cover"
              />
            )}
            {/* Badge de preview no canto inferior */}
            <Box
              style={{
                position: 'absolute',
                bottom: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.55)',
                borderRadius: 6,
                padding: 3,
              }}>
              <Icon
                name={isPdf ? 'open-in-new' : 'zoom-in'}
                size={11}
                color={'white' as any}
              />
            </Box>
          </TouchableOpacityBox>

          <Box flex={1} gap="s8">
            {/* Botão visualizar / abrir */}
            <TouchableOpacityBox
              onPress={handlePreview}
              borderRadius="s8"
              paddingVertical="s8"
              paddingHorizontal="s12"
              flexDirection="row"
              alignItems="center"
              style={{borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB'}}>
              <Icon
                name={isPdf ? 'open-in-new' : 'visibility'}
                size={15}
                color="textSecondary"
              />
              <Text preset="paragraphSmall" color="textSecondary" bold ml="s4">
                {isPdf ? 'Abrir PDF' : 'Visualizar'}
              </Text>
            </TouchableOpacityBox>

            {/* Substituir */}
            <TouchableOpacityBox
              onPress={onPress}
              backgroundColor="primaryBg"
              borderRadius="s8"
              paddingVertical="s8"
              paddingHorizontal="s12"
              flexDirection="row"
              alignItems="center">
              <Icon name="refresh" size={15} color="primary" />
              <Text preset="paragraphSmall" color="primary" bold ml="s4">
                Substituir
              </Text>
            </TouchableOpacityBox>

            {/* Remover */}
            <TouchableOpacityBox
              onPress={onRemove}
              backgroundColor="dangerBg"
              borderRadius="s8"
              paddingVertical="s8"
              paddingHorizontal="s12"
              flexDirection="row"
              alignItems="center">
              <Icon name="delete" size={15} color="danger" />
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

      {/* Modal de preview em tela cheia (apenas para imagens) */}
      <Modal
        visible={showPreview}
        transparent
        statusBarTranslucent
        animationType="fade"
        onRequestClose={() => setShowPreview(false)}>
        <View style={previewStyles.overlay}>
          <TouchableOpacity
            style={previewStyles.closeBtn}
            onPress={() => setShowPreview(false)}>
            <View style={previewStyles.closeBtnInner}>
              <Icon name="close" size={24} color={'white' as any} />
            </View>
          </TouchableOpacity>

          <Text
            preset="paragraphSmall"
            style={previewStyles.label}>
            {label}
          </Text>

          {photoUrl && !previewError && (
            <Image
              source={apiImageSource(photoUrl)}
              style={previewStyles.image}
              resizeMode="contain"
              onLoadStart={() => setPreviewLoading(true)}
              onLoad={() => setPreviewLoading(false)}
              onError={() => { setPreviewLoading(false); setPreviewError(true); }}
            />
          )}

          {previewLoading && !previewError && (
            <ActivityIndicator size="large" color="white" style={previewStyles.image} />
          )}

          {previewError && (
            <View style={[previewStyles.image, {alignItems: 'center', justifyContent: 'center'}]}>
              <Icon name="broken-image" size={48} color={'rgba(255,255,255,0.4)' as any} />
              <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.5)', marginTop: 8, textAlign: 'center', paddingHorizontal: 16}}>
                Não foi possível carregar a imagem.{'\n'}
                {photoUrl}
              </Text>
            </View>
          )}

          <Text
            preset="paragraphSmall"
            style={previewStyles.hint}>
            Toque em × para fechar
          </Text>
        </View>
      </Modal>
    </Box>
  );
}

const {width: SW, height: SH} = Dimensions.get('window');
const previewStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.93)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
  },
  closeBtnInner: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 12,
  },
  image: {
    width: SW * 0.92,
    height: SH * 0.68,
  },
  hint: {
    color: 'rgba(255,255,255,0.4)',
    marginTop: 16,
  },
});
