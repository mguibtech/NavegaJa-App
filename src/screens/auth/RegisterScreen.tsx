import React, {useState} from 'react';
import {Keyboard, ScrollView, TouchableWithoutFeedback, Linking, KeyboardAvoidingView, Platform, Modal, FlatList} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput, TouchableOpacityBox} from '@components';
import {useAuthStore} from '@store';
import {formatPhone, unformatPhone, formatEmail} from '@utils';
import {useToast} from '@hooks';
import {UserRole} from '@domain';

import {AuthStackParamList} from '@routes';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) {return digits;}
  if (digits.length <= 6) {return `${digits.slice(0, 3)}.${digits.slice(3)}`;}
  if (digits.length <= 9) {return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;}
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
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
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  const [city, setCity] = useState('Manaus');
  const [cpf, setCpf] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: unformatPhone(phone),
        password,
        role,
        city: city.trim(),
        state: 'AM',
        cpf: cpf.replace(/\D/g, '') || undefined,
        referralCode: referralCode.trim().toUpperCase() || undefined,
      });

      // Registro bem-sucedido - o store já atualizou o estado global
      // O Router vai detectar isLoggedIn=true e redirecionar automaticamente
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        if (currentUser.role === UserRole.CAPTAIN) {
          toast.showInfo(
            `Bem-vindo, Capitão ${currentUser.name}! Envie seus documentos para ativar sua conta.`,
          );
        } else {
          toast.showSuccess(`Bem-vindo, ${currentUser.name}!`);
        }
      }
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

  const isPassenger = role === UserRole.PASSENGER;

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
                  onPress={() => setRole(UserRole.PASSENGER)}
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
                  onPress={() => setRole(UserRole.CAPTAIN)}
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
                  disabled={!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !city.trim()}
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
            <TouchableOpacityBox onPress={() => setShowCityPicker(false)} padding="s4">
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
                borderBottomColor="border">
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
