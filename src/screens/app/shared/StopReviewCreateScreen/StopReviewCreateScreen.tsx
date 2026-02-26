import React, {useState} from 'react';
import {ScrollView, Alert} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import {Box, Button, Icon, PhotoPicker, Text, TextInput, TouchableOpacityBox} from '@components';
import {useCreateStopReview} from '@domain';
import {useToast} from '@hooks';
import {normalizeFileUrl} from '@api/config';

import {AppStackParamList} from '@routes';

type Photo = {uri: string; type: string; name: string};

function StarRating({rating, onChange}: {rating: number; onChange: (r: number) => void}) {
  return (
    <Box flexDirection="row" gap="s8">
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacityBox key={star} onPress={() => onChange(star)}>
          <Icon
            name={star <= rating ? 'star' : 'star-border'}
            size={36}
            color={star <= rating ? ('#F59E0B' as any) : 'textSecondary'}
          />
        </TouchableOpacityBox>
      ))}
    </Box>
  );
}

export function StopReviewCreateScreen() {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<AppStackParamList, 'StopReviewCreate'>>();
  const params = route.params ?? {};

  const {createReview, isLoading} = useCreateStopReview();
  const toast = useToast();

  const [locationName, setLocationName] = useState(params.locationName ?? '');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  async function handleSubmit() {
    if (!locationName.trim()) {
      Alert.alert('Local obrigatório', 'Informe o nome da parada ou porto.');
      return;
    }
    if (rating === 0) {
      Alert.alert('Avaliação obrigatória', 'Selecione pelo menos 1 estrela.');
      return;
    }

    try {
      await createReview({
        locationName: locationName.trim(),
        rating,
        comment: comment.trim() || undefined,
        photos: photos.map(p => normalizeFileUrl(p.uri)),
        tripId: params.tripId,
        lat: params.lat,
        lng: params.lng,
      });
      toast.showSuccess('+5 NavegaCoins! Avaliação enviada.');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao enviar avaliação');
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s16"
        backgroundColor="secondary"
        style={{paddingTop: top + 16}}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color={'#FFFFFF' as any} />
        </TouchableOpacityBox>
        <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
          Avaliar Parada
        </Text>
        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}} mt="s4">
          Compartilhe sua experiência neste local
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 40}}>
        {/* Location Name */}
        <Box mb="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Porto / Parada <Text preset="paragraphMedium" color="danger" bold>*</Text>
          </Text>
          <TextInput
            placeholder="Ex: Porto de Parintins"
            value={locationName}
            onChangeText={setLocationName}
          />
        </Box>

        {/* Star Rating */}
        <Box mb="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s12">
            Avaliação <Text preset="paragraphMedium" color="danger" bold>*</Text>
          </Text>
          <StarRating rating={rating} onChange={setRating} />
          {rating > 0 && (
            <Text preset="paragraphSmall" color="textSecondary" mt="s8">
              {rating === 1 ? 'Muito ruim' : rating === 2 ? 'Ruim' : rating === 3 ? 'Regular' : rating === 4 ? 'Bom' : 'Excelente'}
            </Text>
          )}
        </Box>

        {/* Comment */}
        <Box mb="s20">
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Comentário
          </Text>
          <TextInput
            placeholder="Conta como foi a experiência neste local..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
        </Box>

        {/* Photos */}
        <Box mb="s32">
          <Text preset="paragraphMedium" color="text" bold mb="s8">
            Fotos (opcional)
          </Text>
          <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={3} />
        </Box>

        <Button
          title={isLoading ? 'Enviando...' : 'Publicar avaliação'}
          onPress={handleSubmit}
          loading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </Box>
  );
}
