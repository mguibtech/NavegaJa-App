import React, {useState} from 'react';
import {ScrollView, Linking} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Button, Text, Icon, TouchableOpacityBox} from '@components';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'Help'>;

const FAQ_ITEMS = [
  {
    question: 'Como faço uma reserva?',
    answer:
      'Acesse a aba "Buscar", insira origem e destino, selecione a viagem desejada e clique em "Reservar Assentos". Escolha os assentos, forma de pagamento e finalize.',
  },
  {
    question: 'Posso cancelar minha reserva?',
    answer:
      'Sim! Acesse "Minhas Reservas", selecione a viagem e clique em "Cancelar Reserva". Consulte nossa política de reembolso nos Termos de Uso.',
  },
  {
    question: 'Como enviar uma encomenda?',
    answer:
      'Acesse a aba "Encomendas", clique em "+" para criar nova encomenda. Busque a viagem, preencha os dados do destinatário e detalhes da carga.',
  },
  {
    question: 'Como rastreio minha encomenda?',
    answer:
      'Em "Encomendas", clique na encomenda desejada. Você verá o código de rastreamento e pode acompanhar o status em tempo real.',
  },
  {
    question: 'Quais formas de pagamento aceitas?',
    answer:
      'Aceitamos PIX e cartões de crédito. O pagamento via PIX é instantâneo. Para cartão, o processamento pode levar alguns minutos.',
  },
  {
    question: 'Como aplicar um cupom de desconto?',
    answer:
      'Durante a reserva ou criação de encomenda, você verá o campo "Cupom de Desconto". Digite o código e clique em "Aplicar" para ver o desconto.',
  },
  {
    question: 'Não recebi meu QR Code',
    answer:
      'Verifique sua conexão com internet e acesse "Minhas Reservas" ou "Encomendas". Se o problema persistir, entre em contato com o suporte.',
  },
  {
    question: 'Como avaliar minha viagem?',
    answer:
      'Após a viagem, acesse "Minhas Reservas", selecione a viagem concluída e clique em "Avaliar Viagem". Sua opinião é muito importante!',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'whatsapp',
    icon: 'whatsapp',
    title: 'WhatsApp',
    subtitle: '(92) 99999-9999',
    color: 'success' as const,
    action: () => Linking.openURL('https://wa.me/5592999999999'),
  },
  {
    id: 'email',
    icon: 'email',
    title: 'Email',
    subtitle: 'contato@navegaja.com.br',
    color: 'primary' as const,
    action: () => Linking.openURL('mailto:contato@navegaja.com.br'),
  },
  {
    id: 'instagram',
    icon: 'camera-alt',
    title: 'Instagram',
    subtitle: '@navegaja',
    color: 'secondary' as const,
    action: () => Linking.openURL('https://instagram.com/navegaja'),
  },
];

export function HelpScreen({navigation}: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleFAQ(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingVertical="s16"
        flexDirection="row"
        alignItems="center"
        style={{
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
        <Text preset="headingSmall" color="text" bold ml="s12">
          Ajuda e Suporte
        </Text>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 24}}
        showsVerticalScrollIndicator={false}>
        {/* FAQ Section */}
        <Box mb="s24">
          <Text preset="headingMedium" color="text" bold mb="s16">
            Perguntas Frequentes
          </Text>

          {FAQ_ITEMS.map((item, index) => (
            <TouchableOpacityBox
              key={index}
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              mb="s12"
              onPress={() => toggleFAQ(index)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box flexDirection="row" alignItems="center" justifyContent="space-between">
                <Box flex={1} mr="s8">
                  <Text preset="paragraphMedium" color="text" bold>
                    {item.question}
                  </Text>
                </Box>
                <Icon
                  name={expandedIndex === index ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="textSecondary"
                />
              </Box>

              {expandedIndex === index && (
                <Box mt="s12" pt="s12" borderTopWidth={1} borderTopColor="border">
                  <Text preset="paragraphMedium" color="textSecondary">
                    {item.answer}
                  </Text>
                </Box>
              )}
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Contact Section */}
        <Box mb="s24">
          <Text preset="headingMedium" color="text" bold mb="s16">
            Entre em Contato
          </Text>

          {CONTACT_OPTIONS.map(option => (
            <TouchableOpacityBox
              key={option.id}
              flexDirection="row"
              alignItems="center"
              backgroundColor="surface"
              borderRadius="s12"
              padding="s16"
              mb="s12"
              onPress={option.action}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}>
              <Box
                width={48}
                height={48}
                borderRadius="s24"
                backgroundColor={option.color === 'primary' ? 'primaryBg' : option.color === 'success' ? 'successBg' : 'secondaryBg'}
                alignItems="center"
                justifyContent="center"
                marginRight="s16">
                <Icon name={option.icon as any} size={24} color={option.color} />
              </Box>

              <Box flex={1}>
                <Text preset="paragraphMedium" color="text" bold mb="s4">
                  {option.title}
                </Text>
                <Text preset="paragraphSmall" color="textSecondary">
                  {option.subtitle}
                </Text>
              </Box>

              <Icon name="chevron-right" size={24} color="border" />
            </TouchableOpacityBox>
          ))}
        </Box>

        {/* Quick Tips */}
        <Box
          backgroundColor="infoBg"
          borderRadius="s12"
          padding="s16"
          mb="s24"
          style={{
            borderLeftWidth: 4,
            borderLeftColor: '#2196F3',
          }}>
          <Box flexDirection="row" alignItems="center" mb="s8">
            <Icon name="lightbulb" size={20} color="info" />
            <Text preset="paragraphMedium" color="info" bold ml="s8">
              Dica Rápida
            </Text>
          </Box>
          <Text preset="paragraphMedium" color="info">
            Mantenha suas notificações ativadas para receber atualizações importantes sobre suas
            viagens e encomendas em tempo real!
          </Text>
        </Box>
      </ScrollView>
    </Box>
  );
}
