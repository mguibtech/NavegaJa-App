import {useState} from 'react';
import {Platform, Alert, ActionSheetIOS} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAuthStore} from '@store';
import {useUpdateProfile, useUpdateAvatar, useUpdatePassword} from '@domain';
import {useToast} from '@hooks';
import {pickDocument, isDocumentPickerCancelled} from '@native/documentPicker';
import {normalizeFileUrl} from '@api/config';
import {uploadService} from '../../../../infra/uploadService';

import {AppStackParamList} from '@routes';

export const AM_CITIES = [
  'Manaus', 'Parintins', 'Itacoatiara', 'Tefé', 'Barreirinha', 'Coari',
  'Maués', 'Tabatinga', 'Lábrea', 'Humaitá', 'Benjamin Constant',
  'São Gabriel da Cachoeira', 'Borba', 'Autazes', 'Nova Olinda do Norte',
  'Presidente Figueiredo', 'Iranduba', 'Manacapuru', 'Careiro', 'Anori',
];

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {return digits;}
  if (digits.length <= 6) {return `${digits.slice(0, 3)}.${digits.slice(3)}`;}
  if (digits.length <= 9) {return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;}
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function useEditProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();
  const {user, updateUser} = useAuthStore();
  const {updateProfile, isLoading} = useUpdateProfile();
  const {updateAvatar} = useUpdateAvatar();
  const {updatePassword: doUpdatePassword} = useUpdatePassword();

  const isCaptain = user?.role === 'captain';

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
        if (idx === 0) {pickAvatarFrom('camera');}
        if (idx === 1) {pickAvatarFrom('gallery');}
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

      if (result.didCancel || !result.assets?.[0]) {return;}

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {uri: asset.uri ?? '', type: asset.type ?? 'image/jpeg', name: asset.fileName ?? 'avatar.jpg'} as any);

      const url = await uploadService.uploadImage(formData, 'avatars');

      await updateAvatar(url);
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
      await updateAvatar(dicebearUrl);
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
    if (!field) {return;}
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

      const url = await uploadService.uploadDocument(formData, 'documents');

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
      if (result.didCancel || !result.assets?.[0]) {return;}

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri || '',
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'doc.jpg',
      } as any);

      const url = await uploadService.uploadDocument(formData, 'documents');

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
      await doUpdatePassword({currentPassword, newPassword});
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

  return {
    navigation,
    user,
    isCaptain,
    name, setName,
    email, setEmail,
    cpf,
    city, setCity,
    showCityPicker, setShowCityPicker,
    licensePhotoUrl, setLicensePhotoUrl,
    licensePhotoType, setLicensePhotoType,
    certificatePhotoUrl, setCertificatePhotoUrl,
    certificatePhotoType, setCertificatePhotoType,
    avatarUrl,
    isUploadingAvatar,
    showAvatarEditor, setShowAvatarEditor,
    isUploadingLicense,
    isUploadingCertificate,
    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    isChangingPassword,
    showPasswordSection, setShowPasswordSection,
    showSuccessModal,
    showErrorModal, setShowErrorModal,
    errorMessage,
    showDocPicker, setShowDocPicker,
    docsChanged,
    isLoading,
    handleCpfChange,
    handleChangeAvatar,
    handleSaveDiceBearAvatar,
    uploadCaptainDoc,
    handleDocPickerOption,
    handleChangePassword,
    handleSave,
    handleSuccessClose,
  };
}
