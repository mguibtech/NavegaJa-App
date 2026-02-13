import React, {useState} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput} from '@components';
import {useForgotPassword} from '@domain';
import {formatEmail} from '@utils';
import {useToast} from '@hooks';

import {AuthStackParamList} from '@routes';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const {forgotPassword, isLoading} = useForgotPassword();
  const toast = useToast();

  const [email, setEmail] = useState('');

  async function handleSendCode() {
    if (!email.trim()) {
      toast.showWarning('Por favor, informe seu email');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showWarning('Digite um email válido');
      return;
    }

    try {
      await forgotPassword(email.trim().toLowerCase());

      toast.showSuccess(
        'Código enviado! Verifique seu email.',
        {duration: 5000},
      );

      // Navega para tela de reset password
      navigation.navigate('ResetPassword', {email: email.trim().toLowerCase()});
    } catch (_error: any) {
      const msg =
        _error?.response?.data?.message ||
        'Erro ao enviar código. Tente novamente.';
      toast.showError(msg);
    }
  }

  function handleEmailChange(text: string) {
    const formatted = formatEmail(text);
    setEmail(formatted);
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

        {/* Header with Logo */}
        <Box alignItems="center" mb="s48">
          <Box mb="s24">
            <Logo size={96} />
          </Box>
          <Text preset="headingLarge" color="primary" bold>
            Esqueceu a senha?
          </Text>
          <Text
            preset="paragraphMedium"
            color="textSecondary"
            mt="s8"
            textAlign="center">
            Sem problemas! Informe seu email e enviaremos um código de
            recuperação.
          </Text>
        </Box>

        {/* Form */}
        <Box>
          <TextInput
            label="Email"
            placeholder="seu@email.com"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            value={email}
            onChangeText={handleEmailChange}
            autoCapitalize="none"
            leftIcon="email"
            onSubmitEditing={handleSendCode}
            returnKeyType="send"
          />

          <Box mt="s32">
            <Button
              title="Enviar Código"
              loading={isLoading}
              onPress={handleSendCode}
              rightIcon="send"
              disabled={!email.trim()}
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
