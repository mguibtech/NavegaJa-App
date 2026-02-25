import {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useCreateBoat, useUpdateBoat} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
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

export function useCaptainCreateBoat() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();
  const user = useAuthStore(s => s.user);
  const {createBoat, isLoading} = useCreateBoat();
  const {updateBoat} = useUpdateBoat();

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [docPhotos, setDocPhotos] = useState<PhotoItem[]>([]);
  const [uploadLabel, setUploadLabel] = useState('');

  const canOperate = !user?.capabilities || user.capabilities.canOperate;
  const isPending = user?.capabilities?.pendingVerification ?? false;

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
      const photoUrls = await uploadImages(photos);
      const docUrls = await uploadDocuments(docPhotos);

      setUploadLabel('Cadastrando embarcação...');
      const boat = await createBoat({
        name: name.trim(),
        type: type.trim(),
        capacity: Number(capacity),
        registrationNum: registrationNum.trim().toUpperCase(),
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });

      if (docUrls.length > 0) {
        setUploadLabel('Salvando documentos...');
        await updateBoat(boat.id, {documentPhotos: docUrls});
      }

      toast.showSuccess('Embarcação cadastrada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      setUploadLabel('');
      if (err?.statusCode === 403) {
        toast.showError('Documentação em análise. Aguarde a aprovação para cadastrar embarcações.');
      } else {
        toast.showError(err?.message || 'Erro ao cadastrar embarcação');
      }
    }
  }

  function goBack() {
    navigation.goBack();
  }

  function navigateToEditProfile() {
    navigation.navigate('EditProfile');
  }

  const isBusy = isLoading || !!uploadLabel;

  return {
    // auth / guard
    canOperate,
    isPending,
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
    // upload state
    uploadLabel,
    isLoading,
    isBusy,
    // handlers
    handleSubmit,
    goBack,
    navigateToEditProfile,
  };
}
