import React from 'react';
import {ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox} from '@components';

import {useCaptainChecklist, CHECKLIST_LABELS} from './useCaptainChecklist';

export function CaptainChecklistScreen() {
  const {top} = useSafeAreaInsets();
  const {
    isLoading,
    isSaving,
    apiAvailable,
    checks,
    lifeJacketsCount,
    setLifeJacketsCount,
    passengersOnBoard,
    setPassengersOnBoard,
    allChecked,
    checkedCount,
    toggle,
    handleNext,
    loadOrCreateChecklist,
    goBack,
  } = useCaptainChecklist();

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center" justifyContent="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              onPress={goBack}
              style={{position: 'absolute', left: 0}}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box alignItems="center">
              <Text preset="headingSmall" color="text" bold>
                Checklist de Segurança
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                Passo 1 de 2 — Confirme os itens antes de iniciar
              </Text>
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color="#0a6fbd" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s16">
              Carregando checklist...
            </Text>
          </Box>
        ) : (
          <ScrollView
            contentContainerStyle={{padding: 20, paddingBottom: 120}}
            keyboardShouldPersistTaps="handled">

            {/* API indisponível */}
            {!apiAvailable && (
              <Box
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="center">
                <Icon name="cloud-off" size={22} color="danger" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphSmall" color="danger" bold>
                    Servidor indisponível
                  </Text>
                  <Text preset="paragraphCaptionSmall" color="danger">
                    O checklist precisa ser salvo no servidor para iniciar a viagem.
                  </Text>
                </Box>
                <TouchableOpacityBox onPress={loadOrCreateChecklist} padding="s8">
                  <Icon name="refresh" size={20} color="danger" />
                </TouchableOpacityBox>
              </Box>
            )}

            {/* Info Banner */}
            <Box
              backgroundColor="secondaryBg"
              borderRadius="s12"
              padding="s16"
              mb="s20"
              flexDirection="row"
              alignItems="flex-start">
              <Icon name="security" size={22} color="secondary" />
              <Box flex={1} ml="s12">
                <Text preset="paragraphSmall" color="text" bold mb="s4">
                  Verificação de segurança obrigatória
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  Todos os itens marcados com * são obrigatórios para iniciar a viagem.
                </Text>
              </Box>
            </Box>

            {/* Checklist Items */}
            {CHECKLIST_LABELS.map(({key, label}) => (
              <TouchableOpacityBox
                key={key}
                backgroundColor="surface"
                borderRadius="s12"
                padding="s16"
                mb="s8"
                flexDirection="row"
                alignItems="center"
                borderWidth={1}
                borderColor={checks[key] ? 'secondary' : 'border'}
                onPress={() => toggle(key)}>
                <Box
                  width={24}
                  height={24}
                  borderWidth={2}
                  borderColor={checks[key] ? 'secondary' : 'border'}
                  backgroundColor={checks[key] ? 'secondary' : 'background'}
                  alignItems="center"
                  justifyContent="center"
                  mr="s12"
                  style={{borderRadius: 4}}>
                  {checks[key] && <Icon name="check" size={14} color="surface" />}
                </Box>
                <Text preset="paragraphSmall" color="text" flex={1}>
                  {label}
                </Text>
              </TouchableOpacityBox>
            ))}

            {/* Campos numéricos obrigatórios */}
            <Box mt="s16" mb="s8">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Dados da viagem
              </Text>
              <Box mb="s12">
                <TextInput
                  placeholder="Quantidade de coletes salva-vidas *"
                  value={lifeJacketsCount}
                  onChangeText={v => setLifeJacketsCount(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  leftIcon="security"
                />
              </Box>
              <Box mb="s12">
                <TextInput
                  placeholder="Passageiros a bordo *"
                  value={passengersOnBoard}
                  onChangeText={v => setPassengersOnBoard(v.replace(/\D/g, ''))}
                  keyboardType="numeric"
                  leftIcon="people"
                />
              </Box>
            </Box>

            {/* Progress */}
            <Box mb="s24" alignItems="center">
              <Text preset="paragraphCaptionSmall" color="textSecondary">
                {checkedCount} de {CHECKLIST_LABELS.length} itens verificados
              </Text>
              {!allChecked && (
                <Text preset="paragraphCaptionSmall" color="danger" mt="s4">
                  Confirme todos os itens para continuar
                </Text>
              )}
            </Box>

            <Button
              title={isSaving ? 'Salvando...' : 'Verificar Condições Climáticas'}
              onPress={handleNext}
              disabled={!allChecked || isSaving || !apiAvailable}
            />
          </ScrollView>
        )}
      </Box>
    </KeyboardAvoidingView>
  );
}
