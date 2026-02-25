import React, {useEffect} from 'react';
import {ActivityIndicator} from 'react-native';

import {Box, Icon, Text, WeatherIcon} from '@components';
import {
  useTripWeather,
  formatTemperature,
  formatWindSpeed,
} from '@domain';

interface TripWeatherWidgetProps {
  tripId: string;
}

export function TripWeatherWidget({tripId}: TripWeatherWidgetProps) {
  const {tripWeather, fetch, isLoading, error} = useTripWeather();

  useEffect(() => {
    fetch(tripId).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  if (isLoading) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s16"
        flexDirection="row"
        alignItems="center"
        style={{elevation: 2}}>
        <ActivityIndicator size="small" color="#0B5D8A" />
        <Text preset="paragraphSmall" color="textSecondary" ml="s12">
          Verificando clima da viagem...
        </Text>
      </Box>
    );
  }

  if (error || !tripWeather) {
    return null;
  }

  const w = tripWeather.weather;
  const isSafe = tripWeather.isSafeForNavigation;
  const score = tripWeather.safetyScore;

  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const scoreBg = score >= 80 ? '#D1FAE5' : score >= 60 ? '#FEF3C7' : '#FEE2E2';

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Título */}
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
        <Box flexDirection="row" alignItems="center">
          <Icon name="wb-sunny" size={16} color="primary" />
          <Text preset="paragraphSmall" color="text" bold ml="s8">
            Clima na Partida
          </Text>
        </Box>
        <Box
          paddingHorizontal="s10"
          paddingVertical="s4"
          borderRadius="s8"
          style={{backgroundColor: scoreBg}}>
          <Text preset="paragraphCaptionSmall" bold style={{color: scoreColor}}>
            {isSafe ? '✅ Favorável' : '⚠️ Atenção'} · {score}/100
          </Text>
        </Box>
      </Box>

      {/* Info principal */}
      <Box flexDirection="row" alignItems="center" mb="s12">
        <WeatherIcon iconCode={w.icon} size="medium" />
        <Box ml="s12" flex={1}>
          <Box flexDirection="row" alignItems="baseline">
            <Text preset="headingSmall" color="text" bold>
              {formatTemperature(w.temperature)}
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" ml="s8">
              {w.condition}
            </Text>
          </Box>
          <Box flexDirection="row" gap="s12" mt="s4">
            <Box flexDirection="row" alignItems="center">
              <Icon name="water-drop" size={14} color="primary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                {w.humidity}%
              </Text>
            </Box>
            <Box flexDirection="row" alignItems="center">
              <Icon name="air" size={14} color="primary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
                {formatWindSpeed(w.windSpeed)}
              </Text>
            </Box>
            {w.sunrise && (
              <Box flexDirection="row" alignItems="center">
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  🌅 {new Date(w.sunrise).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                </Text>
              </Box>
            )}
            {w.sunset && (
              <Box flexDirection="row" alignItems="center">
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  🌇 {new Date(w.sunset).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                </Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Avisos */}
      {tripWeather.warnings.length > 0 && (
        <Box
          style={{backgroundColor: '#FEF3C7'}}
          padding="s12"
          borderRadius="s8"
          mb="s8">
          {tripWeather.warnings.map((w2, i) => (
            <Text key={i} preset="paragraphCaptionSmall" style={{color: '#92400E'}}>
              ⚠️ {w2}
            </Text>
          ))}
        </Box>
      )}

      {/* Recomendações */}
      {tripWeather.recommendations.length > 0 && (
        <Box
          style={{backgroundColor: '#D1FAE5'}}
          padding="s12"
          borderRadius="s8">
          {tripWeather.recommendations.map((r, i) => (
            <Text key={i} preset="paragraphCaptionSmall" style={{color: '#065F46'}}>
              ✅ {r}
            </Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
