import React, {useEffect} from 'react';
import {StatusBar, useColorScheme, StyleSheet} from 'react-native';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@shopify/restyle';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {theme, darkTheme} from '@theme';
import {Router} from '@routes';
import {ToastContainer, PermissionsRequest} from '@components';
import {useThemeStore} from '@store';
import {
  persistQueryClientOptions,
  queryClient,
  replayOfflineQueue,
  setupOnlineManager,
  teardownOnlineManager,
  refreshOnlineState,
  startOfflineQueueAutoSync,
} from '@infra';

function App() {
  const colorScheme = useColorScheme();
  const {themeMode, loadTheme} = useThemeStore();

  useEffect(() => {
    loadTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setupOnlineManager();
    refreshOnlineState().catch(() => {});

    const stopOfflineSync = startOfflineQueueAutoSync();

    return () => {
      stopOfflineSync();
      teardownOnlineManager();
      queryClient.cancelQueries();
    };
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');
  const activeTheme = isDark ? darkTheme : theme;

  return (
    <GestureHandlerRootView style={styles.root}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistQueryClientOptions}
        onSuccess={() => {
          replayOfflineQueue().catch(() => {});
        }}>
        <SafeAreaProvider>
          <ThemeProvider theme={activeTheme}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={activeTheme.colors.surface}
            />
            <Router />
            <ToastContainer />
            <PermissionsRequest />
          </ThemeProvider>
        </SafeAreaProvider>
      </PersistQueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
