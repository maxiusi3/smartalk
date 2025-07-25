import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

import {User, Interest, Drama, UserProgress} from '@/types/api';
import {OnboardingState, OnboardingStep, InterestType, OnboardingActions} from '@/types/onboarding.types';

interface AppState {
  // 用户状态
  user: User | null;
  deviceId: string;
  isFirstLaunch: boolean;

  // Onboarding状态
  onboarding: OnboardingState;

  // 应用设置
  isDarkMode: boolean;
  language: 'en' | 'zh';

  // 学习数据
  selectedInterest: Interest | null;
  currentDrama: Drama | null;
  userProgress: UserProgress[];

  // UI状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setDeviceId: (deviceId: string) => void;
  setFirstLaunch: (isFirst: boolean) => void;
  setDarkMode: (isDark: boolean) => void;
  setLanguage: (lang: 'en' | 'zh') => void;
  setSelectedInterest: (interest: Interest | null) => void;
  setCurrentDrama: (drama: Drama | null) => void;
  setUserProgress: (progress: UserProgress[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Onboarding Actions
  setOnboardingStep: (step: OnboardingStep) => void;
  setSelectedInterests: (interests: InterestType[]) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  
  // 初始化
  initialize: () => Promise<void>;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      deviceId: '',
      isFirstLaunch: true,

      // Onboarding初始状态
      onboarding: {
        isCompleted: false,
        currentStep: 'splash',
        selectedInterests: [],
        hasSkipped: false,
      },

      isDarkMode: false,
      language: 'zh',
      selectedInterest: null,
      currentDrama: null,
      userProgress: [],
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({user}),
      setDeviceId: (deviceId) => set({deviceId}),
      setFirstLaunch: (isFirstLaunch) => set({isFirstLaunch}),
      setDarkMode: (isDarkMode) => set({isDarkMode}),
      setLanguage: (language) => set({language}),
      setSelectedInterest: (selectedInterest) => set({selectedInterest}),
      setCurrentDrama: (currentDrama) => set({currentDrama}),
      setUserProgress: (userProgress) => set({userProgress}),
      setLoading: (isLoading) => set({isLoading}),
      setError: (error) => set({error}),

      // Onboarding Actions
      setOnboardingStep: (step) => set((state) => ({
        onboarding: { ...state.onboarding, currentStep: step }
      })),

      setSelectedInterests: (interests) => set((state) => ({
        onboarding: { ...state.onboarding, selectedInterests: interests }
      })),

      completeOnboarding: () => set((state) => ({
        onboarding: {
          ...state.onboarding,
          isCompleted: true,
          currentStep: 'completed'
        },
        isFirstLaunch: false
      })),

      skipOnboarding: () => set((state) => ({
        onboarding: {
          ...state.onboarding,
          isCompleted: true,
          hasSkipped: true,
          currentStep: 'completed'
        },
        isFirstLaunch: false
      })),

      resetOnboarding: () => set((state) => ({
        onboarding: {
          isCompleted: false,
          currentStep: 'splash',
          selectedInterests: [],
          hasSkipped: false,
        }
      })),

      // 初始化应用
      initialize: async () => {
        try {
          set({isLoading: true});
          
          // 获取设备ID
          const deviceId = await DeviceInfo.getUniqueId();
          set({deviceId});
          
          // 检查是否首次启动
          const hasLaunched = await AsyncStorage.getItem('hasLaunched');
          if (!hasLaunched) {
            set({isFirstLaunch: true});
            await AsyncStorage.setItem('hasLaunched', 'true');
          } else {
            set({isFirstLaunch: false});
          }
          
          set({isLoading: false});
        } catch (error) {
          console.error('App initialization failed:', error);
          set({error: 'Failed to initialize app', isLoading: false});
        }
      },

      // 重置状态
      reset: () => {
        set({
          user: null,
          selectedInterest: null,
          currentDrama: null,
          userProgress: [],
          error: null,
        });
      },
    }),
    {
      name: 'smartalk-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        deviceId: state.deviceId,
        isFirstLaunch: state.isFirstLaunch,
        isDarkMode: state.isDarkMode,
        language: state.language,
        user: state.user,
        selectedInterest: state.selectedInterest,
      }),
    }
  )
);
