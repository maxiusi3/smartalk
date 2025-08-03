/**
 * ContentManagementService - V2 内容管理服务
 * 提供完整的学习内容管理系统：内容分发、版本控制、缓存优化
 * 支持多媒体内容、个性化推荐、离线同步
 *
 * 核心功能：
 * - 向导式剧情创建流程，强制验证正好5个核心词汇
 * - 30秒时长验证和资源完整性检查
 * - 自动化内容质量保证和改进建议
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';
import ContentQualityAssuranceService, { CoreContentValidation } from './ContentQualityAssuranceService';
import AssetValidationService, { ValidationResult } from './AssetValidationService';

// 向导式剧情创建流程
export interface DramaCreationWizard {
  wizardId: string;
  userId: string;

  // 向导步骤
  currentStep: number;
  totalSteps: number;
  steps: DramaWizardStep[];

  // 剧情数据
  dramaData: {
    title: string;
    theme: 'travel' | 'movies' | 'workplace';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // 必须30秒

    // 核心词汇 - 必须正好5个
    keywords: DramaKeyword[];

    // 资源文件
    videoFile?: File | string;
    audioFiles: string[];
    thumbnailFile?: File | string;

    // 字幕和时间轴
    subtitles: string;
    timeline: { start: number; end: number; text: string; keywordId?: string }[];
  };

  // 验证状态
  validation: {
    step1Complete: boolean; // 基本信息
    step2Complete: boolean; // 视频上传和时长验证
    step3Complete: boolean; // 5个核心词汇
    step4Complete: boolean; // 资源完整性
    step5Complete: boolean; // 最终审核

    errors: string[];
    warnings: string[];
  };

  // 向导状态
  isComplete: boolean;
  canProceed: boolean;

  // 时间戳
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// 向导步骤定义
export interface DramaWizardStep {
  stepNumber: number;
  stepName: string;
  title: string;
  description: string;

  // 验证要求
  validationRules: {
    required: string[];
    custom: { rule: string; message: string }[];
  };

  // 用户指导
  guidance: {
    instructions: string[];
    tips: string[];
    examples: string[];
  };

  // 步骤状态
  isComplete: boolean;
  canSkip: boolean;
  errors: string[];
}

// 剧情关键词
export interface DramaKeyword {
  keywordId: string;
  word: string;
  translation: string;
  pronunciation: string; // IPA音标

  // 在视频中的位置
  startTime: number; // 秒
  endTime: number; // 秒

  // 上下文信息
  contextClues: string[];
  usageExample: string;

  // 必需资源
  audioFile?: string; // 发音示例
  videoClips: string[]; // 2-4个视频片段
  rescueVideoFile?: string; // 口型特写视频

  // 验证状态
  hasAllAssets: boolean;
  qualityScore: number; // 0-100
}

// 资源验证结果
export interface AssetValidationResult {
  validationId: string;
  dramaId: string;

  // 整体验证结果
  allAssetsPresent: boolean;
  validationScore: number; // 0-100

  // 详细验证结果
  videoValidation: {
    present: boolean;
    duration: number;
    durationValid: boolean; // 必须30秒±0.5秒
    quality: 'high' | 'medium' | 'low';
    format: string;
    fileSize: number; // MB
  };

  audioValidation: {
    keywordId: string;
    audioFile: string;
    present: boolean;
    quality: 'high' | 'medium' | 'low';
    duration: number;
    format: string;
  }[];

  videoClipsValidation: {
    keywordId: string;
    clipFile: string;
    present: boolean;
    duration: number;
    quality: 'high' | 'medium' | 'low';
  }[];

  rescueVideosValidation: {
    keywordId: string;
    rescueFile: string;
    present: boolean;
    isSlowMotion: boolean;
    showsLipMovement: boolean;
  }[];

  thumbnailValidation: {
    present: boolean;
    dimensions: { width: number; height: number };
    format: string;
    fileSize: number; // KB
  };

  // 缺失资源
  missingAssets: string[];

  // 改进建议
  recommendations: string[];

  // 验证时间
  validatedAt: string;
}
import InternationalizationService, { SupportedLanguage } from './InternationalizationService';

// 内容类型
export type ContentType = 
  | 'keyword'
  | 'phrase'
  | 'sentence'
  | 'dialogue'
  | 'story'
  | 'exercise'
  | 'assessment'
  | 'media';

// 内容难度级别
export type DifficultyLevel = 
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'upper_intermediate'
  | 'advanced'
  | 'proficient';

// 内容主题
export type ContentTheme = 
  | 'daily_life'
  | 'business'
  | 'travel'
  | 'education'
  | 'technology'
  | 'health'
  | 'entertainment'
  | 'culture'
  | 'science'
  | 'sports';

// 内容项目
export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  
  // 内容数据
  content: {
    text: string;
    translation?: string;
    phonetic?: string;
    audioUrl?: string;
    videoUrl?: string;
    imageUrl?: string;
    subtitles?: Subtitle[];
  };
  
  // 元数据
  metadata: {
    difficulty: DifficultyLevel;
    theme: ContentTheme;
    tags: string[];
    duration: number; // 预计学习时长（秒）
    wordCount: number;
    language: SupportedLanguage;
    targetLanguage: SupportedLanguage;
  };
  
  // 版本信息
  version: {
    major: number;
    minor: number;
    patch: number;
    createdAt: string;
    updatedAt: string;
    author: string;
    changelog?: string;
  };
  
  // 学习数据
  learningData: {
    averageScore: number;
    completionRate: number;
    difficultyRating: number; // 用户反馈的实际难度
    popularityScore: number;
    lastUsed: string;
  };
  
  // 关联内容
  relationships: {
    prerequisites: string[]; // 前置内容ID
    followUps: string[]; // 后续内容ID
    related: string[]; // 相关内容ID
    alternatives: string[]; // 替代内容ID
  };
  
  // 状态标记
  status: 'draft' | 'review' | 'published' | 'archived';
  featured: boolean;
  premium: boolean;
}

// 字幕数据
interface Subtitle {
  start: number; // 开始时间（毫秒）
  end: number; // 结束时间（毫秒）
  text: string;
  translation?: string;
}

// 内容集合
export interface ContentCollection {
  id: string;
  name: string;
  description: string;
  theme: ContentTheme;
  difficulty: DifficultyLevel;
  contentIds: string[];
  order: number;
  estimatedDuration: number; // 总预计时长
  completionReward: number; // 完成奖励积分
  createdAt: string;
  updatedAt: string;
}

// 内容推荐
interface ContentRecommendation {
  contentId: string;
  score: number; // 推荐分数 0-1
  reason: 'difficulty_match' | 'theme_interest' | 'learning_path' | 'popular' | 'new';
  explanation: string;
}

// 内容统计
interface ContentStats {
  totalItems: number;
  byType: { [key in ContentType]: number };
  byDifficulty: { [key in DifficultyLevel]: number };
  byTheme: { [key in ContentTheme]: number };
  averageRating: number;
  totalDuration: number;
  lastUpdated: string;
}

// 内容搜索过滤器
interface ContentFilter {
  type?: ContentType[];
  difficulty?: DifficultyLevel[];
  theme?: ContentTheme[];
  tags?: string[];
  language?: SupportedLanguage;
  duration?: { min: number; max: number };
  rating?: { min: number; max: number };
  featured?: boolean;
  premium?: boolean;
}

// 内容搜索结果
interface ContentSearchResult {
  items: ContentItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  facets: {
    types: { [key: string]: number };
    difficulties: { [key: string]: number };
    themes: { [key: string]: number };
    tags: { [key: string]: number };
  };
}

class ContentManagementService {
  private static instance: ContentManagementService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  private qualityAssuranceService = ContentQualityAssuranceService.getInstance();
  private assetValidationService = AssetValidationService.getInstance();
  private i18nService = InternationalizationService.getInstance();
  
  // 内容缓存
  private contentCache: Map<string, ContentItem> = new Map();
  private collectionCache: Map<string, ContentCollection> = new Map();
  private recommendationCache: Map<string, ContentRecommendation[]> = new Map();

  // 向导式创建
  private activeWizards: Map<string, DramaCreationWizard> = new Map(); // userId -> wizard
  private wizardTemplates: DramaWizardStep[] = [];

  // 加载状态
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  // 存储键
  private static readonly CONTENT_CACHE_KEY = 'content_cache';
  private static readonly COLLECTION_CACHE_KEY = 'collection_cache';
  private static readonly CONTENT_VERSION_KEY = 'content_version';

  static getInstance(): ContentManagementService {
    if (!ContentManagementService.instance) {
      ContentManagementService.instance = new ContentManagementService();
    }
    return ContentManagementService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化内容管理服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载缓存的内容
      await this.loadCachedContent();
      
      // 检查内容更新
      await this.checkContentUpdates();
      
      this.analyticsService.track('content_service_initialized', {
        cachedItemsCount: this.contentCache.size,
        collectionsCount: this.collectionCache.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing content management service:', error);
    }
  }

  /**
   * 加载缓存的内容
   */
  private async loadCachedContent(): Promise<void> {
    try {
      const [contentData, collectionData] = await Promise.all([
        AsyncStorage.getItem(ContentManagementService.CONTENT_CACHE_KEY),
        AsyncStorage.getItem(ContentManagementService.COLLECTION_CACHE_KEY),
      ]);
      
      if (contentData) {
        const items = JSON.parse(contentData) as ContentItem[];
        items.forEach(item => this.contentCache.set(item.id, item));
      }
      
      if (collectionData) {
        const collections = JSON.parse(collectionData) as ContentCollection[];
        collections.forEach(collection => this.collectionCache.set(collection.id, collection));
      }
      
      // 如果缓存为空，加载默认内容
      if (this.contentCache.size === 0) {
        await this.loadDefaultContent();
      }
      
    } catch (error) {
      console.error('Error loading cached content:', error);
      await this.loadDefaultContent();
    }
  }

  /**
   * 加载默认内容
   */
  private async loadDefaultContent(): Promise<void> {
    const defaultContent: ContentItem[] = [
      {
        id: 'keyword_001',
        type: 'keyword',
        title: 'Hello',
        description: '基础问候语',
        content: {
          text: 'Hello',
          translation: '你好',
          phonetic: '/həˈloʊ/',
          audioUrl: 'audio/hello.mp3',
        },
        metadata: {
          difficulty: 'beginner',
          theme: 'daily_life',
          tags: ['greeting', 'basic'],
          duration: 30,
          wordCount: 1,
          language: 'en-US',
          targetLanguage: 'zh-CN',
        },
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'SmarTalk Team',
        },
        learningData: {
          averageScore: 85,
          completionRate: 92,
          difficultyRating: 1.2,
          popularityScore: 95,
          lastUsed: new Date().toISOString(),
        },
        relationships: {
          prerequisites: [],
          followUps: ['keyword_002', 'phrase_001'],
          related: ['keyword_003'],
          alternatives: [],
        },
        status: 'published',
        featured: true,
        premium: false,
      },
      {
        id: 'keyword_002',
        type: 'keyword',
        title: 'Goodbye',
        description: '基础告别语',
        content: {
          text: 'Goodbye',
          translation: '再见',
          phonetic: '/ɡʊdˈbaɪ/',
          audioUrl: 'audio/goodbye.mp3',
        },
        metadata: {
          difficulty: 'beginner',
          theme: 'daily_life',
          tags: ['farewell', 'basic'],
          duration: 30,
          wordCount: 1,
          language: 'en-US',
          targetLanguage: 'zh-CN',
        },
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'SmarTalk Team',
        },
        learningData: {
          averageScore: 82,
          completionRate: 88,
          difficultyRating: 1.3,
          popularityScore: 87,
          lastUsed: new Date().toISOString(),
        },
        relationships: {
          prerequisites: ['keyword_001'],
          followUps: ['phrase_002'],
          related: ['keyword_004'],
          alternatives: [],
        },
        status: 'published',
        featured: false,
        premium: false,
      },
      {
        id: 'phrase_001',
        type: 'phrase',
        title: 'How are you?',
        description: '询问近况的常用短语',
        content: {
          text: 'How are you?',
          translation: '你好吗？',
          phonetic: '/haʊ ɑr ju/',
          audioUrl: 'audio/how_are_you.mp3',
        },
        metadata: {
          difficulty: 'elementary',
          theme: 'daily_life',
          tags: ['greeting', 'question', 'conversation'],
          duration: 45,
          wordCount: 3,
          language: 'en-US',
          targetLanguage: 'zh-CN',
        },
        version: {
          major: 1,
          minor: 0,
          patch: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'SmarTalk Team',
        },
        learningData: {
          averageScore: 78,
          completionRate: 85,
          difficultyRating: 2.1,
          popularityScore: 91,
          lastUsed: new Date().toISOString(),
        },
        relationships: {
          prerequisites: ['keyword_001'],
          followUps: ['phrase_002', 'dialogue_001'],
          related: ['phrase_003'],
          alternatives: ['phrase_004'],
        },
        status: 'published',
        featured: true,
        premium: false,
      },
    ];
    
    // 保存默认内容到缓存
    defaultContent.forEach(item => this.contentCache.set(item.id, item));
    await this.saveCachedContent();
    
    // 创建默认集合
    const defaultCollection: ContentCollection = {
      id: 'collection_basics',
      name: '基础问候语',
      description: '学习最基本的英语问候和告别用语',
      theme: 'daily_life',
      difficulty: 'beginner',
      contentIds: ['keyword_001', 'keyword_002', 'phrase_001'],
      order: 1,
      estimatedDuration: 300, // 5分钟
      completionReward: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.collectionCache.set(defaultCollection.id, defaultCollection);
    await this.saveCachedCollections();
  }

  // ===== 向导式剧情创建 =====

  /**
   * 启动剧情创建向导
   */
  async startDramaCreationWizard(
    userId: string,
    initialData?: {
      title?: string;
      theme?: 'travel' | 'movies' | 'workplace';
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
    }
  ): Promise<DramaCreationWizard> {
    try {
      // 检查是否已有活动向导
      const existingWizard = this.activeWizards.get(userId);
      if (existingWizard && !existingWizard.isComplete) {
        return existingWizard;
      }

      const wizardId = `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 初始化向导步骤
      const steps = this.initializeWizardSteps();

      const wizard: DramaCreationWizard = {
        wizardId,
        userId,
        currentStep: 1,
        totalSteps: 5,
        steps,
        dramaData: {
          title: initialData?.title || '',
          theme: initialData?.theme || 'travel',
          difficulty: initialData?.difficulty || 'beginner',
          duration: 0,
          keywords: [],
          audioFiles: [],
          subtitles: '',
          timeline: [],
        },
        validation: {
          step1Complete: false,
          step2Complete: false,
          step3Complete: false,
          step4Complete: false,
          step5Complete: false,
          errors: [],
          warnings: [],
        },
        isComplete: false,
        canProceed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.activeWizards.set(userId, wizard);

      this.analyticsService.track('drama_creation_wizard_started', {
        wizardId,
        userId,
        theme: wizard.dramaData.theme,
        difficulty: wizard.dramaData.difficulty,
        timestamp: Date.now(),
      });

      return wizard;

    } catch (error) {
      console.error('Error starting drama creation wizard:', error);
      throw new Error('无法启动剧情创建向导');
    }
  }

  /**
   * 验证向导步骤数据
   */
  private async validateWizardStep(
    stepNumber: number,
    stepData: any,
    wizard: DramaCreationWizard
  ): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];

    switch (stepNumber) {
      case 1: // 基本信息
        if (!stepData.title || stepData.title.length < 5 || stepData.title.length > 50) {
          errors.push('标题长度必须在5-50个字符之间');
        }
        if (!stepData.theme || !['travel', 'movies', 'workplace'].includes(stepData.theme)) {
          errors.push('请选择有效的主题');
        }
        if (!stepData.difficulty || !['beginner', 'intermediate', 'advanced'].includes(stepData.difficulty)) {
          errors.push('请选择有效的难度等级');
        }
        break;

      case 2: // 视频上传
        if (!stepData.videoFile) {
          errors.push('请上传视频文件');
        } else {
          // 验证视频时长（模拟）
          const duration = stepData.duration || 0;
          if (Math.abs(duration - 30) > 0.5) {
            errors.push(`视频时长${duration}秒，必须正好30秒（允许误差±0.5秒）`);
          }

          // 验证文件大小
          if (stepData.fileSize && stepData.fileSize > 50 * 1024 * 1024) {
            errors.push('视频文件大小不能超过50MB');
          }
        }
        break;

      case 3: // 核心词汇
        if (!stepData.keywords || !Array.isArray(stepData.keywords)) {
          errors.push('请提供核心词汇列表');
        } else if (stepData.keywords.length !== 5) {
          errors.push(`当前有${stepData.keywords.length}个词汇，必须正好5个核心词汇`);
        } else {
          // 验证每个词汇的完整性
          stepData.keywords.forEach((keyword: any, index: number) => {
            if (!keyword.word) {
              errors.push(`第${index + 1}个词汇缺少单词`);
            }
            if (!keyword.translation) {
              errors.push(`词汇"${keyword.word}"缺少中文翻译`);
            }
            if (!keyword.pronunciation) {
              errors.push(`词汇"${keyword.word}"缺少音标`);
            }
            if (!keyword.startTime || !keyword.endTime) {
              errors.push(`词汇"${keyword.word}"缺少时间标注`);
            }
          });
        }
        break;

      case 4: // 资源上传
        if (!stepData.audioFiles || stepData.audioFiles.length !== 5) {
          errors.push('每个词汇必须有对应的发音音频文件');
        }

        wizard.dramaData.keywords.forEach((keyword, index) => {
          if (!keyword.videoClips || keyword.videoClips.length < 2 || keyword.videoClips.length > 4) {
            errors.push(`词汇"${keyword.word}"需要2-4个视频片段`);
          }
          if (!keyword.rescueVideoFile) {
            errors.push(`词汇"${keyword.word}"缺少救援视频`);
          }
        });
        break;

      case 5: // 最终审核
        // 检查所有前置步骤是否完成
        if (!wizard.validation.step1Complete) {
          errors.push('基本信息步骤未完成');
        }
        if (!wizard.validation.step2Complete) {
          errors.push('视频上传步骤未完成');
        }
        if (!wizard.validation.step3Complete) {
          errors.push('核心词汇步骤未完成');
        }
        if (!wizard.validation.step4Complete) {
          errors.push('资源上传步骤未完成');
        }
        break;
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  /**
   * 更新向导数据
   */
  private updateWizardData(wizard: DramaCreationWizard, stepNumber: number, stepData: any): void {
    switch (stepNumber) {
      case 1:
        wizard.dramaData.title = stepData.title;
        wizard.dramaData.theme = stepData.theme;
        wizard.dramaData.difficulty = stepData.difficulty;
        break;
      case 2:
        wizard.dramaData.videoFile = stepData.videoFile;
        wizard.dramaData.duration = stepData.duration;
        break;
      case 3:
        wizard.dramaData.keywords = stepData.keywords;
        break;
      case 4:
        wizard.dramaData.audioFiles = stepData.audioFiles;
        wizard.dramaData.keywords.forEach((keyword, index) => {
          if (stepData.videoClips && stepData.videoClips[index]) {
            keyword.videoClips = stepData.videoClips[index];
          }
          if (stepData.rescueVideos && stepData.rescueVideos[index]) {
            keyword.rescueVideoFile = stepData.rescueVideos[index];
          }
        });
        break;
    }
  }

  /**
   * 更新向导验证状态
   */
  private updateWizardValidation(wizard: DramaCreationWizard, stepNumber: number, isComplete: boolean): void {
    switch (stepNumber) {
      case 1:
        wizard.validation.step1Complete = isComplete;
        break;
      case 2:
        wizard.validation.step2Complete = isComplete;
        break;
      case 3:
        wizard.validation.step3Complete = isComplete;
        break;
      case 4:
        wizard.validation.step4Complete = isComplete;
        break;
      case 5:
        wizard.validation.step5Complete = isComplete;
        break;
    }
  }

  /**
   * 检查是否可以进入下一步
   */
  private canProceedToNextStep(wizard: DramaCreationWizard, currentStep: number): boolean {
    switch (currentStep) {
      case 1:
        return wizard.validation.step1Complete;
      case 2:
        return wizard.validation.step1Complete && wizard.validation.step2Complete;
      case 3:
        return wizard.validation.step1Complete && wizard.validation.step2Complete && wizard.validation.step3Complete;
      case 4:
        return wizard.validation.step1Complete && wizard.validation.step2Complete &&
               wizard.validation.step3Complete && wizard.validation.step4Complete;
      case 5:
        return wizard.validation.step1Complete && wizard.validation.step2Complete &&
               wizard.validation.step3Complete && wizard.validation.step4Complete && wizard.validation.step5Complete;
      default:
        return false;
    }
  }

  /**
   * 获取用户的活动向导
   */
  getUserActiveWizard(userId: string): DramaCreationWizard | null {
    return this.activeWizards.get(userId) || null;
  }

  /**
   * 完成向导并创建剧情内容
   */
  async completeWizardAndCreateDrama(userId: string): Promise<{ success: boolean; dramaId?: string; errors: string[] }> {
    try {
      const wizard = this.activeWizards.get(userId);
      if (!wizard || !wizard.isComplete) {
        return { success: false, errors: ['向导未完成或不存在'] };
      }

      // 执行最终资源验证
      const assetValidation = await this.validateDramaAssets(wizard);
      if (!assetValidation.allAssetsPresent) {
        return { success: false, errors: assetValidation.missingAssets };
      }

      // 创建剧情内容
      const dramaId = `drama_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 这里应该调用实际的内容创建逻辑
      // 例如：await this.createContentItem(dramaData);

      // 清理向导
      this.activeWizards.delete(userId);

      this.analyticsService.track('drama_creation_completed', {
        wizardId: wizard.wizardId,
        dramaId,
        userId,
        theme: wizard.dramaData.theme,
        difficulty: wizard.dramaData.difficulty,
        keywordsCount: wizard.dramaData.keywords.length,
        duration: wizard.dramaData.duration,
        timestamp: Date.now(),
      });

      return { success: true, dramaId, errors: [] };

    } catch (error) {
      console.error('Error completing wizard:', error);
      return { success: false, errors: [error instanceof Error ? error.message : '创建剧情失败'] };
    }
  }

  /**
   * 初始化向导步骤模板
   */
  private initializeWizardSteps(): DramaWizardStep[] {
    return [
      {
        stepNumber: 1,
        stepName: 'basic_info',
        title: '基本信息',
        description: '设置剧情的基本信息：标题、主题、难度',
        validationRules: {
          required: ['title', 'theme', 'difficulty'],
          custom: [
            { rule: 'title_length', message: '标题长度必须在5-50个字符之间' },
          ],
        },
        guidance: {
          instructions: [
            '选择一个吸引人的标题',
            '选择合适的主题分类',
            '根据目标用户选择难度等级',
          ],
          tips: [
            '好的标题能激发学习兴趣',
            '主题要与词汇内容匹配',
            '难度影响词汇选择和语速',
          ],
          examples: [
            '标题示例：机场办理登机手续',
            '旅行主题适合日常对话词汇',
            '初级难度使用常用词汇',
          ],
        },
        isComplete: false,
        canSkip: false,
        errors: [],
      },
      {
        stepNumber: 2,
        stepName: 'video_upload',
        title: '视频上传',
        description: '上传30秒微剧情视频并验证时长',
        validationRules: {
          required: ['videoFile'],
          custom: [
            { rule: 'duration_30_seconds', message: '视频时长必须正好30秒（允许误差±0.5秒）' },
            { rule: 'video_quality', message: '视频质量必须达到720p以上' },
            { rule: 'file_size', message: '文件大小不能超过50MB' },
          ],
        },
        guidance: {
          instructions: [
            '上传MP4格式的视频文件',
            '确保视频时长正好30秒',
            '检查视频质量和音频清晰度',
          ],
          tips: [
            '使用稳定的拍摄设备',
            '确保光线充足',
            '音频要清晰无杂音',
          ],
          examples: [
            '推荐分辨率：1280x720或更高',
            '推荐码率：2-5 Mbps',
            '音频采样率：44.1kHz',
          ],
        },
        isComplete: false,
        canSkip: false,
        errors: [],
      },
      {
        stepNumber: 3,
        stepName: 'keywords_extraction',
        title: '核心词汇',
        description: '提取并验证正好5个核心词汇',
        validationRules: {
          required: ['keywords'],
          custom: [
            { rule: 'exactly_5_keywords', message: '必须正好包含5个核心词汇，不能多也不能少' },
            { rule: 'keywords_quality', message: '每个词汇必须包含翻译、发音和上下文线索' },
            { rule: 'keywords_timing', message: '每个词汇必须标注在视频中的准确时间位置' },
          ],
        },
        guidance: {
          instructions: [
            '从视频中提取5个最重要的词汇',
            '为每个词汇添加中文翻译',
            '标注IPA音标和发音技巧',
            '设置词汇在视频中的时间位置',
          ],
          tips: [
            '选择学习价值高的词汇',
            '确保词汇在视频中清晰出现',
            '提供准确的发音指导',
          ],
          examples: [
            '词汇示例：reservation /ˌrezərˈveɪʃən/ 预订',
            '时间标注：2.5秒-4.8秒',
            '上下文：酒店预订场景',
          ],
        },
        isComplete: false,
        canSkip: false,
        errors: [],
      },
      {
        stepNumber: 4,
        stepName: 'assets_upload',
        title: '资源上传',
        description: '上传所有必需的音频和视频资源',
        validationRules: {
          required: ['audioFiles', 'videoClips', 'rescueVideos'],
          custom: [
            { rule: 'audio_per_keyword', message: '每个词汇必须有对应的发音音频文件' },
            { rule: 'video_clips_count', message: '每个词汇需要2-4个视频片段用于练习' },
            { rule: 'rescue_videos', message: '每个词汇需要口型特写的救援视频' },
          ],
        },
        guidance: {
          instructions: [
            '为每个词汇录制清晰的发音音频',
            '剪辑2-4个包含该词汇的视频片段',
            '录制口型特写的慢动作救援视频',
            '上传剧情缩略图',
          ],
          tips: [
            '音频要清晰无背景噪音',
            '视频片段要突出词汇使用场景',
            '救援视频要慢速展示口型',
          ],
          examples: [
            '音频格式：MP3, 44.1kHz',
            '视频片段：3-5秒，包含完整语境',
            '救援视频：0.5倍速，特写口部',
          ],
        },
        isComplete: false,
        canSkip: false,
        errors: [],
      },
      {
        stepNumber: 5,
        stepName: 'final_review',
        title: '最终审核',
        description: '检查所有内容并提交发布',
        validationRules: {
          required: ['all_previous_steps'],
          custom: [
            { rule: 'content_quality', message: '内容质量必须达到发布标准' },
            { rule: 'assets_integrity', message: '所有资源文件必须完整且可访问' },
          ],
        },
        guidance: {
          instructions: [
            '预览完整的学习体验',
            '检查所有资源文件',
            '确认内容质量',
            '提交发布审核',
          ],
          tips: [
            '仔细检查每个细节',
            '测试所有交互功能',
            '确保学习体验流畅',
          ],
          examples: [
            '预览：完整播放30秒视频',
            '测试：词汇高亮和发音',
            '验证：所有资源正常加载',
          ],
        },
        isComplete: false,
        canSkip: false,
        errors: [],
      },
    ];
  }

  /**
   * 验证剧情资源完整性
   */
  async validateDramaAssets(wizard: DramaCreationWizard): Promise<ValidationResult> {
    try {
      // 准备验证数据
      const dramaData = {
        title: wizard.dramaData.title,
        keywords: wizard.dramaData.keywords.map(k => ({
          keywordId: k.keywordId,
          word: k.word,
        })),
        mainVideoPath: wizard.dramaData.videoFile as string,
        thumbnailPath: wizard.dramaData.thumbnailFile as string,
        audioFiles: wizard.dramaData.keywords.reduce((acc, k) => {
          acc[k.keywordId] = k.audioFile || '';
          return acc;
        }, {} as { [key: string]: string }),
        videoClips: wizard.dramaData.keywords.reduce((acc, k) => {
          acc[k.keywordId] = k.videoClips;
          return acc;
        }, {} as { [key: string]: string[] }),
        rescueVideos: wizard.dramaData.keywords.reduce((acc, k) => {
          acc[k.keywordId] = k.rescueVideoFile || '';
          return acc;
        }, {} as { [key: string]: string }),
      };

      // 使用AssetValidationService进行验证
      const assetValidation = await this.assetValidationService.validateDramaAssets(
        wizard.wizardId,
        dramaData
      );

      // 同时使用ContentQualityAssuranceService进行5个词汇验证
      const contentValidation = await this.qualityAssuranceService.validateCoreContent(
        wizard.wizardId,
        {
          title: wizard.dramaData.title,
          duration: wizard.dramaData.duration,
          keywords: wizard.dramaData.keywords.map(k => ({
            keywordId: k.keywordId,
            word: k.word,
            translation: k.translation,
            pronunciation: k.pronunciation,
            contextClues: k.contextClues,
            videoClips: k.videoClips,
            rescueVideoUrl: k.rescueVideoFile,
          })),
          audioFiles: wizard.dramaData.audioFiles,
          videoClips: wizard.dramaData.keywords.flatMap(k => k.videoClips),
          rescueVideos: wizard.dramaData.keywords.map(k => k.rescueVideoFile || ''),
          thumbnails: wizard.dramaData.thumbnailFile ? [wizard.dramaData.thumbnailFile as string] : [],
        }
      );

      // 合并验证结果
      const combinedResult: ValidationResult = {
        ...assetValidation,
        success: assetValidation.success && contentValidation.overallValid,
        overallScore: Math.round((assetValidation.overallScore + contentValidation.validationScore) / 2),
        recommendations: [
          ...assetValidation.recommendations,
          ...contentValidation.criticalErrors.map(error => `关键错误：${error}`),
          ...contentValidation.warnings.map(warning => `警告：${warning}`),
        ],
      };

      return combinedResult;

    } catch (error) {
      console.error('Error validating drama assets:', error);

      // 返回失败的验证结果
      return {
        validationId: `failed_${Date.now()}`,
        dramaId: wizard.wizardId,
        success: false,
        overallScore: 0,
        assetResults: [],
        missingAssets: [],
        recommendations: [error instanceof Error ? error.message : '验证过程发生错误'],
        statistics: {
          totalAssets: 0,
          validAssets: 0,
          invalidAssets: 0,
          missingAssets: 0,
          validationTime: 0,
        },
        validatedAt: new Date().toISOString(),
      };
    }
  }

  // ===== 内容获取 =====

  /**
   * 获取内容项目
   */
  async getContentItem(id: string): Promise<ContentItem | null> {
    try {
      // 从缓存获取
      let item = this.contentCache.get(id);
      
      if (!item) {
        // 从服务器获取
        item = await this.fetchContentFromServer(id);
        if (item) {
          this.contentCache.set(id, item);
          await this.saveCachedContent();
        }
      }
      
      if (item) {
        // 更新使用时间
        item.learningData.lastUsed = new Date().toISOString();
        
        this.analyticsService.track('content_item_accessed', {
          contentId: id,
          type: item.type,
          difficulty: item.metadata.difficulty,
          theme: item.metadata.theme,
          timestamp: Date.now(),
        });
      }
      
      return item;
      
    } catch (error) {
      console.error('Error getting content item:', error);
      return null;
    }
  }

  /**
   * 搜索内容
   */
  async searchContent(
    query: string,
    filter: ContentFilter = {},
    page: number = 1,
    pageSize: number = 20
  ): Promise<ContentSearchResult> {
    try {
      const allItems = Array.from(this.contentCache.values());
      
      // 文本搜索
      let filteredItems = allItems.filter(item => {
        if (query) {
          const searchText = `${item.title} ${item.description} ${item.content.text} ${item.metadata.tags.join(' ')}`.toLowerCase();
          if (!searchText.includes(query.toLowerCase())) {
            return false;
          }
        }
        return true;
      });
      
      // 应用过滤器
      filteredItems = this.applyContentFilter(filteredItems, filter);
      
      // 排序
      filteredItems.sort((a, b) => {
        // 按相关性和热度排序
        const scoreA = a.learningData.popularityScore * 0.6 + a.learningData.averageScore * 0.4;
        const scoreB = b.learningData.popularityScore * 0.6 + b.learningData.averageScore * 0.4;
        return scoreB - scoreA;
      });
      
      // 分页
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);
      
      // 生成统计信息
      const facets = this.generateSearchFacets(filteredItems);
      
      this.analyticsService.track('content_searched', {
        query,
        filter,
        resultCount: filteredItems.length,
        page,
        pageSize,
        timestamp: Date.now(),
      });
      
      return {
        items: paginatedItems,
        total: filteredItems.length,
        page,
        pageSize,
        hasMore: endIndex < filteredItems.length,
        facets,
      };
      
    } catch (error) {
      console.error('Error searching content:', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false,
        facets: { types: {}, difficulties: {}, themes: {}, tags: {} },
      };
    }
  }

  /**
   * 获取推荐内容
   */
  async getRecommendedContent(userId: string, limit: number = 10): Promise<ContentRecommendation[]> {
    try {
      // 检查缓存
      const cached = this.recommendationCache.get(userId);
      if (cached && cached.length > 0) {
        return cached.slice(0, limit);
      }
      
      // 生成推荐
      const recommendations = await this.generateRecommendations(userId);
      
      // 缓存推荐结果
      this.recommendationCache.set(userId, recommendations);
      
      this.analyticsService.track('content_recommendations_generated', {
        userId,
        recommendationCount: recommendations.length,
        limit,
        timestamp: Date.now(),
      });
      
      return recommendations.slice(0, limit);
      
    } catch (error) {
      console.error('Error getting recommended content:', error);
      return [];
    }
  }

  /**
   * 获取内容集合
   */
  async getContentCollection(id: string): Promise<ContentCollection | null> {
    try {
      const collection = this.collectionCache.get(id);
      
      if (collection) {
        this.analyticsService.track('content_collection_accessed', {
          collectionId: id,
          contentCount: collection.contentIds.length,
          theme: collection.theme,
          difficulty: collection.difficulty,
          timestamp: Date.now(),
        });
      }
      
      return collection || null;
      
    } catch (error) {
      console.error('Error getting content collection:', error);
      return null;
    }
  }

  /**
   * 获取所有集合
   */
  async getAllCollections(): Promise<ContentCollection[]> {
    try {
      const collections = Array.from(this.collectionCache.values());
      
      // 按顺序排序
      collections.sort((a, b) => a.order - b.order);
      
      return collections;
      
    } catch (error) {
      console.error('Error getting all collections:', error);
      return [];
    }
  }

  // ===== 内容统计 =====

  /**
   * 获取内容统计
   */
  async getContentStats(): Promise<ContentStats> {
    try {
      const allItems = Array.from(this.contentCache.values());
      
      const stats: ContentStats = {
        totalItems: allItems.length,
        byType: {} as { [key in ContentType]: number },
        byDifficulty: {} as { [key in DifficultyLevel]: number },
        byTheme: {} as { [key in ContentTheme]: number },
        averageRating: 0,
        totalDuration: 0,
        lastUpdated: new Date().toISOString(),
      };
      
      // 统计各类型数量
      allItems.forEach(item => {
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
        stats.byDifficulty[item.metadata.difficulty] = (stats.byDifficulty[item.metadata.difficulty] || 0) + 1;
        stats.byTheme[item.metadata.theme] = (stats.byTheme[item.metadata.theme] || 0) + 1;
        stats.totalDuration += item.metadata.duration;
      });
      
      // 计算平均评分
      const totalScore = allItems.reduce((sum, item) => sum + item.learningData.averageScore, 0);
      stats.averageRating = allItems.length > 0 ? totalScore / allItems.length : 0;
      
      return stats;
      
    } catch (error) {
      console.error('Error getting content stats:', error);
      return {
        totalItems: 0,
        byType: {} as { [key in ContentType]: number },
        byDifficulty: {} as { [key in DifficultyLevel]: number },
        byTheme: {} as { [key in ContentTheme]: number },
        averageRating: 0,
        totalDuration: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // ===== 私有方法 =====

  private async fetchContentFromServer(id: string): Promise<ContentItem | null> {
    // 模拟从服务器获取内容
    await new Promise(resolve => setTimeout(resolve, 500));
    return null; // 实际实现中会从API获取
  }

  private async checkContentUpdates(): Promise<void> {
    // 检查内容更新的逻辑
    // 实际实现中会检查服务器版本并更新本地内容
  }

  private applyContentFilter(items: ContentItem[], filter: ContentFilter): ContentItem[] {
    return items.filter(item => {
      if (filter.type && !filter.type.includes(item.type)) return false;
      if (filter.difficulty && !filter.difficulty.includes(item.metadata.difficulty)) return false;
      if (filter.theme && !filter.theme.includes(item.metadata.theme)) return false;
      if (filter.language && item.metadata.language !== filter.language) return false;
      if (filter.featured !== undefined && item.featured !== filter.featured) return false;
      if (filter.premium !== undefined && item.premium !== filter.premium) return false;
      
      if (filter.duration) {
        if (item.metadata.duration < filter.duration.min || item.metadata.duration > filter.duration.max) {
          return false;
        }
      }
      
      if (filter.rating) {
        if (item.learningData.averageScore < filter.rating.min || item.learningData.averageScore > filter.rating.max) {
          return false;
        }
      }
      
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => item.metadata.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }

  private generateSearchFacets(items: ContentItem[]) {
    const facets = {
      types: {} as { [key: string]: number },
      difficulties: {} as { [key: string]: number },
      themes: {} as { [key: string]: number },
      tags: {} as { [key: string]: number },
    };
    
    items.forEach(item => {
      facets.types[item.type] = (facets.types[item.type] || 0) + 1;
      facets.difficulties[item.metadata.difficulty] = (facets.difficulties[item.metadata.difficulty] || 0) + 1;
      facets.themes[item.metadata.theme] = (facets.themes[item.metadata.theme] || 0) + 1;
      
      item.metadata.tags.forEach(tag => {
        facets.tags[tag] = (facets.tags[tag] || 0) + 1;
      });
    });
    
    return facets;
  }

  private async generateRecommendations(userId: string): Promise<ContentRecommendation[]> {
    // 简化的推荐算法
    const allItems = Array.from(this.contentCache.values());
    const recommendations: ContentRecommendation[] = [];
    
    // 基于热度推荐
    const popularItems = allItems
      .filter(item => item.status === 'published')
      .sort((a, b) => b.learningData.popularityScore - a.learningData.popularityScore)
      .slice(0, 5);
    
    popularItems.forEach(item => {
      recommendations.push({
        contentId: item.id,
        score: item.learningData.popularityScore / 100,
        reason: 'popular',
        explanation: '热门内容推荐',
      });
    });
    
    // 基于难度匹配推荐
    const beginnerItems = allItems
      .filter(item => item.metadata.difficulty === 'beginner' && item.status === 'published')
      .slice(0, 3);
    
    beginnerItems.forEach(item => {
      recommendations.push({
        contentId: item.id,
        score: 0.8,
        reason: 'difficulty_match',
        explanation: '适合您当前水平的内容',
      });
    });
    
    return recommendations;
  }

  private async saveCachedContent(): Promise<void> {
    try {
      const items = Array.from(this.contentCache.values());
      await AsyncStorage.setItem(ContentManagementService.CONTENT_CACHE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cached content:', error);
    }
  }

  private async saveCachedCollections(): Promise<void> {
    try {
      const collections = Array.from(this.collectionCache.values());
      await AsyncStorage.setItem(ContentManagementService.COLLECTION_CACHE_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Error saving cached collections:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 清理缓存
   */
  async clearCache(): Promise<void> {
    this.contentCache.clear();
    this.collectionCache.clear();
    this.recommendationCache.clear();
    
    await Promise.all([
      AsyncStorage.removeItem(ContentManagementService.CONTENT_CACHE_KEY),
      AsyncStorage.removeItem(ContentManagementService.COLLECTION_CACHE_KEY),
    ]);
  }

  /**
   * 预加载内容
   */
  async preloadContent(contentIds: string[]): Promise<void> {
    const promises = contentIds.map(id => this.getContentItem(id));
    await Promise.all(promises);
  }

  /**
   * 获取内容类型列表
   */
  getContentTypes(): { type: ContentType; name: string; description: string }[] {
    return [
      { type: 'keyword', name: '单词', description: '单个英语单词' },
      { type: 'phrase', name: '短语', description: '常用英语短语' },
      { type: 'sentence', name: '句子', description: '完整的英语句子' },
      { type: 'dialogue', name: '对话', description: '日常对话场景' },
      { type: 'story', name: '故事', description: '英语小故事' },
      { type: 'exercise', name: '练习', description: '学习练习题' },
      { type: 'assessment', name: '评估', description: '水平评估测试' },
      { type: 'media', name: '媒体', description: '音视频内容' },
    ];
  }

  /**
   * 获取难度级别列表
   */
  getDifficultyLevels(): { level: DifficultyLevel; name: string; description: string }[] {
    return [
      { level: 'beginner', name: '初学者', description: 'A1-A2水平' },
      { level: 'elementary', name: '基础', description: 'A2-B1水平' },
      { level: 'intermediate', name: '中级', description: 'B1-B2水平' },
      { level: 'upper_intermediate', name: '中高级', description: 'B2-C1水平' },
      { level: 'advanced', name: '高级', description: 'C1-C2水平' },
      { level: 'proficient', name: '精通', description: 'C2+水平' },
    ];
  }

  /**
   * 获取主题列表
   */
  getContentThemes(): { theme: ContentTheme; name: string; description: string }[] {
    return [
      { theme: 'daily_life', name: '日常生活', description: '日常交流和生活场景' },
      { theme: 'business', name: '商务', description: '商务交流和职场英语' },
      { theme: 'travel', name: '旅行', description: '旅行和出行相关' },
      { theme: 'education', name: '教育', description: '学习和教育话题' },
      { theme: 'technology', name: '科技', description: '科技和互联网相关' },
      { theme: 'health', name: '健康', description: '健康和医疗话题' },
      { theme: 'entertainment', name: '娱乐', description: '娱乐和休闲活动' },
      { theme: 'culture', name: '文化', description: '文化和传统话题' },
      { theme: 'science', name: '科学', description: '科学和研究相关' },
      { theme: 'sports', name: '体育', description: '体育和运动话题' },
    ];
  }
}

export default ContentManagementService;
