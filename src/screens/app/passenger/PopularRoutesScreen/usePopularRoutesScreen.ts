import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';

import {usePopularRoutes, PopularRoute} from '@domain';
import type {AppStackParamList} from '@routes';

export function usePopularRoutesScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const {data, fetch, isLoading, error} = usePopularRoutes();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      await fetch();
    } catch (err) {
      console.error('Error loading popular routes:', err);
    }
  }

  async function onRefresh() {
    await loadData();
  }

  function handleRoutePress(route: PopularRoute) {
    navigation.navigate('SearchResults', {
      origin: route.origin,
      destination: route.destination,
    });
  }

  function goBack() {
    navigation.goBack();
  }

  return {
    data,
    isLoading,
    error,
    onRefresh,
    handleRoutePress,
    goBack,
  };
}
