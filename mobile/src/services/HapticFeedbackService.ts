/**
 * HapticFeedbackService - V2 触觉反馈和动画系统
 * 提供完整的触觉体验：振动反馈、动画效果、粒子系统
 * 支持成就动画、进度可视化、流畅过渡效果
 */

import * as Haptics from 'expo-haptics';
import { Animated, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';

// 触觉反馈类型
export type HapticFeedbackType = 
  | 'light'              // 轻微振动（按钮点击）
  | 'medium'             // 中等振动（选择反馈）
  | 'heavy'              // 强烈振动（错误反馈）
  | 'success'            // 成功振动（正确答案）
  | 'warning'            // 警告振动（提示）
  | 'error'              // 错误振动（失败）
  | 'selection'          // 选择振动（滑动选择）
  | 'impact_light'       // 轻微冲击
  | 'impact_medium'      // 中等冲击
  | 'impact_heavy'       // 强烈冲击
  | 'notification'       // 通知振动
  | 'achievement';       // 成就振动

// 动画类型
export type AnimationType = 
  | 'key_collect'        // 声音钥匙收集动画
  | 'badge_unlock'       // 徽章解锁动画
  | 'progress_advance'   // 进度条增长动画
  | 'level_complete'     // 关卡完成动画
  | 'streak_bonus'       // 连击奖励动画
  | 'aqua_points'        // Aqua积分动画
  | 'magic_moment'       // 魔法时刻动画
  | 'screen_transition'  // 屏幕转换动画
  | 'button_press'       // 按钮按压动画
  | 'card_flip'          // 卡片翻转动画
  | 'particle_burst'     // 粒子爆发动画
  | 'glow_effect'        // 发光效果动画
  | 'bounce'             // 弹跳动画
  | 'scale_pulse'        // 缩放脉冲动画
  | 'fade_transition';   // 淡入淡出动画

// 触觉设置
export interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0-1
  
  // 分类设置
  feedbackEnabled: boolean;      // 反馈振动
  achievementEnabled: boolean;   // 成就振动
  uiEnabled: boolean;           // UI交互振动
  errorEnabled: boolean;        // 错误振动
  
  // 高级设置
  adaptiveIntensity: boolean;   // 自适应强度
  quietHours: {
    enabled: boolean;
    startHour: number;
    endHour: number;
  };
}

// 动画配置
export interface AnimationConfig {
  duration: number;
  easing: any;
  delay?: number;
  loop?: boolean;
  autoReverse?: boolean;
  
  // 动画参数
  scale?: { from: number; to: number };
  opacity?: { from: number; to: number };
  rotation?: { from: number; to: number };
  translation?: { x?: number; y?: number };
  
  // 粒子效果参数
  particles?: {
    count: number;
    colors: string[];
    size: { min: number; max: number };
    velocity: { min: number; max: number };
    gravity: number;
  };
}

// 动画实例
export interface AnimationInstance {
  id: string;
  type: AnimationType;
  animatedValue: Animated.Value | Animated.ValueXY;
  config: AnimationConfig;
  isRunning: boolean;
  onComplete?: () => void;
}

class HapticFeedbackService {
  private static instance: HapticFeedbackService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 设置和状态
  private hapticSettings: HapticSettings = this.getDefaultSettings();
  private activeAnimations: Map<string, AnimationInstance> = new Map();
  
  // 存储键
  private readonly SETTINGS_KEY = 'haptic_settings';

