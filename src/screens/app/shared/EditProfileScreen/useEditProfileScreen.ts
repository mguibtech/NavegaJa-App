import {useEffect, useState} from 'react';
import {ActionSheetIOS, Alert, Platform} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  CaptainDocumentType,
  getLatestDocumentChangeRequest,
  hasPendingDocumentChangeRequest,
  useCreateDocumentChangeRequest,
  useDocumentChangeRequests,
  useUpdateAvatar,
  useUpdatePassword,
  useUpdateProfile,
} from '@domain';
import {pickDocument, isDocumentPickerCancelled} from '@native/documentPicker';
import {normalizeFileUrl} from '@api/config';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {uploadService} from '../../../../infra/uploadService';

import {AppStackParamList} from '@routes';
import {AM_CITIES} from '@utils';

function parseCoordinate(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {return null;}

    const parsed = Number(trimmed.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getFileKind(url: string | null): 'image' | 'pdf' {
  return url?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image';
}

function hasValidUploadedDocument(url: string | null): boolean {
  if (!url) {return false;}
  return /^(https?:\/\/|file:|content:)/i.test(url);
}

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
  const {updateProfile, isLoading: isUpdatingProfile} = useUpdateProfile();
  const {updateAvatar} = useUpdateAvatar();
  const {updatePassword: doUpdatePassword} = useUpdatePassword();

  const isCaptain = user?.role === 'captain';
  const {requests: documentChangeRequests} = useDocumentChangeRequests(isCaptain);
  const {
    createDocumentChangeRequest,
    isLoading: isCreatingDocumentChangeRequest,
  } = useCreateDocumentChangeRequest();

  const originalLicenseUrl = normalizeFileUrl(user?.licensePhotoUrl) || null;
  const originalCertificateUrl = normalizeFileUrl(user?.certificatePhotoUrl) || null;
  const originalLicenseType = getFileKind(originalLicenseUrl);
  const originalCertificateType = getFileKind(originalCertificateUrl);

  const licenseRequest = getLatestDocumentChangeRequest(
    documentChangeRequests,
    'LICENCA_NAVEGACAO',
  );
  const certificateRequest = getLatestDocumentChangeRequest(
    documentChangeRequests,
    'CERTIFICADO_SEGURANCA',
  );

  const canEditLicenseDocument = !hasPendingDocumentChangeRequest(
    documentChangeRequests,
    'LICENCA_NAVEGACAO',
  );
  const canEditCertificateDocument = !hasPendingDocumentChangeRequest(
    documentChangeRequests,
    'CERTIFICADO_SEGURANCA',
  );

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(formatCPF(user?.cpf || ''));
  const [city, setCity] = useState(user?.city || 'Manaus');
  const [gender, setGender] = useState<'M' | 'F' | 'other' | null>(user?.gender ?? null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [cityIsCustom, setCityIsCustom] = useState(
    !!user?.city && !AM_CITIES.includes(user.city),
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [homeCommunityLabel, setHomeCommunityLabel] = useState(user?.homeCommunity || '');
  const [homeLat, setHomeLat] = useState<number | null>(parseCoordinate(user?.homeLat));
  const [homeLng, setHomeLng] = useState<number | null>(parseCoordinate(user?.homeLng));

  const [licensePhotoUrl, setLicensePhotoUrl] = useState<string | null>(originalLicenseUrl);
  const [licensePhotoType, setLicensePhotoType] = useState<'image' | 'pdf'>(originalLicenseType);
  const [certificatePhotoUrl, setCertificatePhotoUrl] = useState<string | null>(originalCertificateUrl);
  const [certificatePhotoType, setCertificatePhotoType] = useState<'image' | 'pdf'>(originalCertificateType);
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
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showDocPicker, setShowDocPicker] = useState(false);
  const [docPickerField, setDocPickerField] = useState<'license' | 'certificate' | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    });
    return unsubscribe;
  }, [navigation]);

  function canEditCaptainDocument(field: 'license' | 'certificate'): boolean {
    return field === 'license'
      ? canEditLicenseDocument
      : canEditCertificateDocument;
  }

  function getPendingRequestMessage(field: 'license' | 'certificate'): string {
    return field === 'license'
      ? 'Já existe uma solicitação pendente para a licença de navegação.'
      : 'Já existe uma solicitação pendente para o certificado de segurança.';
  }

  function getDocumentRequestStatusLabel(field: 'license' | 'certificate'): string | null {
    const request = field === 'license' ? licenseRequest : certificateRequest;
    if (!request) {return null;}

    if (request.status === 'PENDING') {return 'PENDENTE';}
    if (request.status === 'APPROVED') {return 'APROVADO';}
    return 'REJEITADO';
  }

  function getDocumentRequestMessage(field: 'license' | 'certificate'): string | null {
    const request = field === 'license' ? licenseRequest : certificateRequest;
    if (!request) {return null;}

    if (request.status === 'PENDING') {
      return 'Sua solicitação será enviada para análise do administrador.';
    }

    if (request.status === 'APPROVED') {
      return 'A última solicitação deste documento foi aprovada.';
    }

    return request.rejectionReason || 'A última solicitação deste documento foi rejeitada.';
  }

  function handleLocationConfirm(lat: number, lng: number, label: string, geocodedCity?: string) {
    setHomeLat(lat);
    setHomeLng(lng);
    setHomeCommunityLabel(label);
    setShowLocationPicker(false);
    if (geocodedCity) {
      const normalised = geocodedCity.trim();
      const match = AM_CITIES.find(c => c.toLowerCase() === normalised.toLowerCase());
      if (match) {
        setCity(match);
        setCityIsCustom(false);
      } else {
        setCity(normalised);
        setCityIsCustom(true);
      }
    }
  }

  function handleCpfChange(value: string) {
    setCpf(formatCPF(value));
  }

  async function handleChangeAvatar() {
    const options = ['Tirar foto', 'Escolher da galeria', 'Cancelar'];
    const cancelIdx = 2;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {options, cancelButtonIndex: cancelIdx},
        idx => {
          if (idx === 0) {pickAvatarFrom('camera');}
          if (idx === 1) {pickAvatarFrom('gallery');}
        },
      );
      return;
    }

    Alert.alert('Alterar foto', 'Escolha uma opção', [
      {text: 'Tirar foto', onPress: () => pickAvatarFrom('camera')},
      {text: 'Galeria', onPress: () => pickAvatarFrom('gallery')},
      {text: 'Cancelar', style: 'cancel'},
    ]);
  }

  async function pickAvatarFrom(source: 'camera' | 'gallery') {
    setIsUploadingAvatar(true);
    try {
      const opts = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        maxWidth: 512,
        maxHeight: 512,
      };
      const result = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);

      if (result.didCancel || !result.assets?.[0]) {return;}

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri ?? '',
        type: asset.type ?? 'image/jpeg',
        name: asset.fileName ?? 'avatar.jpg',
      } as any);

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
    if (!canEditCaptainDocument(field)) {
      toast.showError(getPendingRequestMessage(field));
      return;
    }

    setDocPickerField(field);
    setShowDocPicker(true);
  }

  function handleDocPickerOption(option: 'camera' | 'gallery' | 'pdf') {
    const field = docPickerField;
    setShowDocPicker(false);
    setDocPickerField(null);
    if (!field) {return;}

    const setter = field === 'license'
      ? setIsUploadingLicense
      : setIsUploadingCertificate;

    if (option === 'pdf') {
      pickCaptainDocFromPdf(field, setter);
      return;
    }

    pickCaptainDocFrom(option, field, setter);
  }

  async function pickCaptainDocFromPdf(
    field: 'license' | 'certificate',
    setter: (v: boolean) => void,
  ) {
    if (!canEditCaptainDocument(field)) {
      toast.showError(getPendingRequestMessage(field));
      return;
    }

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
        toast.showError(error?.message ?? 'Não foi possível fazer o upload do PDF');
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
    if (!canEditCaptainDocument(field)) {
      toast.showError(getPendingRequestMessage(field));
      return;
    }

    setter(true);
    try {
      const opts = {
        mediaType: 'photo' as const,
        quality: 0.8 as const,
        maxWidth: 1920,
        maxHeight: 1920,
      };
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

  const profileChanged =
    name.trim() !== (user?.name ?? '') ||
    email.trim() !== (user?.email ?? '') ||
    cpf.replace(/\D/g, '') !== (user?.cpf ?? '') ||
    city.trim() !== (user?.city ?? '') ||
    gender !== (user?.gender ?? null) ||
    (homeCommunityLabel.trim() || '') !== (user?.homeCommunity ?? '') ||
    parseCoordinate(homeLat) !== parseCoordinate(user?.homeLat) ||
    parseCoordinate(homeLng) !== parseCoordinate(user?.homeLng);

  async function handleSave() {
    const normalizedHomeLat = parseCoordinate(homeLat);
    const normalizedHomeLng = parseCoordinate(homeLng);

    try {
      const documentRequestsToCreate: Array<{
        field: 'license' | 'certificate';
        documentType: CaptainDocumentType;
        newDocumentUrl: string;
      }> = [];

      if (isCaptain && licensePhotoUrl !== originalLicenseUrl) {
        if (!canEditLicenseDocument) {
          toast.showError(getPendingRequestMessage('license'));
          return;
        }
        if (!hasValidUploadedDocument(licensePhotoUrl)) {
          toast.showError('Envie uma licença de navegação válida antes de salvar.');
          return;
        }
        documentRequestsToCreate.push({
          field: 'license',
          documentType: 'LICENCA_NAVEGACAO',
          newDocumentUrl: licensePhotoUrl!,
        });
      }

      if (isCaptain && certificatePhotoUrl !== originalCertificateUrl) {
        if (!canEditCertificateDocument) {
          toast.showError(getPendingRequestMessage('certificate'));
          return;
        }
        if (!hasValidUploadedDocument(certificatePhotoUrl)) {
          toast.showError('Envie um certificado válido antes de salvar.');
          return;
        }
        documentRequestsToCreate.push({
          field: 'certificate',
          documentType: 'CERTIFICADO_SEGURANCA',
          newDocumentUrl: certificatePhotoUrl!,
        });
      }

      if (!profileChanged && documentRequestsToCreate.length === 0) {
        toast.showError('Nenhuma alteração para salvar.');
        return;
      }

      if (profileChanged) {
        const updatedUser = await updateProfile({
          name: name.trim(),
          email: email.trim() || undefined,
          cpf: cpf.replace(/\D/g, '') || undefined,
          city: city.trim() || undefined,
          state: 'AM',
          gender: gender ?? undefined,
          homeCommunity: homeCommunityLabel.trim() || null,
          homeMunicipio: city.trim() || null,
          homeLat: normalizedHomeLat,
          homeLng: normalizedHomeLng,
        });

        updateUser({
          ...user!,
          ...updatedUser,
          licensePhotoUrl: user?.licensePhotoUrl ?? null,
          certificatePhotoUrl: user?.certificatePhotoUrl ?? null,
          capabilities: updatedUser.capabilities !== undefined
            ? updatedUser.capabilities
            : (user?.capabilities ?? null),
          rejectionReason: updatedUser.rejectionReason !== undefined
            ? updatedUser.rejectionReason
            : (user?.rejectionReason ?? null),
        });
      }

      if (documentRequestsToCreate.length > 0) {
        for (const request of documentRequestsToCreate) {
          await createDocumentChangeRequest({
            documentType: request.documentType,
            newDocumentUrl: request.newDocumentUrl,
          });

          if (request.field === 'license') {
            setLicensePhotoUrl(originalLicenseUrl);
            setLicensePhotoType(originalLicenseType);
          } else {
            setCertificatePhotoUrl(originalCertificateUrl);
            setCertificatePhotoType(originalCertificateType);
          }
        }
      }

      setSuccessMessage(
        profileChanged && documentRequestsToCreate.length > 0
          ? 'Perfil atualizado. Sua solicitação será enviada para análise do administrador.'
          : documentRequestsToCreate.length > 0
            ? 'Sua solicitação será enviada para análise do administrador.'
            : 'Perfil atualizado com sucesso!',
      );
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Não foi possível atualizar o perfil. Tente novamente.',
      );
      setShowErrorModal(true);
    }
  }

  function handleSuccessClose() {
    setShowSuccessModal(false);
    navigation.goBack();
  }

  function handleRemoveCaptainDoc(field: 'license' | 'certificate') {
    if (!canEditCaptainDocument(field)) {
      toast.showError(getPendingRequestMessage(field));
      return;
    }

    if (field === 'license') {
      setLicensePhotoUrl(originalLicenseUrl);
      setLicensePhotoType(originalLicenseType);
      return;
    }

    setCertificatePhotoUrl(originalCertificateUrl);
    setCertificatePhotoType(originalCertificateType);
  }

  return {
    navigation,
    user,
    isCaptain,
    name, setName,
    email, setEmail,
    cpf,
    city, setCity,
    gender, setGender,
    showCityPicker, setShowCityPicker,
    cityIsCustom, setCityIsCustom,
    showLocationPicker, setShowLocationPicker,
    homeCommunityLabel,
    homeLat, homeLng,
    handleLocationConfirm,
    licensePhotoUrl,
    licensePhotoType,
    certificatePhotoUrl,
    certificatePhotoType,
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
    successMessage,
    showErrorModal, setShowErrorModal,
    errorMessage,
    showDocPicker, setShowDocPicker,
    docsChanged,
    profileChanged,
    canEditLicenseDocument,
    canEditCertificateDocument,
    successLoading: isCreatingDocumentChangeRequest,
    isLoading: isUpdatingProfile || isCreatingDocumentChangeRequest,
    handleCpfChange,
    getDocumentRequestStatusLabel,
    getDocumentRequestMessage,
    handleChangeAvatar,
    handleSaveDiceBearAvatar,
    uploadCaptainDoc,
    handleRemoveCaptainDoc,
    handleDocPickerOption,
    handleChangePassword,
    handleSave,
    handleSuccessClose,
  };
}
