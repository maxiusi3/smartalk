/**
 * PredictiveInterventionSystem - 预测性学习干预系统
 * 主动识别学习困难并提供智能干预策略
 */

import { progressManager } from '../progressManager';
import { learningPathOptimizer } from './LearningPathOptimizer';
import { advancedAnalytics } from '../analytics/AdvancedAnalytics';

export interface LearningRisk {
  riskId: string;
  riskType: 'attention_decline' | 'motivation_drop' | 'skill_plateau' | 'memory_decay' | 
            'pronunciation_regression' | 'consistency_break' | 'overload_stress';
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: number; // 0-1
  timeToImpact: number; // 预计多少小时后会产生影响
  affectedAreas: string[];
  indicators: {
    metric: string;
    currentValue: number;
    threshold: number;
    trend: 'declining' | 'stagnant' | 'volatile';
  }[];
  detectedAt: string;
}

export interface InterventionStrategy {
  strategyId: string;
  strategyName: string;
  targetRisk: LearningRisk['riskType'];
  interventionType: 'immediate' | 'gradual' | 'preventive';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  
  // 干预措施
  actions: {
    actionType: 'adjust_difficulty' | 'change_strategy' | 'add_support' | 
               'modify_schedule' | 'provide_motivation' | 'skill_reinforcement';
    description: string;
    parameters: Record<string, any>;
    expectedImpact: string;
    timeToEffect: number; // 小时
  }[];
  
  // 成功指标
  successMetrics: {
    metric: string;
    targetValue: number;
    timeframe: number; // 小时
  }[];
  
  // 相关功能
  relatedFeatures: ('focus_mode' | 'pronunciation' | 'rescue_mode' | 'srs')[];
  
  confidence: number;
  estimatedEffectiveness: number;
  createdAt: string;
}

export interface InterventionExecution {
  executionId: string;
  strategyId: string;
  userId: string;
  startedAt: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'failed';
  
  // 执行进度
  progress: {
    completedActions: number;
    totalActions: number;
    currentPhase: string;
    nextMilestone: string;
  };
  
  // 效果监控
  monitoring: {
    metric: string;
    baseline: number;
    current: number;
    target: number;
    improvement: number;
  }[];
  
  // 用户反馈
  userFeedback: {
    satisfaction: number; // 1-5
    perceived_effectiveness: number; // 1-5
    comments: string;
    timestamp: string;
  } | null;
  
  completedAt?: string;
  results?: {
    success: boolean;
    metricsAchieved: string[];
    unexpectedOutcomes: string[];
    lessons: string[];
  };
}

export interface PredictiveAlert {
  alertId: string;
  alertType: 'warning' | 'critical' | 'opportunity';
  title: string;
  message: string;
  risk: LearningRisk;
  recommendedStrategies: InterventionStrategy[];
  urgency: number; // 0-1
  autoExecutable: boolean;
  userActionRequired: boolean;
  createdAt: string;
  expiresAt: string;
}

export class PredictiveInterventionSystem {
  private static instance: PredictiveInterventionSystem;
  private riskModels: Map<string, any> = new Map();
  private activeInterventions: Map<string, InterventionExecution> = new Map();
  private alertHistory: PredictiveAlert[] = [];

  private constructor() {
    this.initializeRiskModels();
  }

  static getInstance(): PredictiveInterventionSystem {
    if (!PredictiveInterventionSystem.instance) {
      PredictiveInterventionSystem.instance = new PredictiveInterventionSystem();
    }
    return PredictiveInterventionSystem.instance;
  }

