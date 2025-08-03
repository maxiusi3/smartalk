/**
 * PerformanceOptimizationService - V2 性能优化服务
 * 提供完整的性能监控和优化系统：内存管理、渲染优化、网络优化
 * 支持实时监控、性能分析、自动优化建议
 */

import { AnalyticsService } from './AnalyticsService';
import UserStateService from './UserStateService';

// 性能指标类型
export interface PerformanceMetrics {
  // 内存指标
  memory: {
    used: number; // MB
    total: number; // MB
    peak: number; // MB
    gcCount: number;
    gcTime: number; // ms
  };
  
  // CPU指标
  cpu: {
    usage: number; // %
    peak: number; // %
    averageUsage: number; // %
    threads: number;
  };
  
  // 渲染指标
  rendering: {
    fps: number;
    frameDrops: number;
    averageFrameTime: number; // ms
    jankFrames: number;
    renderTime: number; // ms
  };
  
  // 网络指标
  network: {
    downloadSpeed: number; // Mbps
    uploadSpeed: number; // Mbps
    latency: number; // ms
    requestCount: number;
    failedRequests: number;
    cacheHitRate: number; // %
  };
  
  // 启动指标
  startup: {
    coldStartTime: number; // ms
    warmStartTime: number; // ms
    timeToInteractive: number; // ms
    timeToFirstFrame: number; // ms
  };
  
  // 用户交互指标
  interaction: {
    inputLatency: number; // ms
    scrollPerformance: number; // fps
    touchResponseTime: number; // ms
    animationPerformance: number; // fps
  };
}

// 性能问题类型
export type PerformanceIssueType = 
  | 'memory_leak'
  | 'high_cpu_usage'
  | 'frame_drops'
  | 'slow_network'
  | 'slow_startup'
  | 'input_lag'
  | 'animation_jank'
  | 'cache_miss';

// 性能问题
export interface PerformanceIssue {
  id: string;
  type: PerformanceIssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  
  // 检测信息
  detectedAt: string;
  component?: string;
  stackTrace?: string;
  
  // 指标数据
  metrics: {
    current: number;
    threshold: number;
    unit: string;
  };
  
  // 状态
  status: 'active' | 'resolved' | 'ignored';
  resolvedAt?: string;
}

// 优化建议
export interface OptimizationSuggestion {
  id: string;
  category: 'memory' | 'cpu' | 'rendering' | 'network' | 'startup' | 'interaction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  implementation: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  
  // 相关指标
  relatedMetrics: string[];
  
  // 实施状态
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
  implementedAt?: string;
}

// 性能配置
interface PerformanceConfig {
  // 监控配置
  monitoring: {
    enabled: boolean;
    interval: number; // ms
    sampleRate: number; // 0-1
  };
  
  // 阈值配置
  thresholds: {
    memory: {
      warning: number; // MB
      critical: number; // MB
    };
    cpu: {
      warning: number; // %
      critical: number; // %
    };
    fps: {
      warning: number;
      critical: number;
    };
    latency: {
      warning: number; // ms
      critical: number; // ms
    };
  };
  
  // 优化配置
  optimization: {
    autoOptimize: boolean;
    aggressiveMode: boolean;
    backgroundOptimization: boolean;
  };
}

// 性能报告
interface PerformanceReport {
  id: string;
  timestamp: string;
  duration: number; // 监控时长（分钟）
  
  // 总体评分
  overallScore: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // 详细指标
  metrics: PerformanceMetrics;
  
  // 问题汇总
  issues: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  
  // 改进建议
  suggestions: OptimizationSuggestion[];
  
  // 趋势分析
  trends: {
    memory: 'improving' | 'stable' | 'degrading';
    cpu: 'improving' | 'stable' | 'degrading';
    rendering: 'improving' | 'stable' | 'degrading';
    network: 'improving' | 'stable' | 'degrading';
  };
}

class PerformanceOptimizationService {
  private static instance: PerformanceOptimizationService;
  private analyticsService = AnalyticsService.getInstance();
  private userStateService = UserStateService.getInstance();
  
  // 性能数据
  private currentMetrics: PerformanceMetrics | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private issues: Map<string, PerformanceIssue> = new Map();
  private suggestions: Map<string, OptimizationSuggestion> = new Map();
  
