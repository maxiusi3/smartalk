/**
 * EnhancedVideoPlayerService - V2 增强视频播放器服务
 * 提供完整的视频播放体验：双模式支持、字幕引擎、剧院模式
 * 支持智能预加载、质量自适应、沉浸式播放体验
 *
 * 双模式架构：
 * - Teaser Mode: 带字幕的预览模式，展示完整学习内容
 * - Magic Moment Mode: 无字幕的测试模式，用于情景猜义练习
 * - 智能模式切换和状态管理
 */

import { AnalyticsService } from './AnalyticsService';
import ContentManagementService, { ContentItem } from './ContentManagementService';
import PerformanceOptimizationService from './PerformanceOptimizationService';
import SubtitleEngine, { SubtitleTrack } from './SubtitleEngine';

// 视频播放模式（扩展现有定义）

// 双模式配置
export interface DualModeConfig {
  // Teaser模式配置
  teaserMode: {
    showSubtitles: boolean;
    enableKeywordHighlighting: boolean;
    showProgressBar: boolean;
    allowSeeking: boolean;
    showControls: boolean;
    autoPlay: boolean;
  };

  // Magic Moment模式配置
  magicMomentMode: {
    showSubtitles: boolean; // 始终false
    hideKeywords: boolean; // 始终true
    showProgressBar: boolean;
    allowSeeking: boolean;
    showControls: boolean;
    autoPlay: boolean;

    // 特殊功能
    enableContextGuessing: boolean;
    showVideoOptions: boolean;
    highlightCorrectOption: boolean; // Focus Mode集成
  };

  // 模式切换
  modeSwitching: {
    allowUserSwitch: boolean;
    switchAnimation: 'fade' | 'slide' | 'none';
    switchDuration: number; // ms
    confirmBeforeSwitch: boolean;
  };
}

// 视频播放状态（扩展）
export interface EnhancedVideoPlayerState {
  // 基本播放状态
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;

  // 双模式状态
  currentMode: VideoPlayerMode;
  previousMode?: VideoPlayerMode;
  modeTransitioning: boolean;

  // 字幕状态
  subtitlesEnabled: boolean;
  currentSubtitleTrack?: string;
  keywordHighlightingEnabled: boolean;

  // 交互状态
  userInteracting: boolean;
  lastInteractionTime: number;

  // 学习状态
  contextGuessingActive: boolean;
  videoOptionsVisible: boolean;
  correctOptionHighlighted: boolean;

  // 性能状态
  bufferHealth: number; // 0-100
  loadingProgress: number; // 0-100
  qualityLevel: string;
}

// 模式切换事件
export interface ModeTransitionEvent {
  eventId: string;
  fromMode: VideoPlayerMode;
  toMode: VideoPlayerMode;
  triggeredBy: 'user' | 'system' | 'learning_flow';
  timestamp: string;

  // 上下文信息
  userId?: string;
  contentId?: string;
  currentTime: number;

  // 学习相关
  learningPhase?: 'preview' | 'context_guessing' | 'pronunciation_training';
  userProgress?: number; // 0-100
}

// 播放模式
export type VideoPlayerMode = 
  | 'teaser'        // 预告模式：30秒预览，显示字幕高亮
  | 'magic_moment'  // 魔法时刻：完整播放，无字幕沉浸体验
  | 'learning'      // 学习模式：支持暂停、重播、字幕控制
  | 'theater';      // 剧院模式：全屏无干扰播放

// 视频质量级别
export type VideoQuality = 
  | 'auto'
  | '240p'
  | '360p'
  | '480p'
  | '720p'
  | '1080p';

// 字幕高亮效果
export type SubtitleEffect = 
  | 'bounce'
  | 'glow'
  | 'pulse'
  | 'fade'
  | 'scale';

// 播放状态
export interface VideoPlayerState {
  // 基本状态
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  hasError: boolean;
  
  // 播放进度
  currentTime: number; // seconds
  duration: number; // seconds
  progress: number; // 0-1
  
  // 播放配置
  mode: VideoPlayerMode;
  quality: VideoQuality;
  volume: number; // 0-1
  playbackRate: number; // 0.5-2.0
  
