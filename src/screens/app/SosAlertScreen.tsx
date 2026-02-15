import React, {useState, useEffect} from 'react';
import {ScrollView, Alert, ActivityIndicator} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  Box,
  Button,
  Icon,
  Text,
  TouchableOpacityBox,
  TextInput,
} from '@components';
import {
  useSosAlert,
  SosType,
  SOS_TYPE_CONFIGS,
  SosTypeConfig,
} from '@domain';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'SosAlert'>;

export function SosAlertScreen({navigation, route}: Props) {
  const {tripId} = route.params || {};
  const {createAlert, cancelAlert, checkActiveAlert, activeAlert, isLoading} =
    useSosAlert();
  const toast = useToast();

  const [selectedType, setSelectedType] = useState<SosType | null>(null);
  const [description, setDescription] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    checkActiveAlert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectType = (type: SosType) => {
    if (activeAlert) {
      toast.showError('Você já possui um alerta SOS ativo');
      return;
    }
    setSelectedType(type);
  };

  const handleCreateAlert = async () => {
    if (!selectedType) {
      toast.showError('Selecione o tipo de emergência');
      return;
    }

    Alert.alert(
      'Confirmar Emergência',
      'Você está prestes a acionar um alerta SOS. As autoridades serão notificadas da sua localização. Deseja continuar?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Acionar SOS',
          style: 'destructive',
          onPress: async () => {
            setIsCreating(true);

            try {
              const alert = await createAlert(selectedType, {
                tripId,
                description: description.trim() || undefined,
                contactNumber: contactNumber.trim() || undefined,
              });

              toast.showSuccess(
                `SOS acionado com sucesso! Código: ${alert.id.slice(0, 8).toUpperCase()}`,
              );

              // Resetar formulário
              setSelectedType(null);
              setDescription('');
              setContactNumber('');

              // Navegar para tela de emergência ativa (opcional)
              // navigation.replace('ActiveSos', {alertId: alert.id});
            } catch (error: any) {
              toast.showError(
                error?.message || 'Não foi possível acionar SOS. Tente novamente.',
              );
            } finally {
              setIsCreating(false);
            }
          },
        },
      ],
    );
  };

  const handleCancelAlert = async () => {
    if (!activeAlert) return;

    Alert.alert(
      'Cancelar SOS',
      'Tem certeza que deseja cancelar o alerta de emergência?',
      [
        {text: 'Não', style: 'cancel'},
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAlert(activeAlert.id);
              toast.showSuccess('Alerta SOS cancelado com sucesso');
            } catch (error: any) {
              toast.showError(
                error?.message || 'Não foi possível cancelar o SOS.',
              );
            }
          },
        },
      ],
    );
  };

  const sosTypes: SosTypeConfig[] = Object.values(SOS_TYPE_CONFIGS);

  if (isLoading) {
    return (
      <Box
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="background">
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box padding="s20">
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
                backgroundColor={config.bgColor as any}
                padding="s16"
                borderRadius="s12"
                flexDirection="row"
                alignItems="center">
                <Icon name={config.icon as any} size={28} color={config.color as any} />
                <Box ml="s12" flex={1}>
                  <Text preset="paragraphMedium" color={config.color as any} bold>
                    {config.label}
                  </Text>
                  <Text
                    preset="paragraphCaptionSmall"
                    color={config.color as any}
                    mt="s4">
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
                    Lat: {activeAlert.location.latitude.toFixed(6)}
                  </Text>
                  <Text preset="paragraphMedium" color="text">
                    Lng: {activeAlert.location.longitude.toFixed(6)}
                  </Text>
                  {activeAlert.location.accuracy && (
                    <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                      Precisão: {activeAlert.location.accuracy.toFixed(0)}m
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
      </Box>
    );
  }

  // Se não tem alerta ativo, mostrar formulário de criação
  return (
    <Box flex={1} backgroundColor="background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box padding="s20">
          {/* Header */}
          <Box mb="s24">
            <Text preset="headingMedium" color="text" bold mb="s8">
              Acionar SOS
            </Text>
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

            {sosTypes.map(config => (
              <TouchableOpacityBox
                key={config.type}
                mb="s12"
                backgroundColor={
                  selectedType === config.type ? config.bgColor : 'surface'
                }
                borderRadius="s12"
                padding="s16"
                onPress={() => handleSelectType(config.type)}
                borderWidth={selectedType === config.type ? 2 : 1}
                borderColor={
                  selectedType === config.type ? config.color : 'border'
                }>
                <Box flexDirection="row" alignItems="center">
                  <Icon
                    name={config.icon as any}
                    size={28}
                    color={
                      selectedType === config.type
                        ? (config.color as any)
                        : 'textSecondary'
                    }
                  />
                  <Box ml="s12" flex={1}>
                    <Text
                      preset="paragraphMedium"
                      color={
                        selectedType === config.type
                          ? (config.color as any)
                          : 'text'
                      }
                      bold>
                      {config.label}
                    </Text>
                    <Text
                      preset="paragraphCaptionSmall"
                      color={
                        selectedType === config.type
                          ? (config.color as any)
                          : 'textSecondary'
                      }
                      mt="s4">
                      {config.description}
                    </Text>
                  </Box>

                  {selectedType === config.type && (
                    <Icon
                      name="check-circle"
                      size={24}
                      color={config.color as any}
                    />
                  )}
                </Box>
              </TouchableOpacityBox>
            ))}
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
              onChangeText={setContactNumber}
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
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
    </Box>
  );
}
