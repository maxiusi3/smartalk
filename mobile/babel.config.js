module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/navigation': './src/navigation',
          '@/services': './src/services',
          '@/store': './src/store',
          '@/types': './src/types',
          '@/utils': './src/utils',
          '@/assets': './assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