  // 字幕状态
  subtitlesEnabled: boolean;
  currentSubtitle: SubtitleItem | null;
  highlightedKeywords: string[];
  
  // 网络状态
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  bufferHealth: number; // 0-1
}

// 字幕项目
export interface SubtitleItem {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  text: string;
  keywords: string[]; // 需要高亮的关键词
  effect?: SubtitleEffect;
  position?: 'bottom' | 'center' | 'top';
}

// 视频源配置
export interface VideoSource {
  id: string;
  url: string;
  quality: VideoQuality;
  size: number; // bytes
  duration: number; // seconds
  
  // 元数据
  metadata: {
    codec: string;
    bitrate: number;
    framerate: number;
    resolution: string;
  };
  
  // 字幕配置
  subtitles?: {
    enabled: boolean;
    url?: string;
    items: SubtitleItem[];
  };
}

// 预加载配置
export interface PreloadConfig {
  enabled: boolean;
  strategy: 'aggressive' | 'conservative' | 'adaptive';
  maxCacheSize: number; // MB
  preloadNext: boolean;
  preloadPrevious: boolean;
}

// 播放器配置
export interface VideoPlayerConfig {
  mode: VideoPlayerMode;
  autoplay: boolean;
  loop: boolean;
  muted: boolean;
  controls: boolean;
  
  // 质量配置
  quality: VideoQuality;
  adaptiveQuality: boolean;
  
  // 字幕配置
  subtitles: {
    enabled: boolean;
    effect: SubtitleEffect;
    fontSize: number;
    color: string;
    backgroundColor: string;
  };
  
  // 预加载配置
  preload: PreloadConfig;
  
  // 剧院模式配置
  theaterMode: {
    vignetteEffect: boolean;
    autoStart: boolean;
    hideUI: boolean;
    immersiveTransition: boolean;
  };
}

// 播放事件
export interface VideoPlayerEvent {
  type: 'play' | 'pause' | 'ended' | 'error' | 'progress' | 'quality_change' | 'subtitle_change';
  timestamp: number;
  data?: any;
}

// 播放器实例
export interface VideoPlayerInstance {
  id: string;
  contentId: string;
  config: VideoPlayerConfig;
  state: VideoPlayerState;
  sources: VideoSource[];
  
  // 控制方法
  play(): Promise<void>;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setPlaybackRate(rate: number): void;
  setQuality(quality: VideoQuality): void;
  toggleSubtitles(): void;
  enterTheaterMode(): void;
  exitTheaterMode(): void;
  
  // 事件监听
  addEventListener(type: string, listener: (event: VideoPlayerEvent) => void): void;
  removeEventListener(type: string, listener: (event: VideoPlayerEvent) => void): void;
}

class EnhancedVideoPlayerService {
  private static instance: EnhancedVideoPlayerService;
  private analyticsService = AnalyticsService.getInstance();
  private contentService = ContentManagementService.getInstance();
  private performanceService = PerformanceOptimizationService.getInstance();
  private subtitleEngine = SubtitleEngine.getInstance();

  // 双模式管理
  private currentPlayerState: EnhancedVideoPlayerState;
  private dualModeConfig: DualModeConfig;
  private modeTransitionEvents: ModeTransitionEvent[] = [];
  
  // 播放器实例管理
  private players: Map<string, VideoPlayerInstance> = new Map();
  private activePlayer: VideoPlayerInstance | null = null;
  
  // 预加载缓存
  private preloadCache: Map<string, VideoSource> = new Map();
  private cacheSize: number = 0; // MB
  private maxCacheSize: number = 100; // MB
  
  // 网络质量监控
  private networkQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'good';
  private qualityCheckInterval: NodeJS.Timeout | null = null;

  static getInstance(): EnhancedVideoPlayerService {
    if (!EnhancedVideoPlayerService.instance) {
      EnhancedVideoPlayerService.instance = new EnhancedVideoPlayerService();
    }
    return EnhancedVideoPlayerService.instance;
  }



  constructor() {
    // 初始化双模式配置
    this.dualModeConfig = this.getDefaultDualModeConfig();
    this.currentPlayerState = this.getDefaultPlayerState();
    this.initializeService();
  }

