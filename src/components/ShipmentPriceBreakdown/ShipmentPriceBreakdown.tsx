import React from 'react';

import {Box, Icon, Text} from '@components';
import {CalculateShipmentPriceResponse} from '@domain';

interface ShipmentPriceBreakdownProps {
  data: CalculateShipmentPriceResponse;
}

export function ShipmentPriceBreakdown({data}: ShipmentPriceBreakdownProps) {
  const hasDiscount = data.totalDiscount > 0;

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      <Text preset="paragraphMedium" color="text" bold mb="s16">
        Detalhes do Frete
      </Text>

      {/* Peso cobrado */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb="s12">
        <Box flex={1}>
          <Text preset="paragraphSmall" color="textSecondary" mb="s4">
            Peso cobrado
          </Text>
          <Text preset="paragraphSmall" color="text">
            {data.chargedWeight}kg × R$ {data.pricePerKg.toFixed(2)}/kg
          </Text>
        </Box>
        <Text preset="paragraphMedium" color="text" bold>
          R$ {data.weightCharge.toFixed(2)}
        </Text>
      </Box>

      {/* Peso volumétrico (se aplicável) */}
      {data.volumetricWeight &&
        data.volumetricWeight > data.actualWeight && (
          <Box
            backgroundColor="infoBg"
            padding="s12"
            borderRadius="s8"
            mb="s12"
            flexDirection="row"
            alignItems="flex-start">
            <Icon name="info" size={16} color="info" />
            <Text preset="paragraphSmall" color="info" ml="s8" flex={1}>
              Peso volumétrico ({data.volumetricWeight.toFixed(2)}kg) maior
              que peso real ({data.actualWeight}kg). Cobrança pelo maior.
            </Text>
          </Box>
        )}

      {/* Cupom aplicado */}
      {data.appliedCoupon && data.couponDiscount && data.couponDiscount > 0 && (
        <Box mb="s12">
          <Box
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            mb="s4">
            <Box flexDirection="row" alignItems="center">
              <Icon name="local-offer" size={16} color="success" />
              <Text preset="paragraphSmall" color="success" ml="s8" bold>
                Cupom {data.appliedCoupon.code}
              </Text>
            </Box>
            <Text preset="paragraphMedium" color="success" bold>
              -R$ {data.couponDiscount.toFixed(2)}
            </Text>
          </Box>
          <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s24">
            {data.appliedCoupon.description}
          </Text>
        </Box>
      )}

      {/* Linha separadora */}
      <Box
        height={2}
        backgroundColor="border"
        mb="s16"
        mt={hasDiscount ? 's12' : 's4'}
      />

      {/* Total */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb={hasDiscount ? 's16' : undefined}>
        <Text preset="headingSmall" color="text" bold>
          Total
        </Text>
        <Text preset="headingSmall" color="primary" bold>
          R$ {data.finalPrice.toFixed(2)}
        </Text>
      </Box>

      {/* Mensagem de economia */}
      {hasDiscount && (
        <Box
          backgroundColor="successBg"
          padding="s12"
          borderRadius="s12"
          flexDirection="row"
          alignItems="center">
          <Icon name="celebration" size={20} color="success" />
          <Text preset="paragraphSmall" color="success" bold ml="s8">
            Você economizou R$ {data.totalDiscount.toFixed(2)}!
          </Text>
        </Box>
      )}
    </Box>
  );
}
