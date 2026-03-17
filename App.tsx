import React, {useEffect} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@shopify/restyle';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {theme, darkTheme} from '@theme';
import {Router} from '@routes';
import {ToastContainer, PermissionsRequest} from '@components';
import {useThemeStore} from '@store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      throwOnError: false,
    },
    mutations: {
      throwOnError: false,
    },
  },
});

function App() {
  const colorScheme = useColorScheme();
  const {themeMode, loadTheme} = useThemeStore();

  useEffect(() => {
    loadTheme();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      queryClient.cancelQueries();
      queryClient.clear();
    };
  }, []);

  const isDark =
    themeMode === 'dark' || (themeMode === 'system' && colorScheme === 'dark');
  const activeTheme = isDark ? darkTheme : theme;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
