import React from 'react';
import {FlatList, RefreshControl, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, ShipmentCardSkeleton, Text, TouchableOpacityBox, ShipmentCard} from '@components';

import {useShipmentsScreen} from './useShipmentsScreen';

export function ShipmentsScreen() {
  const {top} = useSafeAreaInsets();
  const {
    selectedTab,
    setSelectedTab,
    refreshing,
    isLoadingShipments,
    filteredShipments,
    hasMoreShipments,
    loadMoreShipments,
    shipmentsError,
    fetchShipments,
    onRefresh,
    handleShipmentPress,
    handleCreateShipment,
  } = useShipmentsScreen();

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="surface"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Text preset="headingMedium" color="text" bold mb="s16">
          Minhas Encomendas
        </Text>

        <Box flexDirection="row" gap="s12">
          <TouchableOpacityBox
            flex={1}
            paddingVertical="s12"
            borderRadius="s12"
            backgroundColor={selectedTab === 'active' ? 'primary' : 'background'}
            alignItems="center"
            onPress={() => setSelectedTab('active')}>
            <Text
              preset="paragraphMedium"
              color={selectedTab === 'active' ? 'surface' : 'text'}
              bold>
              Ativas
            </Text>
          </TouchableOpacityBox>

          <TouchableOpacityBox
            flex={1}
            paddingVertical="s12"
            borderRadius="s12"
            backgroundColor={selectedTab === 'completed' ? 'primary' : 'background'}
            alignItems="center"
            onPress={() => setSelectedTab('completed')}>
            <Text
              preset="paragraphMedium"
              color={selectedTab === 'completed' ? 'surface' : 'text'}
              bold>
              Concluídas
            </Text>
          </TouchableOpacityBox>
        </Box>
      </Box>

      {shipmentsError && (
        <Box
          flexDirection="row"
          alignItems="center"
          paddingHorizontal="s16"
          paddingVertical="s12"
          style={{backgroundColor: '#FEF3C7', borderBottomWidth: 1, borderBottomColor: '#FDE68A'}}>
          <Icon name="wifi-off" size={16} color="warning" />
          <Text preset="paragraphSmall" color="text" ml="s8" flex={1}>
            Sem conexão. Exibindo dados em cache.
          </Text>
          <TouchableOpacityBox onPress={() => fetchShipments().catch(() => {})} pl="s12">
            <Text preset="paragraphSmall" color="primary" bold>Tentar</Text>
          </TouchableOpacityBox>
        </Box>
      )}

      <FlatList
        data={isLoadingShipments && filteredShipments.length === 0 ? [] : filteredShipments}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Box paddingHorizontal="s20">
            <ShipmentCard shipment={item} onPress={handleShipmentPress} />
          </Box>
        )}
        contentContainerStyle={{paddingTop: 20, paddingBottom: 100}}
        onEndReached={loadMoreShipments}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={
          hasMoreShipments ? (
            <Box paddingVertical="s16" alignItems="center">
              <ActivityIndicator />
            </Box>
          ) : null
        }
        ListEmptyComponent={
          isLoadingShipments ? (
            <Box>
              <ShipmentCardSkeleton />
              <ShipmentCardSkeleton />
              <ShipmentCardSkeleton />
            </Box>
          ) : (
            <Box flex={1} justifyContent="center" alignItems="center" padding="s40">
              <Icon
                name={selectedTab === 'active' ? 'local-shipping' : 'check-circle'}
                size={64}
                color="textSecondary"
              />
              <Text
                preset="headingSmall"
                color="text"
                bold
                textAlign="center"
                mt="s20"
                mb="s12">
                {selectedTab === 'active'
                  ? 'Nenhuma encomenda ativa'
                  : 'Nenhuma encomenda concluída'}
              </Text>
              <Text
                preset="paragraphMedium"
                color="textSecondary"
                textAlign="center"
                mb="s24">
                {selectedTab === 'active'
                  ? 'Você ainda não enviou nenhuma encomenda'
                  : 'Suas encomendas entregues aparecerão aqui'}
              </Text>

              {selectedTab === 'active' && (
                <TouchableOpacityBox
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal="s24"
                  paddingVertical="s16"
                  backgroundColor="primary"
                  borderRadius="s12"
                  onPress={handleCreateShipment}>
                  <Icon name="add-circle" size={24} color="surface" />
                  <Text preset="paragraphMedium" color="surface" bold ml="s12">
                    Enviar Encomenda
                  </Text>
                </TouchableOpacityBox>
              )}
            </Box>
          )
        }
      />

      {filteredShipments.length > 0 && (
        <Box position="absolute" bottom={24} right={24}>
          <TouchableOpacityBox
            width={56}
            height={56}
            borderRadius="s24"
            backgroundColor="primary"
            alignItems="center"
            justifyContent="center"
            onPress={handleCreateShipment}
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
            <Icon name="add" size={28} color="surface" />
          </TouchableOpacityBox>
        </Box>
      )}
    </Box>
  );
}
