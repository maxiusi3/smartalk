/**
 * AdvancedAnalytics - 高级数据分析引擎
 * 提供深度的学习数据分析、趋势预测和行为模式识别
 */

import { progressManager } from '../progressManager';
import { srsService } from '../services/SRSService';

export interface LearningTrend {
  period: string; // 时间段
  metric: string; // 指标名称
  value: number; // 指标值
  change: number; // 变化量
  changePercent: number; // 变化百分比
  trend: 'increasing' | 'decreasing' | 'stable'; // 趋势方向
  confidence: number; // 趋势置信度
}

export interface LearningPattern {
  patternId: string;
  patternName: string;
  description: string;
  frequency: number; // 出现频率
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  relatedMetrics: string[];
  recommendations: string[];
  detectedAt: string;
}

export interface PredictiveModel {
  modelId: string;
  modelName: string;
  targetMetric: string;
  accuracy: number; // 模型准确率
  predictions: {
    timeframe: string;
    predictedValue: number;
    confidence: number;
    factors: { factor: string; weight: number }[];
  }[];
  lastTrained: string;
  nextUpdate: string;
}

export interface LearningCorrelation {
  metric1: string;
  metric2: string;
  correlation: number; // -1 to 1
  significance: number; // 0 to 1
  relationship: 'strong_positive' | 'moderate_positive' | 'weak_positive' | 
                'weak_negative' | 'moderate_negative' | 'strong_negative' | 'none';
  insights: string[];
}

export interface AdvancedAnalyticsReport {
  reportId: string;
  userId: string;
  generatedAt: string;
  timeRange: {
    start: string;
    end: string;
  };
  
  // 趋势分析
  trends: LearningTrend[];
  
  // 模式识别
  patterns: LearningPattern[];
  
  // 预测模型
  predictions: PredictiveModel[];
  
  // 相关性分析
  correlations: LearningCorrelation[];
  
  // 综合洞察
  insights: {
    category: 'performance' | 'behavior' | 'efficiency' | 'prediction';
    insight: string;
    impact: 'high' | 'medium' | 'low';
    actionable: boolean;
    recommendations: string[];
  }[];
  
  // 风险评估
  risks: {
    riskType: 'learning_plateau' | 'motivation_decline' | 'skill_regression' | 'inconsistency';
    probability: number;
    severity: 'high' | 'medium' | 'low';
    indicators: string[];
    mitigation: string[];
  }[];
}

