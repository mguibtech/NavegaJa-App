import React, {useEffect, useState} from 'react';
import {ScrollView, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';

import {Box, Icon, Text, TouchableOpacityBox, WeatherWidget, RiverLevelsPanel, FloodForecastPanel, WeatherIcon, WeatherAlertCard, ForecastCardSkeleton, WeatherAlertCardSkeleton} from '@components';
import {
  useWeatherForecast,
  useWeatherAlerts,
  REGION_COORDINATES,
  Region,
  AlertSeverity,
  formatTemperature,
  WeatherForecastDay,
} from '@domain';
import type {AppStackParamList} from '@routes';

interface WeatherScreenProps {
  route?: {params?: {region?: Region}};
}

function ForecastCard({day}: {day: WeatherForecastDay}) {
  const date = new Date(day.date);
  const weekday = date.toLocaleDateString('pt-BR', {weekday: 'short'});
  const dayNum = date.getDate();
  const tempAvg = day.tempAvg ?? Math.round((day.tempMin + day.tempMax) / 2);

  const safeColor = day.isSafeForNavigation ? '#10B981' : '#F59E0B';
  const safeBg = day.isSafeForNavigation ? '#D1FAE5' : '#FEF3C7';

  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      mr="s12"
      style={{
        width: 110,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
      }}>
      <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
        {weekday.replace('.', '')} {dayNum}
      </Text>

      <WeatherIcon iconCode={day.icon} size="medium" />

      <Text preset="paragraphSmall" color="text" bold mt="s8">
        {formatTemperature(day.tempMax)}
      </Text>
      <Text preset="paragraphCaptionSmall" color="textSecondary">
        {formatTemperature(day.tempMin)}
      </Text>
      <Text preset="paragraphCaptionSmall" color="textSecondary">
        méd {formatTemperature(tempAvg)}
      </Text>

      {day.precipitationProbability > 0 && (
        <Box flexDirection="row" alignItems="center" mt="s4">
          <Icon name="water-drop" size={12} color="primary" />
          <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s4">
            {day.precipitationProbability}%
          </Text>
        </Box>
      )}
      {day.precipitation > 0 && (
        <Text preset="paragraphCaptionSmall" color="textSecondary">
          {day.precipitation.toFixed(1)} mm
        </Text>
      )}

      <Box
        mt="s8"
        paddingVertical="s4"
        paddingHorizontal="s6"
        borderRadius="s8"
        alignItems="center"
        style={{backgroundColor: safeBg}}>
        <Text preset="paragraphCaptionSmall" bold style={{color: safeColor}}>
          {day.isSafeForNavigation ? '✅' : '⚠️'}
        </Text>
      </Box>
    </Box>
  );
}

