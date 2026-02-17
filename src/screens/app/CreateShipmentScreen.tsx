import React, {useEffect, useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform} from 'react-native';

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
      calculatePrice();
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

    try {
      await calculate(trip.id, weightNum, dimensions, couponCode);
    } catch (error) {
      console.error('Failed to calculate price:', error);
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
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background">
        <Text preset="paragraphMedium" color="text">
          Carregando...
        </Text>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" backgroundColor="background">
        <Text preset="paragraphMedium" color="danger">
          Viagem não encontrada
        </Text>
      </Box>
    );
  }

  const totalPrice = priceData?.finalPrice || 0;

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

  const canSubmit = isFormValid() && totalPrice > 0 && !isCreatingShipment;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <Box flex={1} backgroundColor="background">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box padding="s20">
            {/* Header */}
            <Text preset="headingMedium" color="text" bold mb="s8">
              Nova Encomenda
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" mb="s24">
              Envie sua encomenda de {trip.origin} para {trip.destination}
            </Text>

            {/* Dados do Destinatário */}
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Dados do Destinatário
              </Text>

              <Box mb="s16">
                <TextInput
                  label="Nome completo"
                  placeholder="Ex: João da Silva"
                  value={recipientName}
                  onChangeText={setRecipientName}
                  leftIcon="person"
                />
              </Box>

              <Box mb="s16">
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
                label="Endereço completo no destino"
                placeholder="Rua, número, bairro"
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                leftIcon="location-on"
                multiline
                numberOfLines={3}
              />
            </Box>

            {/* Dados da Encomenda */}
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Dados da Encomenda
              </Text>

              <Box mb="s16">
                <TextInput
                  label="Descrição do conteúdo"
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

              {/* Dimensões (opcional) */}
              <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                Dimensões (opcional - em cm)
              </Text>

              <Box flexDirection="row" gap="s12" mb="s16">
                <Box flex={1}>
                  <TextInput
                    label="Comprimento"
                    placeholder="cm"
                    value={length}
                    onChangeText={setLength}
                    keyboardType="decimal-pad"
                  />
                </Box>
                <Box flex={1}>
                  <TextInput
                    label="Largura"
                    placeholder="cm"
                    value={width}
                    onChangeText={setWidth}
                    keyboardType="decimal-pad"
                  />
                </Box>
                <Box flex={1}>
                  <TextInput
                    label="Altura"
                    placeholder="cm"
                    value={heightDim}
                    onChangeText={setHeightDim}
                    keyboardType="decimal-pad"
                  />
                </Box>
              </Box>
            </Box>

            {/* Fotos */}
            <Box mb="s24">
              <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
            </Box>

            {/* Cupom */}
            <Box mb="s24">
              <CouponInputV2
                state={couponValidation.state}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
                onRetry={couponValidation.retry}
              />
            </Box>

            {/* Método de Pagamento */}
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Forma de Pagamento
              </Text>

              <TouchableOpacityBox
                flexDirection="row"
                alignItems="center"
                padding="s16"
                backgroundColor={paymentMethod === PaymentMethod.PIX ? 'primaryBg' : 'surface'}
                borderRadius="s12"
                borderWidth={paymentMethod === PaymentMethod.PIX ? 2 : 1}
                borderColor={paymentMethod === PaymentMethod.PIX ? 'primary' : 'border'}
                onPress={() => setPaymentMethod(PaymentMethod.PIX)}
                mb="s12">
                <Icon
                  name="qr-code"
                  size={24}
                  color={paymentMethod === PaymentMethod.PIX ? 'primary' : 'text'}
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
                backgroundColor={paymentMethod === PaymentMethod.CASH ? 'primaryBg' : 'surface'}
                borderRadius="s12"
                borderWidth={paymentMethod === PaymentMethod.CASH ? 2 : 1}
                borderColor={paymentMethod === PaymentMethod.CASH ? 'primary' : 'border'}
                onPress={() => setPaymentMethod(PaymentMethod.CASH)}>
                <Icon
                  name="payments"
                  size={24}
                  color={paymentMethod === PaymentMethod.CASH ? 'primary' : 'text'}
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
              <Box mb="s24">
                <ShipmentPriceBreakdown data={priceData} />
              </Box>
            )}
          </Box>
        </ScrollView>

        {/* Footer fixo com botão */}
        <Box
          padding="s20"
          backgroundColor="surface"
          borderTopWidth={1}
          borderTopColor="border"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
          }}>
          <Button
            title={
              isCreatingShipment
                ? 'Criando encomenda...'
                : `Pagar R$ ${totalPrice.toFixed(2)}`
            }
            onPress={handleCreateShipment}
            disabled={!canSubmit || isCreatingShipment || isCalculatingPrice}
            loading={isCreatingShipment}
          />
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
