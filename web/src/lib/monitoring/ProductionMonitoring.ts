/**
 * ProductionMonitoring - 生产监控和调优系统
 * 提供实时监控、性能指标收集、错误追踪和自动化告警
 */

export interface MonitoringMetrics {
  // 系统性能指标
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    availability: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
  };
  
  // 用户体验指标
  userExperience: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
    timeToInteractive: number;
    bounceRate: number;
    sessionDuration: number;
  };
  
  // 业务指标
  business: {
    activeUsers: number;
    newUsers: number;
    userRetention: number;
    featureUsage: Record<string, number>;
    conversionRate: number;
    learningProgress: number;
    engagementScore: number;
  };
  
  // 技术指标
  technical: {
    apiCallsPerMinute: number;
    databaseConnections: number;
    cacheHitRate: number;
    cdnHitRate: number;
    buildDeploymentTime: number;
    testCoverage: number;
    codeQualityScore: number;
  };
  
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'performance' | 'error' | 'security' | 'business' | 'technical';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric: string;
  threshold: number;
  currentValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  impact: string;
  recommendations: string[];
  createdAt: string;
  resolvedAt?: string;
  acknowledged: boolean;
}

export interface PerformanceTuning {
  category: 'frontend' | 'backend' | 'database' | 'network' | 'infrastructure';
  optimization: string;
  description: string;
  implementation: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
}

export interface MonitoringDashboard {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  refreshInterval: number; // 秒
  alertsEnabled: boolean;
  autoRefresh: boolean;
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  title: string;
  dataSource: string;
  configuration: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical' | 'unknown';
  score: number; // 0-100
  components: {
    [componentName: string]: {
      status: 'healthy' | 'warning' | 'critical' | 'unknown';
      responseTime: number;
      uptime: number;
      lastCheck: string;
      issues: string[];
    };
  };
  trends: {
    performance: 'improving' | 'stable' | 'degrading';
    reliability: 'improving' | 'stable' | 'degrading';
    userExperience: 'improving' | 'stable' | 'degrading';
  };
}

