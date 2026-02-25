import {useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useStartTrip, useGetWeatherSafety, WeatherSafetyResponse} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

// Coordenadas padrão de Manaus (AM)
const DEFAULT_LAT = -3.119;
const DEFAULT_LNG = -60.0217;

export function getScoreColor(score: number): string {
  if (score >= 70) {return '#16a34a';}
  if (score >= 50) {return '#d97706';}
  return '#dc2626';
}

export function getScoreBg(score: number): string {
  if (score >= 70) {return '#f0fdf4';}
  if (score >= 50) {return '#fffbeb';}
  return '#fef2f2';
}

export function getScoreLabel(score: number): string {
  if (score >= 70) {return 'Condições seguras';}
  if (score >= 50) {return 'Condições moderadas';}
  return 'Condições desfavoráveis';
}

export function getScoreIcon(score: number): string {
  if (score >= 70) {return 'check-circle';}
  if (score >= 50) {return 'warning';}
  return 'dangerous';
}

export function useCaptainStartTrip() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainStartTrip'>>();
  const {tripId} = route.params;
  const toast = useToast();

  const [weather, setWeather] = useState<WeatherSafetyResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {startTrip, isLoading: startLoading} = useStartTrip();
  const {fetch: fetchWeatherSafety} = useGetWeatherSafety();

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWeather() {
    setIsLoading(true);
    try {
      const result = await fetchWeatherSafety(DEFAULT_LAT, DEFAULT_LNG);
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

  function goBack() {
    navigation.goBack();
  }

  const score = weather?.safetyScore ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreBg = getScoreBg(score);

  return {
    weather,
    isLoading,
    startLoading,
    score,
    scoreColor,
    scoreBg,
    handleConfirmStart,
    loadWeather,
    goBack,
    getScoreLabel,
    getScoreIcon,
  };
}
