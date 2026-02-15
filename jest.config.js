module.exports = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|@react-navigation|react-native-reanimated|react-native-worklets|react-native-gesture-handler|react-native-safe-area-context|react-native-maps|react-native-image-picker|react-native-svg|@react-native-community|react-native-qrcode-svg|date-fns)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
