import {useEffect, useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useStartTrip, useGetWeatherSafety, WeatherSafetyResponse, tripService} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

// Coordenadas das cidades/portos fluviais do Amazonas — chaves sem acentos
const CITY_COORDS: Record<string, {lat: number; lng: number}> = {
  manaus:                     {lat: -3.119,   lng: -60.0217},
  parintins:                  {lat: -2.6277,  lng: -56.736},
  itacoatiara:                {lat: -3.1439,  lng: -58.4442},
  tefe:                       {lat: -3.3684,  lng: -64.7124},
  barreirinha:                {lat: -2.7869,  lng: -57.0501},
  coari:                      {lat: -4.0856,  lng: -63.1416},
  maues:                      {lat: -3.3714,  lng: -57.7189},
  tabatinga:                  {lat: -4.255,   lng: -69.9327},
  labrea:                     {lat: -7.2592,  lng: -64.7986},
  humaita:                    {lat: -7.5057,  lng: -63.0173},
  'benjamin constant':        {lat: -4.3759,  lng: -70.0339},
  'sao gabriel da cachoeira': {lat: -0.1303,  lng: -67.0892},
  borba:                      {lat: -4.384,   lng: -59.5875},
  autazes:                    {lat: -3.5777,  lng: -59.1301},
  'nova olinda do norte':     {lat: -3.8847,  lng: -59.0906},
  'presidente figueiredo':    {lat: -2.0227,  lng: -60.0249},
  iranduba:                   {lat: -3.2819,  lng: -60.1879},
  manacapuru:                 {lat: -3.2998,  lng: -60.6217},
  careiro:                    {lat: -3.3521,  lng: -59.7445},
  anori:                      {lat: -3.7697,  lng: -61.6447},
  'fonte boa':                {lat: -2.5233,  lng: -66.0928},
  manicore:                   {lat: -5.8105,  lng: -61.3024},
  alvaraes:                   {lat: -3.2136,  lng: -64.8067},
  beruri:                     {lat: -3.9005,  lng: -61.3527},
};

/** Normaliza para minúsculas sem acentos, removendo sufixo " - AM/PA" */
function getCityCoords(origin: string): {lat: number; lng: number} {
  const key = origin
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*[-–]\s*(am|pa)\.?\s*$/i, '')
    .trim();
  return CITY_COORDS[key] ?? CITY_COORDS.manaus;
}

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
  const [weatherWarning, setWeatherWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {startTrip, isLoading: startLoading} = useStartTrip();
  const {fetch: fetchWeatherSafety} = useGetWeatherSafety();

  useEffect(() => {
    loadWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWeather() {
    setIsLoading(true);
    setWeatherWarning(null);
    try {
      const trip = await tripService.getTripById(tripId);
      // Prefer real coordinates from geocoding; fall back to city-name lookup
      const lat = trip.originLat ?? getCityCoords(trip.origin).lat;
      const lng = trip.originLng ?? getCityCoords(trip.origin).lng;
      const result = await fetchWeatherSafety(lat, lng);
      setWeather(result);
      // Backend may include a weather warning even on 200
      if ((result as any)?.weatherWarning) {
        setWeatherWarning((result as any).weatherWarning as string);
      }
    } catch (err: any) {
      // 503 Service Unavailable — weather service is down
      if (err?.statusCode === 503) {
        setWeatherWarning('Serviço meteorológico indisponível. Verifique as condições locais antes de partir.');
      }
      // Falha silenciosa para outros erros — exibe opção de iniciar mesmo assim
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
    weatherWarning,
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