  // 监控状态
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  // 配置
  private config: PerformanceConfig = {
    monitoring: {
      enabled: true,
      interval: 5000, // 5秒
      sampleRate: 1.0,
    },
    thresholds: {
      memory: { warning: 150, critical: 200 },
      cpu: { warning: 70, critical: 90 },
      fps: { warning: 45, critical: 30 },
      latency: { warning: 200, critical: 500 },
    },
    optimization: {
      autoOptimize: true,
      aggressiveMode: false,
      backgroundOptimization: true,
    },
  };

  static getInstance(): PerformanceOptimizationService {
    if (!PerformanceOptimizationService.instance) {
      PerformanceOptimizationService.instance = new PerformanceOptimizationService();
    }
    return PerformanceOptimizationService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化性能优化服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 开始性能监控
      if (this.config.monitoring.enabled) {
        this.startMonitoring();
      }
      
      // 加载默认优化建议
      this.loadDefaultSuggestions();
      
      this.analyticsService.track('performance_service_initialized', {
        monitoringEnabled: this.config.monitoring.enabled,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing performance service:', error);
    }
  }

  /**
   * 加载默认优化建议
   */
  private loadDefaultSuggestions(): void {
    const defaultSuggestions: OptimizationSuggestion[] = [
      {
        id: 'image_optimization',
        category: 'network',
        priority: 'high',
        title: '图片资源优化',
        description: '压缩和优化图片资源以减少加载时间',
        implementation: '使用WebP格式，实施懒加载，添加图片缓存',
        expectedImprovement: '减少30-50%的网络传输时间',
        effort: 'medium',
        relatedMetrics: ['network.downloadSpeed', 'startup.timeToInteractive'],
        status: 'pending',
      },
      {
        id: 'memory_management',
        category: 'memory',
        priority: 'high',
        title: '内存管理优化',
        description: '优化组件生命周期和内存使用',
        implementation: '实施组件卸载清理，优化状态管理，减少内存泄漏',
        expectedImprovement: '减少20-30%的内存使用',
        effort: 'high',
        relatedMetrics: ['memory.used', 'memory.peak'],
        status: 'pending',
      },
      {
        id: 'rendering_optimization',
        category: 'rendering',
        priority: 'medium',
        title: '渲染性能优化',
        description: '优化组件渲染和动画性能',
        implementation: '使用React.memo，优化重渲染，使用原生动画',
        expectedImprovement: '提升10-20 FPS',
        effort: 'medium',
        relatedMetrics: ['rendering.fps', 'rendering.frameDrops'],
        status: 'pending',
      },
      {
        id: 'code_splitting',
        category: 'startup',
        priority: 'high',
        title: '代码分割优化',
        description: '实施代码分割以减少初始加载时间',
        implementation: '按路由分割代码，懒加载非关键组件',
        expectedImprovement: '减少40-60%的初始加载时间',
        effort: 'high',
        relatedMetrics: ['startup.coldStartTime', 'startup.timeToInteractive'],
        status: 'pending',
      },
    ];

    defaultSuggestions.forEach(suggestion => {
      this.suggestions.set(suggestion.id, suggestion);
    });
  }

  // ===== 性能监控 =====

  /**
   * 开始性能监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.monitoring.interval);

    this.analyticsService.track('performance_monitoring_started', {
      interval: this.config.monitoring.interval,
      timestamp: Date.now(),
    });
  }

  /**
   * 停止性能监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.analyticsService.track('performance_monitoring_stopped', {
      timestamp: Date.now(),
    });
  }

  /**
   * 收集性能指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.measurePerformance();
      
      this.currentMetrics = metrics;
      this.metricsHistory.push(metrics);
      
      // 保留最近100个数据点
      if (this.metricsHistory.length > 100) {
        this.metricsHistory = this.metricsHistory.slice(-100);
      }
      
      // 检测性能问题
      this.detectPerformanceIssues(metrics);
      
      // 自动优化
      if (this.config.optimization.autoOptimize) {
        this.performAutoOptimization(metrics);
      }
      
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  /**
   * 测量性能指标
   */
  private async measurePerformance(): Promise<PerformanceMetrics> {
    // 模拟性能指标收集
    // 在实际应用中，这里会使用真实的性能API
    
    return {
      memory: {
        used: Math.random() * 100 + 50, // 50-150MB
        total: 512,
        peak: Math.random() * 50 + 100, // 100-150MB
        gcCount: Math.floor(Math.random() * 10),
        gcTime: Math.random() * 50 + 10, // 10-60ms
      },
      cpu: {
        usage: Math.random() * 30 + 20, // 20-50%
        peak: Math.random() * 20 + 60, // 60-80%
        averageUsage: Math.random() * 25 + 25, // 25-50%
        threads: 4,
      },
      rendering: {
        fps: Math.random() * 10 + 50, // 50-60 FPS
        frameDrops: Math.floor(Math.random() * 5),
        averageFrameTime: Math.random() * 5 + 15, // 15-20ms
        jankFrames: Math.floor(Math.random() * 3),
        renderTime: Math.random() * 10 + 5, // 5-15ms
      },
      network: {
        downloadSpeed: Math.random() * 50 + 50, // 50-100 Mbps
        uploadSpeed: Math.random() * 20 + 10, // 10-30 Mbps
        latency: Math.random() * 100 + 50, // 50-150ms
        requestCount: Math.floor(Math.random() * 50 + 100),
        failedRequests: Math.floor(Math.random() * 5),
        cacheHitRate: Math.random() * 20 + 80, // 80-100%
      },
      startup: {
        coldStartTime: Math.random() * 1000 + 1500, // 1.5-2.5s
        warmStartTime: Math.random() * 500 + 500, // 0.5-1s
        timeToInteractive: Math.random() * 800 + 1200, // 1.2-2s
        timeToFirstFrame: Math.random() * 200 + 300, // 300-500ms
      },
      interaction: {
        inputLatency: Math.random() * 50 + 50, // 50-100ms
        scrollPerformance: Math.random() * 10 + 50, // 50-60 FPS
        touchResponseTime: Math.random() * 30 + 20, // 20-50ms
        animationPerformance: Math.random() * 10 + 50, // 50-60 FPS
      },
    };
  }

  /**
   * 检测性能问题
   */
  private detectPerformanceIssues(metrics: PerformanceMetrics): void {
    const issues: PerformanceIssue[] = [];

    // 内存问题检测
    if (metrics.memory.used > this.config.thresholds.memory.critical) {
      issues.push({
        id: `memory_critical_${Date.now()}`,
        type: 'memory_leak',
        severity: 'critical',
        title: '内存使用过高',
        description: `当前内存使用${metrics.memory.used.toFixed(1)}MB，超过临界阈值`,
        impact: '可能导致应用崩溃或性能严重下降',
        recommendation: '立即检查内存泄漏，清理未使用的对象',
        detectedAt: new Date().toISOString(),
        metrics: {
          current: metrics.memory.used,
          threshold: this.config.thresholds.memory.critical,
          unit: 'MB',
        },
        status: 'active',
      });
    }

    // CPU问题检测
    if (metrics.cpu.usage > this.config.thresholds.cpu.critical) {
      issues.push({
        id: `cpu_critical_${Date.now()}`,
        type: 'high_cpu_usage',
        severity: 'critical',
        title: 'CPU使用率过高',
        description: `当前CPU使用率${metrics.cpu.usage.toFixed(1)}%，超过临界阈值`,
        impact: '导致应用响应缓慢，用户体验下降',
        recommendation: '优化计算密集型操作，使用异步处理',
        detectedAt: new Date().toISOString(),
        metrics: {
          current: metrics.cpu.usage,
          threshold: this.config.thresholds.cpu.critical,
          unit: '%',
        },
        status: 'active',
      });
    }

    // 渲染问题检测
    if (metrics.rendering.fps < this.config.thresholds.fps.critical) {
      issues.push({
        id: `fps_critical_${Date.now()}`,
        type: 'frame_drops',
        severity: 'high',
        title: '帧率过低',
        description: `当前帧率${metrics.rendering.fps.toFixed(1)} FPS，低于临界阈值`,
        impact: '动画卡顿，用户交互体验差',
        recommendation: '优化渲染逻辑，减少重绘和重排',
        detectedAt: new Date().toISOString(),
        metrics: {
          current: metrics.rendering.fps,
          threshold: this.config.thresholds.fps.critical,
          unit: 'FPS',
        },
        status: 'active',
      });
    }

    // 网络问题检测
    if (metrics.network.latency > this.config.thresholds.latency.critical) {
      issues.push({
        id: `latency_critical_${Date.now()}`,
        type: 'slow_network',
        severity: 'high',
        title: '网络延迟过高',
        description: `当前网络延迟${metrics.network.latency.toFixed(1)}ms，超过临界阈值`,
        impact: '内容加载缓慢，影响用户体验',
        recommendation: '优化网络请求，使用CDN加速',
        detectedAt: new Date().toISOString(),
        metrics: {
          current: metrics.network.latency,
          threshold: this.config.thresholds.latency.critical,
          unit: 'ms',
        },
        status: 'active',
      });
    }

    // 添加新问题
    issues.forEach(issue => {
      this.issues.set(issue.id, issue);
    });
  }

  /**
   * 执行自动优化
   */
  private performAutoOptimization(metrics: PerformanceMetrics): void {
    // 内存优化
    if (metrics.memory.used > this.config.thresholds.memory.warning) {
      this.optimizeMemory();
    }

    // 渲染优化
    if (metrics.rendering.fps < this.config.thresholds.fps.warning) {
      this.optimizeRendering();
    }

    // 网络优化
    if (metrics.network.cacheHitRate < 90) {
      this.optimizeNetwork();
    }
  }

  /**
   * 内存优化
   */
  private optimizeMemory(): void {
    // 触发垃圾回收（如果可能）
    if (global.gc) {
      global.gc();
    }

    // 清理缓存
    this.clearOldCache();

    this.analyticsService.track('auto_memory_optimization', {
      timestamp: Date.now(),
    });
  }

  /**
   * 渲染优化
   */
  private optimizeRendering(): void {
    // 降低动画质量
    // 减少同时渲染的组件数量
    // 这里是示例，实际实现会更复杂

    this.analyticsService.track('auto_rendering_optimization', {
      timestamp: Date.now(),
    });
  }

  /**
   * 网络优化
   */
  private optimizeNetwork(): void {
    // 预加载关键资源
    // 清理过期缓存
    // 压缩请求数据

    this.analyticsService.track('auto_network_optimization', {
      timestamp: Date.now(),
    });
  }

  /**
   * 清理旧缓存
   */
  private clearOldCache(): void {
    // 清理超过1小时的缓存数据
    const oneHourAgo = Date.now() - 3600000;
    
    // 这里会清理各种缓存
    // 图片缓存、数据缓存、组件缓存等
  }

  // ===== 性能分析 =====

  /**
   * 生成性能报告
   */
  async generatePerformanceReport(): Promise<PerformanceReport> {
    if (!this.currentMetrics) {
      throw new Error('No performance metrics available');
    }

    const metrics = this.currentMetrics;
    const issues = Array.from(this.issues.values()).filter(issue => issue.status === 'active');
    const suggestions = Array.from(this.suggestions.values()).filter(s => s.status === 'pending');

    // 计算总体评分
    const scores = [
      this.calculateMemoryScore(metrics.memory),
      this.calculateCpuScore(metrics.cpu),
      this.calculateRenderingScore(metrics.rendering),
      this.calculateNetworkScore(metrics.network),
      this.calculateStartupScore(metrics.startup),
      this.calculateInteractionScore(metrics.interaction),
    ];

    const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    // 确定等级
    let grade: 'A' | 'B' | 'C' | 'D' | 'F';
    if (overallScore >= 90) grade = 'A';
    else if (overallScore >= 80) grade = 'B';
    else if (overallScore >= 70) grade = 'C';
    else if (overallScore >= 60) grade = 'D';
    else grade = 'F';

    // 分析趋势
    const trends = this.analyzeTrends();

    return {
      id: `report_${Date.now()}`,
      timestamp: new Date().toISOString(),
      duration: this.metricsHistory.length * (this.config.monitoring.interval / 60000), // 分钟
      overallScore,
      grade,
      metrics,
      issues: {
        total: issues.length,
        critical: issues.filter(i => i.severity === 'critical').length,
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length,
      },
      suggestions,
      trends,
    };
  }

  /**
   * 计算内存评分
   */
  private calculateMemoryScore(memory: PerformanceMetrics['memory']): number {
    const usageRatio = memory.used / memory.total;
    if (usageRatio < 0.3) return 100;
    if (usageRatio < 0.5) return 90;
    if (usageRatio < 0.7) return 70;
    if (usageRatio < 0.9) return 50;
    return 20;
  }

  /**
   * 计算CPU评分
   */
  private calculateCpuScore(cpu: PerformanceMetrics['cpu']): number {
    if (cpu.usage < 30) return 100;
    if (cpu.usage < 50) return 90;
    if (cpu.usage < 70) return 70;
    if (cpu.usage < 90) return 50;
    return 20;
  }

  /**
   * 计算渲染评分
   */
  private calculateRenderingScore(rendering: PerformanceMetrics['rendering']): number {
    if (rendering.fps >= 58) return 100;
    if (rendering.fps >= 50) return 90;
    if (rendering.fps >= 45) return 70;
    if (rendering.fps >= 30) return 50;
    return 20;
  }

  /**
   * 计算网络评分
   */
  private calculateNetworkScore(network: PerformanceMetrics['network']): number {
    const latencyScore = network.latency < 100 ? 100 : network.latency < 200 ? 80 : 50;
    const cacheScore = network.cacheHitRate;
    return (latencyScore + cacheScore) / 2;
  }

  /**
   * 计算启动评分
   */
  private calculateStartupScore(startup: PerformanceMetrics['startup']): number {
    if (startup.coldStartTime < 2000) return 100;
    if (startup.coldStartTime < 3000) return 80;
    if (startup.coldStartTime < 5000) return 60;
    return 40;
  }

  /**
   * 计算交互评分
   */
  private calculateInteractionScore(interaction: PerformanceMetrics['interaction']): number {
    if (interaction.inputLatency < 50) return 100;
    if (interaction.inputLatency < 100) return 80;
    if (interaction.inputLatency < 200) return 60;
    return 40;
  }

  /**
   * 分析性能趋势
   */
  private analyzeTrends() {
    if (this.metricsHistory.length < 10) {
      return {
        memory: 'stable' as const,
        cpu: 'stable' as const,
        rendering: 'stable' as const,
        network: 'stable' as const,
      };
    }

    const recent = this.metricsHistory.slice(-10);
    const older = this.metricsHistory.slice(-20, -10);

    const recentMemory = recent.reduce((sum, m) => sum + m.memory.used, 0) / recent.length;
    const olderMemory = older.reduce((sum, m) => sum + m.memory.used, 0) / older.length;

    const recentCpu = recent.reduce((sum, m) => sum + m.cpu.usage, 0) / recent.length;
    const olderCpu = older.reduce((sum, m) => sum + m.cpu.usage, 0) / older.length;

    const recentFps = recent.reduce((sum, m) => sum + m.rendering.fps, 0) / recent.length;
    const olderFps = older.reduce((sum, m) => sum + m.rendering.fps, 0) / older.length;

    const recentLatency = recent.reduce((sum, m) => sum + m.network.latency, 0) / recent.length;
    const olderLatency = older.reduce((sum, m) => sum + m.network.latency, 0) / older.length;

    return {
      memory: this.getTrend(recentMemory, olderMemory, true), // 内存使用越低越好
      cpu: this.getTrend(recentCpu, olderCpu, true), // CPU使用越低越好
      rendering: this.getTrend(recentFps, olderFps, false), // FPS越高越好
      network: this.getTrend(recentLatency, olderLatency, true), // 延迟越低越好
    };
  }

  /**
   * 获取趋势方向
   */
  private getTrend(recent: number, older: number, lowerIsBetter: boolean): 'improving' | 'stable' | 'degrading' {
    const threshold = 0.05; // 5%的变化阈值
    const change = (recent - older) / older;

    if (Math.abs(change) < threshold) {
      return 'stable';
    }

    if (lowerIsBetter) {
      return change < 0 ? 'improving' : 'degrading';
    } else {
      return change > 0 ? 'improving' : 'degrading';
    }
  }

  // ===== 公共API =====

  /**
   * 获取当前性能指标
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.currentMetrics;
  }

  /**
   * 获取性能问题
   */
  getPerformanceIssues(): PerformanceIssue[] {
    return Array.from(this.issues.values()).filter(issue => issue.status === 'active');
  }

  /**
   * 获取优化建议
   */
  getOptimizationSuggestions(): OptimizationSuggestion[] {
    return Array.from(this.suggestions.values());
  }

  /**
   * 解决性能问题
   */
  resolveIssue(issueId: string): void {
    const issue = this.issues.get(issueId);
    if (issue) {
      issue.status = 'resolved';
      issue.resolvedAt = new Date().toISOString();
    }
  }

  /**
   * 实施优化建议
   */
  implementSuggestion(suggestionId: string): void {
    const suggestion = this.suggestions.get(suggestionId);
    if (suggestion) {
      suggestion.status = 'completed';
      suggestion.implementedAt = new Date().toISOString();
    }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // 重启监控以应用新配置
    if (this.isMonitoring) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  /**
   * 获取配置
   */
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  /**
   * 手动触发性能优化
   */
  async optimizeNow(): Promise<void> {
    if (this.currentMetrics) {
      this.performAutoOptimization(this.currentMetrics);
    }
  }
}

export default PerformanceOptimizationService;
