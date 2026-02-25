import {useState} from 'react';
import {Linking} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AppStackParamList} from '@routes';

export const FAQ_ITEMS = [
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

export const CONTACT_OPTIONS = [
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

export function useHelpScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function toggleFAQ(index: number) {
    setExpandedIndex(expandedIndex === index ? null : index);
  }

  return {
    navigation,
    expandedIndex,
    toggleFAQ,
    faqItems: FAQ_ITEMS,
    contactOptions: CONTACT_OPTIONS,
  };
}
