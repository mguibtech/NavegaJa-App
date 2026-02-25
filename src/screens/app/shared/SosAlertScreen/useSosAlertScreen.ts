import {useState, useEffect} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';

import {useSosAlert, SosType, SOS_TYPE_CONFIGS, SosTypeConfig} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export function useSosAlertScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'SosAlert'>>();
  const {tripId} = route.params || {};

  const {createAlert, cancelAlert, checkActiveAlert, activeAlert, isLoading} =
    useSosAlert();
  const toast = useToast();

  const [selectedType, setSelectedType] = useState<SosType | null>(null);
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmSosModal, setShowConfirmSosModal] = useState(false);
  const [showCancelSosModal, setShowCancelSosModal] = useState(false);

  useEffect(() => {
    checkActiveAlert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectType = (type: SosType) => {
    if (activeAlert) {
      toast.showError('Você já possui um alerta SOS ativo');
      return;
    }
    setSelectedType(type);
  };

  const handleCreateAlert = async () => {
    if (!selectedType) {
      toast.showError('Selecione o tipo de emergência');
      return;
    }
    setShowConfirmSosModal(true);
  };

  const handleConfirmSos = async () => {
    setShowConfirmSosModal(false);
    setIsCreating(true);
    try {
      const alert = await createAlert(selectedType!, {
        tripId,
        description: description.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
      });
      toast.showSuccess(
        `SOS acionado com sucesso! Código: ${alert.id.slice(0, 8).toUpperCase()}`,
      );
      setSelectedType(null);
      setDescription('');
      setContactNumber('');
    } catch (error: any) {
      toast.showError(
        error?.message || 'Não foi possível acionar SOS. Tente novamente.',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelAlert = async () => {
    if (!activeAlert) return;
    setShowCancelSosModal(true);
  };

  const handleConfirmCancelSos = async () => {
    setShowCancelSosModal(false);
    try {
      await cancelAlert(activeAlert!.id);
      toast.showSuccess('Alerta SOS cancelado com sucesso');
    } catch (error: any) {
      toast.showError(
        error?.message || 'Não foi possível cancelar o SOS.',
      );
    }
  };

  const sosTypes: SosTypeConfig[] = Object.values(SOS_TYPE_CONFIGS);

  return {
    navigation,
    tripId,
    activeAlert,
    isLoading,
    selectedType,
    description,
    setDescription,
    contactNumber,
    setContactNumber,
    isCreating,
    showConfirmSosModal,
    setShowConfirmSosModal,
    showCancelSosModal,
    setShowCancelSosModal,
    sosTypes,
    handleSelectType,
    handleCreateAlert,
    handleConfirmSos,
    handleCancelAlert,
    handleConfirmCancelSos,
  };
}
