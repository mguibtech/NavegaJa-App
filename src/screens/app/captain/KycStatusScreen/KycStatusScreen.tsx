import React from 'react';
import {ScrollView, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {useKycStatus} from '@domain';
import {apiImageSource} from '@api/config';

import {CaptainStackParamList} from '@routes';

const STATUS_CONFIG = {
  none: {
    icon: 'upload-file' as const,
    color: '#6B7280',
    bg: '#F3F4F6',
    label: 'Não enviado',
    description: 'Você ainda não enviou seus documentos de verificação.',
  },
  pending: {
    icon: 'hourglass-top' as const,
    color: '#3B82F6',
    bg: '#EFF6FF',
    label: 'Em análise',
    description: 'Seus documentos foram recebidos e estão sendo analisados pela equipe NavegaJá.',
  },
  under_review: {
    icon: 'manage-search' as const,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    label: 'Em revisão',
    description: 'Nossa equipe está revisando seus documentos com atenção.',
  },
  approved: {
    icon: 'verified' as const,
    color: '#10B981',
    bg: '#ECFDF5',
    label: 'Aprovado',
    description: 'Parabéns! Sua verificação foi aprovada. Você já pode criar viagens.',
  },
  rejected: {
    icon: 'cancel' as const,
    color: '#EF4444',
    bg: '#FEF2F2',
    label: 'Rejeitado',
    description: 'Seus documentos foram reprovados. Corrija o problema e reenvie.',
  },
};

export function KycStatusScreen() {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CaptainStackParamList>>();
  const {kyc, isLoading, refetch} = useKycStatus();

  const status = kyc?.kycStatus ?? 'none';
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];

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
          Status da Verificação
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 40}}>
        {isLoading ? (
          <Box alignItems="center" mt="s40">
            <Icon name="hourglass-top" size={48} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s16">
              Carregando...
            </Text>
          </Box>
        ) : (
          <>
            {/* Status Card */}
            <Box
              borderRadius="s16"
              padding="s24"
              mb="s24"
              alignItems="center"
              style={{backgroundColor: config.bg, elevation: 2}}>
              <Box
                width={80}
                height={80}
                borderRadius="s48"
                alignItems="center"
                justifyContent="center"
                mb="s16"
                style={{backgroundColor: config.color + '20'}}>
                <Icon name={config.icon} size={40} color={config.color as any} />
              </Box>
              <Text preset="headingMedium" bold style={{color: config.color}}>
                {config.label}
              </Text>
              <Text
                preset="paragraphSmall"
                color="textSecondary"
                textAlign="center"
                mt="s8">
                {config.description}
              </Text>
            </Box>

            {/* Rejection reason */}
            {status === 'rejected' && kyc?.rejectionReason && (
              <Box
                backgroundColor="dangerBg"
                borderRadius="s12"
                padding="s16"
                mb="s24"
                borderLeftWidth={4}
                borderLeftColor="danger">
                <Text preset="paragraphMedium" color="danger" bold mb="s4">
                  Motivo da rejeição
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {kyc.rejectionReason}
                </Text>
              </Box>
            )}

            {/* Approved info */}
            {status === 'approved' && kyc?.verifiedAt && (
              <Box
                backgroundColor="successBg"
                borderRadius="s12"
                padding="s16"
                mb="s24"
                flexDirection="row"
                alignItems="center">
                <Icon name="verified" size={20} color="success" />
                <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                  Verificado em{' '}
                  {new Date(kyc.verifiedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </Box>
            )}

            {/* Document Thumbnails */}
            {(kyc?.selfieUrl || kyc?.licensePhotoUrl) && (
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Documentos enviados
                </Text>
                <Box flexDirection="row" gap="s12">
                  {kyc?.selfieUrl && (
                    <Box flex={1}>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s6">
                        Selfie com documento
                      </Text>
                      <Box borderRadius="s12" overflow="hidden" style={{height: 120, backgroundColor: '#F3F4F6'}}>
                        <Image
                          source={apiImageSource(kyc.selfieUrl)}
                          style={{width: '100%', height: '100%'}}
                          resizeMode="cover"
                        />
                      </Box>
                    </Box>
                  )}
                  {kyc?.licensePhotoUrl && (
                    <Box flex={1}>
                      <Text preset="paragraphCaptionSmall" color="textSecondary" mb="s6">
                        Licença náutica
                      </Text>
                      <Box borderRadius="s12" overflow="hidden" style={{height: 120, backgroundColor: '#F3F4F6'}}>
                        <Image
                          source={apiImageSource(kyc.licensePhotoUrl)}
                          style={{width: '100%', height: '100%'}}
                          resizeMode="cover"
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
                {kyc?.rnaqNumber && (
                  <Box
                    mt="s12"
                    backgroundColor="surface"
                    borderRadius="s8"
                    padding="s12"
                    flexDirection="row"
                    alignItems="center">
                    <Icon name="badge" size={18} color="secondary" />
                    <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                      RNAQ: <Text preset="paragraphSmall" color="text" bold>{kyc.rnaqNumber}</Text>
                    </Text>
                  </Box>
                )}
              </Box>
            )}

            {/* Actions */}
            <Box gap="s12">
              {(status === 'rejected' || status === 'none') && (
                <Button
                  title={status === 'rejected' ? 'Reenviar documentos' : 'Enviar documentos'}
                  onPress={() =>
                    navigation.navigate('KycSubmit', {
                      rejected: status === 'rejected',
                      reason: kyc?.rejectionReason ?? undefined,
                    })
                  }
                />
              )}
              <Button
                title="Atualizar status"
                preset="outline"
                onPress={() => refetch()}
                loading={isLoading}
              />
            </Box>
          </>
        )}
      </ScrollView>
    </Box>
  );
}
