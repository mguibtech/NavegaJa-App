import React from 'react';
import {StatusBar} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@shopify/restyle';

import {theme} from '@theme';
import {Router} from '@routes';
import {ToastContainer, PermissionsRequest} from '@components';

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
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={theme.colors.surface}
          />
          <Router />
          <ToastContainer />
          <PermissionsRequest />
        </ThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
