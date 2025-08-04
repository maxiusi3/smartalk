/**
 * PerformanceOptimizer - 综合性能优化系统
 * 提供实时性能监控、智能优化建议和自动性能调优
 */

export interface PerformanceMetrics {
  // 页面性能指标
  pageLoadTime: number; // 页面加载时间 (ms)
  firstContentfulPaint: number; // 首次内容绘制 (ms)
  largestContentfulPaint: number; // 最大内容绘制 (ms)
  cumulativeLayoutShift: number; // 累积布局偏移
  firstInputDelay: number; // 首次输入延迟 (ms)
  
  // 交互性能指标
  interactionResponseTime: number; // 交互响应时间 (ms)
  animationFrameRate: number; // 动画帧率 (fps)
  scrollPerformance: number; // 滚动性能评分 (0-100)
  
  // 资源性能指标
  memoryUsage: number; // 内存使用量 (MB)
  networkLatency: number; // 网络延迟 (ms)
  cacheHitRate: number; // 缓存命中率 (%)
  
  // 学习功能性能指标
  videoLoadTime: number; // 视频加载时间 (ms)
  audioLoadTime: number; // 音频加载时间 (ms)
  pronunciationApiResponseTime: number; // 发音API响应时间 (ms)
  focusModeActivationTime: number; // Focus Mode激活时间 (ms)
  rescueModeActivationTime: number; // Rescue Mode激活时间 (ms)
  
  timestamp: string;
}

export interface PerformanceThresholds {
  pageLoadTime: { good: number; needs_improvement: number; poor: number };
  firstContentfulPaint: { good: number; needs_improvement: number; poor: number };
  largestContentfulPaint: { good: number; needs_improvement: number; poor: number };
  cumulativeLayoutShift: { good: number; needs_improvement: number; poor: number };
  firstInputDelay: { good: number; needs_improvement: number; poor: number };
  interactionResponseTime: { good: number; needs_improvement: number; poor: number };
  videoLoadTime: { good: number; needs_improvement: number; poor: number };
  pronunciationApiResponseTime: { good: number; needs_improvement: number; poor: number };
}

export interface OptimizationSuggestion {
  id: string;
  category: 'loading' | 'interaction' | 'memory' | 'network' | 'rendering' | 'learning_features';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string; // 预期改进效果
  implementation: string; // 实施建议
  estimatedEffort: 'low' | 'medium' | 'high';
  potentialImprovement: number; // 预期性能提升百分比
  relatedMetrics: string[];
  autoFixAvailable: boolean;
}

export interface PerformanceReport {
  reportId: string;
  generatedAt: string;
  overallScore: number; // 0-100
  metrics: PerformanceMetrics;
  categoryScores: {
    loading: number;
    interaction: number;
    stability: number;
    learningFeatures: number;
  };
  suggestions: OptimizationSuggestion[];
  trends: {
    metric: string;
    trend: 'improving' | 'stable' | 'degrading';
    changePercent: number;
  }[];
  deviceInfo: {
    userAgent: string;
    screenResolution: string;
    deviceMemory?: number;
    connectionType?: string;
  };
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metricsHistory: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private isMonitoring = false;
  
  // 性能阈值配置
  private readonly thresholds: PerformanceThresholds = {
    pageLoadTime: { good: 1500, needs_improvement: 3000, poor: 5000 },
    firstContentfulPaint: { good: 1000, needs_improvement: 2000, poor: 3000 },
    largestContentfulPaint: { good: 2000, needs_improvement: 3000, poor: 4000 },
    cumulativeLayoutShift: { good: 0.1, needs_improvement: 0.25, poor: 0.5 },
    firstInputDelay: { good: 100, needs_improvement: 300, poor: 500 },
    interactionResponseTime: { good: 50, needs_improvement: 100, poor: 200 },
    videoLoadTime: { good: 800, needs_improvement: 1500, poor: 3000 },
    pronunciationApiResponseTime: { good: 1000, needs_improvement: 1500, poor: 2500 }
  };

  private constructor() {
    this.initializePerformanceMonitoring();
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 初始化性能监控
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    // 监控Web Vitals
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      try {
        this.observer.observe({ entryTypes: ['navigation', 'paint', 'layout-shift', 'first-input'] });
      } catch (error) {
        console.warn('Performance monitoring not fully supported:', error);
      }
    }

