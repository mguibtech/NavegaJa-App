import React, {useState} from 'react';
import {Keyboard, ScrollView, TouchableWithoutFeedback, Linking} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput, TouchableOpacityBox} from '@components';
import {useAuthStore} from '../../store/auth.store';
import {formatPhone, unformatPhone, formatEmail} from '@utils';
import {useToast} from '@hooks';

import {AuthStackParamList} from '../../routes/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const {register, isLoading} = useAuthStore();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'passenger' | 'captain'>('passenger');
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.showWarning('Preencha todos os campos');
      return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showWarning('Digite um email válido');
      return;
    }

    if (password.length < 6) {
      toast.showWarning('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: unformatPhone(phone),
        password,
        role,
      });

      // Registro bem-sucedido - o store já atualizou o estado global
      // O Router vai detectar isLoggedIn=true e redirecionar automaticamente
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        toast.showSuccess(`Bem-vindo, ${currentUser.name}!`);
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Erro ao criar conta. Tente novamente.';
      toast.showError(msg);
    }
  }

  function handlePhoneChange(text: string) {
    const formatted = formatPhone(text);
    setPhone(formatted);
  }

  function handleEmailChange(text: string) {
    const formatted = formatEmail(text);
    setEmail(formatted);
  }

  const isPassenger = role === 'passenger';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Box
          flex={1}
          backgroundColor="background"
          paddingHorizontal="s24"
          pt="s56"
          pb="s32">
          {/* Back Button */}
          <TouchableOpacityBox
            onPress={() => navigation.goBack()}
            width={40}
            height={40}
            borderRadius="s12"
            backgroundColor="surface"
            alignItems="center"
            justifyContent="center"
            mb="s24"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>

          {/* Logo */}
          <Box alignItems="center" mb="s24">
            <Logo size={80} />
          </Box>

          {/* Header */}
          <Box mb="s32">
            <Text preset="headingLarge" color="text" bold mb="s8">
              Criar Conta
            </Text>
            <Text preset="paragraphMedium" color="textSecondary">
              Junte-se à maior rede de transporte fluvial da Amazônia
            </Text>
          </Box>

          {/* Role Selection Cards */}
          <Box mb="s24">
            <Text preset="paragraphSmall" color="text" semibold mb="s12">
              Como você quer se cadastrar?
            </Text>

            <Box flexDirection="row" gap="s12">
              {/* Passageiro Card */}
              <TouchableOpacityBox
                flex={1}
                onPress={() => setRole('passenger')}
                backgroundColor={isPassenger ? 'primaryBg' : 'surface'}
                borderRadius="s16"
                padding="s20"
                alignItems="center"
                borderWidth={2}
                borderColor={isPassenger ? 'primary' : 'border'}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: isPassenger ? 0.1 : 0.05,
                  shadowRadius: 8,
                  elevation: isPassenger ? 4 : 2,
                }}>
                <Box
                  width={56}
                  height={56}
                  borderRadius="s20"
                  backgroundColor={isPassenger ? 'primary' : 'primaryBg'}
                  alignItems="center"
                  justifyContent="center"
                  mb="s12">
                  <Icon
                    name="person"
                    size={28}
                    color={isPassenger ? 'surface' : 'primary'}
                  />
                </Box>
                <Text
                  preset="paragraphSmall"
                  color={isPassenger ? 'primary' : 'text'}
                  bold
                  textAlign="center">
                  Passageiro
                </Text>
              </TouchableOpacityBox>

              {/* Barqueiro Card */}
              <TouchableOpacityBox
                flex={1}
                onPress={() => setRole('captain')}
                backgroundColor={!isPassenger ? 'secondaryBg' : 'surface'}
                borderRadius="s16"
                padding="s20"
                alignItems="center"
                borderWidth={2}
                borderColor={!isPassenger ? 'secondary' : 'border'}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: !isPassenger ? 0.1 : 0.05,
                  shadowRadius: 8,
                  elevation: !isPassenger ? 4 : 2,
                }}>
                <Box
                  width={56}
                  height={56}
                  borderRadius="s20"
                  backgroundColor={!isPassenger ? 'secondary' : 'secondaryBg'}
                  alignItems="center"
                  justifyContent="center"
                  mb="s12">
                  <Icon
                    name="directions-boat"
                    size={28}
                    color={!isPassenger ? 'surface' : 'secondary'}
                  />
                </Box>
                <Text
                  preset="paragraphSmall"
                  color={!isPassenger ? 'secondary' : 'text'}
                  bold
                  textAlign="center">
                  Barqueiro
                </Text>
              </TouchableOpacityBox>
            </Box>
          </Box>

          {/* Form Fields */}
          <Box>
            <TextInput
              label="Nome Completo"
              placeholder="Como quer ser chamado?"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              leftIcon="person"
            />

            <Box mt="s16">
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
              />
            </Box>

            <Box mt="s16">
              <TextInput
                label="Telefone"
                placeholder="+55 (92) 99999-9999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={handlePhoneChange}
                autoCapitalize="none"
                leftIcon="phone"
                maxLength={15}
              />
            </Box>

            <Box mt="s16">
              <TextInput
                label="Sua Senha"
                placeholder="Mínimo 8 caracteres"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                leftIcon="lock"
                rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
            </Box>

            <Box mt="s32">
              <Button
                title="Criar Conta"
                loading={isLoading}
                onPress={handleRegister}
                rightIcon="arrow-forward"
                disabled={!name.trim() || !email.trim() || !phone.trim() || !password.trim()}
              />
            </Box>

            {/* Terms and Privacy */}
            <Box mt="s20" alignItems="center">
              <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
                Ao cadastrar-se, você concorda com os{' '}
                <Text
                  preset="paragraphSmall"
                  color="primary"
                  bold
                  onPress={() => Linking.openURL('https://navegaja.com/termos')}>
                  Termos de Uso
                </Text>
                {' e '}
                <Text
                  preset="paragraphSmall"
                  color="primary"
                  bold
                  onPress={() => Linking.openURL('https://navegaja.com/privacidade')}>
                  Política de Privacidade
                </Text>
                {' do NavegaJá'}
              </Text>
            </Box>

            {/* Already have account */}
            <Box mt="s24" alignItems="center">
              <Text preset="paragraphMedium" color="textSecondary">
                Já tem uma conta?{' '}
                <Text
                  preset="paragraphMedium"
                  color="primary"
                  bold
                  onPress={() => navigation.navigate('Login')}>
                  Fazer Login
                </Text>
              </Text>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
