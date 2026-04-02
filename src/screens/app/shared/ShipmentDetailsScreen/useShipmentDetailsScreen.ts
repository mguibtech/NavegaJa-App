import {useState, useEffect, useRef} from 'react';
import type {RefObject} from 'react';
import {View} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  ShipmentStatus,
  PaymentMethod,
  canCancelShipment,
  getShipmentLockedCancellationLabel,
  useConfirmPayment,
  useCollectShipment,
  useOutForDelivery,
  useShipmentDetails,
  useCancelShipment,
} from '@domain';
import {isOfflineQueuedError} from '@infra';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {API_BASE_URL} from '@api/config';

import {AppStackParamList} from '@routes';

type CaptureRefFn = (
  target: RefObject<View> | View,
  options: {
    format: 'png';
    quality: number;
    result: 'tmpfile';
  },
) => Promise<string>;

type NativeShareModule = {
  open: (options: {
    url: string;
    type: string;
    title: string;
    message: string;
    failOnCancel: boolean;
  }) => Promise<void>;
};

function getCaptureRef(): CaptureRefFn | null {
  try {
    const viewShotModule = require('react-native-view-shot');
    return viewShotModule.captureRef ?? viewShotModule.default?.captureRef ?? null;
  } catch {
    return null;
  }
}

function getNativeShare(): NativeShareModule | null {
  try {
    const shareModule = require('react-native-share');
    return shareModule.default ?? shareModule;
  } catch {
    return null;
  }
}

