import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';

import {Box, Text, ScreenHeader} from '@components';

import {useTermsScreen} from './useTermsScreen';

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    padding: 24,
  },
});

export function TermsScreen() {
  const {navigation} = useTermsScreen();

  return (
    <Box flex={1} backgroundColor="background">
      <ScreenHeader title="Termos de Uso" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s24"
          mb="s24"
          style={styles.card}>
          <Text preset="paragraphSmall" color="textSecondary" mb="s16">
            Ultima atualizacao: 13 de Fevereiro de 2026
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            1. Aceitacao dos Termos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Ao utilizar o NavegaJa, voce concorda com estes Termos de Uso. Se
            voce nao concordar com qualquer parte destes termos, nao utilize
            nosso aplicativo.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            2. Descricao do Servico
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJa e uma plataforma de intermediacao de viagens fluviais e
            envio de encomendas atraves de embarcacoes na regiao amazonica.
            Conectamos passageiros e remetentes aos barqueiros parceiros.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            3. Responsabilidades do Usuario
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s8">
            Voce concorda em:
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Fornecer informacoes verdadeiras e atualizadas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Manter a seguranca de sua conta e senha
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Usar o servico de forma legal e adequada
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            • Nao transferir sua conta para terceiros
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            • Respeitar os direitos dos demais usuarios
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            4. Reservas e Pagamentos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            As reservas sao confirmadas mediante pagamento. Os valores sao
            definidos pelos barqueiros parceiros. Em caso de cancelamento,
            consulte nossa politica de reembolso.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            5. Encomendas
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJa nao se responsabiliza pelo conteudo das encomendas. E
            proibido o envio de itens ilegais, perigosos ou pereciveis. O
            usuario e responsavel por embalar adequadamente seus itens.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            6. Limitacao de Responsabilidade
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            O NavegaJa atua como intermediador. Nao nos responsabilizamos por
            atrasos, cancelamentos ou incidentes durante o transporte, que sao
            de responsabilidade dos barqueiros parceiros.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            7. Alteracoes nos Termos
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s20">
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. Notificaremos os usuarios sobre mudancas significativas.
          </Text>

          <Text preset="headingSmall" color="text" bold mb="s12">
            8. Contato
          </Text>
          <Text preset="paragraphMedium" color="text" mb="s4">
            Para duvidas sobre estes termos, entre em contato:
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
