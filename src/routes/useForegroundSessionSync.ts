import {useEffect, useEffectEvent, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';

import {useAuthStore} from '@store';

export function useForegroundSessionSync(isLoggedIn: boolean) {
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const refreshStoredUser = useEffectEvent(() => {
    useAuthStore.getState().loadStoredUser();
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (appStateRef.current !== 'active' && nextState === 'active' && isLoggedIn) {
        refreshStoredUser();
      }

      appStateRef.current = nextState;
    });

    return () => subscription.remove();
  }, [isLoggedIn]);
}
