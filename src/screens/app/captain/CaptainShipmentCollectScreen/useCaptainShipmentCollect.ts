import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useState} from 'react';

import {
  useGetCaptainShipment,
  useCaptainCollect,
  useCaptainOutForDelivery,
  ShipmentStatus,
} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

export const STATUS_LABELS: Partial<Record<ShipmentStatus, string>> = {
  [ShipmentStatus.PAID]: 'Pago — aguardando coleta',
  [ShipmentStatus.COLLECTED]: 'Coletado',
  [ShipmentStatus.IN_TRANSIT]: 'Em trânsito',
  [ShipmentStatus.ARRIVED]: 'Chegou ao destino',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'Saiu para entrega',
  [ShipmentStatus.DELIVERED]: 'Entregue',
};

export function useCaptainShipmentCollect() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainShipmentCollect'>>();
  const {shipmentId, validationCode: prefilledCode} = route.params;
  const toast = useToast();
  const user = useAuthStore(s => s.user);

  const canManageShipments = !user?.capabilities || user.capabilities.canManageShipments;

  const {shipment, isLoading, error} = useGetCaptainShipment(shipmentId);
  const {collect, isLoading: isCollecting} = useCaptainCollect();
  const {markOutForDelivery, isLoading: isMarkingDelivery} = useCaptainOutForDelivery();

  const [validationCode, setValidationCode] = useState(prefilledCode ?? '');

  if (error) {
    toast.showError(error?.message || 'Erro ao carregar encomenda');
    navigation.goBack();
  }

  async function handleCollect() {
    if (validationCode.trim().length < 4) {
      toast.showError('Informe o código de validação (PIN)');
      return;
    }
    try {
      await collect(shipmentId, validationCode.trim());
      toast.showSuccess('Encomenda coletada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Código inválido. Verifique e tente novamente.');
    }
  }

  async function handleOutForDelivery() {
    try {
      await markOutForDelivery(shipmentId);
      toast.showSuccess('Encomenda marcada como "Saiu para entrega"!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao atualizar status');
    }
  }

  function goBack() {
    navigation.goBack();
  }

  return {
    shipment,
    isLoading,
    validationCode,
    setValidationCode,
    isCodePrefilled: !!(prefilledCode && prefilledCode.length > 0),
    isCollecting,
    isMarkingDelivery,
    canManageShipments,
    handleCollect,
    handleOutForDelivery,
    goBack,
  };
}
