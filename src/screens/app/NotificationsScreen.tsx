import React, {useState, useEffect} from 'react';
import {ScrollView, Switch, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox, InfoModal} from '@components';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Notifications'>;

const STORAGE_KEY = '@navegaja:notifications';

interface NotificationSettings {
  pushEnabled: boolean;
  bookings: boolean;
  shipments: boolean;
  promotions: boolean;
  news: boolean;
  whatsapp: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  bookings: true,
  shipments: true,
  promotions: true,
  news: false,
  whatsapp: true,
};

export function NotificationsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [_isLoading, setIsLoading] = useState(true);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSettings(newSettings: NotificationSettings) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      setShowSavedModal(true);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.showError('Não foi possível salvar as configurações');
    }
  }

  function toggleSetting(key: keyof NotificationSettings) {
    const newSettings = {...settings, [key]: !settings[key]};

    // Se desabilitar push, desabilitar todas as categorias
    if (key === 'pushEnabled' && !newSettings.pushEnabled) {
      newSettings.bookings = false;
      newSettings.shipments = false;
      newSettings.promotions = false;
      newSettings.news = false;
    }

    saveSettings(newSettings);
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          alignItems="center"
          justifyContent="center"
          onPress={() => navigation.goBack()}
          mr="s12">
          <Icon name="arrow-back" size={24} color="text" />
        </TouchableOpacityBox>
        <Text preset="headingSmall" color="text" bold>
          Notificações
        </Text>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          mb="s24"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s8">
                <Box
                  width={40}
                  height={40}
                  borderRadius="s20"
                  backgroundColor="primaryBg"
                  alignItems="center"
                  justifyContent="center"
                  mr="s12">
                  <Icon name="notifications-active" size={24} color="primary" />
                </Box>
                <Text preset="paragraphLarge" color="text" bold>
                  Notificações Push
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Receba alertas importantes no seu dispositivo
              </Text>
            </Box>
            <Switch
              value={settings.pushEnabled}
              onValueChange={() => toggleSetting('pushEnabled')}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.pushEnabled ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* Categories */}
        <Text preset="paragraphMedium" color="text" bold mb="s16">
          Categorias
        </Text>

        {/* Bookings */}
        <Box
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          mb="s12"
          opacity={settings.pushEnabled ? 1 : 0.5}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s4">
                <Icon name="confirmation-number" size={20} color="primary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Minhas Viagens
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Atualizações sobre reservas e embarques
              </Text>
            </Box>
            <Switch
              value={settings.bookings}
              onValueChange={() => toggleSetting('bookings')}
              disabled={!settings.pushEnabled}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.bookings ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* Shipments */}
        <Box
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          mb="s12"
          opacity={settings.pushEnabled ? 1 : 0.5}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s4">
                <Icon name="local-shipping" size={20} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Encomendas
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Status de rastreamento e entregas
              </Text>
            </Box>
            <Switch
              value={settings.shipments}
              onValueChange={() => toggleSetting('shipments')}
              disabled={!settings.pushEnabled}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.shipments ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* Promotions */}
        <Box
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          mb="s12"
          opacity={settings.pushEnabled ? 1 : 0.5}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s4">
                <Icon name="local-offer" size={20} color="warning" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Promoções
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Ofertas especiais e cupons de desconto
              </Text>
            </Box>
            <Switch
              value={settings.promotions}
              onValueChange={() => toggleSetting('promotions')}
              disabled={!settings.pushEnabled}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.promotions ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* News */}
        <Box
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          opacity={settings.pushEnabled ? 1 : 0.5}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s4">
                <Icon name="campaign" size={20} color="info" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  Novidades
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Novos recursos e melhorias do app
              </Text>
            </Box>
            <Switch
              value={settings.news}
              onValueChange={() => toggleSetting('news')}
              disabled={!settings.pushEnabled}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.news ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* WhatsApp */}
        <Text preset="paragraphMedium" color="text" bold mb="s16">
          Outros Canais
        </Text>

        <Box
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s16">
              <Box flexDirection="row" alignItems="center" mb="s4">
                <Icon name="whatsapp" size={20} color="success" />
                <Text preset="paragraphMedium" color="text" bold ml="s8">
                  WhatsApp
                </Text>
              </Box>
              <Text preset="paragraphSmall" color="textSecondary">
                Atualizações importantes via WhatsApp
              </Text>
            </Box>
            <Switch
              value={settings.whatsapp}
              onValueChange={() => toggleSetting('whatsapp')}
              trackColor={{false: '#E0E0E0', true: '#A3D5FF'}}
              thumbColor={settings.whatsapp ? '#0E7AFE' : '#f4f3f4'}
              ios_backgroundColor="#E0E0E0"
            />
          </Box>
        </Box>

        {/* Info */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3',
          }}>
          <Box flexDirection="row" alignItems="flex-start">
            <Icon name="info" size={20} color="info" />
            <Text preset="paragraphSmall" color="info" ml="s8" flex={1}>
              Suas preferências são salvas automaticamente. Você pode alterá-las a qualquer
              momento.
            </Text>
          </Box>
        </Box>
      </ScrollView>

      {/* Saved Modal */}
      <InfoModal
        visible={showSavedModal}
        title="Configurações Salvas"
        message="Suas preferências de notificação foram atualizadas com sucesso!"
        icon="check-circle"
        iconColor="success"
        buttonText="Entendi"
        onClose={() => setShowSavedModal(false)}
      />
    </Box>
  );
}
