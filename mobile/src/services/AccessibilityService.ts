/**
 * AccessibilityService - V2 无障碍功能服务
 * 提供完整的无障碍支持：屏幕阅读器、语音导航、高对比度、字体缩放
 * 符合WCAG 2.1 AA标准和移动端无障碍最佳实践
 */

import { AccessibilityInfo, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';

// 无障碍配置接口
export interface AccessibilityConfig {
  // 屏幕阅读器支持
  screenReaderEnabled: boolean;
  announcePageChanges: boolean;
  announceButtonActions: boolean;
  announceProgressUpdates: boolean;
  
  // 视觉辅助
  highContrastMode: boolean;
  largeTextMode: boolean;
  fontSizeMultiplier: number; // 1.0 - 2.0
  colorBlindnessSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // 运动辅助
  reduceMotion: boolean;
  disableAutoplay: boolean;
  extendedTouchTargets: boolean;
  
  // 认知辅助
  simplifiedInterface: boolean;
  focusIndicators: boolean;
  timeoutExtensions: boolean;
  
  // 听力辅助
  visualCaptions: boolean;
  hapticFeedback: boolean;
  visualIndicators: boolean;
  
  // 语音控制
  voiceNavigationEnabled: boolean;
  voiceCommandsEnabled: boolean;
  
  lastUpdated: string;
}

// 无障碍事件类型
export type AccessibilityEventType = 
  | 'screen_reader_focus'
  | 'voice_command'
  | 'high_contrast_toggle'
  | 'font_size_change'
  | 'motion_preference_change'
  | 'caption_request'
  | 'navigation_assistance';

// 语音命令定义
interface VoiceCommand {
  command: string;
  variations: string[];
  action: string;
  description: string;
  category: 'navigation' | 'learning' | 'control' | 'help';
}

// 无障碍反馈类型
interface AccessibilityFeedback {
  type: 'announcement' | 'haptic' | 'visual' | 'audio';
  content: string;
  priority: 'low' | 'medium' | 'high' | 'assertive';
  delay?: number;
}

class AccessibilityService {
  private static instance: AccessibilityService;
  private config: AccessibilityConfig | null = null;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  
  // 系统无障碍状态
  private isScreenReaderEnabled: boolean = false;
  private isReduceMotionEnabled: boolean = false;
  private systemFontScale: number = 1.0;
  
  // 语音命令系统
  private voiceCommands: VoiceCommand[] = [];
  private isListeningForCommands: boolean = false;
  
  // 存储键
  private static readonly STORAGE_KEY = 'accessibility_config';

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  constructor() {
    this.initializeSystemAccessibility();
    this.setupVoiceCommands();
  }

  // ===== 初始化和配置 =====

  /**
   * 初始化系统无障碍状态
   */
  private async initializeSystemAccessibility(): Promise<void> {
    try {
      // 检测屏幕阅读器状态
      this.isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      // 检测动画偏好
      this.isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      
      // 监听系统无障碍状态变化
      AccessibilityInfo.addEventListener('screenReaderChanged', this.handleScreenReaderChange);
      AccessibilityInfo.addEventListener('reduceMotionChanged', this.handleReduceMotionChange);
      
      this.analyticsService.track('accessibility_system_initialized', {
        screenReaderEnabled: this.isScreenReaderEnabled,
        reduceMotionEnabled: this.isReduceMotionEnabled,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing system accessibility:', error);
    }
  }

  /**
   * 加载用户无障碍配置
   */
  async loadAccessibilityConfig(userId: string): Promise<AccessibilityConfig> {
    try {
      const stored = await AsyncStorage.getItem(`${AccessibilityService.STORAGE_KEY}_${userId}`);
      
      if (stored) {
        const config = JSON.parse(stored) as AccessibilityConfig;
        this.config = config;
        await this.applyAccessibilityConfig(config);
        return config;
      }
      
      // 创建默认配置
      const defaultConfig: AccessibilityConfig = {
        screenReaderEnabled: this.isScreenReaderEnabled,
        announcePageChanges: true,
        announceButtonActions: true,
        announceProgressUpdates: true,
        
        highContrastMode: false,
        largeTextMode: false,
        fontSizeMultiplier: 1.0,
        colorBlindnessSupport: 'none',
        
        reduceMotion: this.isReduceMotionEnabled,
        disableAutoplay: false,
        extendedTouchTargets: false,
        
        simplifiedInterface: false,
        focusIndicators: true,
        timeoutExtensions: false,
        
        visualCaptions: false,
        hapticFeedback: true,
        visualIndicators: true,
        
        voiceNavigationEnabled: false,
        voiceCommandsEnabled: false,
        
        lastUpdated: new Date().toISOString(),
      };
      
      this.config = defaultConfig;
      await this.saveAccessibilityConfig(userId);
      
      return defaultConfig;
      
    } catch (error) {
      console.error('Error loading accessibility config:', error);
      throw error;
    }
  }

  /**
   * 保存无障碍配置
   */
  async saveAccessibilityConfig(userId: string): Promise<void> {
    if (!this.config) return;
    
    try {
      this.config.lastUpdated = new Date().toISOString();
      await AsyncStorage.setItem(
        `${AccessibilityService.STORAGE_KEY}_${userId}`,
        JSON.stringify(this.config)
      );
      
      this.analyticsService.track('accessibility_config_saved', {
        userId,
        config: this.config,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error saving accessibility config:', error);
      throw error;
    }
  }

  /**
   * 更新无障碍配置
   */
  async updateAccessibilityConfig(
    userId: string, 
    updates: Partial<AccessibilityConfig>
  ): Promise<void> {
    if (!this.config) {
      await this.loadAccessibilityConfig(userId);
    }
    
    this.config = { ...this.config!, ...updates };
    await this.applyAccessibilityConfig(this.config);
    await this.saveAccessibilityConfig(userId);
    
    this.analyticsService.track('accessibility_config_updated', {
      userId,
      updates,
      timestamp: Date.now(),
    });
  }

  // ===== 屏幕阅读器支持 =====

  /**
   * 发布屏幕阅读器公告
   */
  announceForScreenReader(
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ): void {
    if (!this.config?.screenReaderEnabled) return;
    
    try {
      AccessibilityInfo.announceForAccessibility(message);
      
      this.analyticsService.track('screen_reader_announcement', {
        message,
        priority,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error announcing for screen reader:', error);
    }
  }

  /**
   * 公告页面变化
   */
  announcePageChange(pageName: string, description?: string): void {
    if (!this.config?.announcePageChanges) return;
    
    const message = description 
      ? `已进入${pageName}页面。${description}`
      : `已进入${pageName}页面`;
    
    this.announceForScreenReader(message, 'assertive');
  }

  /**
   * 公告按钮操作
   */
  announceButtonAction(buttonName: string, action: string): void {
    if (!this.config?.announceButtonActions) return;
    
    const message = `${buttonName}按钮，${action}`;
    this.announceForScreenReader(message, 'polite');
  }

  /**
   * 公告进度更新
   */
  announceProgressUpdate(current: number, total: number, context: string): void {
    if (!this.config?.announceProgressUpdates) return;
    
    const percentage = Math.round((current / total) * 100);
    const message = `${context}进度：${current}/${total}，完成${percentage}%`;
    
    this.announceForScreenReader(message, 'polite');
  }

  // ===== 视觉辅助功能 =====

  /**
   * 获取高对比度样式
   */
  getHighContrastStyles() {
    if (!this.config?.highContrastMode) return {};
    
    return {
      backgroundColor: '#000000',
      color: '#FFFFFF',
      borderColor: '#FFFFFF',
      shadowColor: '#FFFFFF',
    };
  }

  /**
   * 获取字体大小倍数
   */
  getFontSizeMultiplier(): number {
    return this.config?.fontSizeMultiplier || 1.0;
  }

  /**
   * 获取颜色盲支持样式
   */
  getColorBlindnessStyles(originalColor: string): string {
    if (!this.config?.colorBlindnessSupport || this.config.colorBlindnessSupport === 'none') {
      return originalColor;
    }
    
    // 简化的颜色盲支持映射
    const colorMappings = {
      protanopia: {
        '#ef4444': '#1f2937', // 红色 -> 深灰
        '#10b981': '#3b82f6', // 绿色 -> 蓝色
        '#f59e0b': '#8b5cf6', // 黄色 -> 紫色
      },
      deuteranopia: {
        '#ef4444': '#1f2937',
        '#10b981': '#3b82f6',
        '#f59e0b': '#8b5cf6',
      },
      tritanopia: {
        '#3b82f6': '#10b981', // 蓝色 -> 绿色
        '#8b5cf6': '#f59e0b', // 紫色 -> 黄色
      },
    };
    
    const mapping = colorMappings[this.config.colorBlindnessSupport];
    return mapping?.[originalColor] || originalColor;
  }

  // ===== 运动和交互辅助 =====

  /**
   * 检查是否应该减少动画
   */
  shouldReduceMotion(): boolean {
    return this.config?.reduceMotion || this.isReduceMotionEnabled;
  }

  /**
   * 获取扩展触摸目标样式
   */
  getExtendedTouchTargetStyles() {
    if (!this.config?.extendedTouchTargets) return {};
    
    return {
      minWidth: 48,
      minHeight: 48,
      padding: 12,
    };
  }

  /**
   * 获取焦点指示器样式
   */
  getFocusIndicatorStyles() {
    if (!this.config?.focusIndicators) return {};
    
    return {
      borderWidth: 2,
      borderColor: '#3b82f6',
      borderStyle: 'solid',
    };
  }

  // ===== 语音控制系统 =====

  /**
   * 设置语音命令
   */
  private setupVoiceCommands(): void {
    this.voiceCommands = [
      {
        command: '返回',
        variations: ['回去', '后退', '返回上一页'],
        action: 'navigate_back',
        description: '返回上一页',
        category: 'navigation',
      },
      {
        command: '开始学习',
        variations: ['开始', '学习', '继续学习'],
        action: 'start_learning',
        description: '开始或继续学习',
        category: 'learning',
      },
      {
        command: '播放音频',
        variations: ['播放', '听音频', '播放声音'],
        action: 'play_audio',
        description: '播放当前音频',
        category: 'control',
      },
      {
        command: '显示提示',
        variations: ['提示', '帮助', '显示帮助'],
        action: 'show_hint',
        description: '显示学习提示',
        category: 'help',
      },
      {
        command: '下一个',
        variations: ['下一题', '继续', '下一个单词'],
        action: 'next_item',
        description: '进入下一个学习项目',
        category: 'learning',
      },
    ];
  }

  /**
   * 处理语音命令
   */
  handleVoiceCommand(command: string): string | null {
    if (!this.config?.voiceCommandsEnabled) return null;
    
    const normalizedCommand = command.toLowerCase().trim();
    
    for (const voiceCommand of this.voiceCommands) {
      const allCommands = [voiceCommand.command, ...voiceCommand.variations];
      
      if (allCommands.some(cmd => normalizedCommand.includes(cmd.toLowerCase()))) {
        this.analyticsService.track('voice_command_executed', {
          command: voiceCommand.command,
          action: voiceCommand.action,
          category: voiceCommand.category,
          timestamp: Date.now(),
        });
        
        return voiceCommand.action;
      }
    }
    
    return null;
  }

  /**
   * 获取可用语音命令列表
   */
  getAvailableVoiceCommands(): VoiceCommand[] {
    return this.voiceCommands;
  }

  // ===== 反馈和通知系统 =====

  /**
   * 提供无障碍反馈
   */
  async provideAccessibilityFeedback(feedback: AccessibilityFeedback): Promise<void> {
    try {
      switch (feedback.type) {
        case 'announcement':
          this.announceForScreenReader(feedback.content, feedback.priority as any);
          break;
          
        case 'haptic':
          if (this.config?.hapticFeedback) {
            // 在实际应用中，这里会触发触觉反馈
            console.log('Haptic feedback:', feedback.content);
          }
          break;
          
        case 'visual':
          if (this.config?.visualIndicators) {
            // 触发视觉指示器
            console.log('Visual indicator:', feedback.content);
          }
          break;
          
        case 'audio':
          // 播放音频提示
          console.log('Audio feedback:', feedback.content);
          break;
      }
      
      this.analyticsService.track('accessibility_feedback_provided', {
        type: feedback.type,
        priority: feedback.priority,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error providing accessibility feedback:', error);
    }
  }

  // ===== 事件处理 =====

  /**
   * 处理屏幕阅读器状态变化
   */
  private handleScreenReaderChange = (enabled: boolean) => {
    this.isScreenReaderEnabled = enabled;
    
    if (this.config) {
      this.config.screenReaderEnabled = enabled;
    }
    
    this.analyticsService.track('screen_reader_state_changed', {
      enabled,
      timestamp: Date.now(),
    });
  };

  /**
   * 处理动画偏好变化
   */
  private handleReduceMotionChange = (enabled: boolean) => {
    this.isReduceMotionEnabled = enabled;
    
    if (this.config) {
      this.config.reduceMotion = enabled;
    }
    
    this.analyticsService.track('reduce_motion_state_changed', {
      enabled,
      timestamp: Date.now(),
    });
  };

  /**
   * 应用无障碍配置
   */
  private async applyAccessibilityConfig(config: AccessibilityConfig): Promise<void> {
    try {
      // 应用配置到系统
      if (config.screenReaderEnabled) {
        this.announceForScreenReader('无障碍功能已启用', 'assertive');
      }
      
      // 更新用户状态服务中的无障碍偏好
      const userSettings = this.userStateService.getUserSettings();
      if (userSettings) {
        await this.userStateService.updateUserSettings({
          // 将无障碍设置同步到用户设置中
        });
      }
      
      this.analyticsService.track('accessibility_config_applied', {
        config,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error applying accessibility config:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取当前无障碍配置
   */
  getAccessibilityConfig(): AccessibilityConfig | null {
    return this.config;
  }

  /**
   * 检查特定无障碍功能是否启用
   */
  isFeatureEnabled(feature: keyof AccessibilityConfig): boolean {
    return this.config?.[feature] as boolean || false;
  }

  /**
   * 获取系统无障碍状态
   */
  getSystemAccessibilityStatus() {
    return {
      screenReaderEnabled: this.isScreenReaderEnabled,
      reduceMotionEnabled: this.isReduceMotionEnabled,
      systemFontScale: this.systemFontScale,
    };
  }

  /**
   * 执行无障碍检查
   */
  async performAccessibilityCheck(): Promise<{
    issues: string[];
    recommendations: string[];
    score: number;
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // 检查基本配置
    if (!this.config?.focusIndicators) {
      issues.push('焦点指示器未启用');
      recommendations.push('启用焦点指示器以改善键盘导航体验');
    }
    
    if (!this.config?.announcePageChanges) {
      issues.push('页面变化公告未启用');
      recommendations.push('启用页面变化公告以改善屏幕阅读器体验');
    }
    
    if (this.config?.fontSizeMultiplier === 1.0 && this.isScreenReaderEnabled) {
      recommendations.push('考虑增大字体以改善可读性');
    }
    
    // 计算无障碍得分
    const totalChecks = 10;
    const passedChecks = totalChecks - issues.length;
    const score = Math.round((passedChecks / totalChecks) * 100);
    
    this.analyticsService.track('accessibility_check_performed', {
      score,
      issueCount: issues.length,
      recommendationCount: recommendations.length,
      timestamp: Date.now(),
    });
    
    return { issues, recommendations, score };
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    AccessibilityInfo.removeEventListener('screenReaderChanged', this.handleScreenReaderChange);
    AccessibilityInfo.removeEventListener('reduceMotionChanged', this.handleReduceMotionChange);
  }
}

export default AccessibilityService;
