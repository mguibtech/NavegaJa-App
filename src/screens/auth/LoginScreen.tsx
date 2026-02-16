import React, {useState} from 'react';
import {Keyboard, Pressable, TouchableWithoutFeedback} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Logo, Text, TextInput} from '@components';
import {useAuthStore} from '@store';
import {formatPhone, unformatPhone} from '@utils';
import {useToast} from '@hooks';

import {AuthStackParamList} from '@routes';

const ONBOARDED_KEY = '@navegaja:onboarded';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const {login, isLoading} = useAuthStore();
  const toast = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      toast.showWarning('Preencha telefone e senha');
      return;
    }

    try {
      await login({
        phone: unformatPhone(phone),
        password,
      });

      // Login bem-sucedido - o store já atualizou o estado global
      // O Router vai detectar isLoggedIn=true e redirecionar automaticamente
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        toast.showSuccess(`Bem-vindo, ${currentUser.name}!`);
      }
    } catch (_error: any) {
      const msg =
        _error?.response?.data?.message ||
        'Erro ao fazer login. Tente novamente.';

      toast.showWarning(msg);
    }
  }

  function handlePhoneChange(text: string) {
    const formatted = formatPhone(text);
    setPhone(formatted);
  }

  // DEV ONLY: Reset onboarding
  async function resetOnboarding() {
    await AsyncStorage.removeItem(ONBOARDED_KEY);
    toast.showInfo('Onboarding resetado! Feche e reabra o app');
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} backgroundColor="background" justifyContent="center" paddingHorizontal="s24">
        {/* DEV ONLY: Reset Onboarding Button */}
        <Box position="absolute" top={40} right={16} zIndex={10}>
          <Pressable onPress={resetOnboarding}>
            <Text preset="paragraphCaptionSmall" color="danger" bold>
              [DEV] Reset
            </Text>
          </Pressable>
        </Box>

        {/* Header with Logo */}
        <Box alignItems="center" mb="s48">
          <Box mb="s24">
            <Logo size={120} />
          </Box>
          <Text preset="headingLarge" color="primary" bold>
            NavegaJá
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s8">
            Transporte fluvial na palma da mão
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
            leftIcon="phone"
            maxLength={15}
          />

          <Box mt="s16">
            <Box
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb="s4">
              <Text preset="paragraphSmall" semibold>
                Senha
              </Text>
              <Text
                preset="paragraphSmall"
                color="primary"
                bold
                onPress={() => navigation.navigate('ForgotPassword')}>
                Esqueceu a senha?
              </Text>
            </Box>
            <TextInput
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
              leftIcon="lock"
              rightIcon={showPassword ? 'visibility' : 'visibility-off'}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
          </Box>

          <Box mt="s32">
            <Button
              title="Entrar"
              loading={isLoading}
              onPress={handleLogin}
              rightIcon="arrow-forward"
              disabled={!phone.trim() || !password.trim()}
            />
          </Box>

          <Box mt="s24" alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary">
              Não tem uma conta?{' '}
              <Text
                preset="paragraphMedium"
                color="secondary"
                bold
                onPress={() => navigation.navigate('Register')}>
                Criar conta
              </Text>
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
}
