import React from 'react';
import {Clipboard, ScrollView, Share} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Button, Icon, ScreenHeader, Text} from '@components';
import {useReferrals, ReferralEntry} from '@domain';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';

function ReferralItem({item}: {item: ReferralEntry}) {
  const isConverted = item.status === 'converted';
  return (
    <Box
      flexDirection="row"
      alignItems="center"
      padding="s16"
      borderBottomWidth={1}
      borderBottomColor="border">
      <Box
        width={40}
        height={40}
        borderRadius="s20"
        backgroundColor={isConverted ? 'successBg' : 'warningBg'}
        alignItems="center"
        justifyContent="center"
        mr="s12">
        <Icon
          name={isConverted ? 'check-circle' : 'schedule'}
          size={20}
          color={isConverted ? 'success' : 'warning'}
        />
      </Box>
      <Box flex={1}>
        <Text preset="paragraphSmall" color="text" bold>
          {item.referredName}
        </Text>
        <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
          {isConverted
            ? `Convertido em ${item.convertedAt ? format(new Date(item.convertedAt), "dd 'de' MMM", {locale: ptBR}) : '-'}`
            : `Indicado em ${format(new Date(item.createdAt), "dd 'de' MMM", {locale: ptBR})}`}
        </Text>
      </Box>
      <Box
        backgroundColor={isConverted ? 'successBg' : 'warningBg'}
        paddingHorizontal="s8"
        paddingVertical="s4"
        borderRadius="s8">
        <Text
          preset="paragraphCaptionSmall"
          color={isConverted ? 'success' : 'warning'}
          bold>
          {isConverted ? 'Convertido' : 'Pendente'}
        </Text>
      </Box>
    </Box>
  );
}

export function ReferralsScreen() {
  const navigation = useNavigation();
  const {user} = useAuthStore();
  const {referralsData, isLoading} = useReferrals();
  const toast = useToast();

  const referralCode =
    referralsData?.referralCode?.trim() ||
    user?.referralCode?.trim() ||
    '';
  const hasReferralCode = referralCode.length > 0;

  function handleCopyCode() {
    if (!hasReferralCode) {
      toast.showWarning('Codigo de indicacao indisponivel no momento');
      return;
    }

    Clipboard.setString(referralCode);
    toast.showSuccess('Codigo copiado');
  }

  async function handleShare() {
    if (!hasReferralCode) {
      toast.showWarning('Codigo de indicacao indisponivel no momento');
      return;
    }

    try {
      await Share.share({
        message: `Use meu codigo ${referralCode} no NavegaJa e ganhe desconto na primeira viagem! Baixe o app e comece a navegar.`,
        title: 'Indicar NavegaJá',
      });
    } catch {
      toast.showError('Nao foi possivel compartilhar o codigo');
    }
  }

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader
        title="Indicar Amigos"
        subtitle="Compartilhe seu codigo e ganhe NavegaCoins"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={{padding: 20, paddingBottom: 40}}
        showsVerticalScrollIndicator={false}>
        {/* Code Card */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s24"
          mb="s16"
          alignItems="center"
          style={{elevation: 3}}>
          <Icon name="group-add" size={48} color={'#0B5D8A' as any} />
          <Text preset="paragraphSmall" color="textSecondary" mt="s12" mb="s8" textAlign="center">
            Seu codigo de indicacao
          </Text>
          <Box
            backgroundColor={hasReferralCode ? 'secondaryBg' : 'background'}
            borderRadius="s12"
            paddingHorizontal="s24"
            paddingVertical="s12"
            mb="s20">
            <Text
              preset="headingMedium"
              color={hasReferralCode ? 'secondary' : 'textSecondary'}
              bold
              textAlign="center">
              {hasReferralCode ? referralCode : 'Codigo indisponivel'}
            </Text>
          </Box>
          <Box width="100%">
            <Button
              title="Copiar codigo"
              onPress={handleCopyCode}
              preset="outline"
              leftIcon="content-copy"
              disabled={!hasReferralCode}
              mb="s12"
            />
            <Button
              title="Compartilhar codigo"
              onPress={handleShare}
              leftIcon="share"
              disabled={!hasReferralCode}
            />
          </Box>
        </Box>

        {/* Stats */}
        {referralsData && (
          <Box flexDirection="row" gap="s12" mb="s24">
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              alignItems="center"
              style={{elevation: 2}}>
              <Text preset="headingSmall" color="secondary" bold>
                {referralsData.totalReferred}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Indicados
              </Text>
            </Box>
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              alignItems="center"
              style={{elevation: 2}}>
              <Text preset="headingSmall" color="success" bold>
                {referralsData.totalConverted}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Convertidos
              </Text>
            </Box>
            <Box
              flex={1}
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              alignItems="center"
              style={{elevation: 2}}>
              <Text preset="headingSmall" color="warning" bold>
                {referralsData.pendingConversion}
              </Text>
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4" textAlign="center">
                Pendentes
              </Text>
            </Box>
          </Box>
        )}

        {/* Info Banner */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          flexDirection="row"
          alignItems="flex-start">
          <Icon name="info" size={20} color="info" />
          <Box flex={1} ml="s12">
            <Text preset="paragraphSmall" color="text" bold mb="s4">
              Como funciona?
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Quando um amigo usa seu codigo e faz a primeira viagem, voce ganha 50 NavegaCoins automaticamente.
            </Text>
          </Box>
        </Box>

        {/* Referrals list */}
        {referralsData && referralsData.referrals.length > 0 && (
          <Box backgroundColor="surface" borderRadius="s12" overflow="hidden" style={{elevation: 2}}>
            <Text preset="paragraphMedium" color="text" bold padding="s16">
              Suas indicacoes
            </Text>
            {referralsData.referrals.map(item => (
              <ReferralItem key={item.id} item={item} />
            ))}
          </Box>
        )}

        {!isLoading && (referralsData?.referrals?.length ?? 0) === 0 && (
          <Box alignItems="center" mt="s20">
            <Icon name="people-outline" size={64} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
              Nenhuma indicacao ainda.{'\n'}Compartilhe seu codigo!
            </Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}
