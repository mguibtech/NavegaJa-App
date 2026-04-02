import NetInfo, {NetInfoState} from '@react-native-community/netinfo';
import {onlineManager} from '@tanstack/react-query';

let currentOnlineState = true;
let managerInitialized = false;
let netInfoUnsubscribe: (() => void) | null = null;

function resolveOnlineState(state: NetInfoState): boolean {
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

export function setupOnlineManager() {
  if (managerInitialized) {
    return;
  }

  managerInitialized = true;
  netInfoUnsubscribe = NetInfo.addEventListener(state => {
    const isOnline = resolveOnlineState(state);
    currentOnlineState = isOnline;
    onlineManager.setOnline(isOnline);
  });

  NetInfo.fetch()
    .then(state => {
      const isOnline = resolveOnlineState(state);
      currentOnlineState = isOnline;
      onlineManager.setOnline(isOnline);
    })
    .catch(() => {});
}

export function teardownOnlineManager() {
  netInfoUnsubscribe?.();
  netInfoUnsubscribe = null;
  managerInitialized = false;
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
