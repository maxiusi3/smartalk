/**
 * ContentCreatorService - V2 内容创作者服务
 * 提供完整的内容创作工具：可视化编辑器、资产管理、质量验证
 * 支持拖拽式内容创建、批量上传、版本控制
 */

import { AnalyticsService } from './AnalyticsService';
import ContentManagementService, { ContentItem, ContentType, DifficultyLevel, ContentTheme } from './ContentManagementService';

// 创作项目
export interface CreatorProject {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  theme: ContentTheme;
  difficulty: DifficultyLevel;
  
  // 项目状态
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived';
  progress: number; // 0-100
  
  // 内容结构
  structure: {
    totalKeywords: number;
    completedKeywords: number;
    requiredAssets: string[];
    uploadedAssets: string[];
  };
  
  // 创作者信息
  creator: {
    id: string;
    name: string;
    role: 'creator' | 'editor' | 'reviewer' | 'admin';
  };
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// 资产类型
export type AssetType = 
  | 'audio'
  | 'video'
  | 'image'
  | 'subtitle'
  | 'rescue_video';

// 资产项目
export interface AssetItem {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  size: number; // bytes
  duration?: number; // seconds for audio/video
  
  // 元数据
  metadata: {
    format: string;
    resolution?: string;
    bitrate?: number;
    language?: string;
    keywords?: string[];
  };
  
  // 验证状态
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    quality: 'low' | 'medium' | 'high';
  };
  
  // 关联信息
  projectId: string;
  keywordId?: string;
  
  // 时间戳
  uploadedAt: string;
  processedAt?: string;
}

// 内容模板
export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  
  // 模板结构
  structure: {
    keywordCount: number;
    requiredAssets: AssetType[];
    optionalAssets: AssetType[];
    validationRules: ValidationRule[];
  };
  
  // 预设配置
  defaults: {
    difficulty: DifficultyLevel;
    theme: ContentTheme;
    duration: number; // seconds
  };
}

// 验证规则
interface ValidationRule {
  id: string;
  type: 'required' | 'format' | 'duration' | 'quality' | 'content';
  field: string;
  condition: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// 批量操作
export interface BatchOperation {
  id: string;
  type: 'upload' | 'process' | 'validate' | 'publish';
  status: 'pending' | 'running' | 'completed' | 'failed';
  
  // 操作详情
  items: {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
  }[];
  
  // 进度信息
  progress: {
    total: number;
    completed: number;
    failed: number;
  };
  
  // 时间信息
  startedAt: string;
  completedAt?: string;
  estimatedTimeRemaining?: number; // seconds
}

// 质量报告
export interface QualityReport {
  projectId: string;
  overallScore: number; // 0-100
  
  // 各项评分
  scores: {
    contentStructure: number;
    assetQuality: number;
    accessibility: number;
    learningEffectiveness: number;
  };
  
  // 问题汇总
  issues: {
    critical: number;
    major: number;
    minor: number;
    suggestions: number;
  };
  
  // 详细问题
  details: {
    type: 'critical' | 'major' | 'minor' | 'suggestion';
    category: string;
    description: string;
    location: string;
    recommendation: string;
  }[];
  
  // 生成时间
  generatedAt: string;
}

class ContentCreatorService {
  private static instance: ContentCreatorService;
  private analyticsService = AnalyticsService.getInstance();
  private contentService = ContentManagementService.getInstance();
  
  // 项目管理
  private projects: Map<string, CreatorProject> = new Map();
  private assets: Map<string, AssetItem> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();
  
  // 批量操作
  private batchOperations: Map<string, BatchOperation> = new Map();
  
  // 质量报告
  private qualityReports: Map<string, QualityReport> = new Map();

