/**
 * 性能优化器
 * 用于监控和优化系统性能，检查内存泄漏
 */

export interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  responseTime: {
    focusMode: number;
    pronunciation: number;
    rescueMode: number;
  };
  resourceUsage: {
    eventListeners: number;
    timers: number;
    promises: number;
  };
  browserCompatibility: {
    mediaRecorder: boolean;
    webAudio: boolean;
    localStorage: boolean;
    indexedDB: boolean;
  };
}

export interface OptimizationReport {
  timestamp: string;
  metrics: PerformanceMetrics;
  issues: PerformanceIssue[];
  recommendations: string[];
  overallScore: number;
}

export interface PerformanceIssue {
  type: 'memory' | 'performance' | 'compatibility' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  solution: string;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private performanceHistory: PerformanceMetrics[] = [];
  private memoryBaseline: number = 0;
  private timers: Set<number> = new Set();
  private intervals: Set<number> = new Set();
  private eventListeners: Map<string, number> = new Map();

  private constructor() {
    this.initializeBaseline();
    this.setupPerformanceMonitoring();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 初始化性能基线
   */
  private initializeBaseline(): void {
    if ('memory' in performance) {
      this.memoryBaseline = (performance as any).memory.usedJSHeapSize;
    }
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 监控内存使用
    if ('memory' in performance) {
      setInterval(() => {
        this.checkMemoryUsage();
      }, 10000); // 每10秒检查一次
    }

    // 监控长任务
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // 超过50ms的任务
              console.warn('Long task detected:', entry.duration + 'ms');
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }
  }

