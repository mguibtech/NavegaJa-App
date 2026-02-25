import React, {useEffect} from 'react';
import {ActivityIndicator} from 'react-native';

import {Box, Icon, Text} from '@components';
import {useRiverLevels, RIVER_LEVEL_STATUS_CONFIGS, RiverLevelStatus} from '@domain';

export function RiverLevelsPanel() {
  const {riverLevels, fetch, isLoading} = useRiverLevels();

  useEffect(() => {
    fetch().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        alignItems="center"
        style={{elevation: 2}}>
        <ActivityIndicator size="small" color="#0B5D8A" />
        <Text preset="paragraphSmall" color="textSecondary" mt="s8">
          Carregando nível dos rios...
        </Text>
      </Box>
    );
  }

  if (riverLevels.length === 0) {
    return null;
  }

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
      {/* Header */}
      <Box flexDirection="row" alignItems="center" mb="s16">
        <Icon name="water" size={20} color="primary" />
        <Text preset="paragraphMedium" color="text" bold ml="s8">
          Nível dos Rios
        </Text>
        <Box flex={1} />
        {riverLevels[0]?.recordedAt && (
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            {riverLevels[0].source}
          </Text>
        )}
      </Box>

      {riverLevels.map((item, index) => {
        const cfg = RIVER_LEVEL_STATUS_CONFIGS[item.levelStatus as RiverLevelStatus] ??
          RIVER_LEVEL_STATUS_CONFIGS.unknown;

        return (
          <Box key={item.stationCode ?? index}>
            {index > 0 && (
              <Box height={1} backgroundColor="border" my="s12" />
            )}

            <Box flexDirection="row" alignItems="center" justifyContent="space-between">
              {/* Estação + Rio */}
              <Box flex={1} mr="s12">
                <Text preset="paragraphSmall" color="text" bold>
                  {item.station}
                </Text>
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  {item.river}
                </Text>
              </Box>

              {/* Nível cm */}
              {item.levelCm != null && (
                <Text preset="paragraphSmall" color="textSecondary" mr="s8">
                  {item.levelCm} cm
                </Text>
              )}

              {/* Badge de status */}
              <Box
                paddingHorizontal="s10"
                paddingVertical="s4"
                borderRadius="s8"
                style={{backgroundColor: cfg.bgColor}}>
                <Text
                  preset="paragraphCaptionSmall"
                  bold
                  style={{color: cfg.color}}>
                  {cfg.label}
                </Text>
              </Box>
            </Box>

            {/* Barra de nível */}
            {item.levelCm != null && (
              <Box mt="s8" height={4} backgroundColor="border" style={{borderRadius: 4}} overflow="hidden">
                <Box
                  height={4}
                  style={{
                    borderRadius: 4,
                    backgroundColor: cfg.color,
                    width: `${Math.min(100, (item.levelCm / 3000) * 100)}%`,
                  }}
                />
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
