import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {AppStackParamList} from '@routes';

export function useTermsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return {
    navigation,
  };
}
