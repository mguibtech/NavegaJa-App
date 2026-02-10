import React from 'react';
import {ActivityIndicator} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {Box} from '@components';
import {useAuth} from '../contexts/AuthContext';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';

export function Router() {
  const {isLoggedIn, isLoading} = useAuth();

  if (isLoading) {
    return (
      <Box
        flex={1}
        backgroundColor="surface"
        justifyContent="center"
        alignItems="center">
        <ActivityIndicator size="large" color="#0B5D8A" />
      </Box>
    );
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
