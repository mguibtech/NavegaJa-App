import React, {useState} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput} from '@components';
import {useForgotPassword} from '@domain';
import {formatPhone, unformatPhone} from '@utils';
import {useToast} from '@hooks';

import {AuthStackParamList} from '../../routes/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const {forgotPassword, isLoading} = useForgotPassword();
  const toast = useToast();

  const [phone, setPhone] = useState('');

  async function handleSendCode() {
    if (!phone.trim()) {
      toast.showWarning('Por favor, informe seu telefone');
      return;
    }

    try {
      await forgotPassword(unformatPhone(phone));

      toast.showSuccess(
        'Código enviado! Verifique suas mensagens.',
        {duration: 5000},
      );

      // Volta para tela anterior após 2s
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Erro ao enviar código. Tente novamente.';
      toast.showError(msg);
    }
  }

  function handlePhoneChange(text: string) {
    const formatted = formatPhone(text);
    setPhone(formatted);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box
        flex={1}
        backgroundColor="background"
        paddingHorizontal="s24">
        {/* Back Button */}
        <Box pt="s56" mb="s24">
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <Box
              width={40}
              height={40}
              borderRadius="s12"
              backgroundColor="surface"
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Icon name="arrow-back" size={24} color="text" />
            </Box>
          </TouchableWithoutFeedback>
        </Box>

        {/* Header with Icon */}
        <Box alignItems="center" mb="s48">
          <Box
            width={96}
            height={96}
            backgroundColor="primaryBg"
            borderRadius="s20"
            alignItems="center"
            justifyContent="center"
            mb="s24">
            <Icon name="lock-reset" size={48} color="primary" />
          </Box>
          <Text preset="headingLarge" color="primary" bold>
            Esqueceu a senha?
          </Text>
          <Text
            preset="paragraphMedium"
            color="textSecondary"
            mt="s8"
            textAlign="center">
            Sem problemas! Informe seu telefone e enviaremos um código de
            recuperação.
          </Text>
        </Box>

        {/* Form */}
        <Box>
          <TextInput
            label="Celular"
            placeholder="(92) 99100-1001"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            autoCapitalize="none"
            leftIcon="phone-iphone"
            maxLength={15}
            onSubmitEditing={handleSendCode}
            returnKeyType="send"
          />

          <Box mt="s32">
            <Button
              title="Enviar Código"
              loading={isLoading}
              onPress={handleSendCode}
              rightIcon="send"
            />
          </Box>

          <Box mt="s24" alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary">
              Lembrou a senha?{' '}
              <Text
                preset="paragraphMedium"
                color="primary"
                bold
                onPress={() => navigation.goBack()}>
                Fazer login
              </Text>
            </Text>
          </Box>
        </Box>

        {/* Info Box */}
        <Box mt="s40" backgroundColor="primaryBg" p="s16" borderRadius="s12">
          <Box flexDirection="row" alignItems="flex-start">
            <Icon name="info" size={20} color="primary" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphSmall" color="text" semibold mb="s4">
                Dica de Segurança
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Nunca compartilhe o código de recuperação com terceiros. Nossa
                equipe nunca solicitará esse código.
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
}
