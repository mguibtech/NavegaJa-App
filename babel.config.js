module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: '.',
        alias: {
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@routes': './src/routes',
          '@screens': './src/screens',
          '@theme': './src/theme',
          '@domain': './src/domain',
          '@api': './src/api',
          '@types': './src/types',
          '@utils': './src/utils',
          '@services': './src/services',
          '@infra': './src/infra',
          '@config': './src/config',
        },
      },
    ],
  ],
};