  /**
   * 初始化风险预测模型
   */
  private initializeRiskModels(): void {
    // 注意力下降预测模型
    this.riskModels.set('attention_decline', {
      indicators: ['focus_mode_frequency', 'session_completion_rate', 'error_rate_increase'],
      thresholds: { focus_frequency: 0.3, completion_rate: 0.7, error_increase: 0.2 },
      weights: { focus_frequency: 0.4, completion_rate: 0.35, error_increase: 0.25 }
    });

    // 动机下降预测模型
    this.riskModels.set('motivation_drop', {
      indicators: ['session_frequency', 'session_duration', 'feature_engagement'],
      thresholds: { session_frequency: 0.5, session_duration: 0.6, feature_engagement: 0.4 },
      weights: { session_frequency: 0.5, session_duration: 0.3, feature_engagement: 0.2 }
    });

    // 技能平台期预测模型
    this.riskModels.set('skill_plateau', {
      indicators: ['accuracy_stagnation', 'improvement_rate', 'challenge_avoidance'],
      thresholds: { accuracy_stagnation: 0.05, improvement_rate: 0.02, challenge_avoidance: 0.3 },
      weights: { accuracy_stagnation: 0.4, improvement_rate: 0.4, challenge_avoidance: 0.2 }
    });
  }

