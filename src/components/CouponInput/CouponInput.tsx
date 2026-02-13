import { Box, Icon, Text, TextInput, TouchableOpacityBox } from '@components';
import React, {useState} from 'react';
import {ActivityIndicator} from 'react-native';


export interface CouponInputProps {
  onApply: (code: string) => Promise<void>;
  isLoading?: boolean;
  appliedCode?: string | null;
  onRemove?: () => void;
}

export function CouponInput({
  onApply,
  isLoading = false,
  appliedCode,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState('');

  const handleApply = async () => {
    if (code.trim()) {
      await onApply(code.trim().toUpperCase());
    }
  };

  if (appliedCode) {
    return (
      <Box
        flexDirection="row"
        alignItems="center"
        backgroundColor="successBg"
        padding="s16"
        borderRadius="s12"
        borderWidth={1}
        borderColor="success">
        <Icon name="check-circle" size={20} color="success" />
        <Box flex={1} ml="s12">
          <Text preset="paragraphSmall" color="success" bold>
            {'Cupom aplicado: '}{appliedCode}
          </Text>
        </Box>
        {onRemove && (
          <TouchableOpacityBox onPress={onRemove}>
            <Icon name="close" size={20} color="success" />
          </TouchableOpacityBox>
        )}
      </Box>
    );
  }

  return (
    <Box>
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
            editable={!isLoading}
          />
        </Box>
        <TouchableOpacityBox
          backgroundColor={code.trim() ? 'primary' : 'disabled'}
          paddingHorizontal="s20"
          paddingVertical="s16"
          borderRadius="s12"
          justifyContent="center"
          alignItems="center"
          disabled={!code.trim() || isLoading}
          onPress={handleApply}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text preset="paragraphMedium" color="surface" bold>
              {'Aplicar'}
            </Text>
          )}
        </TouchableOpacityBox>
      </Box>
    </Box>
  );
}
