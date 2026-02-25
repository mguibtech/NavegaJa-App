import {useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {getReviewsByCaptainUseCase, Review} from '@domain';
import {API_BASE_URL} from '@api/config';

import {AppStackParamList} from '@routes';

export function useCaptainProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainProfile'>>();

  const {
    captainId,
    captainName,
    captainRating,
    captainTotalTrips,
    captainLevel,
    captainCreatedAt,
    captainAvatarUrl,
    captainIsVerified,
    captainHasLicensePhoto,
  } = route.params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    getReviewsByCaptainUseCase(captainId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [captainId]);

  const overallAvg =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.captainRating ?? r.passengerRating ?? 0), 0) /
        reviews.length
      : captainRating
      ? Number(captainRating)
      : 0;

  const avgPunctuality = (() => {
    const vals = reviews
      .map(r => r.punctualityRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const avgCommunication = (() => {
    const vals = reviews
      .map(r => r.communicationRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const memberSince = captainCreatedAt
    ? new Date(captainCreatedAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const avatarUri = captainAvatarUrl
    ? captainAvatarUrl.startsWith('http')
      ? captainAvatarUrl
          .replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL)
          .replace(/http:\/\/127\.0\.0\.1(:\d+)?/, API_BASE_URL)
      : `${API_BASE_URL}${captainAvatarUrl}`
    : null;
  const showAvatar = avatarUri != null && !avatarError;

  return {
    navigation,
    captainName,
    captainTotalTrips,
    captainLevel,
    captainIsVerified,
    captainHasLicensePhoto,
    reviews,
    loading,
    avatarError,
    setAvatarError,
    overallAvg,
    avgPunctuality,
    avgCommunication,
    memberSince,
    avatarUri,
    showAvatar,
  };
}
