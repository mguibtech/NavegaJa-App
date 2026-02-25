import {useState, useCallback} from 'react';

import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {useGetMyReviews, Review} from '@domain';

import {AppStackParamList} from '@routes';

export type ActiveTab = 'given' | 'received';

export function useMyReviewsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeTab, setActiveTab] = useState<ActiveTab>('received');
  const {reviews, isLoading, error, refetch} = useGetMyReviews();
  const given: Review[] = reviews?.given ?? [];
  const received: Review[] = reviews?.received ?? [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const data = activeTab === 'given' ? given : received;

  return {
    navigation,
    activeTab,
    setActiveTab,
    given,
    received,
    data,
    isLoading,
    error,
    refetch,
  };
}
