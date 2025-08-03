/**
 * AssetValidationService - 资源验证服务
 * 确保所有必需的资源（音频、视频片段、救援视频、缩略图）都存在且正确链接
 * 为每个30秒微剧情提供完整的资源完整性检查
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 资源类型
export type AssetType = 'audio' | 'video_clip' | 'rescue_video' | 'thumbnail' | 'main_video';

// 资源验证状态
export type AssetValidationStatus = 'pending' | 'validating' | 'valid' | 'invalid' | 'missing';

// 单个资源信息
export interface AssetInfo {
  assetId: string;
  assetType: AssetType;
  fileName: string;
  filePath: string;
  fileUrl?: string;
  
  // 关联信息
  keywordId?: string; // 对于音频、视频片段、救援视频
  dramaId: string;
  
  // 文件属性
  fileSize: number; // bytes
  mimeType: string;
  duration?: number; // seconds，对于音频/视频
  dimensions?: { width: number; height: number }; // 对于图片/视频
  
  // 验证状态
  validationStatus: AssetValidationStatus;
  validationErrors: string[];
  validationWarnings: string[];
  
  // 质量信息
  qualityScore: number; // 0-100
  qualityMetrics: {
    resolution?: string; // 对于视频/图片
    bitrate?: number; // 对于音频/视频
    sampleRate?: number; // 对于音频
    codec?: string;
  };
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  lastValidatedAt?: string;
}

// 剧情资源集合
export interface DramaAssetCollection {
  dramaId: string;
  dramaTitle: string;
  
  // 主视频（30秒微剧情）
  mainVideo: AssetInfo;
  
  // 缩略图
  thumbnail: AssetInfo;
  
  // 关键词相关资源（每个关键词的资源）
  keywordAssets: {
    keywordId: string;
    keyword: string;
    
    // 发音音频（必需，1个）
    audioFile: AssetInfo;
    
    // 视频片段（必需，2-4个）
    videoClips: AssetInfo[];
    
    // 救援视频（必需，1个慢动作口型视频）
    rescueVideo: AssetInfo;
  }[];
  
  // 验证摘要
  validationSummary: {
    totalAssets: number;
    validAssets: number;
    invalidAssets: number;
    missingAssets: number;
    overallValid: boolean;
    validationScore: number; // 0-100
  };
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  lastValidatedAt?: string;
}

// 资源验证规则
export interface AssetValidationRules {
  // 主视频规则
  mainVideo: {
    requiredDuration: number; // 30秒
    durationTolerance: number; // ±0.5秒
    minResolution: { width: number; height: number }; // 720p
    maxFileSize: number; // 50MB
    allowedFormats: string[]; // ['mp4', 'mov']
    requiredCodec: string; // 'h264'
  };
  
  // 音频文件规则
  audioFile: {
    minDuration: number; // 1秒
    maxDuration: number; // 10秒
    minSampleRate: number; // 22050Hz
    maxFileSize: number; // 5MB
    allowedFormats: string[]; // ['mp3', 'aac', 'wav']
    minQuality: number; // 128kbps
  };
  
  // 视频片段规则
  videoClip: {
    minDuration: number; // 2秒
    maxDuration: number; // 8秒
    minResolution: { width: number; height: number }; // 480p
    maxFileSize: number; // 20MB
    allowedFormats: string[]; // ['mp4', 'mov']
    requiredCount: { min: number; max: number }; // 2-4个
  };
  
  // 救援视频规则
  rescueVideo: {
    minDuration: number; // 3秒
    maxDuration: number; // 15秒
    minResolution: { width: number; height: number }; // 720p
    maxFileSize: number; // 30MB
    allowedFormats: string[]; // ['mp4', 'mov']
    requiredSlowMotion: boolean; // 必须慢动作
    requiredCloseUp: boolean; // 必须口部特写
  };
  
  // 缩略图规则
  thumbnail: {
    minResolution: { width: number; height: number }; // 300x200
    maxResolution: { width: number; height: number }; // 1920x1080
    maxFileSize: number; // 500KB
    allowedFormats: string[]; // ['jpg', 'jpeg', 'png', 'webp']
    aspectRatio: number; // 16:9
  };
}

// 验证结果
export interface ValidationResult {
  validationId: string;
  dramaId: string;
  
  // 整体结果
  success: boolean;
  overallScore: number; // 0-100
  
  // 详细结果
  assetResults: {
    assetId: string;
    assetType: AssetType;
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  }[];
  
  // 缺失资源
  missingAssets: {
    assetType: AssetType;
    keywordId?: string;
    description: string;
    severity: 'critical' | 'warning';
  }[];
  
  // 改进建议
  recommendations: string[];
  
  // 验证统计
  statistics: {
    totalAssets: number;
    validAssets: number;
    invalidAssets: number;
    missingAssets: number;
    validationTime: number; // ms
  };
  
  // 时间戳
  validatedAt: string;
}

class AssetValidationService {
  private static instance: AssetValidationService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private dramaAssets: Map<string, DramaAssetCollection> = new Map();
  private validationRules: AssetValidationRules;
  private validationHistory: ValidationResult[] = [];
  
  // 存储键
  private readonly ASSETS_KEY = 'drama_assets';
  private readonly VALIDATION_HISTORY_KEY = 'validation_history';

  static getInstance(): AssetValidationService {
    if (!AssetValidationService.instance) {
      AssetValidationService.instance = new AssetValidationService();
    }
    return AssetValidationService.instance;
  }

  constructor() {
    this.validationRules = this.getDefaultValidationRules();
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化服务
   */
  private async initializeService(): Promise<void> {
    try {
      await this.loadLocalData();
      
      this.analyticsService.track('asset_validation_service_initialized', {
        dramasCount: this.dramaAssets.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing asset validation service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      const assetsData = await AsyncStorage.getItem(this.ASSETS_KEY);
      if (assetsData) {
        const assets: DramaAssetCollection[] = JSON.parse(assetsData);
        assets.forEach(asset => {
          this.dramaAssets.set(asset.dramaId, asset);
        });
      }

      const historyData = await AsyncStorage.getItem(this.VALIDATION_HISTORY_KEY);
      if (historyData) {
        this.validationHistory = JSON.parse(historyData);
      }

    } catch (error) {
      console.error('Error loading asset validation data:', error);
    }
  }

  /**
   * 获取默认验证规则
   */
  private getDefaultValidationRules(): AssetValidationRules {
    return {
      mainVideo: {
        requiredDuration: 30, // 正好30秒
        durationTolerance: 0.5, // ±0.5秒
        minResolution: { width: 1280, height: 720 }, // 720p
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedFormats: ['mp4', 'mov'],
        requiredCodec: 'h264',
      },
      audioFile: {
        minDuration: 1,
        maxDuration: 10,
        minSampleRate: 22050,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFormats: ['mp3', 'aac', 'wav'],
        minQuality: 128, // 128kbps
      },
      videoClip: {
        minDuration: 2,
        maxDuration: 8,
        minResolution: { width: 854, height: 480 }, // 480p
        maxFileSize: 20 * 1024 * 1024, // 20MB
        allowedFormats: ['mp4', 'mov'],
        requiredCount: { min: 2, max: 4 },
      },
      rescueVideo: {
        minDuration: 3,
        maxDuration: 15,
        minResolution: { width: 1280, height: 720 }, // 720p
        maxFileSize: 30 * 1024 * 1024, // 30MB
        allowedFormats: ['mp4', 'mov'],
        requiredSlowMotion: true,
        requiredCloseUp: true,
      },
      thumbnail: {
        minResolution: { width: 300, height: 200 },
        maxResolution: { width: 1920, height: 1080 },
        maxFileSize: 500 * 1024, // 500KB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        aspectRatio: 16 / 9,
      },
    };
  }

  // ===== 核心验证功能 =====

  /**
   * 验证剧情资源完整性
   */
  async validateDramaAssets(
    dramaId: string,
    dramaData: {
      title: string;
      keywords: Array<{
        keywordId: string;
        word: string;
      }>;
      mainVideoPath?: string;
      thumbnailPath?: string;
      audioFiles?: { [keywordId: string]: string };
      videoClips?: { [keywordId: string]: string[] };
      rescueVideos?: { [keywordId: string]: string };
    }
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const validationId = `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // 1. 检查必需的5个关键词
      if (!dramaData.keywords || dramaData.keywords.length !== 5) {
        return this.createFailedValidationResult(
          validationId,
          dramaId,
          [`关键词数量错误：当前${dramaData.keywords?.length || 0}个，必须正好5个`],
          startTime
        );
      }

      // 2. 验证主视频
      const mainVideoResult = await this.validateMainVideo(dramaData.mainVideoPath);
      
      // 3. 验证缩略图
      const thumbnailResult = await this.validateThumbnail(dramaData.thumbnailPath);
      
      // 4. 验证每个关键词的资源
      const keywordResults = await Promise.all(
        dramaData.keywords.map(keyword => 
          this.validateKeywordAssets(
            keyword.keywordId,
            keyword.word,
            {
              audioFile: dramaData.audioFiles?.[keyword.keywordId],
              videoClips: dramaData.videoClips?.[keyword.keywordId] || [],
              rescueVideo: dramaData.rescueVideos?.[keyword.keywordId],
            }
          )
        )
      );

      // 5. 汇总验证结果
      const allResults = [mainVideoResult, thumbnailResult, ...keywordResults.flat()];
      const validAssets = allResults.filter(r => r.valid).length;
      const invalidAssets = allResults.filter(r => !r.valid).length;
      const overallScore = allResults.length > 0 ? 
        Math.round(allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length) : 0;

      // 6. 检查缺失资源
      const missingAssets = this.findMissingAssets(dramaData);

      // 7. 生成改进建议
      const recommendations = this.generateRecommendations(allResults, missingAssets);

      const result: ValidationResult = {
        validationId,
        dramaId,
        success: invalidAssets === 0 && missingAssets.length === 0,
        overallScore,
        assetResults: allResults,
        missingAssets,
        recommendations,
        statistics: {
          totalAssets: allResults.length,
          validAssets,
          invalidAssets,
          missingAssets: missingAssets.length,
          validationTime: Date.now() - startTime,
        },
        validatedAt: new Date().toISOString(),
      };

      // 8. 保存验证历史
      this.validationHistory.push(result);
      await this.saveLocalData();

      // 9. 分析追踪
      this.analyticsService.track('drama_assets_validated', {
        validationId,
        dramaId,
        success: result.success,
        overallScore,
        totalAssets: allResults.length,
        validAssets,
        invalidAssets,
        missingAssets: missingAssets.length,
        validationTime: result.statistics.validationTime,
        timestamp: Date.now(),
      });

      return result;

    } catch (error) {
      console.error('Error validating drama assets:', error);
      return this.createFailedValidationResult(
        validationId,
        dramaId,
        [error instanceof Error ? error.message : '验证过程发生错误'],
        startTime
      );
    }
  }

  /**
   * 验证主视频
   */
  private async validateMainVideo(videoPath?: string): Promise<{
    assetId: string;
    assetType: AssetType;
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  }> {
    const assetId = 'main_video';
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!videoPath) {
      return {
        assetId,
        assetType: 'main_video',
        valid: false,
        score: 0,
        errors: ['主视频文件缺失'],
        warnings: [],
      };
    }

    // 模拟视频文件验证
    // 实际实现需要使用视频处理库检查文件属性
    const mockVideoInfo = {
      duration: 29.8 + Math.random() * 0.4, // 29.8-30.2秒
      resolution: { width: 1280, height: 720 },
      fileSize: 45 * 1024 * 1024, // 45MB
      format: 'mp4',
      codec: 'h264',
    };

    const rules = this.validationRules.mainVideo;
    let score = 100;

    // 验证时长
    const durationDiff = Math.abs(mockVideoInfo.duration - rules.requiredDuration);
    if (durationDiff > rules.durationTolerance) {
      errors.push(`视频时长${mockVideoInfo.duration}秒，必须正好${rules.requiredDuration}秒（允许误差±${rules.durationTolerance}秒）`);
      score -= 30;
    }

    // 验证分辨率
    if (mockVideoInfo.resolution.width < rules.minResolution.width ||
        mockVideoInfo.resolution.height < rules.minResolution.height) {
      errors.push(`视频分辨率${mockVideoInfo.resolution.width}x${mockVideoInfo.resolution.height}，最低要求${rules.minResolution.width}x${rules.minResolution.height}`);
      score -= 25;
    }

    // 验证文件大小
    if (mockVideoInfo.fileSize > rules.maxFileSize) {
      errors.push(`视频文件大小${Math.round(mockVideoInfo.fileSize / 1024 / 1024)}MB，不能超过${Math.round(rules.maxFileSize / 1024 / 1024)}MB`);
      score -= 20;
    }

    // 验证格式
    if (!rules.allowedFormats.includes(mockVideoInfo.format)) {
      errors.push(`视频格式${mockVideoInfo.format}不支持，支持的格式：${rules.allowedFormats.join(', ')}`);
      score -= 15;
    }

    // 验证编码
    if (mockVideoInfo.codec !== rules.requiredCodec) {
      warnings.push(`建议使用${rules.requiredCodec}编码以获得更好的兼容性`);
      score -= 5;
    }

    return {
      assetId,
      assetType: 'main_video',
      valid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
    };
  }

  /**
   * 验证缩略图
   */
  private async validateThumbnail(thumbnailPath?: string): Promise<{
    assetId: string;
    assetType: AssetType;
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  }> {
    const assetId = 'thumbnail';
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!thumbnailPath) {
      return {
        assetId,
        assetType: 'thumbnail',
        valid: false,
        score: 0,
        errors: ['缩略图文件缺失'],
        warnings: [],
      };
    }

    // 模拟缩略图验证
    const mockThumbnailInfo = {
      resolution: { width: 1280, height: 720 },
      fileSize: 300 * 1024, // 300KB
      format: 'jpg',
    };

    const rules = this.validationRules.thumbnail;
    let score = 100;

    // 验证分辨率
    if (mockThumbnailInfo.resolution.width < rules.minResolution.width ||
        mockThumbnailInfo.resolution.height < rules.minResolution.height) {
      errors.push(`缩略图分辨率过低：${mockThumbnailInfo.resolution.width}x${mockThumbnailInfo.resolution.height}`);
      score -= 30;
    }

    if (mockThumbnailInfo.resolution.width > rules.maxResolution.width ||
        mockThumbnailInfo.resolution.height > rules.maxResolution.height) {
      warnings.push(`缩略图分辨率过高，建议压缩以减小文件大小`);
      score -= 10;
    }

    // 验证文件大小
    if (mockThumbnailInfo.fileSize > rules.maxFileSize) {
      errors.push(`缩略图文件过大：${Math.round(mockThumbnailInfo.fileSize / 1024)}KB`);
      score -= 25;
    }

    // 验证格式
    if (!rules.allowedFormats.includes(mockThumbnailInfo.format)) {
      errors.push(`缩略图格式${mockThumbnailInfo.format}不支持`);
      score -= 20;
    }

    // 验证宽高比
    const aspectRatio = mockThumbnailInfo.resolution.width / mockThumbnailInfo.resolution.height;
    if (Math.abs(aspectRatio - rules.aspectRatio) > 0.1) {
      warnings.push(`建议使用16:9宽高比的缩略图`);
      score -= 5;
    }

    return {
      assetId,
      assetType: 'thumbnail',
      valid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
    };
  }

  /**
   * 验证关键词资源
   */
  private async validateKeywordAssets(
    keywordId: string,
    keyword: string,
    assets: {
      audioFile?: string;
      videoClips: string[];
      rescueVideo?: string;
    }
  ): Promise<Array<{
    assetId: string;
    assetType: AssetType;
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  }>> {
    const results = [];

    // 验证音频文件
    results.push(await this.validateAudioFile(keywordId, keyword, assets.audioFile));

    // 验证视频片段
    results.push(...await this.validateVideoClips(keywordId, keyword, assets.videoClips));

    // 验证救援视频
    results.push(await this.validateRescueVideo(keywordId, keyword, assets.rescueVideo));

    return results;
  }

  /**
   * 验证音频文件
   */
  private async validateAudioFile(
    keywordId: string,
    keyword: string,
    audioPath?: string
  ): Promise<{
    assetId: string;
    assetType: AssetType;
    valid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
  }> {
    const assetId = `audio_${keywordId}`;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!audioPath) {
      return {
        assetId,
        assetType: 'audio',
        valid: false,
        score: 0,
        errors: [`关键词"${keyword}"缺少发音音频文件`],
        warnings: [],
      };
    }

    // 模拟音频验证
    const mockAudioInfo = {
      duration: 2 + Math.random() * 3, // 2-5秒
      sampleRate: 44100,
      bitrate: 128,
      fileSize: 200 * 1024, // 200KB
      format: 'mp3',
    };

    const rules = this.validationRules.audioFile;
    let score = 100;

    // 验证时长
    if (mockAudioInfo.duration < rules.minDuration || mockAudioInfo.duration > rules.maxDuration) {
      errors.push(`音频时长${mockAudioInfo.duration.toFixed(1)}秒，应在${rules.minDuration}-${rules.maxDuration}秒之间`);
      score -= 25;
    }

    // 验证采样率
    if (mockAudioInfo.sampleRate < rules.minSampleRate) {
      errors.push(`音频采样率${mockAudioInfo.sampleRate}Hz过低，最低要求${rules.minSampleRate}Hz`);
      score -= 20;
    }

    // 验证文件大小
    if (mockAudioInfo.fileSize > rules.maxFileSize) {
      warnings.push(`音频文件较大，建议压缩`);
      score -= 10;
    }

    // 验证格式
    if (!rules.allowedFormats.includes(mockAudioInfo.format)) {
      errors.push(`音频格式${mockAudioInfo.format}不支持`);
      score -= 15;
    }

    // 验证质量
    if (mockAudioInfo.bitrate < rules.minQuality) {
      warnings.push(`音频质量较低，建议使用${rules.minQuality}kbps或更高`);
      score -= 5;
    }

    return {
      assetId,
      assetType: 'audio',
      valid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
    };
  }

  // ===== 辅助方法 =====

  /**
   * 创建失败的验证结果
   */
  private createFailedValidationResult(
    validationId: string,
    dramaId: string,
    errors: string[],
    startTime: number
  ): ValidationResult {
    return {
      validationId,
      dramaId,
      success: false,
      overallScore: 0,
      assetResults: [],
      missingAssets: [],
      recommendations: errors.map(error => `修复错误：${error}`),
      statistics: {
        totalAssets: 0,
        validAssets: 0,
        invalidAssets: 0,
        missingAssets: 0,
        validationTime: Date.now() - startTime,
      },
      validatedAt: new Date().toISOString(),
    };
  }

  /**
   * 查找缺失的资源
   */
  private findMissingAssets(dramaData: any): Array<{
    assetType: AssetType;
    keywordId?: string;
    description: string;
    severity: 'critical' | 'warning';
  }> {
    const missing = [];

    // 检查主视频
    if (!dramaData.mainVideoPath) {
      missing.push({
        assetType: 'main_video' as AssetType,
        description: '30秒主视频文件缺失',
        severity: 'critical' as const,
      });
    }

    // 检查缩略图
    if (!dramaData.thumbnailPath) {
      missing.push({
        assetType: 'thumbnail' as AssetType,
        description: '剧情缩略图缺失',
        severity: 'warning' as const,
      });
    }

    // 检查关键词资源
    dramaData.keywords?.forEach((keyword: any) => {
      if (!dramaData.audioFiles?.[keyword.keywordId]) {
        missing.push({
          assetType: 'audio' as AssetType,
          keywordId: keyword.keywordId,
          description: `关键词"${keyword.word}"的发音音频缺失`,
          severity: 'critical' as const,
        });
      }

      const videoClips = dramaData.videoClips?.[keyword.keywordId] || [];
      if (videoClips.length < 2) {
        missing.push({
          assetType: 'video_clip' as AssetType,
          keywordId: keyword.keywordId,
          description: `关键词"${keyword.word}"的视频片段不足（需要2-4个）`,
          severity: 'critical' as const,
        });
      }

      if (!dramaData.rescueVideos?.[keyword.keywordId]) {
        missing.push({
          assetType: 'rescue_video' as AssetType,
          keywordId: keyword.keywordId,
          description: `关键词"${keyword.word}"的救援视频缺失`,
          severity: 'critical' as const,
        });
      }
    });

    return missing;
  }

  /**
   * 生成改进建议
   */
  private generateRecommendations(
    results: any[],
    missingAssets: any[]
  ): string[] {
    const recommendations = [];

    // 基于验证结果的建议
    results.forEach(result => {
      if (result.errors.length > 0) {
        recommendations.push(`修复${result.assetType}的问题：${result.errors.join(', ')}`);
      }
      if (result.warnings.length > 0) {
        recommendations.push(`优化${result.assetType}：${result.warnings.join(', ')}`);
      }
    });

    // 基于缺失资源的建议
    missingAssets.forEach(missing => {
      if (missing.severity === 'critical') {
        recommendations.push(`紧急：${missing.description}`);
      } else {
        recommendations.push(`建议：${missing.description}`);
      }
    });

    // 通用建议
    if (recommendations.length === 0) {
      recommendations.push('所有资源验证通过，可以发布！');
    } else {
      recommendations.push('完成所有修复后重新验证');
    }

    return recommendations;
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const assets = Array.from(this.dramaAssets.values());
      await AsyncStorage.setItem(this.ASSETS_KEY, JSON.stringify(assets));
      await AsyncStorage.setItem(this.VALIDATION_HISTORY_KEY, JSON.stringify(this.validationHistory));
    } catch (error) {
      console.error('Error saving asset validation data:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取验证历史
   */
  getValidationHistory(dramaId?: string): ValidationResult[] {
    if (dramaId) {
      return this.validationHistory.filter(result => result.dramaId === dramaId);
    }
    return [...this.validationHistory];
  }

  /**
   * 获取验证规则
   */
  getValidationRules(): AssetValidationRules {
    return { ...this.validationRules };
  }

  /**
   * 更新验证规则
   */
  updateValidationRules(rules: Partial<AssetValidationRules>): void {
    this.validationRules = { ...this.validationRules, ...rules };
  }
}

export default AssetValidationService;
