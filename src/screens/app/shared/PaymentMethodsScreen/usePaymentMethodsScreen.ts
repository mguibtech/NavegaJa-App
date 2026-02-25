import {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useMyCards, useSetDefaultCard, useRemoveCard, CardBrand} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export function usePaymentMethodsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();

  const {cards, isLoading} = useMyCards();
  const {setDefault, isLoading: isSettingDefault} = useSetDefaultCard();
  const {removeCard, isLoading: isRemoving} = useRemoveCard();

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  function getCardIcon(_brand: CardBrand): string {
    return 'credit-card';
  }

  function getCardColor(brand: CardBrand): 'primary' | 'secondary' | 'info' {
    switch (brand) {
      case 'visa':
        return 'primary';
      case 'mastercard':
        return 'secondary';
      default:
        return 'info';
    }
  }

  async function handleSetDefault(cardId: string) {
    try {
      await setDefault(cardId);
      toast.showSuccess('Cartão definido como padrão');
    } catch (err: any) {
      toast.showError(err?.message || 'Não foi possível definir o cartão padrão');
    }
  }

  function handleRemoveCard(cardId: string) {
    setSelectedCardId(cardId);
    setShowRemoveModal(true);
  }

  async function confirmRemoveCard() {
    if (!selectedCardId) {return;}
    try {
      await removeCard(selectedCardId);
      setShowRemoveModal(false);
      setSelectedCardId(null);
      toast.showSuccess('Cartão removido com sucesso');
    } catch (err: any) {
      setShowRemoveModal(false);
      toast.showError(err?.message || 'Não foi possível remover o cartão');
    }
  }

  function handleAddCard() {
    navigation.navigate('AddCard');
  }

  return {
    navigation,
    cards,
    isLoading,
    isRemoving,
    isSettingDefault,
    showRemoveModal,
    setShowRemoveModal,
    getCardIcon,
    getCardColor,
    handleSetDefault,
    handleRemoveCard,
    confirmRemoveCard,
    handleAddCard,
  };
}
