/**
 * SubtitleEngine - 动态字幕引擎
 * 提供动态关键词高亮效果：bounce（弹跳）、glow（发光）、pulse（脉冲）
 * 支持精确时间轴同步、多语言字幕、自定义样式配置
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 字幕片段
export interface SubtitleSegment {
  segmentId: string;
  text: string;
  startTime: number; // 秒
  endTime: number; // 秒
  
  // 关键词信息
  keywordId?: string;
  isKeyword: boolean;
  
  // 高亮效果
  highlightEffect?: 'bounce' | 'glow' | 'pulse' | 'none';
  highlightColor?: string;
  highlightIntensity?: number; // 0-1
  
  // 样式配置
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  
  // 动画配置
  animationDuration?: number; // ms
  animationDelay?: number; // ms
  animationEasing?: string;
}

// 字幕轨道
export interface SubtitleTrack {
  trackId: string;
  language: string; // 'en', 'zh-CN', etc.
  title: string;
  
  // 字幕片段
  segments: SubtitleSegment[];
  
  // 轨道配置
  isDefault: boolean;
  isActive: boolean;
  
  // 样式配置
  defaultStyle: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    opacity: number;
  };
  
  // 关键词高亮配置
  keywordHighlighting: {
    enabled: boolean;
    effects: ('bounce' | 'glow' | 'pulse')[];
    colors: { [effect: string]: string };
    intensities: { [effect: string]: number };
  };
}

// 高亮效果配置
export interface HighlightEffectConfig {
  effect: 'bounce' | 'glow' | 'pulse';
  
  // 动画参数
  duration: number; // ms
  delay: number; // ms
  iterations: number | 'infinite';
  easing: string;
  
  // 视觉参数
  color: string;
  intensity: number; // 0-1
  scale?: number; // for bounce
  glowRadius?: number; // for glow
  pulseOpacity?: [number, number]; // for pulse [min, max]
  
  // 触发条件
  triggerOnKeyword: boolean;
  triggerOnTime: boolean;
  triggerManually: boolean;
}

// 字幕引擎状态
export interface SubtitleEngineState {
  // 播放状态
  isPlaying: boolean;
  currentTime: number; // 秒
  duration: number; // 秒
  
  // 当前字幕
  currentSegment: SubtitleSegment | null;
  activeSegments: SubtitleSegment[]; // 可能同时显示多个
  
  // 轨道状态
  activeTrackId: string;
  availableTracks: SubtitleTrack[];
  
  // 高亮状态
  highlightedKeywords: string[];
  activeEffects: { [segmentId: string]: string }; // segmentId -> effect
  
  // 同步状态
  syncOffset: number; // ms，用于微调同步
  lastSyncTime: number;
}

// 字幕事件
export interface SubtitleEvent {
  eventId: string;
  eventType: 'segment_started' | 'segment_ended' | 'keyword_highlighted' | 'effect_triggered' | 'sync_adjusted';
  timestamp: string;
  
  // 事件数据
  segmentId?: string;
  keywordId?: string;
  effect?: string;
  syncOffset?: number;
  
  // 用户交互
  userId?: string;
  sessionId?: string;
}

class SubtitleEngine {
  private static instance: SubtitleEngine;
  private analyticsService = AnalyticsService.getInstance();
  
  // 状态管理
  private engineState: SubtitleEngineState;
  private subtitleTracks: Map<string, SubtitleTrack> = new Map();
  private effectConfigs: Map<string, HighlightEffectConfig> = new Map();
  private subtitleEvents: SubtitleEvent[] = [];
  
  // 定时器
  private playbackTimer: NodeJS.Timeout | null = null;
  private syncCheckInterval: NodeJS.Timeout | null = null;
  
  // 存储键
  private readonly TRACKS_KEY = 'subtitle_tracks';
  private readonly EFFECTS_KEY = 'highlight_effects';
  private readonly STATE_KEY = 'subtitle_engine_state';

  static getInstance(): SubtitleEngine {
    if (!SubtitleEngine.instance) {
      SubtitleEngine.instance = new SubtitleEngine();
    }
    return SubtitleEngine.instance;
  }

  constructor() {
    this.engineState = this.getDefaultState();
    this.initializeEngine();
  }

  // ===== 初始化 =====

  /**
   * 初始化字幕引擎
   */
  private async initializeEngine(): Promise<void> {
    try {
      await this.loadLocalData();
      this.initializeDefaultEffects();
      
      this.analyticsService.track('subtitle_engine_initialized', {
        tracksCount: this.subtitleTracks.size,
        effectsCount: this.effectConfigs.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing subtitle engine:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      const tracksData = await AsyncStorage.getItem(this.TRACKS_KEY);
      if (tracksData) {
        const tracks: SubtitleTrack[] = JSON.parse(tracksData);
        tracks.forEach(track => {
          this.subtitleTracks.set(track.trackId, track);
        });
      }

      const effectsData = await AsyncStorage.getItem(this.EFFECTS_KEY);
      if (effectsData) {
        const effects: HighlightEffectConfig[] = JSON.parse(effectsData);
        effects.forEach(effect => {
          this.effectConfigs.set(effect.effect, effect);
        });
      }

      const stateData = await AsyncStorage.getItem(this.STATE_KEY);
      if (stateData) {
        this.engineState = { ...this.engineState, ...JSON.parse(stateData) };
      }

    } catch (error) {
      console.error('Error loading subtitle data:', error);
    }
  }

  /**
   * 获取默认状态
   */
  private getDefaultState(): SubtitleEngineState {
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      currentSegment: null,
      activeSegments: [],
      activeTrackId: '',
      availableTracks: [],
      highlightedKeywords: [],
      activeEffects: {},
      syncOffset: 0,
      lastSyncTime: Date.now(),
    };
  }

  /**
   * 初始化默认高亮效果
   */
  private initializeDefaultEffects(): void {
    const defaultEffects: HighlightEffectConfig[] = [
      {
        effect: 'bounce',
        duration: 600,
        delay: 0,
        iterations: 1,
        easing: 'ease-out',
        color: '#fbbf24',
        intensity: 0.8,
        scale: 1.2,
        triggerOnKeyword: true,
        triggerOnTime: true,
        triggerManually: false,
      },
      {
        effect: 'glow',
        duration: 1000,
        delay: 100,
        iterations: 2,
        easing: 'ease-in-out',
        color: '#3b82f6',
        intensity: 0.9,
        glowRadius: 8,
        triggerOnKeyword: true,
        triggerOnTime: true,
        triggerManually: false,
      },
      {
        effect: 'pulse',
        duration: 800,
        delay: 0,
        iterations: 3,
        easing: 'ease-in-out',
        color: '#10b981',
        intensity: 0.7,
        pulseOpacity: [0.5, 1.0],
        triggerOnKeyword: true,
        triggerOnTime: true,
        triggerManually: false,
      },
    ];

    defaultEffects.forEach(effect => {
      if (!this.effectConfigs.has(effect.effect)) {
        this.effectConfigs.set(effect.effect, effect);
      }
    });
  }

  // ===== 核心功能 =====

  /**
   * 加载字幕轨道
   */
  async loadSubtitleTrack(
    trackId: string,
    language: string,
    segments: SubtitleSegment[],
    options: {
      title?: string;
      isDefault?: boolean;
      keywordHighlighting?: boolean;
    } = {}
  ): Promise<boolean> {
    try {
      const track: SubtitleTrack = {
        trackId,
        language,
        title: options.title || `${language} Subtitles`,
        segments: segments.map(segment => ({
          ...segment,
          highlightEffect: segment.highlightEffect || 'none',
          animationDuration: segment.animationDuration || 600,
          animationDelay: segment.animationDelay || 0,
          animationEasing: segment.animationEasing || 'ease-out',
        })),
        isDefault: options.isDefault || false,
        isActive: false,
        defaultStyle: {
          fontSize: 16,
          fontFamily: 'System',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          opacity: 1.0,
        },
        keywordHighlighting: {
          enabled: options.keywordHighlighting !== false,
          effects: ['bounce', 'glow', 'pulse'],
          colors: {
            bounce: '#fbbf24',
            glow: '#3b82f6',
            pulse: '#10b981',
          },
          intensities: {
            bounce: 0.8,
            glow: 0.9,
            pulse: 0.7,
          },
        },
      };

      this.subtitleTracks.set(trackId, track);
      this.engineState.availableTracks = Array.from(this.subtitleTracks.values());

      // 如果是默认轨道或第一个轨道，设为活动轨道
      if (track.isDefault || this.engineState.activeTrackId === '') {
        this.setActiveTrack(trackId);
      }

      await this.saveLocalData();

      this.analyticsService.track('subtitle_track_loaded', {
        trackId,
        language,
        segmentsCount: segments.length,
        keywordsCount: segments.filter(s => s.isKeyword).length,
        timestamp: Date.now(),
      });

      return true;

    } catch (error) {
      console.error('Error loading subtitle track:', error);
      return false;
    }
  }

  /**
   * 设置活动字幕轨道
   */
  setActiveTrack(trackId: string): boolean {
    const track = this.subtitleTracks.get(trackId);
    if (!track) return false;

    // 取消之前的活动轨道
    this.subtitleTracks.forEach(t => t.isActive = false);
    
    // 设置新的活动轨道
    track.isActive = true;
    this.engineState.activeTrackId = trackId;
    this.engineState.availableTracks = Array.from(this.subtitleTracks.values());

    return true;
  }

  /**
   * 更新播放时间并同步字幕
   */
  updatePlaybackTime(currentTime: number): void {
    this.engineState.currentTime = currentTime;
    this.engineState.lastSyncTime = Date.now();

    // 应用同步偏移
    const adjustedTime = currentTime + (this.engineState.syncOffset / 1000);

    // 查找当前应该显示的字幕片段
    const activeTrack = this.subtitleTracks.get(this.engineState.activeTrackId);
    if (!activeTrack) return;

    const currentSegments = activeTrack.segments.filter(segment => 
      adjustedTime >= segment.startTime && adjustedTime <= segment.endTime
    );

    // 更新当前片段
    const newCurrentSegment = currentSegments[0] || null;
    const previousSegment = this.engineState.currentSegment;

    if (newCurrentSegment?.segmentId !== previousSegment?.segmentId) {
      // 片段切换
      if (previousSegment) {
        this.recordEvent({
          eventType: 'segment_ended',
          segmentId: previousSegment.segmentId,
          keywordId: previousSegment.keywordId,
        });
      }

      if (newCurrentSegment) {
        this.recordEvent({
          eventType: 'segment_started',
          segmentId: newCurrentSegment.segmentId,
          keywordId: newCurrentSegment.keywordId,
        });

        // 触发关键词高亮效果
        if (newCurrentSegment.isKeyword && newCurrentSegment.highlightEffect && newCurrentSegment.highlightEffect !== 'none') {
          this.triggerHighlightEffect(newCurrentSegment);
        }
      }
    }

    this.engineState.currentSegment = newCurrentSegment;
    this.engineState.activeSegments = currentSegments;
  }

  /**
   * 触发高亮效果
   */
  private triggerHighlightEffect(segment: SubtitleSegment): void {
    if (!segment.highlightEffect || segment.highlightEffect === 'none') return;

    const effectConfig = this.effectConfigs.get(segment.highlightEffect);
    if (!effectConfig) return;

    // 记录效果触发
    this.engineState.activeEffects[segment.segmentId] = segment.highlightEffect;
    
    if (segment.keywordId && !this.engineState.highlightedKeywords.includes(segment.keywordId)) {
      this.engineState.highlightedKeywords.push(segment.keywordId);
    }

    this.recordEvent({
      eventType: 'effect_triggered',
      segmentId: segment.segmentId,
      keywordId: segment.keywordId,
      effect: segment.highlightEffect,
    });

    this.recordEvent({
      eventType: 'keyword_highlighted',
      segmentId: segment.segmentId,
      keywordId: segment.keywordId,
      effect: segment.highlightEffect,
    });

    // 设置效果清除定时器
    setTimeout(() => {
      delete this.engineState.activeEffects[segment.segmentId];
    }, effectConfig.duration + effectConfig.delay);

    this.analyticsService.track('subtitle_effect_triggered', {
      segmentId: segment.segmentId,
      keywordId: segment.keywordId,
      effect: segment.highlightEffect,
      currentTime: this.engineState.currentTime,
      timestamp: Date.now(),
    });
  }

  /**
   * 手动触发关键词高亮
   */
  manuallyHighlightKeyword(keywordId: string, effect: 'bounce' | 'glow' | 'pulse'): boolean {
    const activeTrack = this.subtitleTracks.get(this.engineState.activeTrackId);
    if (!activeTrack) return false;

    const keywordSegments = activeTrack.segments.filter(s => s.keywordId === keywordId);
    if (keywordSegments.length === 0) return false;

    keywordSegments.forEach(segment => {
      segment.highlightEffect = effect;
      this.triggerHighlightEffect(segment);
    });

    return true;
  }

  /**
   * 调整同步偏移
   */
  adjustSyncOffset(offsetMs: number): void {
    this.engineState.syncOffset = offsetMs;
    
    this.recordEvent({
      eventType: 'sync_adjusted',
      syncOffset: offsetMs,
    });

    this.analyticsService.track('subtitle_sync_adjusted', {
      syncOffset: offsetMs,
      currentTime: this.engineState.currentTime,
      timestamp: Date.now(),
    });
  }

  // ===== 辅助方法 =====

  private recordEvent(eventData: Omit<SubtitleEvent, 'eventId' | 'timestamp'>): void {
    const event: SubtitleEvent = {
      eventId: `subtitle_event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    this.subtitleEvents.push(event);

    // 保持事件历史在合理范围内
    if (this.subtitleEvents.length > 1000) {
      this.subtitleEvents = this.subtitleEvents.slice(-500);
    }
  }

  // ===== 数据持久化 =====

  private async saveLocalData(): Promise<void> {
    try {
      const tracks = Array.from(this.subtitleTracks.values());
      await AsyncStorage.setItem(this.TRACKS_KEY, JSON.stringify(tracks));

      const effects = Array.from(this.effectConfigs.values());
      await AsyncStorage.setItem(this.EFFECTS_KEY, JSON.stringify(effects));

      await AsyncStorage.setItem(this.STATE_KEY, JSON.stringify(this.engineState));

    } catch (error) {
      console.error('Error saving subtitle data:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取当前字幕状态
   */
  getCurrentState(): SubtitleEngineState {
    return { ...this.engineState };
  }

  /**
   * 获取当前显示的字幕文本
   */
  getCurrentSubtitleText(): string {
    return this.engineState.currentSegment?.text || '';
  }

  /**
   * 获取当前高亮的关键词
   */
  getCurrentHighlightedKeywords(): string[] {
    return [...this.engineState.highlightedKeywords];
  }

  /**
   * 获取可用的字幕轨道
   */
  getAvailableTracks(): SubtitleTrack[] {
    return Array.from(this.subtitleTracks.values());
  }

  /**
   * 获取高亮效果配置
   */
  getHighlightEffectConfig(effect: 'bounce' | 'glow' | 'pulse'): HighlightEffectConfig | null {
    return this.effectConfigs.get(effect) || null;
  }

  /**
   * 更新高亮效果配置
   */
  async updateHighlightEffectConfig(
    effect: 'bounce' | 'glow' | 'pulse',
    config: Partial<HighlightEffectConfig>
  ): Promise<void> {
    const currentConfig = this.effectConfigs.get(effect);
    if (currentConfig) {
      this.effectConfigs.set(effect, { ...currentConfig, ...config });
      await this.saveLocalData();
    }
  }

  /**
   * 清除所有高亮效果
   */
  clearAllHighlights(): void {
    this.engineState.highlightedKeywords = [];
    this.engineState.activeEffects = {};
  }

  /**
   * 获取字幕统计信息
   */
  getSubtitleStatistics(): {
    totalTracks: number;
    totalSegments: number;
    totalKeywords: number;
    effectsTriggered: number;
    averageSegmentDuration: number;
  } {
    const tracks = Array.from(this.subtitleTracks.values());
    const totalTracks = tracks.length;
    const totalSegments = tracks.reduce((sum, track) => sum + track.segments.length, 0);
    const totalKeywords = tracks.reduce((sum, track) => 
      sum + track.segments.filter(s => s.isKeyword).length, 0
    );
    
    const effectEvents = this.subtitleEvents.filter(e => e.eventType === 'effect_triggered');
    const effectsTriggered = effectEvents.length;

    const allSegments = tracks.flatMap(track => track.segments);
    const averageSegmentDuration = allSegments.length > 0 ?
      allSegments.reduce((sum, s) => sum + (s.endTime - s.startTime), 0) / allSegments.length : 0;

    return {
      totalTracks,
      totalSegments,
      totalKeywords,
      effectsTriggered,
      averageSegmentDuration,
    };
  }
}

export default SubtitleEngine;
