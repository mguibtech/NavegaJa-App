import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@shopify/restyle';

import {theme} from '@theme';
import {AuthProvider} from './src/contexts/AuthContext';
import {Router} from '@routes';

function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={theme.colors.surface}
          />
          <Router />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

export default App;
