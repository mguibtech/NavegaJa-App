import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';

import {Box, Icon, Text, RiverLevelsSkeleton, TouchableOpacityBox, RiverDetailModal} from '@components';
import {useRiverLevels, RIVER_LEVEL_STATUS_CONFIGS, RiverLevelStatus, RiverLevel} from '@domain';

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelBarTrack: {
    borderRadius: 4,
  },
  levelBarFill: {
    borderRadius: 4,
  },
});

export function RiverLevelsPanel() {
  const {riverLevels, fetch, isLoading} = useRiverLevels();
  const [selectedRiver, setSelectedRiver] = useState<RiverLevel | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  function handleRowPress(item: RiverLevel) {
    setSelectedRiver(item);
    setModalVisible(true);
  }

  useEffect(() => {
    fetch().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <RiverLevelsSkeleton count={3} />;
  }

  if (riverLevels.length === 0) {
    return null;
  }

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={styles.card}>
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
          <TouchableOpacityBox
            key={item.stationCode ?? index}
            onPress={() => handleRowPress(item)}
            activeOpacity={0.7}>
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

              {/* Badge de status + chevron */}
              <Box flexDirection="row" alignItems="center" gap="s8">
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
                <Icon name="chevron-right" size={14} color="textSecondary" />
              </Box>
            </Box>

            {/* Barra de nível */}
            {item.levelCm != null && (
              <Box
                mt="s8"
                height={4}
                backgroundColor="border"
                style={styles.levelBarTrack}
                overflow="hidden">
                <Box
                  height={4}
                  style={{
                    ...styles.levelBarFill,
                    backgroundColor: cfg.color,
                    width: `${Math.min(100, (item.levelCm / 3000) * 100)}%`,
                  }}
                />
              </Box>
            )}
          </TouchableOpacityBox>
        );
      })}

      <RiverDetailModal
        visible={modalVisible}
        riverLevel={selectedRiver}
        onClose={() => setModalVisible(false)}
      />
    </Box>
  );
}
