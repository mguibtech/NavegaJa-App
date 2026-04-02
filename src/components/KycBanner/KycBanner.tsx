import React from 'react';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Box, TouchableOpacityBox} from '../Box/Box';
import {Text} from '../Text/Text';
import {Icon} from '../Icon/Icon';
import {useKycStatus} from '@domain';

type KycBannerProps = {
  /** Se true, oculta o banner quando status = 'pending' (documentos em análise) */
  onlyWhenBlocked?: boolean;
};

const STATUS_CONFIG = {
  none: {
    bg: 'warningBg' as const,
    borderColor: 'warning' as const,
    icon: 'upload-file',
    title: 'Verificação pendente',
    message: 'Envie seus documentos para poder criar viagens.',
    actionLabel: 'Enviar documentos →',
    screen: 'KycSubmit',
    params: undefined as any,
  },
  pending: {
    bg: 'infoBg' as const,
    borderColor: 'info' as const,
    icon: 'hourglass-top',
    title: 'Documentos em análise',
    message: 'Aguarde a aprovação para criar viagens.',
    actionLabel: 'Ver status →',
    screen: 'KycStatus',
    params: undefined as any,
  },
  under_review: {
    bg: 'infoBg' as const,
    borderColor: 'info' as const,
    icon: 'manage-search',
    title: 'Documentos em revisão',
    message: 'Nossa equipe está revisando sua verificação.',
    actionLabel: 'Ver status →',
    screen: 'KycStatus',
    params: undefined as any,
  },
  approved: null,
  rejected: {
    bg: 'dangerBg' as const,
    borderColor: 'danger' as const,
    icon: 'cancel',
    title: 'Verificação rejeitada',
    message: 'Seus documentos foram reprovados. Corrija e reenvie.',
    actionLabel: 'Reenviar →',
    screen: 'KycSubmit',
    params: {rejected: true} as any,
  },
};

export function KycBanner({onlyWhenBlocked = false}: KycBannerProps) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const {kyc, isLoading} = useKycStatus();

  if (isLoading || !kyc) {return null;}

  const status = kyc.kycStatus;
  if (status === 'approved') {return null;}
  if (onlyWhenBlocked && status === 'pending') {return null;}

  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!config) {return null;}

  return (
    <TouchableOpacityBox
      marginHorizontal="s16"
      marginTop="s12"
      backgroundColor={config.bg}
      borderRadius="s12"
      padding="s16"
      flexDirection="row"
      alignItems="center"
      borderLeftWidth={4}
      borderLeftColor={config.borderColor}
      onPress={() => navigation.navigate(config.screen, config.params)}
      activeOpacity={0.8}>
      <Box
        width={40}
        height={40}
        borderRadius="s20"
        backgroundColor={config.borderColor}
        alignItems="center"
        justifyContent="center"
        mr="s12"
        flexShrink={0}>
        <Icon name={config.icon as any} size={20} color={'#FFFFFF' as any} />
      </Box>
      <Box flex={1}>
        <Text preset="paragraphMedium" color="text" bold>
          {config.title}
        </Text>
        <Text preset="paragraphSmall" color="textSecondary" mt="s4">
          {config.message}
        </Text>
        <Text preset="paragraphSmall" color={config.borderColor} bold mt="s6">
          {config.actionLabel}
        </Text>
      </Box>
    </TouchableOpacityBox>
  );
}
