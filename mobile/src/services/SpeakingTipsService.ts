/**
 * SpeakingTipsService - V2 口语提示和实用建议服务
 * 提供上下文相关的口语建议：实用短语、紧急表达、沟通技巧、发音提示
 * 支持智能推荐、进度适配、动画展示、用户交互跟踪
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 提示类型
export type TipType = 
  | 'emergency_phrases'    // 紧急短语
  | 'conversation_starters' // 对话开场
  | 'polite_expressions'   // 礼貌表达
  | 'clarification'        // 澄清说明
  | 'pronunciation'        // 发音技巧
  | 'grammar_quick'        // 语法速记
  | 'cultural_context'     // 文化背景
  | 'confidence_building'; // 信心建设

// 提示优先级
export type TipPriority = 'high' | 'medium' | 'low';

// 提示触发条件
export type TipTrigger = 
  | 'story_start'          // 故事开始
  | 'speaking_exercise'    // 口语练习
  | 'pronunciation_error'  // 发音错误
  | 'vocabulary_new'       // 新词汇
  | 'grammar_difficulty'   // 语法难点
  | 'user_struggle'        // 用户困难
  | 'achievement_unlock'   // 成就解锁
  | 'manual_request';      // 手动请求

// 口语提示
export interface SpeakingTip {
  tipId: string;
  
  // 基本信息
  type: TipType;
  priority: TipPriority;
  title: string;
  description: string;
  
  // 内容
  content: {
    mainPhrase: string;
    translation: string;
    pronunciation: string;
    example: string;
    context: string;
  };
  
  // 实用短语
  practicalPhrases: {
    phrase: string;
    translation: string;
    usage: string;
    formality: 'formal' | 'informal' | 'neutral';
  }[];
  
  // 视觉设计
  visual: {
    icon: string;
    color: string;
    animation: string;
    lightbulbStyle: 'classic' | 'modern' | 'animated';
  };
  
  // 触发条件
  triggers: TipTrigger[];
  contextualRelevance: {
    userLevel: string[];
    storyThemes: string[];
    learningGoals: string[];
  };
  
  // 交互设置
  interaction: {
    displayDuration: number; // seconds
    canDismiss: boolean;
    canBookmark: boolean;
    hasAudio: boolean;
    hasAnimation: boolean;
  };
  
  // 使用统计
  usage: {
    totalViews: number;
    totalBookmarks: number;
    averageViewTime: number;
    helpfulnessRating: number; // 0-5
    lastShown: string;
  };
  
  // 状态
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 提示卡片配置
export interface TipCardConfig {
  cardId: string;
  
  // 布局设置
  layout: {
    position: 'top' | 'center' | 'bottom' | 'floating';
    size: 'small' | 'medium' | 'large';
    style: 'popup' | 'slide' | 'fade' | 'bounce';
  };
  
  // 动画设置
  animation: {
    entrance: string;
    exit: string;
    duration: number;
    easing: string;
  };
  
  // 交互设置
  interaction: {
    tapToDismiss: boolean;
    swipeToBookmark: boolean;
    longPressForMore: boolean;
    autoHide: boolean;
    autoHideDelay: number;
  };
  
  // 主题设置
  theme: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    borderRadius: number;
    shadow: boolean;
  };
}

// 用户提示偏好
export interface UserTipPreferences {
  userId: string;
  
  // 显示偏好
  displayPreferences: {
    enableTips: boolean;
    preferredTypes: TipType[];
    maxTipsPerSession: number;
    showOnlyRelevant: boolean;
  };
  
  // 交互偏好
  interactionPreferences: {
    preferredPosition: 'top' | 'center' | 'bottom';
    preferredSize: 'small' | 'medium' | 'large';
    enableAnimations: boolean;
    enableAudio: boolean;
  };
  
  // 学习偏好
  learningPreferences: {
    focusAreas: TipType[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    culturalContext: string;
    nativeLanguage: string;
  };
  
  // 书签和历史
  bookmarkedTips: string[];
  viewHistory: {
    tipId: string;
    viewedAt: string;
    viewDuration: number;
    helpful: boolean;
  }[];
  
  // 反馈数据
  feedback: {
    tipId: string;
    rating: number; // 1-5
    comment?: string;
    reportedAt: string;
  }[];
}

// 提示推荐引擎
export interface TipRecommendationEngine {
  // 推荐算法
  algorithm: 'contextual' | 'collaborative' | 'content_based' | 'hybrid';
  
  // 推荐因子
  factors: {
    userLevel: number;        // 0-1
    contextRelevance: number; // 0-1
    personalPreference: number; // 0-1
    communityRating: number;  // 0-1
    recency: number;          // 0-1
  };
  
  // 推荐结果
  recommendations: {
    tipId: string;
    score: number;
    reason: string;
    confidence: number;
  }[];
}

class SpeakingTipsService {
  private static instance: SpeakingTipsService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private speakingTips: Map<string, SpeakingTip> = new Map();
  private tipCardConfigs: Map<string, TipCardConfig> = new Map();
  private userPreferences: Map<string, UserTipPreferences> = new Map();
  
  // 存储键
  private readonly TIPS_KEY = 'speaking_tips';
  private readonly CONFIGS_KEY = 'tip_card_configs';
  private readonly PREFERENCES_KEY = 'user_tip_preferences';

  static getInstance(): SpeakingTipsService {
    if (!SpeakingTipsService.instance) {
      SpeakingTipsService.instance = new SpeakingTipsService();
    }
    return SpeakingTipsService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化口语提示服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认提示
      this.initializeDefaultTips();
      
      // 初始化卡片配置
      this.initializeCardConfigs();
      
      this.analyticsService.track('speaking_tips_service_initialized', {
        tipsCount: this.speakingTips.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing speaking tips service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载口语提示
      const tipsData = await AsyncStorage.getItem(this.TIPS_KEY);
      if (tipsData) {
        const tips: SpeakingTip[] = JSON.parse(tipsData);
        tips.forEach(tip => {
          this.speakingTips.set(tip.tipId, tip);
        });
      }

      // 加载卡片配置
      const configsData = await AsyncStorage.getItem(this.CONFIGS_KEY);
      if (configsData) {
        const configs: TipCardConfig[] = JSON.parse(configsData);
        configs.forEach(config => {
          this.tipCardConfigs.set(config.cardId, config);
        });
      }

      // 加载用户偏好
      const preferencesData = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      if (preferencesData) {
        const preferences: UserTipPreferences[] = JSON.parse(preferencesData);
        preferences.forEach(pref => {
          this.userPreferences.set(pref.userId, pref);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认提示
   */
  private initializeDefaultTips(): void {
    const defaultTips: SpeakingTip[] = [
      {
        tipId: 'emergency_sorry_i_mean',
        type: 'emergency_phrases',
        priority: 'high',
        title: '紧急救场短语',
        description: '当你说错话时的完美救场表达',
        content: {
          mainPhrase: "Sorry, I mean...",
          translation: "不好意思，我的意思是...",
          pronunciation: "/ˈsɔːri aɪ miːn/",
          example: "I like cats... sorry, I mean dogs!",
          context: "当你说错话需要立即纠正时使用",
        },
        practicalPhrases: [
          {
            phrase: "Sorry, I mean...",
            translation: "不好意思，我的意思是...",
            usage: "纠正刚说的话",
            formality: 'neutral',
          },
          {
            phrase: "What I meant to say is...",
            translation: "我想说的是...",
            usage: "更正式的纠正方式",
            formality: 'formal',
          },
          {
            phrase: "Let me rephrase that...",
            translation: "让我重新表达一下...",
            usage: "重新组织语言",
            formality: 'formal',
          },
        ],
        visual: {
          icon: '💡',
          color: '#fbbf24',
          animation: 'pulse',
          lightbulbStyle: 'animated',
        },
        triggers: ['speaking_exercise', 'pronunciation_error', 'user_struggle'],
        contextualRelevance: {
          userLevel: ['beginner', 'intermediate'],
          storyThemes: ['daily_conversation', 'workplace', 'social'],
          learningGoals: ['speaking_confidence', 'conversation_skills'],
        },
        interaction: {
          displayDuration: 10,
          canDismiss: true,
          canBookmark: true,
          hasAudio: true,
          hasAnimation: true,
        },
        usage: {
          totalViews: 0,
          totalBookmarks: 0,
          averageViewTime: 0,
          helpfulnessRating: 0,
          lastShown: new Date().toISOString(),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        tipId: 'how_do_you_say',
        type: 'emergency_phrases',
        priority: 'high',
        title: '询问表达方式',
        description: '当你不知道某个词的英文表达时',
        content: {
          mainPhrase: "How do you say... in English?",
          translation: "用英语怎么说...？",
          pronunciation: "/haʊ duː juː seɪ ɪn ˈɪŋɡlɪʃ/",
          example: "How do you say '筷子' in English?",
          context: "当你不知道某个词的英文表达时使用",
        },
        practicalPhrases: [
          {
            phrase: "How do you say... in English?",
            translation: "用英语怎么说...？",
            usage: "询问英文表达",
            formality: 'neutral',
          },
          {
            phrase: "What's the English word for...?",
            translation: "...的英文单词是什么？",
            usage: "询问特定词汇",
            formality: 'neutral',
          },
          {
            phrase: "I don't know how to say this in English...",
            translation: "我不知道这个用英语怎么说...",
            usage: "表达困难",
            formality: 'informal',
          },
        ],
        visual: {
          icon: '🤔',
          color: '#3b82f6',
          animation: 'bounce',
          lightbulbStyle: 'classic',
        },
        triggers: ['vocabulary_new', 'user_struggle', 'manual_request'],
        contextualRelevance: {
          userLevel: ['beginner', 'intermediate'],
          storyThemes: ['daily_conversation', 'travel', 'learning'],
          learningGoals: ['vocabulary_building', 'conversation_skills'],
        },
        interaction: {
          displayDuration: 12,
          canDismiss: true,
          canBookmark: true,
          hasAudio: true,
          hasAnimation: true,
        },
        usage: {
          totalViews: 0,
          totalBookmarks: 0,
          averageViewTime: 0,
          helpfulnessRating: 0,
          lastShown: new Date().toISOString(),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        tipId: 'communication_over_perfection',
        type: 'confidence_building',
        priority: 'medium',
        title: '沟通胜过完美',
        description: '记住：沟通比完美更重要！',
        content: {
          mainPhrase: "Communication is more important than perfection",
          translation: "沟通比完美更重要",
          pronunciation: "/kəˌmjuːnɪˈkeɪʃən ɪz mɔːr ɪmˈpɔːrtənt ðæn pərˈfekʃən/",
          example: "Don't worry about mistakes - just keep talking!",
          context: "鼓励用户勇敢开口，不要害怕犯错",
        },
        practicalPhrases: [
          {
            phrase: "I'm still learning, please be patient",
            translation: "我还在学习，请耐心一点",
            usage: "请求理解",
            formality: 'polite',
          },
          {
            phrase: "Could you speak a bit slower?",
            translation: "你能说慢一点吗？",
            usage: "请求放慢语速",
            formality: 'polite',
          },
          {
            phrase: "I'm trying my best to communicate",
            translation: "我在尽力沟通",
            usage: "表达努力",
            formality: 'neutral',
          },
        ],
        visual: {
          icon: '💪',
          color: '#10b981',
          animation: 'glow',
          lightbulbStyle: 'modern',
        },
        triggers: ['user_struggle', 'pronunciation_error', 'achievement_unlock'],
        contextualRelevance: {
          userLevel: ['beginner'],
          storyThemes: ['confidence_building', 'motivation'],
          learningGoals: ['speaking_confidence', 'fear_reduction'],
        },
        interaction: {
          displayDuration: 15,
          canDismiss: true,
          canBookmark: true,
          hasAudio: false,
          hasAnimation: true,
        },
        usage: {
          totalViews: 0,
          totalBookmarks: 0,
          averageViewTime: 0,
          helpfulnessRating: 0,
          lastShown: new Date().toISOString(),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        tipId: 'conversation_starters',
        type: 'conversation_starters',
        priority: 'medium',
        title: '对话开场白',
        description: '自然开始对话的实用短语',
        content: {
          mainPhrase: "How's your day going?",
          translation: "你今天过得怎么样？",
          pronunciation: "/haʊz jʊr deɪ ˈɡoʊɪŋ/",
          example: "Hi there! How's your day going?",
          context: "友好地开始日常对话",
        },
        practicalPhrases: [
          {
            phrase: "How's your day going?",
            translation: "你今天过得怎么样？",
            usage: "日常问候",
            formality: 'informal',
          },
          {
            phrase: "Nice weather today, isn't it?",
            translation: "今天天气不错，不是吗？",
            usage: "天气话题",
            formality: 'neutral',
          },
          {
            phrase: "Have you been here before?",
            translation: "你以前来过这里吗？",
            usage: "场所相关",
            formality: 'neutral',
          },
        ],
        visual: {
          icon: '👋',
          color: '#8b5cf6',
          animation: 'wave',
          lightbulbStyle: 'classic',
        },
        triggers: ['story_start', 'conversation_starters', 'manual_request'],
        contextualRelevance: {
          userLevel: ['intermediate', 'advanced'],
          storyThemes: ['social', 'daily_conversation', 'networking'],
          learningGoals: ['conversation_skills', 'social_interaction'],
        },
        interaction: {
          displayDuration: 8,
          canDismiss: true,
          canBookmark: true,
          hasAudio: true,
          hasAnimation: true,
        },
        usage: {
          totalViews: 0,
          totalBookmarks: 0,
          averageViewTime: 0,
          helpfulnessRating: 0,
          lastShown: new Date().toISOString(),
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    defaultTips.forEach(tip => {
      if (!this.speakingTips.has(tip.tipId)) {
        this.speakingTips.set(tip.tipId, tip);
      }
    });
  }

  /**
   * 初始化卡片配置
   */
  private initializeCardConfigs(): void {
    const defaultConfigs: TipCardConfig[] = [
      {
        cardId: 'default_popup',
        layout: {
          position: 'center',
          size: 'medium',
          style: 'popup',
        },
        animation: {
          entrance: 'fadeInUp',
          exit: 'fadeOutDown',
          duration: 300,
          easing: 'ease-out',
        },
        interaction: {
          tapToDismiss: true,
          swipeToBookmark: true,
          longPressForMore: true,
          autoHide: true,
          autoHideDelay: 10000,
        },
        theme: {
          backgroundColor: '#ffffff',
          textColor: '#1e293b',
          accentColor: '#3b82f6',
          borderRadius: 12,
          shadow: true,
        },
      },
      {
        cardId: 'floating_lightbulb',
        layout: {
          position: 'floating',
          size: 'small',
          style: 'bounce',
        },
        animation: {
          entrance: 'bounceIn',
          exit: 'bounceOut',
          duration: 500,
          easing: 'ease-in-out',
        },
        interaction: {
          tapToDismiss: false,
          swipeToBookmark: false,
          longPressForMore: false,
          autoHide: false,
          autoHideDelay: 0,
        },
        theme: {
          backgroundColor: '#fbbf24',
          textColor: '#ffffff',
          accentColor: '#f59e0b',
          borderRadius: 50,
          shadow: true,
        },
      },
    ];

    defaultConfigs.forEach(config => {
      if (!this.tipCardConfigs.has(config.cardId)) {
        this.tipCardConfigs.set(config.cardId, config);
      }
    });
  }

  // ===== 核心功能 =====

  /**
   * 获取上下文相关的提示
   */
  getContextualTips(
    userId: string,
    context: {
      trigger: TipTrigger;
      userLevel?: string;
      storyTheme?: string;
      learningGoal?: string;
      maxTips?: number;
    }
  ): SpeakingTip[] {
    try {
      const userPrefs = this.getUserPreferences(userId);
      const maxTips = context.maxTips || userPrefs.displayPreferences.maxTipsPerSession;

      // 筛选相关提示
      let relevantTips = Array.from(this.speakingTips.values())
        .filter(tip => {
          // 检查是否启用
          if (!tip.isActive) return false;
          
          // 检查触发条件
          if (!tip.triggers.includes(context.trigger)) return false;
          
          // 检查用户偏好
          if (!userPrefs.displayPreferences.preferredTypes.includes(tip.type)) return false;
          
          // 检查上下文相关性
          if (userPrefs.displayPreferences.showOnlyRelevant) {
            if (context.userLevel && !tip.contextualRelevance.userLevel.includes(context.userLevel)) {
              return false;
            }
            if (context.storyTheme && !tip.contextualRelevance.storyThemes.includes(context.storyTheme)) {
              return false;
            }
            if (context.learningGoal && !tip.contextualRelevance.learningGoals.includes(context.learningGoal)) {
              return false;
            }
          }
          
          return true;
        });

      // 按优先级和相关性排序
      relevantTips.sort((a, b) => {
        const priorityScore = this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority);
        const relevanceScore = b.usage.helpfulnessRating - a.usage.helpfulnessRating;
        return priorityScore + relevanceScore;
      });

      // 限制数量
      return relevantTips.slice(0, maxTips);

    } catch (error) {
      console.error('Error getting contextual tips:', error);
      return [];
    }
  }

  /**
   * 显示提示卡片
   */
  async showTipCard(
    tipId: string,
    userId: string,
    cardConfigId: string = 'default_popup'
  ): Promise<boolean> {
    try {
      const tip = this.speakingTips.get(tipId);
      const cardConfig = this.tipCardConfigs.get(cardConfigId);
      
      if (!tip || !cardConfig) {
        return false;
      }

      // 更新使用统计
      tip.usage.totalViews++;
      tip.usage.lastShown = new Date().toISOString();
      this.speakingTips.set(tipId, tip);

      // 记录用户查看历史
      const userPrefs = this.getUserPreferences(userId);
      userPrefs.viewHistory.push({
        tipId,
        viewedAt: new Date().toISOString(),
        viewDuration: 0, // 将在关闭时更新
        helpful: false,
      });
      this.userPreferences.set(userId, userPrefs);

      await this.saveLocalData();

      this.analyticsService.track('speaking_tip_shown', {
        tipId,
        userId,
        tipType: tip.type,
        trigger: 'contextual',
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error showing tip card:', error);
      return false;
    }
  }

  /**
   * 书签提示
   */
  async bookmarkTip(tipId: string, userId: string): Promise<boolean> {
    try {
      const tip = this.speakingTips.get(tipId);
      if (!tip) return false;

      const userPrefs = this.getUserPreferences(userId);
      
      if (!userPrefs.bookmarkedTips.includes(tipId)) {
        userPrefs.bookmarkedTips.push(tipId);
        tip.usage.totalBookmarks++;
        
        this.speakingTips.set(tipId, tip);
        this.userPreferences.set(userId, userPrefs);
        
        await this.saveLocalData();

        this.analyticsService.track('speaking_tip_bookmarked', {
          tipId,
          userId,
          tipType: tip.type,
          timestamp: Date.now(),
        });

        return true;
      }

      return false;

    } catch (error) {
      console.error('Error bookmarking tip:', error);
      return false;
    }
  }

  /**
   * 评价提示
   */
  async rateTip(
    tipId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<boolean> {
    try {
      const tip = this.speakingTips.get(tipId);
      if (!tip) return false;

      const userPrefs = this.getUserPreferences(userId);
      
      // 添加反馈
      userPrefs.feedback.push({
        tipId,
        rating,
        comment,
        reportedAt: new Date().toISOString(),
      });

      // 更新提示的平均评分
      const allRatings = userPrefs.feedback
        .filter(f => f.tipId === tipId)
        .map(f => f.rating);
      
      tip.usage.helpfulnessRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;

      this.speakingTips.set(tipId, tip);
      this.userPreferences.set(userId, userPrefs);
      
      await this.saveLocalData();

      this.analyticsService.track('speaking_tip_rated', {
        tipId,
        userId,
        rating,
        hasComment: !!comment,
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error rating tip:', error);
      return false;
    }
  }

  // ===== 辅助方法 =====

  private getPriorityScore(priority: TipPriority): number {
    const scores = { high: 3, medium: 2, low: 1 };
    return scores[priority];
  }

  private getUserPreferences(userId: string): UserTipPreferences {
    let prefs = this.userPreferences.get(userId);
    
    if (!prefs) {
      prefs = this.createDefaultPreferences(userId);
      this.userPreferences.set(userId, prefs);
    }
    
    return prefs;
  }

  private createDefaultPreferences(userId: string): UserTipPreferences {
    return {
      userId,
      displayPreferences: {
        enableTips: true,
        preferredTypes: ['emergency_phrases', 'conversation_starters', 'confidence_building'],
        maxTipsPerSession: 3,
        showOnlyRelevant: true,
      },
      interactionPreferences: {
        preferredPosition: 'center',
        preferredSize: 'medium',
        enableAnimations: true,
        enableAudio: true,
      },
      learningPreferences: {
        focusAreas: ['emergency_phrases', 'conversation_starters'],
        difficultyLevel: 'beginner',
        culturalContext: 'general',
        nativeLanguage: 'zh-CN',
      },
      bookmarkedTips: [],
      viewHistory: [],
      feedback: [],
    };
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const tips = Array.from(this.speakingTips.values());
      await AsyncStorage.setItem(this.TIPS_KEY, JSON.stringify(tips));

      const configs = Array.from(this.tipCardConfigs.values());
      await AsyncStorage.setItem(this.CONFIGS_KEY, JSON.stringify(configs));

      const preferences = Array.from(this.userPreferences.values());
      await AsyncStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));

    } catch (error) {
      console.error('Error saving local data:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取用户书签的提示
   */
  getUserBookmarkedTips(userId: string): SpeakingTip[] {
    const userPrefs = this.getUserPreferences(userId);
    return userPrefs.bookmarkedTips
      .map(tipId => this.speakingTips.get(tipId))
      .filter(Boolean) as SpeakingTip[];
  }

  /**
   * 获取提示统计
   */
  getTipStatistics(): {
    totalTips: number;
    tipsByType: { [type: string]: number };
    averageRating: number;
    totalViews: number;
  } {
    const tips = Array.from(this.speakingTips.values());
    const totalTips = tips.length;
    
    const tipsByType: { [type: string]: number } = {};
    tips.forEach(tip => {
      tipsByType[tip.type] = (tipsByType[tip.type] || 0) + 1;
    });
    
    const totalViews = tips.reduce((sum, tip) => sum + tip.usage.totalViews, 0);
    const totalRatings = tips.reduce((sum, tip) => sum + tip.usage.helpfulnessRating, 0);
    const averageRating = totalTips > 0 ? totalRatings / totalTips : 0;

    return {
      totalTips,
      tipsByType,
      averageRating,
      totalViews,
    };
  }

  /**
   * 获取特定提示
   */
  getTip(tipId: string): SpeakingTip | null {
    return this.speakingTips.get(tipId) || null;
  }

  /**
   * 更新用户偏好
   */
  async updateUserPreferences(
    userId: string,
    updates: Partial<UserTipPreferences>
  ): Promise<boolean> {
    try {
      const currentPrefs = this.getUserPreferences(userId);
      const updatedPrefs = { ...currentPrefs, ...updates };
      
      this.userPreferences.set(userId, updatedPrefs);
      await this.saveLocalData();

      return true;

    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
}

export default SpeakingTipsService;
