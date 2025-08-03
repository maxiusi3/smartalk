/**
 * VisualContentCreationService - V2 可视化内容创建服务
 * 提供完整的内容创建工具：向导式创建流程、资源管理、质量验证
 * 支持批量上传、内容模板、预览功能
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { AnalyticsService } from './AnalyticsService';
import { ContentTheme } from './ContentManagementService';

// 内容创建项目
export interface ContentCreationProject {
  projectId: string;
  title: string;
  theme: ContentTheme;
  
  // 项目信息
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status: 'draft' | 'in_progress' | 'review' | 'approved' | 'published';
  
  // 剧本信息
  dramaDuration: number; // seconds, must be 30
  keywordCount: number; // must be exactly 5
  
  // 关键词和资源
  keywords: ContentKeyword[];
  
  // 验证状态
  validationStatus: ValidationStatus;
  
  // 版本信息
  version: string;
  publishedVersion?: string;
}

// 内容关键词
export interface ContentKeyword {
  keywordId: string;
  word: string;
  pronunciation: string;
  meaning: string;
  
  // 资源文件
  audioFile?: AssetFile;
  videoClips: AssetFile[]; // 2-4 clips per keyword
  rescueVideo?: AssetFile; // mouth close-up video
  
  // 时间标记
  appearanceTime: number; // seconds in drama
  
  // 验证状态
  isComplete: boolean;
  validationErrors: string[];
}

// 资源文件
export interface AssetFile {
  fileId: string;
  fileName: string;
  fileType: 'audio' | 'video' | 'image';
  filePath: string;
  fileSize: number;
  duration?: number; // for audio/video
  
  // 上传信息
  uploadedAt: string;
  uploadedBy: string;
  
  // 验证状态
  isValid: boolean;
  validationErrors: string[];
  
  // CDN信息
  cdnUrl?: string;
  thumbnailUrl?: string;
}

// 验证状态
export interface ValidationStatus {
  isValid: boolean;
  completionPercentage: number;
  
  // 验证结果
  errors: ValidationError[];
  warnings: ValidationWarning[];
  
  // 检查项目
  checks: {
    keywordCount: boolean; // exactly 5
    dramaDuration: boolean; // exactly 30 seconds
    allAudioFiles: boolean;
    allVideoClips: boolean; // 2-4 per keyword
    allRescueVideos: boolean;
    pronunciationData: boolean;
  };
}

// 验证错误
export interface ValidationError {
  errorId: string;
  type: 'missing_asset' | 'invalid_format' | 'duration_mismatch' | 'quality_issue';
  severity: 'error' | 'warning';
  message: string;
  keywordId?: string;
  assetId?: string;
  suggestions: string[];
}

// 验证警告
export interface ValidationWarning {
  warningId: string;
  type: 'quality_suggestion' | 'optimization_tip' | 'best_practice';
  message: string;
  keywordId?: string;
  assetId?: string;
}

// 内容模板
export interface ContentTemplate {
  templateId: string;
  name: string;
  description: string;
  theme: ContentTheme;
  
  // 模板结构
  keywordStructure: {
    count: number; // always 5
    suggestedTypes: string[]; // noun, verb, adjective, etc.
  };
  
  // 资源要求
  assetRequirements: {
    audioFormat: string[];
    videoFormat: string[];
    videoDuration: { min: number; max: number };
    videoResolution: { min: string; recommended: string };
  };
  
  // 质量标准
  qualityStandards: {
    audioQuality: string;
    videoQuality: string;
    pronunciationAccuracy: number;
  };
}

// 批量上传会话
export interface BulkUploadSession {
  sessionId: string;
  projectId: string;
  
  // 上传文件
  files: {
    file: AssetFile;
    targetKeywordId?: string;
    uploadProgress: number;
    uploadStatus: 'pending' | 'uploading' | 'completed' | 'failed';
    error?: string;
  }[];
  
  // 会话状态
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  
  startedAt: string;
  completedAt?: string;
}

class VisualContentCreationService {
  private static instance: VisualContentCreationService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 项目管理
  private projects: Map<string, ContentCreationProject> = new Map();
  private templates: Map<string, ContentTemplate> = new Map();
  private bulkUploadSessions: Map<string, BulkUploadSession> = new Map();
  
  // 存储键
  private readonly PROJECTS_KEY = 'content_projects';
  private readonly TEMPLATES_KEY = 'content_templates';
  
  // 文件存储路径
  private readonly ASSETS_DIR = `${FileSystem.documentDirectory}content_assets/`;

  static getInstance(): VisualContentCreationService {
    if (!VisualContentCreationService.instance) {
      VisualContentCreationService.instance = new VisualContentCreationService();
    }
    return VisualContentCreationService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化可视化内容创建服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 创建资源目录
      await this.ensureAssetsDirectory();
      
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化默认模板
      this.initializeDefaultTemplates();
      
      this.analyticsService.track('visual_content_creation_service_initialized', {
        projectsCount: this.projects.size,
        templatesCount: this.templates.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing visual content creation service:', error);
    }
  }

  /**
   * 确保资源目录存在
   */
  private async ensureAssetsDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.ASSETS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.ASSETS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error creating assets directory:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载项目
      const projectsData = await AsyncStorage.getItem(this.PROJECTS_KEY);
      if (projectsData) {
        const projects: ContentCreationProject[] = JSON.parse(projectsData);
        projects.forEach(project => {
          this.projects.set(project.projectId, project);
        });
      }

      // 加载模板
      const templatesData = await AsyncStorage.getItem(this.TEMPLATES_KEY);
      if (templatesData) {
        const templates: ContentTemplate[] = JSON.parse(templatesData);
        templates.forEach(template => {
          this.templates.set(template.templateId, template);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化默认模板
   */
  private initializeDefaultTemplates(): void {
    const themes: ContentTheme[] = ['daily_life', 'business', 'travel'];
    
    themes.forEach(theme => {
      const template: ContentTemplate = {
        templateId: `template_${theme}`,
        name: `${theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Template`,
        description: `Standard template for ${theme} themed content`,
        theme,
        keywordStructure: {
          count: 5,
          suggestedTypes: ['noun', 'verb', 'adjective', 'phrase', 'expression'],
        },
        assetRequirements: {
          audioFormat: ['mp3', 'wav', 'm4a'],
          videoFormat: ['mp4', 'mov', 'avi'],
          videoDuration: { min: 2, max: 5 },
          videoResolution: { min: '720p', recommended: '1080p' },
        },
        qualityStandards: {
          audioQuality: 'Clear pronunciation, minimal background noise',
          videoQuality: 'HD resolution, good lighting, stable footage',
          pronunciationAccuracy: 0.85,
        },
      };
      
      this.templates.set(template.templateId, template);
    });
  }

  // ===== 项目管理 =====

  /**
   * 创建新项目
   */
  async createProject(
    title: string,
    theme: ContentTheme,
    createdBy: string,
    templateId?: string
  ): Promise<string> {
    try {
      const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const project: ContentCreationProject = {
        projectId,
        title,
        theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy,
        status: 'draft',
        dramaDuration: 30,
        keywordCount: 5,
        keywords: this.createEmptyKeywords(),
        validationStatus: this.createInitialValidationStatus(),
        version: '1.0.0',
      };

      this.projects.set(projectId, project);
      await this.saveProjects();

      this.analyticsService.track('content_project_created', {
        projectId,
        theme,
        createdBy,
        templateId,
        timestamp: Date.now(),
      });

      return projectId;

    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * 创建空关键词结构
   */
  private createEmptyKeywords(): ContentKeyword[] {
    return Array.from({ length: 5 }, (_, index) => ({
      keywordId: `keyword_${index + 1}`,
      word: '',
      pronunciation: '',
      meaning: '',
      videoClips: [],
      appearanceTime: 0,
      isComplete: false,
      validationErrors: [],
    }));
  }

  /**
   * 创建初始验证状态
   */
  private createInitialValidationStatus(): ValidationStatus {
    return {
      isValid: false,
      completionPercentage: 0,
      errors: [],
      warnings: [],
      checks: {
        keywordCount: false,
        dramaDuration: false,
        allAudioFiles: false,
        allVideoClips: false,
        allRescueVideos: false,
        pronunciationData: false,
      },
    };
  }

  /**
   * 更新项目
   */
  async updateProject(projectId: string, updates: Partial<ContentCreationProject>): Promise<void> {
    try {
      const project = this.projects.get(projectId);
      if (!project) throw new Error('Project not found');

      const updatedProject = {
        ...project,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.projects.set(projectId, updatedProject);
      await this.saveProjects();

      // 重新验证项目
      await this.validateProject(projectId);

      this.analyticsService.track('content_project_updated', {
        projectId,
        updates: Object.keys(updates),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * 更新关键词
   */
  async updateKeyword(
    projectId: string,
    keywordId: string,
    updates: Partial<ContentKeyword>
  ): Promise<void> {
    try {
      const project = this.projects.get(projectId);
      if (!project) throw new Error('Project not found');

      const keywordIndex = project.keywords.findIndex(k => k.keywordId === keywordId);
      if (keywordIndex === -1) throw new Error('Keyword not found');

      project.keywords[keywordIndex] = {
        ...project.keywords[keywordIndex],
        ...updates,
      };

      project.updatedAt = new Date().toISOString();
      this.projects.set(projectId, project);
      await this.saveProjects();

      // 重新验证项目
      await this.validateProject(projectId);

      this.analyticsService.track('content_keyword_updated', {
        projectId,
        keywordId,
        updates: Object.keys(updates),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating keyword:', error);
      throw error;
    }
  }

  // ===== 资源管理 =====

  /**
   * 上传单个文件
   */
  async uploadAsset(
    projectId: string,
    keywordId: string,
    fileType: 'audio' | 'video' | 'image',
    assetType: 'audio' | 'video_clip' | 'rescue_video'
  ): Promise<string> {
    try {
      let result;
      
      if (fileType === 'image' || fileType === 'video') {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: fileType === 'image' ? 
            ImagePicker.MediaTypeOptions.Images : 
            ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 1,
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: 'audio/*',
          copyToCacheDirectory: true,
        });
      }

      if (result.canceled) {
        throw new Error('File selection cancelled');
      }

      const file = result.assets[0];
      const assetFile = await this.processUploadedFile(file, projectId, keywordId, assetType);
      
      // 添加到项目
      await this.addAssetToProject(projectId, keywordId, assetFile, assetType);

      return assetFile.fileId;

    } catch (error) {
      console.error('Error uploading asset:', error);
      throw error;
    }
  }

  /**
   * 处理上传的文件
   */
  private async processUploadedFile(
    file: any,
    projectId: string,
    keywordId: string,
    assetType: string
  ): Promise<AssetFile> {
    try {
      const fileId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fileName = file.name || `${assetType}_${keywordId}`;
      const fileExtension = fileName.split('.').pop() || 'unknown';
      
      // 创建目标路径
      const targetPath = `${this.ASSETS_DIR}${projectId}/${keywordId}/${fileId}.${fileExtension}`;
      
      // 确保目录存在
      const targetDir = `${this.ASSETS_DIR}${projectId}/${keywordId}/`;
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
      
      // 复制文件
      await FileSystem.copyAsync({
        from: file.uri,
        to: targetPath,
      });

      // 获取文件信息
      const fileInfo = await FileSystem.getInfoAsync(targetPath);

      const assetFile: AssetFile = {
        fileId,
        fileName,
        fileType: this.determineFileType(fileExtension),
        filePath: targetPath,
        fileSize: fileInfo.size || 0,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'current_user', // 在实际应用中会从用户状态获取
        isValid: true,
        validationErrors: [],
      };

      // 验证文件
      await this.validateAssetFile(assetFile);

      return assetFile;

    } catch (error) {
      console.error('Error processing uploaded file:', error);
      throw error;
    }
  }

  /**
   * 确定文件类型
   */
  private determineFileType(extension: string): 'audio' | 'video' | 'image' {
    const audioExtensions = ['mp3', 'wav', 'm4a', 'aac'];
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    const ext = extension.toLowerCase();
    
    if (audioExtensions.includes(ext)) return 'audio';
    if (videoExtensions.includes(ext)) return 'video';
    if (imageExtensions.includes(ext)) return 'image';
    
    return 'video'; // 默认
  }

  /**
   * 验证资源文件
   */
  private async validateAssetFile(assetFile: AssetFile): Promise<void> {
    try {
      const errors: string[] = [];

      // 检查文件大小
      const maxSize = assetFile.fileType === 'video' ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for others
      if (assetFile.fileSize > maxSize) {
        errors.push(`File size exceeds limit (${Math.round(maxSize / 1024 / 1024)}MB)`);
      }

      // 检查文件是否存在
      const fileInfo = await FileSystem.getInfoAsync(assetFile.filePath);
      if (!fileInfo.exists) {
        errors.push('File does not exist');
      }

      assetFile.validationErrors = errors;
      assetFile.isValid = errors.length === 0;

    } catch (error) {
      console.error('Error validating asset file:', error);
      assetFile.validationErrors = ['Validation failed'];
      assetFile.isValid = false;
    }
  }

  /**
   * 添加资源到项目
   */
  private async addAssetToProject(
    projectId: string,
    keywordId: string,
    assetFile: AssetFile,
    assetType: string
  ): Promise<void> {
    try {
      const project = this.projects.get(projectId);
      if (!project) throw new Error('Project not found');

      const keyword = project.keywords.find(k => k.keywordId === keywordId);
      if (!keyword) throw new Error('Keyword not found');

      switch (assetType) {
        case 'audio':
          keyword.audioFile = assetFile;
          break;
        case 'video_clip':
          keyword.videoClips.push(assetFile);
          break;
        case 'rescue_video':
          keyword.rescueVideo = assetFile;
          break;
      }

      project.updatedAt = new Date().toISOString();
      this.projects.set(projectId, project);
      await this.saveProjects();

    } catch (error) {
      console.error('Error adding asset to project:', error);
      throw error;
    }
  }

  // ===== 批量上传 =====

  /**
   * 开始批量上传会话
   */
  async startBulkUploadSession(projectId: string): Promise<string> {
    try {
      const sessionId = `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session: BulkUploadSession = {
        sessionId,
        projectId,
        files: [],
        totalFiles: 0,
        completedFiles: 0,
        failedFiles: 0,
        startedAt: new Date().toISOString(),
      };

      this.bulkUploadSessions.set(sessionId, session);

      this.analyticsService.track('bulk_upload_session_started', {
        sessionId,
        projectId,
        timestamp: Date.now(),
      });

      return sessionId;

    } catch (error) {
      console.error('Error starting bulk upload session:', error);
      throw error;
    }
  }

  /**
   * 添加文件到批量上传会话
   */
  async addFilesToBulkUpload(sessionId: string, files: any[]): Promise<void> {
    try {
      const session = this.bulkUploadSessions.get(sessionId);
      if (!session) throw new Error('Bulk upload session not found');

      for (const file of files) {
        const assetFile: AssetFile = {
          fileId: `bulk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileType: this.determineFileType(file.name.split('.').pop() || ''),
          filePath: file.uri,
          fileSize: file.size || 0,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'current_user',
          isValid: true,
          validationErrors: [],
        };

        session.files.push({
          file: assetFile,
          uploadProgress: 0,
          uploadStatus: 'pending',
        });
      }

      session.totalFiles = session.files.length;
      this.bulkUploadSessions.set(sessionId, session);

    } catch (error) {
      console.error('Error adding files to bulk upload:', error);
      throw error;
    }
  }

  // ===== 项目验证 =====

  /**
   * 验证项目
   */
  async validateProject(projectId: string): Promise<ValidationStatus> {
    try {
      const project = this.projects.get(projectId);
      if (!project) throw new Error('Project not found');

      const validationStatus: ValidationStatus = {
        isValid: true,
        completionPercentage: 0,
        errors: [],
        warnings: [],
        checks: {
          keywordCount: project.keywords.length === 5,
          dramaDuration: project.dramaDuration === 30,
          allAudioFiles: true,
          allVideoClips: true,
          allRescueVideos: true,
          pronunciationData: true,
        },
      };

      // 检查关键词完整性
      let completedKeywords = 0;
      
      project.keywords.forEach(keyword => {
        let keywordComplete = true;
        
        // 检查基本信息
        if (!keyword.word || !keyword.pronunciation || !keyword.meaning) {
          keywordComplete = false;
          validationStatus.errors.push({
            errorId: `missing_info_${keyword.keywordId}`,
            type: 'missing_asset',
            severity: 'error',
            message: `Keyword ${keyword.keywordId} is missing basic information`,
            keywordId: keyword.keywordId,
            suggestions: ['Fill in word, pronunciation, and meaning'],
          });
        }

        // 检查音频文件
        if (!keyword.audioFile) {
          keywordComplete = false;
          validationStatus.checks.allAudioFiles = false;
          validationStatus.errors.push({
            errorId: `missing_audio_${keyword.keywordId}`,
            type: 'missing_asset',
            severity: 'error',
            message: `Keyword ${keyword.keywordId} is missing audio file`,
            keywordId: keyword.keywordId,
            suggestions: ['Upload audio file for this keyword'],
          });
        }

        // 检查视频片段
        if (keyword.videoClips.length < 2 || keyword.videoClips.length > 4) {
          keywordComplete = false;
          validationStatus.checks.allVideoClips = false;
          validationStatus.errors.push({
            errorId: `invalid_video_count_${keyword.keywordId}`,
            type: 'missing_asset',
            severity: 'error',
            message: `Keyword ${keyword.keywordId} must have 2-4 video clips`,
            keywordId: keyword.keywordId,
            suggestions: ['Upload 2-4 video clips for this keyword'],
          });
        }

        // 检查救援视频
        if (!keyword.rescueVideo) {
          validationStatus.checks.allRescueVideos = false;
          validationStatus.warnings.push({
            warningId: `missing_rescue_${keyword.keywordId}`,
            type: 'quality_suggestion',
            message: `Keyword ${keyword.keywordId} is missing rescue video`,
            keywordId: keyword.keywordId,
          });
        }

        if (keywordComplete) {
          completedKeywords++;
        }
        
        keyword.isComplete = keywordComplete;
      });

      // 计算完成百分比
      validationStatus.completionPercentage = (completedKeywords / 5) * 100;
      
      // 检查整体有效性
      validationStatus.isValid = validationStatus.errors.length === 0 && completedKeywords === 5;

      // 更新项目验证状态
      project.validationStatus = validationStatus;
      this.projects.set(projectId, project);
      await this.saveProjects();

      return validationStatus;

    } catch (error) {
      console.error('Error validating project:', error);
      throw error;
    }
  }

  // ===== 预览功能 =====

  /**
   * 生成项目预览
   */
  async generateProjectPreview(projectId: string): Promise<{
    canPreview: boolean;
    missingAssets: string[];
    previewUrl?: string;
  }> {
    try {
      const project = this.projects.get(projectId);
      if (!project) throw new Error('Project not found');

      const validationStatus = await this.validateProject(projectId);
      const missingAssets: string[] = [];

      // 检查预览所需的最小资源
      project.keywords.forEach(keyword => {
        if (!keyword.audioFile) {
          missingAssets.push(`Audio for ${keyword.word || keyword.keywordId}`);
        }
        if (keyword.videoClips.length === 0) {
          missingAssets.push(`Video clips for ${keyword.word || keyword.keywordId}`);
        }
      });

      const canPreview = missingAssets.length === 0;

      this.analyticsService.track('project_preview_generated', {
        projectId,
        canPreview,
        missingAssetsCount: missingAssets.length,
        timestamp: Date.now(),
      });

      return {
        canPreview,
        missingAssets,
        previewUrl: canPreview ? `preview://${projectId}` : undefined,
      };

    } catch (error) {
      console.error('Error generating project preview:', error);
      throw error;
    }
  }

  // ===== 数据持久化 =====

  /**
   * 保存项目
   */
  private async saveProjects(): Promise<void> {
    try {
      const projects = Array.from(this.projects.values());
      await AsyncStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  }

  /**
   * 保存模板
   */
  private async saveTemplates(): Promise<void> {
    try {
      const templates = Array.from(this.templates.values());
      await AsyncStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取项目
   */
  getProject(projectId: string): ContentCreationProject | null {
    return this.projects.get(projectId) || null;
  }

  /**
   * 获取所有项目
   */
  getAllProjects(): ContentCreationProject[] {
    return Array.from(this.projects.values());
  }

  /**
   * 获取用户项目
   */
  getUserProjects(userId: string): ContentCreationProject[] {
    return Array.from(this.projects.values()).filter(project => project.createdBy === userId);
  }

  /**
   * 获取模板
   */
  getTemplate(templateId: string): ContentTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ContentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 获取主题模板
   */
  getTemplatesByTheme(theme: ContentTheme): ContentTemplate[] {
    return Array.from(this.templates.values()).filter(template => template.theme === theme);
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const project = this.projects.get(projectId);
      if (!project) return;

      // 删除项目文件
      const projectDir = `${this.ASSETS_DIR}${projectId}/`;
      const dirInfo = await FileSystem.getInfoAsync(projectDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(projectDir, { idempotent: true });
      }

      // 删除项目记录
      this.projects.delete(projectId);
      await this.saveProjects();

      this.analyticsService.track('content_project_deleted', {
        projectId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * 获取批量上传会话
   */
  getBulkUploadSession(sessionId: string): BulkUploadSession | null {
    return this.bulkUploadSessions.get(sessionId) || null;
  }
}

export default VisualContentCreationService;