  static getInstance(): HapticFeedbackService {
    if (!HapticFeedbackService.instance) {
      HapticFeedbackService.instance = new HapticFeedbackService();
    }
    return HapticFeedbackService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化触觉反馈服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载用户设置
      await this.loadHapticSettings();
      
      this.analyticsService.track('haptic_feedback_service_initialized', {
        enabled: this.hapticSettings.enabled,
        intensity: this.hapticSettings.intensity,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing haptic feedback service:', error);
    }
  }

  /**
   * 获取默认触觉设置
   */
  private getDefaultSettings(): HapticSettings {
    return {
      enabled: true,
      intensity: 0.8,
      feedbackEnabled: true,
      achievementEnabled: true,
      uiEnabled: true,
      errorEnabled: true,
      adaptiveIntensity: true,
      quietHours: {
        enabled: false,
        startHour: 22,
        endHour: 8,
      },
    };
  }

  /**
   * 加载触觉设置
   */
  private async loadHapticSettings(): Promise<void> {
    try {
      const settingsData = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (settingsData) {
        const savedSettings = JSON.parse(settingsData);
        this.hapticSettings = { ...this.getDefaultSettings(), ...savedSettings };
      }
    } catch (error) {
      console.error('Error loading haptic settings:', error);
    }
  }

  // ===== 触觉反馈 =====

  /**
   * 触发触觉反馈
   */
  async triggerHapticFeedback(type: HapticFeedbackType): Promise<void> {
    if (!this.hapticSettings.enabled || this.isInQuietHours()) return;

    try {
      // 检查分类设置
      if (!this.shouldTriggerHaptic(type)) return;

      // 映射到Expo Haptics类型
      switch (type) {
        case 'light':
        case 'selection':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
          
        case 'medium':
        case 'impact_medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
          
        case 'heavy':
        case 'impact_heavy':
        case 'error':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
          
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
          
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
          
        case 'notification':
          await Haptics.selectionAsync();
          break;
          
        case 'achievement':
          // 特殊的成就振动模式
          await this.triggerAchievementHaptic();
          break;
          
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      this.analyticsService.track('haptic_feedback_triggered', {
        type,
        intensity: this.hapticSettings.intensity,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error(`Error triggering haptic feedback ${type}:`, error);
    }
  }

  /**
   * 触发成就振动
   */
  private async triggerAchievementHaptic(): Promise<void> {
    try {
      // 成就振动序列：轻-重-轻
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Error triggering achievement haptic:', error);
    }
  }

  /**
   * 检查是否应该触发触觉反馈
   */
  private shouldTriggerHaptic(type: HapticFeedbackType): boolean {
    switch (type) {
      case 'success':
      case 'selection':
        return this.hapticSettings.feedbackEnabled;
        
      case 'achievement':
      case 'notification':
        return this.hapticSettings.achievementEnabled;
        
      case 'light':
      case 'medium':
      case 'button_press':
        return this.hapticSettings.uiEnabled;
        
      case 'error':
      case 'warning':
      case 'heavy':
        return this.hapticSettings.errorEnabled;
        
      default:
        return true;
    }
  }

  /**
   * 检查是否在静默时间
   */
  private isInQuietHours(): boolean {
    if (!this.hapticSettings.quietHours.enabled) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const { startHour, endHour } = this.hapticSettings.quietHours;

    if (startHour <= endHour) {
      return currentHour >= startHour && currentHour < endHour;
    } else {
      return currentHour >= startHour || currentHour < endHour;
    }
  }

  // ===== 动画系统 =====

  /**
   * 创建动画
   */
  createAnimation(
    type: AnimationType,
    config: Partial<AnimationConfig> = {}
  ): AnimationInstance {
    const animationId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 获取默认配置
    const defaultConfig = this.getDefaultAnimationConfig(type);
    const finalConfig = { ...defaultConfig, ...config };
    
    // 创建动画值
    const animatedValue = this.createAnimatedValue(type, finalConfig);
    
    const animation: AnimationInstance = {
      id: animationId,
      type,
      animatedValue,
      config: finalConfig,
      isRunning: false,
    };

    this.activeAnimations.set(animationId, animation);
    return animation;
  }

  /**
   * 获取默认动画配置
   */
  private getDefaultAnimationConfig(type: AnimationType): AnimationConfig {
    const configs: { [key in AnimationType]: AnimationConfig } = {
      key_collect: {
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        scale: { from: 0, to: 1 },
        opacity: { from: 0, to: 1 },
        particles: {
          count: 12,
          colors: ['#fbbf24', '#f59e0b', '#d97706'],
          size: { min: 4, max: 8 },
          velocity: { min: 50, max: 150 },
          gravity: 0.5,
        },
      },
      
      badge_unlock: {
        duration: 1200,
        easing: Easing.out(Easing.elastic(1)),
        scale: { from: 0, to: 1 },
        rotation: { from: -180, to: 0 },
        particles: {
          count: 20,
          colors: ['#3b82f6', '#1d4ed8', '#1e40af'],
          size: { min: 6, max: 12 },
          velocity: { min: 100, max: 200 },
          gravity: 0.3,
        },
      },
      
      progress_advance: {
        duration: 600,
        easing: Easing.out(Easing.quad),
        scale: { from: 1, to: 1.05 },
        autoReverse: true,
      },
      
      level_complete: {
        duration: 1500,
        easing: Easing.out(Easing.back(1.2)),
        scale: { from: 0.8, to: 1 },
        opacity: { from: 0, to: 1 },
        particles: {
          count: 30,
          colors: ['#10b981', '#059669', '#047857'],
          size: { min: 8, max: 16 },
          velocity: { min: 150, max: 300 },
          gravity: 0.2,
        },
      },
      
      streak_bonus: {
        duration: 800,
        easing: Easing.out(Easing.bounce),
        scale: { from: 1, to: 1.2 },
        autoReverse: true,
      },
      
      aqua_points: {
        duration: 500,
        easing: Easing.out(Easing.cubic),
        translation: { y: -50 },
        opacity: { from: 1, to: 0 },
      },
      
      magic_moment: {
        duration: 2000,
        easing: Easing.out(Easing.sin),
        scale: { from: 1, to: 1.1 },
        opacity: { from: 0.8, to: 1 },
        loop: true,
        autoReverse: true,
      },
      
      screen_transition: {
        duration: 300,
        easing: Easing.out(Easing.quad),
        opacity: { from: 0, to: 1 },
      },
      
      button_press: {
        duration: 150,
        easing: Easing.out(Easing.quad),
        scale: { from: 1, to: 0.95 },
        autoReverse: true,
      },
      
      card_flip: {
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        rotation: { from: 0, to: 180 },
      },
      
      particle_burst: {
        duration: 1000,
        easing: Easing.out(Easing.quad),
        particles: {
          count: 15,
          colors: ['#ef4444', '#dc2626', '#b91c1c'],
          size: { min: 4, max: 10 },
          velocity: { min: 80, max: 180 },
          gravity: 0.4,
        },
      },
      
      glow_effect: {
        duration: 1000,
        easing: Easing.inOut(Easing.sin),
        opacity: { from: 0.5, to: 1 },
        loop: true,
        autoReverse: true,
      },
      
      bounce: {
        duration: 400,
        easing: Easing.out(Easing.bounce),
        scale: { from: 1, to: 1.1 },
        autoReverse: true,
      },
      
      scale_pulse: {
        duration: 800,
        easing: Easing.inOut(Easing.quad),
        scale: { from: 1, to: 1.05 },
        loop: true,
        autoReverse: true,
      },
      
      fade_transition: {
        duration: 250,
        easing: Easing.out(Easing.quad),
        opacity: { from: 0, to: 1 },
      },
    };

    return configs[type];
  }

  /**
   * 创建动画值
   */
  private createAnimatedValue(type: AnimationType, config: AnimationConfig): Animated.Value | Animated.ValueXY {
    if (config.translation) {
      return new Animated.ValueXY({ x: 0, y: 0 });
    } else {
      return new Animated.Value(config.scale?.from || config.opacity?.from || config.rotation?.from || 0);
    }
  }

  /**
   * 播放动画
   */
  playAnimation(animationId: string, onComplete?: () => void): void {
    const animation = this.activeAnimations.get(animationId);
    if (!animation || animation.isRunning) return;

    animation.isRunning = true;
    animation.onComplete = onComplete;

    const { config, animatedValue } = animation;
    
    // 创建动画序列
    const animations: Animated.CompositeAnimation[] = [];

    if (config.scale) {
      animations.push(
        Animated.timing(animatedValue as Animated.Value, {
          toValue: config.scale.to,
          duration: config.duration,
          easing: config.easing,
          delay: config.delay,
          useNativeDriver: true,
        })
      );
    }

    if (config.opacity) {
      animations.push(
        Animated.timing(animatedValue as Animated.Value, {
          toValue: config.opacity.to,
          duration: config.duration,
          easing: config.easing,
          delay: config.delay,
          useNativeDriver: true,
        })
      );
    }

    if (config.rotation) {
      animations.push(
        Animated.timing(animatedValue as Animated.Value, {
          toValue: config.rotation.to,
          duration: config.duration,
          easing: config.easing,
          delay: config.delay,
          useNativeDriver: true,
        })
      );
    }

    if (config.translation) {
      animations.push(
        Animated.timing(animatedValue as Animated.ValueXY, {
          toValue: { x: config.translation.x || 0, y: config.translation.y || 0 },
          duration: config.duration,
          easing: config.easing,
          delay: config.delay,
          useNativeDriver: true,
        })
      );
    }

    // 执行动画
    let finalAnimation: Animated.CompositeAnimation;

    if (animations.length === 1) {
      finalAnimation = animations[0];
    } else {
      finalAnimation = Animated.parallel(animations);
    }

    // 处理循环和自动反转
    if (config.loop) {
      finalAnimation = Animated.loop(finalAnimation, { iterations: -1 });
    }

    finalAnimation.start((finished) => {
      animation.isRunning = false;
      if (finished && onComplete) {
        onComplete();
      }
    });

    this.analyticsService.track('animation_played', {
      type: animation.type,
      duration: config.duration,
      timestamp: Date.now(),
    });
  }

  /**
   * 停止动画
   */
  stopAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (!animation) return;

    animation.animatedValue.stopAnimation();
    animation.isRunning = false;
  }

  /**
   * 清理动画
   */
  cleanupAnimation(animationId: string): void {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      this.stopAnimation(animationId);
      this.activeAnimations.delete(animationId);
    }
  }

  // ===== 预设动画组合 =====

  /**
   * 播放声音钥匙收集动画
   */
  async playKeyCollectAnimation(onComplete?: () => void): Promise<string> {
    const animation = this.createAnimation('key_collect');
    
    // 触发触觉反馈
    await this.triggerHapticFeedback('success');
    
    // 播放动画
    this.playAnimation(animation.id, onComplete);
    
    return animation.id;
  }

  /**
   * 播放徽章解锁动画
   */
  async playBadgeUnlockAnimation(onComplete?: () => void): Promise<string> {
    const animation = this.createAnimation('badge_unlock');
    
    // 触发成就触觉反馈
    await this.triggerHapticFeedback('achievement');
    
    // 播放动画
    this.playAnimation(animation.id, onComplete);
    
    return animation.id;
  }

  /**
   * 播放进度条增长动画
   */
  async playProgressAdvanceAnimation(onComplete?: () => void): Promise<string> {
    const animation = this.createAnimation('progress_advance');
    
    // 触发轻微触觉反馈
    await this.triggerHapticFeedback('light');
    
    // 播放动画
    this.playAnimation(animation.id, onComplete);
    
    return animation.id;
  }

  // ===== 设置管理 =====

  /**
   * 更新触觉设置
   */
  async updateHapticSettings(settings: Partial<HapticSettings>): Promise<void> {
    try {
      this.hapticSettings = { ...this.hapticSettings, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.hapticSettings));

      this.analyticsService.track('haptic_settings_updated', {
        changes: Object.keys(settings),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating haptic settings:', error);
    }
  }

  /**
   * 获取触觉设置
   */
  getHapticSettings(): HapticSettings {
    return { ...this.hapticSettings };
  }

  // ===== 公共API =====

  /**
   * 获取活跃动画
   */
  getActiveAnimations(): AnimationInstance[] {
    return Array.from(this.activeAnimations.values());
  }

  /**
   * 清理所有动画
   */
  cleanupAllAnimations(): void {
    this.activeAnimations.forEach((animation, id) => {
      this.cleanupAnimation(id);
    });
  }
}

export default HapticFeedbackService;
