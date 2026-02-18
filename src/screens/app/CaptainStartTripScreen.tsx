import React, {useEffect, useState} from 'react';
import {ScrollView, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {captainAPI, useStartTrip, WeatherSafetyResponse} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainStartTrip'>;

// Coordenadas padrão de Manaus (AM)
const DEFAULT_LAT = -3.119;
const DEFAULT_LNG = -60.0217;

function getScoreColor(score: number): string {
  if (score >= 70) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

function getScoreBg(score: number): string {
  if (score >= 70) return '#f0fdf4';
  if (score >= 50) return '#fffbeb';
  return '#fef2f2';
}

function getScoreLabel(score: number): string {
  if (score >= 70) return 'Condições seguras';
  if (score >= 50) return 'Condições moderadas';
  return 'Condições desfavoráveis';
}

function getScoreIcon(score: number): string {
  if (score >= 70) return 'check-circle';
  if (score >= 50) return 'warning';
  return 'dangerous';
}

export function CaptainStartTripScreen({navigation, route}: Props) {
  const {tripId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const [weather, setWeather] = useState<WeatherSafetyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {startTrip, isLoading: startLoading} = useStartTrip();

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWeather() {
    setIsLoading(true);
    try {
      const result = await captainAPI.getWeatherSafety(DEFAULT_LAT, DEFAULT_LNG);
      setWeather(result);
    } catch {
      // Falha silenciosa — exibe opção de iniciar mesmo assim
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmStart() {
    try {
      await startTrip(tripId);
      toast.showSuccess('Viagem iniciada com sucesso!');
      // Volta 2 telas: CaptainStartTrip + CaptainChecklist → TripManage
      navigation.pop(2);
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao iniciar viagem');
    }
  }

  const score = weather?.safetyScore ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBg(score);

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          paddingBottom: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Button
          title=""
          preset="outline"
          leftIcon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Box flex={1} ml="s12">
          <Text preset="headingSmall" color="text" bold>
            Condições Climáticas
          </Text>
          <Text preset="paragraphCaptionSmall" color="textSecondary">
            Passo 2 de 2 — Verificação antes do início
          </Text>
        </Box>
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 120}}>
        {isLoading ? (
          <Box alignItems="center" justifyContent="center" py="s40">
            <ActivityIndicator size="large" color="#0a6fbd" />
            <Text preset="paragraphSmall" color="textSecondary" mt="s16">
              Verificando condições climáticas...
            </Text>
          </Box>
        ) : !weather ? (
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s24"
            alignItems="center">
            <Icon name="cloud-off" size={48} color="textSecondary" />
            <Text preset="paragraphMedium" color="text" bold mt="s16" textAlign="center">
              Dados climáticos indisponíveis
            </Text>
            <Text preset="paragraphSmall" color="textSecondary" mt="s8" textAlign="center">
              Não foi possível verificar as condições. Proceda com cautela.
            </Text>
            <Box mt="s20" width="100%">
              <Button
                title={startLoading ? 'Iniciando...' : 'Iniciar Mesmo Assim'}
                onPress={handleConfirmStart}
                disabled={startLoading}
                preset="outline"
              />
            </Box>
          </Box>
        ) : (
          <>
            {/* Safety Level Card */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{elevation: 3}}>
              {/* Level Badge */}
              <Box
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="center"
                style={{backgroundColor: scoreBg}}>
                <Icon name={getScoreIcon(score)} size={28} color="text" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphMedium" bold style={{color: scoreColor}}>
                    {getScoreLabel(score)}
                  </Text>
                  <Text preset="paragraphCaptionSmall" style={{color: scoreColor}}>
                    {weather.recommendation}
                  </Text>
                </Box>
                <Text preset="headingSmall" bold style={{color: scoreColor}}>
                  {score}
                </Text>
              </Box>

              {/* Score bar */}
              <Box mb="s16">
                <Box flexDirection="row" justifyContent="space-between" mb="s6">
                  <Text preset="paragraphCaptionSmall" color="textSecondary">
                    Índice de segurança
                  </Text>
                  <Text preset="paragraphCaptionSmall" color="text" bold>
                    {score}/100
                  </Text>
                </Box>
                <Box
                  backgroundColor="border"
                  height={8}
                  overflow="hidden"
                  style={{borderRadius: 4}}>
                  <Box
                    height={8}
                    style={{
                      borderRadius: 4,
                      width: `${score}%`,
                      backgroundColor: scoreColor,
                    }}
                  />
                </Box>
              </Box>

              {/* Weather metrics */}
              {(weather.conditions?.temperature != null ||
                weather.conditions?.windSpeed != null ||
                weather.conditions?.humidity != null ||
                weather.conditions?.condition != null) && (
                <Box
                  borderTopWidth={1}
                  borderTopColor="border"
                  paddingTop="s16"
                  flexDirection="row"
                  flexWrap="wrap"
                  gap="s16">
                  {weather.conditions?.temperature != null && (
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="thermostat" size={18} color="textSecondary" />
                      <Text preset="paragraphSmall" color="text" ml="s6">
                        {weather.conditions.temperature}°C
                      </Text>
                    </Box>
                  )}
                  {weather.conditions?.windSpeed != null && (
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="air" size={18} color="textSecondary" />
                      <Text preset="paragraphSmall" color="text" ml="s6">
                        {weather.conditions.windSpeed} km/h
                      </Text>
                    </Box>
                  )}
                  {weather.conditions?.humidity != null && (
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="water-drop" size={18} color="textSecondary" />
                      <Text preset="paragraphSmall" color="text" ml="s6">
                        {weather.conditions.humidity}% umidade
                      </Text>
                    </Box>
                  )}
                  {weather.conditions?.condition != null && (
                    <Box flexDirection="row" alignItems="center">
                      <Icon name="wb-cloudy" size={18} color="textSecondary" />
                      <Text preset="paragraphSmall" color="text" ml="s6">
                        {weather.conditions.condition}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Action */}
            {score < 50 ? (
              // Score crítico → bloquear completamente
              <Box
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s20"
                alignItems="center">
                <Icon name="dangerous" size={36} color="danger" />
                <Text preset="paragraphMedium" color="danger" bold mt="s12" textAlign="center">
                  Condições críticas — viagem bloqueada
                </Text>
                <Text preset="paragraphSmall" color="danger" mt="s8" textAlign="center">
                  Índice de segurança abaixo de 50. A viagem não pode ser iniciada nestas condições.
                </Text>
              </Box>
            ) : weather.isSafe ? (
              // Seguro → confirmar normalmente
              <Button
                title={startLoading ? 'Iniciando...' : 'Confirmar Início da Viagem'}
                onPress={handleConfirmStart}
                disabled={startLoading}
              />
            ) : (
              // Não seguro mas score ≥ 50 → avisar e permitir com responsabilidade
              <>
                <Box
                  backgroundColor="warningBg"
                  borderRadius="s12"
                  padding="s16"
                  mb="s16"
                  flexDirection="row"
                  alignItems="center">
                  <Icon name="warning" size={24} color="warning" />
                  <Text preset="paragraphSmall" color="warning" bold ml="s12" flex={1}>
                    Condições moderadas. Proceda com cautela e atenção redobrada.
                  </Text>
                </Box>
                <Button
                  title={
                    startLoading
                      ? 'Iniciando...'
                      : 'Iniciar (sob sua responsabilidade)'
                  }
                  onPress={handleConfirmStart}
                  disabled={startLoading}
                  preset="outline"
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </Box>
  );
}