export function useShipmentDetailsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ShipmentDetails'>>();
  const {shipmentId} = route.params;
  const toast = useToast();
  const user = useAuthStore(state => state.user);
  const isCaptain = user?.role === 'captain' || user?.role === 'boat_manager';
  const shareCardRef = useRef<View>(null);

  const [showLoadErrorModal, setShowLoadErrorModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelErrorModal, setShowCancelErrorModal] = useState(false);
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false);
  const [showPaymentErrorModal, setShowPaymentErrorModal] = useState(false);
  const [showCollectPinModal, setShowCollectPinModal] = useState(false);
  const [collectPin, setCollectPin] = useState('');
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showCollectErrorModal, setShowCollectErrorModal] = useState(false);
  const [showOutForDeliveryModal, setShowOutForDeliveryModal] = useState(false);
  const [showOutForDeliveryErrorModal, setShowOutForDeliveryErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {shipment, timeline, isLoading, error: shipmentError, refetch: refetchShipment} = useShipmentDetails(shipmentId);
  const {cancel: cancelShipment} = useCancelShipment();
  const {confirm: confirmPayment, isLoading: isConfirmingPayment} = useConfirmPayment();
  const {collect: collectShipment, isLoading: isCollecting} = useCollectShipment();
  const {markOutForDelivery, isLoading: isMarkingOutForDelivery} = useOutForDelivery();

  useEffect(() => {
    if (shipmentError) { setShowLoadErrorModal(true); }
  }, [shipmentError]);

  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return {label: 'Aguardando Pagamento', color: 'warning' as const, bg: 'warningBg' as const, icon: 'schedule' as const};
      case ShipmentStatus.PAID:
        return {label: 'Pagamento Confirmado', color: 'success' as const, bg: 'successBg' as const, icon: 'check-circle' as const};
      case ShipmentStatus.COLLECTED:
        return {label: 'Coletada pelo Capitão', color: 'info' as const, bg: 'infoBg' as const, icon: 'inventory-2' as const};
      case ShipmentStatus.IN_TRANSIT:
        return {label: 'Em Trânsito', color: 'info' as const, bg: 'infoBg' as const, icon: 'local-shipping' as const};
      case ShipmentStatus.ARRIVED:
        return {label: 'Chegou ao Destino', color: 'info' as const, bg: 'infoBg' as const, icon: 'place' as const};
      case ShipmentStatus.OUT_FOR_DELIVERY:
        return {label: 'Saiu para Entrega', color: 'primary' as const, bg: 'primaryBg' as const, icon: 'delivery-dining' as const};
      case ShipmentStatus.DELIVERED:
        return {label: 'Entregue', color: 'success' as const, bg: 'successBg' as const, icon: 'check-circle' as const};
      case ShipmentStatus.CANCELLED:
        return {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const, icon: 'cancel' as const};
      default:
        return {label: 'Desconhecido', color: 'textSecondary' as const, bg: 'background' as const, icon: 'help-outline' as const};
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.PIX: return 'PIX';
      case PaymentMethod.CASH: return 'Dinheiro';
      case PaymentMethod.CREDIT_CARD: return 'Cartão de Crédito';
      case PaymentMethod.DEBIT_CARD: return 'Cartão de Débito';
      default: return method;
    }
  };

  async function handleShare() {
    if (!shipment || !shareCardRef.current) {return;}

    const captureRef = getCaptureRef();
    const nativeShare = getNativeShare();

    if (!captureRef || !nativeShare?.open) {
      toast.showError('NÃ£o foi possÃ­vel compartilhar. Tente novamente.');
      return;
    }

    try {
      const uri = await captureRef(shareCardRef.current, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });
      await nativeShare.open({
        url: uri,
        type: 'image/png',
        title: `Encomenda ${shipment.trackingCode}`,
        message: `Acompanhe minha encomenda NavegaJá\nCódigo: ${shipment.trackingCode}`,
        failOnCancel: false,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast.showError('Não foi possível compartilhar. Tente novamente.');
    }
  }

  async function handleCancel() {
    if (!shipment) {return;}
    setShowCancelModal(true);
  }

  async function confirmCancel() {
    if (!shipment) {return;}
    setShowCancelModal(false);
    try {
      await cancelShipment(shipment.id);
      toast.showSuccess('Encomenda cancelada! Sua encomenda foi cancelada com sucesso');
      navigation.goBack();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível cancelar a encomenda');
      setShowCancelErrorModal(true);
    }
  }

  function handleReview() {
    if (!shipment) {return;}
    navigation.navigate('ShipmentReview', {shipmentId: shipment.id});
  }

  async function handleConfirmPayment() {
    if (!shipment) {return;}
    setShowConfirmPaymentModal(true);
  }

  async function confirmPaymentAction() {
    if (!shipment) {return;}
    setShowConfirmPaymentModal(false);
    try {
      const result = await confirmPayment(shipment.id);
      toast.showSuccess(result.message);
      refetchShipment();
    } catch (error: any) {
      if (isOfflineQueuedError(error)) {
        toast.showInfo(error.message);
        return;
      }

      setErrorMessage(error?.message || 'Nao foi possivel confirmar o pagamento');
      setShowPaymentErrorModal(true);
    }
  }

  function handleCollect() {
    if (!shipment) {return;}
    setCollectPin('');
    setShowCollectPinModal(true);
  }

  async function confirmCollect() {
    if (!shipment) {return;}
    setShowCollectPinModal(false);
    setShowCollectModal(true);
  }

  async function executeCollect() {
    if (!shipment) {return;}
    setShowCollectModal(false);
    try {
      const result = await collectShipment(shipment.id, collectPin.trim() || undefined);
      toast.showSuccess(result.message);
      setCollectPin('');
      refetchShipment();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Não foi possível coletar a encomenda');
      setShowCollectErrorModal(true);
    }
  }

  async function handleOutForDelivery() {
    if (!shipment) {return;}
    setShowOutForDeliveryModal(true);
  }

  async function confirmOutForDelivery() {
    if (!shipment) {return;}
    setShowOutForDeliveryModal(false);
    try {
      const result = await markOutForDelivery(shipment.id);
      toast.showSuccess(result.message);
      refetchShipment();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível atualizar o status');
      setShowOutForDeliveryErrorModal(true);
    }
  }

  const statusConfig = shipment ? getStatusConfig(shipment.status) : null;

  // Frete a cobrar: destinatário paga ao capitão na entrega → sem botão de "Confirmar Pagamento"
  const isFreteACobrar = shipment?.paidBy === 'recipient';
  const canConfirmPayment = shipment?.status === ShipmentStatus.PENDING && !isFreteACobrar;
  const canCollect = isCaptain && shipment?.status === ShipmentStatus.PAID;
  const canOutForDelivery = isCaptain && shipment?.status === ShipmentStatus.ARRIVED;
  const showValidationPIN =
    shipment?.validationCode != null &&
    shipment?.status !== ShipmentStatus.DELIVERED &&
    shipment?.status !== ShipmentStatus.CANCELLED;
  const pinIsForDelivery = shipment?.status === ShipmentStatus.OUT_FOR_DELIVERY;
  const canCancel = canCancelShipment(shipment?.status);
  const lockedCancellationLabel = getShipmentLockedCancellationLabel(
    shipment?.status,
  );
  const canReview = shipment?.status === ShipmentStatus.DELIVERED;

  function resolvePhotoUri(photoUrl: string): string {
    return photoUrl.startsWith('http')
      ? photoUrl
          .replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL)
          .replace(/http:\/\/127\.0\.0\.1(:\d+)?/, API_BASE_URL)
      : `${API_BASE_URL}${photoUrl}`;
  }

  return {
    navigation,
    shipment,
    timeline,
    isLoading,
    isCaptain,
    showLoadErrorModal, setShowLoadErrorModal,
    showCancelModal, setShowCancelModal,
    showCancelErrorModal, setShowCancelErrorModal,
    showConfirmPaymentModal, setShowConfirmPaymentModal,
    showPaymentErrorModal, setShowPaymentErrorModal,
    showCollectPinModal, setShowCollectPinModal,
    collectPin, setCollectPin,
    showCollectModal, setShowCollectModal,
    showCollectErrorModal, setShowCollectErrorModal,
    showOutForDeliveryModal, setShowOutForDeliveryModal,
    showOutForDeliveryErrorModal, setShowOutForDeliveryErrorModal,
    errorMessage, setErrorMessage,
    isConfirmingPayment,
    isCollecting,
    isMarkingOutForDelivery,
    statusConfig,
    isFreteACobrar,
    canConfirmPayment,
    canCollect,
    canOutForDelivery,
    showValidationPIN,
    pinIsForDelivery,
    canCancel,
    lockedCancellationLabel,
    canReview,
    getPaymentMethodLabel,
    resolvePhotoUri,
    shareCardRef,
    handleShare,
    handleCancel,
    confirmCancel,
    handleReview,
    handleConfirmPayment,
    confirmPaymentAction,
    handleCollect,
    confirmCollect,
    executeCollect,
    handleOutForDelivery,
    confirmOutForDelivery,
  };
}
