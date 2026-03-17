import React from 'react';
import {Alert, Image, Linking, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Box,
  Button,
  Icon,
  PhotoViewerModal,
  Text,
  TouchableOpacityBox,
  usePhotoViewer,
} from '@components';
import {
  CaptainDocumentType,
  DocumentChangeRequestStatus,
  getLatestDocumentChangeRequest,
  useKycStatus,
} from '@domain';
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
    description: 'Sua solicitação foi recebida e está em análise pelo administrador.',
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

const REQUEST_STATUS_CONFIG: Record<
  DocumentChangeRequestStatus,
  {label: string; bg: string; color: string}
> = {
  PENDING: {
    label: 'PENDENTE',
    bg: '#EFF6FF',
    color: '#2563EB',
  },
  APPROVED: {
    label: 'APROVADO',
    bg: '#ECFDF5',
    color: '#059669',
  },
  REJECTED: {
    label: 'REJEITADO',
    bg: '#FEF2F2',
    color: '#DC2626',
  },
};

const DOCUMENT_LABELS: Record<CaptainDocumentType, string> = {
  SELFIE: 'Selfie com documento',
  LICENCA_NAVEGACAO: 'Licença náutica',
  CERTIFICADO_SEGURANCA: 'Certificado de segurança',
};

type ViewerImage = {
  id: string;
  uri: string;
  title: string;
};

function isPdfUrl(url: string | null | undefined): boolean {
  if (!url) {return false;}
  return /\.pdf(?:$|[?#])/i.test(url);
}

export function KycStatusScreen() {
  const {openViewer, viewerProps} = usePhotoViewer();
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<CaptainStackParamList>>();
  const {kyc, isLoading, refetch} = useKycStatus();

  const status = kyc?.kycStatus ?? 'none';
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  const documentRequests = kyc?.documentRequests ?? [];

  const documentCards = ([
    {
      id: 'selfie',
      documentType: 'SELFIE' as const,
      officialUrl: kyc?.selfieUrl ?? null,
    },
    {
      id: 'license',
      documentType: 'LICENCA_NAVEGACAO' as const,
      officialUrl: kyc?.licensePhotoUrl ?? null,
    },
    {
      id: 'certificate',
      documentType: 'CERTIFICADO_SEGURANCA' as const,
      officialUrl: kyc?.certificatePhotoUrl ?? null,
    },
  ])
    .map(item => {
      const latestRequest = getLatestDocumentChangeRequest(
        documentRequests,
        item.documentType,
      );
      const requestPreviewUrl =
        latestRequest && latestRequest.status !== 'APPROVED'
          ? latestRequest.newDocumentUrl
          : null;
      const previewUrl =
        requestPreviewUrl ||
        item.officialUrl ||
        latestRequest?.newDocumentUrl ||
        null;

      return {
        ...item,
        title: DOCUMENT_LABELS[item.documentType],
        latestRequest,
        previewUrl,
      };
    })
    .filter(item => !!item.previewUrl);

  const viewerImages: ViewerImage[] = documentCards
    .filter(item => item.previewUrl && !isPdfUrl(item.previewUrl))
    .map(item => ({
      id: item.id,
      uri: item.previewUrl!,
      title: item.title,
    }));

  async function handleDocumentPress(card: (typeof documentCards)[number]) {
    if (!card.previewUrl) {return;}

    if (isPdfUrl(card.previewUrl)) {
      try {
        await Linking.openURL(card.previewUrl);
      } catch {
        Alert.alert('Erro', 'Não foi possível abrir o documento.');
      }
      return;
    }

    const index = viewerImages.findIndex(image => image.id === card.id);
    if (index >= 0) {
      openViewer(viewerImages, index, 'Documentos enviados');
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
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

            {documentCards.length > 0 && (
              <Box mb="s24">
                <Text preset="paragraphMedium" color="text" bold mb="s12">
                  Documentos e solicitações
                </Text>

                <Box gap="s12">
                  {documentCards.map(card => {
                    const requestStatus = card.latestRequest?.status ?? null;
                    const requestConfig = requestStatus
                      ? REQUEST_STATUS_CONFIG[requestStatus]
                      : null;
                    const isPdf = isPdfUrl(card.previewUrl);

                    return (
                      <TouchableOpacityBox
                        key={card.id}
                        onPress={() => handleDocumentPress(card)}
                        backgroundColor="surface"
                        borderRadius="s12"
                        padding="s12"
                        flexDirection="row"
                        alignItems="center"
                        style={{elevation: 1}}>
                        <Box
                          width={72}
                          height={72}
                          borderRadius="s12"
                          overflow="hidden"
                          alignItems="center"
                          justifyContent="center"
                          style={{backgroundColor: '#F3F4F6'}}>
                          {isPdf ? (
                            <>
                              <Icon
                                name="picture-as-pdf"
                                size={30}
                                color={'#DC2626' as any}
                              />
                              <Text
                                preset="paragraphCaptionSmall"
                                color="textSecondary"
                                mt="s4">
                                PDF
                              </Text>
                            </>
                          ) : (
                            <Image
                              source={apiImageSource(card.previewUrl!)}
                              style={{width: '100%', height: '100%'}}
                              resizeMode="cover"
                            />
                          )}
                        </Box>

                        <Box flex={1} ml="s12">
                          <Box
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                            mb="s6">
                            <Text preset="paragraphMedium" color="text" bold flex={1}>
                              {card.title}
                            </Text>
                            {requestConfig && (
                              <Box
                                borderRadius="s12"
                                paddingHorizontal="s8"
                                paddingVertical="s4"
                                style={{backgroundColor: requestConfig.bg}}>
                                <Text
                                  preset="paragraphCaptionSmall"
                                  bold
                                  style={{color: requestConfig.color}}>
                                  {requestConfig.label}
                                </Text>
                              </Box>
                            )}
                          </Box>

                          <Text preset="paragraphSmall" color="textSecondary">
                            {card.latestRequest?.status === 'PENDING'
                              ? 'Sua solicitação será enviada para análise do administrador.'
                              : card.latestRequest?.status === 'REJECTED'
                                ? card.latestRequest.rejectionReason ||
                                  'A última solicitação foi rejeitada.'
                                : card.officialUrl
                                  ? 'Documento oficial disponível.'
                                  : 'Documento enviado.'}
                          </Text>
                        </Box>

                        <Icon
                          name={isPdf ? 'open-in-new' : 'zoom-in'}
                          size={20}
                          color="textSecondary"
                        />
                      </TouchableOpacityBox>
                    );
                  })}
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

      <PhotoViewerModal {...viewerProps} />
    </Box>
  );
}
