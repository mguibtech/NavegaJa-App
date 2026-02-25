import {useState} from 'react';
import {Platform} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format} from 'date-fns';

import type {AppStackParamList, TabsParamList} from '@routes';

export const POPULAR_ROUTES = [
  {origin: 'Manaus', destination: 'Parintins', icon: 'directions-boat'},
  {origin: 'Manaus', destination: 'Itacoatiara', icon: 'directions-boat'},
  {origin: 'Manaus', destination: 'Coari', icon: 'directions-boat'},
  {origin: 'Parintins', destination: 'Manaus', icon: 'directions-boat'},
];

export function useSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<TabsParamList, 'Search'>>();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const context = route.params?.context;

  function handleSearch() {
    if (!origin.trim() || !destination.trim()) {
      return;
    }
    const dateForApi = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined;
    (navigation as any).navigate('SearchResults', {
      origin: origin.trim(),
      destination: destination.trim(),
      date: dateForApi,
      context,
    });
  }

  function handlePopularRoute(r: {origin: string; destination: string}) {
    setOrigin(r.origin);
    setDestination(r.destination);
  }

  function handleDateChange(_event: any, selected?: Date) {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selected) {
      setSelectedDate(selected);
      const formatted = selected.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
      });
      setDate(formatted);
    }
  }

  function handleOpenDatePicker() {
    setShowDatePicker(true);
  }

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    date,
    selectedDate,
    showDatePicker,
    setShowDatePicker,
    context,
    handleSearch,
    handlePopularRoute,
    handleDateChange,
    handleOpenDatePicker,
  };
}
