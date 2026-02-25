import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, ConfirmationModal, InfoModal, Icon, Text, TouchableOpacityBox} from '@components';
import {
  useMyFavorites,
  useToggleFavorite,
  Favorite,
  FavoriteType,
} from '@domain';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Favorites'>;

type TabType = 'all' | FavoriteType;

const TABS: {id: TabType; label: string}[] = [
  {id: 'all', label: 'Todos'},
  {id: FavoriteType.DESTINATION, label: 'Destinos'},
  {id: FavoriteType.BOAT, label: 'Barcos'},
  {id: FavoriteType.CAPTAIN, label: 'Capitães'},
];

export function FavoritesScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [favoriteToRemove, setFavoriteToRemove] = useState<Favorite | null>(null);
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);

  const {favorites, fetch, isLoading, error} = useMyFavorites(
    selectedTab === 'all' ? undefined : selectedTab,
  );
  const {toggle, isLoading: isToggling} = useToggleFavorite();

  useEffect(() => {
    loadData();
  }, [selectedTab]);

  async function loadData() {
    try {
      await fetch();
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }

  const onRefresh = async () => {
    await loadData();
  };

  const handleFavoritePress = (favorite: Favorite) => {
    if (favorite.type === FavoriteType.DESTINATION) {
      // Navega para busca com origem e destino
      navigation.navigate('SearchResults', {
        origin: favorite.origin || '',
        destination: favorite.destination || '',
      });
    } else if (favorite.type === FavoriteType.BOAT && favorite.boatId) {
      // TODO: Navegar para detalhes do barco quando tela existir
      setShowBoatModal(true);
    } else if (favorite.type === FavoriteType.CAPTAIN && favorite.captainId) {
      // TODO: Navegar para perfil do capitão quando tela existir
      setShowCaptainModal(true);
    }
  };

  const handleRemoveFavorite = (favorite: Favorite) => {
    setFavoriteToRemove(favorite);
  };

  const confirmRemove = async () => {
    if (!favoriteToRemove) return;
    try {
      const toggleData =
        favoriteToRemove.type === FavoriteType.DESTINATION
          ? {
              type: FavoriteType.DESTINATION,
              destination: favoriteToRemove.destination || '',
              origin: favoriteToRemove.origin || undefined,
            }
          : favoriteToRemove.type === FavoriteType.BOAT
          ? {type: FavoriteType.BOAT, boatId: favoriteToRemove.boatId || ''}
          : {type: FavoriteType.CAPTAIN, captainId: favoriteToRemove.captainId || ''};

      await toggle(toggleData);
      await fetch();
    } catch {
      console.log('Favorito removido localmente');
    } finally {
      setFavoriteToRemove(null);
    }
  };

  const renderFavorite = ({item}: {item: Favorite}) => {
    // Destination
    if (item.type === FavoriteType.DESTINATION) {
      return (
        <TouchableOpacityBox
          mb="s16"
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          onPress={() => handleFavoritePress(item)}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Box flex={1} flexDirection="row" alignItems="center">
              <Box
                width={52}
                height={52}
                borderRadius="s12"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="place" size={26} color="primary" />
              </Box>

              <Box flex={1} mr="s12">
                <Box flexDirection="row" alignItems="center" mb="s6">
                  <Text
                    preset="paragraphMedium"
                    color="text"
                    bold
                    numberOfLines={1}
                    flexShrink={1}>
                    {item.origin || 'Qualquer origem'}
                  </Text>
                  <Box mx="s8" flexShrink={0}>
                    <Icon name="arrow-forward" size={16} color="primary" />
                  </Box>
                  <Text
                    preset="paragraphMedium"
                    color="text"
                    bold
                    numberOfLines={1}
                    flexShrink={1}>
                    {item.destination}
                  </Text>
                </Box>

                <Box
                  backgroundColor="primaryBg"
                  paddingHorizontal="s10"
                  paddingVertical="s4"
                  borderRadius="s8"
                  alignSelf="flex-start">
                  <Text preset="paragraphCaptionSmall" color="primary" bold>
                    Destino
                  </Text>
                </Box>
              </Box>
            </Box>

            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor="dangerBg"
              alignItems="center"
              justifyContent="center"
              onPress={() => handleRemoveFavorite(item)}
              disabled={isToggling}>
              <Icon name="favorite" size={20} color="danger" />
            </TouchableOpacityBox>
          </Box>
        </TouchableOpacityBox>
      );
    }

    // Boat
    if (item.type === FavoriteType.BOAT) {
      return (
        <TouchableOpacityBox
          mb="s16"
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          onPress={() => handleFavoritePress(item)}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Box flex={1} flexDirection="row" alignItems="center">
              <Box
                width={52}
                height={52}
                borderRadius="s12"
                backgroundColor="secondaryBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="directions-boat" size={26} color="secondary" />
              </Box>

              <Box flex={1} mr="s12">
                <Text
                  preset="paragraphMedium"
                  color="text"
                  bold
                  numberOfLines={1}
                  mb="s6">
                  {item.boat?.name || `Barco ${item.boatId?.slice(0, 8)}`}
                </Text>

                <Box flexDirection="row" alignItems="center" gap="s8">
                  <Box
                    backgroundColor="secondaryBg"
                    paddingHorizontal="s10"
                    paddingVertical="s4"
                    borderRadius="s8">
                    <Text
                      preset="paragraphCaptionSmall"
                      color="secondary"
                      bold>
                      Barco
                    </Text>
                  </Box>

                  {item.boat?.capacity && (
                    <Text preset="paragraphSmall" color="textSecondary">
                      • {item.boat.capacity} lugares
                    </Text>
                  )}
                </Box>
              </Box>
            </Box>

            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor="dangerBg"
              alignItems="center"
              justifyContent="center"
              onPress={() => handleRemoveFavorite(item)}
              disabled={isToggling}>
              <Icon name="favorite" size={20} color="danger" />
            </TouchableOpacityBox>
          </Box>
        </TouchableOpacityBox>
      );
    }

    // Captain
    if (item.type === FavoriteType.CAPTAIN) {
      return (
        <TouchableOpacityBox
          mb="s16"
          backgroundColor="surface"
          borderRadius="s16"
          padding="s20"
          onPress={() => handleFavoritePress(item)}
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}>
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between">
            <Box flex={1} flexDirection="row" alignItems="center">
              <Box
                width={52}
                height={52}
                borderRadius="s48"
                backgroundColor="warningBg"
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name="person" size={26} color="warning" />
              </Box>

              <Box flex={1} mr="s12">
                <Text
                  preset="paragraphMedium"
                  color="text"
                  bold
                  numberOfLines={1}
                  mb="s6">
                  {item.captain?.name || `Capitão ${item.captainId?.slice(0, 8)}`}
                </Text>

                <Box flexDirection="row" alignItems="center" gap="s8">
                  <Box
                    backgroundColor="warningBg"
                    paddingHorizontal="s10"
                    paddingVertical="s4"
                    borderRadius="s8">
                    <Text preset="paragraphCaptionSmall" color="warning" bold>
                      Capitão
                    </Text>
                  </Box>

                  {item.captain && (
                    <>
                      <Box flexDirection="row" alignItems="center">
                        <Icon name="star" size={14} color="warning" />
                        <Text preset="paragraphSmall" color="text" ml="s4">
                          {item.captain.rating
                            ? parseFloat(item.captain.rating).toFixed(1)
                            : '5.0'}
                        </Text>
                      </Box>
                      <Text preset="paragraphSmall" color="textSecondary">
                        • {item.captain.totalTrips} viagens
                      </Text>
                    </>
                  )}
                </Box>
              </Box>
            </Box>

            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor="dangerBg"
              alignItems="center"
              justifyContent="center"
              onPress={() => handleRemoveFavorite(item)}
              disabled={isToggling}>
              <Icon name="favorite" size={20} color="danger" />
            </TouchableOpacityBox>
          </Box>
        </TouchableOpacityBox>
      );
    }

    return null;
  };

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s24"
        paddingBottom="s12"
        backgroundColor="surface"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{paddingTop: top + 12}}>
        <Box flexDirection="row" alignItems="center" justifyContent="center" mb="s16">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}
            style={{position: 'absolute', left: 0}}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Text preset="headingSmall" color="text" bold>
            Meus Favoritos
          </Text>
        </Box>

        {/* Tabs */}
        <Box flexDirection="row" gap="s8">
          {TABS.map(tab => {
            const isSelected = selectedTab === tab.id;
            return (
              <TouchableOpacityBox
                key={tab.id}
                flex={1}
                paddingVertical="s8"
                paddingHorizontal="s4"
                borderRadius="s12"
                backgroundColor={isSelected ? 'primary' : 'background'}
                alignItems="center"
                justifyContent="center"
                onPress={() => setSelectedTab(tab.id)}>
                <Text
                  style={{fontSize: 12, fontWeight: '700'}}
                  color={isSelected ? 'surface' : 'text'}
                  numberOfLines={1}>
                  {tab.label}
                </Text>
              </TouchableOpacityBox>
            );
          })}
        </Box>
      </Box>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={{padding: 24}}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          favorites.length > 0 ? (
            <Box mb="s16">
              <Text preset="paragraphMedium" color="textSecondary">
                {favorites.length}{' '}
                {favorites.length === 1 ? 'favorito' : 'favoritos'}
              </Text>
            </Box>
          ) : null
        }
        ListEmptyComponent={
          <Box alignItems="center" paddingVertical="s48">
            <Icon name="favorite-border" size={64} color="border" />
            <Text preset="headingSmall" color="textSecondary" mt="s16">
              {error
                ? 'Erro ao carregar favoritos'
                : isLoading
                ? 'Carregando...'
                : 'Nenhum favorito ainda'}
            </Text>
            <Text
              preset="paragraphMedium"
              color="textSecondary"
              mt="s8"
              textAlign="center"
              paddingHorizontal="s24">
              {error
                ? 'Tente novamente mais tarde'
                : selectedTab === 'all'
                ? 'Adicione destinos, barcos ou capitães aos favoritos'
                : selectedTab === FavoriteType.DESTINATION
                ? 'Nenhum destino favorito ainda'
                : selectedTab === FavoriteType.BOAT
                ? 'Nenhum barco favorito ainda'
                : 'Nenhum capitão favorito ainda'}
            </Text>
          </Box>
        }
      />

      <ConfirmationModal
        visible={favoriteToRemove !== null}
        title="Remover Favorito"
        message="Deseja remover este item dos favoritos?"
        icon="favorite"
        iconColor="danger"
        confirmText="Remover"
        cancelText="Cancelar"
        isLoading={isToggling}
        onConfirm={confirmRemove}
        onCancel={() => setFavoriteToRemove(null)}
      />

      <InfoModal
        visible={showBoatModal}
        title="Em breve"
        message="Detalhes do barco em desenvolvimento"
        icon="info"
        iconColor="info"
        buttonText="Entendi"
        onClose={() => setShowBoatModal(false)}
      />

      <InfoModal
        visible={showCaptainModal}
        title="Em breve"
        message="Perfil do capitão em desenvolvimento"
        icon="info"
        iconColor="info"
        buttonText="Entendi"
        onClose={() => setShowCaptainModal(false)}
      />
    </Box>
  );
}
