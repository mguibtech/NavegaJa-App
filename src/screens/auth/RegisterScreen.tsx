import React, {useState} from 'react';
import {Keyboard, ScrollView, TouchableWithoutFeedback, Linking, KeyboardAvoidingView, Platform, Modal, FlatList} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput, TouchableOpacityBox} from '@components';
import {useAuthStore} from '@store';
import {formatPhone, unformatPhone, formatEmail} from '@utils';
import {useToast} from '@hooks';
import {logSignUp} from '@services';

import {AuthStackParamList} from '@routes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {return digits;}
  if (digits.length <= 6) {return `${digits.slice(0, 3)}.${digits.slice(3)}`;}
  if (digits.length <= 9) {return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;}
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) {return false;}
  if (/^(\d)\1{10}$/.test(clean)) {return false;}
  let sum = 0;
  for (let i = 0; i < 9; i++) {sum += parseInt(clean[i], 10) * (10 - i);}
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) {d1 = 0;}
  if (parseInt(clean[9], 10) !== d1) {return false;}
  sum = 0;
  for (let i = 0; i < 10; i++) {sum += parseInt(clean[i], 10) * (11 - i);}
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) {d2 = 0;}
  return parseInt(clean[10], 10) === d2;
}

const AM_CITIES = [
  'Manaus',
  'Parintins',
  'Itacoatiara',
  'Tefé',
  'Barreirinha',
  'Coari',
  'Maués',
  'Tabatinga',
  'Lábrea',
  'Humaitá',
  'Benjamin Constant',
  'São Gabriel da Cachoeira',
  'Borba',
  'Autazes',
  'Nova Olinda do Norte',
  'Presidente Figueiredo',
  'Iranduba',
  'Manacapuru',
  'Careiro',
  'Anori',
];

