/**
 * StoryDrivenLearningService - 30-second micro-drama video processing pipeline
 * Implements automatic subtitle generation, exactly 5 core vocabulary extraction,
 * and contextual embedding system for story-driven learning experience
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 30秒微剧情数据结构
export interface MicroDrama {
  dramaId: string;
  title: string;
  duration: number; // 必须正好30秒
  
  // 视频资源
  videoUrl: string;
  videoUrlNoSubs: string; // 无字幕版本用于Magic Moment
  thumbnailUrl: string;
  
  // 核心词汇 - 必须正好5个
  coreVocabulary: CoreVocabulary[];
  
  // 字幕和时间轴
  subtitles: SubtitleSegment[];
  
  // 主题和难度
  theme: 'travel' | 'movies' | 'workplace';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  
  // 处理状态
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  validationStatus: 'pending' | 'valid' | 'invalid';
  
  // 元数据
  createdAt: string;
  updatedAt: string;
}

// 核心词汇结构
export interface CoreVocabulary {
  keywordId: string;
  word: string;
  translation: string;
  pronunciation: string; // IPA音标
  
  // 在视频中的时间位置
  subtitleStart: number; // 秒
  subtitleEnd: number; // 秒
  
  // 上下文信息
  contextClues: string[];
  usageExample: string;
  
  // 视频片段 (2-4个用于vTPR练习)
  videoClips: VideoClip[];
  
  // 救援模式资源
  rescueVideoUrl?: string; // 口型特写视频
  phoneticTips: string[]; // 发音技巧
  
  // 高亮效果
  highlightEffect: 'bounce' | 'glow' | 'pulse';
}

// 视频片段
export interface VideoClip {
  clipId: string;
  videoUrl: string;
  startTime: number; // 秒
  endTime: number; // 秒
  isCorrect: boolean; // 是否为正确答案
  contextDescription: string;
}

// 字幕片段
export interface SubtitleSegment {
  segmentId: string;
  text: string;
  startTime: number; // 秒
  endTime: number; // 秒
  keywordId?: string; // 如果包含核心词汇
  highlightEffect?: 'bounce' | 'glow' | 'pulse';
}

// 视频处理配置
export interface VideoProcessingConfig {
  // 时长验证
  exactDuration: number; // 30秒
  durationTolerance: number; // 允许误差±0.5秒
  
  // 词汇提取
  exactVocabularyCount: number; // 必须5个
  vocabularyExtractionMethod: 'manual' | 'ai_assisted' | 'automatic';
  
  // 字幕生成
  subtitleGeneration: {
    enabled: boolean;
    language: 'en' | 'zh-CN';
    accuracy: 'high' | 'medium' | 'low';
    timestampPrecision: number; // 毫秒精度
  };
  
  // 质量标准
  qualityStandards: {
    minAudioQuality: number; // dB
    minVideoResolution: string; // '720p' | '1080p'
    maxFileSize: number; // MB
  };
}

// 处理结果
export interface ProcessingResult {
  success: boolean;
  dramaId: string;
  
  // 验证结果
  durationValid: boolean;
  vocabularyCountValid: boolean;
  subtitleQualityValid: boolean;
  
  // 提取的数据
  extractedVocabulary: CoreVocabulary[];
  generatedSubtitles: SubtitleSegment[];
  
  // 错误信息
  errors: string[];
  warnings: string[];
  
  // 处理时间
  processingTime: number; // 毫秒
  timestamp: string;
}

class StoryDrivenLearningService {
  private static instance: StoryDrivenLearningService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private microDramas: Map<string, MicroDrama> = new Map();
  private processingQueue: string[] = [];
  private processingConfig: VideoProcessingConfig;
  
  // 存储键
  private readonly DRAMAS_KEY = 'micro_dramas';
  private readonly CONFIG_KEY = 'video_processing_config';

  static getInstance(): StoryDrivenLearningService {
    if (!StoryDrivenLearningService.instance) {
      StoryDrivenLearningService.instance = new StoryDrivenLearningService();
    }
    return StoryDrivenLearningService.instance;
  }

  constructor() {
    this.processingConfig = this.getDefaultConfig();
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化服务
   */
  private async initializeService(): Promise<void> {
    try {
      await this.loadLocalData();
      this.analyticsService.track('story_driven_learning_service_initialized', {
        dramasCount: this.microDramas.size,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error initializing story-driven learning service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      const dramasData = await AsyncStorage.getItem(this.DRAMAS_KEY);
      if (dramasData) {
        const dramas: MicroDrama[] = JSON.parse(dramasData);
        dramas.forEach(drama => {
          this.microDramas.set(drama.dramaId, drama);
        });
      }

      const configData = await AsyncStorage.getItem(this.CONFIG_KEY);
      if (configData) {
        this.processingConfig = JSON.parse(configData);
      }
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): VideoProcessingConfig {
    return {
      exactDuration: 30, // 正好30秒
      durationTolerance: 0.5, // ±0.5秒误差
      exactVocabularyCount: 5, // 必须5个词汇
      vocabularyExtractionMethod: 'ai_assisted',
      subtitleGeneration: {
        enabled: true,
        language: 'en',
        accuracy: 'high',
        timestampPrecision: 100, // 100ms精度
      },
      qualityStandards: {
        minAudioQuality: -20, // -20dB
        minVideoResolution: '720p',
        maxFileSize: 50, // 50MB
      },
    };
  }

  // ===== 核心功能 =====

  /**
   * 处理30秒微剧情视频
   */
  async processMicroDrama(
    videoFile: File | string,
    metadata: {
      title: string;
      theme: 'travel' | 'movies' | 'workplace';
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const dramaId = `drama_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. 创建微剧情记录
      const microDrama: MicroDrama = {
        dramaId,
        title: metadata.title,
        duration: 0, // 将在处理中确定
        videoUrl: '',
        videoUrlNoSubs: '',
        thumbnailUrl: '',
        coreVocabulary: [],
        subtitles: [],
        theme: metadata.theme,
        difficulty: metadata.difficulty,
        processingStatus: 'processing',
        validationStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.microDramas.set(dramaId, microDrama);
      this.processingQueue.push(dramaId);

      // 2. 验证视频时长
      const duration = await this.validateVideoDuration(videoFile);
      const durationValid = this.isDurationValid(duration);

      // 3. 生成字幕
      const subtitles = await this.generateSubtitles(videoFile);
      const subtitleQualityValid = this.validateSubtitleQuality(subtitles);

      // 4. 提取核心词汇
      const vocabulary = await this.extractCoreVocabulary(subtitles, metadata.theme);
      const vocabularyCountValid = vocabulary.length === this.processingConfig.exactVocabularyCount;

      // 5. 生成视频片段
      if (vocabularyCountValid) {
        for (const vocab of vocabulary) {
          vocab.videoClips = await this.generateVideoClips(videoFile, vocab);
        }
      }

      // 6. 更新微剧情数据
      microDrama.duration = duration;
      microDrama.coreVocabulary = vocabulary;
      microDrama.subtitles = subtitles;
      microDrama.processingStatus = 'completed';
      microDrama.validationStatus = (durationValid && vocabularyCountValid && subtitleQualityValid) ? 'valid' : 'invalid';
      microDrama.updatedAt = new Date().toISOString();

      this.microDramas.set(dramaId, microDrama);
      await this.saveLocalData();

      // 7. 生成处理结果
      const result: ProcessingResult = {
        success: true,
        dramaId,
        durationValid,
        vocabularyCountValid,
        subtitleQualityValid,
        extractedVocabulary: vocabulary,
        generatedSubtitles: subtitles,
        errors: [],
        warnings: this.generateWarnings(durationValid, vocabularyCountValid, subtitleQualityValid),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };

      this.analyticsService.track('micro_drama_processed', {
        dramaId,
        success: true,
        durationValid,
        vocabularyCountValid,
        subtitleQualityValid,
        processingTime: result.processingTime,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {
      console.error('Error processing micro drama:', error);
      
      // 更新失败状态
      const microDrama = this.microDramas.get(dramaId);
      if (microDrama) {
        microDrama.processingStatus = 'failed';
        microDrama.updatedAt = new Date().toISOString();
        this.microDramas.set(dramaId, microDrama);
      }

      return {
        success: false,
        dramaId,
        durationValid: false,
        vocabularyCountValid: false,
        subtitleQualityValid: false,
        extractedVocabulary: [],
        generatedSubtitles: [],
        errors: [error instanceof Error ? error.message : 'Unknown processing error'],
        warnings: [],
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 验证视频时长
   */
  private async validateVideoDuration(videoFile: File | string): Promise<number> {
    // 模拟视频时长检测
    // 实际实现需要使用视频处理库如 FFmpeg
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟返回时长（实际应该从视频文件读取）
        const mockDuration = 29.8 + Math.random() * 0.4; // 29.8-30.2秒
        resolve(mockDuration);
      }, 1000);
    });
  }

  /**
   * 检查时长是否有效
   */
  private isDurationValid(duration: number): boolean {
    const target = this.processingConfig.exactDuration;
    const tolerance = this.processingConfig.durationTolerance;
    return Math.abs(duration - target) <= tolerance;
  }

  /**
   * 生成字幕
   */
  private async generateSubtitles(videoFile: File | string): Promise<SubtitleSegment[]> {
    // 模拟自动字幕生成
    // 实际实现需要集成语音识别API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockSubtitles: SubtitleSegment[] = [
          {
            segmentId: 'sub_1',
            text: 'Welcome to our travel adventure!',
            startTime: 0.5,
            endTime: 3.2,
            keywordId: 'keyword_1',
            highlightEffect: 'bounce',
          },
          {
            segmentId: 'sub_2',
            text: 'The hotel reservation is confirmed.',
            startTime: 4.1,
            endTime: 7.8,
            keywordId: 'keyword_2',
            highlightEffect: 'glow',
          },
          // ... 更多字幕片段
        ];
        resolve(mockSubtitles);
      }, 2000);
    });
  }

  /**
   * 验证字幕质量
   */
  private validateSubtitleQuality(subtitles: SubtitleSegment[]): boolean {
    // 检查字幕质量标准
    return subtitles.length > 0 && 
           subtitles.every(sub => sub.text.length > 0 && sub.endTime > sub.startTime);
  }

  /**
   * 提取核心词汇
   */
  private async extractCoreVocabulary(
    subtitles: SubtitleSegment[],
    theme: string
  ): Promise<CoreVocabulary[]> {
    // 模拟AI辅助词汇提取
    // 实际实现需要集成NLP API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockVocabulary: CoreVocabulary[] = [
          {
            keywordId: 'keyword_1',
            word: 'adventure',
            translation: '冒险',
            pronunciation: '/ədˈventʃər/',
            subtitleStart: 0.5,
            subtitleEnd: 3.2,
            contextClues: ['travel', 'exciting', 'journey'],
            usageExample: 'Welcome to our travel adventure!',
            videoClips: [],
            phoneticTips: ['重音在第二音节', 'ch发/tʃ/音'],
            highlightEffect: 'bounce',
          },
          // ... 必须正好4个更多词汇，总共5个
        ];
        resolve(mockVocabulary.slice(0, 5)); // 确保正好5个
      }, 1500);
    });
  }

  /**
   * 生成视频片段
   */
  private async generateVideoClips(
    videoFile: File | string,
    vocabulary: CoreVocabulary
  ): Promise<VideoClip[]> {
    // 模拟视频片段生成
    // 实际实现需要视频剪辑功能
    return new Promise((resolve) => {
      setTimeout(() => {
        const clips: VideoClip[] = [
          {
            clipId: `clip_${vocabulary.keywordId}_1`,
            videoUrl: `clip_url_1`,
            startTime: vocabulary.subtitleStart - 1,
            endTime: vocabulary.subtitleEnd + 1,
            isCorrect: true,
            contextDescription: `Correct usage of "${vocabulary.word}"`,
          },
          // ... 2-3个更多片段
        ];
        resolve(clips);
      }, 800);
    });
  }

  /**
   * 生成警告信息
   */
  private generateWarnings(
    durationValid: boolean,
    vocabularyCountValid: boolean,
    subtitleQualityValid: boolean
  ): string[] {
    const warnings: string[] = [];
    
    if (!durationValid) {
      warnings.push(`视频时长不符合30秒标准，允许误差±${this.processingConfig.durationTolerance}秒`);
    }
    
    if (!vocabularyCountValid) {
      warnings.push(`核心词汇数量不符合标准，必须正好${this.processingConfig.exactVocabularyCount}个`);
    }
    
    if (!subtitleQualityValid) {
      warnings.push('字幕质量不符合标准，可能影响学习效果');
    }
    
    return warnings;
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const dramas = Array.from(this.microDramas.values());
      await AsyncStorage.setItem(this.DRAMAS_KEY, JSON.stringify(dramas));
      await AsyncStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.processingConfig));
    } catch (error) {
      console.error('Error saving local data:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取微剧情
   */
  getMicroDrama(dramaId: string): MicroDrama | null {
    return this.microDramas.get(dramaId) || null;
  }

  /**
   * 获取所有微剧情
   */
  getAllMicroDramas(): MicroDrama[] {
    return Array.from(this.microDramas.values());
  }

  /**
   * 获取处理配置
   */
  getProcessingConfig(): VideoProcessingConfig {
    return { ...this.processingConfig };
  }

  /**
   * 更新处理配置
   */
  async updateProcessingConfig(config: Partial<VideoProcessingConfig>): Promise<void> {
    this.processingConfig = { ...this.processingConfig, ...config };
    await this.saveLocalData();
  }

  /**
   * 验证微剧情是否符合标准
   */
  validateMicroDrama(dramaId: string): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const drama = this.microDramas.get(dramaId);
    if (!drama) {
      return {
        isValid: false,
        errors: ['微剧情不存在'],
        warnings: [],
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // 检查时长
    if (!this.isDurationValid(drama.duration)) {
      errors.push(`视频时长${drama.duration}秒不符合30秒标准`);
    }

    // 检查词汇数量
    if (drama.coreVocabulary.length !== 5) {
      errors.push(`核心词汇数量${drama.coreVocabulary.length}个，必须正好5个`);
    }

    // 检查字幕质量
    if (!this.validateSubtitleQuality(drama.subtitles)) {
      errors.push('字幕质量不符合标准');
    }

    // 检查视频片段
    for (const vocab of drama.coreVocabulary) {
      if (vocab.videoClips.length < 2 || vocab.videoClips.length > 4) {
        warnings.push(`词汇"${vocab.word}"的视频片段数量${vocab.videoClips.length}个，建议2-4个`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default StoryDrivenLearningService;
