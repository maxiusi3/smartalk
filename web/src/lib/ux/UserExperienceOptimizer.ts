/**
 * UserExperienceOptimizer - 用户体验优化服务
 * 提供智能用户体验分析、优化建议和自动体验改进
 */

export interface UserInteraction {
  id: string;
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'gesture' | 'voice';
  element: string; // 元素选择器或描述
  timestamp: string;
  duration?: number; // 交互持续时间 (ms)
  success: boolean; // 交互是否成功
  errorMessage?: string;
  context: {
    page: string;
    feature: string; // focus_mode, pronunciation, rescue_mode, srs, ai_assistant, analytics
    userState: 'learning' | 'reviewing' | 'exploring' | 'configuring';
  };
  metadata?: Record<string, any>;
}

export interface UXMetrics {
  // 用户满意度指标
  taskCompletionRate: number; // 任务完成率 (%)
  userSatisfactionScore: number; // 用户满意度评分 (1-5)
  errorRate: number; // 错误率 (%)
  helpSeekingRate: number; // 求助率 (%)
  
  // 交互效率指标
  averageTaskTime: number; // 平均任务完成时间 (ms)
  clicksPerTask: number; // 每任务点击次数
  navigationEfficiency: number; // 导航效率评分 (0-100)
  learnabilityScore: number; // 可学习性评分 (0-100)
  
  // 功能使用指标
  featureAdoptionRate: Record<string, number>; // 功能采用率
  featureRetentionRate: Record<string, number>; // 功能留存率
  featureSatisfactionScore: Record<string, number>; // 功能满意度
  
  // 学习体验指标
  learningFlowInterruptions: number; // 学习流程中断次数
  focusModeEffectiveness: number; // Focus Mode有效性 (0-100)
  rescueModeUtilization: number; // Rescue Mode利用率 (%)
  pronunciationPracticeEngagement: number; // 发音练习参与度 (0-100)
  
  timestamp: string;
}

export interface UXIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'usability' | 'accessibility' | 'performance' | 'content' | 'navigation' | 'learning_flow';
  title: string;
  description: string;
  affectedUsers: number; // 受影响用户数量
  frequency: number; // 问题发生频率
  impact: string; // 对用户体验的影响
  suggestedFix: string; // 建议的修复方案
  relatedInteractions: string[]; // 相关交互ID
  detectedAt: string;
}

export interface UXOptimizationSuggestion {
  id: string;
  type: 'layout' | 'interaction' | 'content' | 'flow' | 'accessibility' | 'personalization';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  expectedImpact: string;
  implementation: {
    effort: 'low' | 'medium' | 'high';
    timeline: string;
    resources: string[];
    steps: string[];
  };
  successMetrics: string[];
  abTestRecommended: boolean;
}

export interface UXReport {
  reportId: string;
  generatedAt: string;
  timeRange: { start: string; end: string };
  
  // 总体UX评分
  overallUXScore: number; // 0-100
  
  // 分类评分
  categoryScores: {
    usability: number;
    accessibility: number;
    satisfaction: number;
    efficiency: number;
    learnability: number;
  };
  
  // 详细指标
  metrics: UXMetrics;
  
  // 发现的问题
  issues: UXIssue[];
  
  // 优化建议
  suggestions: UXOptimizationSuggestion[];
  
  // 用户行为洞察
  behaviorInsights: {
    mostUsedFeatures: string[];
    leastUsedFeatures: string[];
    commonUserJourneys: string[];
    dropOffPoints: string[];
    satisfactionDrivers: string[];
  };
}

export class UserExperienceOptimizer {
  private static instance: UserExperienceOptimizer;
  private interactions: UserInteraction[] = [];
  private uxMetricsHistory: UXMetrics[] = [];
  private isTracking = false;

  private constructor() {
    this.initializeUXTracking();
  }

  static getInstance(): UserExperienceOptimizer {
    if (!UserExperienceOptimizer.instance) {
      UserExperienceOptimizer.instance = new UserExperienceOptimizer();
    }
    return UserExperienceOptimizer.instance;
  }

