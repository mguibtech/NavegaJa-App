import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';

import {NavigationContainer} from '@react-navigation/native';

import {Box, GlobalSosHandler} from '@components';
import {useToast} from '@hooks';
import {useAuthStore} from '@store';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';
import {SplashScreen} from '../screens/splash/SplashScreen';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';
import {navigationRef} from './navigationRef';
import {useAppBootstrap} from './useAppBootstrap';
import {useForegroundSessionSync} from './useForegroundSessionSync';
import {useNotificationHandlers} from './useNotificationHandlers';

export function Router() {
  const {isLoggedIn, isLoading} = useAuthStore();
  const [showSplash, setShowSplash] = useState(true);
  const {showError} = useToast();
  const {hasOnboarded, completeOnboarding} = useAppBootstrap(() => {
    showError('Sua sessão expirou. Faça login novamente.');
  });
  const {flushPendingNavigation} = useNotificationHandlers();

  useForegroundSessionSync(isLoggedIn);

  useEffect(() => {
    if (isLoggedIn && hasOnboarded && !showSplash && navigationRef.isReady()) {
      flushPendingNavigation();
    }
  }, [flushPendingNavigation, hasOnboarded, isLoggedIn, showSplash]);

  function handleSplashFinish() {
    setShowSplash(false);
  }

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (hasOnboarded === null || isLoading) {
    return (
      <Box
        flex={1}
        backgroundColor="surface"
        justifyContent="center"
        alignItems="center">
        <ActivityIndicator size="large" color="#0a6fbd" />
      </Box>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        flushPendingNavigation();
      }}>
      {isLoggedIn ? (
        <>
          <AppStack />
          <GlobalSosHandler />
        </>
      ) : <AuthStack />}
    </NavigationContainer>
  );
}
