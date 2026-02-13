import {Box, Icon, Text} from '@components';
import React from 'react';
import {PriceBreakdown as PriceBreakdownType} from '@domain';

export interface PriceBreakdownProps {
  data: PriceBreakdownType;
}

export function PriceBreakdown({data}: PriceBreakdownProps) {
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
        {'Detalhes do Pagamento'}
      </Text>

      {/* Base Price */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        mb="s12">
        <Text preset="paragraphMedium" color="text">
          {`Subtotal${data.quantity ? ` (${data.quantity}x)` : ''}`}
        </Text>
        <Text preset="paragraphMedium" color="text">
          {`R$ ${data.basePrice.toFixed(2)}`}
        </Text>
      </Box>

      {/* Discounts */}
      {data.discountsApplied && data.discountsApplied.length > 0 && (
        <>
          {data.discountsApplied.map((discount, index) => (
            <Box
              key={index}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              mb="s12">
              <Box flexDirection="row" alignItems="center" flex={1}>
                <Icon
                  name={
                    discount.type === 'coupon'
                      ? 'local-offer'
                      : discount.type === 'loyalty'
                      ? 'stars'
                      : 'discount'
                  }
                  size={16}
                  color="success"
                />
                <Box ml="s8" flex={1}>
                  <Text preset="paragraphSmall" color="success">
                    {discount.label}
                    {discount.percent && ` (${discount.percent}%)`}
                    {discount.code && ` • ${discount.code}`}
                    {discount.level && ` • ${discount.level}`}
                  </Text>
                </Box>
              </Box>
              <Text preset="paragraphMedium" color="success" bold>
                {`-R$ ${discount.amount.toFixed(2)}`}
              </Text>
            </Box>
          ))}

          {/* Total Discount */}
          {data.totalDiscount > 0 && (
            <Box
              paddingVertical="s12"
              marginBottom="s12"
              borderTopWidth={1}
              borderTopColor="border"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center">
              <Text preset="paragraphMedium" color="success" bold>
                {'Economia total'}
              </Text>
              <Text preset="paragraphMedium" color="success" bold>
                {`-R$ ${data.totalDiscount.toFixed(2)}`}
              </Text>
            </Box>
          )}
        </>
      )}

      {/* Final Price */}
      <Box
        paddingTop="s16"
        borderTopWidth={2}
        borderTopColor="border"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center">
        <Text preset="headingSmall" color="text" bold>
          {'Total'}
        </Text>
        <Text preset="headingSmall" color="primary" bold>
          {`R$ ${data.finalPrice.toFixed(2)}`}
        </Text>
      </Box>

      {/* Savings Message */}
      {data.totalDiscount > 0 && (
        <Box
          mt="s16"
          backgroundColor="successBg"
          padding="s12"
          borderRadius="s12"
          flexDirection="row"
          alignItems="center">
          <Icon name="celebration" size={20} color="success" />
          <Text preset="paragraphSmall" color="success" bold ml="s8" flex={1}>
            {`Você economizou R$ ${data.totalDiscount.toFixed(2)}! 🎉`}
          </Text>
        </Box>
      )}
    </Box>
  );
}
