import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useTripDetails,
  PaymentMethod,
  useCreateShipment,
  useCalculateShipmentPrice,
  CreateShipmentData,
  useCouponValidation,
} from '@domain';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';
import {formatBRL} from '@utils';

// Validação de telefone (formato WhatsApp)
export function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = numbers;

  if (numbers.length > 2) {
    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  if (numbers.length > 7) {
    formatted = `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }

  return formatted;
}

export function isPhoneComplete(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
}

export function useCreateShipmentScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CreateShipment'>>();
  const {tripId} = route.params;

  const {create: createShipment, isLoading: isCreatingShipment} =
    useCreateShipment();
  const {calculate, priceData, isLoading: isCalculatingPrice} =
    useCalculateShipmentPrice();
  const couponValidation = useCouponValidation();
  const toast = useToast();

  const {trip, isLoading: isLoadingTrip, error: tripError} = useTripDetails(tripId);

  // Modal states
  const [showLoadTripErrorModal, setShowLoadTripErrorModal] = useState(false);
  const [showRecipientNameErrorModal, setShowRecipientNameErrorModal] =
    useState(false);
  const [showPhoneErrorModal, setShowPhoneErrorModal] = useState(false);
  const [showAddressErrorModal, setShowAddressErrorModal] = useState(false);
  const [showDescriptionErrorModal, setShowDescriptionErrorModal] =
    useState(false);
  const [showWeightErrorModal, setShowWeightErrorModal] = useState(false);
  const [showDimensionsIncompleteModal, setShowDimensionsIncompleteModal] =
    useState(false);
  const [showDimensionsMaxModal, setShowDimensionsMaxModal] = useState(false);
  const [showCreateErrorModal, setShowCreateErrorModal] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState('');
  const [priceErrorMessage, setPriceErrorMessage] = useState('');

  // Dados do destinatário
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');

  // Dados da encomenda
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [heightDim, setHeightDim] = useState('');

  // Fotos
  const [photos, setPhotos] = useState<
    Array<{uri: string; type: string; name: string}>
  >([]);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.PIX,
  );

  // Error handling for trip load
  useEffect(() => {
    if (tripError) { setShowLoadTripErrorModal(true); }
  }, [tripError]);

  // Calculate price whenever weight/dimensions/coupon changes
  useEffect(() => {
    if (trip && weight && parseFloat(weight) > 0) {
      setPriceErrorMessage('');
      calculatePrice();
    } else {
      setPriceErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, weight, length, width, heightDim, couponValidation.state]);

  async function calculatePrice() {
    if (!trip || !weight) return;

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    // Dimensões opcionais — só inclui se todas fornecidas e válidas (≤ 200cm)
    let dimensions: {length: number; width: number; height: number} | undefined;
    if (length && width && heightDim) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(heightDim);
      if (!isNaN(l) && !isNaN(w) && !isNaN(h) && l <= 200 && w <= 200 && h <= 200) {
        dimensions = {length: l, width: w, height: h};
      } else {
        // Dimensões inválidas — não chama API (evita 400 do backend)
        return;
      }
    }

    // Cupom se válido
    const couponCode =
      couponValidation.state.status === 'VALID'
        ? couponValidation.state.data.code
        : undefined;

    setPriceErrorMessage('');
    try {
      await calculate(trip.id, weightNum, dimensions, couponCode);
    } catch (err: any) {
      const msg = err?.message || 'Não foi possível calcular o preço';
      setPriceErrorMessage(msg);
    }
  }

  async function handleApplyCoupon(code: string) {
    if (!trip) return;

    await couponValidation.validate({
      code,
      tripId: trip.id,
      quantity: 1,
    });
  }

  function handleRemoveCoupon() {
    couponValidation.remove();
  }

  function validateForm(): boolean {
    // Validar destinatário
    if (!recipientName.trim() || recipientName.trim().length < 3) {
      setShowRecipientNameErrorModal(true);
      return false;
    }

    if (!isPhoneComplete(recipientPhone)) {
      setShowPhoneErrorModal(true);
      return false;
    }

    if (!recipientAddress.trim() || recipientAddress.trim().length < 10) {
      setShowAddressErrorModal(true);
      return false;
    }

    // Validar encomenda
    if (!description.trim() || description.trim().length < 5) {
      setShowDescriptionErrorModal(true);
      return false;
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 0.1 || weightNum > 50) {
      setShowWeightErrorModal(true);
      return false;
    }

    // Validar dimensões se fornecidas
    if (length || width || heightDim) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(heightDim);

      if (!length || !width || !heightDim || isNaN(l) || isNaN(w) || isNaN(h)) {
        setShowDimensionsIncompleteModal(true);
        return false;
      }

      if (l > 200 || w > 200 || h > 200) {
        setShowDimensionsMaxModal(true);
        return false;
      }
    }

    return true;
  }

  // Pure check sem side effects (para não causar re-render loop)
  function isFormValid(): boolean {
    if (!recipientName.trim() || recipientName.trim().length < 3) return false;
    if (!isPhoneComplete(recipientPhone)) return false;
    if (!recipientAddress.trim() || recipientAddress.trim().length < 10)
      return false;
    if (!description.trim() || description.trim().length < 5) return false;
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 0.1 || weightNum > 50)
      return false;
    if (length || width || heightDim) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(heightDim);
      if (!length || !width || !heightDim || isNaN(l) || isNaN(w) || isNaN(h))
        return false;
      if (l > 200 || w > 200 || h > 200) return false;
    }
    return true;
  }

  const totalPrice = priceData?.finalPrice || 0;
  const hasWeight = !!(weight && parseFloat(weight) > 0);

  // PIX requer preço calculado para processar pagamento
  const isPIX = paymentMethod === PaymentMethod.PIX;
  const canSubmit =
    isFormValid() && !isCreatingShipment && (!isPIX || totalPrice > 0);

  function getButtonTitle(): string {
    if (isCreatingShipment) return 'Criando encomenda...';
    if (isCalculatingPrice) return 'Calculando preço...';
    if (!hasWeight) return 'Informe o peso para calcular';
    if (totalPrice > 0) return `Pagar ${formatBRL(totalPrice)}`;
    if (!isPIX) return 'Enviar Encomenda';
    return 'Aguardando cálculo do preço...';
  }

  async function handleCreateShipment() {
    if (!validateForm()) return;
    if (!trip) return;

    // PIX requer preço calculado para processar pagamento
    if (isPIX && totalPrice <= 0) {
      setCreateErrorMessage(
        priceErrorMessage ||
          'Não foi possível calcular o preço para PIX. Selecione Dinheiro ou tente novamente.',
      );
      setShowCreateErrorModal(true);
      return;
    }

    const weightNum = parseFloat(weight);

    // Dimensões opcionais
    const dimensions =
      length && width && heightDim
        ? {
            length: parseFloat(length),
            width: parseFloat(width),
            height: parseFloat(heightDim),
          }
        : undefined;

    // Cupom se válido
    const couponCode =
      couponValidation.state.status === 'VALID'
        ? couponValidation.state.data.code
        : undefined;

    const data: CreateShipmentData = {
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.replace(/\D/g, ''),
      recipientAddress: recipientAddress.trim(),
      description: description.trim(),
      weight: weightNum,
      dimensions,
      tripId: trip.id,
      paymentMethod,
      couponCode,
    };

    try {
      const shipment = await createShipment(data, photos);

      toast.showSuccess(
        `Encomenda criada! Código de rastreamento: ${shipment.trackingCode}`,
      );

      // Navegar para detalhes da encomenda
      navigation.replace('ShipmentDetails', {shipmentId: shipment.id});
    } catch (error: any) {
      setCreateErrorMessage(
        error?.message || 'Não foi possível criar a encomenda. Tente novamente.',
      );
      setShowCreateErrorModal(true);
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleLoadTripErrorClose() {
    setShowLoadTripErrorModal(false);
    navigation.goBack();
  }

  function handleCreateErrorClose() {
    setShowCreateErrorModal(false);
    setCreateErrorMessage('');
  }

  return {
    // Data
    trip,
    isLoadingTrip,
    priceData,
    totalPrice,
    hasWeight,
    isPIX,
    canSubmit,
    isCreatingShipment,
    isCalculatingPrice,
    // Form fields
    recipientName,
    setRecipientName,
    recipientPhone,
    setRecipientPhone,
    recipientAddress,
    setRecipientAddress,
    description,
    setDescription,
    weight,
    setWeight,
    length,
    setLength,
    width,
    setWidth,
    heightDim,
    setHeightDim,
    photos,
    setPhotos,
    paymentMethod,
    setPaymentMethod,
    // Coupon
    couponValidation,
    handleApplyCoupon,
    handleRemoveCoupon,
    // Handlers
    handleCreateShipment,
    handleGoBack,
    getButtonTitle,
    // Modal states
    showLoadTripErrorModal,
    handleLoadTripErrorClose,
    showRecipientNameErrorModal,
    setShowRecipientNameErrorModal,
    showPhoneErrorModal,
    setShowPhoneErrorModal,
    showAddressErrorModal,
    setShowAddressErrorModal,
    showDescriptionErrorModal,
    setShowDescriptionErrorModal,
    showWeightErrorModal,
    setShowWeightErrorModal,
    showDimensionsIncompleteModal,
    setShowDimensionsIncompleteModal,
    showDimensionsMaxModal,
    setShowDimensionsMaxModal,
    showCreateErrorModal,
    handleCreateErrorClose,
    createErrorMessage,
    priceErrorMessage,
  };
}