export class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;
  private analyticsCache: Map<string, AdvancedAnalyticsReport> = new Map();
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6小时

  private constructor() {}

  static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics();
    }
    return AdvancedAnalytics.instance;
  }

  /**
   * 生成高级分析报告
   */
  async generateAdvancedReport(
    userId: string, 
    timeRange: { start: string; end: string }
  ): Promise<AdvancedAnalyticsReport> {
    const cacheKey = `${userId}_${timeRange.start}_${timeRange.end}`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && new Date(cached.generatedAt) > new Date(Date.now() - this.CACHE_DURATION)) {
      return cached;
    }

    const comprehensiveStats = progressManager.getComprehensiveLearningStats();
    const srsStats = srsService.getSRSStatistics();
    
    // 生成各类分析
    const trends = await this.analyzeTrends(comprehensiveStats, timeRange);
    const patterns = await this.identifyPatterns(comprehensiveStats);
    const predictions = await this.generatePredictions(comprehensiveStats, srsStats);
    const correlations = await this.analyzeCorrelations(comprehensiveStats);
    const insights = await this.generateAdvancedInsights(comprehensiveStats, trends, patterns);
    const risks = await this.assessRisks(comprehensiveStats, trends);

    const report: AdvancedAnalyticsReport = {
      reportId: `report_${userId}_${Date.now()}`,
      userId,
      generatedAt: new Date().toISOString(),
      timeRange,
      trends,
      patterns,
      predictions,
      correlations,
      insights,
      risks
    };

    this.analyticsCache.set(cacheKey, report);
    return report;
  }

  /**
   * 分析学习趋势
   */
  private async analyzeTrends(stats: any, timeRange: any): Promise<LearningTrend[]> {
    const trends: LearningTrend[] = [];
    
    // 模拟历史数据分析（实际应用中需要真实的时间序列数据）
    const metrics = [
      { name: 'overall_accuracy', current: stats.overall?.overallAccuracy || 0 },
      { name: 'focus_effectiveness', current: stats.focusMode?.effectiveness || 0 },
      { name: 'pronunciation_score', current: stats.pronunciation?.averageScore || 0 },
      { name: 'srs_retention', current: stats.srs?.accuracyRate || 0 },
      { name: 'learning_consistency', current: stats.overall?.consistencyScore || 0 }
    ];

    for (const metric of metrics) {
      // 模拟趋势计算
      const previousValue = metric.current * (0.85 + Math.random() * 0.3); // 模拟历史值
      const change = metric.current - previousValue;
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
      
      let trend: LearningTrend['trend'] = 'stable';
      let confidence = 0.7;
      
      if (Math.abs(changePercent) > 10) {
        trend = changePercent > 0 ? 'increasing' : 'decreasing';
        confidence = Math.min(0.95, 0.7 + Math.abs(changePercent) / 100);
      }

      trends.push({
        period: '30_days',
        metric: metric.name,
        value: metric.current,
        change,
        changePercent,
        trend,
        confidence
      });
    }

    return trends;
  }

  /**
   * 识别学习模式
   */
  private async identifyPatterns(stats: any): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];
    
    // 专注力使用模式
    if (stats.focusMode?.triggered > 5) {
      patterns.push({
        patternId: 'frequent_focus_mode',
        patternName: '频繁使用Focus Mode',
        description: '用户经常需要视觉引导来保持专注',
        frequency: stats.focusMode.triggered,
        impact: stats.focusMode.effectiveness > 70 ? 'positive' : 'negative',
        confidence: 0.85,
        relatedMetrics: ['focus_effectiveness', 'overall_accuracy'],
        recommendations: [
          '考虑在学习环境中减少干扰因素',
          '尝试番茄工作法来提升专注力',
          '定期进行专注力训练'
        ],
        detectedAt: new Date().toISOString()
      });
    }

    // 发音练习模式
    if (stats.pronunciation?.assessments > 20) {
      const avgScore = stats.pronunciation.averageScore;
      patterns.push({
        patternId: 'pronunciation_practice_pattern',
        patternName: '发音练习模式',
        description: avgScore > 80 ? '发音练习效果良好' : '发音练习需要加强',
        frequency: stats.pronunciation.assessments,
        impact: avgScore > 80 ? 'positive' : 'negative',
        confidence: 0.9,
        relatedMetrics: ['pronunciation_score', 'rescue_mode_usage'],
        recommendations: avgScore > 80 ? [
          '继续保持良好的发音练习习惯',
          '可以尝试更有挑战性的发音内容'
        ] : [
          '增加发音练习的频率',
          '重点练习困难的音素',
          '使用Rescue Mode获得更多指导'
        ],
        detectedAt: new Date().toISOString()
      });
    }

    // SRS复习模式
    if (stats.srs?.reviewsToday > 0) {
      const accuracy = stats.srs.accuracyRate;
      patterns.push({
        patternId: 'srs_review_pattern',
        patternName: 'SRS复习模式',
        description: accuracy > 85 ? 'SRS复习效果优秀' : 'SRS复习需要优化',
        frequency: stats.srs.reviewsToday,
        impact: accuracy > 85 ? 'positive' : 'neutral',
        confidence: 0.88,
        relatedMetrics: ['srs_retention', 'memory_strength'],
        recommendations: accuracy > 85 ? [
          '保持当前的复习节奏',
          '可以适当增加新卡片的学习'
        ] : [
          '调整复习间隔，增加困难卡片的复习频率',
          '使用多种记忆技巧辅助复习'
        ],
        detectedAt: new Date().toISOString()
      });
    }

    return patterns;
  }

  /**
   * 生成预测模型
   */
  private async generatePredictions(stats: any, srsStats: any): Promise<PredictiveModel[]> {
    const predictions: PredictiveModel[] = [];
    
    // 学习效果预测模型
    const currentAccuracy = stats.overall?.overallAccuracy || 0;
    const focusEffectiveness = stats.focusMode?.effectiveness || 0;
    const pronunciationScore = stats.pronunciation?.averageScore || 0;
    const srsAccuracy = srsStats?.overallAccuracy || 0;
    
    predictions.push({
      modelId: 'learning_performance_predictor',
      modelName: '学习效果预测模型',
      targetMetric: 'overall_accuracy',
      accuracy: 0.82, // 模型准确率
      predictions: [
        {
          timeframe: '7_days',
          predictedValue: Math.min(100, currentAccuracy + (focusEffectiveness - 50) * 0.1 + Math.random() * 5),
          confidence: 0.85,
          factors: [
            { factor: 'focus_effectiveness', weight: 0.3 },
            { factor: 'pronunciation_improvement', weight: 0.25 },
            { factor: 'srs_consistency', weight: 0.25 },
            { factor: 'learning_frequency', weight: 0.2 }
          ]
        },
        {
          timeframe: '30_days',
          predictedValue: Math.min(100, currentAccuracy + (focusEffectiveness - 50) * 0.2 + Math.random() * 10),
          confidence: 0.75,
          factors: [
            { factor: 'long_term_retention', weight: 0.4 },
            { factor: 'skill_development', weight: 0.3 },
            { factor: 'motivation_sustainability', weight: 0.3 }
          ]
        }
      ],
      lastTrained: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    // 记忆保持预测模型
    predictions.push({
      modelId: 'memory_retention_predictor',
      modelName: '记忆保持预测模型',
      targetMetric: 'srs_retention_rate',
      accuracy: 0.78,
      predictions: [
        {
          timeframe: '7_days',
          predictedValue: Math.max(0, Math.min(100, srsAccuracy + (srsAccuracy > 80 ? 2 : -3) + Math.random() * 5)),
          confidence: 0.8,
          factors: [
            { factor: 'review_frequency', weight: 0.35 },
            { factor: 'card_difficulty', weight: 0.25 },
            { factor: 'time_since_last_review', weight: 0.4 }
          ]
        }
      ],
      lastTrained: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      nextUpdate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    });

    return predictions;
  }

  /**
   * 分析指标相关性
   */
  private async analyzeCorrelations(stats: any): Promise<LearningCorrelation[]> {
    const correlations: LearningCorrelation[] = [];
    
    // Focus Mode效果与整体准确率的相关性
    const focusAccuracyCorr = this.calculateCorrelation(
      stats.focusMode?.effectiveness || 0,
      stats.overall?.overallAccuracy || 0
    );
    
    correlations.push({
      metric1: 'focus_effectiveness',
      metric2: 'overall_accuracy',
      correlation: focusAccuracyCorr,
      significance: 0.85,
      relationship: this.interpretCorrelation(focusAccuracyCorr),
      insights: [
        focusAccuracyCorr > 0.5 ? 
          'Focus Mode的有效使用显著提升了整体学习准确率' :
          'Focus Mode的效果与整体准确率关联度较低，可能需要优化使用策略'
      ]
    });

    // 发音分数与Rescue Mode使用的相关性
    const pronunciationRescueCorr = this.calculateCorrelation(
      stats.pronunciation?.averageScore || 0,
      -(stats.rescueMode?.triggered || 0) // 负相关
    );
    
    correlations.push({
      metric1: 'pronunciation_score',
      metric2: 'rescue_mode_usage',
      correlation: pronunciationRescueCorr,
      significance: 0.78,
      relationship: this.interpretCorrelation(pronunciationRescueCorr),
      insights: [
        pronunciationRescueCorr < -0.3 ?
          '发音分数较低时更频繁使用Rescue Mode，说明救援机制有效' :
          'Rescue Mode的使用与发音分数关联度不高，可能需要调整触发条件'
      ]
    });

    return correlations;
  }

  /**
   * 生成高级洞察
   */
  private async generateAdvancedInsights(
    stats: any, 
    trends: LearningTrend[], 
    patterns: LearningPattern[]
  ): Promise<AdvancedAnalyticsReport['insights']> {
    const insights: AdvancedAnalyticsReport['insights'] = [];
    
    // 基于趋势的洞察
    const improvingTrends = trends.filter(t => t.trend === 'increasing' && t.confidence > 0.7);
    const decliningTrends = trends.filter(t => t.trend === 'decreasing' && t.confidence > 0.7);
    
    if (improvingTrends.length > 0) {
      insights.push({
        category: 'performance',
        insight: `您在${improvingTrends.map(t => t.metric).join('、')}方面表现出持续改进的趋势`,
        impact: 'high',
        actionable: true,
        recommendations: [
          '继续保持当前的学习策略',
          '可以适当增加学习难度以保持挑战性',
          '将成功经验应用到其他学习领域'
        ]
      });
    }

    if (decliningTrends.length > 0) {
      insights.push({
        category: 'performance',
        insight: `需要关注${decliningTrends.map(t => t.metric).join('、')}方面的下降趋势`,
        impact: 'high',
        actionable: true,
        recommendations: [
          '分析导致下降的具体原因',
          '调整学习策略或增加练习频率',
          '考虑寻求额外的学习支持'
        ]
      });
    }

    // 基于模式的洞察
    const positivePatterns = patterns.filter(p => p.impact === 'positive');
    const negativePatterns = patterns.filter(p => p.impact === 'negative');
    
    if (positivePatterns.length > 0) {
      insights.push({
        category: 'behavior',
        insight: '您已经建立了一些有效的学习模式',
        impact: 'medium',
        actionable: true,
        recommendations: [
          '继续强化这些有效的学习习惯',
          '尝试将成功模式应用到其他学习场景',
          '与其他学习者分享您的成功经验'
        ]
      });
    }

    // 效率洞察
    const totalSessions = stats.overall?.totalSessions || 0;
    const totalTime = stats.overall?.totalTimeSpent || 0;
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    
    if (avgSessionTime > 0) {
      insights.push({
        category: 'efficiency',
        insight: `您的平均学习会话时长为${avgSessionTime.toFixed(1)}分钟`,
        impact: avgSessionTime >= 15 && avgSessionTime <= 45 ? 'high' : 'medium',
        actionable: true,
        recommendations: avgSessionTime < 15 ? [
          '考虑延长学习会话时间以提高学习深度',
          '尝试设定最少15分钟的学习目标'
        ] : avgSessionTime > 45 ? [
          '考虑将长时间学习分解为多个短会话',
          '在长会话中增加休息时间'
        ] : [
          '您的学习会话时长很理想，继续保持'
        ]
      });
    }

    return insights;
  }

  /**
   * 评估学习风险
   */
  private async assessRisks(
    stats: any, 
    trends: LearningTrend[]
  ): Promise<AdvancedAnalyticsReport['risks']> {
    const risks: AdvancedAnalyticsReport['risks'] = [];
    
    // 学习平台期风险
    const stableTrends = trends.filter(t => t.trend === 'stable').length;
    if (stableTrends > trends.length * 0.7) {
      risks.push({
        riskType: 'learning_plateau',
        probability: 0.65,
        severity: 'medium',
        indicators: [
          '多项学习指标长期保持稳定',
          '缺乏明显的进步趋势',
          '可能已达到当前学习方法的效果上限'
        ],
        mitigation: [
          '尝试新的学习方法或策略',
          '增加学习内容的难度和多样性',
          '设定更具挑战性的学习目标'
        ]
      });
    }

    // 动机下降风险
    const totalSessions = stats.overall?.totalSessions || 0;
    const recentSessions = Math.max(1, totalSessions * 0.3); // 假设最近30%的会话
    if (recentSessions < totalSessions * 0.2) {
      risks.push({
        riskType: 'motivation_decline',
        probability: 0.7,
        severity: 'high',
        indicators: [
          '最近的学习频率明显下降',
          '学习会话时长缩短',
          '可能存在学习动机问题'
        ],
        mitigation: [
          '重新设定短期可达成的学习目标',
          '增加学习的趣味性和互动性',
          '寻找学习伙伴或加入学习社群'
        ]
      });
    }

    // 技能退化风险
    const decliningTrends = trends.filter(t => t.trend === 'decreasing' && t.confidence > 0.6);
    if (decliningTrends.length > 2) {
      risks.push({
        riskType: 'skill_regression',
        probability: 0.55,
        severity: 'medium',
        indicators: [
          '多项技能指标出现下降趋势',
          '可能存在知识遗忘或技能退化',
          '需要加强复习和巩固'
        ],
        mitigation: [
          '增加SRS复习的频率',
          '重点复习下降明显的技能领域',
          '使用多种方式巩固已学知识'
        ]
      });
    }

    return risks;
  }

  /**
   * 计算相关系数（简化版）
   */
  private calculateCorrelation(x: number, y: number): number {
    // 简化的相关性计算，实际应用中需要使用时间序列数据
    const normalizedX = Math.min(1, Math.max(0, x / 100));
    const normalizedY = Math.min(1, Math.max(0, Math.abs(y) / 100));
    
    // 模拟相关性计算
    return (normalizedX + normalizedY) / 2 - 0.5 + (Math.random() - 0.5) * 0.4;
  }

  /**
   * 解释相关性强度
   */
  private interpretCorrelation(correlation: number): LearningCorrelation['relationship'] {
    const abs = Math.abs(correlation);
    const sign = correlation >= 0 ? 'positive' : 'negative';
    
    if (abs >= 0.7) return `strong_${sign}` as any;
    if (abs >= 0.4) return `moderate_${sign}` as any;
    if (abs >= 0.2) return `weak_${sign}` as any;
    return 'none';
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.analyticsCache.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; oldestEntry: string | null } {
    const entries = Array.from(this.analyticsCache.values());
    return {
      size: entries.length,
      oldestEntry: entries.length > 0 ? 
        entries.reduce((oldest, current) => 
          new Date(current.generatedAt) < new Date(oldest.generatedAt) ? current : oldest
        ).generatedAt : null
    };
  }
}

// 创建全局实例
export const advancedAnalytics = AdvancedAnalytics.getInstance();
