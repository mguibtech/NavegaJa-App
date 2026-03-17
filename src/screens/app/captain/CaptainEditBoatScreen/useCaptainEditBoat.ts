import {useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {BoatFileReference, useUpdateBoat, useGetBoatById} from '@domain';
import {getFilePreviewUri} from '@api/config';
import {useToast} from '@hooks';
import {uploadService} from '../../../../infra/uploadService';

import {AppStackParamList} from '@routes';

export type PhotoItem = {uri: string; type: string; name: string};

export const BOAT_TYPES = [
  'Lancha',
  'Barco regional',
  'Barco de linha',
  'Canoa motorizada',
  'Ferry',
  'Outro',
];

function normalizeSavedFileUrls(
  files?: BoatFileReference[] | null,
): string[] {
  return (files ?? [])
    .map(getFilePreviewUri)
    .filter((uri): uri is string => !!uri);
}

export function useCaptainEditBoat() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainEditBoat'>>();
  const {boatId} = route.params;
  const toast = useToast();
  const {updateBoat, isLoading: isSaving} = useUpdateBoat();
  const {data: boat, isLoading: isLoadingBoat, error: loadError} = useGetBoatById(boatId);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  const [savedPhotos, setSavedPhotos] = useState<string[]>([]);
  const [savedDocPhotos, setSavedDocPhotos] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [uploadLabel, setUploadLabel] = useState('');

  useEffect(() => {
    if (boat) {
      setName(boat.name);
      setType(boat.type);
      setCapacity(String(boat.capacity));
      setRegistrationNum(boat.registrationNum ?? '');
      setSavedPhotos(normalizeSavedFileUrls(boat.photos));
      setSavedDocPhotos(normalizeSavedFileUrls(boat.documentPhotos));
      setRejectionReason(boat.rejectionReason ?? null);
    }
  }, [boat]);

  useEffect(() => {
    if (loadError) {
      toast.showError('Não foi possível carregar os dados da embarcação');
      navigation.goBack();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadError]);

  const hasSubmittedBoatDocuments = (boat?.documentPhotos?.length ?? 0) > 0;
  const canEditBoatDocuments = !hasSubmittedBoatDocuments || !!boat?.rejectionReason;
  const boatDocumentsBlockedFallback =
    'Os documentos da embarcação estão bloqueados para edição até nova liberação do administrador.';
  const boatDocumentsLockedMessage = canEditBoatDocuments
    ? null
    : boat?.isVerified
      ? 'Os documentos da embarcação já foram aprovados e estão bloqueados para edição. Se precisar corrigir algo, solicite uma nova revisão ao administrador.'
      : 'Os documentos da embarcação foram enviados e estão em análise. Eles só poderão ser alterados novamente se o administrador reprovar a documentação.';

  function validate(): string | null {
    if (!name.trim()) {return 'Informe o nome da embarcação';}
    if (!type.trim()) {return 'Selecione o tipo de embarcação';}
    if (!capacity.trim() || isNaN(Number(capacity)) || Number(capacity) < 1) {
      return 'Informe a capacidade de passageiros';
    }
    if (!registrationNum.trim()) {return 'Informe o número de registro';}
    return null;
  }

  async function uploadImages(items: PhotoItem[]): Promise<string[]> {
    const urls: string[] = [];
    for (let i = 0; i < items.length; i++) {
      setUploadLabel(`Enviando foto ${i + 1} de ${items.length}...`);
      const photo = items[i];
      const formData = new FormData();
      formData.append('file', {
        uri: photo.uri,
        type: photo.type || 'image/jpeg',
        name: photo.name || 'photo.jpg',
      } as any);
      urls.push(await uploadService.uploadImage(formData, 'boats'));
    }
    return urls;
  }

  async function uploadDocuments(items: PhotoItem[]): Promise<string[]> {
    if (!canEditBoatDocuments) {
      throw new Error(boatDocumentsLockedMessage || boatDocumentsBlockedFallback);
    }
    const urls: string[] = [];
    for (let i = 0; i < items.length; i++) {
      setUploadLabel(`Enviando documento ${i + 1} de ${items.length}...`);
      const doc = items[i];
      const formData = new FormData();
      formData.append('file', {
        uri: doc.uri,
        type: doc.type || 'image/jpeg',
        name: doc.name || 'doc.jpg',
      } as any);
      urls.push(await uploadService.uploadDocument(formData, 'documents'));
    }
    return urls;
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) {
      toast.showError(validationError);
      return;
    }

    try {
      if (!canEditBoatDocuments && docPhotos.length > 0) {
        toast.showError(boatDocumentsLockedMessage || boatDocumentsBlockedFallback);
        return;
      }

      const newPhotoUrls = photos.length > 0 ? await uploadImages(photos) : [];
      const newDocUrls = docPhotos.length > 0 ? await uploadDocuments(docPhotos) : [];

      setUploadLabel('Salvando alterações...');
      await updateBoat(boatId, {
        name: name.trim(),
        type: type.trim(),
        capacity: Number(capacity),
        registrationNum: registrationNum.trim().toUpperCase(),
        photos: [...savedPhotos, ...newPhotoUrls],
        documentPhotos: [...savedDocPhotos, ...newDocUrls],
      });

      toast.showSuccess('Embarcação atualizada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      setUploadLabel('');
      toast.showError(err?.message || 'Erro ao atualizar embarcação');
    }
  }

  function handleRemoveSavedPhoto(index: number) {
    setSavedPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function handleRemoveSavedDocPhoto(index: number) {
    if (!canEditBoatDocuments) {
      toast.showError(boatDocumentsLockedMessage || boatDocumentsBlockedFallback);
      return;
    }
    setSavedDocPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function goBack() {
    navigation.goBack();
  }

  const isBusy = isSaving || !!uploadLabel;

  return {
    // loading states
    isLoadingBoat,
    isSaving,
    isBusy,
    uploadLabel,
    // form state
    name,
    setName,
    type,
    setType,
    capacity,
    setCapacity,
    registrationNum,
    setRegistrationNum,
    showTypePicker,
    setShowTypePicker,
    photos,
    setPhotos,
    docPhotos,
    setDocPhotos,
    savedPhotos,
    savedDocPhotos,
    rejectionReason,
    canEditBoatDocuments,
    boatDocumentsLockedMessage,
    // handlers
    handleSubmit,
    handleRemoveSavedPhoto,
    handleRemoveSavedDocPhoto,
    goBack,
  };
}
