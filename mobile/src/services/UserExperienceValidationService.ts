/**
 * UserExperienceValidationService - V2 用户体验验证服务
 * 提供完整的用户体验测试：可用性测试、内容验证、错误恢复测试
 * 支持A/B测试、用户反馈收集、跨设备兼容性验证
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions, Platform } from 'react-native';
import * as Device from 'expo-device';
import { AnalyticsService } from './AnalyticsService';
import { ContentTheme } from './ContentManagementService';

// 测试类型
export type TestType = 
  | 'usability'          // 可用性测试
  | 'magic_moment'       // 魔法时刻验证
  | 'error_recovery'     // 错误恢复测试
  | 'accessibility'      // 无障碍测试
  | 'content_quality'    // 内容质量验证
  | 'pronunciation'      // 发音API测试
  | 'cross_device'       // 跨设备兼容性
  | 'emotional_response' // 情感响应测试
  | 'learning_effectiveness'; // 学习效果验证

// 用户画像
export interface UserPersona {
  id: string;
  name: string;
  age: number;
  occupation: string;
  englishLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  devicePreference: 'mobile' | 'tablet';
  timeAvailable: number; // minutes per day
  motivationFactors: string[];
}

// 测试会话
export interface TestSession {
  sessionId: string;
  testType: TestType;
  userId: string;
  userPersona?: UserPersona;
  
  // 会话信息
  startedAt: string;
  completedAt?: string;
  duration?: number; // seconds
  
  // 测试配置
  testScenarios: TestScenario[];
  currentScenarioIndex: number;
  
  // 结果数据
  results: TestResult[];
  overallScore: number;
  
  // 设备信息
  deviceInfo: DeviceInfo;
  
  // 状态
  status: 'active' | 'completed' | 'abandoned';
}

// 测试场景
export interface TestScenario {
  scenarioId: string;
  title: string;
  description: string;
  expectedOutcome: string;
  
  // 测试步骤
  steps: TestStep[];
  
  // 成功标准
  successCriteria: string[];
  
  // 时间限制
  timeLimit?: number; // seconds
}

// 测试步骤
export interface TestStep {
  stepId: string;
  instruction: string;
  expectedAction: string;
  
  // 验证点
  validationPoints: string[];
  
  // 时间记录
  startTime?: number;
  endTime?: number;
  completed: boolean;
  
  // 用户反馈
  userFeedback?: string;
  difficulty: number; // 1-5
  satisfaction: number; // 1-5
}

// 测试结果
export interface TestResult {
  scenarioId: string;
  stepId: string;
  
  // 结果数据
  success: boolean;
  completionTime: number; // seconds
  errorCount: number;
  
  // 用户体验指标
  taskCompletionRate: number; // 0-1
  userSatisfaction: number; // 1-5
  perceivedDifficulty: number; // 1-5
  
  // 定性反馈
  userComments: string;
  observedIssues: string[];
  
  // 情感响应
  emotionalResponse?: {
    engagement: number; // 1-5
    frustration: number; // 1-5
    confidence: number; // 1-5
    enjoyment: number; // 1-5
  };
}

// 设备信息
export interface DeviceInfo {
  platform: string;
  osVersion: string;
  deviceModel: string;
  screenSize: {
    width: number;
    height: number;
  };
  isTablet: boolean;
  hasNotch: boolean;
  supportedFeatures: string[];
}

// 内容验证结果
export interface ContentValidationResult {
  themeId: ContentTheme;
  
  // 内容质量指标
  accuracyScore: number; // 0-1
  relevanceScore: number; // 0-1
  difficultyAppropriate: boolean;
  
  // 学习效果指标
  comprehensionRate: number; // 0-1
  retentionRate: number; // 0-1
  engagementScore: number; // 0-1
  
  // 用户反馈
  userRatings: {
    contentQuality: number; // 1-5
    learningValue: number; // 1-5
    entertainment: number; // 1-5
  };
  
  // 改进建议
  improvementSuggestions: string[];
  
  // 验证时间
  validatedAt: string;
}

// A/B测试配置
export interface ABTestConfig {
  testId: string;
  testName: string;
  
  // 测试变体
  variants: {
    id: string;
    name: string;
    description: string;
    config: any;
  }[];
  
  // 分配规则
  trafficAllocation: number; // 0-1
  userSegments: string[];
  
  // 成功指标
  successMetrics: string[];
  
  // 测试期间
  startDate: string;
  endDate: string;
  
  // 状态
  status: 'draft' | 'active' | 'completed' | 'paused';
}

class UserExperienceValidationService {
  private static instance: UserExperienceValidationService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 测试会话管理
  private activeSessions: Map<string, TestSession> = new Map();
  private completedSessions: TestSession[] = [];
  
  // 内容验证结果
  private contentValidationResults: Map<ContentTheme, ContentValidationResult> = new Map();
  
  // A/B测试
  private activeABTests: Map<string, ABTestConfig> = new Map();
  private userABAssignments: Map<string, { [testId: string]: string }> = new Map();
  
  // 用户画像
  private userPersonas: Map<string, UserPersona> = new Map();
  
  // 存储键
  private readonly SESSIONS_KEY = 'test_sessions';
  private readonly CONTENT_VALIDATION_KEY = 'content_validation';
  private readonly AB_TESTS_KEY = 'ab_tests';
  private readonly PERSONAS_KEY = 'user_personas';

  static getInstance(): UserExperienceValidationService {
    if (!UserExperienceValidationService.instance) {
      UserExperienceValidationService.instance = new UserExperienceValidationService();
    }
    return UserExperienceValidationService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化用户体验验证服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认用户画像
      this.initializeDefaultPersonas();
      
      // 初始化设备信息
      await this.initializeDeviceInfo();
      
      this.analyticsService.track('ux_validation_service_initialized', {
        platform: Platform.OS,
        deviceModel: Device.modelName,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing UX validation service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载测试会话
      const sessionsData = await AsyncStorage.getItem(this.SESSIONS_KEY);
      if (sessionsData) {
        const sessions: TestSession[] = JSON.parse(sessionsData);
        sessions.forEach(session => {
          if (session.status === 'active') {
            this.activeSessions.set(session.sessionId, session);
          } else {
            this.completedSessions.push(session);
          }
        });
      }

      // 加载内容验证结果
      const validationData = await AsyncStorage.getItem(this.CONTENT_VALIDATION_KEY);
      if (validationData) {
        const results: ContentValidationResult[] = JSON.parse(validationData);
        results.forEach(result => {
          this.contentValidationResults.set(result.themeId, result);
        });
      }

      // 加载A/B测试
      const abTestsData = await AsyncStorage.getItem(this.AB_TESTS_KEY);
      if (abTestsData) {
        const tests: ABTestConfig[] = JSON.parse(abTestsData);
        tests.forEach(test => {
          this.activeABTests.set(test.testId, test);
        });
      }

      // 加载用户画像
      const personasData = await AsyncStorage.getItem(this.PERSONAS_KEY);
      if (personasData) {
        const personas: UserPersona[] = JSON.parse(personasData);
        personas.forEach(persona => {
          this.userPersonas.set(persona.id, persona);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认用户画像
   */
  private initializeDefaultPersonas(): void {
    const alexPersona: UserPersona = {
      id: 'alex_persona',
      name: 'Alex',
      age: 28,
      occupation: 'Software Developer',
      englishLevel: 'intermediate',
      learningGoals: ['Business Communication', 'Technical Vocabulary', 'Presentation Skills'],
      devicePreference: 'mobile',
      timeAvailable: 15,
      motivationFactors: ['Career Advancement', 'Efficiency', 'Achievement'],
    };

    this.userPersonas.set(alexPersona.id, alexPersona);
  }

  /**
   * 初始化设备信息
   */
  private async initializeDeviceInfo(): Promise<void> {
    const screenData = Dimensions.get('window');
    
    // 这里会收集设备信息用于兼容性测试
    const deviceInfo: DeviceInfo = {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: Device.modelName || 'Unknown',
      screenSize: {
        width: screenData.width,
        height: screenData.height,
      },
      isTablet: screenData.width > 768,
      hasNotch: screenData.height > 800 && Platform.OS === 'ios',
      supportedFeatures: [
        'camera',
        'microphone',
        'notifications',
        'haptics',
        'biometrics',
      ],
    };

    // 存储设备信息用于测试
    await AsyncStorage.setItem('device_info', JSON.stringify(deviceInfo));
  }

  // ===== 测试会话管理 =====

  /**
   * 开始测试会话
   */
  async startTestSession(
    testType: TestType,
    userId: string,
    personaId?: string
  ): Promise<string> {
    try {
      const sessionId = `test_${testType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deviceInfo = JSON.parse(await AsyncStorage.getItem('device_info') || '{}');
      const userPersona = personaId ? this.userPersonas.get(personaId) : undefined;
      
      const session: TestSession = {
        sessionId,
        testType,
        userId,
        userPersona,
        startedAt: new Date().toISOString(),
        testScenarios: this.generateTestScenarios(testType),
        currentScenarioIndex: 0,
        results: [],
        overallScore: 0,
        deviceInfo,
        status: 'active',
      };

      this.activeSessions.set(sessionId, session);
      await this.saveTestSessions();

      this.analyticsService.track('test_session_started', {
        sessionId,
        testType,
        userId,
        personaId,
        timestamp: Date.now(),
      });

      return sessionId;

    } catch (error) {
      console.error('Error starting test session:', error);
      throw error;
    }
  }

  /**
   * 生成测试场景
   */
  private generateTestScenarios(testType: TestType): TestScenario[] {
    const scenarioTemplates: { [key in TestType]: TestScenario[] } = {
      usability: [
        {
          scenarioId: 'onboarding_flow',
          title: '新用户引导流程',
          description: '测试新用户完成引导和首次学习的体验',
          expectedOutcome: '用户能够顺利完成引导并开始学习',
          steps: [
            {
              stepId: 'welcome_screen',
              instruction: '查看欢迎界面并点击开始',
              expectedAction: '点击开始按钮',
              validationPoints: ['界面清晰', '按钮易找', '文案易懂'],
              completed: false,
              difficulty: 1,
              satisfaction: 5,
            },
            {
              stepId: 'placement_test',
              instruction: '完成英语水平测试',
              expectedAction: '回答所有测试问题',
              validationPoints: ['问题难度适中', '进度清晰', '反馈及时'],
              completed: false,
              difficulty: 3,
              satisfaction: 4,
            },
          ],
          successCriteria: ['完成率>90%', '用户满意度>4', '完成时间<5分钟'],
          timeLimit: 300,
        },
      ],
      
      magic_moment: [
        {
          scenarioId: 'first_success',
          title: '首次成功体验',
          description: '测试用户首次答对问题时的情感响应',
          expectedOutcome: '用户感到成就感和继续学习的动力',
          steps: [
            {
              stepId: 'correct_answer',
              instruction: '回答一个简单问题并答对',
              expectedAction: '选择正确答案',
              validationPoints: ['音效反馈', '视觉庆祝', '情感共鸣'],
              completed: false,
              difficulty: 2,
              satisfaction: 5,
            },
          ],
          successCriteria: ['情感响应>4', '继续意愿>4'],
        },
      ],
      
      error_recovery: [
        {
          scenarioId: 'network_error',
          title: '网络错误恢复',
          description: '测试网络中断时的错误处理和恢复',
          expectedOutcome: '用户能够理解错误并成功恢复',
          steps: [
            {
              stepId: 'simulate_error',
              instruction: '模拟网络错误',
              expectedAction: '显示错误提示',
              validationPoints: ['错误信息清晰', '恢复选项明确', '数据不丢失'],
              completed: false,
              difficulty: 3,
              satisfaction: 3,
            },
          ],
          successCriteria: ['恢复成功率>95%', '数据完整性100%'],
        },
      ],
      
      accessibility: [
        {
          scenarioId: 'screen_reader',
          title: '屏幕阅读器测试',
          description: '测试屏幕阅读器的兼容性',
          expectedOutcome: '所有功能都能通过屏幕阅读器访问',
          steps: [
            {
              stepId: 'navigation',
              instruction: '使用屏幕阅读器导航应用',
              expectedAction: '成功访问所有功能',
              validationPoints: ['标签完整', '导航清晰', '反馈及时'],
              completed: false,
              difficulty: 4,
              satisfaction: 4,
            },
          ],
          successCriteria: ['可访问性100%', 'WCAG 2.1 AA合规'],
        },
      ],
      
      content_quality: [
        {
          scenarioId: 'theme_learning',
          title: '主题内容学习',
          description: '测试特定主题内容的学习效果',
          expectedOutcome: '用户能够有效学习并记住关键词',
          steps: [
            {
              stepId: 'content_engagement',
              instruction: '学习一个完整的主题内容',
              expectedAction: '完成所有学习活动',
              validationPoints: ['内容准确', '难度适中', '趣味性强'],
              completed: false,
              difficulty: 3,
              satisfaction: 4,
            },
          ],
          successCriteria: ['学习完成率>85%', '知识保留率>70%'],
        },
      ],
      
      pronunciation: [
        {
          scenarioId: 'speech_recognition',
          title: '语音识别测试',
          description: '测试发音识别的准确性',
          expectedOutcome: '发音识别准确且反馈有用',
          steps: [
            {
              stepId: 'pronunciation_test',
              instruction: '录制单词发音',
              expectedAction: '获得发音反馈',
              validationPoints: ['识别准确', '反馈有用', '改进建议'],
              completed: false,
              difficulty: 3,
              satisfaction: 4,
            },
          ],
          successCriteria: ['识别准确率>90%', '用户满意度>4'],
        },
      ],
      
      cross_device: [
        {
          scenarioId: 'device_compatibility',
          title: '设备兼容性测试',
          description: '测试不同设备上的功能兼容性',
          expectedOutcome: '所有功能在不同设备上正常工作',
          steps: [
            {
              stepId: 'feature_test',
              instruction: '测试核心功能',
              expectedAction: '所有功能正常',
              validationPoints: ['界面适配', '功能完整', '性能稳定'],
              completed: false,
              difficulty: 2,
              satisfaction: 4,
            },
          ],
          successCriteria: ['功能兼容性100%', '性能达标'],
        },
      ],
      
      emotional_response: [
        {
          scenarioId: 'engagement_test',
          title: '情感参与度测试',
          description: '测试用户的情感参与和满意度',
          expectedOutcome: '用户表现出积极的情感响应',
          steps: [
            {
              stepId: 'emotional_measurement',
              instruction: '完成学习活动并记录情感响应',
              expectedAction: '提供情感反馈',
              validationPoints: ['参与度高', '满意度高', '继续意愿强'],
              completed: false,
              difficulty: 2,
              satisfaction: 5,
            },
          ],
          successCriteria: ['参与度>4', '满意度>4', '推荐意愿>4'],
        },
      ],
      
      learning_effectiveness: [
        {
          scenarioId: 'learning_outcome',
          title: '学习效果验证',
          description: '测试实际的学习效果和知识保留',
          expectedOutcome: '用户能够有效学习并保留知识',
          steps: [
            {
              stepId: 'knowledge_test',
              instruction: '完成学习后测试',
              expectedAction: '通过知识测试',
              validationPoints: ['理解准确', '记忆牢固', '应用能力'],
              completed: false,
              difficulty: 3,
              satisfaction: 4,
            },
          ],
          successCriteria: ['学习效果>80%', '知识保留>70%'],
        },
      ],
    };

    return scenarioTemplates[testType] || [];
  }

  /**
   * 记录测试步骤结果
   */
  async recordStepResult(
    sessionId: string,
    scenarioId: string,
    stepId: string,
    result: Partial<TestResult>
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) return;

      const testResult: TestResult = {
        scenarioId,
        stepId,
        success: result.success || false,
        completionTime: result.completionTime || 0,
        errorCount: result.errorCount || 0,
        taskCompletionRate: result.taskCompletionRate || 0,
        userSatisfaction: result.userSatisfaction || 3,
        perceivedDifficulty: result.perceivedDifficulty || 3,
        userComments: result.userComments || '',
        observedIssues: result.observedIssues || [],
        emotionalResponse: result.emotionalResponse,
      };

      session.results.push(testResult);
      
      // 更新步骤状态
      const scenario = session.testScenarios.find(s => s.scenarioId === scenarioId);
      if (scenario) {
        const step = scenario.steps.find(s => s.stepId === stepId);
        if (step) {
          step.completed = true;
          step.endTime = Date.now();
          step.userFeedback = result.userComments;
          step.difficulty = result.perceivedDifficulty || 3;
          step.satisfaction = result.userSatisfaction || 3;
        }
      }

      await this.saveTestSessions();

      this.analyticsService.track('test_step_completed', {
        sessionId,
        scenarioId,
        stepId,
        success: result.success,
        completionTime: result.completionTime,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error recording step result:', error);
    }
  }

  /**
   * 完成测试会话
   */
  async completeTestSession(sessionId: string): Promise<TestSession> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) throw new Error('Session not found');

      session.status = 'completed';
      session.completedAt = new Date().toISOString();
      session.duration = Math.floor(
        (new Date().getTime() - new Date(session.startedAt).getTime()) / 1000
      );

      // 计算总体分数
      session.overallScore = this.calculateOverallScore(session);

      // 移动到已完成会话
      this.activeSessions.delete(sessionId);
      this.completedSessions.push(session);

      await this.saveTestSessions();

      this.analyticsService.track('test_session_completed', {
        sessionId,
        testType: session.testType,
        duration: session.duration,
        overallScore: session.overallScore,
        timestamp: Date.now(),
      });

      return session;

    } catch (error) {
      console.error('Error completing test session:', error);
      throw error;
    }
  }

  /**
   * 计算总体分数
   */
  private calculateOverallScore(session: TestSession): number {
    if (session.results.length === 0) return 0;

    const totalScore = session.results.reduce((sum, result) => {
      return sum + (
        result.taskCompletionRate * 0.4 +
        (result.userSatisfaction / 5) * 0.3 +
        (1 - result.perceivedDifficulty / 5) * 0.2 +
        (result.success ? 1 : 0) * 0.1
      );
    }, 0);

    return Math.round((totalScore / session.results.length) * 100);
  }

  /**
   * 保存测试会话
   */
  private async saveTestSessions(): Promise<void> {
    try {
      const allSessions = [
        ...Array.from(this.activeSessions.values()),
        ...this.completedSessions,
      ];
      
      await AsyncStorage.setItem(this.SESSIONS_KEY, JSON.stringify(allSessions));
    } catch (error) {
      console.error('Error saving test sessions:', error);
    }
  }

  // ===== 内容验证 =====

  /**
   * 验证主题内容质量
   */
  async validateThemeContent(
    themeId: ContentTheme,
    validationData: Partial<ContentValidationResult>
  ): Promise<void> {
    try {
      const result: ContentValidationResult = {
        themeId,
        accuracyScore: validationData.accuracyScore || 0.9,
        relevanceScore: validationData.relevanceScore || 0.85,
        difficultyAppropriate: validationData.difficultyAppropriate || true,
        comprehensionRate: validationData.comprehensionRate || 0.8,
        retentionRate: validationData.retentionRate || 0.75,
        engagementScore: validationData.engagementScore || 0.85,
        userRatings: validationData.userRatings || {
          contentQuality: 4.2,
          learningValue: 4.0,
          entertainment: 3.8,
        },
        improvementSuggestions: validationData.improvementSuggestions || [],
        validatedAt: new Date().toISOString(),
      };

      this.contentValidationResults.set(themeId, result);
      await this.saveContentValidation();

      this.analyticsService.track('content_validated', {
        themeId,
        accuracyScore: result.accuracyScore,
        engagementScore: result.engagementScore,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error validating theme content:', error);
    }
  }

  /**
   * 保存内容验证结果
   */
  private async saveContentValidation(): Promise<void> {
    try {
      const results = Array.from(this.contentValidationResults.values());
      await AsyncStorage.setItem(this.CONTENT_VALIDATION_KEY, JSON.stringify(results));
    } catch (error) {
      console.error('Error saving content validation:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取测试会话
   */
  getTestSession(sessionId: string): TestSession | null {
    return this.activeSessions.get(sessionId) || 
           this.completedSessions.find(s => s.sessionId === sessionId) || null;
  }

  /**
   * 获取用户的测试历史
   */
  getUserTestHistory(userId: string): TestSession[] {
    return this.completedSessions.filter(session => session.userId === userId);
  }

  /**
   * 获取内容验证结果
   */
  getContentValidationResult(themeId: ContentTheme): ContentValidationResult | null {
    return this.contentValidationResults.get(themeId) || null;
  }

  /**
   * 获取所有内容验证结果
   */
  getAllContentValidationResults(): ContentValidationResult[] {
    return Array.from(this.contentValidationResults.values());
  }

  /**
   * 获取用户画像
   */
  getUserPersona(personaId: string): UserPersona | null {
    return this.userPersonas.get(personaId) || null;
  }

  /**
   * 获取所有用户画像
   */
  getAllUserPersonas(): UserPersona[] {
    return Array.from(this.userPersonas.values());
  }

  /**
   * 获取测试统计
   */
  getTestStatistics(): {
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    testTypeDistribution: { [key in TestType]?: number };
  } {
    const totalSessions = this.activeSessions.size + this.completedSessions.length;
    const completedSessions = this.completedSessions.length;
    
    const averageScore = completedSessions > 0 ? 
      this.completedSessions.reduce((sum, session) => sum + session.overallScore, 0) / completedSessions : 0;

    const testTypeDistribution: { [key in TestType]?: number } = {};
    this.completedSessions.forEach(session => {
      testTypeDistribution[session.testType] = (testTypeDistribution[session.testType] || 0) + 1;
    });

    return {
      totalSessions,
      completedSessions,
      averageScore: Math.round(averageScore),
      testTypeDistribution,
    };
  }
}

export default UserExperienceValidationService;
