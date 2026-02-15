import React from 'react';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {Shipment, ShipmentStatus} from '@domain';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: (shipment: Shipment) => void;
}

export function ShipmentCard({shipment, onPress}: ShipmentCardProps) {
  const getStatusConfig = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.PENDING:
        return {
          label: 'Aguardando',
          color: 'warning' as const,
          bg: 'warningBg' as const,
          icon: 'schedule' as const,
        };
      case ShipmentStatus.IN_TRANSIT:
        return {
          label: 'Em Trânsito',
          color: 'info' as const,
          bg: 'infoBg' as const,
          icon: 'local-shipping' as const,
        };
      case ShipmentStatus.DELIVERED:
        return {
          label: 'Entregue',
          color: 'success' as const,
          bg: 'successBg' as const,
          icon: 'check-circle' as const,
        };
      case ShipmentStatus.CANCELLED:
        return {
          label: 'Cancelada',
          color: 'danger' as const,
          bg: 'dangerBg' as const,
          icon: 'cancel' as const,
        };
      default:
        return {
          label: 'Desconhecido',
          color: 'textSecondary' as const,
          bg: 'background' as const,
          icon: 'help-outline' as const,
        };
    }
  };

  const statusConfig = getStatusConfig(shipment.status);

  const formattedDate = format(
    new Date(shipment.createdAt),
    "dd 'de' MMM, HH:mm",
    {locale: ptBR},
  );

  return (
    <TouchableOpacityBox
      mb="s16"
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      onPress={() => onPress(shipment)}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Header com Status Badge */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb="s16">
        <Box flex={1} mr="s12">
          <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
            Criada em
          </Text>
          <Text preset="paragraphSmall" color="text">
            {formattedDate}
          </Text>
        </Box>

        <Box
          backgroundColor={statusConfig.bg}
          paddingHorizontal="s12"
          paddingVertical="s8"
          borderRadius="s8"
          flexDirection="row"
          alignItems="center">
          <Icon name={statusConfig.icon} size={16} color={statusConfig.color} />
          <Text
            preset="paragraphCaptionSmall"
            color={statusConfig.color}
            bold
            ml="s4">
            {statusConfig.label}
          </Text>
        </Box>
      </Box>

      {/* Destinatário */}
      <Box mb="s16">
        <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
          Destinatário
        </Text>
        <Text preset="paragraphMedium" color="text" bold>
          {shipment.recipientName}
        </Text>
        <Text preset="paragraphSmall" color="textSecondary" mt="s4">
          {shipment.recipientPhone}
        </Text>
      </Box>

      {/* Viagem (se populada) */}
      {shipment.trip && (
        <Box
          flexDirection="row"
          alignItems="center"
          mb="s12"
          paddingVertical="s12"
          paddingHorizontal="s16"
          backgroundColor="background"
          borderRadius="s12">
          <Icon name="directions-boat" size={20} color="primary" />
          <Text preset="paragraphSmall" color="text" ml="s8" flex={1}>
            {shipment.trip.origin} → {shipment.trip.destination}
          </Text>
        </Box>
      )}

      {/* Peso e Preço */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        paddingTop="s16"
        borderTopWidth={1}
        borderTopColor="border"
        mb="s12">
        <Box flexDirection="row" alignItems="center">
          <Icon name="scale" size={18} color="textSecondary" />
          <Text preset="paragraphSmall" color="text" ml="s8">
            {shipment.weight}kg
          </Text>
        </Box>

        <Text preset="headingSmall" color="primary" bold>
          R$ {shipment.price.toFixed(2)}
        </Text>
      </Box>

      {/* Código de rastreamento */}
      <Box
        backgroundColor="primaryBg"
        padding="s12"
        borderRadius="s8"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between">
        <Box flex={1}>
          <Text preset="paragraphCaptionSmall" color="primary" mb="s4">
            Código de rastreamento
          </Text>
          <Text preset="paragraphMedium" color="primary" bold>
            {shipment.trackingCode}
          </Text>
        </Box>
        <Icon name="chevron-right" size={24} color="primary" />
      </Box>
    </TouchableOpacityBox>
  );
}
