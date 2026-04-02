import React, {useState} from 'react';
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Logo, Text, TextInput} from '@components';
import {useForgotPassword} from '@domain';
import {formatEmail} from '@utils';
import {useToast} from '@hooks';

import {AuthStackParamList} from '@routes';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const styles = StyleSheet.create({
  backButton: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export function ForgotPasswordScreen({navigation}: Props) {
  const {forgotPassword, isLoading} = useForgotPassword();
  const toast = useToast();

  const [email, setEmail] = useState('');

  async function handleSendCode() {
    if (!email.trim()) {
      toast.showWarning('Por favor, informe seu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.showWarning('Digite um email valido');
      return;
    }

    try {
      await forgotPassword(email.trim().toLowerCase());

      toast.showSuccess('Codigo enviado! Verifique seu email.', {
        duration: 5000,
      });

      navigation.navigate('ResetPassword', {email: email.trim().toLowerCase()});
    } catch (error) {
      toast.showError(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar codigo. Tente novamente.',
      );
    }
  }

  function handleEmailChange(text: string) {
    setEmail(formatEmail(text));
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Box flex={1} backgroundColor="background" paddingHorizontal="s24">
            <Box pt="s56" mb="s24">
              <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
                <Box
                  width={40}
                  height={40}
                  borderRadius="s12"
                  backgroundColor="surface"
                  alignItems="center"
                  justifyContent="center"
                  style={styles.backButton}>
                  <Icon name="arrow-back" size={24} color="text" />
                </Box>
              </TouchableWithoutFeedback>
            </Box>

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
                Sem problemas! Informe seu email e enviaremos um codigo de
                recuperacao.
              </Text>
            </Box>

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
                  title="Enviar Codigo"
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

            <Box mt="s40" backgroundColor="primaryBg" p="s16" borderRadius="s12">
              <Box flexDirection="row" alignItems="flex-start">
                <Icon name="info" size={20} color="primary" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphSmall" color="text" semibold mb="s4">
                    Dica de Seguranca
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    Nunca compartilhe o codigo de recuperacao com terceiros.
                    Nossa equipe nunca solicitara esse codigo.
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
