import React, {useState} from 'react';
import {Alert, Keyboard, ScrollView, TouchableWithoutFeedback} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Text, TextInput} from '@components';
import {UserRole} from '@types';
import {useAuth} from '../../contexts/AuthContext';

import {AuthStackParamList} from '../../routes/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const {register} = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.PASSENGER);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      await register({name: name.trim(), phone: phone.trim(), password, role});
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  }

  const isPassenger = role === UserRole.PASSENGER;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <Box flex={1} backgroundColor="surface" paddingHorizontal="s24" pt="s40">
          {/* Header */}
          <Text preset="headingMedium" color="primary" bold>
            Criar conta
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s4">
            Preencha seus dados para começar
          </Text>

          {/* Form */}
          <Box mt="s32">
            <TextInput
              label="Nome completo"
              placeholder="Seu nome"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Box mt="s16">
              <TextInput
                label="Telefone"
                placeholder="92999999999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                autoCapitalize="none"
              />
            </Box>

            <Box mt="s16">
              <TextInput
                label="Senha"
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </Box>

            {/* Role selector */}
            <Box mt="s16">
              <Text preset="paragraphSmall" semibold mb="s4">
                Eu sou
              </Text>
              <Box flexDirection="row" g="s8">
                <Box flex={1}>
                  <Button
                    title="Passageiro"
                    preset={isPassenger ? 'primary' : 'outline'}
                    onPress={() => setRole(UserRole.PASSENGER)}
                  />
                </Box>
                <Box flex={1}>
                  <Button
                    title="Capitão"
                    preset={!isPassenger ? 'primary' : 'outline'}
                    onPress={() => setRole(UserRole.CAPTAIN)}
                  />
                </Box>
              </Box>
            </Box>

            <Box mt="s24">
              <Button
                title="Criar conta"
                loading={loading}
                onPress={handleRegister}
              />
            </Box>

            <Box mt="s16" mb="s32" alignItems="center">
              <Text preset="paragraphMedium" color="textSecondary">
                Já tem conta?{' '}
              </Text>
              <Box mt="s4">
                <Text
                  preset="paragraphMedium"
                  color="primary"
                  bold
                  onPress={() => navigation.goBack()}>
                  Fazer login
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
