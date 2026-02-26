import React from 'react';
import {ScrollView, Share} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {useReferrals, ReferralEntry} from '@domain';
import {useToast} from '@hooks';

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
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation();
  const {referralsData, isLoading} = useReferrals();
  const toast = useToast();

  const referralCode = referralsData?.referralCode ?? '';

  async function handleCopyCode() {
    try {
      await Share.share({message: referralCode, title: 'Código de indicação NavegaJá'});
    } catch {
      toast.showError('Não foi possível compartilhar o código');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Use meu código ${referralCode} no NavegaJá e ganhe desconto na primeira viagem! Baixe o app e comece a navegar.`,
        title: 'Indicar NavegaJá',
      });
    } catch {}
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        paddingHorizontal="s20"
        paddingBottom="s20"
        backgroundColor="secondary"
        style={{paddingTop: top + 16}}>
        <TouchableOpacityBox onPress={() => navigation.goBack()} mb="s12">
          <Icon name="arrow-back" size={24} color={'#FFFFFF' as any} />
        </TouchableOpacityBox>
        <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
          Indicar Amigos
        </Text>
        <Text preset="paragraphSmall" style={{color: 'rgba(255,255,255,0.8)'}} mt="s4">
          Compartilhe seu código e ganhe NavegaCoins
        </Text>
      </Box>

      <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 40}}>
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
            Seu código de indicação
          </Text>
          <Box
            backgroundColor="secondaryBg"
            borderRadius="s12"
            paddingHorizontal="s24"
            paddingVertical="s12"
            mb="s20">
            <Text preset="headingMedium" color="secondary" bold textAlign="center">
              {referralCode || '------'}
            </Text>
          </Box>
          <Box flexDirection="row" gap="s12" width="100%">
            <Button
              title="Copiar código"
              onPress={handleCopyCode}
              preset="outline"
              leftIcon="content-copy"
              flex={1}
            />
            <Button
              title="Compartilhar"
              onPress={handleShare}
              leftIcon="share"
              flex={1}
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
              Quando um amigo usa seu código e faz a primeira viagem, você ganha 50 NavegaCoins automaticamente.
            </Text>
          </Box>
        </Box>

        {/* Referrals list */}
        {referralsData && referralsData.referrals.length > 0 && (
          <Box backgroundColor="surface" borderRadius="s12" overflow="hidden" style={{elevation: 2}}>
            <Text preset="paragraphMedium" color="text" bold padding="s16">
              Suas indicações
            </Text>
            {referralsData.referrals.map(item => (
              <ReferralItem key={item.id} item={item} />
            ))}
          </Box>
        )}

        {!isLoading && referralsData?.referrals.length === 0 && (
          <Box alignItems="center" mt="s20">
            <Icon name="people-outline" size={64} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s12" textAlign="center">
              Nenhuma indicação ainda.{'\n'}Compartilhe seu código!
            </Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}
