import React, {useState} from 'react';
import {Alert, Keyboard, TouchableWithoutFeedback} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Text, TextInput} from '@components';
import {useAuth} from '../../contexts/AuthContext';

import {AuthStackParamList} from '../../routes/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const {login} = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha telefone e senha.');
      return;
    }

    try {
      setLoading(true);
      await login({phone: phone.trim(), password});
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Erro ao fazer login. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Box flex={1} backgroundColor="surface" paddingHorizontal="s24">
        {/* Header */}
        <Box flex={1} justifyContent="center" alignItems="center">
          <Text preset="headingLarge" color="primary" bold>
            NavegaJá
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s8">
            Sua viagem fluvial começa aqui
          </Text>
        </Box>

        {/* Form */}
        <Box flex={2}>
          <TextInput
            label="Telefone"
            placeholder="92999999999"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoCapitalize="none"
          />

          <Box mt="s16">
            <TextInput
              label="Senha"
              placeholder="Sua senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
              returnKeyType="done"
            />
          </Box>

          <Box mt="s24">
            <Button
              title="Entrar"
              loading={loading}
              onPress={handleLogin}
            />
          </Box>

          <Box mt="s16" alignItems="center">
            <Text preset="paragraphMedium" color="textSecondary">
              Não tem conta?{' '}
            </Text>
            <Box mt="s4">
              <Text
                preset="paragraphMedium"
                color="primary"
                bold
                onPress={() => navigation.navigate('Register')}>
                Criar conta
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableWithoutFeedback>
  );
}
