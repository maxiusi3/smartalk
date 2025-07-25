import 'react-native-gesture-handler/jestSetup';

// Mock React Native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: jest.fn((obj) => obj.ios || obj.default),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
    },
    StatusBar: {
      setBarStyle: jest.fn(),
      setHidden: jest.fn(),
    },
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  NavigationContainer: ({ children }: any) => children,
}));

// Mock React Native Video
jest.mock('react-native-video', () => 'Video');

// Mock React Native Device Info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('test-device-id')),
  getTotalMemory: jest.fn(() => Promise.resolve(4 * 1024 * 1024 * 1024)),
  getUsedMemory: jest.fn(() => Promise.resolve(2 * 1024 * 1024 * 1024)),
  isLowRamDevice: jest.fn(() => Promise.resolve(false)),
  getSystemVersion: jest.fn(() => '15.0'),
  getModel: jest.fn(() => 'iPhone 13'),
}));

// Mock React Native Linear Gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock React Native Orientation Locker
jest.mock('react-native-orientation-locker', () => ({
  lockToPortrait: jest.fn(),
  lockToLandscape: jest.fn(),
  unlockAllOrientations: jest.fn(),
  getOrientation: jest.fn((callback) => callback('portrait')),
}));

// Mock React Native FS
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
  exists: jest.fn(() => Promise.resolve(true)),
  mkdir: jest.fn(() => Promise.resolve()),
  writeFile: jest.fn(() => Promise.resolve()),
  readFile: jest.fn(() => Promise.resolve('')),
  unlink: jest.fn(() => Promise.resolve()),
  stat: jest.fn(() => Promise.resolve({ size: 1024 })),
  readDir: jest.fn(() => Promise.resolve([])),
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, type: 'wifi' })),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn,
  error: console.error,
};

// Mock timers for tests that need them
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

// Global test timeout
jest.setTimeout(10000);

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Helper function to create mock user
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-123',
  deviceId: 'test-device-id',
  createdAt: new Date(),
  selectedInterest: null,
  onboardingCompleted: false,
  activationTimestamp: null,
  lastActiveTimestamp: new Date(),
  totalSessionTime: 0,
  ...overrides,
});

// Helper function to create mock drama
export const createMockDrama = (overrides = {}) => ({
  id: 'test-drama-1',
  title: 'Test Drama',
  interestId: 'travel',
  subtitledVideoUrl: 'https://example.com/video-subs.mp4',
  noSubtitlesVideoUrl: 'https://example.com/video-no-subs.mp4',
  duration: 60,
  keywords: [],
  ...overrides,
});

// Helper function to create mock keyword
export const createMockKeyword = (overrides = {}) => ({
  id: 'test-keyword-1',
  word: 'hello',
  audioUrl: 'https://example.com/audio.mp3',
  videoClips: [
    { id: 'clip-1', url: 'https://example.com/clip1.mp4', isCorrect: true },
    { id: 'clip-2', url: 'https://example.com/clip2.mp4', isCorrect: false },
  ],
  ...overrides,
});

// Helper function to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to flush promises
export const flushPromises = () => new Promise(resolve => setImmediate(resolve));