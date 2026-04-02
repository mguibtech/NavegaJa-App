import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {Box, Text, ScreenHeader} from '@components';

import {usePrivacyScreen} from './usePrivacyScreen';

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
});

export function PrivacyScreen() {
  const {navigation} = usePrivacyScreen();

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Politica de Privacidade" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s8"
          mb="s24"
          style={styles.card}>
          <Text preset="paragraphSmall" color="textSecondary" mb="s16">
            Ultima atualizacao: 13 de Fevereiro de 2026
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            1. Compromisso com sua Privacidade
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJa respeita sua privacidade e esta comprometido em proteger
            seus dados pessoais, em conformidade com a Lei Geral de Protecao de
            Dados (LGPD).
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            2. Dados que Coletamos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Coletamos as seguintes informacoes:
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
            • Historico de viagens e encomendas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Avaliacoes e comentarios
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s12">
            • Preferencias e configuracoes
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
            • Comunicar sobre suas viagens e promocoes
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Melhorar nossos servicos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Prevenir fraudes e garantir seguranca
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Cumprir obrigacoes legais
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            4. Compartilhamento de Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Compartilhamos dados apenas quando necessario:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Com barqueiros parceiros (para executar o servico)
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
            Voce tem direito a:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Acessar seus dados pessoais
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Corrigir dados incompletos ou desatualizados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Solicitar anonimizacao ou exclusao de dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Revogar consentimento
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Portabilidade de dados para outro fornecedor
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            6. Seguranca dos Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Utilizamos criptografia e medidas de seguranca tecnicas e
            organizacionais para proteger seus dados contra acessos nao
            autorizados, perda ou destruicao.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            7. Retencao de Dados
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Mantemos seus dados pelo tempo necessario para prestar os servicos e
            cumprir obrigacoes legais. Apos esse periodo, os dados sao
            anonimizados ou excluidos.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            8. Contato do Encarregado (DPO)
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            Para exercer seus direitos ou esclarecer duvidas sobre privacidade:
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