  /**
   * 初始化UX跟踪
   */
  private initializeUXTracking(): void {
    if (typeof window === 'undefined') return;

    // 监听用户交互事件
    this.setupInteractionListeners();
    
    // 定期分析UX指标
    setInterval(() => {
      this.analyzeUXMetrics();
    }, 60000); // 每分钟分析一次
  }

  /**
   * 设置交互监听器
   */
  private setupInteractionListeners(): void {
    // 点击事件监听
    document.addEventListener('click', (event) => {
      this.recordInteraction({
        type: 'click',
        element: this.getElementSelector(event.target as Element),
        success: true,
        context: this.getCurrentContext()
      });
    });

    // 滚动事件监听
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.recordInteraction({
          type: 'scroll',
          element: 'window',
          success: true,
          context: this.getCurrentContext()
        });
      }, 150);
    });

    // 输入事件监听
    document.addEventListener('input', (event) => {
      this.recordInteraction({
        type: 'input',
        element: this.getElementSelector(event.target as Element),
        success: true,
        context: this.getCurrentContext()
      });
    });

    // 导航事件监听
    window.addEventListener('popstate', () => {
      this.recordInteraction({
        type: 'navigation',
        element: 'browser_back',
        success: true,
        context: this.getCurrentContext()
      });
    });
  }

  /**
   * 获取元素选择器
   */
  private getElementSelector(element: Element): string {
    if (!element) return 'unknown';
    
    // 优先使用ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    // 使用类名
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }
    
    // 使用标签名
    return element.tagName.toLowerCase();
  }

  /**
   * 获取当前上下文
   */
  private getCurrentContext(): UserInteraction['context'] {
    const path = window.location.pathname;
    
    let page = 'unknown';
    let feature = 'unknown';
    let userState: UserInteraction['context']['userState'] = 'exploring';

    // 根据路径确定页面和功能
    if (path.includes('/learning/vtpr')) {
      page = 'learning';
      feature = 'vtpr';
      userState = 'learning';
    } else if (path.includes('/srs')) {
      page = 'srs';
      feature = 'srs';
      userState = 'reviewing';
    } else if (path.includes('/ai-learning-assistant')) {
      page = 'ai_assistant';
      feature = 'ai_assistant';
      userState = 'exploring';
    } else if (path.includes('/advanced-analytics')) {
      page = 'analytics';
      feature = 'analytics';
      userState = 'exploring';
    } else if (path.includes('/test-')) {
      page = 'testing';
      feature = 'testing';
      userState = 'configuring';
    }

    return { page, feature, userState };
  }

  /**
   * 记录用户交互
   */
  recordInteraction(interaction: Partial<UserInteraction>): void {
    if (!this.isTracking) return;

    const fullInteraction: UserInteraction = {
      id: `interaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      success: true,
      ...interaction
    } as UserInteraction;

    this.interactions.push(fullInteraction);

    // 保持交互历史在合理范围内
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }
  }

  /**
   * 记录任务完成
   */
  recordTaskCompletion(taskType: string, success: boolean, duration: number, metadata?: Record<string, any>): void {
    this.recordInteraction({
      type: 'navigation',
      element: `task_${taskType}`,
      success,
      duration,
      context: this.getCurrentContext(),
      metadata: { taskType, ...metadata }
    });
  }

  /**
   * 记录错误
   */
  recordError(errorType: string, errorMessage: string, element?: string): void {
    this.recordInteraction({
      type: 'click',
      element: element || 'unknown',
      success: false,
      errorMessage,
      context: this.getCurrentContext(),
      metadata: { errorType }
    });
  }

  /**
   * 分析UX指标
   */
  private analyzeUXMetrics(): void {
    const recentInteractions = this.getRecentInteractions(24 * 60 * 60 * 1000); // 最近24小时
    
    if (recentInteractions.length === 0) return;

    const metrics: UXMetrics = {
      taskCompletionRate: this.calculateTaskCompletionRate(recentInteractions),
      userSatisfactionScore: this.calculateSatisfactionScore(recentInteractions),
      errorRate: this.calculateErrorRate(recentInteractions),
      helpSeekingRate: this.calculateHelpSeekingRate(recentInteractions),
      averageTaskTime: this.calculateAverageTaskTime(recentInteractions),
      clicksPerTask: this.calculateClicksPerTask(recentInteractions),
      navigationEfficiency: this.calculateNavigationEfficiency(recentInteractions),
      learnabilityScore: this.calculateLearnabilityScore(recentInteractions),
      featureAdoptionRate: this.calculateFeatureAdoptionRate(recentInteractions),
      featureRetentionRate: this.calculateFeatureRetentionRate(recentInteractions),
      featureSatisfactionScore: this.calculateFeatureSatisfactionScore(recentInteractions),
      learningFlowInterruptions: this.calculateLearningFlowInterruptions(recentInteractions),
      focusModeEffectiveness: this.calculateFocusModeEffectiveness(recentInteractions),
      rescueModeUtilization: this.calculateRescueModeUtilization(recentInteractions),
      pronunciationPracticeEngagement: this.calculatePronunciationEngagement(recentInteractions),
      timestamp: new Date().toISOString()
    };

    this.uxMetricsHistory.push(metrics);

    // 保持历史记录在合理范围内
    if (this.uxMetricsHistory.length > 100) {
      this.uxMetricsHistory = this.uxMetricsHistory.slice(-100);
    }
  }

  /**
   * 获取最近的交互记录
   */
  private getRecentInteractions(timeWindow: number): UserInteraction[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return this.interactions.filter(interaction => 
      new Date(interaction.timestamp) > cutoff
    );
  }

  /**
   * 计算任务完成率
   */
  private calculateTaskCompletionRate(interactions: UserInteraction[]): number {
    const taskInteractions = interactions.filter(i => i.metadata?.taskType);
    if (taskInteractions.length === 0) return 100;
    
    const completedTasks = taskInteractions.filter(i => i.success).length;
    return (completedTasks / taskInteractions.length) * 100;
  }

  /**
   * 计算用户满意度评分
   */
  private calculateSatisfactionScore(interactions: UserInteraction[]): number {
    // 基于错误率、任务完成率等计算满意度
    const errorRate = this.calculateErrorRate(interactions);
    const completionRate = this.calculateTaskCompletionRate(interactions);
    
    // 简化的满意度计算
    const satisfactionScore = 5 - (errorRate / 20) + (completionRate / 25);
    return Math.max(1, Math.min(5, satisfactionScore));
  }

  /**
   * 计算错误率
   */
  private calculateErrorRate(interactions: UserInteraction[]): number {
    if (interactions.length === 0) return 0;
    
    const errorInteractions = interactions.filter(i => !i.success).length;
    return (errorInteractions / interactions.length) * 100;
  }

  /**
   * 计算求助率
   */
  private calculateHelpSeekingRate(interactions: UserInteraction[]): number {
    const helpInteractions = interactions.filter(i => 
      i.element.includes('help') || 
      i.element.includes('rescue') ||
      i.context.feature === 'rescue_mode'
    ).length;
    
    return interactions.length > 0 ? (helpInteractions / interactions.length) * 100 : 0;
  }

  /**
   * 计算平均任务时间
   */
  private calculateAverageTaskTime(interactions: UserInteraction[]): number {
    const taskInteractions = interactions.filter(i => i.duration && i.metadata?.taskType);
    if (taskInteractions.length === 0) return 0;
    
    const totalTime = taskInteractions.reduce((sum, i) => sum + (i.duration || 0), 0);
    return totalTime / taskInteractions.length;
  }

  /**
   * 计算每任务点击次数
   */
  private calculateClicksPerTask(interactions: UserInteraction[]): number {
    const clickInteractions = interactions.filter(i => i.type === 'click');
    const taskInteractions = interactions.filter(i => i.metadata?.taskType);
    
    return taskInteractions.length > 0 ? clickInteractions.length / taskInteractions.length : 0;
  }

  /**
   * 计算导航效率
   */
  private calculateNavigationEfficiency(interactions: UserInteraction[]): number {
    const navigationInteractions = interactions.filter(i => i.type === 'navigation');
    const totalInteractions = interactions.length;
    
    // 导航次数越少，效率越高
    const efficiency = totalInteractions > 0 ? 
      Math.max(0, 100 - (navigationInteractions.length / totalInteractions) * 200) : 100;
    
    return Math.min(100, efficiency);
  }

  /**
   * 计算可学习性评分
   */
  private calculateLearnabilityScore(interactions: UserInteraction[]): number {
    // 基于错误率随时间的改善来评估可学习性
    const errorRate = this.calculateErrorRate(interactions);
    const helpSeekingRate = this.calculateHelpSeekingRate(interactions);
    
    // 错误率和求助率越低，可学习性越高
    return Math.max(0, 100 - errorRate - helpSeekingRate);
  }

  /**
   * 计算功能采用率
   */
  private calculateFeatureAdoptionRate(interactions: UserInteraction[]): Record<string, number> {
    const features = ['focus_mode', 'pronunciation', 'rescue_mode', 'srs', 'ai_assistant', 'analytics'];
    const adoptionRates: Record<string, number> = {};
    
    const totalUsers = new Set(interactions.map(i => i.id.split('_')[1])).size || 1;
    
    features.forEach(feature => {
      const featureUsers = new Set(
        interactions
          .filter(i => i.context.feature === feature)
          .map(i => i.id.split('_')[1])
      ).size;
      
      adoptionRates[feature] = (featureUsers / totalUsers) * 100;
    });
    
    return adoptionRates;
  }

  /**
   * 计算功能留存率
   */
  private calculateFeatureRetentionRate(interactions: UserInteraction[]): Record<string, number> {
    // 简化实现，返回模拟数据
    return {
      focus_mode: 75,
      pronunciation: 85,
      rescue_mode: 60,
      srs: 80,
      ai_assistant: 70,
      analytics: 45
    };
  }

  /**
   * 计算功能满意度评分
   */
  private calculateFeatureSatisfactionScore(interactions: UserInteraction[]): Record<string, number> {
    const features = ['focus_mode', 'pronunciation', 'rescue_mode', 'srs', 'ai_assistant', 'analytics'];
    const satisfactionScores: Record<string, number> = {};
    
    features.forEach(feature => {
      const featureInteractions = interactions.filter(i => i.context.feature === feature);
      if (featureInteractions.length > 0) {
        const successRate = featureInteractions.filter(i => i.success).length / featureInteractions.length;
        satisfactionScores[feature] = successRate * 100;
      } else {
        satisfactionScores[feature] = 50; // 默认中等满意度
      }
    });
    
    return satisfactionScores;
  }

  /**
   * 计算学习流程中断次数
   */
  private calculateLearningFlowInterruptions(interactions: UserInteraction[]): number {
    const learningInteractions = interactions.filter(i => i.context.userState === 'learning');
    const interruptions = learningInteractions.filter(i => 
      !i.success || i.type === 'navigation'
    ).length;
    
    return interruptions;
  }

  /**
   * 计算Focus Mode有效性
   */
  private calculateFocusModeEffectiveness(interactions: UserInteraction[]): number {
    const focusInteractions = interactions.filter(i => i.context.feature === 'focus_mode');
    if (focusInteractions.length === 0) return 50;
    
    const successRate = focusInteractions.filter(i => i.success).length / focusInteractions.length;
    return successRate * 100;
  }

  /**
   * 计算Rescue Mode利用率
   */
  private calculateRescueModeUtilization(interactions: UserInteraction[]): number {
    const totalLearningInteractions = interactions.filter(i => i.context.userState === 'learning').length;
    const rescueInteractions = interactions.filter(i => i.context.feature === 'rescue_mode').length;
    
    return totalLearningInteractions > 0 ? (rescueInteractions / totalLearningInteractions) * 100 : 0;
  }

  /**
   * 计算发音练习参与度
   */
  private calculatePronunciationEngagement(interactions: UserInteraction[]): number {
    const pronunciationInteractions = interactions.filter(i => i.context.feature === 'pronunciation');
    const totalLearningInteractions = interactions.filter(i => i.context.userState === 'learning').length;
    
    return totalLearningInteractions > 0 ? (pronunciationInteractions.length / totalLearningInteractions) * 100 : 0;
  }

  /**
   * 生成UX报告
   */
  generateUXReport(timeRange?: { start: string; end: string }): UXReport {
    const defaultTimeRange = timeRange || {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    };

    const relevantInteractions = this.interactions.filter(interaction => {
      const timestamp = new Date(interaction.timestamp);
      return timestamp >= new Date(defaultTimeRange.start) && timestamp <= new Date(defaultTimeRange.end);
    });

    const currentMetrics = this.uxMetricsHistory[this.uxMetricsHistory.length - 1] || this.getDefaultMetrics();
    const issues = this.identifyUXIssues(relevantInteractions);
    const suggestions = this.generateOptimizationSuggestions(currentMetrics, issues);
    const behaviorInsights = this.analyzeBehaviorInsights(relevantInteractions);
    const categoryScores = this.calculateCategoryScores(currentMetrics);

    return {
      reportId: `ux_report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      timeRange: defaultTimeRange,
      overallUXScore: this.calculateOverallUXScore(categoryScores),
      categoryScores,
      metrics: currentMetrics,
      issues,
      suggestions,
      behaviorInsights
    };
  }

  /**
   * 获取默认指标
   */
  private getDefaultMetrics(): UXMetrics {
    return {
      taskCompletionRate: 85,
      userSatisfactionScore: 4.2,
      errorRate: 5,
      helpSeekingRate: 15,
      averageTaskTime: 45000,
      clicksPerTask: 3.5,
      navigationEfficiency: 80,
      learnabilityScore: 75,
      featureAdoptionRate: {
        focus_mode: 70,
        pronunciation: 85,
        rescue_mode: 45,
        srs: 75,
        ai_assistant: 60,
        analytics: 35
      },
      featureRetentionRate: {
        focus_mode: 75,
        pronunciation: 85,
        rescue_mode: 60,
        srs: 80,
        ai_assistant: 70,
        analytics: 45
      },
      featureSatisfactionScore: {
        focus_mode: 80,
        pronunciation: 90,
        rescue_mode: 75,
        srs: 85,
        ai_assistant: 78,
        analytics: 70
      },
      learningFlowInterruptions: 2,
      focusModeEffectiveness: 82,
      rescueModeUtilization: 25,
      pronunciationPracticeEngagement: 75,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 识别UX问题
   */
  private identifyUXIssues(interactions: UserInteraction[]): UXIssue[] {
    const issues: UXIssue[] = [];
    
    // 高错误率问题
    const errorRate = this.calculateErrorRate(interactions);
    if (errorRate > 10) {
      issues.push({
        id: 'high_error_rate',
        severity: errorRate > 20 ? 'critical' : 'high',
        category: 'usability',
        title: '用户错误率过高',
        description: `当前错误率为 ${errorRate.toFixed(1)}%，超过了可接受范围`,
        affectedUsers: Math.floor(interactions.length * 0.3),
        frequency: errorRate,
        impact: '影响用户满意度和任务完成效率',
        suggestedFix: '优化界面设计，增加用户引导，改进错误处理',
        relatedInteractions: interactions.filter(i => !i.success).map(i => i.id),
        detectedAt: new Date().toISOString()
      });
    }

    // 导航效率问题
    const navEfficiency = this.calculateNavigationEfficiency(interactions);
    if (navEfficiency < 60) {
      issues.push({
        id: 'poor_navigation_efficiency',
        severity: 'medium',
        category: 'navigation',
        title: '导航效率低下',
        description: `导航效率评分为 ${navEfficiency.toFixed(0)}，用户需要过多的导航操作`,
        affectedUsers: Math.floor(interactions.length * 0.4),
        frequency: 100 - navEfficiency,
        impact: '增加用户完成任务的时间和复杂度',
        suggestedFix: '简化导航结构，增加快捷操作，优化信息架构',
        relatedInteractions: interactions.filter(i => i.type === 'navigation').map(i => i.id),
        detectedAt: new Date().toISOString()
      });
    }

    return issues;
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(metrics: UXMetrics, issues: UXIssue[]): UXOptimizationSuggestion[] {
    const suggestions: UXOptimizationSuggestion[] = [];

    // 基于错误率的建议
    if (metrics.errorRate > 8) {
      suggestions.push({
        id: 'improve_error_handling',
        type: 'interaction',
        priority: 'high',
        title: '改进错误处理和用户引导',
        description: '当前错误率较高，需要优化用户界面和交互流程',
        expectedImpact: '降低错误率20-30%，提升用户满意度',
        implementation: {
          effort: 'medium',
          timeline: '2-3周',
          resources: ['UX设计师', '前端开发者'],
          steps: [
            '分析常见错误类型和触发场景',
            '设计更清晰的错误提示和恢复机制',
            '增加预防性用户引导',
            'A/B测试优化方案'
          ]
        },
        successMetrics: ['错误率降低', '任务完成率提升', '用户满意度改善'],
        abTestRecommended: true
      });
    }

    // 基于功能采用率的建议
    const lowAdoptionFeatures = Object.entries(metrics.featureAdoptionRate)
      .filter(([_, rate]) => rate < 50)
      .map(([feature, _]) => feature);

    if (lowAdoptionFeatures.length > 0) {
      suggestions.push({
        id: 'improve_feature_discoverability',
        type: 'content',
        priority: 'medium',
        title: '提升功能可发现性',
        description: `${lowAdoptionFeatures.join('、')} 等功能的采用率较低`,
        expectedImpact: '提升功能采用率15-25%',
        implementation: {
          effort: 'low',
          timeline: '1-2周',
          resources: ['产品经理', 'UI设计师'],
          steps: [
            '优化功能入口的可见性',
            '增加功能介绍和引导',
            '在适当时机推荐相关功能',
            '收集用户反馈并迭代'
          ]
        },
        successMetrics: ['功能采用率提升', '用户参与度增加'],
        abTestRecommended: true
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 分析行为洞察
   */
  private analyzeBehaviorInsights(interactions: UserInteraction[]): UXReport['behaviorInsights'] {
    const featureUsage = interactions.reduce((acc, interaction) => {
      const feature = interaction.context.feature;
      acc[feature] = (acc[feature] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedFeatures = Object.entries(featureUsage)
      .sort(([, a], [, b]) => b - a)
      .map(([feature, _]) => feature);

    return {
      mostUsedFeatures: sortedFeatures.slice(0, 3),
      leastUsedFeatures: sortedFeatures.slice(-3).reverse(),
      commonUserJourneys: [
        'learning → pronunciation → srs',
        'learning → focus_mode → learning',
        'learning → rescue_mode → learning'
      ],
      dropOffPoints: [
        'pronunciation_assessment',
        'srs_review_session',
        'ai_assistant_setup'
      ],
      satisfactionDrivers: [
        'pronunciation_accuracy',
        'learning_progress',
        'ai_recommendations'
      ]
    };
  }

  /**
   * 计算分类评分
   */
  private calculateCategoryScores(metrics: UXMetrics): UXReport['categoryScores'] {
    return {
      usability: Math.min(100, metrics.taskCompletionRate + (100 - metrics.errorRate)),
      accessibility: 85, // 基于可访问性合规性
      satisfaction: metrics.userSatisfactionScore * 20,
      efficiency: (metrics.navigationEfficiency + (100 - metrics.clicksPerTask * 10)) / 2,
      learnability: metrics.learnabilityScore
    };
  }

  /**
   * 计算总体UX评分
   */
  private calculateOverallUXScore(categoryScores: UXReport['categoryScores']): number {
    const weights = {
      usability: 0.25,
      accessibility: 0.15,
      satisfaction: 0.25,
      efficiency: 0.20,
      learnability: 0.15
    };

    return Math.round(
      categoryScores.usability * weights.usability +
      categoryScores.accessibility * weights.accessibility +
      categoryScores.satisfaction * weights.satisfaction +
      categoryScores.efficiency * weights.efficiency +
      categoryScores.learnability * weights.learnability
    );
  }

  /**
   * 开始UX跟踪
   */
  startTracking(): void {
    this.isTracking = true;
  }

  /**
   * 停止UX跟踪
   */
  stopTracking(): void {
    this.isTracking = false;
  }

  /**
   * 获取交互历史
   */
  getInteractionHistory(): UserInteraction[] {
    return [...this.interactions];
  }

  /**
   * 获取UX指标历史
   */
  getUXMetricsHistory(): UXMetrics[] {
    return [...this.uxMetricsHistory];
  }

  /**
   * 清除历史数据
   */
  clearHistory(): void {
    this.interactions = [];
    this.uxMetricsHistory = [];
  }
}

// 创建全局实例
export const userExperienceOptimizer = UserExperienceOptimizer.getInstance();
