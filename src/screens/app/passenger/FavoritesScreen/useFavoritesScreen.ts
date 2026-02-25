import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';

import {useMyFavorites, useToggleFavorite, Favorite, FavoriteType} from '@domain';
import type {AppStackParamList} from '@routes';

export type FavoriteTabType = 'all' | FavoriteType;

export const FAVORITE_TABS: {id: FavoriteTabType; label: string}[] = [
  {id: 'all', label: 'Todos'},
  {id: FavoriteType.DESTINATION, label: 'Destinos'},
  {id: FavoriteType.BOAT, label: 'Barcos'},
  {id: FavoriteType.CAPTAIN, label: 'Capitães'},
];

export function useFavoritesScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<FavoriteTabType>('all');
  const [favoriteToRemove, setFavoriteToRemove] = useState<Favorite | null>(null);
  const [showBoatModal, setShowBoatModal] = useState(false);
  const [showCaptainModal, setShowCaptainModal] = useState(false);

  const {favorites, fetch, isLoading, error} = useMyFavorites(
    selectedTab === 'all' ? undefined : selectedTab,
  );
  const {toggle, isLoading: isToggling} = useToggleFavorite();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab]);

  async function loadData() {
    try {
      await fetch();
    } catch (err) {
      console.error('Error loading favorites:', err);
    }
  }

  async function onRefresh() {
    await loadData();
  }

  function handleFavoritePress(favorite: Favorite) {
    if (favorite.type === FavoriteType.DESTINATION) {
      navigation.navigate('SearchResults', {
        origin: favorite.origin || '',
        destination: favorite.destination || '',
      });
    } else if (favorite.type === FavoriteType.BOAT && favorite.boatId) {
      setShowBoatModal(true);
    } else if (favorite.type === FavoriteType.CAPTAIN && favorite.captainId) {
      setShowCaptainModal(true);
    }
  }

  function handleRemoveFavorite(favorite: Favorite) {
    setFavoriteToRemove(favorite);
  }

  async function confirmRemove() {
    if (!favoriteToRemove) {return;}
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
  }

  function goBack() {
    navigation.goBack();
  }

  return {
    selectedTab,
    setSelectedTab,
    favoriteToRemove,
    setFavoriteToRemove,
    showBoatModal,
    setShowBoatModal,
    showCaptainModal,
    setShowCaptainModal,
    favorites,
    isLoading,
    error,
    isToggling,
    onRefresh,
    handleFavoritePress,
    handleRemoveFavorite,
    confirmRemove,
    goBack,
  };
}
