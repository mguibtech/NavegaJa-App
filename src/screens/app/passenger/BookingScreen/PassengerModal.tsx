import React, {useState, useEffect} from 'react';
import {Modal, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';

interface AdultModalProps {
  visible: true;
  type: 'adult';
  index: number;
  cpf: string;
  onConfirm: (data: {cpf: string}) => void;
  onClose: () => void;
}

interface ChildModalProps {
  visible: true;
  type: 'child';
  index: number;
  age: number;
  onConfirm: (data: {age: number}) => void;
  onRemove: () => void;
  onClose: () => void;
}

type Props = (AdultModalProps | ChildModalProps) & {visible: boolean};

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  let formatted = numbers;
  if (numbers.length > 3) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  }
  if (numbers.length > 6) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  if (numbers.length > 9) {
    formatted = `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
  }
  return formatted;
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

export function PassengerModal(props: Props) {
  const [cpf, setCpf] = useState('');
  const [age, setAge] = useState(0);
  const [cpfError, setCpfError] = useState<string | null>(null);

  // Sincroniza estado local com props quando abre
  useEffect(() => {
    if (props.visible) {
      setCpfError(null);
      if (props.type === 'adult') {
        setCpf(props.cpf);
      } else {
        setAge(props.age);
      }
    }
  }, [props.visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!props.visible) {return null;}

  const isAdult = props.type === 'adult';
  const title = isAdult
    ? `Passageiro ${props.index + 2}`
    : `Criança ${props.index + 1}`;

  const isFreeChild = !isAdult && age <= 9;

  function handleCpfChange(value: string) {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (cpfError) {setCpfError(null);}
  }

  function handleConfirm() {
    if (isAdult) {
      if (!cpf.trim()) {
        setCpfError('CPF é obrigatório');
        return;
      }
      if (cpf.replace(/\D/g, '').length !== 11) {
        setCpfError('CPF incompleto');
        return;
      }
      if (!isValidCPF(cpf)) {
        setCpfError('CPF inválido');
        return;
      }
      (props as AdultModalProps).onConfirm({cpf: cpf.replace(/\D/g, '')});
    } else {
      (props as ChildModalProps).onConfirm({age});
    }
  }

  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}>
      <Box
        flex={1}
        style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
        justifyContent="flex-end">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Box
            backgroundColor="surface"
            style={{
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
            padding="s20">

            {/* Header do modal */}
            <Box flexDirection="row" alignItems="center" mb="s20">
              <Box
                width={40}
                height={40}
                borderRadius="s20"
                style={{backgroundColor: isAdult ? '#EFF6FF' : '#FEF3C7'}}
                alignItems="center"
                justifyContent="center"
                mr="s12">
                <Icon
                  name={isAdult ? 'person' : 'child-care'}
                  size={22}
                  color={isAdult ? '#2563EB' as any : '#D97706' as any}
                />
              </Box>
              <Text preset="paragraphMedium" color="text" bold flex={1}>
                {title}
              </Text>
              <TouchableOpacityBox
                width={36}
                height={36}
                borderRadius="s20"
                backgroundColor="background"
                alignItems="center"
                justifyContent="center"
                onPress={props.onClose}>
                <Icon name="close" size={20} color="textSecondary" />
              </TouchableOpacityBox>
            </Box>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">

              {/* Campo CPF — só adultos */}
              {isAdult && (
                <Box mb="s16">
                  <TextInput
                    label="CPF *"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChangeText={handleCpfChange}
                    keyboardType="numeric"
                    leftIcon="badge"
                    maxLength={14}
                    errorMessage={cpfError || undefined}
                  />
                </Box>
              )}

              {/* Seletor de idade — só crianças */}
              {!isAdult && (
                <Box mb="s16">
                  <Text preset="paragraphSmall" color="textSecondary" mb="s8">
                    Idade *
                  </Text>
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="center"
                    gap="s16">
                    <TouchableOpacityBox
                      width={44}
                      height={44}
                      borderRadius="s24"
                      backgroundColor={age <= 0 ? 'disabled' : 'primary'}
                      alignItems="center"
                      justifyContent="center"
                      disabled={age <= 0}
                      onPress={() => setAge(a => Math.max(0, a - 1))}>
                      <Icon name="remove" size={20} color={age <= 0 ? 'disabledText' : 'surface'} />
                    </TouchableOpacityBox>

                    <Box alignItems="center" minWidth={80}>
                      <Text
                        preset="headingSmall"
                        color="text"
                        bold
                        style={{fontSize: 28}}>
                        {age === 0 ? 'Bebê' : `${age}`}
                      </Text>
                      {age > 0 && (
                        <Text preset="paragraphCaptionSmall" color="textSecondary">
                          anos
                        </Text>
                      )}
                    </Box>

                    <TouchableOpacityBox
                      width={44}
                      height={44}
                      borderRadius="s24"
                      backgroundColor={age >= 17 ? 'disabled' : 'primary'}
                      alignItems="center"
                      justifyContent="center"
                      disabled={age >= 17}
                      onPress={() => setAge(a => Math.min(17, a + 1))}>
                      <Icon name="add" size={20} color={age >= 17 ? 'disabledText' : 'surface'} />
                    </TouchableOpacityBox>
                  </Box>

                  {/* Badge gratuito/pago */}
                  <Box
                    mt="s12"
                    paddingVertical="s8"
                    paddingHorizontal="s12"
                    borderRadius="s8"
                    alignSelf="center"
                    style={{backgroundColor: isFreeChild ? '#D1FAE5' : '#FEE2E2'}}>
                    <Text
                      preset="paragraphSmall"
                      bold
                      style={{color: isFreeChild ? '#065F46' : '#991B1B'}}>
                      {isFreeChild
                        ? '✓ Viagem gratuita (até 9 anos)'
                        : `Cobrado como adulto (${age}+ anos)`}
                    </Text>
                  </Box>
                </Box>
              )}

              {/* Botões de ação */}
              <Box flexDirection="row" gap="s12" mt="s8">
                {!isAdult && (
                  <TouchableOpacityBox
                    height={52}
                    borderRadius="s12"
                    paddingHorizontal="s16"
                    alignItems="center"
                    justifyContent="center"
                    style={{backgroundColor: '#FEE2E2'}}
                    onPress={(props as ChildModalProps).onRemove}>
                    <Icon name="delete" size={22} color="danger" />
                  </TouchableOpacityBox>
                )}

                <Box flex={1}>
                  <Button
                    title="Confirmar"
                    onPress={handleConfirm}
                    rightIcon="check"
                  />
                </Box>
              </Box>

            </ScrollView>
          </Box>
        </KeyboardAvoidingView>
      </Box>
    </Modal>
  );
}
