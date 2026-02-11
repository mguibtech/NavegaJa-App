import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {Box, Text} from '@components';
import {useAuthStore} from '../store/auth.store';

// Tela placeholder até construirmos as telas do app
function HomeScreen() {
  const {user, logout} = useAuthStore();

  return (
    <Box
      flex={1}
      backgroundColor="surface"
      justifyContent="center"
      alignItems="center"
      paddingHorizontal="s24">
      <Text preset="headingMedium" color="primary" bold>
        Bem-vindo, {user?.name}!
      </Text>
      <Text preset="paragraphMedium" color="textSecondary" mt="s8">
        Role: {user?.role}
      </Text>
      <Box mt="s24" width="100%">
        <Text
          preset="paragraphMedium"
          color="danger"
          bold
          textAlign="center"
          onPress={logout}>
          Sair
        </Text>
      </Box>
    </Box>
  );
}

export type AppStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
