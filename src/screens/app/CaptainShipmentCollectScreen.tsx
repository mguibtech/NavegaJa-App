import React, {useEffect, useState} from 'react';
import {ScrollView, ActivityIndicator, TextInput as RNTextInput} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TextInput} from '@components';
import {captainAPI, Shipment, ShipmentStatus} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainShipmentCollect'>;

const STATUS_LABELS: Partial<Record<ShipmentStatus, string>> = {
  [ShipmentStatus.PAID]: 'Pago — aguardando coleta',
  [ShipmentStatus.COLLECTED]: 'Coletado',
  [ShipmentStatus.IN_TRANSIT]: 'Em trânsito',
  [ShipmentStatus.ARRIVED]: 'Chegou ao destino',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'Saiu para entrega',
  [ShipmentStatus.DELIVERED]: 'Entregue',
};

export function CaptainShipmentCollectScreen({navigation, route}: Props) {
  const {shipmentId} = route.params;
  const {top} = useSafeAreaInsets();
  const toast = useToast();

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationCode, setValidationCode] = useState('');
  const [isCollecting, setIsCollecting] = useState(false);
  const [isMarkingDelivery, setIsMarkingDelivery] = useState(false);

  useEffect(() => {
    loadShipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadShipment() {
    setIsLoading(true);
    try {
      const result = await captainAPI.getShipmentById(shipmentId);
      setShipment(result);
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao carregar encomenda');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCollect() {
    if (validationCode.trim().length < 4) {
      toast.showError('Informe o código de validação (PIN)');
      return;
    }
    setIsCollecting(true);
    try {
      await captainAPI.collectShipment(shipmentId, validationCode.trim());
      toast.showSuccess('Encomenda coletada com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Código inválido. Verifique e tente novamente.');
    } finally {
      setIsCollecting(false);
    }
  }

  async function handleOutForDelivery() {
    setIsMarkingDelivery(true);
    try {
      await captainAPI.shipmentOutForDelivery(shipmentId);
      toast.showSuccess('Encomenda marcada como "Saiu para entrega"!');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao atualizar status');
    } finally {
      setIsMarkingDelivery(false);
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          paddingBottom: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Button
          title=""
          preset="outline"
          leftIcon="arrow-back"
          onPress={() => navigation.goBack()}
        />
        <Box flex={1} ml="s12">
          <Text preset="headingSmall" color="text" bold>
            Coleta de Encomenda
          </Text>
          {shipment && (
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              {shipment.trackingCode}
            </Text>
          )}
        </Box>
      </Box>

      {isLoading ? (
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#0a6fbd" />
          <Text preset="paragraphSmall" color="textSecondary" mt="s16">
            Carregando encomenda...
          </Text>
        </Box>
      ) : !shipment ? null : (
        <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 120}}>
          {/* Shipment Info Card */}
          <Box
            backgroundColor="surface"
            borderRadius="s16"
            padding="s20"
            mb="s16"
            style={{elevation: 3}}>
            <Box flexDirection="row" alignItems="center" mb="s16">
              <Box
                width={48}
                height={48}
                borderRadius="s12"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                mr="s16">
                <Icon name="inventory-2" size={26} color="primary" />
              </Box>
              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold>
                  {shipment.trackingCode}
                </Text>
                <Box
                  backgroundColor={
                    shipment.status === ShipmentStatus.PAID ? 'warningBg' :
                    shipment.status === ShipmentStatus.ARRIVED ? 'infoBg' : 'successBg'
                  }
                  paddingHorizontal="s8"
                  paddingVertical="s4"
                  borderRadius="s8"
                  alignSelf="flex-start"
                  mt="s4">
                  <Text
                    preset="paragraphCaptionSmall"
                    bold
                    color={
                      shipment.status === ShipmentStatus.PAID ? 'warning' :
                      shipment.status === ShipmentStatus.ARRIVED ? 'info' : 'success'
                    }>
                    {STATUS_LABELS[shipment.status] || shipment.status}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box
              borderTopWidth={1}
              borderTopColor="border"
              paddingTop="s16">
              <Box flexDirection="row" mb="s12">
                <Box flex={1}>
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                    Destinatário
                  </Text>
                  <Text preset="paragraphSmall" color="text" bold>
                    {shipment.recipientName}
                  </Text>
                  <Text preset="paragraphCaptionSmall" color="textSecondary">
                    {shipment.recipientPhone}
                  </Text>
                </Box>
              </Box>

              <Box mb="s12">
                <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                  Endereço de entrega
                </Text>
                <Text preset="paragraphSmall" color="text">
                  {shipment.recipientAddress}
                </Text>
              </Box>

              <Box flexDirection="row" gap="s16">
                <Box flex={1}>
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                    Conteúdo
                  </Text>
                  <Text preset="paragraphSmall" color="text">
                    {shipment.description}
                  </Text>
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s4">
                    Peso
                  </Text>
                  <Text preset="paragraphSmall" color="text">
                    {shipment.weight} kg
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Collect Action — only when PAID */}
          {shipment.status === ShipmentStatus.PAID && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{elevation: 2}}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="qr-code-scanner" size={22} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s12">
                  Confirmar coleta
                </Text>
              </Box>

              <Text preset="paragraphSmall" color="textSecondary" mb="s16">
                Solicite o PIN de validação ao remetente. O código tem 6 dígitos.
              </Text>

              <Box mb="s16">
                <TextInput
                  placeholder="Código PIN (6 dígitos)"
                  value={validationCode}
                  onChangeText={setValidationCode}
                  keyboardType="number-pad"
                  leftIcon="pin"
                />
              </Box>

              <Button
                title={isCollecting ? 'Coletando...' : 'Confirmar Coleta'}
                onPress={handleCollect}
                disabled={isCollecting || validationCode.trim().length < 4}
              />
            </Box>
          )}

          {/* Out for delivery action — only when ARRIVED */}
          {shipment.status === ShipmentStatus.ARRIVED && (
            <Box
              backgroundColor="surface"
              borderRadius="s16"
              padding="s20"
              mb="s16"
              style={{elevation: 2}}>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Icon name="local-shipping" size={22} color="secondary" />
                <Text preset="paragraphMedium" color="text" bold ml="s12">
                  Saída para entrega
                </Text>
              </Box>

              <Text preset="paragraphSmall" color="textSecondary" mb="s16">
                Confirme que a encomenda saiu para ser entregue ao destinatário.
              </Text>

              <Box
                backgroundColor="infoBg"
                borderRadius="s12"
                padding="s16"
                mb="s16"
                flexDirection="row"
                alignItems="flex-start">
                <Icon name="location-on" size={18} color="info" />
                <Text preset="paragraphCaptionSmall" color="text" ml="s8" flex={1}>
                  {shipment.recipientAddress}
                </Text>
              </Box>

              <Button
                title={isMarkingDelivery ? 'Atualizando...' : 'Confirmar: Saiu para Entrega'}
                onPress={handleOutForDelivery}
                disabled={isMarkingDelivery}
              />
            </Box>
          )}

          {/* Already collected / other statuses */}
          {shipment.status !== ShipmentStatus.PAID &&
            shipment.status !== ShipmentStatus.ARRIVED && (
              <Box
                backgroundColor="surface"
                borderRadius="s16"
                padding="s24"
                alignItems="center"
                style={{elevation: 2}}>
                <Icon
                  name={
                    shipment.status === ShipmentStatus.DELIVERED
                      ? 'check-circle'
                      : 'info'
                  }
                  size={40}
                  color={
                    shipment.status === ShipmentStatus.DELIVERED ? 'success' : 'info'
                  }
                />
                <Text preset="paragraphMedium" color="text" bold mt="s16" textAlign="center">
                  {STATUS_LABELS[shipment.status] || shipment.status}
                </Text>
                {shipment.status === ShipmentStatus.COLLECTED && (
                  <Text
                    preset="paragraphSmall"
                    color="textSecondary"
                    mt="s8"
                    textAlign="center">
                    Encomenda coletada. Aguardando início da viagem.
                  </Text>
                )}
                {shipment.status === ShipmentStatus.OUT_FOR_DELIVERY && (
                  <Text
                    preset="paragraphSmall"
                    color="textSecondary"
                    mt="s8"
                    textAlign="center">
                    Encomenda a caminho do destinatário.
                  </Text>
                )}
              </Box>
            )}
        </ScrollView>
      )}
    </Box>
  );
}
