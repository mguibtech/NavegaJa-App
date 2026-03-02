import React, {useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Logo, Text, TextInput} from '@components';
import {useAuthStore} from '@store';
import {formatPhone, unformatPhone} from '@utils';
import {useToast} from '@hooks';
import {logLogin} from '@services';

import {AuthStackParamList} from '@routes';

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

    const rawPhone = unformatPhone(phone);
    if (rawPhone.length < 10) {
      toast.showWarning('Informe um número de celular válido');
      return;
    }

    try {
      await login({
        phone: rawPhone,
        password,
      });

      // Login bem-sucedido - o store já atualizou o estado global
      // O Router vai detectar isLoggedIn=true e redirecionar automaticamente
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        toast.showSuccess(`Bem-vindo, ${currentUser.name}!`);
      }
      logLogin('phone');
    } catch (_error: any) {
      const msg =
        _error?.message ||
        'Erro ao fazer login. Tente novamente.';

      toast.showWarning(msg);
    }
  }

  function handlePhoneChange(text: string) {
    const formatted = formatPhone(text);
    setPhone(formatted);
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Box flex={1} backgroundColor="background" justifyContent="center" paddingHorizontal="s24" paddingVertical="s32">
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
                accessibilityLabel="Número de celular"
                accessibilityHint="Digite seu número com DDD"
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
                    onPress={() => navigation.navigate('ForgotPassword')}
                    accessibilityRole="button"
                    accessibilityLabel="Esqueceu a senha? Recuperar acesso">
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
                  accessibilityLabel="Senha"
                  accessibilityHint={showPassword ? 'Toque no ícone para ocultar a senha' : 'Toque no ícone para mostrar a senha'}
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
                    onPress={() => navigation.navigate('Register')}
                    accessibilityRole="link"
                    accessibilityLabel="Criar conta">
                    Criar conta
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
