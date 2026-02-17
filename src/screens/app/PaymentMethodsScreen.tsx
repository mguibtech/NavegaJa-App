import React, {useState} from 'react';
import {ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Icon, Text, TouchableOpacityBox, InfoModal, ConfirmationModal} from '@components';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentMethods'>;

interface PaymentCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'elo';
  lastFour: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

// Mock data - em produção viria de API
const MOCK_CARDS: PaymentCard[] = [
  {
    id: '1',
    brand: 'visa',
    lastFour: '4532',
    holderName: 'João Silva',
    expiryMonth: '12',
    expiryYear: '25',
    isDefault: true,
  },
  {
    id: '2',
    brand: 'mastercard',
    lastFour: '8765',
    holderName: 'João Silva',
    expiryMonth: '06',
    expiryYear: '27',
    isDefault: false,
  },
];

export function PaymentMethodsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [cards, setCards] = useState<PaymentCard[]>(MOCK_CARDS);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const toast = useToast();

  function getCardIcon(brand: string) {
    switch (brand) {
      case 'visa':
        return 'credit-card';
      case 'mastercard':
        return 'credit-card';
      case 'elo':
        return 'credit-card';
      default:
        return 'credit-card';
    }
  }

  function getCardColor(brand: string): 'primary' | 'secondary' | 'info' {
    switch (brand) {
      case 'visa':
        return 'primary';
      case 'mastercard':
        return 'secondary';
      case 'elo':
        return 'info';
      default:
        return 'primary';
    }
  }

  function handleSetDefault(cardId: string) {
    setCards(prevCards =>
      prevCards.map(card => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    );
    toast.showSuccess('Cartão definido como padrão');
  }

  function handleRemoveCard(cardId: string) {
    setSelectedCardId(cardId);
    setShowRemoveModal(true);
  }

  function confirmRemoveCard() {
    if (!selectedCardId) return;

    const cardToRemove = cards.find(c => c.id === selectedCardId);
    if (cardToRemove?.isDefault && cards.length > 1) {
      // Se remover o padrão, define o próximo como padrão
      const remainingCards = cards.filter(c => c.id !== selectedCardId);
      remainingCards[0].isDefault = true;
      setCards(remainingCards);
    } else {
      setCards(cards.filter(c => c.id !== selectedCardId));
    }

    setShowRemoveModal(false);
    setSelectedCardId(null);
    toast.showSuccess('Cartão removido com sucesso');
  }

  function handleAddCard() {
    setShowComingSoonModal(true);
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          alignItems="center"
          justifyContent="center"
          onPress={() => navigation.goBack()}
          mr="s12">
          <Icon name="arrow-back" size={24} color="text" />
        </TouchableOpacityBox>
        <Text preset="headingSmall" color="text" bold>
          Formas de Pagamento
        </Text>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* PIX Section */}
        <Box mb="s24">
          <Text preset="paragraphMedium" color="text" bold mb="s16">
            Pagamento Instantâneo
          </Text>

          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Box flexDirection="row" alignItems="center">
              <Box
                width={56}
                height={56}
                borderRadius="s24"
                backgroundColor="successBg"
                alignItems="center"
                justifyContent="center"
                mr="s16">
                <Icon name="qr-code-2" size={32} color="success" />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphLarge" color="text" bold mb="s4">
                  PIX
                </Text>
                <Text preset="paragraphMedium" color="textSecondary">
                  Pagamento instantâneo e seguro
                </Text>
              </Box>

              <Box
                backgroundColor="successBg"
                paddingHorizontal="s12"
                paddingVertical="s6"
                borderRadius="s8">
                <Text preset="paragraphSmall" color="success" bold>
                  Ativo
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Cards Section */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s16">
          <Text preset="paragraphMedium" color="text" bold>
            Cartões Salvos
          </Text>
          <TouchableOpacityBox onPress={handleAddCard}>
            <Box flexDirection="row" alignItems="center">
              <Icon name="add-circle" size={20} color="primary" />
              <Text preset="paragraphMedium" color="primary" bold ml="s4">
                Adicionar
              </Text>
            </Box>
          </TouchableOpacityBox>
        </Box>

        {cards.length === 0 ? (
          <Box
            backgroundColor="surface"
            borderRadius="s12"
            padding="s24"
            alignItems="center"
            mb="s24"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Icon name="credit-card-off" size={48} color="border" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
              Nenhum cartão cadastrado
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4" textAlign="center">
              Adicione um cartão para pagamentos mais rápidos
            </Text>
          </Box>
        ) : (
          <Box mb="s24">
            {cards.map(card => (
              <Box
                key={card.id}
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                mb="s12"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 2,
                }}>
                <Box flexDirection="row" alignItems="center" mb="s12">
                  <Box
                    width={48}
                    height={48}
                    borderRadius="s24"
                    backgroundColor={`${getCardColor(card.brand)}Bg`}
                    alignItems="center"
                    justifyContent="center"
                    mr="s12">
                    <Icon name={getCardIcon(card.brand)} size={24} color={getCardColor(card.brand)} />
                  </Box>

                  <Box flex={1}>
                    <Box flexDirection="row" alignItems="center" mb="s4">
                      <Text preset="paragraphMedium" color="text" bold>
                        {card.brand.toUpperCase()} •••• {card.lastFour}
                      </Text>
                      {card.isDefault && (
                        <Box
                          backgroundColor="primaryBg"
                          paddingHorizontal="s8"
                          paddingVertical="s4"
                          borderRadius="s8"
                          ml="s8">
                          <Text preset="paragraphSmall" color="primary" bold>
                            Padrão
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <Text preset="paragraphSmall" color="textSecondary">
                      {card.holderName} • {card.expiryMonth}/{card.expiryYear}
                    </Text>
                  </Box>
                </Box>

                <Box flexDirection="row" gap="s8">
                  {!card.isDefault && (
                    <Box flex={1}>
                      <Button
                        title="Tornar Padrão"
                        preset="outline"
                        onPress={() => handleSetDefault(card.id)}
                      />
                    </Box>
                  )}
                  <Box flex={1}>
                    <Button
                      title="Remover"
                      preset="outline"
                      onPress={() => handleRemoveCard(card.id)}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* Info */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3',
          }}>
          <Box flexDirection="row" alignItems="flex-start">
            <Icon name="security" size={20} color="info" />
            <Box flex={1} ml="s8">
              <Text preset="paragraphMedium" color="info" bold mb="s4">
                Segurança Garantida
              </Text>
              <Text preset="paragraphSmall" color="info">
                Seus dados de pagamento são criptografados e protegidos. Nunca armazenamos
                informações completas do cartão.
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>

      {/* Remove Card Modal */}
      <ConfirmationModal
        visible={showRemoveModal}
        title="Remover Cartão"
        message="Tem certeza que deseja remover este cartão? Esta ação não pode ser desfeita."
        icon="delete"
        iconColor="danger"
        confirmText="Remover"
        cancelText="Cancelar"
        confirmPreset="outline"
        onConfirm={confirmRemoveCard}
        onCancel={() => {
          setShowRemoveModal(false);
          setSelectedCardId(null);
        }}
      />

      {/* Coming Soon Modal */}
      <InfoModal
        visible={showComingSoonModal}
        title="Em Breve"
        message="A funcionalidade de adicionar cartões estará disponível em breve. Por enquanto, você pode pagar com PIX!"
        icon="construction"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowComingSoonModal(false)}
      />
    </Box>
  );
}