  /**
   * 分析学习风险
   */
  async analyzeLearningRisks(userId: string): Promise<LearningRisk[]> {
    const comprehensiveStats = progressManager.getComprehensiveLearningStats();
    const analyticsReport = await advancedAnalytics.generateAdvancedReport(
      userId, 
      { 
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    );

    const risks: LearningRisk[] = [];

    // 分析注意力下降风险
    const attentionRisk = await this.analyzeAttentionRisk(comprehensiveStats);
    if (attentionRisk) risks.push(attentionRisk);

    // 分析动机下降风险
    const motivationRisk = await this.analyzeMotivationRisk(comprehensiveStats);
    if (motivationRisk) risks.push(motivationRisk);

    // 分析技能平台期风险
    const plateauRisk = await this.analyzeSkillPlateauRisk(comprehensiveStats, analyticsReport);
    if (plateauRisk) risks.push(plateauRisk);

    // 分析记忆衰退风险
    const memoryRisk = await this.analyzeMemoryDecayRisk(comprehensiveStats);
    if (memoryRisk) risks.push(memoryRisk);

    // 分析发音退化风险
    const pronunciationRisk = await this.analyzePronunciationRegressionRisk(comprehensiveStats);
    if (pronunciationRisk) risks.push(pronunciationRisk);

    return risks;
  }

  /**
   * 分析注意力下降风险
   */
  private async analyzeAttentionRisk(stats: any): Promise<LearningRisk | null> {
    const focusStats = stats.focusMode || {};
    const focusFrequency = (focusStats.triggered || 0) / Math.max(1, stats.overall?.totalSessions || 1);
    const completionRate = (stats.overall?.completedSessions || 0) / Math.max(1, stats.overall?.totalSessions || 1);
    const errorRate = 1 - (stats.overall?.overallAccuracy || 0) / 100;

    const model = this.riskModels.get('attention_decline');
    const riskScore = 
      (focusFrequency > model.thresholds.focus_frequency ? 1 : 0) * model.weights.focus_frequency +
      (completionRate < model.thresholds.completion_rate ? 1 : 0) * model.weights.completion_rate +
      (errorRate > model.thresholds.error_increase ? 1 : 0) * model.weights.error_increase;

    if (riskScore > 0.6) {
      return {
        riskId: `attention_risk_${Date.now()}`,
        riskType: 'attention_decline',
        severity: riskScore > 0.8 ? 'high' : 'medium',
        probability: riskScore,
        timeToImpact: 24, // 24小时内可能产生影响
        affectedAreas: ['focus_effectiveness', 'learning_accuracy', 'session_completion'],
        indicators: [
          {
            metric: 'focus_mode_frequency',
            currentValue: focusFrequency,
            threshold: model.thresholds.focus_frequency,
            trend: 'declining'
          },
          {
            metric: 'session_completion_rate',
            currentValue: completionRate,
            threshold: model.thresholds.completion_rate,
            trend: 'declining'
          }
        ],
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * 分析动机下降风险
   */
  private async analyzeMotivationRisk(stats: any): Promise<LearningRisk | null> {
    const totalSessions = stats.overall?.totalSessions || 0;
    const recentSessions = Math.max(0, totalSessions * 0.3); // 最近30%的会话
    const avgSessionTime = totalSessions > 0 ? (stats.overall?.totalTimeSpent || 0) / totalSessions : 0;
    const featureEngagement = (
      (stats.focusMode?.triggered || 0) + 
      (stats.pronunciation?.assessments || 0) + 
      (stats.rescueMode?.triggered || 0) + 
      (stats.srs?.reviewsToday || 0)
    ) / Math.max(1, totalSessions);

    const sessionFrequency = recentSessions / Math.max(1, totalSessions);
    const sessionDuration = avgSessionTime / 30; // 标准化到30分钟
    const engagement = Math.min(1, featureEngagement);

    const model = this.riskModels.get('motivation_drop');
    const riskScore = 
      (sessionFrequency < model.thresholds.session_frequency ? 1 : 0) * model.weights.session_frequency +
      (sessionDuration < model.thresholds.session_duration ? 1 : 0) * model.weights.session_duration +
      (engagement < model.thresholds.feature_engagement ? 1 : 0) * model.weights.feature_engagement;

    if (riskScore > 0.5) {
      return {
        riskId: `motivation_risk_${Date.now()}`,
        riskType: 'motivation_drop',
        severity: riskScore > 0.7 ? 'high' : 'medium',
        probability: riskScore,
        timeToImpact: 48, // 48小时内可能产生影响
        affectedAreas: ['learning_frequency', 'session_duration', 'feature_usage'],
        indicators: [
          {
            metric: 'session_frequency',
            currentValue: sessionFrequency,
            threshold: model.thresholds.session_frequency,
            trend: 'declining'
          },
          {
            metric: 'feature_engagement',
            currentValue: engagement,
            threshold: model.thresholds.feature_engagement,
            trend: 'declining'
          }
        ],
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * 分析技能平台期风险
   */
  private async analyzeSkillPlateauRisk(stats: any, analyticsReport: any): Promise<LearningRisk | null> {
    const stableTrends = analyticsReport.trends?.filter((t: any) => t.trend === 'stable').length || 0;
    const totalTrends = analyticsReport.trends?.length || 1;
    const stagnationRate = stableTrends / totalTrends;

    const overallAccuracy = stats.overall?.overallAccuracy || 0;
    const improvementRate = 0.02; // 模拟改进率计算

    if (stagnationRate > 0.7 && overallAccuracy > 70) {
      return {
        riskId: `plateau_risk_${Date.now()}`,
        riskType: 'skill_plateau',
        severity: 'medium',
        probability: stagnationRate,
        timeToImpact: 72, // 72小时内可能产生影响
        affectedAreas: ['skill_development', 'learning_progress', 'motivation'],
        indicators: [
          {
            metric: 'accuracy_stagnation',
            currentValue: stagnationRate,
            threshold: 0.7,
            trend: 'stagnant'
          }
        ],
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * 分析记忆衰退风险
   */
  private async analyzeMemoryDecayRisk(stats: any): Promise<LearningRisk | null> {
    const srsStats = stats.srs || {};
    const accuracyRate = srsStats.accuracyRate || 0;
    const reviewsToday = srsStats.reviewsToday || 0;
    const expectedReviews = srsStats.cardsTotal ? Math.ceil(srsStats.cardsTotal * 0.1) : 0;

    if (accuracyRate < 70 || reviewsToday < expectedReviews * 0.5) {
      return {
        riskId: `memory_risk_${Date.now()}`,
        riskType: 'memory_decay',
        severity: accuracyRate < 60 ? 'high' : 'medium',
        probability: 0.7,
        timeToImpact: 12, // 12小时内可能产生影响
        affectedAreas: ['memory_retention', 'srs_performance', 'long_term_learning'],
        indicators: [
          {
            metric: 'srs_accuracy_rate',
            currentValue: accuracyRate,
            threshold: 70,
            trend: 'declining'
          }
        ],
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * 分析发音退化风险
   */
  private async analyzePronunciationRegressionRisk(stats: any): Promise<LearningRisk | null> {
    const pronunciationStats = stats.pronunciation || {};
    const averageScore = pronunciationStats.averageScore || 0;
    const recentAssessments = pronunciationStats.assessments || 0;
    const rescueFrequency = (stats.rescueMode?.triggered || 0) / Math.max(1, recentAssessments);

    if (averageScore < 70 && rescueFrequency > 0.3) {
      return {
        riskId: `pronunciation_risk_${Date.now()}`,
        riskType: 'pronunciation_regression',
        severity: averageScore < 60 ? 'high' : 'medium',
        probability: 0.65,
        timeToImpact: 36, // 36小时内可能产生影响
        affectedAreas: ['pronunciation_accuracy', 'speaking_confidence', 'rescue_dependency'],
        indicators: [
          {
            metric: 'pronunciation_score',
            currentValue: averageScore,
            threshold: 70,
            trend: 'declining'
          },
          {
            metric: 'rescue_frequency',
            currentValue: rescueFrequency,
            threshold: 0.3,
            trend: 'volatile'
          }
        ],
        detectedAt: new Date().toISOString()
      };
    }

    return null;
  }

  /**
   * 生成干预策略
   */
  async generateInterventionStrategies(risks: LearningRisk[]): Promise<InterventionStrategy[]> {
    const strategies: InterventionStrategy[] = [];

    for (const risk of risks) {
      const strategy = await this.createStrategyForRisk(risk);
      if (strategy) {
        strategies.push(strategy);
      }
    }

    return strategies.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 为特定风险创建干预策略
   */
  private async createStrategyForRisk(risk: LearningRisk): Promise<InterventionStrategy | null> {
    const strategyTemplates = {
      attention_decline: {
        name: '注意力提升干预',
        type: 'immediate' as const,
        priority: 'high' as const,
        actions: [
          {
            actionType: 'adjust_difficulty' as const,
            description: '暂时降低学习难度，减少认知负荷',
            parameters: { difficulty_reduction: 0.2, duration_hours: 24 },
            expectedImpact: '减少错误率，提升专注力',
            timeToEffect: 2
          },
          {
            actionType: 'modify_schedule' as const,
            description: '缩短学习会话时间，增加休息间隔',
            parameters: { session_duration: 15, break_interval: 5 },
            expectedImpact: '提升注意力持续时间',
            timeToEffect: 1
          },
          {
            actionType: 'add_support' as const,
            description: '增加Focus Mode的使用频率和效果',
            parameters: { focus_sensitivity: 0.8, visual_enhancement: true },
            expectedImpact: '改善专注力和学习效果',
            timeToEffect: 1
          }
        ],
        relatedFeatures: ['focus_mode' as const],
        successMetrics: [
          { metric: 'focus_effectiveness', targetValue: 80, timeframe: 48 },
          { metric: 'session_completion_rate', targetValue: 85, timeframe: 72 }
        ]
      },

      motivation_drop: {
        name: '学习动机激励干预',
        type: 'gradual' as const,
        priority: 'high' as const,
        actions: [
          {
            actionType: 'provide_motivation' as const,
            description: '设置短期可达成的学习目标',
            parameters: { goal_difficulty: 0.7, reward_frequency: 'daily' },
            expectedImpact: '提升成就感和学习动机',
            timeToEffect: 4
          },
          {
            actionType: 'change_strategy' as const,
            description: '增加学习内容的趣味性和互动性',
            parameters: { gamification: true, variety_increase: 0.3 },
            expectedImpact: '提升学习兴趣和参与度',
            timeToEffect: 8
          },
          {
            actionType: 'modify_schedule' as const,
            description: '调整学习时间安排，适应用户偏好',
            parameters: { flexible_scheduling: true, reminder_optimization: true },
            expectedImpact: '提升学习频率和一致性',
            timeToEffect: 12
          }
        ],
        relatedFeatures: ['focus_mode' as const, 'pronunciation' as const, 'rescue_mode' as const, 'srs' as const],
        successMetrics: [
          { metric: 'session_frequency', targetValue: 0.8, timeframe: 168 },
          { metric: 'feature_engagement', targetValue: 0.6, timeframe: 120 }
        ]
      },

      skill_plateau: {
        name: '技能突破干预',
        type: 'gradual' as const,
        priority: 'medium' as const,
        actions: [
          {
            actionType: 'adjust_difficulty' as const,
            description: '逐步增加学习内容的挑战性',
            parameters: { difficulty_increase: 0.15, progression_rate: 0.05 },
            expectedImpact: '突破技能平台期，促进进步',
            timeToEffect: 24
          },
          {
            actionType: 'change_strategy' as const,
            description: '引入新的学习方法和练习类型',
            parameters: { strategy_variety: 0.4, new_content_ratio: 0.3 },
            expectedImpact: '刺激技能发展，避免停滞',
            timeToEffect: 48
          }
        ],
        relatedFeatures: ['pronunciation' as const, 'srs' as const],
        successMetrics: [
          { metric: 'skill_improvement_rate', targetValue: 0.05, timeframe: 168 },
          { metric: 'challenge_acceptance', targetValue: 0.7, timeframe: 120 }
        ]
      },

      memory_decay: {
        name: '记忆强化干预',
        type: 'immediate' as const,
        priority: 'urgent' as const,
        actions: [
          {
            actionType: 'skill_reinforcement' as const,
            description: '增加SRS复习频率，特别是困难卡片',
            parameters: { review_frequency_multiplier: 1.5, difficult_card_priority: true },
            expectedImpact: '改善记忆保持，提升复习效果',
            timeToEffect: 6
          },
          {
            actionType: 'change_strategy' as const,
            description: '使用多种记忆技巧和复习方法',
            parameters: { memory_techniques: ['spaced_repetition', 'active_recall', 'elaboration'] },
            expectedImpact: '增强记忆编码和检索',
            timeToEffect: 12
          }
        ],
        relatedFeatures: ['srs' as const],
        successMetrics: [
          { metric: 'srs_accuracy_rate', targetValue: 80, timeframe: 72 },
          { metric: 'memory_retention', targetValue: 85, timeframe: 168 }
        ]
      },

      pronunciation_regression: {
        name: '发音技能恢复干预',
        type: 'immediate' as const,
        priority: 'high' as const,
        actions: [
          {
            actionType: 'skill_reinforcement' as const,
            description: '增加发音练习频率，重点练习困难音素',
            parameters: { practice_frequency: 'daily', difficult_sounds_focus: true },
            expectedImpact: '改善发音准确性',
            timeToEffect: 8
          },
          {
            actionType: 'add_support' as const,
            description: '优化Rescue Mode的触发和指导策略',
            parameters: { rescue_sensitivity: 0.9, guidance_detail: 'high' },
            expectedImpact: '提供更好的发音指导',
            timeToEffect: 2
          }
        ],
        relatedFeatures: ['pronunciation' as const, 'rescue_mode' as const],
        successMetrics: [
          { metric: 'pronunciation_score', targetValue: 75, timeframe: 96 },
          { metric: 'rescue_dependency', targetValue: 0.2, timeframe: 168 }
        ]
      }
    };

    const template = strategyTemplates[risk.riskType];
    if (!template) return null;

    return {
      strategyId: `strategy_${risk.riskType}_${Date.now()}`,
      strategyName: template.name,
      targetRisk: risk.riskType,
      interventionType: template.type,
      priority: risk.severity === 'critical' ? 'urgent' : 
                risk.severity === 'high' ? 'high' : template.priority,
      actions: template.actions,
      successMetrics: template.successMetrics,
      relatedFeatures: template.relatedFeatures,
      confidence: 0.8,
      estimatedEffectiveness: 0.75,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 创建预测性警报
   */
  async createPredictiveAlert(
    risks: LearningRisk[], 
    strategies: InterventionStrategy[]
  ): Promise<PredictiveAlert[]> {
    const alerts: PredictiveAlert[] = [];

    for (const risk of risks) {
      const relatedStrategies = strategies.filter(s => s.targetRisk === risk.riskType);
      
      const alert: PredictiveAlert = {
        alertId: `alert_${risk.riskId}`,
        alertType: risk.severity === 'critical' ? 'critical' : 
                   risk.severity === 'high' ? 'warning' : 'warning',
        title: this.getRiskTitle(risk.riskType),
        message: this.getRiskMessage(risk),
        risk,
        recommendedStrategies: relatedStrategies,
        urgency: risk.probability * (risk.severity === 'critical' ? 1 : 
                                   risk.severity === 'high' ? 0.8 : 0.6),
        autoExecutable: risk.severity !== 'critical', // 严重风险需要用户确认
        userActionRequired: risk.severity === 'critical' || relatedStrategies.length === 0,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + risk.timeToImpact * 60 * 60 * 1000).toISOString()
      };

      alerts.push(alert);
    }

    // 保存到历史记录
    this.alertHistory.push(...alerts);
    
    // 保持历史记录在合理范围内
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }

    return alerts.sort((a, b) => b.urgency - a.urgency);
  }

  /**
   * 获取风险标题
   */
  private getRiskTitle(riskType: LearningRisk['riskType']): string {
    const titles = {
      attention_decline: '⚠️ 注意力下降风险',
      motivation_drop: '📉 学习动机下降',
      skill_plateau: '📊 技能发展停滞',
      memory_decay: '🧠 记忆衰退风险',
      pronunciation_regression: '🗣️ 发音技能退化',
      consistency_break: '📅 学习一致性中断',
      overload_stress: '😰 学习负荷过重'
    };
    return titles[riskType] || '⚠️ 学习风险警报';
  }

  /**
   * 获取风险消息
   */
  private getRiskMessage(risk: LearningRisk): string {
    const messages = {
      attention_decline: `检测到您的注意力可能在下降，预计在${risk.timeToImpact}小时内可能影响学习效果。建议采取相应措施改善专注力。`,
      motivation_drop: `您的学习动机可能在减弱，这可能影响学习频率和效果。建议调整学习策略以重新激发学习兴趣。`,
      skill_plateau: `您的技能发展可能进入平台期，建议增加学习挑战性以促进进一步提升。`,
      memory_decay: `检测到记忆保持可能出现问题，建议加强复习以巩固已学知识。`,
      pronunciation_regression: `您的发音技能可能在退化，建议增加发音练习并使用Rescue Mode获得更多指导。`,
      consistency_break: `学习一致性可能中断，建议调整学习计划以保持规律性。`,
      overload_stress: `学习负荷可能过重，建议适当调整学习强度和节奏。`
    };
    return messages[risk.riskType] || '检测到学习风险，建议采取相应措施。';
  }

  /**
   * 执行干预策略
   */
  async executeIntervention(
    strategyId: string, 
    userId: string
  ): Promise<InterventionExecution> {
    const execution: InterventionExecution = {
      executionId: `exec_${strategyId}_${Date.now()}`,
      strategyId,
      userId,
      startedAt: new Date().toISOString(),
      status: 'active',
      progress: {
        completedActions: 0,
        totalActions: 0, // 将在实际策略中设置
        currentPhase: 'initialization',
        nextMilestone: 'action_execution'
      },
      monitoring: [],
      userFeedback: null
    };

    this.activeInterventions.set(execution.executionId, execution);
    return execution;
  }

  /**
   * 获取活跃的干预
   */
  getActiveInterventions(userId: string): InterventionExecution[] {
    return Array.from(this.activeInterventions.values())
      .filter(intervention => intervention.userId === userId && intervention.status === 'active');
  }

  /**
   * 获取警报历史
   */
  getAlertHistory(userId: string, limit: number = 10): PredictiveAlert[] {
    return this.alertHistory
      .filter(alert => !alert.risk.riskId.includes('_test_')) // 过滤测试数据
      .slice(-limit);
  }

  /**
   * 清除过期警报
   */
  clearExpiredAlerts(): void {
    const now = new Date();
    this.alertHistory = this.alertHistory.filter(alert => new Date(alert.expiresAt) > now);
  }
}

// 创建全局实例
export const predictiveInterventionSystem = PredictiveInterventionSystem.getInstance();
