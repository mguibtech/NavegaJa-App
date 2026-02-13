import React, {useState} from 'react';
import {Keyboard, TouchableWithoutFeedback} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput} from '@components';
import {useResetPassword} from '@domain';
import {useToast} from '@hooks';

import {AuthStackParamList} from '@routes';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({navigation, route}: Props) {
  const {email} = route.params;
  const {resetPassword, isLoading} = useResetPassword();
  const toast = useToast();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleResetPassword() {
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.showWarning('Preencha todos os campos');
      return;
    }

    if (code.length !== 6) {
      toast.showWarning('O código deve ter 6 dígitos');
      return;
    }

    if (newPassword.length < 6) {
      toast.showWarning('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.showWarning('As senhas não conferem');
      return;
    }

    try {
      await resetPassword({
        email,
        code: code.trim(),
        newPassword,
      });

      toast.showSuccess('Senha alterada com sucesso!');

      // Volta para tela de login após 1.5s
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (_error: any) {
      const msg =
        _error?.response?.data?.message ||
        'Erro ao resetar senha. Verifique o código e tente novamente.';
      toast.showError(msg);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} backgroundColor="background" paddingHorizontal="s24">
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
            Nova Senha
          </Text>
          <Text
            preset="paragraphMedium"
            color="textSecondary"
            mt="s8"
            textAlign="center">
            Digite o código enviado para {email} e crie uma nova senha
          </Text>
        </Box>

        {/* Form */}
        <Box>
          <TextInput
            label="Código de Verificação"
            placeholder="123456"
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
            leftIcon="verified-user"
            maxLength={6}
          />

          <Box mt="s16">
            <TextInput
              label="Nova Senha"
              placeholder="Mínimo 6 caracteres"
              secureTextEntry={!showPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              leftIcon="lock"
              rightIcon={showPassword ? 'visibility' : 'visibility-off'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
          </Box>

          <Box mt="s16">
            <TextInput
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onSubmitEditing={handleResetPassword}
              returnKeyType="done"
              leftIcon="lock"
            />
          </Box>

          <Box mt="s32">
            <Button
              title="Redefinir Senha"
              loading={isLoading}
              onPress={handleResetPassword}
              rightIcon="check"
              disabled={!code.trim() || !newPassword.trim() || !confirmPassword.trim()}
            />
          </Box>

          <Box mt="s24" alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary">
              Não recebeu o código?{' '}
              <Text
                preset="paragraphMedium"
                color="primary"
                bold
                onPress={() => navigation.goBack()}>
                Reenviar
              </Text>
            </Text>
          </Box>
        </Box>

        {/* Info Box */}
        <Box mt="s40" backgroundColor="warningBg" p="s16" borderRadius="s12">
          <Box flexDirection="row" alignItems="flex-start">
            <Icon name="schedule" size={20} color="warning" />
            <Box flex={1} ml="s12">
              <Text preset="paragraphSmall" color="text" semibold mb="s4">
                Código expira em 15 minutos
              </Text>
              <Text preset="paragraphSmall" color="textSecondary">
                Certifique-se de utilizar o código dentro deste período
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
}
