import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from '@shopify/restyle';

import {theme} from '@theme';
import {Router} from '@routes';
import {ToastContainer} from '@components';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={theme.colors.surface}
        />
        <Router />
        <ToastContainer />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
