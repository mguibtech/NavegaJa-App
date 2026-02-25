import {useState} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useShipmentReview} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export function useShipmentReviewScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ShipmentReview'>>();
  const {shipmentId} = route.params;
  const {createReview, isLoading} = useShipmentReview();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [deliveryQuality, setDeliveryQuality] = useState(0);
  const [timeliness, setTimeliness] = useState(0);
  const [comment, setComment] = useState('');

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDeliveryQualityModal, setShowDeliveryQualityModal] = useState(false);
  const [showTimelinessModal, setShowTimelinessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  function validate(): boolean {
    if (rating === 0) {
      setShowRatingModal(true);
      return false;
    }
    if (deliveryQuality === 0) {
      setShowDeliveryQualityModal(true);
      return false;
    }
    if (timeliness === 0) {
      setShowTimelinessModal(true);
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!validate()) {return;}

    try {
      await createReview({
        shipmentId,
        rating,
        deliveryQuality,
        timeliness,
        comment: comment.trim() || undefined,
      });

      toast.showSuccess('Avaliação enviada! Obrigado pelo seu feedback');
      navigation.goBack();
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível enviar a avaliação');
      setShowErrorModal(true);
    }
  }

  return {
    navigation,
    isLoading,
    rating, setRating,
    deliveryQuality, setDeliveryQuality,
    timeliness, setTimeliness,
    comment, setComment,
    showRatingModal, setShowRatingModal,
    showDeliveryQualityModal, setShowDeliveryQualityModal,
    showTimelinessModal, setShowTimelinessModal,
    showErrorModal, setShowErrorModal,
    errorMessage, setErrorMessage,
    handleSubmit,
  };
}
