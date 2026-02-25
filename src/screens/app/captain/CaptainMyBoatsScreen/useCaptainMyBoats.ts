import {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useMyBoats, useDeleteBoat, Boat} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export function useCaptainMyBoats() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const toast = useToast();

  const {boats, isLoading, fetchBoats} = useMyBoats();
  const {deleteBoat, isLoading: deleteLoading} = useDeleteBoat();

  const [refreshing, setRefreshing] = useState(false);
  const [boatToDelete, setBoatToDelete] = useState<Boat | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchBoats();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetchBoats();
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete() {
    if (!boatToDelete) return;
    try {
      await deleteBoat(boatToDelete.id);
      toast.showSuccess(`${boatToDelete.name} removida com sucesso`);
      setBoatToDelete(null);
      fetchBoats();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao remover embarcação');
      setBoatToDelete(null);
    }
  }

  return {
    navigation,
    boats,
    isLoading,
    deleteLoading,
    refreshing,
    boatToDelete,
    setBoatToDelete,
    onRefresh,
    handleDelete,
  };
}
