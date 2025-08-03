/**
 * SoundDesignService - V2 声音设计和音频反馈系统
 * 提供完整的音频体验：音效管理、背景音乐、情感化反馈
 * 支持主题化音效、音频设置、性能优化
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import { ContentTheme } from './ContentManagementService';

// 音效类型
export type SoundEffectType = 
  | 'bingo'              // 正确选择的"宾果"音效
  | 'incorrect'          // 错误选择音效
  | 'badge_unlock'       // 徽章解锁庆祝音效
  | 'achievement'        // 成就达成音效
  | 'magic_moment'       // 魔法时刻音效
  | 'aqua_points'        // Aqua积分获得音效
  | 'progress_advance'   // 进度推进音效
  | 'focus_mode_enter'   // 进入专注模式音效
  | 'rescue_mode_enter'  // 进入救援模式音效
  | 'key_collect'        // 声音钥匙收集音效
  | 'level_complete'     // 关卡完成音效
  | 'streak_bonus'       // 连击奖励音效
  | 'notification'       // 通知音效
  | 'button_tap'         // 按钮点击音效
  | 'swipe'              // 滑动音效
  | 'transition';        // 页面转换音效

// 背景音乐类型
export type BackgroundMusicType = 
  | 'daily_life'         // 日常生活主题音乐
  | 'business'           // 商务主题音乐
  | 'travel'             // 旅行主题音乐
  | 'culture'            // 文化主题音乐
  | 'technology'         // 科技主题音乐
  | 'learning'           // 学习专用音乐
  | 'review'             // 复习专用音乐
  | 'celebration'        // 庆祝音乐
  | 'ambient';           // 环境音乐

// 音频设置
export interface AudioSettings {
  // 总体设置
  masterVolume: number; // 0-1
  soundEffectsEnabled: boolean;
  backgroundMusicEnabled: boolean;
  
  // 音效设置
  soundEffectsVolume: number; // 0-1
  feedbackSoundsEnabled: boolean;
  achievementSoundsEnabled: boolean;
  uiSoundsEnabled: boolean;
  
  // 背景音乐设置
  backgroundMusicVolume: number; // 0-1
  adaptiveMusic: boolean; // 根据学习状态自动切换
  musicFadeEnabled: boolean;
  
  // 高级设置
  spatialAudio: boolean;
  audioQuality: 'low' | 'medium' | 'high';
  preloadAudio: boolean;
  
  // 情境设置
  quietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
    quietVolume: number; // 0-1
  };
}

// 音频资源
interface AudioResource {
  id: string;
  type: SoundEffectType | BackgroundMusicType;
  url: string;
  duration: number; // milliseconds
  volume: number; // 0-1
  loop: boolean;
  preload: boolean;
  
  // 加载状态
  sound?: Audio.Sound;
  isLoaded: boolean;
  isLoading: boolean;
  loadError?: string;
}

// 音频播放选项
interface PlayOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: number; // milliseconds
  fadeOut?: number; // milliseconds
  delay?: number; // milliseconds
  interrupt?: boolean; // 是否中断当前播放
}

// 音频播放状态
interface AudioPlaybackState {
  currentBackgroundMusic?: {
    type: BackgroundMusicType;
    sound: Audio.Sound;
    volume: number;
  };
  
  activeSoundEffects: Map<string, {
    sound: Audio.Sound;
    startTime: number;
  }>;
  
  isBackgroundMusicPlaying: boolean;
  isMuted: boolean;
}

class SoundDesignService {
  private static instance: SoundDesignService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 音频资源管理
  private audioResources: Map<string, AudioResource> = new Map();
  private playbackState: AudioPlaybackState = {
    activeSoundEffects: new Map(),
    isBackgroundMusicPlaying: false,
    isMuted: false,
  };
  
  // 用户设置
  private audioSettings: AudioSettings = this.getDefaultSettings();
  
  // 存储键
  private readonly SETTINGS_KEY = 'audio_settings';

  static getInstance(): SoundDesignService {
    if (!SoundDesignService.instance) {
      SoundDesignService.instance = new SoundDesignService();
    }
    return SoundDesignService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化声音设计服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 配置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        playThroughEarpieceAndroid: false,
      });

      // 加载用户设置
      await this.loadAudioSettings();
      
      // 初始化音频资源
      this.initializeAudioResources();
      
      // 预加载关键音效
      await this.preloadCriticalSounds();
      
      this.analyticsService.track('sound_design_service_initialized', {
        soundEffectsEnabled: this.audioSettings.soundEffectsEnabled,
        backgroundMusicEnabled: this.audioSettings.backgroundMusicEnabled,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing sound design service:', error);
    }
  }

  /**
   * 获取默认音频设置
   */
  private getDefaultSettings(): AudioSettings {
    return {
      masterVolume: 0.8,
      soundEffectsEnabled: true,
      backgroundMusicEnabled: true,
      soundEffectsVolume: 0.9,
      feedbackSoundsEnabled: true,
      achievementSoundsEnabled: true,
      uiSoundsEnabled: true,
      backgroundMusicVolume: 0.6,
      adaptiveMusic: true,
      musicFadeEnabled: true,
      spatialAudio: false,
      audioQuality: 'medium',
      preloadAudio: true,
      quietHours: {
        enabled: false,
        startHour: 22,
        endHour: 8,
        quietVolume: 0.3,
      },
    };
  }

  /**
   * 加载音频设置
   */
  private async loadAudioSettings(): Promise<void> {
    try {
      const settingsData = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsData) {
        const savedSettings = JSON.parse(settingsData);
        this.audioSettings = { ...this.getDefaultSettings(), ...savedSettings };
      }
    } catch (error) {
      console.error('Error loading audio settings:', error);
    }
  }

  /**
   * 初始化音频资源
   */
  private initializeAudioResources(): void {
    // 音效资源
    const soundEffects: { type: SoundEffectType; url: string; volume: number; preload: boolean }[] = [
      { type: 'bingo', url: 'https://api.smartalk.app/audio/effects/bingo.mp3', volume: 0.8, preload: true },
      { type: 'incorrect', url: 'https://api.smartalk.app/audio/effects/incorrect.mp3', volume: 0.6, preload: true },
      { type: 'badge_unlock', url: 'https://api.smartalk.app/audio/effects/badge_unlock.mp3', volume: 0.9, preload: true },
      { type: 'achievement', url: 'https://api.smartalk.app/audio/effects/achievement.mp3', volume: 0.9, preload: true },
      { type: 'magic_moment', url: 'https://api.smartalk.app/audio/effects/magic_moment.mp3', volume: 1.0, preload: true },
      { type: 'aqua_points', url: 'https://api.smartalk.app/audio/effects/aqua_points.mp3', volume: 0.7, preload: true },
      { type: 'progress_advance', url: 'https://api.smartalk.app/audio/effects/progress.mp3', volume: 0.6, preload: false },
      { type: 'focus_mode_enter', url: 'https://api.smartalk.app/audio/effects/focus_enter.mp3', volume: 0.5, preload: false },
      { type: 'rescue_mode_enter', url: 'https://api.smartalk.app/audio/effects/rescue_enter.mp3', volume: 0.7, preload: false },
      { type: 'key_collect', url: 'https://api.smartalk.app/audio/effects/key_collect.mp3', volume: 0.8, preload: true },
      { type: 'level_complete', url: 'https://api.smartalk.app/audio/effects/level_complete.mp3', volume: 0.9, preload: false },
      { type: 'streak_bonus', url: 'https://api.smartalk.app/audio/effects/streak_bonus.mp3', volume: 0.8, preload: false },
      { type: 'notification', url: 'https://api.smartalk.app/audio/effects/notification.mp3', volume: 0.6, preload: false },
      { type: 'button_tap', url: 'https://api.smartalk.app/audio/effects/button_tap.mp3', volume: 0.4, preload: true },
      { type: 'swipe', url: 'https://api.smartalk.app/audio/effects/swipe.mp3', volume: 0.3, preload: false },
      { type: 'transition', url: 'https://api.smartalk.app/audio/effects/transition.mp3', volume: 0.5, preload: false },
    ];

    // 背景音乐资源
    const backgroundMusic: { type: BackgroundMusicType; url: string; volume: number }[] = [
      { type: 'daily_life', url: 'https://api.smartalk.app/audio/music/daily_life.mp3', volume: 0.4 },
      { type: 'business', url: 'https://api.smartalk.app/audio/music/business.mp3', volume: 0.4 },
      { type: 'travel', url: 'https://api.smartalk.app/audio/music/travel.mp3', volume: 0.4 },
      { type: 'culture', url: 'https://api.smartalk.app/audio/music/culture.mp3', volume: 0.4 },
      { type: 'technology', url: 'https://api.smartalk.app/audio/music/technology.mp3', volume: 0.4 },
      { type: 'learning', url: 'https://api.smartalk.app/audio/music/learning.mp3', volume: 0.3 },
      { type: 'review', url: 'https://api.smartalk.app/audio/music/review.mp3', volume: 0.3 },
      { type: 'celebration', url: 'https://api.smartalk.app/audio/music/celebration.mp3', volume: 0.6 },
      { type: 'ambient', url: 'https://api.smartalk.app/audio/music/ambient.mp3', volume: 0.2 },
    ];

    // 注册音效资源
    soundEffects.forEach(effect => {
      const resource: AudioResource = {
        id: `effect_${effect.type}`,
        type: effect.type,
        url: effect.url,
        duration: 2000, // 默认2秒
        volume: effect.volume,
        loop: false,
        preload: effect.preload,
        isLoaded: false,
        isLoading: false,
      };
      this.audioResources.set(resource.id, resource);
    });

    // 注册背景音乐资源
    backgroundMusic.forEach(music => {
      const resource: AudioResource = {
        id: `music_${music.type}`,
        type: music.type,
        url: music.url,
        duration: 180000, // 默认3分钟
        volume: music.volume,
        loop: true,
        preload: false,
        isLoaded: false,
        isLoading: false,
      };
      this.audioResources.set(resource.id, resource);
    });
  }

  /**
   * 预加载关键音效
   */
  private async preloadCriticalSounds(): Promise<void> {
    if (!this.audioSettings.preloadAudio) return;

    const criticalSounds = Array.from(this.audioResources.values())
      .filter(resource => resource.preload);

    const loadPromises = criticalSounds.map(resource => this.loadAudioResource(resource));
    
    try {
      await Promise.allSettled(loadPromises);
    } catch (error) {
      console.error('Error preloading critical sounds:', error);
    }
  }

  /**
   * 加载音频资源
   */
  private async loadAudioResource(resource: AudioResource): Promise<void> {
    if (resource.isLoaded || resource.isLoading) return;

    try {
      resource.isLoading = true;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: resource.url },
        { shouldPlay: false, volume: 0 }
      );

      resource.sound = sound;
      resource.isLoaded = true;
      resource.isLoading = false;

    } catch (error) {
      resource.isLoading = false;
      resource.loadError = error.message;
      console.error(`Error loading audio resource ${resource.id}:`, error);
    }
  }

  // ===== 音效播放 =====

  /**
   * 播放音效
   */
  async playSoundEffect(type: SoundEffectType, options: PlayOptions = {}): Promise<void> {
    if (!this.audioSettings.soundEffectsEnabled || this.playbackState.isMuted) return;

    try {
      const resourceId = `effect_${type}`;
      const resource = this.audioResources.get(resourceId);
      
      if (!resource) {
        console.warn(`Sound effect not found: ${type}`);
        return;
      }

      // 加载资源（如果未加载）
      if (!resource.isLoaded) {
        await this.loadAudioResource(resource);
      }

      if (!resource.sound) return;

      // 计算音量
      const effectiveVolume = this.calculateEffectiveVolume(
        resource.volume,
        this.audioSettings.soundEffectsVolume,
        options.volume
      );

      // 播放音效
      await resource.sound.setVolumeAsync(effectiveVolume);
      await resource.sound.setPositionAsync(0);
      await resource.sound.playAsync();

      // 记录活跃音效
      const playbackId = `${type}_${Date.now()}`;
      this.playbackState.activeSoundEffects.set(playbackId, {
        sound: resource.sound,
        startTime: Date.now(),
      });

      // 设置播放完成回调
      resource.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.playbackState.activeSoundEffects.delete(playbackId);
        }
      });

      this.analyticsService.track('sound_effect_played', {
        type,
        volume: effectiveVolume,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error(`Error playing sound effect ${type}:`, error);
    }
  }

  /**
   * 播放背景音乐
   */
  async playBackgroundMusic(type: BackgroundMusicType, options: PlayOptions = {}): Promise<void> {
    if (!this.audioSettings.backgroundMusicEnabled || this.playbackState.isMuted) return;

    try {
      // 停止当前背景音乐
      await this.stopBackgroundMusic();

      const resourceId = `music_${type}`;
      const resource = this.audioResources.get(resourceId);
      
      if (!resource) {
        console.warn(`Background music not found: ${type}`);
        return;
      }

      // 加载资源
      if (!resource.isLoaded) {
        await this.loadAudioResource(resource);
      }

      if (!resource.sound) return;

      // 计算音量
      const effectiveVolume = this.calculateEffectiveVolume(
        resource.volume,
        this.audioSettings.backgroundMusicVolume,
        options.volume
      );

      // 设置循环播放
      await resource.sound.setIsLoopingAsync(true);
      await resource.sound.setVolumeAsync(effectiveVolume);
      await resource.sound.playAsync();

      // 更新播放状态
      this.playbackState.currentBackgroundMusic = {
        type,
        sound: resource.sound,
        volume: effectiveVolume,
      };
      this.playbackState.isBackgroundMusicPlaying = true;

      this.analyticsService.track('background_music_started', {
        type,
        volume: effectiveVolume,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error(`Error playing background music ${type}:`, error);
    }
  }

  /**
   * 停止背景音乐
   */
  async stopBackgroundMusic(): Promise<void> {
    if (!this.playbackState.currentBackgroundMusic) return;

    try {
      const { sound } = this.playbackState.currentBackgroundMusic;
      await sound.stopAsync();
      
      this.playbackState.currentBackgroundMusic = undefined;
      this.playbackState.isBackgroundMusicPlaying = false;

    } catch (error) {
      console.error('Error stopping background music:', error);
    }
  }

  /**
   * 计算有效音量
   */
  private calculateEffectiveVolume(
    baseVolume: number,
    categoryVolume: number,
    optionVolume?: number
  ): number {
    let volume = baseVolume * categoryVolume * this.audioSettings.masterVolume;
    
    if (optionVolume !== undefined) {
      volume *= optionVolume;
    }

    // 检查静默时间
    if (this.isInQuietHours()) {
      volume *= this.audioSettings.quietHours.quietVolume;
    }

    return Math.max(0, Math.min(1, volume));
  }

  /**
   * 检查是否在静默时间
   */
  private isInQuietHours(): boolean {
    if (!this.audioSettings.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const { startHour, endHour } = this.audioSettings.quietHours;

    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      // 跨越午夜
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  // ===== 主题化音效 =====

  /**
   * 根据主题播放背景音乐
   */
  async playThemeMusic(theme: ContentTheme): Promise<void> {
    const musicType: BackgroundMusicType = theme as BackgroundMusicType;
    await this.playBackgroundMusic(musicType);
  }

  /**
   * 播放学习状态音乐
   */
  async playLearningStateMusic(state: 'learning' | 'review' | 'celebration'): Promise<void> {
    const musicType: BackgroundMusicType = state;
    await this.playBackgroundMusic(musicType);
  }

  // ===== 设置管理 =====

  /**
   * 更新音频设置
   */
  async updateAudioSettings(settings: Partial<AudioSettings>): Promise<void> {
    try {
      this.audioSettings = { ...this.audioSettings, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.audioSettings));

      // 应用音量变化
      if (this.playbackState.currentBackgroundMusic) {
        const newVolume = this.calculateEffectiveVolume(
          this.playbackState.currentBackgroundMusic.volume,
          this.audioSettings.backgroundMusicVolume
        );
        await this.playbackState.currentBackgroundMusic.sound.setVolumeAsync(newVolume);
      }

      this.analyticsService.track('audio_settings_updated', {
        changes: Object.keys(settings),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating audio settings:', error);
    }
  }

  /**
   * 获取音频设置
   */
  getAudioSettings(): AudioSettings {
    return { ...this.audioSettings };
  }

  /**
   * 静音/取消静音
   */
  async toggleMute(): Promise<void> {
    this.playbackState.isMuted = !this.playbackState.isMuted;
    
    if (this.playbackState.isMuted) {
      // 静音所有音频
      if (this.playbackState.currentBackgroundMusic) {
        await this.playbackState.currentBackgroundMusic.sound.setVolumeAsync(0);
      }
    } else {
      // 恢复音量
      if (this.playbackState.currentBackgroundMusic) {
        const volume = this.calculateEffectiveVolume(
          this.playbackState.currentBackgroundMusic.volume,
          this.audioSettings.backgroundMusicVolume
        );
        await this.playbackState.currentBackgroundMusic.sound.setVolumeAsync(volume);
      }
    }

    this.analyticsService.track('audio_mute_toggled', {
      isMuted: this.playbackState.isMuted,
      timestamp: Date.now(),
    });
  }

  // ===== 公共API =====

  /**
   * 获取播放状态
   */
  getPlaybackState(): AudioPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    try {
      // 停止所有音频
      await this.stopBackgroundMusic();
      
      // 卸载所有音频资源
      for (const resource of this.audioResources.values()) {
        if (resource.sound) {
          await resource.sound.unloadAsync();
        }
      }

      this.audioResources.clear();
      this.playbackState.activeSoundEffects.clear();

    } catch (error) {
      console.error('Error cleaning up audio resources:', error);
    }
  }
}

export default SoundDesignService;
