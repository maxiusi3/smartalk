import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from './ApiService';
import { AnalyticsService } from './AnalyticsService';

export interface User {
  id: string;
  deviceId: string;
  selectedInterest?: string;
  cefrLevel?: string;
  placementTestCompleted: boolean;
  onboardingCompleted: boolean;
  activationTimestamp?: string;
  learningMotivation?: string;
  activationCohort?: string;
  aquaPoints: number;
  isFirstLaunch: boolean;
}

export interface PlacementTestResult {
  cefrLevel: string;
  pronunciationScore: number;
  listeningScore: number;
  vocabularyScore: number;
  overallScore: number;
}

export class UserService {
  private static instance: UserService;
  private user: User | null = null;
  private apiService: ApiService;
  private analyticsService: AnalyticsService;

  // Storage keys
  private static readonly STORAGE_KEYS = {
    USER_DATA: '@smartalk_user_data',
    FIRST_LAUNCH: '@smartalk_first_launch',
    ONBOARDING_COMPLETED: '@smartalk_onboarding_completed',
    PLACEMENT_TEST_RESULT: '@smartalk_placement_test_result',
  };

  private constructor() {
    this.apiService = ApiService.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 初始化用户服务
   */
  public async initialize(): Promise<void> {
    try {
      // 加载本地用户数据
      await this.loadUserFromStorage();
      
      // 如果没有用户数据，创建新用户
      if (!this.user) {
        await this.createNewUser();
      }

      // 同步到服务器
      await this.syncUserToServer();
    } catch (error) {
      console.error('Failed to initialize UserService:', error);
      throw error;
    }
  }

  /**
   * 检查是否是首次启动
   */
  public async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunchFlag = await AsyncStorage.getItem(UserService.STORAGE_KEYS.FIRST_LAUNCH);
      return firstLaunchFlag === null; // 如果没有标记，说明是首次启动
    } catch (error) {
      console.error('Error checking first launch:', error);
      return true; // 出错时默认为首次启动
    }
  }

  /**
   * 标记首次启动完成
   */
  public async markFirstLaunchCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(UserService.STORAGE_KEYS.FIRST_LAUNCH, 'completed');
      if (this.user) {
        this.user.isFirstLaunch = false;
        await this.saveUserToStorage();
      }
    } catch (error) {
      console.error('Error marking first launch completed:', error);
    }
  }

  /**
   * 检查是否完成了onboarding
   */
  public async hasCompletedOnboarding(): Promise<boolean> {
    try {
      if (this.user) {
        return this.user.onboardingCompleted;
      }
      
      const completed = await AsyncStorage.getItem(UserService.STORAGE_KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  /**
   * 标记onboarding完成
   */
  public async markOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(UserService.STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      if (this.user) {
        this.user.onboardingCompleted = true;
        await this.saveUserToStorage();
        await this.syncUserToServer();
      }

      this.analyticsService.track('onboarding_completed', {
        userId: this.user?.id,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error marking onboarding completed:', error);
    }
  }

  /**
   * 设置用户选择的兴趣主题
   */
  public async setSelectedInterest(interest: string): Promise<void> {
    try {
      if (this.user) {
        this.user.selectedInterest = interest;
        await this.saveUserToStorage();
        await this.syncUserToServer();

        this.analyticsService.track('theme_selected', {
          userId: this.user.id,
          selectedTheme: interest,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error('Error setting selected interest:', error);
    }
  }

  /**
   * 保存定级测试结果
   */
  public async savePlacementTestResult(result: PlacementTestResult): Promise<void> {
    try {
      await AsyncStorage.setItem(
        UserService.STORAGE_KEYS.PLACEMENT_TEST_RESULT,
        JSON.stringify(result)
      );

      if (this.user) {
        this.user.cefrLevel = result.cefrLevel;
        this.user.placementTestCompleted = true;
        await this.saveUserToStorage();
        await this.syncUserToServer();
      }

      this.analyticsService.track('placement_test_completed', {
        userId: this.user?.id,
        cefrLevel: result.cefrLevel,
        overallScore: result.overallScore,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving placement test result:', error);
    }
  }

  /**
   * 获取当前用户
   */
  public getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * 从本地存储加载用户数据
   */
  private async loadUserFromStorage(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem(UserService.STORAGE_KEYS.USER_DATA);
      if (userData) {
        this.user = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  /**
   * 保存用户数据到本地存储
   */
  private async saveUserToStorage(): Promise<void> {
    try {
      if (this.user) {
        await AsyncStorage.setItem(
          UserService.STORAGE_KEYS.USER_DATA,
          JSON.stringify(this.user)
        );
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  /**
   * 创建新用户
   */
  private async createNewUser(): Promise<void> {
    try {
      // 生成设备ID（简化版，实际应用中可能需要更复杂的逻辑）
      const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.user = {
        id: '', // 将由服务器分配
        deviceId,
        placementTestCompleted: false,
        onboardingCompleted: false,
        aquaPoints: 0,
        isFirstLaunch: true,
      };

      await this.saveUserToStorage();
    } catch (error) {
      console.error('Error creating new user:', error);
      throw error;
    }
  }

  /**
   * 同步用户数据到服务器
   */
  private async syncUserToServer(): Promise<void> {
    try {
      if (!this.user) return;

      // 如果用户还没有服务器ID，创建新用户
      if (!this.user.id) {
        const response = await this.apiService.post('/users', {
          deviceId: this.user.deviceId,
          selectedInterest: this.user.selectedInterest,
          cefrLevel: this.user.cefrLevel,
          placementTestCompleted: this.user.placementTestCompleted,
          onboardingCompleted: this.user.onboardingCompleted,
          aquaPoints: this.user.aquaPoints,
          isFirstLaunch: this.user.isFirstLaunch,
        });

        if (response.data?.id) {
          this.user.id = response.data.id;
          await this.saveUserToStorage();
        }
      } else {
        // 更新现有用户
        await this.apiService.put(`/users/${this.user.id}`, {
          selectedInterest: this.user.selectedInterest,
          cefrLevel: this.user.cefrLevel,
          placementTestCompleted: this.user.placementTestCompleted,
          onboardingCompleted: this.user.onboardingCompleted,
          aquaPoints: this.user.aquaPoints,
          isFirstLaunch: this.user.isFirstLaunch,
        });
      }
    } catch (error) {
      console.error('Error syncing user to server:', error);
      // 不抛出错误，允许离线使用
    }
  }
}
