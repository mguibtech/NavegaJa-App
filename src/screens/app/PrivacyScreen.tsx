import React from 'react';
import {ScrollView} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Privacy'>;

export function PrivacyScreen({navigation}: Props) {
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
          Política de Privacidade
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
            1. Compromisso com sua Privacidade
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJá respeita sua privacidade e está comprometido em proteger seus dados
            pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            2. Dados que Coletamos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Coletamos as seguintes informações:
          </Text>
          <Text preset="paragraphMedium" color="text" bold mb="s4">
            Dados de Cadastro:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Nome completo, CPF, telefone e email
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s12">
            • Foto de perfil (opcional)
          </Text>

          <Text preset="paragraphMedium" color="text" bold mb="s4">
            Dados de Uso:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Histórico de viagens e encomendas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Avaliações e comentários
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s12">
            • Preferências e configurações
          </Text>

          <Text preset="paragraphMedium" color="text" bold mb="s4">
            Dados de Pagamento:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Processados de forma segura por nossos parceiros certificados
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            3. Como Usamos seus Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Processar suas reservas e encomendas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Comunicar sobre suas viagens e promoções
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Melhorar nossos serviços
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Prevenir fraudes e garantir segurança
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Cumprir obrigações legais
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            4. Compartilhamento de Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Compartilhamos dados apenas quando necessário:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Com barqueiros parceiros (para executar o serviço)
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Com processadores de pagamento (de forma segura)
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Com autoridades quando exigido por lei
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Nunca vendemos seus dados para terceiros
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            5. Seus Direitos (LGPD)
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            Você tem direito a:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Acessar seus dados pessoais
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Corrigir dados incompletos ou desatualizados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Solicitar anonimização ou exclusão de dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Revogar consentimento
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Portabilidade de dados para outro fornecedor
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            6. Segurança dos Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Utilizamos criptografia e medidas de segurança técnicas e organizacionais para
            proteger seus dados contra acessos não autorizados, perda ou destruição.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            7. Retenção de Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Mantemos seus dados pelo tempo necessário para prestar os serviços e cumprir
            obrigações legais. Após esse período, os dados são anonimizados ou excluídos.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            8. Contato do Encarregado (DPO)
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
          </Text>
          <Text preset="paragraphMedium" color="primary" bold mb="s4">
            Email: privacidade@navegaja.com.br
          </Text>
          <Text preset="paragraphMedium" color="primary" bold>
            WhatsApp: (92) 99999-9999
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}
