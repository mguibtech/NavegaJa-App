import {useEffect, useState} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {canReviewUseCase, createReviewUseCase} from '@domain';
import {useToast} from '@hooks';
import {api} from '@api';
import {API_BASE_URL} from '@api/config';
import {AppStackParamList} from '@routes';

type PhotoItem = {uri: string; type: string; name: string};

export function useTripReviewScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'TripReview'>>();
  const {tripId, captainName, boatName} = route.params;

  const toast = useToast();

  const [checking, setChecking] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);

  // Captain
  const [captainRating, setCaptainRating] = useState(0);
  const [captainComment, setCaptainComment] = useState('');
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);

  // Boat
  const [boatRating, setBoatRating] = useState(0);
  const [boatComment, setBoatComment] = useState('');
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [boatPhotos, setBoatPhotos] = useState<PhotoItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCaptainRatingModal, setShowCaptainRatingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkEligibility() {
    try {
      const result = await canReviewUseCase(tripId);
      setCanReview(result.canReview);
      setAlreadyReviewed(result.alreadyReviewed ?? false);
    } catch {
      setCanReview(false);
    } finally {
      setChecking(false);
    }
  }

  async function uploadPhotos(photos: PhotoItem[]): Promise<string[]> {
    return Promise.all(
      photos.map(async photo => {
        const formData = new FormData();
        formData.append('file', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.name || 'photo.jpg',
        } as any);
        const response = await api.upload<{url: string}>('/upload/image', formData);
        return response.url.startsWith('http')
          ? response.url
          : `${API_BASE_URL}${response.url}`;
      }),
    );
  }

  async function handleSubmit() {
    if (captainRating === 0) {
      setShowCaptainRatingModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedBoatPhotos =
        boatRating > 0 && boatPhotos.length > 0
          ? await uploadPhotos(boatPhotos)
          : undefined;

      await createReviewUseCase({
        tripId,
        captainRating,
        captainComment: captainComment.trim() || undefined,
        punctualityRating: punctualityRating > 0 ? punctualityRating : undefined,
        communicationRating:
          communicationRating > 0 ? communicationRating : undefined,
        boatRating: boatRating > 0 ? boatRating : undefined,
        boatComment:
          boatRating > 0 && boatComment.trim() ? boatComment.trim() : undefined,
        cleanlinessRating:
          boatRating > 0 && cleanlinessRating > 0 ? cleanlinessRating : undefined,
        comfortRating:
          boatRating > 0 && comfortRating > 0 ? comfortRating : undefined,
        boatPhotos: uploadedBoatPhotos,
      });

      toast.showSuccess('Avaliação enviada! +5 NavegaCoins creditados 🪙');
      // Convida a avaliar o porto de chegada
      navigation.replace('StopReviewCreate', {tripId});
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível enviar a avaliação');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handleErrorModalClose() {
    setShowErrorModal(false);
    setErrorMessage('');
  }

  return {
    // Route params
    tripId,
    captainName,
    boatName,
    // State
    checking,
    canReview,
    alreadyReviewed,
    isSubmitting,
    // Captain fields
    captainRating,
    setCaptainRating,
    captainComment,
    setCaptainComment,
    punctualityRating,
    setPunctualityRating,
    communicationRating,
    setCommunicationRating,
    // Boat fields
    boatRating,
    setBoatRating,
    boatComment,
    setBoatComment,
    cleanlinessRating,
    setCleanlinessRating,
    comfortRating,
    setComfortRating,
    boatPhotos,
    setBoatPhotos,
    // Handlers
    handleSubmit,
    handleGoBack,
    // Modal states
    showCaptainRatingModal,
    setShowCaptainRatingModal,
    showErrorModal,
    handleErrorModalClose,
    errorMessage,
  };
}
