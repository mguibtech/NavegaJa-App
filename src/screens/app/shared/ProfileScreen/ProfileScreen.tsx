import React from 'react';
import {ScrollView, Switch, useColorScheme} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@shopify/restyle';

import {Box, Icon, Text, TouchableOpacityBox, ConfirmationModal, UserAvatar} from '@components';
import {Review} from '@domain';
import {useThemeStore} from '@store';
import {Theme} from '@theme';

import {useProfileScreen, MENU_ITEMS, MENU_GROUPS} from './useProfileScreen';

export function ProfileScreen() {
  const {top} = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const {themeMode, setThemeMode} = useThemeStore();
  const {colors} = useTheme<Theme>();
  const isDark = themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');
  const {
    navigation,
    user,
    showLogoutModal,
    setShowLogoutModal,
    isCaptain,
    ratingDisplay,
    receivedReviews,
    phoneDisplay,
    confirmLogout,
    handleMenuPress,
  } = useProfileScreen();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Hero Header — fundo azul primário */}
      <Box
        paddingHorizontal="s24"
        paddingBottom="s28"
        style={{paddingTop: top + 12, backgroundColor: '#0B5D8A'}}>
        {/* Top row */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s20">
          <Text preset="headingSmall" style={{color: '#fff'}} bold>
            Meu Perfil
          </Text>
          <TouchableOpacityBox
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            style={{
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Icon name="edit" size={14} color="surface" />
            <Text preset="paragraphSmall" style={{color: '#fff', marginLeft: 4}} bold>
              Editar
            </Text>
          </TouchableOpacityBox>
        </Box>

        {/* Avatar + Info */}
        <Box flexDirection="row" alignItems="center">
          {/* Avatar com anel branco e badge de câmera */}
          <TouchableOpacityBox
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Alterar foto do perfil"
            accessibilityRole="button"
            style={{marginRight: 16}}>
            <Box
              style={{
                borderRadius: 50,
                borderWidth: 3,
                borderColor: 'rgba(255,255,255,0.5)',
                padding: 2,
              }}>
              <UserAvatar
                userId={user?.id}
                avatarUrl={user?.avatarUrl}
                name={user?.name}
                size="lg"
              />
            </Box>
            <Box
              position="absolute"
              style={{
                bottom: 0, right: 0,
                backgroundColor: '#fff',
                borderRadius: 12,
                width: 24, height: 24,
                alignItems: 'center', justifyContent: 'center',
                elevation: 3,
              }}>
              <Icon name="photo-camera" size={13} color="primary" />
            </Box>
          </TouchableOpacityBox>

          {/* Dados do usuário */}
          <Box flex={1}>
            <Text preset="headingSmall" bold numberOfLines={1} style={{color: '#fff'}}>
              {user?.name}
            </Text>
            <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}} mt="s4">
              {phoneDisplay}
            </Text>
            {!!user?.email && (
              <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)'}} mt="s4" numberOfLines={1}>
                {user.email}
              </Text>
            )}
            {!!user?.city && (
              <Box flexDirection="row" alignItems="center" mt="s4">
                <Icon name="location-on" size={12} color="surface" />
                <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.7)', marginLeft: 2}}>
                                    {user.city}{user.state ? `, ${user.state}` : ''}
                </Text>
              </Box>
            )}
            <Box
              mt="s8"
              alignSelf="flex-start"
              style={{
                backgroundColor: isCaptain ? 'rgba(255,193,7,0.25)' : 'rgba(255,255,255,0.2)',
                borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                borderWidth: 1,
                borderColor: isCaptain ? 'rgba(255,193,7,0.5)' : 'rgba(255,255,255,0.35)',
              }}>
              <Text preset="paragraphSmall" bold style={{color: '#fff'}}>
                {isCaptain ? '⚓ Barqueiro' : '👤 Passageiro'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats strip */}
      <Box
        backgroundColor="surface"
        flexDirection="row"
        style={{
          shadowColor: '#000', shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
        }}>
        {([
          {
            icon: 'confirmation-number',
            label: 'Viagens',
            value: String(user?.totalTrips ?? 0),
            color: '#0B5D8A',
            onPress: () => isCaptain ? navigation.navigate('CaptainMyTrips') : (navigation as any).navigate('Bookings'),
          },
          {
            icon: 'star',
            label: 'Avaliação',
            value: String(ratingDisplay),
            color: '#F59E0B',
            onPress: () => navigation.navigate('MyReviews'),
          },
          {
            icon: 'military-tech',
            label: 'Nível',
            value: user?.level || 'Marujo',
            color: '#6366F1',
            onPress: () => navigation.navigate('Gamification'),
          },
          {
            icon: 'stars',
            label: 'Pontos',
            value: String(user?.totalPoints ?? 0),
            color: '#10B981',
            onPress: () => navigation.navigate('Gamification'),
          },
        ] as const).map((stat, i) => (
          <TouchableOpacityBox
            key={stat.label}
            flex={1}
            alignItems="center"
            paddingVertical="s14"
            onPress={stat.onPress}
            accessibilityLabel={`${stat.label}: ${stat.value}. Toque para ver detalhes`}
            accessibilityRole="button"
            style={{borderRightWidth: i < 3 ? 1 : 0, borderRightColor: colors.border}}>
            <Icon name={stat.icon as any} size={18} color={stat.color as any} />
            <Text preset="paragraphSmall" bold mt="s4" color="text" numberOfLines={1}>
              {stat.value}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              {stat.label}
            </Text>
          </TouchableOpacityBox>
        ))}
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 40}} showsVerticalScrollIndicator={false}>

        {/* Menu agrupado */}
        {MENU_GROUPS.map(group => {
          const items = MENU_ITEMS.filter(i => group.items.includes(i.id));
          return (
            <Box key={group.title} mb="s20">
              <Text
                preset="paragraphSmall"
                bold
                color="textSecondary" style={{letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8}}>
                {group.title}
              </Text>
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                overflow="hidden"
                style={{
                  shadowColor: '#000', shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
                }}>
                {items.map((item, idx) => (
                  <TouchableOpacityBox
                    key={item.id}
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal="s16"
                    paddingVertical="s14"
                    onPress={() => handleMenuPress(item.id)}
                    accessibilityLabel={`${item.title}. ${item.subtitle}`}
                    accessibilityRole="button"
                    style={{borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: colors.border}}>
                    <Box
                      width={38}
                      height={38}
                      borderRadius="s8"
                      backgroundColor={item.color === 'primary' ? 'primaryBg' : 'secondaryBg'}
                      alignItems="center"
                      justifyContent="center"
                      mr="s14">
                      <Icon name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphMedium" color="text" bold>{item.title}</Text>
                      <Text preset="paragraphSmall" color="textSecondary" mt="s4">{item.subtitle}</Text>
                    </Box>
                    <Icon name="chevron-right" size={20} color="border" />
                  </TouchableOpacityBox>
                ))}
              </Box>
            </Box>
          );
        })}

        {/* Aparência */}
        <Box mb="s20">
          <Text
            preset="paragraphSmall"
            bold
            color="textSecondary" style={{letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8}}>
            Aparência
          </Text>
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            overflow="hidden"
            style={{
              shadowColor: '#000', shadowOffset: {width: 0, height: 1},
              shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
            }}>
            <Box
              flexDirection="row"
              alignItems="center"
              paddingHorizontal="s16"
              paddingVertical="s14">
              <Box
                width={38}
                height={38}
                borderRadius="s8"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                mr="s14">
                <Icon name={isDark ? 'dark-mode' : 'light-mode'} size={20} color="primary" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold>Tema Escuro</Text>
                <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                  {themeMode === 'system'
                    ? 'Seguindo o sistema'
                    : isDark ? 'Ativado manualmente' : 'Desativado manualmente'}
                </Text>
              </Box>
              <Switch
                value={isDark}
                onValueChange={val => setThemeMode(val ? 'dark' : 'system')}
                trackColor={{false: '#E2E8ED', true: '#0B5D8A'}}
                thumbColor="#ffffff"
              />
            </Box>
          </Box>
        </Box>

        {/* Avaliações Recebidas */}
        {receivedReviews.length > 0 && (
          <Box mb="s20">
            <Text
              preset="paragraphSmall"
              bold
              color="textSecondary" style={{letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8}}>
              Avaliações Recebidas
            </Text>
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              style={{
                shadowColor: '#000', shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
              }}>
              {receivedReviews.slice(0, 5).map((review: Review, idx: number) => {
                const rating = review.captainRating ?? review.passengerRating ?? 0;
                const comment = review.captainComment ?? review.passengerComment;
                const reviewerName = review.reviewer?.name?.split(' ')[0] ?? 'Usuário';
                const dateStr = new Date(review.createdAt).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'});
                return (
                  <Box
                    key={review.id}
                    style={{borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: colors.border}}
                    pt={idx > 0 ? 's12' : undefined}
                    mt={idx > 0 ? 's12' : undefined}>
                    <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s4">
                      <Box flexDirection="row" alignItems="center">
                        <UserAvatar userId={review.reviewer?.id} name={review.reviewer?.name} size="xs" />
                        <Text preset="paragraphSmall" color="text" bold ml="s8">{reviewerName}</Text>
                      </Box>
                      <Box flexDirection="row" alignItems="center">
                        {[1,2,3,4,5].map(s => (
                          <Icon key={s} name={s <= rating ? 'star' : 'star-outline'} size={12} color={s <= rating ? 'warning' : 'border'} />
                        ))}
                        <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">{dateStr}</Text>
                      </Box>
                    </Box>
                    {comment ? (
                      <Text preset="paragraphSmall" color="textSecondary" numberOfLines={2}>"{comment}"</Text>
                    ) : null}
                  </Box>
                );
              })}
              {receivedReviews.length > 5 && (
                <Text preset="paragraphSmall" color="primary" textAlign="center" mt="s12">
                  + {receivedReviews.length - 5} avaliações anteriores
                </Text>
              )}
            </Box>
          </Box>
        )}

        {/* Sair */}
        <TouchableOpacityBox
          backgroundColor="dangerBg"
          borderRadius="s12"
          padding="s16"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          onPress={() => setShowLogoutModal(true)}
          accessibilityLabel="Sair da conta"
          accessibilityRole="button"
          mb="s16">
          <Icon name="logout" size={20} color="danger" />
          <Text preset="paragraphMedium" color="danger" bold ml="s8">Sair da Conta</Text>
        </TouchableOpacityBox>

        <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
          NavegaJá v1.0.0
        </Text>
      </ScrollView>

      <ConfirmationModal
        visible={showLogoutModal}
        title="Sair da Conta"
        message="Tem certeza que deseja sair da sua conta?"
        icon="logout"
        iconColor="danger"
        confirmText="Sair"
        cancelText="Cancelar"
        confirmPreset="outline"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </Box>
  );
}
