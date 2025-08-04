/**
 * Web分析适配器
 * 将React Native的AnalyticsService适配为Web环境
 * 支持Google Analytics、自定义事件追踪等
 */

export interface AnalyticsEvent {
  eventName: string;
  parameters: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

export interface AnalyticsAdapter {
  trackEvent(event: AnalyticsEvent): Promise<void>;
  trackScreenView(screenName: string, parameters?: Record<string, any>): Promise<void>;
  trackUserProperty(property: string, value: any): Promise<void>;
  trackTiming(category: string, variable: string, time: number): Promise<void>;
  setUserId(userId: string): Promise<void>;
  setSessionId(sessionId: string): Promise<void>;
}

export class WebAnalyticsAdapter implements AnalyticsAdapter {
  private userId?: string;
  private sessionId?: string;
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * 初始化分析服务
   */
  private async initialize(): Promise<void> {
    try {
      // 初始化Google Analytics (如果配置了)
      if (typeof window !== 'undefined' && window.gtag) {
        this.isInitialized = true;
      }
      
      // 初始化自定义分析服务
      await this.initializeCustomAnalytics();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * 初始化自定义分析服务
   */
  private async initializeCustomAnalytics(): Promise<void> {
    // 这里可以集成其他分析服务，如Mixpanel、Amplitude等
    // 或者发送到自己的分析后端
  }

  /**
   * 追踪事件
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const eventData = {
        ...event,
        timestamp: event.timestamp || new Date().toISOString(),
        userId: event.userId || this.userId,
        sessionId: event.sessionId || this.sessionId,
        platform: 'web',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      };

      // 发送到Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.eventName, {
          ...event.parameters,
          custom_parameter_user_id: eventData.userId,
          custom_parameter_session_id: eventData.sessionId
        });
      }

      // 发送到自定义分析后端
      await this.sendToCustomAnalytics(eventData);

      // 本地存储用于离线分析
      await this.storeEventLocally(eventData);

    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  /**
   * 追踪页面浏览
   */
  async trackScreenView(screenName: string, parameters?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      eventName: 'screen_view',
      parameters: {
        screen_name: screenName,
        ...parameters
      }
    });
  }

  /**
   * 追踪用户属性
   */
  async trackUserProperty(property: string, value: any): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', 'GA_MEASUREMENT_ID', {
          custom_map: { [property]: value }
        });
      }

      await this.trackEvent({
        eventName: 'user_property_set',
        parameters: {
          property_name: property,
          property_value: value
        }
      });
    } catch (error) {
      console.error('Failed to track user property:', error);
    }
  }

  /**
   * 追踪时间性能
   */
  async trackTiming(category: string, variable: string, time: number): Promise<void> {
    await this.trackEvent({
      eventName: 'timing_complete',
      parameters: {
        timing_category: category,
        timing_var: variable,
        timing_value: time
      }
    });
  }

  /**
   * 设置用户ID
   */
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId
      });
    }
  }

  /**
   * 设置会话ID
   */
  async setSessionId(sessionId: string): Promise<void> {
    this.sessionId = sessionId;
  }

  /**
   * 发送到自定义分析后端
   */
  private async sendToCustomAnalytics(eventData: any): Promise<void> {
    try {
      // 这里可以发送到自己的分析API
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(eventData)
      // });
    } catch (error) {
      console.warn('Failed to send to custom analytics:', error);
    }
  }

  /**
   * 本地存储事件（用于离线分析）
   */
  private async storeEventLocally(eventData: any): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const key = 'analytics_events';
      const existingEvents = localStorage.getItem(key);
      const events = existingEvents ? JSON.parse(existingEvents) : [];
      
      events.push(eventData);
      
      // 只保留最近1000个事件
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      localStorage.setItem(key, JSON.stringify(events));
    } catch (error) {
      console.warn('Failed to store event locally:', error);
    }
  }

  /**
   * 获取本地存储的事件
   */
  async getLocalEvents(): Promise<any[]> {
    try {
      if (typeof window === 'undefined') return [];
      
      const events = localStorage.getItem('analytics_events');
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to get local events:', error);
      return [];
    }
  }

  /**
   * 清除本地事件
   */
  async clearLocalEvents(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('analytics_events');
      }
    } catch (error) {
      console.error('Failed to clear local events:', error);
    }
  }

  /**
   * 批量发送本地事件
   */
  async flushLocalEvents(): Promise<void> {
    try {
      const events = await this.getLocalEvents();
      
      for (const event of events) {
        await this.sendToCustomAnalytics(event);
      }
      
      await this.clearLocalEvents();
    } catch (error) {
      console.error('Failed to flush local events:', error);
    }
  }
}

// 扩展Window接口以支持gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// 创建单例实例
export const webAnalyticsAdapter = new WebAnalyticsAdapter();
