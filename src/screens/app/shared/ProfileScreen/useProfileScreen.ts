import {useState, useEffect} from 'react';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {getMyReviewsUseCase, MyReviewsResponse, Review} from '@domain';
import {useAuthStore} from '@store';
import {formatPhone} from '@utils';

import {AppStackParamList} from '@routes';

export const MENU_ITEMS = [
  {id: 'edit-profile', icon: 'edit', title: 'Editar Perfil', subtitle: 'Nome, email, cidade e senha', color: 'primary' as const},
  {id: 'gamification', icon: 'stars', title: 'NavegaCoins', subtitle: 'Pontos, nível e ranking', color: 'primary' as const},
  {id: 'my-reviews', icon: 'star-rate', title: 'Minhas Avaliações', subtitle: 'Avaliações enviadas e recebidas', color: 'secondary' as const},
  {id: 'payment', icon: 'credit-card', title: 'Formas de Pagamento', subtitle: 'Gerencie seus métodos de pagamento', color: 'secondary' as const},
  {id: 'notifications', icon: 'notifications', title: 'Notificações', subtitle: 'Preferências de notificação', color: 'primary' as const},
  {id: 'help', icon: 'help-outline', title: 'Ajuda e Suporte', subtitle: 'Tire suas dúvidas', color: 'secondary' as const},
  {id: 'terms', icon: 'description', title: 'Termos de Uso', subtitle: 'Leia nossos termos', color: 'primary' as const},
  {id: 'privacy', icon: 'lock-outline', title: 'Política de Privacidade', subtitle: 'Entenda como usamos seus dados', color: 'secondary' as const},
];

export const MENU_GROUPS = [
  {title: 'Conta', items: ['edit-profile', 'gamification', 'my-reviews', 'payment', 'notifications']},
  {title: 'Informações', items: ['help', 'terms', 'privacy']},
];

export function useProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {user, logout} = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [myReviews, setMyReviews] = useState<MyReviewsResponse | null>(null);

  useEffect(() => {
    getMyReviewsUseCase().then(setMyReviews).catch(() => {});
  }, []);

  function confirmLogout() {
    setShowLogoutModal(false);
    logout();
  }

  function handleMenuPress(itemId: string) {
    switch (itemId) {
      case 'edit-profile': navigation.navigate('EditProfile'); break;
      case 'gamification': navigation.navigate('Gamification'); break;
      case 'my-reviews': navigation.navigate('MyReviews'); break;
      case 'payment': navigation.navigate('PaymentMethods'); break;
      case 'notifications': navigation.navigate('Notifications'); break;
      case 'help': navigation.navigate('Help'); break;
      case 'terms': navigation.navigate('Terms'); break;
      case 'privacy': navigation.navigate('Privacy'); break;
    }
  }

  const isCaptain = user?.role === 'captain';
  const ratingDisplay =
    typeof user?.rating === 'number' ? user.rating.toFixed(1) : user?.rating || '5.0';
  const receivedReviews: Review[] = myReviews?.received ?? [];
  const phoneDisplay = user?.phone ? formatPhone(user.phone) : '';

  return {
    navigation,
    user,
    showLogoutModal,
    setShowLogoutModal,
    isCaptain,
    ratingDisplay,
    receivedReviews,
    phoneDisplay,
    confirmLogout,
    handleMenuPress,
  };
}
