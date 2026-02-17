import React from 'react';
import {ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Terms'>;

export function TermsScreen({navigation}: Props) {
  const {top} = useSafeAreaInsets();
  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        flexDirection="row"
        alignItems="center"
        style={{
          paddingTop: top + 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          alignItems="center"
          justifyContent="center"
          onPress={() => navigation.goBack()}
          mr="s12">
          <Icon name="arrow-back" size={24} color="text" />
        </TouchableOpacityBox>
        <Text preset="headingSmall" color="text" bold>
          Termos de Uso
        </Text>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s24"
          mb="s24"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 1},
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Text preset="paragraphSmall" color="textSecondary" mb="s16">
            Última atualização: 13 de Fevereiro de 2026
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            1. Aceitação dos Termos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Ao utilizar o NavegaJá, você concorda com estes Termos de Uso. Se você não concordar com
            qualquer parte destes termos, não utilize nosso aplicativo.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            2. Descrição do Serviço
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJá é uma plataforma de intermediação de viagens fluviais e envio de encomendas
            através de embarcações na região amazônica. Conectamos passageiros e remetentes aos
            barqueiros parceiros.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            3. Responsabilidades do Usuário
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Você concorda em:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Fornecer informações verdadeiras e atualizadas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Manter a segurança de sua conta e senha
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Usar o serviço de forma legal e adequada
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Não transferir sua conta para terceiros
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Respeitar os direitos dos demais usuários
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            4. Reservas e Pagamentos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            As reservas são confirmadas mediante pagamento. Os valores são definidos pelos
            barqueiros parceiros. Em caso de cancelamento, consulte nossa política de
            reembolso.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            5. Encomendas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJá não se responsabiliza pelo conteúdo das encomendas. É proibido o envio
            de itens ilegais, perigosos ou perecíveis. O usuário é responsável por embalar
            adequadamente seus itens.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            6. Limitação de Responsabilidade
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJá atua como intermediador. Não nos responsabilizamos por atrasos,
            cancelamentos ou incidentes durante o transporte, que são de responsabilidade
            dos barqueiros parceiros.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            7. Alterações nos Termos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Reservamo-nos o direito de modificar estes termos a qualquer momento.
            Notificaremos os usuários sobre mudanças significativas.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            8. Contato
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            Para dúvidas sobre estes termos, entre em contato:
          </Text>
          <Text preset="paragraphMedium" color="primary" bold mb="s4">
            Email: contato@navegaja.com.br
          </Text>
          <Text preset="paragraphMedium" color="primary" bold mb="s4">
            WhatsApp: (92) 99999-9999
          </Text>
          <Text preset="paragraphMedium" color="primary" bold>
            Instagram: @navegaja
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}
