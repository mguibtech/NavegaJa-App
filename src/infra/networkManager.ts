import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {onlineManager} from '@tanstack/react-query';

let currentOnlineState = true;
let managerInitialized = false;

function resolveOnlineState(state: NetInfoState): boolean {
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function setupOnlineManager() {
  if (managerInitialized) {
    return;
  }

  managerInitialized = true;
  onlineManager.setEventListener(setOnline => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isOnline = resolveOnlineState(state);
      currentOnlineState = isOnline;
      setOnline(isOnline);
    });

    NetInfo.fetch()
      .then(state => {
        const isOnline = resolveOnlineState(state);
        currentOnlineState = isOnline;
        setOnline(isOnline);
      })
      .catch(() => {});

    return unsubscribe;
  });
}

export async function refreshOnlineState(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    const isOnline = resolveOnlineState(state);
    currentOnlineState = isOnline;
    onlineManager.setOnline(isOnline);
    return isOnline;
  } catch {
    currentOnlineState = false;
    onlineManager.setOnline(false);
    return false;
  }
}

export function getCachedOnlineState(): boolean {
  return currentOnlineState;
}
