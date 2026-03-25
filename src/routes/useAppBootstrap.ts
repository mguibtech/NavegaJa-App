import {useEffect, useEffectEvent, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useAuthStore} from '@store';
import {apiClient} from '@api/apiClient';

const ONBOARDED_KEY = '@navegaja:onboarded';

export function useAppBootstrap(showSessionExpired: () => void) {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  const handleUnauthorized = useEffectEvent(() => {
    showSessionExpired();
    useAuthStore.getState().logout(true);
  });

  useEffect(() => {
    let isMounted = true;

    async function bootstrapApp() {
      const [onboarded] = await Promise.all([
        AsyncStorage.getItem(ONBOARDED_KEY),
        useAuthStore.getState().loadStoredUser(),
      ]);

      if (isMounted) {
        setHasOnboarded(Boolean(onboarded));
      }
    }

    apiClient.setUnauthorizedHandler(handleUnauthorized);
    bootstrapApp().catch(() => {
      if (isMounted) {
        setHasOnboarded(false);
      }
    });

    return () => {
      isMounted = false;
      apiClient.setUnauthorizedHandler(() => undefined);
    };
  }, []);

  function completeOnboarding() {
    setHasOnboarded(true);
  }

  return {
    hasOnboarded,
    completeOnboarding,
  };
}
