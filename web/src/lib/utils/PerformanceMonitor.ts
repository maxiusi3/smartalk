/**
 * 性能监控工具
 * 监控Focus Mode功能对页面性能的影响
 */

export interface PerformanceMetrics {
  // 页面加载性能
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint: number;
  
  // Focus Mode 特定性能
  focusModeActivationTime: number;
  focusModeDeactivationTime: number;
  highlightRenderTime: number;
  
  // 交互响应性能
  averageInteractionTime: number;
  maxInteractionTime: number;
  
  // 内存使用
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  
  // 时间戳
  timestamp: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private interactionTimes: number[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor() {
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * 初始化性能观察器
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // 观察页面加载性能
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.recordPageLoadMetrics();
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);

        // 观察用户交互性能
        const measureObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.startsWith('focus-mode-')) {
              this.recordFocusModeMetrics(entry);
            }
          }
        });
        measureObserver.observe({ entryTypes: ['measure'] });
        this.observers.push(measureObserver);
      }
    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  /**
   * 记录页面加载性能指标
   */
  private recordPageLoadMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
      const domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.navigationStart;
      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

      console.log('Page Load Metrics:', {
        pageLoadTime,
        domContentLoadedTime,
        firstContentfulPaint
      });
    } catch (error) {
      console.warn('Failed to record page load metrics:', error);
    }
  }

  /**
   * 记录Focus Mode特定性能指标
   */
  private recordFocusModeMetrics(entry: PerformanceEntry): void {
    console.log('Focus Mode Performance:', {
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime
    });
  }

  /**
   * 开始测量Focus Mode激活时间
   */
  startFocusModeActivation(): void {
    if (typeof window === 'undefined') return;
    performance.mark('focus-mode-activation-start');
  }

  /**
   * 结束测量Focus Mode激活时间
   */
  endFocusModeActivation(): void {
    if (typeof window === 'undefined') return;
    
    try {
      performance.mark('focus-mode-activation-end');
      performance.measure(
        'focus-mode-activation',
        'focus-mode-activation-start',
        'focus-mode-activation-end'
      );
    } catch (error) {
      console.warn('Failed to measure focus mode activation:', error);
    }
  }

  /**
   * 开始测量Focus Mode停用时间
   */
  startFocusModeDeactivation(): void {
    if (typeof window === 'undefined') return;
    performance.mark('focus-mode-deactivation-start');
  }

  /**
   * 结束测量Focus Mode停用时间
   */
  endFocusModeDeactivation(): void {
    if (typeof window === 'undefined') return;
    
    try {
      performance.mark('focus-mode-deactivation-end');
      performance.measure(
        'focus-mode-deactivation',
        'focus-mode-deactivation-start',
        'focus-mode-deactivation-end'
      );
    } catch (error) {
      console.warn('Failed to measure focus mode deactivation:', error);
    }
  }

  /**
   * 测量高亮渲染时间
   */
  measureHighlightRender(callback: () => void): void {
    if (typeof window === 'undefined') {
      callback();
      return;
    }

    const startTime = performance.now();
    
    // 使用 requestAnimationFrame 确保在下一帧测量
    requestAnimationFrame(() => {
      callback();
      
      requestAnimationFrame(() => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        console.log('Highlight render time:', renderTime, 'ms');
        
        // 记录到性能指标
        this.recordInteractionTime(renderTime);
      });
    });
  }

  /**
   * 记录交互响应时间
   */
  recordInteractionTime(time: number): void {
    this.interactionTimes.push(time);
    
    // 只保留最近100次交互的数据
    if (this.interactionTimes.length > 100) {
      this.interactionTimes.shift();
    }
  }

  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof window === 'undefined' || !('memory' in performance)) {
      return { used: 0, total: 0, percentage: 0 };
    }

    try {
      const memory = (performance as any).memory;
      const used = memory.usedJSHeapSize;
      const total = memory.totalJSHeapSize;
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return { used, total, percentage };
    } catch (error) {
      console.warn('Failed to get memory usage:', error);
      return { used: 0, total: 0, percentage: 0 };
    }
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): {
    summary: string;
    metrics: any;
    recommendations: string[];
  } {
    const memoryUsage = this.getMemoryUsage();
    const avgInteractionTime = this.interactionTimes.length > 0 
      ? this.interactionTimes.reduce((sum, time) => sum + time, 0) / this.interactionTimes.length 
      : 0;
    const maxInteractionTime = this.interactionTimes.length > 0 
      ? Math.max(...this.interactionTimes) 
      : 0;

    const metrics = {
      averageInteractionTime: avgInteractionTime,
      maxInteractionTime: maxInteractionTime,
      memoryUsage: memoryUsage,
      totalInteractions: this.interactionTimes.length
    };

    const recommendations: string[] = [];
    
    // 性能建议
    if (avgInteractionTime > 100) {
      recommendations.push('平均交互时间超过100ms，建议优化Focus Mode渲染逻辑');
    }
    
    if (maxInteractionTime > 500) {
      recommendations.push('最大交互时间超过500ms，存在性能瓶颈');
    }
    
    if (memoryUsage.percentage > 80) {
      recommendations.push('内存使用率超过80%，建议检查内存泄漏');
    }

    const summary = `
性能摘要:
- 平均交互时间: ${avgInteractionTime.toFixed(2)}ms
- 最大交互时间: ${maxInteractionTime.toFixed(2)}ms  
- 内存使用率: ${memoryUsage.percentage.toFixed(1)}%
- 总交互次数: ${this.interactionTimes.length}
    `.trim();

    return { summary, metrics, recommendations };
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.interactionTimes = [];
    this.metrics = [];
  }
}

// 创建单例实例
export const performanceMonitor = PerformanceMonitor.getInstance();
