import React, {useState} from 'react';
import {ActivityIndicator} from 'react-native';

import {Box, Icon, Text, TextInput, TouchableOpacityBox} from '@components';
import {CouponState} from '@domain';
import {formatBRL} from '@utils';

export interface CouponInputV2Props {
  /**
   * Estado atual do cupom
   */
  state: CouponState;

  /**
   * Callback quando usuário clica em "Aplicar"
   */
  onApply: (code: string) => void;

  /**
   * Callback quando usuário remove cupom
   */
  onRemove: () => void;

  /**
   * Callback quando usuário tenta novamente após erro
   */
  onRetry?: () => void;
}

/**
 * Componente de input de cupom com máquina de estados
 * Segue spec: docs/COUPON_VALIDATION_SPEC.md
 */
export function CouponInputV2({
  state,
  onApply,
  onRemove,
  onRetry,
}: CouponInputV2Props) {
  const [code, setCode] = useState('');

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim().toUpperCase());
    }
  };

  // Estado: VALID - Cupom aplicado com sucesso
  if (state.status === 'VALID') {
    const {code: appliedCode, savedAmount} = state.data;

    return (
      <Box mb="s16">
        <Text preset="paragraphMedium" color="text" bold mb="s12">
          {'Cupom de desconto'}
        </Text>

        {/* Card com cupom aplicado */}
        <Box
          backgroundColor="successBg"
          padding="s16"
          borderRadius="s12"
          borderWidth={2}
          borderColor="success">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Icon name="check-circle" size={24} color="success" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphMedium" color="success" bold>
                {'Cupom aplicado: '}{appliedCode}
              </Text>
            </Box>
            <TouchableOpacityBox onPress={onRemove}>
              <Icon name="close" size={20} color="success" />
            </TouchableOpacityBox>
          </Box>

          {/* Economia */}
          <Box
            backgroundColor="success"
            paddingHorizontal="s12"
            paddingVertical="s8"
            borderRadius="s8"
            alignSelf="flex-start">
            <Text preset="paragraphSmall" color="surface" bold>
              {`💰 Você economizou ${formatBRL(savedAmount)}`}
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  // Estado: INVALID - Cupom inválido
  if (state.status === 'INVALID') {
    return (
      <Box mb="s16">
        <Text preset="paragraphMedium" color="text" bold mb="s12">
          {'Cupom de desconto'}
        </Text>

        {/* Card com erro */}
        <Box
          backgroundColor="dangerBg"
          padding="s16"
          borderRadius="s12"
          borderWidth={2}
          borderColor="danger"
          mb="s12">
          <Box flexDirection="row" alignItems="center">
            <Icon name="error" size={24} color="danger" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphMedium" color="danger" bold>
                {state.error}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Input para tentar novamente */}
        <Box flexDirection="row" gap="s12">
          <Box flex={1}>
            <TextInput
              placeholder="Digite outro código"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              leftIcon="local-offer"
            />
          </Box>
          <TouchableOpacityBox
            backgroundColor={code.trim() ? 'primary' : 'disabled'}
            paddingHorizontal="s20"
            paddingVertical="s16"
            borderRadius="s12"
            justifyContent="center"
            alignItems="center"
            disabled={!code.trim()}
            onPress={handleApply}>
            <Text preset="paragraphMedium" color="surface" bold>
              {'Tentar'}
            </Text>
          </TouchableOpacityBox>
        </Box>
      </Box>
    );
  }

  // Estado: ERROR - Erro de rede/servidor
  if (state.status === 'ERROR') {
    return (
      <Box mb="s16">
        <Text preset="paragraphMedium" color="text" bold mb="s12">
          {'Cupom de desconto'}
        </Text>

        {/* Card com erro de rede */}
        <Box
          backgroundColor="warningBg"
          padding="s16"
          borderRadius="s12"
          borderWidth={2}
          borderColor="warning"
          mb="s12">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Icon name="error-outline" size={24} color="warning" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphMedium" color="warning" bold>
                {'Erro ao validar cupom'}
              </Text>
              <Text preset="paragraphSmall" color="warning" mt="s4">
                {state.error}
              </Text>
            </Box>
          </Box>

          {onRetry && (
            <TouchableOpacityBox
              backgroundColor="warning"
              paddingHorizontal="s16"
              paddingVertical="s10"
              borderRadius="s8"
              alignSelf="flex-start"
              onPress={onRetry}>
              <Text preset="paragraphSmall" color="surface" bold>
                {'🔄 Tentar novamente'}
              </Text>
            </TouchableOpacityBox>
          )}
        </Box>
      </Box>
    );
  }

  // Estado: VALIDATING - Carregando
  if (state.status === 'VALIDATING') {
    return (
      <Box mb="s16">
        <Text preset="paragraphMedium" color="text" bold mb="s12">
          {'Cupom de desconto'}
        </Text>

        <Box
          flexDirection="row"
          gap="s12"
          backgroundColor="surface"
          padding="s16"
          borderRadius="s12"
          borderWidth={1}
          borderColor="border">
          <Box flex={1}>
            <TextInput
              placeholder="Digite o código"
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              leftIcon="local-offer"
              editable={false}
            />
          </Box>
          <Box
            backgroundColor="primary"
            paddingHorizontal="s20"
            paddingVertical="s16"
            borderRadius="s12"
            justifyContent="center"
            alignItems="center"
            minWidth={100}>
            <ActivityIndicator size="small" color="#FFF" />
          </Box>
        </Box>
      </Box>
    );
  }

  // Estado: NOT_VALIDATED - Inicial
  return (
    <Box mb="s16">
      <Text preset="paragraphMedium" color="text" bold mb="s12">
        {'Tem um cupom de desconto?'}
      </Text>

      <Box flexDirection="row" gap="s12">
        <Box flex={1}>
          <TextInput
            placeholder="Digite o código"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            leftIcon="local-offer"
          />
        </Box>
        <TouchableOpacityBox
          backgroundColor={code.trim() ? 'primary' : 'disabled'}
          paddingHorizontal="s20"
          paddingVertical="s16"
          borderRadius="s12"
          justifyContent="center"
          alignItems="center"
          disabled={!code.trim()}
          onPress={handleApply}>
          <Text preset="paragraphMedium" color="surface" bold>
            {'Aplicar'}
          </Text>
        </TouchableOpacityBox>
      </Box>
    </Box>
  );
}
