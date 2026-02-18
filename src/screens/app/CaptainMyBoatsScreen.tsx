import React, {useEffect, useState} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox, ConfirmationModal} from '@components';
import {useMyBoats, useDeleteBoat, Boat} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainMyBoats'>;

export function CaptainMyBoatsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const {boats, isLoading, fetchBoats} = useMyBoats();
  const {deleteBoat, isLoading: deleteLoading} = useDeleteBoat();

  const [refreshing, setRefreshing] = useState(false);
  const [boatToDelete, setBoatToDelete] = useState<Boat | null>(null);

  useEffect(() => {
    fetchBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function renderBoat({item: boat}: {item: Boat}) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s12"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="flex-start">
          <Box
            width={52}
            height={52}
            borderRadius="s16"
            backgroundColor="secondaryBg"
            alignItems="center"
            justifyContent="center"
            mr="s16">
            <Icon name="sailing" size={28} color="secondary" />
          </Box>
          <Box flex={1}>
            <Text preset="paragraphMedium" color="text" bold>
              {boat.name}
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              {boat.type}
            </Text>
          </Box>
          <Box flexDirection="row" gap="s4">
            <TouchableOpacityBox
              padding="s8"
              onPress={() => navigation.navigate('CaptainEditBoat', {boatId: boat.id})}>
              <Icon name="edit" size={22} color="secondary" />
            </TouchableOpacityBox>
            <TouchableOpacityBox
              padding="s8"
              onPress={() => setBoatToDelete(boat)}>
              <Icon name="delete-outline" size={22} color="danger" />
            </TouchableOpacityBox>
          </Box>
        </Box>

        <Box
          flexDirection="row"
          mt="s16"
          paddingTop="s12"
          borderTopWidth={1}
          borderTopColor="border"
          gap="s16">
          <Box flexDirection="row" alignItems="center">
            <Icon name="event-seat" size={14} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" ml="s4">
              {boat.capacity} lugares
            </Text>
          </Box>
          <Box flexDirection="row" alignItems="center">
            <Icon name="tag" size={14} color="textSecondary" />
            <Text preset="paragraphSmall" color="textSecondary" ml="s4">
              {boat.registrationNum}
            </Text>
          </Box>
          {boat.isActive !== undefined && (
            <Box flexDirection="row" alignItems="center">
              <Icon
                name={boat.isActive ? 'check-circle' : 'cancel'}
                size={14}
                color={boat.isActive ? 'success' : 'textSecondary'}
              />
              <Text
                preset="paragraphSmall"
                color={boat.isActive ? 'success' : 'textSecondary'}
                ml="s4">
                {boat.isActive ? 'Ativa' : 'Inativa'}
              </Text>
            </Box>
          )}
        </Box>

        {boat.description ? (
          <Text
            preset="paragraphSmall"
            color="textSecondary"
            mt="s8">
            {boat.description}
          </Text>
        ) : null}
      </Box>
    );
  }

  return (
    <>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s24"
          paddingBottom="s12"
          borderBottomWidth={1}
          borderBottomColor="border"
          style={{paddingTop: top + 12}}>
          <Box flexDirection="row" alignItems="center">
            <TouchableOpacityBox
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              mr="s8"
              onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={22} color="text" />
            </TouchableOpacityBox>
            <Box flex={1}>
              <Text preset="headingSmall" color="text" bold>
                Minhas Embarcações
              </Text>
            </Box>
            <TouchableOpacityBox
              backgroundColor="secondary"
              paddingHorizontal="s16"
              paddingVertical="s8"
              borderRadius="s12"
              flexDirection="row"
              alignItems="center"
              onPress={() => navigation.navigate('CaptainCreateBoat')}>
              <Icon name="add" size={18} color="surface" />
              <Text preset="paragraphSmall" color="surface" bold ml="s4">
                Nova
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>

        <FlatList
          data={boats}
          keyExtractor={item => item.id}
          renderItem={renderBoat}
          contentContainerStyle={{padding: 20, paddingBottom: 100}}
          refreshControl={
            <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Box flex={1} alignItems="center" justifyContent="center" padding="s32">
              <Icon name="sailing" size={64} color="textSecondary" />
              <Text
                preset="headingSmall"
                color="text"
                bold
                textAlign="center"
                mt="s20"
                mb="s12">
                Nenhuma embarcação
              </Text>
              <Text
                preset="paragraphMedium"
                color="textSecondary"
                textAlign="center"
                mb="s24">
                Cadastre sua primeira embarcação para criar viagens
              </Text>
              <TouchableOpacityBox
                flexDirection="row"
                alignItems="center"
                paddingHorizontal="s24"
                paddingVertical="s16"
                backgroundColor="secondary"
                borderRadius="s12"
                onPress={() => navigation.navigate('CaptainCreateBoat')}>
                <Icon name="add-circle" size={24} color="surface" />
                <Text preset="paragraphMedium" color="surface" bold ml="s12">
                  Cadastrar Embarcação
                </Text>
              </TouchableOpacityBox>
            </Box>
          }
        />
      </Box>

      {/* Delete Confirmation */}
      <ConfirmationModal
        visible={!!boatToDelete}
        title="Remover Embarcação"
        message={`Deseja remover a embarcação "${boatToDelete?.name}"? Esta ação não pode ser desfeita.`}
        icon="delete-outline"
        iconColor="danger"
        confirmText="Remover"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setBoatToDelete(null)}
        isLoading={deleteLoading}
      />
    </>
  );
}
