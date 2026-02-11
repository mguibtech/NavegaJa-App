import React from 'react';
import {Alert, ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {useAuthStore} from '../../store/auth.store';
import {formatPhone} from '@utils';

import {AppStackParamList} from '../../routes/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'HomeTabs'>;

const MENU_ITEMS = [
  {
    id: 'edit-profile',
    icon: 'edit',
    title: 'Editar Perfil',
    subtitle: 'Atualize suas informações',
    color: 'primary' as const,
  },
  {
    id: 'payment',
    icon: 'credit-card',
    title: 'Formas de Pagamento',
    subtitle: 'Gerencie seus cartões',
    color: 'secondary' as const,
  },
  {
    id: 'notifications',
    icon: 'notifications',
    title: 'Notificações',
    subtitle: 'Preferências de notificação',
    color: 'primary' as const,
  },
  {
    id: 'help',
    icon: 'help',
    title: 'Ajuda e Suporte',
    subtitle: 'Tire suas dúvidas',
    color: 'secondary' as const,
  },
  {
    id: 'terms',
    icon: 'description',
    title: 'Termos de Uso',
    subtitle: 'Leia nossos termos',
    color: 'primary' as const,
  },
  {
    id: 'privacy',
    icon: 'lock',
    title: 'Política de Privacidade',
    subtitle: 'Entenda como usamos seus dados',
    color: 'secondary' as const,
  },
];

export function ProfileScreen({navigation}: Props) {
  const {user, logout} = useAuthStore();

  function handleLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Sair',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  }

  function handleMenuPress(itemId: string) {
    // TODO: Navigate to respective screens
    console.log('Menu item pressed:', itemId);
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingTop="s56"
        paddingBottom="s24"
        backgroundColor="primary">
        <Text preset="headingLarge" color="surface" bold>
          Meu Perfil
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 24}} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <Box
          backgroundColor="surface"
          borderRadius="s20"
          padding="s24"
          mb="s24"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Box alignItems="center">
            {/* Avatar */}
            <Box
              width={96}
              height={96}
              borderRadius="s48"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mb="s16"
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Icon name="person" size={48} color="primary" />
            </Box>

            {/* User Info */}
            <Text preset="headingMedium" color="text" bold mb="s4">
              {user?.name}
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" mb="s8">
              {user?.phone ? formatPhone(user.phone) : ''}
            </Text>

            {/* Role Badge */}
            <Box
              backgroundColor={user?.role === 'passenger' ? 'primaryBg' : 'secondaryBg'}
              paddingHorizontal="s20"
              paddingVertical="s8"
              borderRadius="s12">
              <Text
                preset="paragraphMedium"
                color={user?.role === 'passenger' ? 'primary' : 'secondary'}
                bold>
                {user?.role === 'passenger' ? '👤 Passageiro' : '⚓ Barqueiro'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Box flexDirection="row" gap="s12" mb="s24">
          <Box
            flex={1}
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Icon name="confirmation-number" size={32} color="primary" />
            <Text preset="headingMedium" color="text" bold mt="s8">
              8
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              Viagens
            </Text>
          </Box>

          <Box
            flex={1}
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
            <Icon name="star" size={32} color="warning" />
            <Text preset="headingMedium" color="text" bold mt="s8">
              4.8
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              Avaliação
            </Text>
          </Box>
        </Box>

        {/* Menu Items */}
        <Box mb="s24">
          {MENU_ITEMS.map(item => (
            <TouchableOpacityBox
              key={item.id}
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              mb="s12"
              onPress={() => handleMenuPress(item.id)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor={item.color === 'primary' ? 'primaryBg' : 'secondaryBg'}
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name={item.icon as any} size={24} color={item.color} />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  {item.title}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {item.subtitle}
                </Text>
              </Box>

              <Icon name="chevron-right" size={24} color="border" />
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Logout Button */}
        <TouchableOpacityBox
          backgroundColor="dangerBg"
          borderRadius="s12"
          padding="s20"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          onPress={handleLogout}
          mb="s24">
          <Icon name="logout" size={24} color="danger" />
          <Text preset="paragraphLarge" color="danger" bold ml="s12">
            Sair da Conta
          </Text>
        </TouchableOpacityBox>

        {/* App Version */}
        <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
          NavegaJá v1.0.0
        </Text>
      </ScrollView>
    </Box>
  );
}
