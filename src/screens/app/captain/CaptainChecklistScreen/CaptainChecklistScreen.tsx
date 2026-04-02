import React from 'react';
import {ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, ScreenHeader} from '@components';

import {useCaptainChecklist, CHECKLIST_LABELS} from './useCaptainChecklist';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  checkbox: {
    borderRadius: 4,
  },
});

export function CaptainChecklistScreen() {
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        <ScreenHeader title="Checklist de Segurança" subtitle="Passo 1 de 2 — Confirme os itens antes de iniciar" onBack={goBack} />

        {isLoading ? (
          <Box flex={1} alignItems="center" justifyContent="center">
            <ActivityIndicator size="large" color="#0a6fbd" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s16">
              Carregando checklist...
            </Text>
          </Box>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
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
                  style={styles.checkbox}>
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
