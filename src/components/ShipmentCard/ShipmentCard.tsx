import React, {useState} from 'react';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {Shipment, ShipmentStatus} from '@domain';
import {formatBRL} from '@utils';

interface ShipmentCardProps {
  shipment: Shipment;
  onPress: (shipment: Shipment) => void;
}

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 2,
} as const;

function getStatusConfig(status: ShipmentStatus) {
  switch (status) {
    case ShipmentStatus.PENDING:
      return {label: 'Aguardando', color: 'warning' as const, bg: 'warningBg' as const, icon: 'schedule' as const};
    case ShipmentStatus.PAID:
      return {label: 'Pago', color: 'success' as const, bg: 'successBg' as const, icon: 'payments' as const};
    case ShipmentStatus.COLLECTED:
      return {label: 'Coletada', color: 'info' as const, bg: 'infoBg' as const, icon: 'inventory' as const};
    case ShipmentStatus.IN_TRANSIT:
      return {label: 'Em Trânsito', color: 'info' as const, bg: 'infoBg' as const, icon: 'local-shipping' as const};
    case ShipmentStatus.ARRIVED:
      return {label: 'Chegou', color: 'info' as const, bg: 'infoBg' as const, icon: 'place' as const};
    case ShipmentStatus.OUT_FOR_DELIVERY:
      return {label: 'Saiu p/ Entrega', color: 'info' as const, bg: 'infoBg' as const, icon: 'delivery-dining' as const};
    case ShipmentStatus.DELIVERED:
      return {label: 'Entregue', color: 'success' as const, bg: 'successBg' as const, icon: 'check-circle' as const};
    case ShipmentStatus.CANCELLED:
      return {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const, icon: 'cancel' as const};
    default:
      return {label: 'Desconhecido', color: 'textSecondary' as const, bg: 'background' as const, icon: 'help-outline' as const};
  }
}

export function ShipmentCard({shipment, onPress}: ShipmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = getStatusConfig(shipment.status);

  const formattedDate = format(
    new Date(shipment.createdAt),
    "dd 'de' MMM, HH:mm",
    {locale: ptBR},
  );

  const origin =
    shipment.trip?.origin ||
    shipment.trip?.route?.origin ||
    shipment.trip?.route?.originCity ||
    '';
  const destination =
    shipment.trip?.destination ||
    shipment.trip?.route?.destination ||
    shipment.trip?.route?.destinationCity ||
    '';
  const hasRoute = !!(origin || destination);

  return (
    <Box mb="s12" backgroundColor="surface" borderRadius="s16" style={SHADOW}>

      {/* ── Área principal — toque navega para detalhes ── */}
      <TouchableOpacityBox
        padding="s16"
        borderRadius="s16"
        onPress={() => onPress(shipment)}>

        {/* Linha 1: Status badge + Tracking code */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s12">
          <Box
            backgroundColor={statusConfig.bg}
            paddingHorizontal="s8"
            paddingVertical="s4"
            borderRadius="s8"
            flexDirection="row"
            alignItems="center">
            <Icon name={statusConfig.icon} size={13} color={statusConfig.color} />
            <Text preset="paragraphCaptionSmall" color={statusConfig.color} bold ml="s4">
              {statusConfig.label}
            </Text>
          </Box>

          <Box flexDirection="row" alignItems="center">
            <Icon name="qr-code" size={13} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
              {shipment.trackingCode}
            </Text>
          </Box>
        </Box>

        {/* Linha 2: Nome do destinatário + Preço */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flex={1} mr="s12">
            <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
              Destinatário
            </Text>
            <Text preset="paragraphMedium" color="text" bold numberOfLines={1}>
              {shipment.recipientName}
            </Text>
          </Box>

          <Text preset="headingSmall" color="primary" bold>
            {formatBRL(shipment.price)}
          </Text>
        </Box>
      </TouchableOpacityBox>

      {/* ── Linha inferior: Peso + botão expand ── */}
      <Box
        flexDirection="row"
        alignItems="center"
        paddingHorizontal="s16"
        paddingBottom="s12"
        borderTopWidth={1}
        borderTopColor="border"
        paddingTop="s12">
        <Box flexDirection="row" alignItems="center" flex={1}>
          <Icon name="scale" size={15} color="textSecondary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s6">
            {shipment.weight != null ? `${shipment.weight} kg` : '— kg'}
          </Text>
        </Box>

        <TouchableOpacityBox
          onPress={() => setExpanded(prev => !prev)}
          paddingHorizontal="s8"
          paddingVertical="s4">
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={22}
            color="textSecondary"
          />
        </TouchableOpacityBox>
      </Box>

      {/* ── Detalhes expandidos ── */}
      {expanded && (
        <Box
          borderTopWidth={1}
          borderTopColor="border"
          paddingHorizontal="s16"
          paddingBottom="s16"
          paddingTop="s12"
          gap="s10">

          {/* Data */}
          <Box flexDirection="row" alignItems="center">
            <Icon name="schedule" size={15} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
              {formattedDate}
            </Text>
          </Box>

          {/* Telefone */}
          <Box flexDirection="row" alignItems="center">
            <Icon name="phone" size={15} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
              {shipment.recipientPhone}
            </Text>
          </Box>

          {/* Rota da viagem */}
          {hasRoute && (
            <Box flexDirection="row" alignItems="center">
              <Icon name="directions-boat" size={15} color="textSecondary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8" flex={1}>
                {origin || '—'} → {destination || '—'}
              </Text>
            </Box>
          )}

          {/* Pagamento */}
          <Box flexDirection="row" alignItems="center">
            <Icon name="payments" size={15} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
              {shipment.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}
