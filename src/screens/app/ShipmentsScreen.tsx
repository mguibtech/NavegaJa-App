import React, {useState, useEffect} from 'react';
import {FlatList, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox, ShipmentCard} from '@components';
import {useMyShipments, Shipment, ShipmentStatus} from '@domain';

import {AppStackParamList, TabsParamList} from '@routes';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabsParamList, 'Shipments'>,
  NativeStackScreenProps<AppStackParamList>
>;

export function ShipmentsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const {shipments, fetch: fetchShipments, error: shipmentsError} = useMyShipments();

  // Buscar shipments ao montar a tela
  useEffect(() => {
    fetchShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchShipments();
    } catch (error) {
      console.error('Error refreshing shipments:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filtrar shipments por status
  const filteredShipments = shipments.filter((shipment: Shipment) => {
    if (selectedTab === 'active') {
      // Ativas: todos os estados antes de entregue/cancelado
      return (
        shipment.status === ShipmentStatus.PENDING ||
        shipment.status === ShipmentStatus.PAID ||
        shipment.status === ShipmentStatus.COLLECTED ||
        shipment.status === ShipmentStatus.IN_TRANSIT ||
        shipment.status === ShipmentStatus.ARRIVED ||
        shipment.status === ShipmentStatus.OUT_FOR_DELIVERY
      );
    } else {
      // Concluídas: delivered, cancelled
      return (
        shipment.status === ShipmentStatus.DELIVERED ||
        shipment.status === ShipmentStatus.CANCELLED
      );
    }
  });

  function handleShipmentPress(shipment: Shipment) {
    navigation.navigate('ShipmentDetails', {shipmentId: shipment.id});
  }

  function handleCreateShipment() {
    navigation.navigate('Search', {context: 'shipment'}); // Navega para busca de viagens para encomenda
  }

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

        {/* Tabs */}
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

      {/* Error banner */}
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

      {/* Lista de encomendas */}
      <FlatList
        data={filteredShipments}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <Box paddingHorizontal="s20">
            <ShipmentCard shipment={item} onPress={handleShipmentPress} />
          </Box>
        )}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 100,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
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
        }
      />

      {/* FAB - Floating Action Button */}
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
