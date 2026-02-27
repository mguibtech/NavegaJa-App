import React, {useEffect, useRef, useState} from 'react';
import {Modal, Animated, StyleSheet, TouchableOpacity, Dimensions, ScrollView} from 'react-native';
import {useTheme} from '@shopify/restyle';
import {BarChart} from 'react-native-chart-kit';

import {Box, Button, Icon, Text} from '@components';
import {Theme} from '@theme';
import {
  RiverLevel,
  RIVER_LEVEL_STATUS_CONFIGS,
  RiverLevelStatus,
  useRiverLevel,
  weatherAPI,
  WeatherForecastDay,
} from '@domain';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface RiverDetailModalProps {
  visible: boolean;
  riverLevel: RiverLevel | null;
  onClose: () => void;
}

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return '—';
  }
}

function formatRecordedAt(raw: string): string {
  // Backend retorna "25/02/2026 06:00:00"
  if (!raw) return '—';
  const [datePart, timePart] = raw.split(' ');
  if (!datePart) return raw;
  const [day, month, year] = datePart.split('/');
  if (!timePart) return `${day}/${month}/${year}`;
  const [h, m] = timePart.split(':');
  return `${day}/${month}/${year} às ${h}:${m}`;
}

function LevelBar({
  levelCm,
  color,
}: {
  levelCm: number | null;
  color: string;
}) {
  const MAX_CM = 3000;
  const pct = levelCm != null ? Math.min(100, (levelCm / MAX_CM) * 100) : 0;

  return (
    <Box>
      <Box
        height={10}
        backgroundColor="border"
        style={{borderRadius: 6}}
        overflow="hidden"
        mb="s8">
        <Box
          height={10}
          style={{
            borderRadius: 6,
            backgroundColor: color,
            width: `${pct}%`,
          }}
        />
      </Box>
      <Box flexDirection="row" justifyContent="space-between">
        <Text preset="paragraphCaptionSmall" color="textSecondary">
          0 cm
        </Text>
        <Text preset="paragraphCaptionSmall" color="textSecondary">
          3.000 cm (ref. máx.)
        </Text>
      </Box>
    </Box>
  );
}