  /**
   * 检查内存使用情况
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const currentUsage = memory.usedJSHeapSize;
      const increase = currentUsage - this.memoryBaseline;
      
      if (increase > 50 * 1024 * 1024) { // 超过50MB增长
        console.warn('Potential memory leak detected:', {
          baseline: this.memoryBaseline,
          current: currentUsage,
          increase: increase / 1024 / 1024 + 'MB'
        });
      }
    }
  }

  /**
   * 获取当前性能指标
   */
  async getCurrentMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      memoryUsage: this.getMemoryUsage(),
      responseTime: await this.measureResponseTimes(),
      resourceUsage: this.getResourceUsage(),
      browserCompatibility: this.checkBrowserCompatibility()
    };

    this.performanceHistory.push(metrics);
    
    // 保持历史记录在合理范围内
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.splice(0, this.performanceHistory.length - 100);
    }

    return metrics;
  }

  /**
   * 获取内存使用情况
   */
  private getMemoryUsage(): PerformanceMetrics['memoryUsage'] {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }

  /**
   * 测量响应时间
   */
  private async measureResponseTimes(): Promise<PerformanceMetrics['responseTime']> {
    const measureTime = async (operation: () => Promise<any>): Promise<number> => {
      const start = performance.now();
      try {
        await operation();
      } catch (error) {
        // 忽略错误，只测量时间
      }
      return performance.now() - start;
    };

    // 模拟各种操作的响应时间
    const focusModeTime = await measureTime(async () => {
      // 模拟Focus Mode状态检查
      for (let i = 0; i < 100; i++) {
        localStorage.getItem('focus_mode_states');
      }
    });

    const pronunciationTime = await measureTime(async () => {
      // 模拟发音评估操作
      for (let i = 0; i < 50; i++) {
        localStorage.getItem('pronunciation_stats');
      }
    });

    const rescueModeTime = await measureTime(async () => {
      // 模拟Rescue Mode操作
      for (let i = 0; i < 100; i++) {
        localStorage.getItem('rescue_mode_states');
      }
    });

    return {
      focusMode: focusModeTime,
      pronunciation: pronunciationTime,
      rescueMode: rescueModeTime
    };
  }

  /**
   * 获取资源使用情况
   */
  private getResourceUsage(): PerformanceMetrics['resourceUsage'] {
    return {
      eventListeners: Array.from(this.eventListeners.values()).reduce((sum, count) => sum + count, 0),
      timers: this.timers.size,
      promises: 0 // 难以准确统计，暂时设为0
    };
  }

  /**
   * 检查浏览器兼容性
   */
  private checkBrowserCompatibility(): PerformanceMetrics['browserCompatibility'] {
    return {
      mediaRecorder: 'MediaRecorder' in window,
      webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
      localStorage: 'localStorage' in window,
      indexedDB: 'indexedDB' in window
    };
  }

  /**
   * 生成优化报告
   */
  async generateOptimizationReport(): Promise<OptimizationReport> {
    const metrics = await this.getCurrentMetrics();
    const issues = this.analyzeIssues(metrics);
    const recommendations = this.generateRecommendations(issues);
    const overallScore = this.calculateOverallScore(metrics, issues);

    return {
      timestamp: new Date().toISOString(),
      metrics,
      issues,
      recommendations,
      overallScore
    };
  }

  /**
   * 分析性能问题
   */
  private analyzeIssues(metrics: PerformanceMetrics): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];

    // 内存使用检查
    if (metrics.memoryUsage.percentage > 80) {
      issues.push({
        type: 'memory',
        severity: 'high',
        description: `内存使用率过高: ${metrics.memoryUsage.percentage.toFixed(1)}%`,
        solution: '检查是否存在内存泄漏，清理未使用的对象和事件监听器'
      });
    } else if (metrics.memoryUsage.percentage > 60) {
      issues.push({
        type: 'memory',
        severity: 'medium',
        description: `内存使用率较高: ${metrics.memoryUsage.percentage.toFixed(1)}%`,
        solution: '优化数据结构，减少不必要的对象创建'
      });
    }

    // 响应时间检查
    if (metrics.responseTime.focusMode > 200) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `Focus Mode响应时间过长: ${metrics.responseTime.focusMode.toFixed(1)}ms`,
        solution: '优化Focus Mode状态管理，减少不必要的计算'
      });
    }

    if (metrics.responseTime.pronunciation > 300) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `发音评估响应时间过长: ${metrics.responseTime.pronunciation.toFixed(1)}ms`,
        solution: '优化发音评估算法，使用缓存减少重复计算'
      });
    }

    if (metrics.responseTime.rescueMode > 200) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: `Rescue Mode响应时间过长: ${metrics.responseTime.rescueMode.toFixed(1)}ms`,
        solution: '优化Rescue Mode状态管理和数据访问'
      });
    }

    // 资源使用检查
    if (metrics.resourceUsage.eventListeners > 100) {
      issues.push({
        type: 'resource',
        severity: 'medium',
        description: `事件监听器过多: ${metrics.resourceUsage.eventListeners}个`,
        solution: '清理未使用的事件监听器，使用事件委托减少监听器数量'
      });
    }

    if (metrics.resourceUsage.timers > 20) {
      issues.push({
        type: 'resource',
        severity: 'medium',
        description: `定时器过多: ${metrics.resourceUsage.timers}个`,
        solution: '清理未使用的定时器，合并相似的定时任务'
      });
    }

    // 浏览器兼容性检查
    if (!metrics.browserCompatibility.mediaRecorder) {
      issues.push({
        type: 'compatibility',
        severity: 'high',
        description: '浏览器不支持MediaRecorder API',
        solution: '提供fallback方案或提示用户升级浏览器'
      });
    }

    if (!metrics.browserCompatibility.webAudio) {
      issues.push({
        type: 'compatibility',
        severity: 'high',
        description: '浏览器不支持Web Audio API',
        solution: '提供fallback方案或提示用户升级浏览器'
      });
    }

    return issues;
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(issues: PerformanceIssue[]): string[] {
    const recommendations: string[] = [];

    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');

    if (criticalIssues.length > 0) {
      recommendations.push('🚨 立即处理严重问题，系统可能无法正常工作');
    }

    if (highIssues.length > 0) {
      recommendations.push('⚠️ 优先处理高优先级问题，影响用户体验');
    }

    if (mediumIssues.length > 0) {
      recommendations.push('📈 考虑优化中等优先级问题，提升系统性能');
    }

    // 通用优化建议
    recommendations.push('🔄 定期清理未使用的资源和事件监听器');
    recommendations.push('💾 使用缓存减少重复计算和网络请求');
    recommendations.push('⚡ 使用防抖和节流优化高频操作');
    recommendations.push('📱 确保在不同设备和浏览器上的兼容性');

    return recommendations;
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(metrics: PerformanceMetrics, issues: PerformanceIssue[]): number {
    let score = 100;

    // 根据问题严重程度扣分
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });

    // 根据性能指标调整分数
    if (metrics.memoryUsage.percentage > 80) score -= 10;
    if (metrics.responseTime.focusMode > 200) score -= 5;
    if (metrics.responseTime.pronunciation > 300) score -= 5;
    if (metrics.responseTime.rescueMode > 200) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    // 清理定时器
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    
    this.timers.clear();
    this.intervals.clear();
    this.eventListeners.clear();
  }

  /**
   * 注册定时器（用于跟踪）
   */
  registerTimer(timer: number): void {
    this.timers.add(timer);
  }

  /**
   * 注册间隔器（用于跟踪）
   */
  registerInterval(interval: number): void {
    this.intervals.add(interval);
  }

  /**
   * 注册事件监听器（用于跟踪）
   */
  registerEventListener(type: string): void {
    const current = this.eventListeners.get(type) || 0;
    this.eventListeners.set(type, current + 1);
  }

  /**
   * 移除事件监听器（用于跟踪）
   */
  unregisterEventListener(type: string): void {
    const current = this.eventListeners.get(type) || 0;
    if (current > 0) {
      this.eventListeners.set(type, current - 1);
    }
  }

  /**
   * 获取性能历史
   */
  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }
}

// 创建全局实例
export const performanceOptimizer = PerformanceOptimizer.getInstance();

// 在页面卸载时清理资源
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceOptimizer.cleanup();
  });
}