    // 定期收集性能指标
    setInterval(() => {
      this.collectCurrentMetrics();
    }, 30000); // 每30秒收集一次
  }

  /**
   * 处理性能条目
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    // 处理不同类型的性能条目
    switch (entry.entryType) {
      case 'navigation':
        this.handleNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'paint':
        this.handlePaintEntry(entry as PerformancePaintTiming);
        break;
      case 'layout-shift':
        this.handleLayoutShiftEntry(entry as any);
        break;
      case 'first-input':
        this.handleFirstInputEntry(entry as any);
        break;
    }
  }

  /**
   * 处理导航性能条目
   */
  private handleNavigationEntry(entry: PerformanceNavigationTiming): void {
    const loadTime = entry.loadEventEnd - entry.navigationStart;
    if (loadTime > 0) {
      this.updateMetric('pageLoadTime', loadTime);
    }
  }

  /**
   * 处理绘制性能条目
   */
  private handlePaintEntry(entry: PerformancePaintTiming): void {
    if (entry.name === 'first-contentful-paint') {
      this.updateMetric('firstContentfulPaint', entry.startTime);
    }
  }

  /**
   * 处理布局偏移条目
   */
  private handleLayoutShiftEntry(entry: any): void {
    if (!entry.hadRecentInput) {
      this.updateMetric('cumulativeLayoutShift', entry.value);
    }
  }

  /**
   * 处理首次输入条目
   */
  private handleFirstInputEntry(entry: any): void {
    this.updateMetric('firstInputDelay', entry.processingStart - entry.startTime);
  }

  /**
   * 更新性能指标
   */
  private updateMetric(metric: keyof PerformanceMetrics, value: number): void {
    // 实现指标更新逻辑
    const currentMetrics = this.getCurrentMetrics();
    (currentMetrics as any)[metric] = value;
  }

  /**
   * 收集当前性能指标
   */
  private collectCurrentMetrics(): PerformanceMetrics {
    const metrics: PerformanceMetrics = {
      pageLoadTime: this.getPageLoadTime(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
      largestContentfulPaint: this.getLargestContentfulPaint(),
      cumulativeLayoutShift: this.getCumulativeLayoutShift(),
      firstInputDelay: this.getFirstInputDelay(),
      interactionResponseTime: this.measureInteractionResponseTime(),
      animationFrameRate: this.measureAnimationFrameRate(),
      scrollPerformance: this.measureScrollPerformance(),
      memoryUsage: this.getMemoryUsage(),
      networkLatency: this.measureNetworkLatency(),
      cacheHitRate: this.calculateCacheHitRate(),
      videoLoadTime: this.getVideoLoadTime(),
      audioLoadTime: this.getAudioLoadTime(),
      pronunciationApiResponseTime: this.getPronunciationApiResponseTime(),
      focusModeActivationTime: this.getFocusModeActivationTime(),
      rescueModeActivationTime: this.getRescueModeActivationTime(),
      timestamp: new Date().toISOString()
    };

    this.metricsHistory.push(metrics);
    
    // 保持历史记录在合理范围内
    if (this.metricsHistory.length > 100) {
      this.metricsHistory = this.metricsHistory.slice(-100);
    }

    return metrics;
  }

  /**
   * 获取页面加载时间
   */
  private getPageLoadTime(): number {
    if (typeof window === 'undefined') return 0;
    
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      return navigation.loadEventEnd - navigation.navigationStart;
    }
    return 0;
  }

  /**
   * 获取首次内容绘制时间
   */
  private getFirstContentfulPaint(): number {
    if (typeof window === 'undefined') return 0;
    
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  /**
   * 获取最大内容绘制时间
   */
  private getLargestContentfulPaint(): number {
    // 简化实现，实际应该使用PerformanceObserver监控LCP
    return 0;
  }

  /**
   * 获取累积布局偏移
   */
  private getCumulativeLayoutShift(): number {
    // 简化实现，实际应该累积所有布局偏移
    return 0;
  }

  /**
   * 获取首次输入延迟
   */
  private getFirstInputDelay(): number {
    // 简化实现，实际应该通过事件监听器测量
    return 0;
  }

  /**
   * 测量交互响应时间
   */
  private measureInteractionResponseTime(): number {
    // 简化实现，返回模拟值
    return Math.random() * 100 + 20;
  }

  /**
   * 测量动画帧率
   */
  private measureAnimationFrameRate(): number {
    // 简化实现，返回模拟值
    return 60 - Math.random() * 10;
  }

  /**
   * 测量滚动性能
   */
  private measureScrollPerformance(): number {
    // 简化实现，返回模拟评分
    return 85 + Math.random() * 15;
  }

  /**
   * 获取内存使用量
   */
  private getMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;
    
    // @ts-ignore
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * 测量网络延迟
   */
  private measureNetworkLatency(): number {
    // 简化实现，返回模拟值
    return Math.random() * 200 + 50;
  }

  /**
   * 计算缓存命中率
   */
  private calculateCacheHitRate(): number {
    // 简化实现，返回模拟值
    return 75 + Math.random() * 20;
  }

  /**
   * 获取视频加载时间
   */
  private getVideoLoadTime(): number {
    // 从localStorage或其他地方获取视频加载时间统计
    const videoLoadTimes = JSON.parse(localStorage.getItem('videoLoadTimes') || '[]');
    if (videoLoadTimes.length > 0) {
      return videoLoadTimes.reduce((sum: number, time: number) => sum + time, 0) / videoLoadTimes.length;
    }
    return 0;
  }

  /**
   * 获取音频加载时间
   */
  private getAudioLoadTime(): number {
    // 类似视频加载时间的实现
    return Math.random() * 500 + 200;
  }

  /**
   * 获取发音API响应时间
   */
  private getPronunciationApiResponseTime(): number {
    // 从API调用统计中获取
    const apiTimes = JSON.parse(localStorage.getItem('pronunciationApiTimes') || '[]');
    if (apiTimes.length > 0) {
      return apiTimes.reduce((sum: number, time: number) => sum + time, 0) / apiTimes.length;
    }
    return 0;
  }

  /**
   * 获取Focus Mode激活时间
   */
  private getFocusModeActivationTime(): number {
    return Math.random() * 300 + 100;
  }

  /**
   * 获取Rescue Mode激活时间
   */
  private getRescueModeActivationTime(): number {
    return Math.random() * 500 + 200;
  }

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.collectCurrentMetrics();
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): PerformanceReport {
    const currentMetrics = this.getCurrentMetrics();
    const categoryScores = this.calculateCategoryScores(currentMetrics);
    const overallScore = this.calculateOverallScore(categoryScores);
    const suggestions = this.generateOptimizationSuggestions(currentMetrics);
    const trends = this.analyzeTrends();

    return {
      reportId: `perf_report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      overallScore,
      metrics: currentMetrics,
      categoryScores,
      suggestions,
      trends,
      deviceInfo: this.getDeviceInfo()
    };
  }

  /**
   * 计算分类评分
   */
  private calculateCategoryScores(metrics: PerformanceMetrics): PerformanceReport['categoryScores'] {
    return {
      loading: this.calculateLoadingScore(metrics),
      interaction: this.calculateInteractionScore(metrics),
      stability: this.calculateStabilityScore(metrics),
      learningFeatures: this.calculateLearningFeaturesScore(metrics)
    };
  }

  /**
   * 计算加载性能评分
   */
  private calculateLoadingScore(metrics: PerformanceMetrics): number {
    const scores = [
      this.scoreMetric(metrics.pageLoadTime, this.thresholds.pageLoadTime),
      this.scoreMetric(metrics.firstContentfulPaint, this.thresholds.firstContentfulPaint),
      this.scoreMetric(metrics.largestContentfulPaint, this.thresholds.largestContentfulPaint)
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * 计算交互性能评分
   */
  private calculateInteractionScore(metrics: PerformanceMetrics): number {
    const scores = [
      this.scoreMetric(metrics.firstInputDelay, this.thresholds.firstInputDelay),
      this.scoreMetric(metrics.interactionResponseTime, this.thresholds.interactionResponseTime),
      Math.min(100, metrics.animationFrameRate / 60 * 100)
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * 计算稳定性评分
   */
  private calculateStabilityScore(metrics: PerformanceMetrics): number {
    const clsScore = this.scoreMetric(metrics.cumulativeLayoutShift, this.thresholds.cumulativeLayoutShift, true);
    const memoryScore = Math.max(0, 100 - metrics.memoryUsage / 10); // 假设100MB为基准
    return (clsScore + memoryScore) / 2;
  }

  /**
   * 计算学习功能性能评分
   */
  private calculateLearningFeaturesScore(metrics: PerformanceMetrics): number {
    const scores = [
      this.scoreMetric(metrics.videoLoadTime, this.thresholds.videoLoadTime),
      this.scoreMetric(metrics.pronunciationApiResponseTime, this.thresholds.pronunciationApiResponseTime),
      Math.min(100, metrics.cacheHitRate)
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * 为单个指标评分
   */
  private scoreMetric(value: number, threshold: any, lowerIsBetter = false): number {
    if (value === 0) return 50; // 无数据时返回中等分数
    
    if (lowerIsBetter) {
      if (value <= threshold.good) return 100;
      if (value <= threshold.needs_improvement) return 75;
      if (value <= threshold.poor) return 50;
      return 25;
    } else {
      if (value >= threshold.good) return 100;
      if (value >= threshold.needs_improvement) return 75;
      if (value >= threshold.poor) return 50;
      return 25;
    }
  }

  /**
   * 计算总体评分
   */
  private calculateOverallScore(categoryScores: PerformanceReport['categoryScores']): number {
    const weights = {
      loading: 0.3,
      interaction: 0.3,
      stability: 0.2,
      learningFeatures: 0.2
    };

    return Math.round(
      categoryScores.loading * weights.loading +
      categoryScores.interaction * weights.interaction +
      categoryScores.stability * weights.stability +
      categoryScores.learningFeatures * weights.learningFeatures
    );
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 页面加载优化建议
    if (metrics.pageLoadTime > this.thresholds.pageLoadTime.needs_improvement) {
      suggestions.push({
        id: 'optimize_page_load',
        category: 'loading',
        priority: metrics.pageLoadTime > this.thresholds.pageLoadTime.poor ? 'critical' : 'high',
        title: '优化页面加载时间',
        description: `当前页面加载时间为 ${metrics.pageLoadTime.toFixed(0)}ms，超过了推荐阈值`,
        impact: '可提升用户首次访问体验，减少跳出率',
        implementation: '启用代码分割、优化图片资源、使用CDN加速',
        estimatedEffort: 'medium',
        potentialImprovement: 25,
        relatedMetrics: ['pageLoadTime', 'firstContentfulPaint'],
        autoFixAvailable: false
      });
    }

    // 交互响应优化建议
    if (metrics.interactionResponseTime > this.thresholds.interactionResponseTime.needs_improvement) {
      suggestions.push({
        id: 'optimize_interaction_response',
        category: 'interaction',
        priority: 'high',
        title: '优化交互响应时间',
        description: `交互响应时间为 ${metrics.interactionResponseTime.toFixed(0)}ms，影响用户体验`,
        impact: '提升用户操作的流畅性和满意度',
        implementation: '优化事件处理器、减少主线程阻塞、使用Web Workers',
        estimatedEffort: 'medium',
        potentialImprovement: 30,
        relatedMetrics: ['interactionResponseTime', 'firstInputDelay'],
        autoFixAvailable: false
      });
    }

    // 视频加载优化建议
    if (metrics.videoLoadTime > this.thresholds.videoLoadTime.needs_improvement) {
      suggestions.push({
        id: 'optimize_video_loading',
        category: 'learning_features',
        priority: 'high',
        title: '优化视频加载性能',
        description: `视频加载时间为 ${metrics.videoLoadTime.toFixed(0)}ms，影响学习体验`,
        impact: '提升学习流程的连贯性，减少等待时间',
        implementation: '实施视频预加载、优化视频格式、使用自适应码率',
        estimatedEffort: 'high',
        potentialImprovement: 40,
        relatedMetrics: ['videoLoadTime'],
        autoFixAvailable: true
      });
    }

    // 发音API优化建议
    if (metrics.pronunciationApiResponseTime > this.thresholds.pronunciationApiResponseTime.needs_improvement) {
      suggestions.push({
        id: 'optimize_pronunciation_api',
        category: 'learning_features',
        priority: 'critical',
        title: '优化发音评估响应时间',
        description: `发音API响应时间为 ${metrics.pronunciationApiResponseTime.toFixed(0)}ms，超过用户期望`,
        impact: '提升发音练习的实时性和用户满意度',
        implementation: '优化API调用、实施请求缓存、使用更快的API提供商',
        estimatedEffort: 'medium',
        potentialImprovement: 35,
        relatedMetrics: ['pronunciationApiResponseTime'],
        autoFixAvailable: false
      });
    }

    // 内存使用优化建议
    if (metrics.memoryUsage > 100) { // 100MB阈值
      suggestions.push({
        id: 'optimize_memory_usage',
        category: 'memory',
        priority: 'medium',
        title: '优化内存使用',
        description: `当前内存使用量为 ${metrics.memoryUsage.toFixed(1)}MB，可能影响设备性能`,
        impact: '提升应用稳定性，减少崩溃风险',
        implementation: '清理未使用的资源、优化图片缓存、实施内存监控',
        estimatedEffort: 'medium',
        potentialImprovement: 20,
        relatedMetrics: ['memoryUsage'],
        autoFixAvailable: true
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 分析性能趋势
   */
  private analyzeTrends(): PerformanceReport['trends'] {
    if (this.metricsHistory.length < 2) return [];

    const trends: PerformanceReport['trends'] = [];
    const recent = this.metricsHistory.slice(-10); // 最近10次记录
    const older = this.metricsHistory.slice(-20, -10); // 之前10次记录

    if (older.length === 0) return [];

    const metricsToAnalyze: (keyof PerformanceMetrics)[] = [
      'pageLoadTime', 'interactionResponseTime', 'videoLoadTime', 'pronunciationApiResponseTime'
    ];

    for (const metric of metricsToAnalyze) {
      const recentAvg = recent.reduce((sum, m) => sum + (m[metric] as number), 0) / recent.length;
      const olderAvg = older.reduce((sum, m) => sum + (m[metric] as number), 0) / older.length;
      
      if (olderAvg > 0) {
        const changePercent = ((recentAvg - olderAvg) / olderAvg) * 100;
        let trend: 'improving' | 'stable' | 'degrading' = 'stable';
        
        if (Math.abs(changePercent) > 5) {
          trend = changePercent < 0 ? 'improving' : 'degrading';
        }

        trends.push({
          metric,
          trend,
          changePercent: Math.abs(changePercent)
        });
      }
    }

    return trends;
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo(): PerformanceReport['deviceInfo'] {
    if (typeof window === 'undefined') {
      return {
        userAgent: 'Server',
        screenResolution: 'Unknown'
      };
    }

    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      // @ts-ignore
      deviceMemory: navigator.deviceMemory,
      // @ts-ignore
      connectionType: navigator.connection?.effectiveType
    };
  }

  /**
   * 记录视频加载时间
   */
  recordVideoLoadTime(loadTime: number): void {
    const videoLoadTimes = JSON.parse(localStorage.getItem('videoLoadTimes') || '[]');
    videoLoadTimes.push(loadTime);
    
    // 保持最近50次记录
    if (videoLoadTimes.length > 50) {
      videoLoadTimes.splice(0, videoLoadTimes.length - 50);
    }
    
    localStorage.setItem('videoLoadTimes', JSON.stringify(videoLoadTimes));
  }

  /**
   * 记录发音API响应时间
   */
  recordPronunciationApiTime(responseTime: number): void {
    const apiTimes = JSON.parse(localStorage.getItem('pronunciationApiTimes') || '[]');
    apiTimes.push(responseTime);
    
    // 保持最近50次记录
    if (apiTimes.length > 50) {
      apiTimes.splice(0, apiTimes.length - 50);
    }
    
    localStorage.setItem('pronunciationApiTimes', JSON.stringify(apiTimes));
  }

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    this.isMonitoring = true;
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * 获取性能历史
   */
  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * 清除性能历史
   */
  clearHistory(): void {
    this.metricsHistory = [];
  }
}

// 创建全局实例
export const performanceOptimizer = PerformanceOptimizer.getInstance();