export function WeatherScreen({route}: WeatherScreenProps) {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const region: Region = route?.params?.region ?? 'manaus';
  const coords = REGION_COORDINATES[region];

  const {forecast, fetchRegion, isLoading: isForecastLoading} = useWeatherForecast();
  const {alerts: weatherAlerts, fetchRegionAlerts, isLoading: isAlertsLoading} = useWeatherAlerts();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRegion(region, 5).catch(() => {});
    fetchRegionAlerts(region).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([fetchRegion(region, 5), fetchRegionAlerts(region)]);
    } catch {
      // ignore
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s24"
        paddingBottom="s16"
        borderBottomWidth={1}
        borderBottomColor="border"
        style={{paddingTop: top + 16}}>
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            width={40}
            height={40}
            alignItems="center"
            justifyContent="center"
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>
          <Box flex={1} alignItems="center">
            <Text preset="headingSmall" color="text" bold>
              Condições Climáticas
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              {coords.name}
            </Text>
          </Box>
          <Box width={40} />
        </Box>
      </Box>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 20, paddingBottom: 40}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>

        {/* Clima atual */}
        <Text preset="paragraphMedium" color="text" bold mb="s12">
          Agora
        </Text>
        <WeatherWidget region={region as Region} />

        {/* Alertas Ativos */}
        {(isAlertsLoading || weatherAlerts.length > 0) && (
          <Box mt="s24">
            <Box flexDirection="row" alignItems="center" mb="s12">
              <Icon name="warning" size={18} color={'#DC2626' as any} />
              <Text preset="paragraphMedium" color="text" bold ml="s8">
                Alertas Ativos
              </Text>
              {!isAlertsLoading && (
                <Box
                  ml="s8"
                  paddingHorizontal="s8"
                  paddingVertical="s4"
                  borderRadius="s8"
                  style={{backgroundColor: '#FEE2E2'}}>
                  <Text
                    preset="paragraphCaptionSmall"
                    bold
                    style={{color: '#DC2626'}}>
                    {weatherAlerts.length}
                  </Text>
                </Box>
              )}
            </Box>
            {isAlertsLoading ? (
              <>
                <WeatherAlertCardSkeleton />
                <WeatherAlertCardSkeleton />
              </>
            ) : (
              weatherAlerts
                .sort((a, b) => {
                  const order: Record<string, number> = {
                    extreme: 0,
                    severe: 1,
                    warning: 2,
                    info: 3,
                  };
                  return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
                })
                .map(alert => (
                  <WeatherAlertCard key={alert.id} alert={alert} />
                ))
            )}
          </Box>
        )}

        {/* Previsão 5 dias */}
        <Box mt="s24" mb="s12">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Icon name="calendar-today" size={18} color="primary" />
            <Text preset="paragraphMedium" color="text" bold ml="s8">
              Previsão 5 Dias
            </Text>
          </Box>

          {isForecastLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box flexDirection="row" paddingBottom="s8">
                {Array.from({length: 5}).map((_, i) => (
                  <ForecastCardSkeleton key={i} />
                ))}
              </Box>
            </ScrollView>
          ) : forecast?.forecast && forecast.forecast.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box flexDirection="row" paddingBottom="s8">
                {forecast.forecast.map((day, i) => (
                  <ForecastCard key={i} day={day} />
                ))}
              </Box>
            </ScrollView>
          ) : (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s24"
              alignItems="center">
              <Icon name="cloud-off" size={32} color="textSecondary" />
              <Text preset="paragraphSmall" color="textSecondary" mt="s8">
                Previsão indisponível
              </Text>
            </Box>
          )}
        </Box>

        {/* Nível dos Rios */}
        <Box mt="s8">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Icon name="water" size={18} color="primary" />
            <Text preset="paragraphMedium" color="text" bold ml="s8">
              Nível dos Rios
            </Text>
          </Box>
          <RiverLevelsPanel />
        </Box>

        {/* Previsão de Cheias — Google Flood Hub */}
        <Box mt="s24">
          <Box flexDirection="row" alignItems="center" mb="s12">
            <Icon name="flood" size={18} color="primary" />
            <Text preset="paragraphMedium" color="text" bold ml="s8">
              Previsão de Cheias
            </Text>
          </Box>
          <FloodForecastPanel lat={coords.lat} lng={coords.lng} />
        </Box>

        {/* Legenda nível dos rios */}
        <Box
          mt="s16"
          backgroundColor="surface"
          borderRadius="s12"
          padding="s16"
          style={{elevation: 1}}>
          <Text preset="paragraphCaptionSmall" color="textSecondary" bold mb="s8">
            Legenda — Nível dos Rios
          </Text>
          {[
            {status: 'Baixo', color: '#B45309', desc: 'Rio muito baixo — risco de encalhe'},
            {status: 'Normal', color: '#059669', desc: 'Navegação normal'},
            {status: 'Atenção', color: '#D97706', desc: 'Nível de atenção'},
            {status: 'Alerta', color: '#EA580C', desc: 'Alerta — obstáculos submersos'},
            {status: 'Emergência', color: '#DC2626', desc: 'Emergência — navegação restrita'},
          ].map(item => (
            <Box key={item.status} flexDirection="row" alignItems="center" mb="s4">
              <Box
                width={10}
                height={10}
                borderRadius="s8"
                mr="s8"
                style={{backgroundColor: item.color}}
              />
              <Text preset="paragraphCaptionSmall" color="text" bold mr="s4">
                {item.status}:
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" flex={1}>
                {item.desc}
              </Text>
            </Box>
          ))}
        </Box>
      </ScrollView>
    </Box>
  );
}
