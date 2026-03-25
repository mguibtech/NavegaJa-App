import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  getTripShipmentPricePerKg,
  useTripDetails,
  PaymentMethod,
  tripAcceptsShipments,
  useCreateShipment,
  useCalculateShipmentPrice,
  CreateShipmentData,
  useCouponValidation,
  useCepLookup,
  ShipmentValidator,
  SHIPMENT_VALIDATION_RULES,
} from '@domain';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';
import {formatBRL} from '@utils';
import {logShipmentCreated} from '@services';

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
  const cargoPricePerKg = getTripShipmentPricePerKg(trip);
  const acceptsShipments = tripAcceptsShipments(trip);

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
  const [recipientCep, setRecipientCep] = useState('');
  const {result: cepResult, lookup: lookupCep, isLoading: isCepLoading} = useCepLookup();

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
  const [paidBy, setPaidBy] = useState<'sender' | 'recipient'>('sender');

  function handleSetPaidBy(value: 'sender' | 'recipient') {
    setPaidBy(value);
    // Frete a cobrar → só dinheiro (pago ao capitão na entrega)
    if (value === 'recipient') {
      setPaymentMethod(PaymentMethod.CASH);
    }
  }

  // Error handling for trip load
  useEffect(() => {
    if (tripError) { setShowLoadTripErrorModal(true); }
  }, [tripError]);

  // Calculate price whenever weight/dimensions/coupon changes
  useEffect(() => {
    if (trip && acceptsShipments && weight && parseFloat(weight) > 0) {
      setPriceErrorMessage('');
      calculatePrice();
    } else {
      setPriceErrorMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip, acceptsShipments, weight, length, width, heightDim, couponValidation.state]);

  async function calculatePrice() {
    if (!trip || !acceptsShipments || !weight) return;

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
    const data: CreateShipmentData = {
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.replace(/\D/g, ''),
      recipientAddress: recipientAddress.trim(),
      description: description.trim(),
      weight: parseFloat(weight) || 0,
      tripId: trip?.id || '',
      paymentMethod,
      paidBy,
    };

    if (length || width || heightDim) {
      data.dimensions = {
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(heightDim) || 0,
      };
    }

    // Usamos o validador do domínio para regras de negócio
    const {isValid} = ShipmentValidator.validate(data);

    if (!isValid) {
      // Mapeamos para os modais específicos da UI para manter UX consistente
      if (!data.recipientName || data.recipientName.length < SHIPMENT_VALIDATION_RULES.RECIPIENT_NAME_MIN_LENGTH) {
        setShowRecipientNameErrorModal(true);
        return false;
      }

      if (!ShipmentValidator.isValidPhone(data.recipientPhone)) {
        setShowPhoneErrorModal(true);
        return false;
      }

      if (!data.recipientAddress || data.recipientAddress.length < SHIPMENT_VALIDATION_RULES.RECIPIENT_ADDRESS_MIN_LENGTH) {
        setShowAddressErrorModal(true);
        return false;
      }

      if (!data.description || data.description.length < SHIPMENT_VALIDATION_RULES.DESCRIPTION_MIN_LENGTH) {
        setShowDescriptionErrorModal(true);
        return false;
      }

      if (data.weight < SHIPMENT_VALIDATION_RULES.MIN_WEIGHT || data.weight > SHIPMENT_VALIDATION_RULES.MAX_WEIGHT) {
        setShowWeightErrorModal(true);
        return false;
      }

      if (data.dimensions) {
        const {length: l, width: w, height: h} = data.dimensions;
        if (!length || !width || !heightDim) {
          setShowDimensionsIncompleteModal(true);
          return false;
        }
        if (l > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION || 
            w > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION || 
            h > SHIPMENT_VALIDATION_RULES.MAX_DIMENSION) {
          setShowDimensionsMaxModal(true);
          return false;
        }
      }
    }

    return true;
  }

  // Pure check sem side effects (para não causar re-render loop)
  function isFormValid(): boolean {
    const weightNum = parseFloat(weight) || 0;
    const data: CreateShipmentData = {
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.replace(/\D/g, ''),
      recipientAddress: recipientAddress.trim(),
      description: description.trim(),
      weight: weightNum,
      tripId: trip?.id || '',
      paymentMethod,
      paidBy,
    };

    if (length && width && heightDim) {
      data.dimensions = {
        length: parseFloat(length) || 0,
        width: parseFloat(width) || 0,
        height: parseFloat(heightDim) || 0,
      };
    }

    return ShipmentValidator.validate(data).isValid;
  }

  const totalPrice = priceData?.finalPrice || 0;
  const hasWeight = !!(weight && parseFloat(weight) > 0);

  // PIX requer preço calculado para processar pagamento (frete a cobrar usa CASH)
  const isPIX = paymentMethod === PaymentMethod.PIX;
  const isRecipientPays = paidBy === 'recipient';
  const canSubmit =
    acceptsShipments &&
    isFormValid() &&
    !isCreatingShipment &&
    (isRecipientPays || !isPIX || totalPrice > 0);

  function getButtonTitle(): string {
    if (!acceptsShipments) return 'Viagem sem envio de encomenda';
    if (isCreatingShipment) return 'Criando encomenda...';
    if (isCalculatingPrice) return 'Calculando preço...';
    if (!hasWeight) return 'Informe o peso para calcular';
    if (totalPrice > 0) return `Pagar ${formatBRL(totalPrice)}`;
    if (!isPIX) return 'Enviar Encomenda';
    return 'Aguardando cálculo do preço...';
  }

  async function handleCreateShipment() {
    if (!trip) return;
    if (!acceptsShipments) {
      setCreateErrorMessage('Esta viagem nao aceita encomendas.');
      setShowCreateErrorModal(true);
      return;
    }
    if (!validateForm()) return;

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
      paidBy,
      couponCode,
    };

    try {
      const shipment = await createShipment(data, photos);

      toast.showSuccess(
        `Encomenda criada! Código de rastreamento: ${shipment.trackingCode}`,
      );

      logShipmentCreated();
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

  async function handleCepChange(text: string) {
    const digits = text.replace(/\D/g, '');
    setRecipientCep(text);
    if (digits.length === 8) {
      const result = await lookupCep(digits);
      if (result) {
        const addr = [result.logradouro, result.bairro, result.cidade].filter(Boolean).join(", ");
        setRecipientAddress(addr);
      }
    }
  }

  return {
    // Data
    trip,
    cargoPricePerKg,
    acceptsShipments,
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
    paidBy,
    handleSetPaidBy,
    isRecipientPays,
    // Coupon
    couponValidation,
    handleApplyCoupon,
    handleRemoveCoupon,
    // Handlers
    handleCreateShipment,
    handleGoBack,
    recipientCep,
    handleCepChange,
    isCepLoading,
    cepResult,
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
