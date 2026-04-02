import React from 'react';
import {ScrollView, ActivityIndicator, StyleSheet} from 'react-native';

import {Box, Button, Icon, Text, ScreenHeader} from '@components';

import {
  useCaptainStartTrip,
  getScoreLabel,
  getScoreIcon,
} from './useCaptainStartTrip';

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  card: {
    elevation: 3,
  },
  scoreBarTrack: {
    borderRadius: 4,
  },
  scoreBarFill: {
    borderRadius: 4,
  },
});

function getScoreBackgroundStyle(backgroundColor: string) {
  return {
    backgroundColor,
  };
}

function getScoreTextStyle(color: string) {
  return {
    color,
  };
}

function getScoreBarStyle(width: string, backgroundColor: string) {
  return {
    borderRadius: 4,
    width: width as `${number}%`,
    backgroundColor,
  };
}

export function CaptainStartTripScreen() {
  const {
    weather,
    weatherWarning,
    isLoading,
    startLoading,
    score,
    scoreColor,
    scoreBg,
    handleConfirmStart,
    goBack,
  } = useCaptainStartTrip();

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Condições Climáticas" subtitle="Passo 2 de 2 — Verificação antes do início" onBack={goBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            {/* Weather Warning Banner */}
            {weatherWarning && (
              <Box
                backgroundColor="warningBg"
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="flex-start">
                <Icon name="warning" size={20} color="warning" />
                <Text preset="paragraphSmall" color="warning" ml="s12" flex={1}>
                  {weatherWarning}
                </Text>
              </Box>
            )}

            {/* Safety Level Card */}
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={styles.card}>
              {/* Level Badge */}
              <Box
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="center"
                style={getScoreBackgroundStyle(scoreBg)}>
                <Icon name={getScoreIcon(score)} size={28} color="text" />
                <Box flex={1} ml="s12">
                  <Text preset="paragraphMedium" bold style={getScoreTextStyle(scoreColor)}>
                    {getScoreLabel(score)}
                  </Text>
                  <Text preset="paragraphCaptionSmall" style={getScoreTextStyle(scoreColor)}>
                    {weather.recommendation}
                  </Text>
                </Box>
                <Text preset="headingSmall" bold style={getScoreTextStyle(scoreColor)}>
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
                  style={styles.scoreBarTrack}>
                  <Box
                    height={8}
                    style={getScoreBarStyle(`${score}%`, scoreColor)}
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
