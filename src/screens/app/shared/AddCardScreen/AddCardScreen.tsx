import React from 'react';
import {ScrollView, Switch, ActivityIndicator} from 'react-native';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, ScreenHeader} from '@components';

import {useAddCardScreen} from './useAddCardScreen';

export function AddCardScreen() {
  const {
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
  } = useAddCardScreen();

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Adicionar Cartão" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{padding: 24, paddingBottom: 40}}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Card form section */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          mb="s16"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>

          {/* Card number */}
          <Box mb="s16">
            <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
              Número do Cartão
            </Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              maxLength={19}
            />
          </Box>

          {/* Holder name */}
          <Box mb="s16">
            <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
              Nome no Cartão
            </Text>
            <TextInput
              value={holderName}
              onChangeText={text => setHolderName(text.toUpperCase())}
              placeholder="NOME COMO NO CARTÃO"
              autoCapitalize="characters"
            />
          </Box>

          {/* Expiry + CVV row */}
          <Box flexDirection="row" gap="s12" mb="s16">
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
                Mês
              </Text>
              <TextInput
                value={expiryMonth}
                onChangeText={setExpiryMonth}
                placeholder="MM"
                keyboardType="numeric"
                maxLength={2}
              />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
                Ano
              </Text>
              <TextInput
                value={expiryYear}
                onChangeText={setExpiryYear}
                placeholder="AAAA"
                keyboardType="numeric"
                maxLength={4}
              />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
                CVV
              </Text>
              <TextInput
                value={cvv}
                onChangeText={setCvv}
                placeholder="•••"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
            </Box>
          </Box>

          {/* Card type toggle */}
          <Box>
            <Text preset="paragraphSmall" color="textSecondary" bold mb="s8">
              Tipo
            </Text>
            <Box flexDirection="row" gap="s8">
              <TouchableOpacityBox
                flex={1}
                paddingVertical="s12"
                borderRadius="s12"
                alignItems="center"
                justifyContent="center"
                style={{
                  borderWidth: 2,
                  borderColor: cardType === 'credit_card' ? '#0B5D8A' : '#E0E0E0',
                  backgroundColor: cardType === 'credit_card' ? '#E8F4FD' : '#fff',
                }}
                onPress={() => setCardType('credit_card')}>
                <Text
                  preset="paragraphMedium"
                  bold
                  style={{color: cardType === 'credit_card' ? '#0B5D8A' : '#9E9E9E'}}>
                  Crédito
                </Text>
              </TouchableOpacityBox>
              <TouchableOpacityBox
                flex={1}
                paddingVertical="s12"
                borderRadius="s12"
                alignItems="center"
                justifyContent="center"
                style={{
                  borderWidth: 2,
                  borderColor: cardType === 'debit_card' ? '#0B5D8A' : '#E0E0E0',
                  backgroundColor: cardType === 'debit_card' ? '#E8F4FD' : '#fff',
                }}
                onPress={() => setCardType('debit_card')}>
                <Text
                  preset="paragraphMedium"
                  bold
                  style={{color: cardType === 'debit_card' ? '#0B5D8A' : '#9E9E9E'}}>
                  Débito
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>
        </Box>

        {/* Set as default */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          mb="s16"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flex={1} mr="s16">
            <Text preset="paragraphMedium" color="text" bold>
              Definir como padrão
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              Usar este cartão como método padrão de pagamento
            </Text>
          </Box>
          <Switch
            value={makeDefault}
            onValueChange={setMakeDefault}
            trackColor={{false: '#E0E0E0', true: '#0B5D8A'}}
            thumbColor="#fff"
          />
        </Box>

        {/* Security note */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3',
          }}>
          <Box flexDirection="row" alignItems="flex-start">
            <Icon name="lock" size={20} color="info" />
            <Box flex={1} ml="s8">
              <Text preset="paragraphSmall" color="info">
                Seus dados são criptografados e nunca armazenamos o número completo do cartão.
                O CVV não é guardado após o envio.
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Submit button */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#0B5D8A" />
        ) : (
          <Button title="Adicionar Cartão" onPress={handleSubmit} />
        )}
      </ScrollView>
    </Box>
  );
}
