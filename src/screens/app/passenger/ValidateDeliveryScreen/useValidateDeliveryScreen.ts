import {useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useValidateDelivery} from '@domain';
import {AppStackParamList} from '@routes';

export function useValidateDeliveryScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ValidateDelivery'>>();
  const trackingCodeParam = route.params?.trackingCode || '';
  const pinParam = route.params?.pin || '';

  const [trackingCode, setTrackingCode] = useState(trackingCodeParam);
  const [pin, setPin] = useState(pinParam);

  const [showTrackingCodeErrorModal, setShowTrackingCodeErrorModal] =
    useState(false);
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
        error?.message ||
          'Não foi possível validar a entrega. Verifique o código de rastreamento e o PIN.',
      );
      setShowErrorModal(true);
    }
  }

  function handleSuccessModalClose() {
    setShowSuccessModal(false);
    navigation.navigate('Shipments');
  }

  function handleNavigateToShipments() {
    navigation.navigate('Shipments');
  }

  function handlePinChange(text: string) {
    // Apenas números
    const numbersOnly = text.replace(/[^0-9]/g, '');
    setPin(numbersOnly);
  }

  return {
    // Params (for editable logic)
    trackingCodeParam,
    pinParam,
    // Form fields
    trackingCode,
    setTrackingCode,
    pin,
    handlePinChange,
    // State
    isLoading,
    // Handlers
    handleValidate,
    handleNavigateToShipments,
    // Modal states
    showTrackingCodeErrorModal,
    setShowTrackingCodeErrorModal,
    showPinErrorModal,
    setShowPinErrorModal,
    showPinLengthErrorModal,
    setShowPinLengthErrorModal,
    showSuccessModal,
    successMessage,
    handleSuccessModalClose,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
  };
}
