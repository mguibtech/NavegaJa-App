import React from 'react';
import {ScrollView, StyleSheet, Switch, useColorScheme} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '@shopify/restyle';

import {
  Box,
  ConfirmationModal,
  Icon,
  Text,
  TouchableOpacityBox,
  UserAvatar,
} from '@components';
import {Review} from '@domain';
import {useThemeStore} from '@store';
import {Theme} from '@theme';

import {MENU_GROUPS, MENU_ITEMS, useProfileScreen} from './useProfileScreen';

const WHITE_70 = 'rgba(255,255,255,0.7)';
const WHITE_50 = 'rgba(255,255,255,0.5)';
const WHITE_35 = 'rgba(255,255,255,0.35)';
const WHITE_20 = 'rgba(255,255,255,0.2)';
const WHITE_15 = 'rgba(255,255,255,0.15)';
const CAPTAIN_BADGE_BG = 'rgba(255,193,7,0.25)';
const CAPTAIN_BADGE_BORDER = 'rgba(255,193,7,0.5)';
const MANAGER_BADGE_BG = 'rgba(16,185,129,0.25)';
const MANAGER_BADGE_BORDER = 'rgba(16,185,129,0.5)';

const styles = StyleSheet.create({
  cameraBadge: {
    bottom: 0,
    right: 0,
    elevation: 3,
  },
  editButtonBackground: {
    backgroundColor: WHITE_15,
  },
  groupLabel: {
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  raisedCard: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuDivider: {
    borderTopWidth: 1,
  },
  smallMarginLeft: {
    marginLeft: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsStrip: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  userAvatarRing: {
    borderColor: WHITE_50,
    padding: 2,
  },
  userMetaText: {
    color: WHITE_70,
  },
});

export function ProfileScreen() {
  const {top} = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const {themeMode, setThemeMode} = useThemeStore();
  const {colors} = useTheme<Theme>();
  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');
  const {
    navigation,
    user,
    showLogoutModal,
    setShowLogoutModal,
    isCaptain,
    isBoatManager,
    ratingDisplay,
    receivedReviews,
    phoneDisplay,
    confirmLogout,
    handleMenuPress,
  } = useProfileScreen();

  const headerStyle = [{paddingTop: top + 12}];
  const badgeStyle = [
    isCaptain
      ? {backgroundColor: CAPTAIN_BADGE_BG, borderColor: CAPTAIN_BADGE_BORDER}
      : isBoatManager
      ? {backgroundColor: MANAGER_BADGE_BG, borderColor: MANAGER_BADGE_BORDER}
      : {backgroundColor: WHITE_20, borderColor: WHITE_35},
  ];

  const badgeLabel = isCaptain
    ? 'Barqueiro'
    : isBoatManager
    ? 'Gestor'
    : 'Passageiro';

  const stats = [
    {
      icon: 'confirmation-number',
      label: 'Viagens',
      value: String(user?.totalTrips ?? 0),
      color: '#0B5D8A',
      onPress: () =>
        (isCaptain || isBoatManager)
          ? navigation.navigate('CaptainMyTrips')
          : (navigation as any).navigate('Bookings'),
    },
    {
      icon: 'star',
      label: 'Avaliacao',
      value: String(ratingDisplay),
      color: '#F59E0B',
      onPress: () => navigation.navigate('MyReviews'),
    },
    {
      icon: 'military-tech',
      label: 'Nivel',
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
  ] as const;

  return (
    <Box flex={1} backgroundColor="background">
      <Box
        paddingHorizontal="s24"
        paddingBottom="s28"
        backgroundColor="primary"
        style={headerStyle}>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s20">
          <Text preset="headingSmall" color="surface" bold>
            Meu Perfil
          </Text>
          <TouchableOpacityBox
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Editar perfil"
            accessibilityRole="button"
            borderRadius="s8"
            px="s12"
            py="s4"
            flexDirection="row"
            alignItems="center"
            style={styles.editButtonBackground}>
            <Icon name="edit" size={14} color="surface" />
            <Text preset="paragraphSmall" color="surface" ml="s4" bold>
              Editar
            </Text>
          </TouchableOpacityBox>
        </Box>

        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityLabel="Alterar foto do perfil"
            accessibilityRole="button"
            mr="s16">
            <Box borderRadius="s48" borderWidth={3} style={styles.userAvatarRing}>
              <UserAvatar
                userId={user?.id}
                avatarUrl={user?.avatarUrl}
                name={user?.name}
                gender={user?.gender}
                size="lg"
              />
            </Box>
            <Box
              position="absolute"
              width={24}
              height={24}
              borderRadius="s24"
              backgroundColor="surface"
              alignItems="center"
              justifyContent="center"
              style={styles.cameraBadge}>
              <Icon name="photo-camera" size={13} color="primary" />
            </Box>
          </TouchableOpacityBox>

          <Box flex={1}>
            <Text preset="headingSmall" color="surface" bold numberOfLines={1}>
              {user?.name}
            </Text>
            <Text preset="paragraphSmall" mt="s4" style={styles.userMetaText}>
              {phoneDisplay}
            </Text>
            {!!user?.email && (
              <Text
                preset="paragraphSmall"
                mt="s4"
                numberOfLines={1}
                style={styles.userMetaText}>
                {user.email}
              </Text>
            )}
            {!!user?.city && (
              <Box flexDirection="row" alignItems="center" mt="s4">
                <Icon name="location-on" size={12} color="surface" />
                <Text
                  preset="paragraphSmall"
                  style={[styles.userMetaText, styles.smallMarginLeft]}>
                  {user.city}
                  {user.state ? `, ${user.state}` : ''}
                </Text>
              </Box>
            )}
            <Box
              mt="s8"
              alignSelf="flex-start"
              borderRadius="s8"
              px="s8"
              py="s4"
              borderWidth={1}
              style={badgeStyle}>
              <Text preset="paragraphSmall" color="surface" bold>
                {badgeLabel}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box backgroundColor="surface" flexDirection="row" style={styles.statsStrip}>
        {stats.map((stat, index) => (
          <TouchableOpacityBox
            key={stat.label}
            flex={1}
            alignItems="center"
            paddingVertical="s14"
            onPress={stat.onPress}
            accessibilityLabel={`${stat.label}: ${stat.value}. Toque para ver detalhes`}
            accessibilityRole="button"
            style={[
              index < stats.length - 1
                ? [{borderRightWidth: 1, borderRightColor: colors.border}]
                : null,
            ]}>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {MENU_GROUPS.map(group => {
          const items = MENU_ITEMS.filter(item => group.items.includes(item.id));

          return (
            <Box key={group.title} mb="s20">
              <Text
                preset="paragraphSmall"
                bold
                color="textSecondary"
                style={styles.groupLabel}>
                {group.title}
              </Text>
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                overflow="hidden"
                style={styles.raisedCard}>
                {items.map((item, index) => (
                  <TouchableOpacityBox
                    key={item.id}
                    flexDirection="row"
                    alignItems="center"
                    paddingHorizontal="s16"
                    paddingVertical="s14"
                    onPress={() => handleMenuPress(item.id)}
                    accessibilityLabel={`${item.title}. ${item.subtitle}`}
                    accessibilityRole="button"
                    style={[
                      index > 0
                        ? [styles.menuDivider, {borderTopColor: colors.border}]
                        : null,
                    ]}>
                    <Box
                      width={38}
                      height={38}
                      borderRadius="s8"
                      backgroundColor={
                        item.color === 'primary' ? 'primaryBg' : 'secondaryBg'
                      }
                      alignItems="center"
                      justifyContent="center"
                      mr="s14">
                      <Icon name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Box flex={1}>
                      <Text preset="paragraphMedium" color="text" bold>
                        {item.title}
                      </Text>
                      <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                        {item.subtitle}
                      </Text>
                    </Box>
                    <Icon name="chevron-right" size={20} color="border" />
                  </TouchableOpacityBox>
                ))}
              </Box>
            </Box>
          );
        })}

        <Box mb="s20">
          <Text
            preset="paragraphSmall"
            bold
            color="textSecondary"
            style={styles.groupLabel}>
            Aparencia
          </Text>
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            overflow="hidden"
            style={styles.raisedCard}>
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
                <Icon
                  name={isDark ? 'dark-mode' : 'light-mode'}
                  size={20}
                  color="primary"
                />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold>
                  Tema Escuro
                </Text>
                <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                  {themeMode === 'system'
                    ? 'Seguindo o sistema'
                    : isDark
                    ? 'Ativado manualmente'
                    : 'Desativado manualmente'}
                </Text>
              </Box>
              <Switch
                value={isDark}
                onValueChange={value => setThemeMode(value ? 'dark' : 'light')}
                trackColor={{false: '#E2E8ED', true: '#0B5D8A'}}
                thumbColor="#ffffff"
              />
            </Box>
          </Box>
        </Box>

        {receivedReviews.length > 0 && (
          <Box mb="s20">
            <Text
              preset="paragraphSmall"
              bold
              color="textSecondary"
              style={styles.groupLabel}>
              Avaliacoes Recebidas
            </Text>
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s16"
              style={styles.raisedCard}>
              {receivedReviews.slice(0, 5).map((review: Review, index: number) => {
                const rating = review.captainRating ?? review.passengerRating ?? 0;
                const comment = review.captainComment ?? review.passengerComment;
                const reviewerName =
                  review.reviewer?.name?.split(' ')[0] ?? 'Usuario';
                const dateStr = new Date(review.createdAt).toLocaleDateString(
                  'pt-BR',
                  {day: '2-digit', month: 'short'},
                );

                return (
                  <Box
                    key={review.id}
                    style={
                      index > 0
                        ? [styles.menuDivider, {borderTopColor: colors.border}]
                        : undefined
                    }
                    pt={index > 0 ? 's12' : undefined}
                    mt={index > 0 ? 's12' : undefined}>
                    <Box
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      mb="s4">
                      <Box flexDirection="row" alignItems="center">
                        <UserAvatar
                          userId={review.reviewer?.id}
                          name={review.reviewer?.name}
                          size="xs"
                        />
                        <Text preset="paragraphSmall" color="text" bold ml="s8">
                          {reviewerName}
                        </Text>
                      </Box>
                      <Box flexDirection="row" alignItems="center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Icon
                            key={star}
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={12}
                            color={star <= rating ? 'warning' : 'border'}
                          />
                        ))}
                        <Text
                          preset="paragraphCaptionSmall"
                          color="textSecondary"
                          style={styles.smallMarginLeft}>
                          {dateStr}
                        </Text>
                      </Box>
                    </Box>
                    {comment ? (
                      <Text preset="paragraphSmall" color="textSecondary" numberOfLines={2}>
                        "{comment}"
                      </Text>
                    ) : null}
                  </Box>
                );
              })}
              {receivedReviews.length > 5 && (
                <Text preset="paragraphSmall" color="primary" textAlign="center" mt="s12">
                  + {receivedReviews.length - 5} avaliacoes anteriores
                </Text>
              )}
            </Box>
          </Box>
        )}

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
          <Text preset="paragraphMedium" color="danger" bold ml="s8">
            Sair da Conta
          </Text>
        </TouchableOpacityBox>

        <Text preset="paragraphSmall" color="textSecondary" textAlign="center">
          NavegaJa v1.0.0
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
        confirmPreset="primary"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </Box>
  );
}