  static getInstance(): ContentCreatorService {
    if (!ContentCreatorService.instance) {
      ContentCreatorService.instance = new ContentCreatorService();
    }
    return ContentCreatorService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化内容创作服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载默认模板
      this.loadDefaultTemplates();
      
      this.analyticsService.track('content_creator_service_initialized', {
        templatesCount: this.templates.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing content creator service:', error);
    }
  }

  /**
   * 加载默认模板
   */
  private loadDefaultTemplates(): void {
    const defaultTemplates: ContentTemplate[] = [
      {
        id: 'drama_template',
        name: '情景剧模板',
        description: '标准30秒情景剧，包含5个关键词',
        type: 'story',
        structure: {
          keywordCount: 5,
          requiredAssets: ['audio', 'video'],
          optionalAssets: ['subtitle', 'rescue_video'],
          validationRules: [
            {
              id: 'keyword_count',
              type: 'required',
              field: 'keywords',
              condition: 'count === 5',
              message: '必须包含恰好5个关键词',
              severity: 'error',
            },
            {
              id: 'duration_check',
              type: 'duration',
              field: 'audio',
              condition: 'duration <= 30',
              message: '音频时长不能超过30秒',
              severity: 'error',
            },
          ],
        },
        defaults: {
          difficulty: 'intermediate',
          theme: 'daily_life',
          duration: 30,
        },
      },
      {
        id: 'vocabulary_template',
        name: '词汇练习模板',
        description: '单词学习内容，包含发音和例句',
        type: 'word',
        structure: {
          keywordCount: 1,
          requiredAssets: ['audio'],
          optionalAssets: ['image', 'video'],
          validationRules: [
            {
              id: 'audio_quality',
              type: 'quality',
              field: 'audio',
              condition: 'bitrate >= 128',
              message: '音频质量应不低于128kbps',
              severity: 'warning',
            },
          ],
        },
        defaults: {
          difficulty: 'beginner',
          theme: 'vocabulary',
          duration: 10,
        },
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  // ===== 项目管理 =====

  /**
   * 创建新项目
   */
  async createProject(
    name: string,
    description: string,
    templateId: string,
    creatorInfo: { id: string; name: string; role: string }
  ): Promise<CreatorProject> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const project: CreatorProject = {
        id: `project_${Date.now()}`,
        name,
        description,
        type: template.type,
        theme: template.defaults.theme,
        difficulty: template.defaults.difficulty,
        status: 'draft',
        progress: 0,
        structure: {
          totalKeywords: template.structure.keywordCount,
          completedKeywords: 0,
          requiredAssets: template.structure.requiredAssets,
          uploadedAssets: [],
        },
        creator: {
          id: creatorInfo.id,
          name: creatorInfo.name,
          role: creatorInfo.role as any,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.projects.set(project.id, project);

      this.analyticsService.track('content_project_created', {
        projectId: project.id,
        templateId,
        creatorId: creatorInfo.id,
        timestamp: Date.now(),
      });

      return project;

    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * 获取项目列表
   */
  getProjects(creatorId?: string): CreatorProject[] {
    const projects = Array.from(this.projects.values());
    
    if (creatorId) {
      return projects.filter(project => project.creator.id === creatorId);
    }
    
    return projects;
  }

  /**
   * 获取单个项目
   */
  getProject(projectId: string): CreatorProject | null {
    return this.projects.get(projectId) || null;
  }

  /**
   * 更新项目
   */
  updateProject(projectId: string, updates: Partial<CreatorProject>): void {
    const project = this.projects.get(projectId);
    if (project) {
      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      this.projects.set(projectId, updatedProject);

      this.analyticsService.track('content_project_updated', {
        projectId,
        updatedFields: Object.keys(updates),
        timestamp: Date.now(),
      });
    }
  }

  // ===== 资产管理 =====

  /**
   * 上传资产
   */
  async uploadAsset(
    projectId: string,
    file: {
      name: string;
      type: AssetType;
      data: string; // base64 or URL
      size: number;
      metadata?: any;
    }
  ): Promise<AssetItem> {
    try {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      const asset: AssetItem = {
        id: `asset_${Date.now()}`,
        name: file.name,
        type: file.type,
        url: file.data,
        size: file.size,
        metadata: {
          format: this.getFileFormat(file.name),
          ...file.metadata,
        },
        validation: {
          isValid: true,
          errors: [],
          warnings: [],
          quality: 'medium',
        },
        projectId,
        uploadedAt: new Date().toISOString(),
      };

      // 验证资产
      await this.validateAsset(asset);

      this.assets.set(asset.id, asset);

      // 更新项目进度
      this.updateProjectProgress(projectId);

      this.analyticsService.track('content_asset_uploaded', {
        projectId,
        assetId: asset.id,
        assetType: asset.type,
        assetSize: asset.size,
        timestamp: Date.now(),
      });

      return asset;

    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  }

  /**
   * 验证资产
   */
  private async validateAsset(asset: AssetItem): Promise<void> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 文件大小检查
    if (asset.size > 50 * 1024 * 1024) { // 50MB
      errors.push('文件大小超过50MB限制');
    }

    // 格式检查
    const allowedFormats = this.getAllowedFormats(asset.type);
    if (!allowedFormats.includes(asset.metadata.format)) {
      errors.push(`不支持的文件格式: ${asset.metadata.format}`);
    }

    // 音频特定检查
    if (asset.type === 'audio') {
      if (asset.duration && asset.duration > 60) {
        warnings.push('音频时长超过60秒，可能影响学习体验');
      }
    }

    // 视频特定检查
    if (asset.type === 'video') {
      if (asset.duration && asset.duration > 120) {
        warnings.push('视频时长超过2分钟，建议缩短');
      }
    }

    asset.validation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      quality: this.assessAssetQuality(asset),
    };
  }

  /**
   * 获取允许的文件格式
   */
  private getAllowedFormats(assetType: AssetType): string[] {
    switch (assetType) {
      case 'audio': return ['mp3', 'wav', 'aac', 'm4a'];
      case 'video': return ['mp4', 'mov', 'avi', 'webm'];
      case 'image': return ['jpg', 'jpeg', 'png', 'webp'];
      case 'subtitle': return ['srt', 'vtt', 'ass'];
      case 'rescue_video': return ['mp4', 'mov', 'webm'];
      default: return [];
    }
  }

  /**
   * 评估资产质量
   */
  private assessAssetQuality(asset: AssetItem): 'low' | 'medium' | 'high' {
    // 简化的质量评估逻辑
    if (asset.validation.errors.length > 0) return 'low';
    if (asset.validation.warnings.length > 2) return 'medium';
    return 'high';
  }

  /**
   * 获取文件格式
   */
  private getFileFormat(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  /**
   * 获取项目资产
   */
  getProjectAssets(projectId: string): AssetItem[] {
    return Array.from(this.assets.values()).filter(asset => asset.projectId === projectId);
  }

  // ===== 批量操作 =====

  /**
   * 开始批量上传
   */
  async startBatchUpload(
    projectId: string,
    files: { name: string; type: AssetType; data: string; size: number }[]
  ): Promise<BatchOperation> {
    try {
      const operation: BatchOperation = {
        id: `batch_${Date.now()}`,
        type: 'upload',
        status: 'pending',
        items: files.map(file => ({
          id: `item_${Date.now()}_${Math.random()}`,
          name: file.name,
          status: 'pending',
        })),
        progress: {
          total: files.length,
          completed: 0,
          failed: 0,
        },
        startedAt: new Date().toISOString(),
      };

      this.batchOperations.set(operation.id, operation);

      // 异步处理批量上传
      this.processBatchUpload(operation, projectId, files);

      return operation;

    } catch (error) {
      console.error('Error starting batch upload:', error);
      throw error;
    }
  }

  /**
   * 处理批量上传
   */
  private async processBatchUpload(
    operation: BatchOperation,
    projectId: string,
    files: { name: string; type: AssetType; data: string; size: number }[]
  ): Promise<void> {
    operation.status = 'running';
    this.batchOperations.set(operation.id, operation);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item = operation.items[i];

      try {
        item.status = 'processing';
        this.batchOperations.set(operation.id, operation);

        await this.uploadAsset(projectId, file);

        item.status = 'completed';
        operation.progress.completed++;

      } catch (error) {
        item.status = 'failed';
        item.error = error.message;
        operation.progress.failed++;
      }

      this.batchOperations.set(operation.id, operation);
    }

    operation.status = 'completed';
    operation.completedAt = new Date().toISOString();
    this.batchOperations.set(operation.id, operation);
  }

  /**
   * 获取批量操作状态
   */
  getBatchOperation(operationId: string): BatchOperation | null {
    return this.batchOperations.get(operationId) || null;
  }

  // ===== 质量验证 =====

  /**
   * 生成质量报告
   */
  async generateQualityReport(projectId: string): Promise<QualityReport> {
    try {
      const project = this.projects.get(projectId);
      if (!project) {
        throw new Error(`Project not found: ${projectId}`);
      }

      const assets = this.getProjectAssets(projectId);
      
      const report: QualityReport = {
        projectId,
        overallScore: 0,
        scores: {
          contentStructure: 0,
          assetQuality: 0,
          accessibility: 0,
          learningEffectiveness: 0,
        },
        issues: {
          critical: 0,
          major: 0,
          minor: 0,
          suggestions: 0,
        },
        details: [],
        generatedAt: new Date().toISOString(),
      };

      // 评估内容结构
      report.scores.contentStructure = this.evaluateContentStructure(project, assets);
      
      // 评估资产质量
      report.scores.assetQuality = this.evaluateAssetQuality(assets);
      
      // 评估可访问性
      report.scores.accessibility = this.evaluateAccessibility(project, assets);
      
      // 评估学习效果
      report.scores.learningEffectiveness = this.evaluateLearningEffectiveness(project, assets);

      // 计算总体评分
      report.overallScore = (
        report.scores.contentStructure +
        report.scores.assetQuality +
        report.scores.accessibility +
        report.scores.learningEffectiveness
      ) / 4;

      // 生成问题详情
      report.details = this.generateIssueDetails(project, assets);
      
      // 统计问题数量
      report.issues = {
        critical: report.details.filter(d => d.type === 'critical').length,
        major: report.details.filter(d => d.type === 'major').length,
        minor: report.details.filter(d => d.type === 'minor').length,
        suggestions: report.details.filter(d => d.type === 'suggestion').length,
      };

      this.qualityReports.set(projectId, report);

      this.analyticsService.track('quality_report_generated', {
        projectId,
        overallScore: report.overallScore,
        issuesCount: report.issues.critical + report.issues.major + report.issues.minor,
        timestamp: Date.now(),
      });

      return report;

    } catch (error) {
      console.error('Error generating quality report:', error);
      throw error;
    }
  }

  /**
   * 评估内容结构
   */
  private evaluateContentStructure(project: CreatorProject, assets: AssetItem[]): number {
    let score = 100;

    // 检查关键词数量
    if (project.structure.completedKeywords !== project.structure.totalKeywords) {
      score -= 20;
    }

    // 检查必需资产
    const requiredAssets = project.structure.requiredAssets;
    const uploadedAssetTypes = assets.map(a => a.type);
    
    for (const required of requiredAssets) {
      if (!uploadedAssetTypes.includes(required)) {
        score -= 15;
      }
    }

    return Math.max(0, score);
  }

  /**
   * 评估资产质量
   */
  private evaluateAssetQuality(assets: AssetItem[]): number {
    if (assets.length === 0) return 0;

    const qualityScores = assets.map(asset => {
      if (asset.validation.quality === 'high') return 100;
      if (asset.validation.quality === 'medium') return 70;
      return 40;
    });

    return qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
  }

  /**
   * 评估可访问性
   */
  private evaluateAccessibility(project: CreatorProject, assets: AssetItem[]): number {
    let score = 100;

    // 检查字幕
    const hasSubtitles = assets.some(asset => asset.type === 'subtitle');
    if (!hasSubtitles) {
      score -= 30;
    }

    // 检查救援视频
    const hasRescueVideo = assets.some(asset => asset.type === 'rescue_video');
    if (!hasRescueVideo) {
      score -= 20;
    }

    return Math.max(0, score);
  }

  /**
   * 评估学习效果
   */
  private evaluateLearningEffectiveness(project: CreatorProject, assets: AssetItem[]): number {
    let score = 80; // 基础分

    // 根据难度和主题调整
    if (project.difficulty === 'beginner') score += 10;
    if (project.theme === 'daily_life') score += 10;

    return Math.min(100, score);
  }

  /**
   * 生成问题详情
   */
  private generateIssueDetails(project: CreatorProject, assets: AssetItem[]): QualityReport['details'] {
    const details: QualityReport['details'] = [];

    // 检查资产验证错误
    assets.forEach(asset => {
      asset.validation.errors.forEach(error => {
        details.push({
          type: 'critical',
          category: '资产质量',
          description: error,
          location: asset.name,
          recommendation: '请修复此问题后重新上传',
        });
      });

      asset.validation.warnings.forEach(warning => {
        details.push({
          type: 'minor',
          category: '资产质量',
          description: warning,
          location: asset.name,
          recommendation: '建议优化以提升质量',
        });
      });
    });

    return details;
  }

  /**
   * 更新项目进度
   */
  private updateProjectProgress(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;

    const assets = this.getProjectAssets(projectId);
    const requiredAssetTypes = project.structure.requiredAssets;
    const uploadedAssetTypes = [...new Set(assets.map(a => a.type))];

    // 计算进度
    const assetProgress = (uploadedAssetTypes.length / requiredAssetTypes.length) * 100;
    const keywordProgress = (project.structure.completedKeywords / project.structure.totalKeywords) * 100;
    
    const overallProgress = (assetProgress + keywordProgress) / 2;

    this.updateProject(projectId, { progress: Math.round(overallProgress) });
  }

  // ===== 公共API =====

  /**
   * 获取模板列表
   */
  getTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取质量报告
   */
  getQualityReport(projectId: string): QualityReport | null {
    return this.qualityReports.get(projectId) || null;
  }

  /**
   * 发布项目
   */
  async publishProject(projectId: string): Promise<void> {
    const project = this.projects.get(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    // 生成质量报告
    const report = await this.generateQualityReport(projectId);
    
    // 检查是否可以发布
    if (report.overallScore < 70) {
      throw new Error('项目质量评分过低，无法发布');
    }

    if (report.issues.critical > 0) {
      throw new Error('存在严重问题，请修复后再发布');
    }

    // 更新项目状态
    this.updateProject(projectId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    });

    this.analyticsService.track('content_project_published', {
      projectId,
      qualityScore: report.overallScore,
      timestamp: Date.now(),
    });
  }
}

export default ContentCreatorService;
