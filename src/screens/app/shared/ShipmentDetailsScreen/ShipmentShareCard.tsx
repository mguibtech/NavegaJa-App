import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import {Shipment, ShipmentStatus} from '@domain';
import {formatBRL} from '@utils';

interface ShipmentShareCardProps {
  shipment: Shipment;
}

function getStatusLabel(status: ShipmentStatus): string {
  switch (status) {
    case ShipmentStatus.PENDING:         return 'Aguardando pagamento';
    case ShipmentStatus.PAID:            return 'Pagamento confirmado';
    case ShipmentStatus.COLLECTED:       return 'Coletada pelo capitão';
    case ShipmentStatus.IN_TRANSIT:      return 'Em trânsito';
    case ShipmentStatus.ARRIVED:         return 'Chegou ao destino';
    case ShipmentStatus.OUT_FOR_DELIVERY: return 'Saiu para entrega';
    case ShipmentStatus.DELIVERED:       return 'Entregue';
    case ShipmentStatus.CANCELLED:       return 'Cancelada';
    default:                             return 'Desconhecido';
  }
}

function getStatusColor(status: ShipmentStatus): string {
  switch (status) {
    case ShipmentStatus.DELIVERED:       return '#16A34A';
    case ShipmentStatus.IN_TRANSIT:
    case ShipmentStatus.COLLECTED:
    case ShipmentStatus.ARRIVED:
    case ShipmentStatus.OUT_FOR_DELIVERY: return '#0B5D8A';
    case ShipmentStatus.CANCELLED:       return '#DC2626';
    default:                             return '#D97706';
  }
}

export const ShipmentShareCard = React.forwardRef<View, ShipmentShareCardProps>(
  ({shipment}, ref) => {
    const statusLabel = getStatusLabel(shipment.status);
    const statusColor = getStatusColor(shipment.status);

    return (
      <View ref={ref} style={s.card} collapsable={false}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerBrand}>NavegaJá</Text>
          <Text style={s.headerSub}>Comprovante de Encomenda</Text>
        </View>

        {/* QR Code */}
        <View style={s.qrSection}>
          <View style={s.qrBox}>
            <QRCode
              value={shipment.trackingCode || 'N/A'}
              size={160}
              backgroundColor="white"
              color="#0D1B2A"
            />
          </View>
          <Text style={s.trackingLabel}>Código de Rastreamento</Text>
          <Text style={s.trackingCode}>{shipment.trackingCode}</Text>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Status */}
        <View style={[s.statusRow]}>
          <View style={[s.statusDot, {backgroundColor: statusColor}]} />
          <Text style={[s.statusText, {color: statusColor}]}>{statusLabel}</Text>
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Info Rows */}
        <View style={s.infoSection}>
          <InfoRow label="Destinatário" value={shipment.recipientName} />
          <InfoRow label="Telefone"     value={shipment.recipientPhone} />
          <InfoRow label="Endereço"     value={shipment.recipientAddress} />
          <InfoRow label="Descrição"    value={shipment.description} />
          {shipment.weight != null && (
            <InfoRow label="Peso" value={`${shipment.weight} kg`} />
          )}
          <InfoRow
            label="Pagamento"
            value={shipment.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
          />
        </View>

        {/* Divider */}
        <View style={s.divider} />

        {/* Price */}
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Total</Text>
          <Text style={s.priceValue}>{formatBRL(shipment.price)}</Text>
        </View>

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>www.navegaja.com.br</Text>
        </View>
      </View>
    );
  },
);

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <View style={s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#0B5D8A',
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerBrand: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 12,
    color: '#B3D9F0',
    marginTop: 2,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  qrBox: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8ED',
  },
  trackingLabel: {
    fontSize: 11,
    color: '#8A9BB0',
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trackingCode: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B5D8A',
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8ED',
    marginHorizontal: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    color: '#8A9BB0',
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0D1B2A',
    flex: 2,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D1B2A',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B5D8A',
  },
  footer: {
    backgroundColor: '#F5F7F8',
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#8A9BB0',
  },
});