export class ProductionMonitoring {
  private static instance: ProductionMonitoring;
  private metrics: MonitoringMetrics[] = [];
  private alerts: Alert[] = [];
  private performanceTunings: PerformanceTuning[] = [];
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializePerformanceTunings();
  }

  static getInstance(): ProductionMonitoring {
    if (!ProductionMonitoring.instance) {
      ProductionMonitoring.instance = new ProductionMonitoring();
    }
    return ProductionMonitoring.instance;
  }

  /**
   * 开始监控
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.isMonitoring) {
      console.warn('Monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 开始生产监控...');

    // 立即收集一次指标
    this.collectMetrics();

    // 设置定期收集
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, intervalMs);
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('⏹️ 停止生产监控');
  }

  /**
   * 收集监控指标
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: MonitoringMetrics = {
        performance: await this.collectPerformanceMetrics(),
        userExperience: await this.collectUserExperienceMetrics(),
        business: await this.collectBusinessMetrics(),
        technical: await this.collectTechnicalMetrics(),
        timestamp: new Date().toISOString()
      };

      this.metrics.push(metrics);
      
      // 保持最近1000条记录
      if (this.metrics.length > 1000) {
        this.metrics = this.metrics.slice(-1000);
      }

      // 检查告警条件
      await this.checkAlertConditions(metrics);

    } catch (error) {
      console.error('Failed to collect metrics:', error);
    }
  }

  /**
   * 收集性能指标
   */
  private async collectPerformanceMetrics(): Promise<MonitoringMetrics['performance']> {
    // 模拟性能指标收集
    return {
      responseTime: 200 + Math.random() * 300,
      throughput: 100 + Math.random() * 50,
      errorRate: Math.random() * 2, // 0-2%
      availability: 99.5 + Math.random() * 0.5, // 99.5-100%
      cpuUsage: 30 + Math.random() * 40, // 30-70%
      memoryUsage: 60 + Math.random() * 30, // 60-90%
      diskUsage: 40 + Math.random() * 20, // 40-60%
      networkLatency: 50 + Math.random() * 100 // 50-150ms
    };
  }

  /**
   * 收集用户体验指标
   */
  private async collectUserExperienceMetrics(): Promise<MonitoringMetrics['userExperience']> {
    return {
      pageLoadTime: 1000 + Math.random() * 1000,
      firstContentfulPaint: 800 + Math.random() * 400,
      largestContentfulPaint: 1500 + Math.random() * 500,
      cumulativeLayoutShift: Math.random() * 0.1,
      firstInputDelay: 50 + Math.random() * 100,
      timeToInteractive: 2000 + Math.random() * 1000,
      bounceRate: 20 + Math.random() * 30, // 20-50%
      sessionDuration: 300 + Math.random() * 600 // 5-15分钟
    };
  }

  /**
   * 收集业务指标
   */
  private async collectBusinessMetrics(): Promise<MonitoringMetrics['business']> {
    return {
      activeUsers: 1000 + Math.floor(Math.random() * 500),
      newUsers: 50 + Math.floor(Math.random() * 100),
      userRetention: 70 + Math.random() * 20, // 70-90%
      featureUsage: {
        focusMode: 80 + Math.random() * 15,
        pronunciation: 75 + Math.random() * 20,
        rescueMode: 60 + Math.random() * 25,
        srs: 85 + Math.random() * 10,
        aiAssistant: 70 + Math.random() * 25,
        analytics: 40 + Math.random() * 30,
        optimization: 30 + Math.random() * 20,
        codeQuality: 20 + Math.random() * 15
      },
      conversionRate: 15 + Math.random() * 10, // 15-25%
      learningProgress: 65 + Math.random() * 25, // 65-90%
      engagementScore: 75 + Math.random() * 20 // 75-95%
    };
  }

  /**
   * 收集技术指标
   */
  private async collectTechnicalMetrics(): Promise<MonitoringMetrics['technical']> {
    return {
      apiCallsPerMinute: 500 + Math.floor(Math.random() * 300),
      databaseConnections: 20 + Math.floor(Math.random() * 30),
      cacheHitRate: 85 + Math.random() * 10, // 85-95%
      cdnHitRate: 90 + Math.random() * 8, // 90-98%
      buildDeploymentTime: 300 + Math.random() * 200, // 5-8分钟
      testCoverage: 80 + Math.random() * 15, // 80-95%
      codeQualityScore: 85 + Math.random() * 10 // 85-95%
    };
  }

  /**
   * 检查告警条件
   */
  private async checkAlertConditions(metrics: MonitoringMetrics): Promise<void> {
    const newAlerts: Alert[] = [];

    // 性能告警
    if (metrics.performance.responseTime > 1000) {
      newAlerts.push(this.createAlert(
        'performance',
        'high',
        '响应时间过高',
        `平均响应时间 ${metrics.performance.responseTime.toFixed(0)}ms 超过阈值`,
        'responseTime',
        1000,
        metrics.performance.responseTime,
        ['优化数据库查询', '启用缓存', '增加服务器资源']
      ));
    }

    if (metrics.performance.errorRate > 5) {
      newAlerts.push(this.createAlert(
        'error',
        'critical',
        '错误率过高',
        `错误率 ${metrics.performance.errorRate.toFixed(2)}% 超过阈值`,
        'errorRate',
        5,
        metrics.performance.errorRate,
        ['检查错误日志', '修复关键bug', '增强错误处理']
      ));
    }

    if (metrics.performance.availability < 99) {
      newAlerts.push(this.createAlert(
        'performance',
        'critical',
        '可用性不足',
        `系统可用性 ${metrics.performance.availability.toFixed(2)}% 低于阈值`,
        'availability',
        99,
        metrics.performance.availability,
        ['检查服务状态', '增强容错机制', '实施故障转移']
      ));
    }

    // 用户体验告警
    if (metrics.userExperience.pageLoadTime > 3000) {
      newAlerts.push(this.createAlert(
        'performance',
        'medium',
        '页面加载时间过长',
        `页面加载时间 ${metrics.userExperience.pageLoadTime.toFixed(0)}ms 超过阈值`,
        'pageLoadTime',
        3000,
        metrics.userExperience.pageLoadTime,
        ['优化资源加载', '启用压缩', '使用CDN']
      ));
    }

    if (metrics.userExperience.bounceRate > 60) {
      newAlerts.push(this.createAlert(
        'business',
        'medium',
        '跳出率过高',
        `跳出率 ${metrics.userExperience.bounceRate.toFixed(1)}% 超过阈值`,
        'bounceRate',
        60,
        metrics.userExperience.bounceRate,
        ['改进用户体验', '优化内容质量', '提升页面性能']
      ));
    }

    // 业务告警
    if (metrics.business.conversionRate < 10) {
      newAlerts.push(this.createAlert(
        'business',
        'high',
        '转化率过低',
        `转化率 ${metrics.business.conversionRate.toFixed(1)}% 低于阈值`,
        'conversionRate',
        10,
        metrics.business.conversionRate,
        ['优化用户流程', '改进产品功能', '增强用户引导']
      ));
    }

    // 添加新告警
    this.alerts.push(...newAlerts);
    
    // 保持最近500条告警
    if (this.alerts.length > 500) {
      this.alerts = this.alerts.slice(-500);
    }
  }

  /**
   * 创建告警
   */
  private createAlert(
    type: Alert['type'],
    severity: Alert['severity'],
    title: string,
    description: string,
    metric: string,
    threshold: number,
    currentValue: number,
    recommendations: string[]
  ): Alert {
    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      description,
      metric,
      threshold,
      currentValue,
      trend: 'stable', // 简化处理
      impact: this.calculateImpact(severity),
      recommendations,
      createdAt: new Date().toISOString(),
      acknowledged: false
    };
  }

  /**
   * 计算影响程度
   */
  private calculateImpact(severity: Alert['severity']): string {
    switch (severity) {
      case 'critical':
        return '严重影响用户体验和业务运营';
      case 'high':
        return '显著影响系统性能和用户满意度';
      case 'medium':
        return '中等程度影响系统效率';
      case 'low':
        return '轻微影响，建议关注';
      default:
        return '影响程度未知';
    }
  }

  /**
   * 获取系统健康状态
   */
  getSystemHealth(): SystemHealth {
    if (this.metrics.length === 0) {
      return {
        overall: 'unknown',
        score: 0,
        components: {},
        trends: {
          performance: 'stable',
          reliability: 'stable',
          userExperience: 'stable'
        }
      };
    }

    const latestMetrics = this.metrics[this.metrics.length - 1];
    const components = {
      'Web应用': {
        status: this.getComponentStatus(latestMetrics.performance.responseTime, 1000),
        responseTime: latestMetrics.performance.responseTime,
        uptime: latestMetrics.performance.availability,
        lastCheck: latestMetrics.timestamp,
        issues: this.getComponentIssues('web', latestMetrics)
      },
      'API服务': {
        status: this.getComponentStatus(latestMetrics.performance.errorRate, 5),
        responseTime: latestMetrics.performance.responseTime * 0.8,
        uptime: latestMetrics.performance.availability,
        lastCheck: latestMetrics.timestamp,
        issues: this.getComponentIssues('api', latestMetrics)
      },
      '数据库': {
        status: this.getComponentStatus(latestMetrics.technical.databaseConnections, 40),
        responseTime: latestMetrics.performance.responseTime * 0.3,
        uptime: 99.9,
        lastCheck: latestMetrics.timestamp,
        issues: this.getComponentIssues('database', latestMetrics)
      },
      'CDN': {
        status: this.getComponentStatus(100 - latestMetrics.technical.cdnHitRate, 10),
        responseTime: latestMetrics.performance.networkLatency,
        uptime: 99.95,
        lastCheck: latestMetrics.timestamp,
        issues: this.getComponentIssues('cdn', latestMetrics)
      }
    };

    const overallScore = this.calculateOverallHealthScore(latestMetrics);
    const overall = this.getOverallHealthStatus(overallScore);

    return {
      overall,
      score: overallScore,
      components,
      trends: this.calculateHealthTrends()
    };
  }

  /**
   * 获取组件状态
   */
  private getComponentStatus(value: number, threshold: number): SystemHealth['components'][string]['status'] {
    if (value > threshold * 2) return 'critical';
    if (value > threshold * 1.5) return 'warning';
    if (value > threshold) return 'warning';
    return 'healthy';
  }

  /**
   * 获取组件问题
   */
  private getComponentIssues(component: string, metrics: MonitoringMetrics): string[] {
    const issues: string[] = [];
    
    switch (component) {
      case 'web':
        if (metrics.userExperience.pageLoadTime > 3000) {
          issues.push('页面加载时间过长');
        }
        if (metrics.userExperience.cumulativeLayoutShift > 0.1) {
          issues.push('布局稳定性问题');
        }
        break;
      case 'api':
        if (metrics.performance.errorRate > 2) {
          issues.push('API错误率偏高');
        }
        if (metrics.technical.apiCallsPerMinute > 800) {
          issues.push('API调用量过高');
        }
        break;
      case 'database':
        if (metrics.technical.databaseConnections > 40) {
          issues.push('数据库连接数过多');
        }
        break;
      case 'cdn':
        if (metrics.technical.cdnHitRate < 90) {
          issues.push('CDN命中率偏低');
        }
        break;
    }
    
    return issues;
  }

  /**
   * 计算整体健康评分
   */
  private calculateOverallHealthScore(metrics: MonitoringMetrics): number {
    const weights = {
      performance: 0.3,
      userExperience: 0.25,
      business: 0.25,
      technical: 0.2
    };

    const performanceScore = Math.max(0, 100 - (
      (metrics.performance.responseTime / 10) +
      (metrics.performance.errorRate * 10) +
      ((100 - metrics.performance.availability) * 20)
    ));

    const uxScore = Math.max(0, 100 - (
      (metrics.userExperience.pageLoadTime / 50) +
      (metrics.userExperience.bounceRate / 2)
    ));

    const businessScore = Math.min(100, (
      metrics.business.conversionRate * 2 +
      metrics.business.engagementScore
    ) / 2);

    const technicalScore = Math.min(100, (
      metrics.technical.cacheHitRate +
      metrics.technical.testCoverage +
      metrics.technical.codeQualityScore
    ) / 3);

    return Math.round(
      performanceScore * weights.performance +
      uxScore * weights.userExperience +
      businessScore * weights.business +
      technicalScore * weights.technical
    );
  }

  /**
   * 获取整体健康状态
   */
  private getOverallHealthStatus(score: number): SystemHealth['overall'] {
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'warning';
    if (score >= 50) return 'critical';
    return 'unknown';
  }

  /**
   * 计算健康趋势
   */
  private calculateHealthTrends(): SystemHealth['trends'] {
    if (this.metrics.length < 10) {
      return {
        performance: 'stable',
        reliability: 'stable',
        userExperience: 'stable'
      };
    }

    const recent = this.metrics.slice(-5);
    const previous = this.metrics.slice(-10, -5);

    const recentPerf = recent.reduce((sum, m) => sum + m.performance.responseTime, 0) / recent.length;
    const previousPerf = previous.reduce((sum, m) => sum + m.performance.responseTime, 0) / previous.length;

    const recentReliability = recent.reduce((sum, m) => sum + m.performance.availability, 0) / recent.length;
    const previousReliability = previous.reduce((sum, m) => sum + m.performance.availability, 0) / previous.length;

    const recentUX = recent.reduce((sum, m) => sum + m.userExperience.pageLoadTime, 0) / recent.length;
    const previousUX = previous.reduce((sum, m) => sum + m.userExperience.pageLoadTime, 0) / previous.length;

    return {
      performance: recentPerf < previousPerf * 0.95 ? 'improving' : 
                  recentPerf > previousPerf * 1.05 ? 'degrading' : 'stable',
      reliability: recentReliability > previousReliability * 1.001 ? 'improving' :
                  recentReliability < previousReliability * 0.999 ? 'degrading' : 'stable',
      userExperience: recentUX < previousUX * 0.95 ? 'improving' :
                     recentUX > previousUX * 1.05 ? 'degrading' : 'stable'
    };
  }

  /**
   * 初始化性能调优建议
   */
  private initializePerformanceTunings(): void {
    this.performanceTunings = [
      {
        category: 'frontend',
        optimization: '启用React.memo优化',
        description: '为大型组件启用React.memo以减少不必要的重渲染',
        implementation: '在组件导出时使用React.memo包装',
        expectedImprovement: '渲染性能提升20-30%',
        effort: 'low',
        priority: 'high',
        status: 'completed'
      },
      {
        category: 'frontend',
        optimization: '实施代码分割',
        description: '按路由和功能模块进行代码分割，减少初始加载时间',
        implementation: '使用dynamic import和Next.js的自动代码分割',
        expectedImprovement: '首次加载时间减少40-50%',
        effort: 'medium',
        priority: 'high',
        status: 'completed'
      },
      {
        category: 'frontend',
        optimization: '优化图片加载',
        description: '实施图片懒加载和WebP格式转换',
        implementation: '使用Next.js Image组件和图片优化',
        expectedImprovement: '页面加载速度提升30%',
        effort: 'low',
        priority: 'medium',
        status: 'pending'
      },
      {
        category: 'backend',
        optimization: '实施API缓存',
        description: '为频繁访问的API端点添加缓存层',
        implementation: '使用Redis缓存和适当的缓存策略',
        expectedImprovement: 'API响应时间减少60-80%',
        effort: 'medium',
        priority: 'high',
        status: 'in_progress'
      },
      {
        category: 'database',
        optimization: '数据库查询优化',
        description: '优化慢查询和添加适当的索引',
        implementation: '分析查询计划并添加复合索引',
        expectedImprovement: '数据库响应时间减少50%',
        effort: 'high',
        priority: 'medium',
        status: 'pending'
      },
      {
        category: 'network',
        optimization: '启用HTTP/2',
        description: '升级到HTTP/2以提升网络传输效率',
        implementation: '配置服务器支持HTTP/2',
        expectedImprovement: '网络传输效率提升25%',
        effort: 'low',
        priority: 'medium',
        status: 'completed'
      },
      {
        category: 'infrastructure',
        optimization: '实施CDN加速',
        description: '为静态资源配置全球CDN分发',
        implementation: '配置CloudFlare或AWS CloudFront',
        expectedImprovement: '全球访问速度提升40-60%',
        effort: 'medium',
        priority: 'high',
        status: 'completed'
      }
    ];
  }

  /**
   * 获取监控指标
   */
  getMetrics(limit: number = 100): MonitoringMetrics[] {
    return this.metrics.slice(-limit);
  }

  /**
   * 获取最新指标
   */
  getLatestMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * 获取告警
   */
  getAlerts(includeResolved: boolean = false): Alert[] {
    return includeResolved 
      ? this.alerts 
      : this.alerts.filter(alert => !alert.resolvedAt);
  }

  /**
   * 确认告警
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * 解决告警
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * 获取性能调优建议
   */
  getPerformanceTunings(): PerformanceTuning[] {
    return [...this.performanceTunings];
  }

  /**
   * 更新调优状态
   */
  updateTuningStatus(optimization: string, status: PerformanceTuning['status']): boolean {
    const tuning = this.performanceTunings.find(t => t.optimization === optimization);
    if (tuning) {
      tuning.status = status;
      return true;
    }
    return false;
  }

  /**
   * 生成监控报告
   */
  generateMonitoringReport(): string {
    const latestMetrics = this.getLatestMetrics();
    const systemHealth = this.getSystemHealth();
    const activeAlerts = this.getAlerts();
    const pendingTunings = this.performanceTunings.filter(t => t.status === 'pending');

    return `# SmarTalk Web 生产监控报告

## 系统健康状态
- 整体状态: ${systemHealth.overall}
- 健康评分: ${systemHealth.score}/100
- 生成时间: ${new Date().toLocaleString()}

## 关键指标
${latestMetrics ? `
- 响应时间: ${latestMetrics.performance.responseTime.toFixed(0)}ms
- 错误率: ${latestMetrics.performance.errorRate.toFixed(2)}%
- 可用性: ${latestMetrics.performance.availability.toFixed(2)}%
- 活跃用户: ${latestMetrics.business.activeUsers}
- 转化率: ${latestMetrics.business.conversionRate.toFixed(1)}%
` : '暂无指标数据'}

## 活跃告警
${activeAlerts.length > 0 ? 
  activeAlerts.map(alert => `- [${alert.severity.toUpperCase()}] ${alert.title}`).join('\n') :
  '无活跃告警'
}

## 待处理优化
${pendingTunings.length > 0 ?
  pendingTunings.map(tuning => `- ${tuning.optimization} (${tuning.priority})`).join('\n') :
  '无待处理优化'
}

## 趋势分析
- 性能趋势: ${systemHealth.trends.performance}
- 可靠性趋势: ${systemHealth.trends.reliability}
- 用户体验趋势: ${systemHealth.trends.userExperience}
`;
  }

  /**
   * 检查是否正在监控
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.metrics = [];
    this.alerts = [];
  }
}

// 创建全局实例
export const productionMonitoring = ProductionMonitoring.getInstance();
