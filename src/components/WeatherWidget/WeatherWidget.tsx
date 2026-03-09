import React, {useEffect} from 'react';

import {Box, Icon, Text, TouchableOpacityBox, WeatherIcon, WeatherWidgetSkeleton} from '@components';
import {
  useWeather,
  Region,
  formatTemperature,
  formatWindSpeed,
  formatWindDirection,
  formatVisibility,
  getUvLevel,
  UV_LEVEL_CONFIGS,
} from '@domain';

interface WeatherWidgetProps {
  region?: Region;
  latitude?: number;
  longitude?: number;
  onPress?: () => void;
}

export function WeatherWidget({
  region,
  latitude,
  longitude,
  onPress,
}: WeatherWidgetProps) {
  const {weather, fetchRegionWeather, fetchCurrentWeather, isLoading} =
    useWeather();

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, latitude, longitude]);

  async function loadWeather() {
    try {
      if (region) {
        await fetchRegionWeather(region);
      } else if (latitude !== undefined && longitude !== undefined) {
        await fetchCurrentWeather(latitude, longitude);
      }
    } catch {
      // Serviço de clima indisponível — widget mostra fallback "Clima indisponível"
    }
  }

  if (isLoading) {
    return <WeatherWidgetSkeleton />;
  }

  if (!weather) {
    return (
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        alignItems="center"
        justifyContent="center"
        height={120}>
        <Icon name="cloud-off" size={32} color="textSecondary" />
        <Text preset="paragraphSmall" color="textSecondary" mt="s8">
          Clima indisponível
        </Text>
      </Box>
    );
  }

  const WrapperComponent = onPress ? TouchableOpacityBox : Box;

  return (
    <WrapperComponent
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      onPress={onPress}
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Header */}
      <Box flexDirection="row" justifyContent="space-between" mb="s16">
        <Box>
          <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
            Clima Agora
          </Text>
          <Text preset="paragraphMedium" color="text" bold>
            {weather.location?.name ?? 'Localização'}
          </Text>
        </Box>

        {weather.isSafeForNavigation ? (
          <Box
            backgroundColor="successBg"
            paddingHorizontal="s12"
            paddingVertical="s6"
            borderRadius="s8"
            flexDirection="row"
            alignItems="center">
            <Icon name="check-circle" size={14} color="success" />
            <Text
              preset="paragraphCaptionSmall"
              color="success"
              bold
              ml="s4">
              Seguro
            </Text>
          </Box>
        ) : (
          <Box
            backgroundColor="warningBg"
            paddingHorizontal="s12"
            paddingVertical="s6"
            borderRadius="s8"
            flexDirection="row"
            alignItems="center">
            <Icon name="warning" size={14} color="warning" />
            <Text
              preset="paragraphCaptionSmall"
              color="warning"
              bold
              ml="s4">
              Atenção
            </Text>
          </Box>
        )}
      </Box>

      {/* Main Info */}
      <Box flexDirection="row" alignItems="center" mb="s16">
        <WeatherIcon iconCode={weather.icon} size="large" />

        <Box ml="s16" flex={1}>
          <Text preset="headingLarge" color="text" bold>
            {formatTemperature(weather.temperature)}
          </Text>
          <Text preset="paragraphMedium" color="textSecondary" mt="s4">
            {weather.condition}
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
            Sensação: {formatTemperature(weather.feelsLike)}
          </Text>
        </Box>
      </Box>

      {/* Details Grid */}
      <Box
        flexDirection="row"
        justifyContent="space-between"
        paddingTop="s12"
        borderTopWidth={1}
        borderTopColor="border">
        {/* Umidade */}
        <Box flexDirection="row" alignItems="center">
          <Icon name="water-drop" size={18} color="primary" />
          <Text preset="paragraphSmall" color="text" ml="s6">
            {weather.humidity}%
          </Text>
        </Box>

        {/* Vento */}
        <Box flexDirection="row" alignItems="center">
          <Icon name="air" size={18} color="primary" />
          <Text preset="paragraphSmall" color="text" ml="s6">
            {formatWindSpeed(weather.windSpeed)}
          </Text>
          <Text
            preset="paragraphCaptionSmall"
            color="textSecondary"
            ml="s4">
            {formatWindDirection(weather.windDirection)}
          </Text>
        </Box>

        {/* Nuvens */}
        <Box flexDirection="row" alignItems="center">
          <Icon name="cloud" size={18} color="primary" />
          <Text preset="paragraphSmall" color="text" ml="s6">
            {weather.cloudiness}%
          </Text>
        </Box>
      </Box>

      {/* Pressão + Visibilidade + Descrição */}
      <Box
        flexDirection="row"
        alignItems="center"
        paddingTop="s12"
        mt="s8"
        borderTopWidth={1}
        borderTopColor="border">
        <Box flexDirection="row" alignItems="center" flex={1}>
          <Icon name="compress" size={16} color="primary" />
          <Text preset="paragraphCaptionSmall" color="text" ml="s4">
            {weather.pressure} hPa
          </Text>
        </Box>
        <Box flexDirection="row" alignItems="center" flex={1} justifyContent="center">
          <Icon name="visibility" size={16} color="primary" />
          <Text preset="paragraphCaptionSmall" color="text" ml="s4">
            {formatVisibility(weather.visibility)}
          </Text>
        </Box>
        <Box flex={1} alignItems="flex-end">
          <Text
            preset="paragraphCaptionSmall"
            color="textSecondary"
            numberOfLines={1}>
            {weather.description}
          </Text>
        </Box>
      </Box>

      {/* Sunrise / Sunset / UV */}
      {(weather.sunrise || weather.sunset || weather.uvIndex != null) && (
        <Box
          flexDirection="row"
          justifyContent="space-around"
          alignItems="center"
          paddingTop="s12"
          mt="s8"
          borderTopWidth={1}
          borderTopColor="border">
          {weather.sunrise && (
            <Box flexDirection="row" alignItems="center">
              <Text preset="paragraphSmall" color="textSecondary" mr="s4">🌅</Text>
              <Text preset="paragraphSmall" color="text">
                {new Date(weather.sunrise).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Box>
          )}
          {weather.sunset && (
            <Box flexDirection="row" alignItems="center">
              <Text preset="paragraphSmall" color="textSecondary" mr="s4">🌇</Text>
              <Text preset="paragraphSmall" color="text">
                {new Date(weather.sunset).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Box>
          )}
          {weather.uvIndex != null && (() => {
            const uvCfg = UV_LEVEL_CONFIGS[getUvLevel(weather.uvIndex!)];
            return (
              <Box flexDirection="row" alignItems="center">
                <Text preset="paragraphSmall" color="textSecondary" mr="s4">☀️</Text>
                <Text
                  preset="paragraphSmall"
                  style={{color: uvCfg.color}}>
                  UV {weather.uvIndex} · {uvCfg.label}
                </Text>
              </Box>
            );
          })()}
        </Box>
      )}

      {/* Warnings */}
      {(weather.safetyWarnings?.length ?? 0) > 0 && (
        <Box
          mt="s12"
          backgroundColor="warningBg"
          padding="s12"
          borderRadius="s8">
          <Box flexDirection="row" alignItems="center" mb="s4">
            <Icon name="warning" size={16} color="warning" />
            <Text preset="paragraphCaptionSmall" color="warning" bold ml="s6">
              Avisos
            </Text>
          </Box>
          {weather.safetyWarnings.map((warning, index) => (
            <Text
              key={index}
              preset="paragraphCaptionSmall"
              color="warning"
              style={{marginTop: 2}}>
              • {warning}
            </Text>
          ))}
        </Box>
      )}
    </WrapperComponent>
  );
}
