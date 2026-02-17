import React, {useState} from 'react';
import {ScrollView, KeyboardAvoidingView, Platform} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput, TouchableOpacityBox, InfoModal} from '@components';
import {useShipmentReview} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'ShipmentReview'>;

function StarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
}) {
  return (
    <Box mb="s20">
      <Text preset="paragraphMedium" color="text" bold mb="s12">
        {label}
      </Text>
      <Box flexDirection="row" gap="s8">
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacityBox
            key={star}
            onPress={() => onChange(star)}
            padding="s4">
            <Icon
              name={star <= value ? 'star' : 'star-outline'}
              size={40}
              color={star <= value ? 'warning' : 'textSecondary'}
            />
          </TouchableOpacityBox>
        ))}
      </Box>
    </Box>
  );
}

export function ShipmentReviewScreen({navigation, route}: Props) {
  const {shipmentId} = route.params;
  const {createReview, isLoading} = useShipmentReview();
  const toast = useToast();

  const [rating, setRating] = useState(0);
  const [deliveryQuality, setDeliveryQuality] = useState(0);
  const [timeliness, setTimeliness] = useState(0);
  const [comment, setComment] = useState('');

  // Modal states
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
    if (!validate()) return;

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

  return (
    <>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Box flex={1} backgroundColor="background">
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
          <Box padding="s20">
            <Text preset="headingMedium" color="text" bold mb="s8">
              Avaliar Entrega
            </Text>
            <Text preset="paragraphMedium" color="textSecondary" mb="s32">
              Sua opinião ajuda outros usuários
            </Text>

            {/* Rating Geral */}
            <StarRating
              value={rating}
              onChange={setRating}
              label="Avaliação Geral"
            />

            {/* Qualidade da Entrega */}
            <StarRating
              value={deliveryQuality}
              onChange={setDeliveryQuality}
              label="Qualidade da Entrega"
            />

            {/* Pontualidade */}
            <StarRating
              value={timeliness}
              onChange={setTimeliness}
              label="Pontualidade"
            />

            {/* Comentário */}
            <Box mb="s32">
              <Text preset="paragraphMedium" color="text" bold mb="s12">
                Comentário (Opcional)
              </Text>
              <TextInput
                placeholder="Conte como foi sua experiência..."
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Box>

            {/* Info */}
            <Box
              backgroundColor="infoBg"
              padding="s16"
              borderRadius="s12"
              flexDirection="row"
              alignItems="flex-start"
              mb="s24">
              <Icon name="info" size={20} color="info" />
              <Text preset="paragraphSmall" color="info" ml="s12" flex={1}>
                Sua avaliação é importante para manter a qualidade do serviço
              </Text>
            </Box>

            {/* Botões */}
            <Button
              title={isLoading ? 'Enviando...' : 'Enviar Avaliação'}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
              mb="s12"
            />

            <Button
              title="Cancelar"
              preset="outline"
              onPress={() => navigation.goBack()}
              disabled={isLoading}
            />
          </Box>
          </ScrollView>
        </Box>
      </KeyboardAvoidingView>

      {/* Rating Required Modal */}
      <InfoModal
        visible={showRatingModal}
        title="Atenção"
        message="Dê uma avaliação geral"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowRatingModal(false)}
      />

      {/* Delivery Quality Required Modal */}
      <InfoModal
        visible={showDeliveryQualityModal}
        title="Atenção"
        message="Avalie a qualidade da entrega"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowDeliveryQualityModal(false)}
      />

      {/* Timeliness Required Modal */}
      <InfoModal
        visible={showTimelinessModal}
        title="Atenção"
        message="Avalie a pontualidade"
        icon="warning"
        iconColor="warning"
        buttonText="Entendi"
        onClose={() => setShowTimelinessModal(false)}
      />

      {/* Submit Error Modal */}
      <InfoModal
        visible={showErrorModal}
        title="Erro"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
      />
    </>
  );
}
