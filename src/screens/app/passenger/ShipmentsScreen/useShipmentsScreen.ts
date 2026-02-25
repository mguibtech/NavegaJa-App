import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';

import {useMyShipments, Shipment, ShipmentStatus} from '@domain';
import {useVirtualPagination} from '@hooks';
import type {AppStackParamList} from '@routes';

export function useShipmentsScreen() {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);
  const {shipments, fetch: fetchShipments, isLoading: isLoadingShipments, error: shipmentsError} = useMyShipments();

  const filteredShipments = shipments.filter((shipment: Shipment) => {
    if (selectedTab === 'active') {
      return (
        shipment.status === ShipmentStatus.PENDING ||
        shipment.status === ShipmentStatus.PAID ||
        shipment.status === ShipmentStatus.COLLECTED ||
        shipment.status === ShipmentStatus.IN_TRANSIT ||
        shipment.status === ShipmentStatus.ARRIVED ||
        shipment.status === ShipmentStatus.OUT_FOR_DELIVERY
      );
    }
    return (
      shipment.status === ShipmentStatus.DELIVERED ||
      shipment.status === ShipmentStatus.CANCELLED
    );
  });

  const {visibleItems: visibleShipments, hasMore: hasMoreShipments, loadMore: loadMoreShipments} =
    useVirtualPagination(filteredShipments);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetchShipments();
    } catch {
      // ignore refresh errors
    } finally {
      setRefreshing(false);
    }
  }

  function handleShipmentPress(shipment: Shipment) {
    navigation.navigate('ShipmentDetails', {shipmentId: shipment.id});
  }

  function handleCreateShipment() {
    (navigation as any).navigate('Search', {context: 'shipment'});
  }

  return {
    selectedTab,
    setSelectedTab,
    refreshing,
    isLoadingShipments,
    filteredShipments: visibleShipments,
    hasMoreShipments,
    loadMoreShipments,
    shipmentsError,
    fetchShipments,
    onRefresh,
    handleShipmentPress,
    handleCreateShipment,
  };
}
