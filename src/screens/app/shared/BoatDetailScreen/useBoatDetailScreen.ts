import {useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {getReviewsByBoatUseCase, Review} from '@domain';
import {API_BASE_URL} from '@api/config';

import {AppStackParamList} from '@routes';

export function useBoatDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'BoatDetail'>>();

  const {
    boatId,
    boatName,
    boatType,
    boatCapacity,
    boatModel,
    boatYear,
    boatAmenities,
    boatRegistrationNum,
    boatIsVerified,
    boatPhotoUrl,
    boatCreatedAt,
  } = route.params;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);

  useEffect(() => {
    getReviewsByBoatUseCase(boatId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [boatId]);

  const overallAvg =
    reviews.length > 0
      ? reviews
          .filter(r => (r.boatRating ?? 0) > 0)
          .reduce((sum, r) => sum + (r.boatRating ?? 0), 0) /
        reviews.filter(r => (r.boatRating ?? 0) > 0).length
      : 0;

  const avgCleanliness = (() => {
    const vals = reviews
      .map(r => r.cleanlinessRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const avgComfort = (() => {
    const vals = reviews
      .map(r => r.comfortRating)
      .filter((v): v is number => v != null && v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  const addedSince = boatCreatedAt
    ? new Date(boatCreatedAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const photoUri = boatPhotoUrl
    ? boatPhotoUrl.startsWith('http')
      ? boatPhotoUrl
          .replace(/http:\/\/localhost(:\d+)?/, API_BASE_URL)
          .replace(/http:\/\/127\.0\.0\.1(:\d+)?/, API_BASE_URL)
      : `${API_BASE_URL}${boatPhotoUrl}`
    : null;
  const showPhoto = photoUri != null && !photoError;

  const amenities = boatAmenities ?? [];

  return {
    navigation,
    boatName,
    boatType,
    boatCapacity,
    boatModel,
    boatYear,
    boatRegistrationNum,
    boatIsVerified,
    reviews,
    loading,
    photoError,
    setPhotoError,
    overallAvg,
    avgCleanliness,
    avgComfort,
    addedSince,
    photoUri,
    showPhoto,
    amenities,
  };
}