  /**
   * 获取默认双模式配置
   */
  private getDefaultDualModeConfig(): DualModeConfig {
    return {
      teaserMode: {
        showSubtitles: true,
        enableKeywordHighlighting: true,
        showProgressBar: true,
        allowSeeking: true,
        showControls: true,
        autoPlay: false,
      },
      magicMomentMode: {
        showSubtitles: false, // 关键：Magic Moment模式不显示字幕
        hideKeywords: true,
        showProgressBar: false,
        allowSeeking: false,
        showControls: false,
        autoPlay: true,
        enableContextGuessing: true,
        showVideoOptions: true,
        highlightCorrectOption: false, // 由Focus Mode控制
      },
      modeSwitching: {
        allowUserSwitch: true,
        switchAnimation: 'fade',
        switchDuration: 300,
        confirmBeforeSwitch: false,
      },
    };
  }

  /**
   * 获取默认播放器状态
   */
  private getDefaultPlayerState(): EnhancedVideoPlayerState {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1.0,
      currentMode: 'teaser', // 默认Teaser模式
      modeTransitioning: false,
      subtitlesEnabled: true,
      keywordHighlightingEnabled: true,
      userInteracting: false,
      lastInteractionTime: 0,
      contextGuessingActive: false,
      videoOptionsVisible: false,
      correctOptionHighlighted: false,
      bufferHealth: 100,
      loadingProgress: 0,
      qualityLevel: 'auto',
    };
  }

  // ===== 双模式核心功能 =====

  /**
   * 切换视频播放模式
   */
  async switchVideoMode(
    playerId: string,
    targetMode: VideoPlayerMode,
    options: {
      triggeredBy?: 'user' | 'system' | 'learning_flow';
      userId?: string;
      contentId?: string;
      learningPhase?: 'preview' | 'context_guessing' | 'pronunciation_training';
    } = {}
  ): Promise<boolean> {
    try {
      const currentMode = this.currentPlayerState.currentMode;

      if (currentMode === targetMode) {
        return true; // 已经是目标模式
      }

      // 检查是否允许切换
      if (!this.dualModeConfig.modeSwitching.allowUserSwitch && options.triggeredBy === 'user') {
        console.warn('User mode switching is disabled');
        return false;
      }

      // 开始模式转换
      this.currentPlayerState.modeTransitioning = true;
      this.currentPlayerState.previousMode = currentMode;

      // 记录转换事件
      const transitionEvent: ModeTransitionEvent = {
        eventId: `transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromMode: currentMode,
        toMode: targetMode,
        triggeredBy: options.triggeredBy || 'system',
        timestamp: new Date().toISOString(),
        userId: options.userId,
        contentId: options.contentId,
        currentTime: this.currentPlayerState.currentTime,
        learningPhase: options.learningPhase,
      };

      this.modeTransitionEvents.push(transitionEvent);

      // 执行模式切换逻辑
      await this.executeModeSwitching(currentMode, targetMode);

      // 更新播放器状态
      this.currentPlayerState.currentMode = targetMode;
      this.currentPlayerState.modeTransitioning = false;

      // 分析追踪
      this.analyticsService.track('video_mode_switched', {
        playerId,
        fromMode: currentMode,
        toMode: targetMode,
        triggeredBy: options.triggeredBy,
        userId: options.userId,
        contentId: options.contentId,
        currentTime: this.currentPlayerState.currentTime,
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error switching video mode:', error);
      this.currentPlayerState.modeTransitioning = false;
      return false;
    }
  }

  /**
   * 执行模式切换逻辑
   */
  private async executeModeSwitching(
    fromMode: VideoPlayerMode,
    toMode: VideoPlayerMode
  ): Promise<void> {
    const switchDuration = this.dualModeConfig.modeSwitching.switchDuration;

    // 根据目标模式配置播放器
    if (toMode === 'teaser') {
      // 切换到Teaser模式
      this.currentPlayerState.subtitlesEnabled = this.dualModeConfig.teaserMode.showSubtitles;
      this.currentPlayerState.keywordHighlightingEnabled = this.dualModeConfig.teaserMode.enableKeywordHighlighting;
      this.currentPlayerState.contextGuessingActive = false;
      this.currentPlayerState.videoOptionsVisible = false;

      // 启用字幕引擎
      if (this.currentPlayerState.subtitlesEnabled) {
        // 这里应该调用字幕引擎的启用方法
        // this.subtitleEngine.enableSubtitles();
      }

    } else if (toMode === 'magic_moment') {
      // 切换到Magic Moment模式
      this.currentPlayerState.subtitlesEnabled = false; // 关键：禁用字幕
      this.currentPlayerState.keywordHighlightingEnabled = false;
      this.currentPlayerState.contextGuessingActive = this.dualModeConfig.magicMomentMode.enableContextGuessing;
      this.currentPlayerState.videoOptionsVisible = this.dualModeConfig.magicMomentMode.showVideoOptions;

      // 禁用字幕引擎
      // this.subtitleEngine.disableSubtitles();

      // 清除所有高亮效果
      // this.subtitleEngine.clearAllHighlights();
    }

    // 执行切换动画
    if (this.dualModeConfig.modeSwitching.switchAnimation !== 'none') {
      await this.playModeSwitchAnimation(fromMode, toMode, switchDuration);
    }
  }

  /**
   * 播放模式切换动画
   */
  private async playModeSwitchAnimation(
    fromMode: VideoPlayerMode,
    toMode: VideoPlayerMode,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const animationType = this.dualModeConfig.modeSwitching.switchAnimation;

      // 这里应该实现实际的动画逻辑
      // 例如淡入淡出、滑动等效果

      setTimeout(() => {
        resolve();
      }, duration);
    });
  }

  /**
   * 获取当前播放模式
   */
  getCurrentVideoMode(): VideoPlayerMode {
    return this.currentPlayerState.currentMode;
  }

  /**
   * 检查是否为Teaser模式
   */
  isTeaserMode(): boolean {
    return this.currentPlayerState.currentMode === 'teaser';
  }

  /**
   * 检查是否为Magic Moment模式
   */
  isMagicMomentMode(): boolean {
    return this.currentPlayerState.currentMode === 'magic_moment';
  }

  // ===== 初始化 =====

  /**
   * 初始化视频播放器服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 开始网络质量监控
      this.startNetworkQualityMonitoring();
      
      // 初始化预加载缓存
      this.initializePreloadCache();
      
      this.analyticsService.track('enhanced_video_player_initialized', {
        maxCacheSize: this.maxCacheSize,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing enhanced video player service:', error);
    }
  }

  /**
   * 开始网络质量监控
   */
  private startNetworkQualityMonitoring(): void {
    this.qualityCheckInterval = setInterval(() => {
      this.checkNetworkQuality();
    }, 5000); // 每5秒检查一次
  }

  /**
   * 检查网络质量
   */
  private async checkNetworkQuality(): Promise<void> {
    try {
      // 模拟网络质量检测
      // 在实际应用中，这里会进行真实的网络测试
      const startTime = Date.now();
      
      // 模拟网络请求
      await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
      
      const responseTime = Date.now() - startTime;
      
      // 根据响应时间判断网络质量
      if (responseTime < 100) {
        this.networkQuality = 'excellent';
      } else if (responseTime < 200) {
        this.networkQuality = 'good';
      } else if (responseTime < 500) {
        this.networkQuality = 'fair';
      } else {
        this.networkQuality = 'poor';
      }

      // 更新所有播放器的网络状态
      this.players.forEach(player => {
        player.state.networkQuality = this.networkQuality;
        
        // 根据网络质量自动调整视频质量
        if (player.config.adaptiveQuality) {
          this.adaptVideoQuality(player);
        }
      });

    } catch (error) {
      console.error('Error checking network quality:', error);
      this.networkQuality = 'poor';
    }
  }

  /**
   * 初始化预加载缓存
   */
  private initializePreloadCache(): void {
    // 清理过期缓存
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // 每分钟清理一次
  }

  // ===== 播放器管理 =====

  /**
   * 创建播放器实例
   */
  async createPlayer(
    contentId: string,
    config: Partial<VideoPlayerConfig> = {}
  ): Promise<VideoPlayerInstance> {
    try {
      const content = await this.contentService.getContentById(contentId);
      if (!content) {
        throw new Error(`Content not found: ${contentId}`);
      }

      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const defaultConfig: VideoPlayerConfig = {
        mode: 'learning',
        autoplay: false,
        loop: false,
        muted: false,
        controls: true,
        quality: 'auto',
        adaptiveQuality: true,
        subtitles: {
          enabled: true,
          effect: 'glow',
          fontSize: 16,
          color: '#FFFFFF',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
        },
        preload: {
          enabled: true,
          strategy: 'adaptive',
          maxCacheSize: 50,
          preloadNext: true,
          preloadPrevious: false,
        },
        theaterMode: {
          vignetteEffect: true,
          autoStart: true,
          hideUI: true,
          immersiveTransition: true,
        },
      };

      const playerConfig = { ...defaultConfig, ...config };
      
      // 生成视频源
      const sources = await this.generateVideoSources(content);
      
      const player: VideoPlayerInstance = {
        id: playerId,
        contentId,
        config: playerConfig,
        state: {
          isPlaying: false,
          isPaused: false,
          isLoading: false,
          isBuffering: false,
          hasError: false,
          currentTime: 0,
          duration: 0,
          progress: 0,
          mode: playerConfig.mode,
          quality: playerConfig.quality,
          volume: 1,
          playbackRate: 1,
          subtitlesEnabled: playerConfig.subtitles.enabled,
          currentSubtitle: null,
          highlightedKeywords: [],
          networkQuality: this.networkQuality,
          bufferHealth: 0,
        },
        sources,
        
        // 控制方法
        play: () => this.playVideo(playerId),
        pause: () => this.pauseVideo(playerId),
        stop: () => this.stopVideo(playerId),
        seek: (time: number) => this.seekVideo(playerId, time),
        setVolume: (volume: number) => this.setVolume(playerId, volume),
        setPlaybackRate: (rate: number) => this.setPlaybackRate(playerId, rate),
        setQuality: (quality: VideoQuality) => this.setVideoQuality(playerId, quality),
        toggleSubtitles: () => this.toggleSubtitles(playerId),
        enterTheaterMode: () => this.enterTheaterMode(playerId),
        exitTheaterMode: () => this.exitTheaterMode(playerId),
        
        // 事件监听（简化实现）
        addEventListener: (type: string, listener: (event: VideoPlayerEvent) => void) => {
          // 实际实现中会有完整的事件系统
        },
        removeEventListener: (type: string, listener: (event: VideoPlayerEvent) => void) => {
          // 实际实现中会有完整的事件系统
        },
      };

      this.players.set(playerId, player);

      // 预加载视频
      if (playerConfig.preload.enabled) {
        await this.preloadVideo(player);
      }

      this.analyticsService.track('video_player_created', {
        playerId,
        contentId,
        mode: playerConfig.mode,
        timestamp: Date.now(),
      });

      return player;

    } catch (error) {
      console.error('Error creating video player:', error);
      throw error;
    }
  }

  /**
   * 生成视频源
   */
  private async generateVideoSources(content: ContentItem): Promise<VideoSource[]> {
    const sources: VideoSource[] = [];
    
    // 根据内容生成不同质量的视频源
    const qualities: VideoQuality[] = ['240p', '360p', '480p', '720p'];
    
    qualities.forEach((quality, index) => {
      sources.push({
        id: `${content.id}_${quality}`,
        url: `${content.videoUrl}?quality=${quality}`,
        quality,
        size: 1024 * 1024 * (index + 1) * 2, // 模拟文件大小
        duration: content.duration || 30,
        metadata: {
          codec: 'h264',
          bitrate: 500 + index * 500,
          framerate: 30,
          resolution: quality,
        },
        subtitles: {
          enabled: true,
          items: this.generateSubtitles(content),
        },
      });
    });

    return sources;
  }

  /**
   * 生成字幕
   */
  private generateSubtitles(content: ContentItem): SubtitleItem[] {
    // 模拟字幕生成
    // 在实际应用中，这些数据会来自内容管理系统
    const subtitles: SubtitleItem[] = [];
    
    if (content.keywords) {
      content.keywords.forEach((keyword, index) => {
        subtitles.push({
          id: `subtitle_${index}`,
          startTime: index * 6, // 每6秒一个字幕
          endTime: (index + 1) * 6,
          text: `Learning "${keyword}" in context`,
          keywords: [keyword],
          effect: 'glow',
          position: 'bottom',
        });
      });
    }

    return subtitles;
  }

  // ===== 播放控制 =====

  /**
   * 播放视频
   */
  private async playVideo(playerId: string): Promise<void> {
    const player = this.players.get(playerId);
    if (!player) return;

    try {
      player.state.isLoading = true;
      player.state.hasError = false;

      // 模拟播放开始
      await new Promise(resolve => setTimeout(resolve, 500));

      player.state.isPlaying = true;
      player.state.isPaused = false;
      player.state.isLoading = false;
      
      this.activePlayer = player;

      // 开始播放进度更新
      this.startProgressTracking(player);

      this.analyticsService.track('video_play_started', {
        playerId,
        contentId: player.contentId,
        mode: player.state.mode,
        timestamp: Date.now(),
      });

    } catch (error) {
      player.state.hasError = true;
      player.state.isLoading = false;
      console.error('Error playing video:', error);
    }
  }

  /**
   * 暂停视频
   */
  private pauseVideo(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.isPlaying = false;
    player.state.isPaused = true;

    this.analyticsService.track('video_paused', {
      playerId,
      currentTime: player.state.currentTime,
      timestamp: Date.now(),
    });
  }

  /**
   * 停止视频
   */
  private stopVideo(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.isPlaying = false;
    player.state.isPaused = false;
    player.state.currentTime = 0;
    player.state.progress = 0;

    if (this.activePlayer?.id === playerId) {
      this.activePlayer = null;
    }
  }

  /**
   * 跳转到指定时间
   */
  private seekVideo(playerId: string, time: number): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.currentTime = Math.max(0, Math.min(time, player.state.duration));
    player.state.progress = player.state.duration > 0 ? player.state.currentTime / player.state.duration : 0;

    // 更新当前字幕
    this.updateCurrentSubtitle(player);
  }

  /**
   * 开始播放进度跟踪
   */
  private startProgressTracking(player: VideoPlayerInstance): void {
    const updateProgress = () => {
      if (!player.state.isPlaying) return;

      player.state.currentTime += 0.1;
      player.state.progress = player.state.duration > 0 ? player.state.currentTime / player.state.duration : 0;

      // 更新当前字幕
      this.updateCurrentSubtitle(player);

      // 检查是否播放结束
      if (player.state.currentTime >= player.state.duration) {
        player.state.isPlaying = false;
        player.state.currentTime = player.state.duration;
        player.state.progress = 1;
        
        this.analyticsService.track('video_ended', {
          playerId: player.id,
          duration: player.state.duration,
          timestamp: Date.now(),
        });
        
        return;
      }

      setTimeout(updateProgress, 100); // 每100ms更新一次
    };

    updateProgress();
  }

  /**
   * 更新当前字幕
   */
  private updateCurrentSubtitle(player: VideoPlayerInstance): void {
    if (!player.state.subtitlesEnabled || !player.sources[0]?.subtitles?.items) return;

    const currentTime = player.state.currentTime;
    const subtitle = player.sources[0].subtitles.items.find(
      item => currentTime >= item.startTime && currentTime <= item.endTime
    );

    player.state.currentSubtitle = subtitle || null;
    player.state.highlightedKeywords = subtitle?.keywords || [];
  }

  // ===== 质量自适应 =====

  /**
   * 自适应视频质量
   */
  private adaptVideoQuality(player: VideoPlayerInstance): void {
    if (!player.config.adaptiveQuality) return;

    let targetQuality: VideoQuality;

    switch (this.networkQuality) {
      case 'excellent':
        targetQuality = '720p';
        break;
      case 'good':
        targetQuality = '480p';
        break;
      case 'fair':
        targetQuality = '360p';
        break;
      case 'poor':
        targetQuality = '240p';
        break;
      default:
        targetQuality = '360p';
    }

    if (player.state.quality !== targetQuality) {
      this.setVideoQuality(player.id, targetQuality);
    }
  }

  /**
   * 设置视频质量
   */
  private setVideoQuality(playerId: string, quality: VideoQuality): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.quality = quality;

    this.analyticsService.track('video_quality_changed', {
      playerId,
      quality,
      networkQuality: this.networkQuality,
      timestamp: Date.now(),
    });
  }

  // ===== 预加载管理 =====

  /**
   * 预加载视频
   */
  private async preloadVideo(player: VideoPlayerInstance): Promise<void> {
    try {
      const source = player.sources.find(s => s.quality === player.state.quality) || player.sources[0];
      if (!source) return;

      // 检查缓存空间
      if (this.cacheSize + source.size / (1024 * 1024) > this.maxCacheSize) {
        this.cleanupCache();
      }

      // 模拟预加载
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.preloadCache.set(source.id, source);
      this.cacheSize += source.size / (1024 * 1024);

      this.analyticsService.track('video_preloaded', {
        playerId: player.id,
        sourceId: source.id,
        quality: source.quality,
        size: source.size,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error preloading video:', error);
    }
  }

  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    // 简单的LRU清理策略
    if (this.cacheSize > this.maxCacheSize * 0.8) {
      const itemsToRemove = Math.floor(this.preloadCache.size * 0.3);
      const keys = Array.from(this.preloadCache.keys()).slice(0, itemsToRemove);
      
      keys.forEach(key => {
        const source = this.preloadCache.get(key);
        if (source) {
          this.cacheSize -= source.size / (1024 * 1024);
          this.preloadCache.delete(key);
        }
      });
    }
  }

  // ===== 剧院模式 =====

  /**
   * 进入剧院模式
   */
  private enterTheaterMode(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.mode = 'theater';
    player.config.controls = false;

    this.analyticsService.track('theater_mode_entered', {
      playerId,
      timestamp: Date.now(),
    });
  }

  /**
   * 退出剧院模式
   */
  private exitTheaterMode(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.mode = 'learning';
    player.config.controls = true;

    this.analyticsService.track('theater_mode_exited', {
      playerId,
      timestamp: Date.now(),
    });
  }

  // ===== 其他控制方法 =====

  private setVolume(playerId: string, volume: number): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.volume = Math.max(0, Math.min(1, volume));
  }

  private setPlaybackRate(playerId: string, rate: number): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.playbackRate = Math.max(0.5, Math.min(2, rate));
  }

  private toggleSubtitles(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.state.subtitlesEnabled = !player.state.subtitlesEnabled;
    player.config.subtitles.enabled = player.state.subtitlesEnabled;
  }

  // ===== 公共API =====

  /**
   * 获取播放器实例
   */
  getPlayer(playerId: string): VideoPlayerInstance | null {
    return this.players.get(playerId) || null;
  }

  /**
   * 获取活跃播放器
   */
  getActivePlayer(): VideoPlayerInstance | null {
    return this.activePlayer;
  }

  /**
   * 销毁播放器
   */
  destroyPlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (player) {
      this.stopVideo(playerId);
      this.players.delete(playerId);
      
      if (this.activePlayer?.id === playerId) {
        this.activePlayer = null;
      }
    }
  }

  /**
   * 获取网络质量
   */
  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    return this.networkQuality;
  }

  /**
   * 获取缓存状态
   */
  getCacheStatus(): { size: number; maxSize: number; usage: number } {
    return {
      size: this.cacheSize,
      maxSize: this.maxCacheSize,
      usage: this.cacheSize / this.maxCacheSize,
    };
  }

  /**
   * 清理所有资源
   */
  cleanup(): void {
    // 停止所有播放器
    this.players.forEach((player, playerId) => {
      this.destroyPlayer(playerId);
    });

    // 清理缓存
    this.preloadCache.clear();
    this.cacheSize = 0;

    // 停止网络质量监控
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }
  }
}

export default EnhancedVideoPlayerService;
