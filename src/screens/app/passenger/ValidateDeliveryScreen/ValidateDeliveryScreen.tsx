import React, {useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, InfoModal, Text, TextInput} from '@components';
import {useValidateDelivery} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'ValidateDelivery'>;

export function ValidateDeliveryScreen({navigation, route}: Props) {
  const trackingCodeParam = route.params?.trackingCode || '';
  const pinParam = route.params?.pin || '';

  const [trackingCode, setTrackingCode] = useState(trackingCodeParam);
  const [pin, setPin] = useState(pinParam);

  const [showTrackingCodeErrorModal, setShowTrackingCodeErrorModal] = useState(false);
  const [showPinErrorModal, setShowPinErrorModal] = useState(false);
  const [showPinLengthErrorModal, setShowPinLengthErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {validate, isLoading} = useValidateDelivery();

  async function handleValidate() {
    // Validações
    if (!trackingCode.trim()) {
      setShowTrackingCodeErrorModal(true);
      return;
    }

    if (!pin.trim()) {
      setShowPinErrorModal(true);
      return;
    }

    if (pin.length !== 6) {
      setShowPinLengthErrorModal(true);
      return;
    }

    try {
      const result = await validate(trackingCode.trim(), pin.trim());

      // Mostrar sucesso com NavegaCoins
      const message = result.navegaCoinsEarned
        ? `${result.message}\n\nO remetente ganhou ${result.navegaCoinsEarned} NavegaCoins!`
        : result.message;

      setSuccessMessage(message);
      setShowSuccessModal(true);
    } catch (error: any) {
      setErrorMessage(
        error?.message || 'Não foi possível validar a entrega. Verifique o código de rastreamento e o PIN.',
      );
      setShowErrorModal(true);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Box flex={1} backgroundColor="background">
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box padding="s20">
            {/* Header */}
            <Box alignItems="center" mb="s32" mt="s20">
              <Box
                width={80}
                height={80}
                borderRadius="s24"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s16">
                <Text preset="headingLarge" color="primary">
                  📦
                </Text>
              </Box>
              <Text preset="headingMedium" color="text" bold textAlign="center" mb="s8">
                Validar Entrega
              </Text>
              <Text preset="paragraphMedium" color="textSecondary" textAlign="center">
                Confirme o recebimento da sua encomenda
              </Text>
            </Box>

            {/* Instruções */}
            <Box
              backgroundColor="infoBg"
              borderRadius="s12"
              padding="s16"
              mb="s24"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: '#007BFF',
              }}>
              <Text preset="paragraphSmall" color="info" bold mb="s8">
                Como validar a entrega:
              </Text>
              <Text preset="paragraphSmall" color="info" mb="s4">
                1. Informe o código de rastreamento da encomenda
              </Text>
              <Text preset="paragraphSmall" color="info" mb="s4">
                2. Digite o PIN de 6 dígitos fornecido pelo capitão
              </Text>
              <Text preset="paragraphSmall" color="info">
                3. Confirme o recebimento
              </Text>
            </Box>

            {/* Formulário */}
            <Box gap="s16" mb="s24">
              {/* Código de Rastreamento */}
              <Box>
                <Text preset="paragraphMedium" color="text" bold mb="s8">
                  Código de Rastreamento
                </Text>
                <TextInput
                  placeholder="Ex: NJ2024000123"
                  value={trackingCode}
                  onChangeText={setTrackingCode}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!trackingCodeParam} // Se vier de deep link, não permite editar
                />
              </Box>

              {/* PIN de Validação */}
              <Box>
                <Text preset="paragraphMedium" color="text" bold mb="s8">
                  PIN de Validação (6 dígitos)
                </Text>
                <TextInput
                  placeholder="000000"
                  value={pin}
                  onChangeText={text => {
                    // Apenas números
                    const numbersOnly = text.replace(/[^0-9]/g, '');
                    setPin(numbersOnly);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!pinParam} // Se vier de deep link, não permite editar
                  style={{
                    fontSize: 24,
                    letterSpacing: 8,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                />
                <Text preset="paragraphSmall" color="textSecondary" mt="s8">
                  Digite o código fornecido pelo capitão
                </Text>
              </Box>
            </Box>

            {/* Botão Validar */}
            <Button
              title="Confirmar Recebimento"
              preset="primary"
              leftIcon="check-circle"
              onPress={handleValidate}
              loading={isLoading}
              disabled={!trackingCode.trim() || pin.length !== 6}
            />

            {/* Informação adicional */}
            <Box
              backgroundColor="warningBg"
              borderRadius="s12"
              padding="s16"
              mt="s24"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: '#FFC107',
              }}>
              <Text preset="paragraphSmall" color="warning" bold mb="s4">
                ⚠️ Atenção
              </Text>
              <Text preset="paragraphSmall" color="warning">
                Confirme o recebimento apenas após verificar que a encomenda está em perfeitas
                condições.
              </Text>
            </Box>

            {/* Link para rastreamento */}
            <Box alignItems="center" mt="s32">
              <Text preset="paragraphSmall" color="textSecondary" textAlign="center" mb="s12">
                Ainda não recebeu sua encomenda?
              </Text>
              <Button
                title="Rastrear Encomenda"
                preset="outline"
                leftIcon="search"
                onPress={() => navigation.navigate('Shipments')}
              />
            </Box>
          </Box>
        </ScrollView>
      </Box>

      <InfoModal
        visible={showTrackingCodeErrorModal}
        title="Atenção"
        message="Por favor, informe o código de rastreamento"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowTrackingCodeErrorModal(false)}
      />

      <InfoModal
        visible={showPinErrorModal}
        title="Atenção"
        message="Por favor, informe o PIN de validação"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowPinErrorModal(false)}
      />

      <InfoModal
        visible={showPinLengthErrorModal}
        title="Atenção"
        message="O PIN deve ter 6 dígitos"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowPinLengthErrorModal(false)}
      />

      <InfoModal
        visible={showSuccessModal}
        title="Entrega Confirmada!"
        message={successMessage}
        icon="check-circle"
        iconColor="success"
        buttonText="OK"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('Shipments');
        }}
      />

      <InfoModal
        visible={showErrorModal}
        title="Erro na Validação"
        message={errorMessage}
        icon="error"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => setShowErrorModal(false)}
      />
    </KeyboardAvoidingView>
  );
}
