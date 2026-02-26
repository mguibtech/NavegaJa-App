import {useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {getReviewsByBoatUseCase, Review, useGetBoatById} from '@domain';
import {normalizeFileUrl} from '@api/config';

import {AppStackParamList} from '@routes';

export function useBoatDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'BoatDetail'>>();

  const {boatId, boat: boatFromParams} = route.params;

  // Se boat foi passado via params (vindo de TripDetailsScreen), não faz chamada extra.
  // Caso contrário (ex: FavoritesScreen), busca por ID.
  const {data: boatFromAPI, isLoading: boatAPILoading} = useGetBoatById(
    boatFromParams ? '' : boatId,
  );

  const boat = boatFromParams ?? boatFromAPI;
  const boatLoading = boatFromParams ? false : boatAPILoading;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  useEffect(() => {
    getReviewsByBoatUseCase(boatId)
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [boatId]);

  const overallAvg =
    reviews.length > 0
      ? reviews
          .filter(r => (r.boatRating ?? 0) > 0)
          .reduce((sum, r) => sum + (r.boatRating ?? 0), 0) /
        (reviews.filter(r => (r.boatRating ?? 0) > 0).length || 1)
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

  const addedSince = boat?.createdAt
    ? new Date(boat.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Galeria: todas as fotos do barco sem duplicatas
  const galleryPhotos: string[] = (() => {
    const seen = new Set<string>();
    const all: string[] = [];
    (boat?.photos ?? []).forEach(p => {
      const normalized = normalizeFileUrl(p);
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        all.push(normalized);
      }
    });
    return all;
  })();

  const amenities = boat?.amenities ?? [];

  return {
    navigation,
    boat,
    boatLoading,
    reviews,
    loading: reviewsLoading,
    overallAvg,
    avgCleanliness,
    avgComfort,
    addedSince,
    galleryPhotos,
    amenities,
  };
}
