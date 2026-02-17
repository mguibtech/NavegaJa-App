import React, {useEffect} from 'react';
import {ActivityIndicator} from 'react-native';

import {Box, Icon, Text} from '@components';
import {
  useNavigationSafety,
  Region,
  getSafetyLevelConfig,
  SafetyLevel,
} from '@domain';

interface NavigationSafetyAlertProps {
  region?: Region;
  latitude?: number;
  longitude?: number;
  compact?: boolean;
}

export function NavigationSafetyAlert({
  region,
  latitude,
  longitude,
  compact = false,
}: NavigationSafetyAlertProps) {
  const {safety, assessRegion, assess, isLoading} = useNavigationSafety();

  useEffect(() => {
    loadSafety();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, latitude, longitude]);

  async function loadSafety() {
    try {
      if (region) {
        await assessRegion(region);
      } else if (latitude !== undefined && longitude !== undefined) {
        await assess(latitude, longitude);
      }
    } catch (error) {
      console.error('Error loading navigation safety:', error);
    }
  }

  if (isLoading) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s12"
        padding="s16"
        flexDirection="row"
        alignItems="center">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text preset="paragraphSmall" color="textSecondary" ml="s12">
          Verificando segurança...
        </Text>
      </Box>
    );
  }

  if (!safety) {
    return null;
  }

  const config = getSafetyLevelConfig(safety.level);

  // Modo compacto (apenas badge)
  if (compact) {
    return (
      <Box
        style={{backgroundColor: config.bgColor}}
        paddingHorizontal="s12"
        paddingVertical="s8"
        borderRadius="s8"
        flexDirection="row"
        alignItems="center">
        <Icon name={config.icon as any} size={16} color={config.color as any} />
        <Text
          preset="paragraphCaptionSmall"
          style={{color: config.color}}
          bold
          ml="s6">
          {config.label}
        </Text>
      </Box>
    );
  }

  // Modo completo
  const showAlert = safety.level !== SafetyLevel.SAFE;

  if (!showAlert) {
    // Apenas mostra badge verde se seguro
    return (
      <Box
        style={{backgroundColor: config.bgColor}}
        padding="s16"
        borderRadius="s12"
        flexDirection="row"
        alignItems="center">
        <Icon name={config.icon as any} size={24} color={config.color as any} />
        <Box ml="s12" flex={1}>
          <Text preset="paragraphMedium" style={{color: config.color}} bold>
            {config.label}
          </Text>
          <Text
            preset="paragraphCaptionSmall"
            style={{color: config.color}}
            mt="s4">
            {config.description}
          </Text>
        </Box>
      </Box>
    );
  }

  // Alerta detalhado para condições perigosas
  return (
    <Box
      style={{backgroundColor: config.bgColor, borderColor: config.color}}
      padding="s20"
      borderRadius="s16"
      borderWidth={2}>
      {/* Header */}
      <Box flexDirection="row" alignItems="center" mb="s16">
        <Box
          width={48}
          height={48}
          borderRadius="s12"
          style={{backgroundColor: config.color}}
          justifyContent="center"
          alignItems="center">
          <Icon name={config.icon as any} size={28} color="surface" />
        </Box>

        <Box ml="s16" flex={1}>
          <Text preset="paragraphMedium" style={{color: config.color}} bold>
            {config.label}
          </Text>
          <Text
            preset="paragraphCaptionSmall"
            style={{color: config.color}}
            mt="s4">
            Score: {safety.score}/100
          </Text>
        </Box>
      </Box>

      {/* Description */}
      <Text preset="paragraphMedium" style={{color: config.color}} mb="s16">
        {config.description}
      </Text>

      {/* Warnings */}
      {safety.warnings.length > 0 && (
        <Box mb="s16">
          <Text preset="paragraphSmall" style={{color: config.color}} bold mb="s8">
            ⚠️ Avisos:
          </Text>
          {safety.warnings.map((warning, index) => (
            <Box key={index} flexDirection="row" alignItems="flex-start" mb="s6">
              <Text preset="paragraphSmall" style={{color: config.color}}>
                • {warning}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Recommendations */}
      {safety.recommendations.length > 0 && (
        <Box>
          <Text preset="paragraphSmall" style={{color: config.color}} bold mb="s8">
            💡 Recomendações:
          </Text>
          {safety.recommendations.map((recommendation, index) => (
            <Box key={index} flexDirection="row" alignItems="flex-start" mb="s6">
              <Text preset="paragraphSmall" style={{color: config.color}}>
                • {recommendation}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {/* Can Depart Flag */}
      <Box
        mt="s16"
        paddingTop="s16"
        style={{borderTopWidth: 1, borderTopColor: config.color}}
        flexDirection="row"
        alignItems="center"
        justifyContent="center">
        <Icon
          name={safety.canDepart ? 'check-circle' : 'cancel'}
          size={20}
          color={config.color as any}
        />
        <Text preset="paragraphMedium" style={{color: config.color}} bold ml="s8">
          {safety.canDepart ? 'Partida Autorizada' : 'Partida NÃO Recomendada'}
        </Text>
      </Box>
    </Box>
  );
}
