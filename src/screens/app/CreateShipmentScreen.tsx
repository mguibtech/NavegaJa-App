import React, {useEffect, useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  Box,
  Button,
  Icon,
  Text,
  TextInput,
  TouchableOpacityBox,
  CouponInputV2,
  PhotoPicker,
  ShipmentPriceBreakdown,
  InfoModal,
} from '@components';
import {
  Trip,
  tripAPI,
  PaymentMethod,
  useCreateShipment,
  useCalculateShipmentPrice,
  CreateShipmentData,
  useCouponValidation,
} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

// Validação de telefone (formato WhatsApp)
function formatPhoneNumber(value: string): string {
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

function isPhoneComplete(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
}

type Props = NativeStackScreenProps<AppStackParamList, 'CreateShipment'>;

export function CreateShipmentScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {top} = useSafeAreaInsets();
  const {create: createShipment, isLoading: isCreatingShipment} = useCreateShipment();
  const {calculate, priceData, isLoading: isCalculatingPrice} = useCalculateShipmentPrice();
  const couponValidation = useCouponValidation();
  const toast = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  // Modal states
  const [showLoadTripErrorModal, setShowLoadTripErrorModal] = useState(false);
  const [showRecipientNameErrorModal, setShowRecipientNameErrorModal] = useState(false);
  const [showPhoneErrorModal, setShowPhoneErrorModal] = useState(false);
  const [showAddressErrorModal, setShowAddressErrorModal] = useState(false);
  const [showDescriptionErrorModal, setShowDescriptionErrorModal] = useState(false);
  const [showWeightErrorModal, setShowWeightErrorModal] = useState(false);
  const [showDimensionsIncompleteModal, setShowDimensionsIncompleteModal] = useState(false);
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
  const [photos, setPhotos] = useState<Array<{uri: string; type: string; name: string}>>([]);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.PIX);

  // Load trip data
  useEffect(() => {
    loadTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

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

  async function loadTrip() {
    setIsLoadingTrip(true);
    try {
      const tripData = await tripAPI.getById(tripId);
      setTrip(tripData);
    } catch (error) {
      setShowLoadTripErrorModal(true);
      console.error('Failed to load trip:', error);
    } finally {
      setIsLoadingTrip(false);
    }
  }

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

      toast.showSuccess(`Encomenda criada! Código de rastreamento: ${shipment.trackingCode}`);

      // Navegar para detalhes da encomenda
      navigation.replace('ShipmentDetails', {shipmentId: shipment.id});
    } catch (error: any) {
      setCreateErrorMessage(error?.message || 'Não foi possível criar a encomenda. Tente novamente.');
      setShowCreateErrorModal(true);
    }
  }

  if (isLoadingTrip) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center"
        style={{paddingTop: top}}>
        <ActivityIndicator size="large" color="#0B5D8A" />
        <Text preset="paragraphMedium" color="textSecondary" mt="s12">
          Carregando viagem...
        </Text>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center"
        padding="s24" style={{paddingTop: top}}>
        <Icon name="error-outline" size={48} color="danger" />
        <Text preset="paragraphMedium" color="danger" mt="s12" textAlign="center">
          Viagem não encontrada
        </Text>
        <Box mt="s16" width="100%">
          <Button title="Voltar" preset="outline" onPress={() => navigation.goBack()} />
        </Box>
      </Box>
    );
  }

  const totalPrice = priceData?.finalPrice || 0;
  const hasWeight = !!(weight && parseFloat(weight) > 0);

  // Pure check sem side effects (para não causar re-render loop)
  function isFormValid(): boolean {
    if (!recipientName.trim() || recipientName.trim().length < 3) return false;
    if (!isPhoneComplete(recipientPhone)) return false;
    if (!recipientAddress.trim() || recipientAddress.trim().length < 10) return false;
    if (!description.trim() || description.trim().length < 5) return false;
    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum < 0.1 || weightNum > 50) return false;
    if (length || width || heightDim) {
      const l = parseFloat(length);
      const w = parseFloat(width);
      const h = parseFloat(heightDim);
      if (!length || !width || !heightDim || isNaN(l) || isNaN(w) || isNaN(h)) return false;
      if (l > 200 || w > 200 || h > 200) return false;
    }
    return true;
  }

  // PIX needs a calculated price; CASH is paid on delivery so no price required
  const isPIX = paymentMethod === PaymentMethod.PIX;
  const canSubmit =
    isFormValid() &&
    !isCreatingShipment &&
    (!isPIX || totalPrice > 0);

  function getButtonTitle(): string {
    if (isCreatingShipment) return 'Criando encomenda...';
    if (isCalculatingPrice) return 'Calculando preço...';
    if (!hasWeight) return 'Informe o peso para calcular';
    if (totalPrice > 0) return `Pagar R$ ${totalPrice.toFixed(2)}`;
    if (!isPIX) return 'Enviar Encomenda';
    return 'Aguardando cálculo do preço...';
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Box flex={1} backgroundColor="background">

        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s20"
          style={{
            paddingTop: top + 12,
            paddingBottom: 16,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor="background"
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.goBack()}
              marginRight="s12">
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>

            <Box flex={1}>
              <Text preset="headingSmall" color="text" bold>
                Nova Encomenda
              </Text>
              <Box flexDirection="row" alignItems="center" mt="s4">
                <Icon name="place" size={14} color="primary" />
                <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                  {trip.origin} → {trip.destination}
                </Text>
              </Box>
            </Box>

            {/* Cargo status chip no header */}
            <Box
              backgroundColor={Number(trip.cargoPriceKg) > 0 ? 'successBg' : 'dangerBg'}
              paddingHorizontal="s10"
              paddingVertical="s6"
              borderRadius="s8"
              flexDirection="row"
              alignItems="center">
              <Icon
                name={Number(trip.cargoPriceKg) > 0 ? 'inventory' : 'block'}
                size={14}
                color={Number(trip.cargoPriceKg) > 0 ? 'success' : 'danger'}
              />
              <Text
                preset="paragraphCaptionSmall"
                color={Number(trip.cargoPriceKg) > 0 ? 'success' : 'danger'}
                bold
                ml="s4">
                {Number(trip.cargoPriceKg) > 0 ? 'Aceita carga' : 'Sem carga'}
              </Text>
            </Box>
          </Box>
        </Box>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{padding: 20, paddingBottom: 32}}>

          {/* Card: Info de carga da viagem */}
          {(() => {
            const cargoPrice = Number(trip.cargoPriceKg);
            const acceptsCargo = cargoPrice > 0;
            return (
              <Box
                backgroundColor={acceptsCargo ? 'successBg' : 'dangerBg'}
                borderRadius="s16"
                padding="s16"
                mb="s16"
                style={{
                  borderWidth: 1,
                  borderColor: acceptsCargo ? '#16A34A33' : '#DC262633',
                }}>
                {/* Status */}
                <Box flexDirection="row" alignItems="center" mb={acceptsCargo ? 's12' : 's0'}>
                  <Icon
                    name={acceptsCargo ? 'check-circle' : 'cancel'}
                    size={20}
                    color={acceptsCargo ? 'success' : 'danger'}
                  />
                  <Text
                    preset="paragraphMedium"
                    color={acceptsCargo ? 'success' : 'danger'}
                    bold
                    ml="s8">
                    {acceptsCargo
                      ? 'Esta viagem aceita encomendas'
                      : 'Esta viagem não aceita encomendas'}
                  </Text>
                </Box>

                {/* Limites — só mostra se aceita */}
                {acceptsCargo && (
                  <Box flexDirection="row" flexWrap="wrap" gap="s8">
                    <Box
                      backgroundColor="surface"
                      borderRadius="s8"
                      paddingHorizontal="s10"
                      paddingVertical="s6"
                      flexDirection="row"
                      alignItems="center">
                      <Icon name="payments" size={14} color="success" />
                      <Text preset="paragraphCaptionSmall" color="success" bold ml="s4">
                        {'R$ '}{cargoPrice.toFixed(2)}{' / kg'}
                      </Text>
                    </Box>
                    <Box
                      backgroundColor="surface"
                      borderRadius="s8"
                      paddingHorizontal="s10"
                      paddingVertical="s6"
                      flexDirection="row"
                      alignItems="center">
                      <Icon name="scale" size={14} color="textSecondary" />
                      <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                        {'Peso máx: '}
                        <Text preset="paragraphCaptionSmall" color="text" bold>
                          50 kg
                        </Text>
                      </Text>
                    </Box>
                    <Box
                      backgroundColor="surface"
                      borderRadius="s8"
                      paddingHorizontal="s10"
                      paddingVertical="s6"
                      flexDirection="row"
                      alignItems="center">
                      <Icon name="straighten" size={14} color="textSecondary" />
                      <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                        {'Dims. máx: '}
                        <Text preset="paragraphCaptionSmall" color="text" bold>
                          200 cm
                        </Text>
                        {' por lado'}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })()}

          {/* Card: Destinatário */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={36}
                height={36}
                borderRadius="s8"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="person" size={20} color="primary" />
              </Box>
              <Text preset="paragraphMedium" color="text" bold>
                Dados do Destinatário
              </Text>
            </Box>

            <Box mb="s12">
              <TextInput
                label="Nome completo"
                placeholder="Ex: João da Silva"
                value={recipientName}
                onChangeText={setRecipientName}
                leftIcon="person"
              />
            </Box>

            <Box mb="s12">
              <TextInput
                label="Telefone (WhatsApp)"
                placeholder="(XX) XXXXX-XXXX"
                value={recipientPhone}
                onChangeText={text => setRecipientPhone(formatPhoneNumber(text))}
                leftIcon="phone"
                keyboardType="phone-pad"
              />
            </Box>

            <TextInput
              label="Endereço no destino"
              placeholder="Rua, número, bairro"
              value={recipientAddress}
              onChangeText={setRecipientAddress}
              leftIcon="location-on"
              multiline
              numberOfLines={3}
            />
          </Box>

          {/* Card: Encomenda */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={36}
                height={36}
                borderRadius="s8"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="inventory" size={20} color="secondary" />
              </Box>
              <Text preset="paragraphMedium" color="text" bold>
                Dados da Encomenda
              </Text>
            </Box>

            <Box mb="s12">
              <TextInput
                label="O que vai na encomenda? *"
                placeholder="Ex: Documentos, roupas, eletrônicos..."
                value={description}
                onChangeText={setDescription}
                leftIcon="inventory"
                multiline
                numberOfLines={2}
              />
            </Box>

            <Box mb="s16">
              <TextInput
                label="Peso (kg) *"
                placeholder="Ex: 2.5"
                value={weight}
                onChangeText={setWeight}
                leftIcon="scale"
                keyboardType="decimal-pad"
              />
            </Box>

            {/* Dimensões */}
            <Box
              backgroundColor="background"
              borderRadius="s12"
              padding="s12">
              <Box flexDirection="row" alignItems="center" mb="s12">
                <Icon name="straighten" size={16} color="textSecondary" />
                <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
                  Dimensões (opcional — máx. 200cm por lado)
                </Text>
              </Box>
              <Box flexDirection="row" gap="s8">
                <Box flex={1}>
                  <TextInput
                    label="Comp."
                    placeholder="cm"
                    value={length}
                    onChangeText={setLength}
                    keyboardType="decimal-pad"
                  />
                </Box>
                <Box flex={1}>
                  <TextInput
                    label="Larg."
                    placeholder="cm"
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="decimal-pad"
                  />
                </Box>
                <Box flex={1}>
                  <TextInput
                    label="Alt."
                    placeholder="cm"
                    value={heightDim}
                    onChangeText={setHeightDim}
                    keyboardType="decimal-pad"
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Card: Fotos */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={36}
                height={36}
                borderRadius="s8"
                backgroundColor="accentBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="photo-camera" size={20} color="accent" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold>
                  Fotos
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  Opcional — até 5 fotos
                </Text>
              </Box>
            </Box>
            <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
          </Box>

          {/* Card: Cupom */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <CouponInputV2
              state={couponValidation.state}
              onApply={handleApplyCoupon}
              onRemove={handleRemoveCoupon}
              onRetry={couponValidation.retry}
            />
          </Box>

          {/* Card: Pagamento */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={36}
                height={36}
                borderRadius="s8"
                backgroundColor="warningBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s12">
                <Icon name="payments" size={20} color="warning" />
              </Box>
              <Text preset="paragraphMedium" color="text" bold>
                Forma de Pagamento
              </Text>
            </Box>

            <TouchableOpacityBox
              flexDirection="row"
              alignItems="center"
              padding="s16"
              backgroundColor={paymentMethod === PaymentMethod.PIX ? 'primaryBg' : 'background'}
              borderRadius="s12"
              borderWidth={paymentMethod === PaymentMethod.PIX ? 2 : 1}
              borderColor={paymentMethod === PaymentMethod.PIX ? 'primary' : 'border'}
              onPress={() => setPaymentMethod(PaymentMethod.PIX)}
              mb="s8">
              <Icon
                name="qr-code"
                size={24}
                color={paymentMethod === PaymentMethod.PIX ? 'primary' : 'textSecondary'}
              />
              <Box flex={1} ml="s12">
                <Text
                  preset="paragraphMedium"
                  color={paymentMethod === PaymentMethod.PIX ? 'primary' : 'text'}
                  bold>
                  PIX
                </Text>
                <Text
                  preset="paragraphSmall"
                  color={paymentMethod === PaymentMethod.PIX ? 'primary' : 'textSecondary'}>
                  Pagamento instantâneo
                </Text>
              </Box>
              {paymentMethod === PaymentMethod.PIX && (
                <Icon name="check-circle" size={24} color="primary" />
              )}
            </TouchableOpacityBox>

            <TouchableOpacityBox
              flexDirection="row"
              alignItems="center"
              padding="s16"
              backgroundColor={paymentMethod === PaymentMethod.CASH ? 'primaryBg' : 'background'}
              borderRadius="s12"
              borderWidth={paymentMethod === PaymentMethod.CASH ? 2 : 1}
              borderColor={paymentMethod === PaymentMethod.CASH ? 'primary' : 'border'}
              onPress={() => setPaymentMethod(PaymentMethod.CASH)}>
              <Icon
                name="payments"
                size={24}
                color={paymentMethod === PaymentMethod.CASH ? 'primary' : 'textSecondary'}
              />
              <Box flex={1} ml="s12">
                <Text
                  preset="paragraphMedium"
                  color={paymentMethod === PaymentMethod.CASH ? 'primary' : 'text'}
                  bold>
                  Dinheiro
                </Text>
                <Text
                  preset="paragraphSmall"
                  color={paymentMethod === PaymentMethod.CASH ? 'primary' : 'textSecondary'}>
                  Pagar ao entregar
                </Text>
              </Box>
              {paymentMethod === PaymentMethod.CASH && (
                <Icon name="check-circle" size={24} color="primary" />
              )}
            </TouchableOpacityBox>
          </Box>

          {/* Price Breakdown */}
          {priceData && (
            <Box mb="s8">
              <ShipmentPriceBreakdown data={priceData} />
            </Box>
          )}
        </ScrollView>

        {/* Footer fixo */}
        <Box
          backgroundColor="surface"
          borderTopWidth={1}
          borderTopColor="border"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 8,
          }}>
          {/* Price error banner */}
          {hasWeight && priceErrorMessage ? (
            <Box
              flexDirection="row"
              alignItems="center"
              paddingHorizontal="s20"
              paddingTop="s12"
              paddingBottom="s4">
              <Icon name="info-outline" size={16} color="warning" />
              <Text preset="paragraphCaptionSmall" color="warning" ml="s8" flex={1}>
                {priceErrorMessage}
              </Text>
            </Box>
          ) : null}

          {/* Price summary row */}
          {hasWeight && !priceErrorMessage && (
            <Box
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal="s20"
              paddingTop="s12"
              paddingBottom="s4">
              <Text preset="paragraphSmall" color="textSecondary">
                Total a pagar
              </Text>
              {isCalculatingPrice ? (
                <Box flexDirection="row" alignItems="center">
                  <ActivityIndicator size="small" color="#0B5D8A" />
                  <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                    Calculando...
                  </Text>
                </Box>
              ) : (
                <Text preset="headingSmall" color="primary" bold>
                  {totalPrice > 0 ? `R$ ${totalPrice.toFixed(2)}` : '—'}
                </Text>
              )}
            </Box>
          )}
          <Box padding="s20" paddingTop={hasWeight ? 's8' : 's20'}>
            <Button
              title={getButtonTitle()}
              onPress={handleCreateShipment}
              disabled={isCreatingShipment || isCalculatingPrice}
              loading={isCreatingShipment}
              rightIcon={canSubmit ? 'local-shipping' : undefined}
            />
          </Box>
        </Box>
      </Box>

      {/* Load Trip Error Modal */}
      <InfoModal
        visible={showLoadTripErrorModal}
        title="Erro"
        message="Não foi possível carregar os dados da viagem"
        icon="error-outline"
        iconColor="danger"
        buttonText="Voltar"
        onClose={() => {
          setShowLoadTripErrorModal(false);
          navigation.goBack();
        }}
      />

      {/* Recipient Name Error Modal */}
      <InfoModal
        visible={showRecipientNameErrorModal}
        title="Atenção"
        message="Digite o nome completo do destinatário (mínimo 3 caracteres)"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowRecipientNameErrorModal(false)}
      />

      {/* Phone Error Modal */}
      <InfoModal
        visible={showPhoneErrorModal}
        title="Atenção"
        message="Digite um telefone válido com DDD"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowPhoneErrorModal(false)}
      />

      {/* Address Error Modal */}
      <InfoModal
        visible={showAddressErrorModal}
        title="Atenção"
        message="Digite o endereço completo do destinatário"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowAddressErrorModal(false)}
      />

      {/* Description Error Modal */}
      <InfoModal
        visible={showDescriptionErrorModal}
        title="Atenção"
        message="Descreva o conteúdo da encomenda (mínimo 5 caracteres)"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowDescriptionErrorModal(false)}
      />

      {/* Weight Error Modal */}
      <InfoModal
        visible={showWeightErrorModal}
        title="Atenção"
        message="Peso deve estar entre 0.1kg e 50kg"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowWeightErrorModal(false)}
      />

      {/* Dimensions Incomplete Modal */}
      <InfoModal
        visible={showDimensionsIncompleteModal}
        title="Atenção"
        message="Se informar dimensões, preencha todas (comprimento, largura, altura)"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowDimensionsIncompleteModal(false)}
      />

      {/* Dimensions Max Modal */}
      <InfoModal
        visible={showDimensionsMaxModal}
        title="Atenção"
        message="Dimensões máximas: 200cm"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowDimensionsMaxModal(false)}
      />

      {/* Create Shipment Error Modal */}
      <InfoModal
        visible={showCreateErrorModal}
        title="Erro"
        message={createErrorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowCreateErrorModal(false);
          setCreateErrorMessage('');
        }}
      />
    </KeyboardAvoidingView>
  );
}
