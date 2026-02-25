import {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useAddCard, CardType} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export function useAddCardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();
  const {addCard, isLoading} = useAddCard();

  const [cardNumber, setCardNumberState] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState<CardType>('credit_card');
  const [makeDefault, setMakeDefault] = useState(false);

  function setCardNumber(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setCardNumberState(formatted);
  }

  function validate(): string | null {
    const digits = cardNumber.replace(/\s/g, '');
    if (digits.length < 13 || digits.length > 19) {
      return 'Número do cartão inválido';
    }
    if (!holderName.trim()) {
      return 'Informe o nome do titular';
    }
    const month = parseInt(expiryMonth, 10);
    if (!expiryMonth || isNaN(month) || month < 1 || month > 12) {
      return 'Mês de validade inválido (1-12)';
    }
    const year = parseInt(expiryYear, 10);
    if (!expiryYear || isNaN(year) || expiryYear.length !== 4 || year < new Date().getFullYear()) {
      return 'Ano de validade inválido';
    }
    if (cvv.length < 3 || cvv.length > 4) {
      return 'CVV inválido (3-4 dígitos)';
    }
    return null;
  }

  async function handleSubmit() {
    const errorMsg = validate();
    if (errorMsg) {
      toast.showError(errorMsg);
      return;
    }

    try {
      await addCard({
        cardNumber: cardNumber.replace(/\s/g, ''),
        holderName: holderName.trim(),
        expiryMonth: parseInt(expiryMonth, 10),
        expiryYear: parseInt(expiryYear, 10),
        cvv,
        type: cardType,
        setAsDefault: makeDefault,
      });

      // Limpar dados sensíveis imediatamente após envio
      setCvv('');
      setCardNumberState('');

      toast.showSuccess('Cartão adicionado com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      // Limpar dados sensíveis mesmo em caso de erro
      setCvv('');
      toast.showError(err?.message || 'Não foi possível adicionar o cartão');
    }
  }

  return {
    navigation,
    cardNumber,
    setCardNumber,
    holderName,
    setHolderName,
    expiryMonth,
    setExpiryMonth,
    expiryYear,
    setExpiryYear,
    cvv,
    setCvv,
    cardType,
    setCardType,
    makeDefault,
    setMakeDefault,
    isLoading,
    handleSubmit,
  };
}
