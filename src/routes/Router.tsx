import React, {useEffect, useState} from 'react';
import {ActivityIndicator} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {NavigationContainer} from '@react-navigation/native';

import {Box} from '@components';
import {useAuthStore} from '../store/auth.store';
import {OnboardingScreen} from '../screens/onboarding/OnboardingScreen';

import {AppStack} from './AppStack';
import {AuthStack} from './AuthStack';

const ONBOARDED_KEY = '@navegaja:onboarded';

export function Router() {
  const {isLoggedIn, isLoading, loadStoredUser} = useAuthStore();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    checkOnboarding();
    loadStoredUser();
  }, []);

  async function checkOnboarding() {
    const onboarded = await AsyncStorage.getItem(ONBOARDED_KEY);
    setHasOnboarded(!!onboarded);
  }

  async function handleOnboardingComplete() {
    setHasOnboarded(true);
  }

  // Loading state
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

  // Show onboarding
  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show Auth or App
  return (
    <NavigationContainer>
      {isLoggedIn ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