export function RegisterScreen({navigation}: Props) {
  const {register, isLoading} = useAuthStore();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Manaus');
  const [cpf, setCpf] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !city.trim()) {
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

    if (password !== confirmPassword) {
      toast.showWarning('As senhas não coincidem');
      return;
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length > 0 && !isValidCPF(cpf)) {
      toast.showWarning('CPF inválido. Verifique os dígitos');
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: unformatPhone(phone),
        password,
        city: city.trim(),
        state: 'AM',
        cpf: cpf.replace(/\D/g, '') || undefined,
        referralCode: referralCode.trim().toUpperCase() || undefined,
      });

      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        toast.showSuccess(`Bem-vindo, ${currentUser.name}!`);
      }
      logSignUp('phone');
    } catch (_error: any) {
      const msg =
        _error?.message ||
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

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
              accessibilityLabel="Voltar"
              accessibilityRole="button"
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

              {/* CPF (opcional) */}
              <Box mt="s16">
                <TextInput
                  label="CPF (opcional)"
                  placeholder="000.000.000-00"
                  keyboardType="numeric"
                  value={cpf}
                  onChangeText={v => setCpf(formatCPF(v))}
                  maxLength={14}
                  leftIcon="badge"
                />
              </Box>

              {/* Código de indicação (opcional) */}
              <Box mt="s16">
                <TextInput
                  label="Código de Indicação (opcional)"
                  placeholder="Ex: ABC123"
                  value={referralCode}
                  onChangeText={v => setReferralCode(v.toUpperCase())}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                  leftIcon="card-giftcard"
                />
              </Box>

              {/* Cidade */}
              <Box mt="s16">
                <Text preset="paragraphSmall" color="text" semibold mb="s8">
                  Cidade *
                </Text>
                <TouchableOpacityBox
                  onPress={() => setShowCityPicker(true)}
                  backgroundColor="surface"
                  borderRadius="s12"
                  borderWidth={1}
                  borderColor="border"
                  paddingHorizontal="s16"
                  paddingVertical="s16"
                  flexDirection="row"
                  alignItems="center"
                  accessibilityLabel={city ? `Cidade selecionada: ${city}. Toque para alterar` : 'Selecione sua cidade'}
                  accessibilityRole="combobox"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 1},
                    shadowOpacity: 0.04,
                    shadowRadius: 2,
                    elevation: 1,
                  }}>
                  <Icon name="location-city" size={20} color="textSecondary" />
                  <Text
                    preset="paragraphMedium"
                    color={city ? 'text' : 'textSecondary'}
                    ml="s12"
                    flex={1}>
                    {city || 'Selecione sua cidade'}
                  </Text>
                  <Icon name="keyboard-arrow-down" size={20} color="textSecondary" />
                </TouchableOpacityBox>
              </Box>

              <Box mt="s16">
                <TextInput
                  label="Sua Senha"
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                  accessibilityLabel="Senha"
                  accessibilityHint="Mínimo 6 caracteres"
                />
              </Box>

              <Box mt="s16">
                <TextInput
                  label="Confirmar Senha"
                  placeholder="Repita sua senha"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={handleRegister}
                  returnKeyType="done"
                  leftIcon="lock-outline"
                  rightIcon={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  accessibilityLabel="Confirmar senha"
                  accessibilityHint="Digite a mesma senha novamente para confirmar"
                />
              </Box>

              <Box mt="s32">
                <Button
                  title="Criar Conta"
                  loading={isLoading}
                  onPress={handleRegister}
                  rightIcon="arrow-forward"
                  disabled={!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim() || !city.trim()}
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
                    accessibilityRole="link"
                    onPress={() => Linking.openURL('https://navegaja.com/termos')}>
                    Termos de Uso
                  </Text>
                  {' e '}
                  <Text
                    preset="paragraphSmall"
                    color="primary"
                    bold
                    accessibilityRole="link"
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
                    accessibilityRole="link"
                    accessibilityLabel="Fazer login"
                    onPress={() => navigation.navigate('Login')}>
                    Fazer Login
                  </Text>
                </Text>
              </Box>
            </Box>
          </Box>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* City Picker Modal */}
      <Modal
        visible={showCityPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityPicker(false)}>
        <TouchableOpacityBox
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.4)'}}
          onPress={() => setShowCityPicker(false)}
        />
        <Box
          backgroundColor="surface"
          borderTopLeftRadius="s20"
          borderTopRightRadius="s20"
          paddingTop="s16"
          style={{maxHeight: '60%'}}>
          <Box
            flexDirection="row"
            alignItems="center"
            paddingHorizontal="s20"
            paddingBottom="s16"
            borderBottomWidth={1}
            borderBottomColor="border">
            <Text preset="paragraphMedium" color="text" bold flex={1}>
              Selecione sua cidade
            </Text>
            <TouchableOpacityBox
              onPress={() => setShowCityPicker(false)}
              padding="s4"
              accessibilityLabel="Fechar seleção de cidade"
              accessibilityRole="button">
              <Icon name="close" size={24} color="textSecondary" />
            </TouchableOpacityBox>
          </Box>
          <FlatList
            data={AM_CITIES}
            keyExtractor={item => item}
            renderItem={({item}) => (
              <TouchableOpacityBox
                onPress={() => {
                  setCity(item);
                  setShowCityPicker(false);
                }}
                paddingHorizontal="s20"
                paddingVertical="s16"
                flexDirection="row"
                alignItems="center"
                backgroundColor={city === item ? 'primaryBg' : 'surface'}
                borderBottomWidth={1}
                borderBottomColor="border"
                accessibilityLabel={`${item}${city === item ? ', selecionada' : ''}`}
                accessibilityRole="radio"
                accessibilityState={{checked: city === item}}>
                <Text
                  preset="paragraphMedium"
                  color={city === item ? 'primary' : 'text'}
                  bold={city === item}
                  flex={1}>
                  {item}
                </Text>
                {city === item && (
                  <Icon name="check" size={20} color="primary" />
                )}
              </TouchableOpacityBox>
            )}
          />
        </Box>
      </Modal>
    </>
  );
}
