import React from 'react';
import {ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@shopify/restyle';

import {
  Box,
  Button,
  ConfirmationModal,
  Icon,
  Text,
  TouchableOpacityBox,
  TextInput,
} from '@components';
import {SOS_TYPE_CONFIGS} from '@domain';
import {formatPhone} from '@utils';
import {Theme} from '@theme';

import {useSosAlertScreen} from './useSosAlertScreen';

export function SosAlertScreen() {
  const {top} = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const {
    navigation,
    activeAlert,
    isLoading,
    selectedType,
    description,
    setDescription,
    contactNumber,
    setContactNumber,
    isCreating,
    showConfirmSosModal,
    setShowConfirmSosModal,
    showCancelSosModal,
    setShowCancelSosModal,
    sosTypes,
    handleSelectType,
    handleCreateAlert,
    handleConfirmSos,
    handleCancelAlert,
    handleConfirmCancelSos,
  } = useSosAlertScreen();

  if (isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="background"
        style={{paddingTop: top}}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text preset="paragraphMedium" color="text" mt="s16">
          Verificando alertas...
        </Text>
      </Box>
    );
  }

  // Se já existe alerta ativo, mostrar status
  if (activeAlert) {
    const config = SOS_TYPE_CONFIGS[activeAlert.type];

    return (
      <Box flex={1} backgroundColor="background">
        {/* Header com botão voltar */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s20"
          paddingBottom="s16"
          style={{
            paddingTop: top + 12,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            zIndex: 10,
          }}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s12"
              backgroundColor="background"
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor="border"
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs')}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold ml="s12">
              SOS Ativo
            </Text>
          </Box>
        </Box>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box style={{padding: 20, paddingTop: 20}}>
            {/* Header com status */}
            <Box
              backgroundColor="warningBg"
              padding="s20"
              borderRadius="s16"
              mb="s24">
              <Box flexDirection="row" alignItems="center" mb="s12">
                <Icon name="notification-important" size={32} color="warning" />
                <Text preset="headingMedium" color="warning" bold ml="s12">
                  SOS Ativo
                </Text>
              </Box>
              <Text preset="paragraphMedium" color="warning">
                Seu alerta de emergência está ativo. As autoridades foram
                notificadas.
              </Text>
            </Box>

            {/* Tipo de emergência */}
            <Box mb="s24">
              <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                Tipo de Emergência
              </Text>
              <Box
                style={{backgroundColor: config.bgColor}}
                padding="s16"
                borderRadius="s12"
                flexDirection="row"
                alignItems="center">
                <Icon name={config.icon as any} size={28} color={config.color as any} />
                <Box ml="s12" flex={1}>
                  <Text preset="paragraphMedium" bold style={{color: config.color}}>
                    {config.label}
                  </Text>
                  <Text
                    preset="paragraphCaptionSmall"
                    mt="s4"
                    style={{color: config.color}}>
                    Prioridade: {config.priority.toUpperCase()}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Localização */}
            <Box mb="s24">
              <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                Localização
              </Text>
              <Box
                backgroundColor="surface"
                padding="s16"
                borderRadius="s12"
                flexDirection="row"
                alignItems="center">
                <Icon name="location-on" size={24} color="primary" />
                <Box ml="s12" flex={1}>
                  <Text preset="paragraphMedium" color="text">
                    Lat: {activeAlert.location?.latitude != null
                      ? Number(activeAlert.location.latitude).toFixed(6)
                      : 'N/A'}
                  </Text>
                  <Text preset="paragraphMedium" color="text">
                    Lng: {activeAlert.location?.longitude != null
                      ? Number(activeAlert.location.longitude).toFixed(6)
                      : 'N/A'}
                  </Text>
                  {activeAlert.location?.accuracy != null && (
                    <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                      Precisão: {Number(activeAlert.location.accuracy).toFixed(0)}m
                    </Text>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Descrição */}
            {activeAlert.description && (
              <Box mb="s24">
                <Text preset="paragraphSmall" color="textSecondary" mb="s12">
                  Descrição
                </Text>
                <Box
                  backgroundColor="surface"
                  padding="s16"
                  borderRadius="s12">
                  <Text preset="paragraphMedium" color="text">
                    {activeAlert.description}
                  </Text>
                </Box>
              </Box>
            )}

            {/* Botão Cancelar */}
            <Button
              title="Cancelar Alerta SOS"
              preset="outline"
              onPress={handleCancelAlert}
              loading={isLoading}
            />
          </Box>
        </ScrollView>

        <ConfirmationModal
          visible={showCancelSosModal}
          title="Cancelar SOS"
          message="Tem certeza que deseja cancelar o alerta de emergência?"
          icon="warning"
          iconColor="warning"
          confirmText="Sim, Cancelar"
          cancelText="Não"
          onConfirm={handleConfirmCancelSos}
          onCancel={() => setShowCancelSosModal(false)}
        />
      </Box>
    );
  }

  // Se não tem alerta ativo, mostrar formulário de criação
  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Box flex={1} backgroundColor="background">
        {/* Header com botão voltar */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s20"
          paddingBottom="s16"
          style={{
            paddingTop: top + 12,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            zIndex: 10,
          }}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s12"
              backgroundColor="background"
              alignItems="center"
              justifyContent="center"
              borderWidth={1}
              borderColor="border"
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('HomeTabs')}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold ml="s12">
              Acionar SOS
            </Text>
          </Box>
        </Box>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Box style={{padding: 20, paddingTop: 20}}>
            {/* Subtítulo */}
            <Box mb="s24">
              <Text preset="paragraphMedium" color="textSecondary">
                Selecione o tipo de emergência. Sua localização será compartilhada
                com as autoridades.
              </Text>
            </Box>

            {/* Tipos de Emergência */}
            <Box mb="s24">
              <Text preset="paragraphMedium" color="text" bold mb="s16">
                Tipo de Emergência
              </Text>

              {sosTypes.map(config => {
                const isSelected = selectedType === config.type;
                return (
                  <TouchableOpacityBox
                    key={config.type}
                    mb="s12"
                    borderRadius="s12"
                    padding="s16"
                    onPress={() => handleSelectType(config.type)}
                    style={{
                      backgroundColor: isSelected ? config.bgColor : theme.colors.surface,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? config.color : theme.colors.border,
                    }}>
                    <Box flexDirection="row" alignItems="center">
                      <Icon
                        name={config.icon as any}
                        size={28}
                        color={isSelected ? (config.color as any) : 'textSecondary'}
                      />
                      <Box ml="s12" flex={1}>
                        <Text
                          preset="paragraphMedium"
                          bold
                          color={isSelected ? undefined : 'text'}
                          style={isSelected ? {color: config.color} : undefined}>
                          {config.label}
                        </Text>
                        <Text
                          preset="paragraphCaptionSmall"
                          mt="s4"
                          color={isSelected ? undefined : 'textSecondary'}
                          style={isSelected ? {color: config.color} : undefined}>
                          {config.description}
                        </Text>
                      </Box>

                      {isSelected && (
                        <Icon
                          name="check-circle"
                          size={24}
                          color={config.color as any}
                        />
                      )}
                    </Box>
                  </TouchableOpacityBox>
                );
              })}
            </Box>

            {/* Descrição (opcional) */}
            <Box mb="s16">
              <Text preset="paragraphSmall" color="textSecondary" mb="s8">
                Descrição (opcional)
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva a situação..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Box>

            {/* Número de Contato (opcional) */}
            <Box mb="s24">
              <Text preset="paragraphSmall" color="textSecondary" mb="s8">
                Número de Contato (opcional)
              </Text>
              <TextInput
                value={contactNumber}
                onChangeText={text => setContactNumber(formatPhone(text))}
                placeholder="(00) 00000-0000"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </Box>

            {/* Botão Acionar SOS */}
            <Button
              title="ACIONAR SOS"
              preset="primary"
              onPress={handleCreateAlert}
              loading={isCreating}
              disabled={!selectedType || isCreating}
            />

            {/* Link para Contatos de Emergência */}
            <TouchableOpacityBox
              mt="s16"
              padding="s16"
              backgroundColor="surface"
              borderRadius="s12"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              onPress={() => navigation.navigate('EmergencyContacts')}>
              <Icon name="contact-phone" size={20} color="primary" />
              <Text preset="paragraphMedium" color="primary" ml="s8">
                Ver Contatos de Emergência
              </Text>
            </TouchableOpacityBox>
          </Box>
        </ScrollView>

        <ConfirmationModal
          visible={showConfirmSosModal}
          title="Confirmar Emergência"
          message="Você está prestes a acionar um alerta SOS. As autoridades serão notificadas da sua localização. Deseja continuar?"
          icon="sos"
          iconColor="danger"
          confirmText="Acionar SOS"
          cancelText="Cancelar"
          onConfirm={handleConfirmSos}
          onCancel={() => setShowConfirmSosModal(false)}
        />
      </Box>
    </KeyboardAvoidingView>
  );
}
