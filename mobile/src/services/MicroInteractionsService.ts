/**
 * MicroInteractionsService - V2 微交互和情感设计服务
 * 提供完整的微交互体验：情感化反馈、信心建立、成就感强化
 * 支持个性化交互风格、情感状态追踪、用户体验优化
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import { useSoundAndHaptic } from '@/hooks/useSoundAndHaptic';
import HapticFeedbackService from './HapticFeedbackService';
import SoundDesignService from './SoundDesignService';

// 情感状态类型
export type EmotionalState = 
  | 'frustrated'      // 沮丧
  | 'confused'        // 困惑
  | 'neutral'         // 中性
  | 'engaged'         // 参与
  | 'confident'       // 自信
  | 'excited'         // 兴奋
  | 'accomplished';   // 成就感

// 交互类型
export type InteractionType =
  | 'correct_answer'      // 正确答案
  | 'incorrect_answer'    // 错误答案
  | 'magic_moment'        // 魔法时刻
  | 'badge_unlock'        // 徽章解锁
  | 'streak_milestone'    // 连击里程碑
  | 'chapter_complete'    // 章节完成
  | 'level_up'           // 升级
  | 'first_success'      // 首次成功
  | 'comeback'           // 回归
  | 'perfect_session'    // 完美会话
  | 'daily_goal'         // 每日目标
  | 'weekly_goal';       // 每周目标

// 微交互配置
export interface MicroInteractionConfig {
  userId: string;
  
  // 情感设计偏好
  emotionalDesignPreferences: {
    celebrationIntensity: 'subtle' | 'moderate' | 'enthusiastic';
    encouragementStyle: 'gentle' | 'motivational' | 'energetic';
    feedbackTiming: 'immediate' | 'delayed' | 'contextual';
    visualComplexity: 'minimal' | 'balanced' | 'rich';
  };
  
  // 交互响应设置
  interactionResponses: {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
    animationsEnabled: boolean;
    particleEffectsEnabled: boolean;
    celebrationDuration: number; // milliseconds
  };
  
  // 信心建立策略
  confidenceBuildingStrategy: {
    positiveReinforcementFrequency: 'low' | 'medium' | 'high';
    errorHandlingStyle: 'supportive' | 'educational' | 'motivational';
    progressCelebrationThreshold: number; // 0-1
    achievementHighlighting: boolean;
  };
  
  // 个性化调整
  personalizationSettings: {
    adaptToEmotionalState: boolean;
    learningFromInteractions: boolean;
    contextualFeedback: boolean;
    progressiveComplexity: boolean;
  };
}

// 情感状态追踪
export interface EmotionalStateTracking {
  userId: string;
  currentState: EmotionalState;
  stateHistory: {
    state: EmotionalState;
    timestamp: string;
    trigger: InteractionType;
    context: string;
  }[];
  
  // 状态分析
  stateAnalysis: {
    dominantState: EmotionalState;
    stateTransitions: { [from: string]: { [to: string]: number } };
    averageSessionMood: number; // -1 to 1
    confidenceLevel: number; // 0-1
  };
  
  // 干预策略
  interventionTriggers: {
    frustrationThreshold: number;
    confidenceBoostNeeded: boolean;
    encouragementRequired: boolean;
    celebrationOpportunity: boolean;
  };
}

// 微交互响应
export interface MicroInteractionResponse {
  interactionId: string;
  type: InteractionType;
  emotionalContext: EmotionalState;
  
  // 响应组件
  audioResponse?: {
    soundEffect: string;
    backgroundMusic?: string;
    volume: number;
    delay: number;
  };
  
  hapticResponse?: {
    pattern: 'light' | 'medium' | 'heavy' | 'success' | 'error';
    intensity: number;
    duration: number;
  };
  
  visualResponse?: {
    animation: string;
    particles?: boolean;
    colors: string[];
    duration: number;
    easing: string;
  };
  
  textualResponse?: {
    message: string;
    tone: 'encouraging' | 'celebratory' | 'supportive' | 'motivational';
    displayDuration: number;
  };
}

// 成就感强化策略
export interface AchievementAmplificationStrategy {
  userId: string;
  
  // 成就类型权重
  achievementWeights: {
    [key in InteractionType]: number;
  };
  
  // 强化技术
  amplificationTechniques: {
    progressVisualization: boolean;
    socialSharing: boolean;
    personalizedCelebration: boolean;
    contextualRewards: boolean;
    streakHighlighting: boolean;
  };
  
  // 时机优化
  timingOptimization: {
    delayedGratification: boolean;
    buildUpSuspense: boolean;
    cascadingRewards: boolean;
    surpriseElements: boolean;
  };
}

class MicroInteractionsService {
  private static instance: MicroInteractionsService;
  private analyticsService = AnalyticsService.getInstance();
  private hapticService = HapticFeedbackService.getInstance();
  private soundService = SoundDesignService.getInstance();
  
  // 用户配置和状态
  private userConfigs: Map<string, MicroInteractionConfig> = new Map();
  private emotionalStates: Map<string, EmotionalStateTracking> = new Map();
  private amplificationStrategies: Map<string, AchievementAmplificationStrategy> = new Map();
  
  // 交互历史
  private interactionHistory: Map<string, MicroInteractionResponse[]> = new Map();
  
  // 存储键
  private readonly USER_CONFIGS_KEY = 'micro_interaction_configs';
  private readonly EMOTIONAL_STATES_KEY = 'emotional_states';
  private readonly AMPLIFICATION_STRATEGIES_KEY = 'amplification_strategies';

  static getInstance(): MicroInteractionsService {
    if (!MicroInteractionsService.instance) {
      MicroInteractionsService.instance = new MicroInteractionsService();
    }
    return MicroInteractionsService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化微交互服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 开始情感状态监控
      this.startEmotionalStateMonitoring();
      
      this.analyticsService.track('micro_interactions_service_initialized', {
        usersCount: this.userConfigs.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing micro interactions service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载用户配置
      const configsData = await AsyncStorage.getItem(this.USER_CONFIGS_KEY);
      if (configsData) {
        const configs: MicroInteractionConfig[] = JSON.parse(configsData);
        configs.forEach(config => {
          this.userConfigs.set(config.userId, config);
        });
      }

      // 加载情感状态
      const statesData = await AsyncStorage.getItem(this.EMOTIONAL_STATES_KEY);
      if (statesData) {
        const states: EmotionalStateTracking[] = JSON.parse(statesData);
        states.forEach(state => {
          this.emotionalStates.set(state.userId, state);
        });
      }

      // 加载强化策略
      const strategiesData = await AsyncStorage.getItem(this.AMPLIFICATION_STRATEGIES_KEY);
      if (strategiesData) {
        const strategies: AchievementAmplificationStrategy[] = JSON.parse(strategiesData);
        strategies.forEach(strategy => {
          this.amplificationStrategies.set(strategy.userId, strategy);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 开始情感状态监控
   */
  private startEmotionalStateMonitoring(): void {
    // 每分钟分析情感状态
    setInterval(() => {
      this.analyzeEmotionalStates();
    }, 60 * 1000);
    
    // 每小时优化交互策略
    setInterval(() => {
      this.optimizeInteractionStrategies();
    }, 60 * 60 * 1000);
  }

  // ===== 用户配置管理 =====

  /**
   * 初始化用户配置
   */
  async initializeUserConfig(userId: string): Promise<MicroInteractionConfig> {
    try {
      const config: MicroInteractionConfig = {
        userId,
        emotionalDesignPreferences: {
          celebrationIntensity: 'moderate',
          encouragementStyle: 'motivational',
          feedbackTiming: 'immediate',
          visualComplexity: 'balanced',
        },
        interactionResponses: {
          soundEnabled: true,
          hapticsEnabled: true,
          animationsEnabled: true,
          particleEffectsEnabled: true,
          celebrationDuration: 2000,
        },
        confidenceBuildingStrategy: {
          positiveReinforcementFrequency: 'medium',
          errorHandlingStyle: 'supportive',
          progressCelebrationThreshold: 0.25,
          achievementHighlighting: true,
        },
        personalizationSettings: {
          adaptToEmotionalState: true,
          learningFromInteractions: true,
          contextualFeedback: true,
          progressiveComplexity: true,
        },
      };

      this.userConfigs.set(userId, config);
      await this.saveUserConfigs();

      // 初始化情感状态追踪
      await this.initializeEmotionalStateTracking(userId);
      
      // 初始化成就强化策略
      await this.initializeAmplificationStrategy(userId);

      return config;

    } catch (error) {
      console.error('Error initializing user config:', error);
      throw error;
    }
  }

  /**
   * 初始化情感状态追踪
   */
  private async initializeEmotionalStateTracking(userId: string): Promise<void> {
    try {
      const tracking: EmotionalStateTracking = {
        userId,
        currentState: 'neutral',
        stateHistory: [],
        stateAnalysis: {
          dominantState: 'neutral',
          stateTransitions: {},
          averageSessionMood: 0,
          confidenceLevel: 0.5,
        },
        interventionTriggers: {
          frustrationThreshold: 0.3,
          confidenceBoostNeeded: false,
          encouragementRequired: false,
          celebrationOpportunity: false,
        },
      };

      this.emotionalStates.set(userId, tracking);
      await this.saveEmotionalStates();

    } catch (error) {
      console.error('Error initializing emotional state tracking:', error);
    }
  }

  /**
   * 初始化成就强化策略
   */
  private async initializeAmplificationStrategy(userId: string): Promise<void> {
    try {
      const strategy: AchievementAmplificationStrategy = {
        userId,
        achievementWeights: {
          correct_answer: 1,
          incorrect_answer: 0.5,
          magic_moment: 5,
          badge_unlock: 4,
          streak_milestone: 3,
          chapter_complete: 4,
          level_up: 5,
          first_success: 3,
          comeback: 2,
          perfect_session: 4,
          daily_goal: 3,
          weekly_goal: 4,
        },
        amplificationTechniques: {
          progressVisualization: true,
          socialSharing: true,
          personalizedCelebration: true,
          contextualRewards: true,
          streakHighlighting: true,
        },
        timingOptimization: {
          delayedGratification: true,
          buildUpSuspense: true,
          cascadingRewards: true,
          surpriseElements: true,
        },
      };

      this.amplificationStrategies.set(userId, strategy);
      await this.saveAmplificationStrategies();

    } catch (error) {
      console.error('Error initializing amplification strategy:', error);
    }
  }

  // ===== 核心交互处理 =====

  /**
   * 触发微交互
   */
  async triggerMicroInteraction(
    userId: string,
    interactionType: InteractionType,
    context?: any
  ): Promise<void> {
    try {
      const config = this.userConfigs.get(userId);
      const emotionalState = this.emotionalStates.get(userId);
      
      if (!config || !emotionalState) {
        await this.initializeUserConfig(userId);
        return this.triggerMicroInteraction(userId, interactionType, context);
      }

      // 生成个性化响应
      const response = await this.generatePersonalizedResponse(
        userId,
        interactionType,
        emotionalState.currentState,
        context
      );

      // 执行响应
      await this.executeResponse(response);

      // 更新情感状态
      await this.updateEmotionalState(userId, interactionType, context);

      // 记录交互
      this.recordInteraction(userId, response);

      this.analyticsService.track('micro_interaction_triggered', {
        userId,
        interactionType,
        emotionalState: emotionalState.currentState,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error triggering micro interaction:', error);
    }
  }

  /**
   * 生成个性化响应
   */
  private async generatePersonalizedResponse(
    userId: string,
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    context?: any
  ): Promise<MicroInteractionResponse> {
    const config = this.userConfigs.get(userId)!;
    const strategy = this.amplificationStrategies.get(userId)!;
    
    const interactionId = `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const response: MicroInteractionResponse = {
      interactionId,
      type: interactionType,
      emotionalContext: emotionalState,
    };

    // 音频响应
    if (config.interactionResponses.soundEnabled) {
      response.audioResponse = this.generateAudioResponse(interactionType, emotionalState, config);
    }

    // 触觉响应
    if (config.interactionResponses.hapticsEnabled) {
      response.hapticResponse = this.generateHapticResponse(interactionType, emotionalState, config);
    }

    // 视觉响应
    if (config.interactionResponses.animationsEnabled) {
      response.visualResponse = this.generateVisualResponse(interactionType, emotionalState, config);
    }

    // 文本响应
    response.textualResponse = this.generateTextualResponse(interactionType, emotionalState, config);

    return response;
  }

  /**
   * 生成音频响应
   */
  private generateAudioResponse(
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    config: MicroInteractionConfig
  ): any {
    const soundMap: { [key in InteractionType]: string } = {
      correct_answer: 'correct_chime',
      incorrect_answer: 'gentle_error',
      magic_moment: 'magic_celebration',
      badge_unlock: 'achievement_fanfare',
      streak_milestone: 'streak_success',
      chapter_complete: 'chapter_complete',
      level_up: 'level_up_fanfare',
      first_success: 'first_success',
      comeback: 'welcome_back',
      perfect_session: 'perfect_celebration',
      daily_goal: 'daily_achievement',
      weekly_goal: 'weekly_celebration',
    };

    return {
      soundEffect: soundMap[interactionType],
      volume: this.calculateVolumeBasedOnState(emotionalState),
      delay: config.emotionalDesignPreferences.feedbackTiming === 'delayed' ? 500 : 0,
    };
  }

  /**
   * 生成触觉响应
   */
  private generateHapticResponse(
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    config: MicroInteractionConfig
  ): any {
    const hapticMap: { [key in InteractionType]: any } = {
      correct_answer: { pattern: 'light', intensity: 0.5, duration: 100 },
      incorrect_answer: { pattern: 'error', intensity: 0.3, duration: 200 },
      magic_moment: { pattern: 'success', intensity: 1.0, duration: 500 },
      badge_unlock: { pattern: 'heavy', intensity: 0.8, duration: 300 },
      streak_milestone: { pattern: 'success', intensity: 0.7, duration: 250 },
      chapter_complete: { pattern: 'success', intensity: 0.8, duration: 400 },
      level_up: { pattern: 'heavy', intensity: 1.0, duration: 600 },
      first_success: { pattern: 'medium', intensity: 0.6, duration: 200 },
      comeback: { pattern: 'light', intensity: 0.4, duration: 150 },
      perfect_session: { pattern: 'success', intensity: 0.9, duration: 450 },
      daily_goal: { pattern: 'medium', intensity: 0.6, duration: 250 },
      weekly_goal: { pattern: 'heavy', intensity: 0.8, duration: 350 },
    };

    return hapticMap[interactionType];
  }

  /**
   * 生成视觉响应
   */
  private generateVisualResponse(
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    config: MicroInteractionConfig
  ): any {
    const celebrationIntensity = config.emotionalDesignPreferences.celebrationIntensity;
    
    const baseResponse = {
      animation: this.getAnimationForInteraction(interactionType),
      particles: config.interactionResponses.particleEffectsEnabled,
      colors: this.getColorsForInteraction(interactionType, emotionalState),
      duration: config.interactionResponses.celebrationDuration,
      easing: 'easeOutBack',
    };

    // 根据庆祝强度调整
    if (celebrationIntensity === 'subtle') {
      baseResponse.duration *= 0.7;
      baseResponse.particles = false;
    } else if (celebrationIntensity === 'enthusiastic') {
      baseResponse.duration *= 1.3;
      baseResponse.particles = true;
    }

    return baseResponse;
  }

  /**
   * 生成文本响应
   */
  private generateTextualResponse(
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    config: MicroInteractionConfig
  ): any {
    const messages = this.getMessagesForInteraction(interactionType, emotionalState, config);
    const selectedMessage = messages[Math.floor(Math.random() * messages.length)];

    return {
      message: selectedMessage,
      tone: this.getToneForInteraction(interactionType, config),
      displayDuration: 3000,
    };
  }

  /**
   * 执行响应
   */
  private async executeResponse(response: MicroInteractionResponse): Promise<void> {
    try {
      // 执行音频响应
      if (response.audioResponse) {
        await this.soundService.playSound(
          response.audioResponse.soundEffect,
          response.audioResponse.volume
        );
      }

      // 执行触觉响应
      if (response.hapticResponse) {
        await this.hapticService.triggerHapticFeedback(
          response.hapticResponse.pattern as any,
          response.hapticResponse.intensity
        );
      }

      // 视觉和文本响应由UI组件处理
      // 这里可以通过事件系统通知UI组件

    } catch (error) {
      console.error('Error executing response:', error);
    }
  }

  /**
   * 更新情感状态
   */
  private async updateEmotionalState(
    userId: string,
    interactionType: InteractionType,
    context?: any
  ): Promise<void> {
    try {
      const tracking = this.emotionalStates.get(userId);
      if (!tracking) return;

      const previousState = tracking.currentState;
      const newState = this.calculateNewEmotionalState(previousState, interactionType, context);

      // 更新当前状态
      tracking.currentState = newState;

      // 记录状态历史
      tracking.stateHistory.push({
        state: newState,
        timestamp: new Date().toISOString(),
        trigger: interactionType,
        context: JSON.stringify(context || {}),
      });

      // 限制历史记录长度
      if (tracking.stateHistory.length > 100) {
        tracking.stateHistory = tracking.stateHistory.slice(-100);
      }

      // 更新状态分析
      this.updateStateAnalysis(tracking);

      this.emotionalStates.set(userId, tracking);
      await this.saveEmotionalStates();

    } catch (error) {
      console.error('Error updating emotional state:', error);
    }
  }

  // ===== 辅助方法 =====

  private calculateVolumeBasedOnState(emotionalState: EmotionalState): number {
    const volumeMap: { [key in EmotionalState]: number } = {
      frustrated: 0.3,
      confused: 0.4,
      neutral: 0.6,
      engaged: 0.7,
      confident: 0.8,
      excited: 0.9,
      accomplished: 1.0,
    };
    return volumeMap[emotionalState];
  }

  private getAnimationForInteraction(interactionType: InteractionType): string {
    const animationMap: { [key in InteractionType]: string } = {
      correct_answer: 'checkmark_bounce',
      incorrect_answer: 'shake_gentle',
      magic_moment: 'star_burst',
      badge_unlock: 'badge_flip',
      streak_milestone: 'fire_animation',
      chapter_complete: 'confetti_burst',
      level_up: 'level_up_glow',
      first_success: 'sparkle_trail',
      comeback: 'welcome_fade',
      perfect_session: 'perfect_glow',
      daily_goal: 'goal_check',
      weekly_goal: 'trophy_shine',
    };
    return animationMap[interactionType];
  }

  private getColorsForInteraction(interactionType: InteractionType, emotionalState: EmotionalState): string[] {
    // 基础颜色映射
    const baseColors: { [key in InteractionType]: string[] } = {
      correct_answer: ['#10b981', '#34d399'],
      incorrect_answer: ['#f59e0b', '#fbbf24'],
      magic_moment: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
      badge_unlock: ['#f59e0b', '#fbbf24', '#fcd34d'],
      streak_milestone: ['#ef4444', '#f87171', '#fca5a5'],
      chapter_complete: ['#3b82f6', '#60a5fa', '#93c5fd'],
      level_up: ['#8b5cf6', '#a78bfa'],
      first_success: ['#10b981', '#34d399'],
      comeback: ['#6366f1', '#818cf8'],
      perfect_session: ['#f59e0b', '#fbbf24'],
      daily_goal: ['#10b981', '#34d399'],
      weekly_goal: ['#8b5cf6', '#a78bfa'],
    };

    return baseColors[interactionType];
  }

  private getMessagesForInteraction(
    interactionType: InteractionType,
    emotionalState: EmotionalState,
    config: MicroInteractionConfig
  ): string[] {
    // 根据交互类型和情感状态生成个性化消息
    const messageMap: { [key in InteractionType]: { [key in EmotionalState]?: string[] } } = {
      correct_answer: {
        neutral: ['正确！', '很好！', '答对了！'],
        confident: ['太棒了！', '继续保持！', '你真厉害！'],
        excited: ['Amazing！', '完美！', '你是天才！'],
      },
      magic_moment: {
        neutral: ['恭喜达成魔法时刻！', '太棒了！'],
        confident: ['你做到了！这就是魔法时刻！', '完美的表现！'],
        excited: ['不可思议！你创造了魔法时刻！', '这就是学习的力量！'],
      },
      // 其他交互类型...
    };

    const stateMessages = messageMap[interactionType]?.[emotionalState];
    return stateMessages || ['很好！', '继续加油！'];
  }

  private getToneForInteraction(interactionType: InteractionType, config: MicroInteractionConfig): string {
    const encouragementStyle = config.emotionalDesignPreferences.encouragementStyle;
    
    if (interactionType === 'incorrect_answer') {
      return 'supportive';
    } else if (['magic_moment', 'badge_unlock', 'level_up'].includes(interactionType)) {
      return 'celebratory';
    } else if (encouragementStyle === 'energetic') {
      return 'motivational';
    } else {
      return 'encouraging';
    }
  }

  private calculateNewEmotionalState(
    currentState: EmotionalState,
    interactionType: InteractionType,
    context?: any
  ): EmotionalState {
    // 简化的状态转换逻辑
    const positiveInteractions: InteractionType[] = [
      'correct_answer', 'magic_moment', 'badge_unlock', 'streak_milestone',
      'chapter_complete', 'level_up', 'perfect_session', 'daily_goal', 'weekly_goal'
    ];

    if (positiveInteractions.includes(interactionType)) {
      // 正向交互，提升情感状态
      switch (currentState) {
        case 'frustrated': return 'neutral';
        case 'confused': return 'engaged';
        case 'neutral': return 'confident';
        case 'engaged': return 'confident';
        case 'confident': return 'excited';
        case 'excited': return 'accomplished';
        case 'accomplished': return 'accomplished';
      }
    } else if (interactionType === 'incorrect_answer') {
      // 错误答案，轻微降低状态
      switch (currentState) {
        case 'accomplished': return 'confident';
        case 'excited': return 'engaged';
        case 'confident': return 'neutral';
        case 'engaged': return 'neutral';
        case 'neutral': return 'confused';
        case 'confused': return 'frustrated';
        case 'frustrated': return 'frustrated';
      }
    }

    return currentState;
  }

  private updateStateAnalysis(tracking: EmotionalStateTracking): void {
    const recentHistory = tracking.stateHistory.slice(-20); // 最近20次交互
    
    // 计算主导状态
    const stateCounts: { [key: string]: number } = {};
    recentHistory.forEach(entry => {
      stateCounts[entry.state] = (stateCounts[entry.state] || 0) + 1;
    });
    
    const dominantState = Object.entries(stateCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as EmotionalState || 'neutral';
    
    tracking.stateAnalysis.dominantState = dominantState;
    
    // 计算平均会话情绪
    const stateValues: { [key in EmotionalState]: number } = {
      frustrated: -1,
      confused: -0.5,
      neutral: 0,
      engaged: 0.3,
      confident: 0.6,
      excited: 0.8,
      accomplished: 1,
    };
    
    const averageMood = recentHistory.reduce((sum, entry) => 
      sum + stateValues[entry.state], 0) / recentHistory.length;
    
    tracking.stateAnalysis.averageSessionMood = averageMood || 0;
    
    // 更新信心水平
    const positiveStates = ['confident', 'excited', 'accomplished'];
    const positiveCount = recentHistory.filter(entry => 
      positiveStates.includes(entry.state)).length;
    
    tracking.stateAnalysis.confidenceLevel = positiveCount / recentHistory.length;
  }

  private recordInteraction(userId: string, response: MicroInteractionResponse): void {
    const userHistory = this.interactionHistory.get(userId) || [];
    userHistory.push(response);
    
    // 限制历史记录长度
    if (userHistory.length > 50) {
      userHistory.splice(0, userHistory.length - 50);
    }
    
    this.interactionHistory.set(userId, userHistory);
  }

  private analyzeEmotionalStates(): void {
    // 分析所有用户的情感状态，识别需要干预的情况
    for (const [userId, tracking] of this.emotionalStates) {
      const recentStates = tracking.stateHistory.slice(-5);
      const frustratedCount = recentStates.filter(s => s.state === 'frustrated').length;
      
      if (frustratedCount >= 3) {
        tracking.interventionTriggers.encouragementRequired = true;
      }
      
      const accomplishedCount = recentStates.filter(s => s.state === 'accomplished').length;
      if (accomplishedCount >= 2) {
        tracking.interventionTriggers.celebrationOpportunity = true;
      }
    }
  }

  private optimizeInteractionStrategies(): void {
    // 基于用户反馈优化交互策略
    // 这里可以实现机器学习算法来优化个性化响应
  }

  // ===== 数据持久化 =====

  private async saveUserConfigs(): Promise<void> {
    try {
      const configs = Array.from(this.userConfigs.values());
      await AsyncStorage.setItem(this.USER_CONFIGS_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error('Error saving user configs:', error);
    }
  }

  private async saveEmotionalStates(): Promise<void> {
    try {
      const states = Array.from(this.emotionalStates.values());
      await AsyncStorage.setItem(this.EMOTIONAL_STATES_KEY, JSON.stringify(states));
    } catch (error) {
      console.error('Error saving emotional states:', error);
    }
  }

  private async saveAmplificationStrategies(): Promise<void> {
    try {
      const strategies = Array.from(this.amplificationStrategies.values());
      await AsyncStorage.setItem(this.AMPLIFICATION_STRATEGIES_KEY, JSON.stringify(strategies));
    } catch (error) {
      console.error('Error saving amplification strategies:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取用户配置
   */
  getUserConfig(userId: string): MicroInteractionConfig | null {
    return this.userConfigs.get(userId) || null;
  }

  /**
   * 获取情感状态
   */
  getEmotionalState(userId: string): EmotionalStateTracking | null {
    return this.emotionalStates.get(userId) || null;
  }

  /**
   * 更新用户配置
   */
  async updateUserConfig(userId: string, updates: Partial<MicroInteractionConfig>): Promise<void> {
    try {
      const config = this.userConfigs.get(userId);
      if (!config) return;

      const updatedConfig = { ...config, ...updates };
      this.userConfigs.set(userId, updatedConfig);
      await this.saveUserConfigs();

    } catch (error) {
      console.error('Error updating user config:', error);
    }
  }

  /**
   * 获取交互统计
   */
  getInteractionStatistics(userId: string): {
    totalInteractions: number;
    positiveInteractions: number;
    currentEmotionalState: EmotionalState;
    confidenceLevel: number;
  } {
    const tracking = this.emotionalStates.get(userId);
    const history = this.interactionHistory.get(userId) || [];
    
    const positiveTypes: InteractionType[] = [
      'correct_answer', 'magic_moment', 'badge_unlock', 'streak_milestone',
      'chapter_complete', 'level_up', 'perfect_session', 'daily_goal', 'weekly_goal'
    ];
    
    const positiveCount = history.filter(interaction => 
      positiveTypes.includes(interaction.type)).length;

    return {
      totalInteractions: history.length,
      positiveInteractions: positiveCount,
      currentEmotionalState: tracking?.currentState || 'neutral',
      confidenceLevel: tracking?.stateAnalysis.confidenceLevel || 0.5,
    };
  }
}

export default MicroInteractionsService;