export function RiverDetailModal({
  visible,
  riverLevel: initialLevel,
  onClose,
}: RiverDetailModalProps) {
  const {colors} = useTheme<Theme>();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {fetch: fetchFresh, isLoading} = useRiverLevel();
  const [current, setCurrent] = useState<RiverLevel | null>(initialLevel);
  const [forecast, setForecast] = useState<WeatherForecastDay[]>([]);
  const [isForecastLoading, setIsForecastLoading] = useState(false);

  // Sincroniza quando o modal abre com um novo item
  useEffect(() => {
    setCurrent(initialLevel);
  }, [initialLevel]);

  useEffect(() => {
    if (visible) {
      // Buscar previsão de precipitação (Manaus como referência da bacia amazônica)
      setIsForecastLoading(true);
      weatherAPI
        .getForecast(-3.119, -60.0217, 5)
        .then(data => setForecast(data.forecast.slice(0, 5)))
        .catch(() => {})
        .finally(() => setIsForecastLoading(false));

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  async function handleRefresh() {
    if (!current?.stationCode) return;
    const fresh = await fetchFresh(current.stationCode);
    if (fresh) setCurrent(fresh);
  }

  if (!current) return null;

  const cfg =
    RIVER_LEVEL_STATUS_CONFIGS[current.levelStatus as RiverLevelStatus] ??
    RIVER_LEVEL_STATUS_CONFIGS.unknown;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, {opacity: fadeAnim}]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {transform: [{translateY: slideAnim}], backgroundColor: colors.surface},
        ]}>
        {/* Handle */}
        <Box alignItems="center" paddingTop="s12" mb="s4">
          <Box
            width={40}
            height={4}
            backgroundColor="border"
            style={{borderRadius: 2}}
          />
        </Box>

        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="s24"
          paddingVertical="s16"
          borderBottomWidth={1}
          borderBottomColor="border">
          <Box flex={1} mr="s12">
            <Text preset="headingSmall" color="text" bold numberOfLines={1}>
              {current.river}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
              Estação: {current.station}
            </Text>
          </Box>
          <TouchableOpacity onPress={onClose}>
            <Box
              width={32}
              height={32}
              borderRadius="s16"
              backgroundColor="border"
              alignItems="center"
              justifyContent="center">
              <Icon name="close" size={18} color="textSecondary" />
            </Box>
          </TouchableOpacity>
        </Box>

        <ScrollView showsVerticalScrollIndicator={false}>
        <Box padding="s24">
          {/* Nível em destaque */}
          <Box
            padding="s20"
            borderRadius="s16"
            mb="s20"
            style={{backgroundColor: cfg.bgColor}}>
            <Box flexDirection="row" alignItems="flex-end" mb="s12">
              <Text
                preset="headingLarge"
                bold
                style={{color: cfg.color, fontSize: 48, lineHeight: 52}}>
                {current.levelCm != null ? current.levelCm : '—'}
              </Text>
              {current.levelCm != null && (
                <Text
                  preset="paragraphMedium"
                  style={{color: cfg.color, marginBottom: 6, marginLeft: 6}}>
                  cm
                </Text>
              )}
            </Box>

            {/* Badge de status */}
            <Box
              alignSelf="flex-start"
              paddingHorizontal="s12"
              paddingVertical="s6"
              borderRadius="s8"
              style={{backgroundColor: cfg.color}}>
              <Text
                preset="paragraphSmall"
                bold
                style={{color: '#FFFFFF'}}>
                {cfg.label}
              </Text>
            </Box>
          </Box>

          {/* Descrição do status */}
          <Box
            flexDirection="row"
            alignItems="flex-start"
            backgroundColor="surface"
            padding="s16"
            borderRadius="s12"
            mb="s20"
            style={{elevation: 1}}>
            <Icon name="info" size={20} color="primary" />
            <Text
              preset="paragraphSmall"
              color="textSecondary"
              flex={1}
              ml="s12">
              {cfg.description}
            </Text>
          </Box>

          {/* Barra de nível */}
          {current.levelCm != null && (
            <Box mb="s24">
              <Text
                preset="paragraphCaptionSmall"
                color="textSecondary"
                bold
                mb="s8">
                NÍVEL RELATIVO
              </Text>
              <LevelBar levelCm={current.levelCm} color={cfg.color} />
            </Box>
          )}

          {/* Gráfico de precipitação prevista */}
          {(() => {
            const chartLabels = forecast.map(d => formatShortDate(d.date));
            const chartData = forecast.map(d => d.precipitation ?? 0);
            const hasChart = chartData.length > 0 && chartData.some(v => v > 0);
            const chartWidth = SCREEN_WIDTH - 48;

            return (
              <Box mb="s24">
                <Text
                  preset="paragraphCaptionSmall"
                  color="textSecondary"
                  bold
                  mb="s8">
                  PRECIPITAÇÃO PREVISTA (5 DIAS)
                </Text>
                {isForecastLoading ? (
                  <Box
                    height={120}
                    backgroundColor="border"
                    borderRadius="s12"
                    style={{opacity: 0.5}}
                  />
                ) : hasChart ? (
                  <Box
                    backgroundColor="surface"
                    borderRadius="s12"
                    overflow="hidden"
                    style={{elevation: 2}}>
                    <BarChart
                      data={{
                        labels: chartLabels,
                        datasets: [{data: chartData}],
                      }}
                      width={chartWidth}
                      height={140}
                      yAxisLabel=""
                      yAxisSuffix=" mm"
                      chartConfig={{
                        backgroundColor: '#FFFFFF',
                        backgroundGradientFrom: '#FFFFFF',
                        backgroundGradientTo: '#FFFFFF',
                        decimalPlaces: 1,
                        color: () => '#0B5D8A',
                        labelColor: () => '#6B7280',
                        style: {borderRadius: 12},
                        barPercentage: 0.6,
                      }}
                      style={{borderRadius: 12}}
                      withInnerLines={false}
                      showValuesOnTopOfBars
                      fromZero
                    />
                  </Box>
                ) : (
                  <Box
                    backgroundColor="surface"
                    borderRadius="s12"
                    padding="s16"
                    alignItems="center"
                    style={{elevation: 1}}>
                    <Icon name="wb-sunny" size={24} color="textSecondary" />
                    <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s8" textAlign="center">
                      Sem precipitação prevista nos próximos 5 dias
                    </Text>
                  </Box>
                )}
                <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s6">
                  Fonte: OpenWeatherMap · Região de Manaus
                </Text>
              </Box>
            );
          })()}

          {/* Metadados */}
          <Box
            backgroundColor="surface"
            borderRadius="s12"
            padding="s16"
            mb="s24"
            style={{elevation: 1}}>
            <Box
              flexDirection="row"
              alignItems="center"
              mb="s12">
              <Icon name="schedule" size={16} color="textSecondary" />
              <Text
                preset="paragraphCaptionSmall"
                color="textSecondary"
                ml="s8">
                Última leitura: {formatRecordedAt(current.recordedAt)}
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="satellite-alt" size={16} color="textSecondary" />
              <Text
                preset="paragraphCaptionSmall"
                color="textSecondary"
                ml="s8">
                Fonte: {current.source} · Estação {current.stationCode}
              </Text>
            </Box>
          </Box>

          {/* Botão de atualizar */}
          <Button
            title={isLoading ? 'Atualizando...' : 'Atualizar dados'}
            preset="outline"
            onPress={handleRefresh}
            disabled={isLoading}
          />
        </Box>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
});
