/* eslint-env jest */

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => {
  const messaging = jest.fn(() => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    deleteToken: jest.fn(() => Promise.resolve()),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    requestPermission: jest.fn(() => Promise.resolve(1)),
    hasPermission: jest.fn(() => Promise.resolve(1)),
    setBackgroundMessageHandler: jest.fn(),
    subscribeToTopic: jest.fn(() => Promise.resolve()),
    unsubscribeFromTopic: jest.fn(() => Promise.resolve()),
  }));
  messaging.AuthorizationStatus = {AUTHORIZED: 1, PROVISIONAL: 2, DENIED: 0, NOT_DETERMINED: -1};
  return {__esModule: true, default: messaging};
});

// Mock @react-native-firebase/analytics
jest.mock('@react-native-firebase/analytics', () => {
  const analytics = jest.fn(() => ({
    logLogin: jest.fn(() => Promise.resolve()),
    logSignUp: jest.fn(() => Promise.resolve()),
    logSearch: jest.fn(() => Promise.resolve()),
    logSelectContent: jest.fn(() => Promise.resolve()),
    logBeginCheckout: jest.fn(() => Promise.resolve()),
    logPurchase: jest.fn(() => Promise.resolve()),
    logEvent: jest.fn(() => Promise.resolve()),
    logScreenView: jest.fn(() => Promise.resolve()),
  }));

  return {__esModule: true, default: analytics};
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;

  const createAnimatedComponent = (Component) => Component;

  return {
    __esModule: true,
    default: {
      View,
      Text: View,
      ScrollView: View,
      Image: View,
      createAnimatedComponent,
    },
    createAnimatedComponent,
    useSharedValue: jest.fn(() => ({value: 0})),
    useAnimatedStyle: jest.fn(() => ({})),
    useAnimatedProps: jest.fn(() => ({})),
    withTiming: jest.fn((value) => value),
    withSpring: jest.fn((value) => value),
    withDelay: jest.fn((_, value) => value),
    withSequence: jest.fn((...values) => values[0]),
    withRepeat: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    interpolate: jest.fn((_value, _inputRange, outputRange) => outputRange[0]),
    Easing: {
      linear: (x) => x,
      ease: (x) => x,
      quad: (x) => x,
      cubic: (x) => x,
      bezier: () => (x) => x,
      in: (easing) => easing,
      out: (easing) => easing,
      inOut: (easing) => easing,
    },
  };
});

// Mock react-native-maps
jest.mock('react-native-maps', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockMapView = (props) => React.createElement(View, props);
  const MockMarker = (props) => React.createElement(View, props);
  const MockPolyline = (props) => React.createElement(View, props);
  const MockCircle = (props) => React.createElement(View, props);

  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Polyline: MockPolyline,
    Circle: MockCircle,
    PROVIDER_GOOGLE: 'google',
  };
});

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(() => Promise.resolve({didCancel: false, assets: []})),
  launchImageLibrary: jest.fn(() => Promise.resolve({didCancel: false, assets: []})),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockSvg = (props) => React.createElement(View, props);
  const MockPath = (props) => React.createElement(View, props);
  const MockCircle = (props) => React.createElement(View, props);
  const MockRect = (props) => React.createElement(View, props);
  const MockLine = (props) => React.createElement(View, props);
  const MockG = (props) => React.createElement(View, props);
  const MockDefs = (props) => React.createElement(View, props);
  const MockLinearGradient = (props) => React.createElement(View, props);
  const MockRadialGradient = (props) => React.createElement(View, props);
  const MockStop = (props) => React.createElement(View, props);
  const MockText = (props) => React.createElement(View, props);
  const MockPolygon = (props) => React.createElement(View, props);
  const MockEllipse = (props) => React.createElement(View, props);

  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: MockPath,
    Circle: MockCircle,
    Rect: MockRect,
    Line: MockLine,
    G: MockG,
    Defs: MockDefs,
    LinearGradient: MockLinearGradient,
    RadialGradient: MockRadialGradient,
    Stop: MockStop,
    Text: MockText,
    Polygon: MockPolygon,
    Ellipse: MockEllipse,
  };
});

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => {
  const React = require('react');
  const {View} = require('react-native');

  const MockCamera = (props) => React.createElement(View, props);

  return {
    __esModule: true,
    Camera: MockCamera,
    useCameraDevice: jest.fn(() => ({id: 'mock-camera'})),
    useCameraPermission: jest.fn(() => ({
      hasPermission: true,
      requestPermission: jest.fn(() => Promise.resolve('granted')),
    })),
    useCodeScanner: jest.fn(() => ({})),
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
  RawButton: View,
  BaseButton: View,
  RectButton: View,
  BorderlessButton: View,
  FlatList: View,
  GestureHandlerRootView: View,
  gestureHandlerRootHOC: (component) => component,
  Directions: {},
  };
});

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: -3.119,
        longitude: -60.0217,
        accuracy: 10,
        altitude: 0,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(() => 1),
  clearWatch: jest.fn(),
  stopObserving: jest.fn(),
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => {
  const netInfo = {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({
        isConnected: true,
        isInternetReachable: true,
      }),
    ),
  };

  return {
    __esModule: true,
    default: netInfo,
    ...netInfo,
  };
});

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  const storage = new Map();

  class MockMMKV {
    set(key, value) {
      storage.set(key, String(value));
    }

    getString(key) {
      return storage.has(key) ? storage.get(key) : undefined;
    }

    remove(key) {
      storage.delete(key);
    }

    getAllKeys() {
      return Array.from(storage.keys());
    }

    clearAll() {
      storage.clear();
    }
  }

  return {
    MMKV: MockMMKV,
    createMMKV: jest.fn(() => new MockMMKV()),
  };
});

// Mock react-native-blob-util (native module for PDF download)
jest.mock('react-native-blob-util', () => ({
  __esModule: true,
  default: {
    fs: {
      dirs: {
        CacheDir: '/tmp/cache',
        DocumentDir: '/tmp/documents',
      },
    },
    config: jest.fn(() => ({
      fetch: jest.fn(() =>
        Promise.resolve({
          path: () => '/tmp/cache/mock-file.pdf',
        }),
      ),
    })),
    android: {
      actionViewIntent: jest.fn(() => Promise.resolve()),
    },
    ios: {
      openDocument: jest.fn(() => Promise.resolve()),
    },
  },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const {View} = require('react-native');
  return {
    SafeAreaProvider: ({children}) => children,
    SafeAreaView: View,
    SafeAreaInsetsContext: {
      Consumer: ({children}) => children({top: 0, bottom: 0, left: 0, right: 0}),
    },
    useSafeAreaInsets: () => ({top: 0, bottom: 0, left: 0, right: 0}),
    useSafeAreaFrame: () => ({x: 0, y: 0, width: 375, height: 812}),
    initialWindowMetrics: {
      frame: {x: 0, y: 0, width: 375, height: 812},
      insets: {top: 0, left: 0, right: 0, bottom: 0},
    },
  };
});

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
