import React from 'react';
import {ScrollView, ActivityIndicator, StyleSheet} from 'react-native';

import {Box, Button, Icon, Text, TouchableOpacityBox, ConfirmationModal, ScreenHeader} from '@components';

import {usePaymentMethodsScreen} from './usePaymentMethodsScreen';

export function PaymentMethodsScreen() {
  const {
    navigation,
    cards,
    isLoading,
    isRemoving,
    showRemoveModal, setShowRemoveModal,
    getCardIcon,
    getCardColor,
    handleSetDefault,
    handleRemoveCard,
    confirmRemoveCard,
    handleAddCard,
  } = usePaymentMethodsScreen();

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Formas de Pagamento" onBack={() => navigation.goBack()} />

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
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
            style={styles.shadowCard}>
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

        {isLoading ? (
          <Box alignItems="center" justifyContent="center" paddingVertical="s48">
            <ActivityIndicator size="large" color="#0B5D8A" />
          </Box>
        ) : cards.length === 0 ? (
          <Box
            backgroundColor="surface"
            borderRadius="s12"
            padding="s24"
            alignItems="center"
            mb="s24"
            style={styles.shadowCard}>
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
                style={styles.shadowCard}>
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
                        {card.brand.toUpperCase()} •••• {card.last4}
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
                      {card.holderName} • {String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}
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
          style={styles.infoBox}>
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
        isLoading={isRemoving}
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
        }}
      />

    </Box>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
  },
  shadowCard: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoBox: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
});
