/**
 * useAdvancedAnalytics - 高级数据分析Hook
 * 提供深度学习分析、预测性干预和风险评估的React集成
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  advancedAnalytics, 
  AdvancedAnalyticsReport,
  LearningTrend,
  LearningPattern,
  PredictiveModel,
  LearningCorrelation
} from '../lib/analytics/AdvancedAnalytics';
import { 
  predictiveInterventionSystem,
  LearningRisk,
  InterventionStrategy,
  PredictiveAlert,
  InterventionExecution
} from '../lib/ai/PredictiveInterventionSystem';

export interface UseAdvancedAnalyticsReturn {
  // 分析报告
  analyticsReport: AdvancedAnalyticsReport | null;
  isReportLoading: boolean;
  reportError: string | null;
  
  // 趋势分析
  trends: LearningTrend[];
  patterns: LearningPattern[];
  predictions: PredictiveModel[];
  correlations: LearningCorrelation[];
  
  // 风险评估
  risks: LearningRisk[];
  isRiskAnalyzing: boolean;
  riskError: string | null;
  
  // 预测性干预
  alerts: PredictiveAlert[];
  interventionStrategies: InterventionStrategy[];
  activeInterventions: InterventionExecution[];
  
  // 操作方法
  generateReport: (timeRange?: { start: string; end: string }) => Promise<void>;
  analyzeRisks: () => Promise<void>;
  executeIntervention: (strategyId: string) => Promise<void>;
  dismissAlert: (alertId: string) => void;
  
  // 统计信息
  analyticsStats: {
    totalInsights: number;
    highRiskCount: number;
    activeInterventionCount: number;
    reportFreshness: number; // 小时
  } | null;
}

export function useAdvancedAnalytics(userId: string = 'default_user'): UseAdvancedAnalyticsReturn {
  // 状态管理
  const [analyticsReport, setAnalyticsReport] = useState<AdvancedAnalyticsReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  
  const [risks, setRisks] = useState<LearningRisk[]>([]);
  const [isRiskAnalyzing, setIsRiskAnalyzing] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);
  
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [interventionStrategies, setInterventionStrategies] = useState<InterventionStrategy[]>([]);
  const [activeInterventions, setActiveInterventions] = useState<InterventionExecution[]>([]);
  
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // 生成分析报告
  const generateReport = useCallback(async (timeRange?: { start: string; end: string }) => {
    if (!userId) return;
    
    setIsReportLoading(true);
    setReportError(null);
    
    try {
      const defaultTimeRange = timeRange || {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      };
      
      const report = await advancedAnalytics.generateAdvancedReport(userId, defaultTimeRange);
      setAnalyticsReport(report);
    } catch (error) {
      console.error('Failed to generate analytics report:', error);
      setReportError(error instanceof Error ? error.message : '生成分析报告失败');
    } finally {
      setIsReportLoading(false);
    }
  }, [userId]);

  // 分析学习风险
  const analyzeRisks = useCallback(async () => {
    if (!userId) return;
    
    setIsRiskAnalyzing(true);
    setRiskError(null);
    
    try {
      const detectedRisks = await predictiveInterventionSystem.analyzeLearningRisks(userId);
      setRisks(detectedRisks);
      
      // 生成干预策略
      const strategies = await predictiveInterventionSystem.generateInterventionStrategies(detectedRisks);
      setInterventionStrategies(strategies);
      
      // 创建预测性警报
      const newAlerts = await predictiveInterventionSystem.createPredictiveAlert(detectedRisks, strategies);
      setAlerts(prev => {
        // 合并新警报，避免重复
        const existingIds = new Set(prev.map(a => a.alertId));
        const uniqueNewAlerts = newAlerts.filter(a => !existingIds.has(a.alertId));
        return [...prev, ...uniqueNewAlerts].slice(-20); // 保留最近20个警报
      });
      
    } catch (error) {
      console.error('Failed to analyze learning risks:', error);
      setRiskError(error instanceof Error ? error.message : '风险分析失败');
    } finally {
      setIsRiskAnalyzing(false);
    }
  }, [userId]);

  // 执行干预策略
  const executeIntervention = useCallback(async (strategyId: string) => {
    try {
      const execution = await predictiveInterventionSystem.executeIntervention(strategyId, userId);
      setActiveInterventions(prev => [...prev, execution]);
      
      // 更新相关警报状态
      setAlerts(prev => prev.map(alert => {
        if (alert.recommendedStrategies.some(s => s.strategyId === strategyId)) {
          return { ...alert, userActionRequired: false };
        }
        return alert;
      }));
      
    } catch (error) {
      console.error('Failed to execute intervention:', error);
    }
  }, [userId]);

  // 忽略警报
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  // 初始化加载
  useEffect(() => {
    if (userId) {
      generateReport();
      analyzeRisks();
      
      // 加载活跃的干预
      const activeInterventions = predictiveInterventionSystem.getActiveInterventions(userId);
      setActiveInterventions(activeInterventions);
    }
  }, [userId, generateReport, analyzeRisks]);

  // 定期更新风险分析
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      analyzeRisks();
      
      // 清除过期警报
      predictiveInterventionSystem.clearExpiredAlerts();
      
      // 更新活跃干预状态
      const currentActiveInterventions = predictiveInterventionSystem.getActiveInterventions(userId);
      setActiveInterventions(currentActiveInterventions);
      
    }, 10 * 60 * 1000); // 每10分钟更新一次
    
    return () => clearInterval(interval);
  }, [userId, analyzeRisks]);

  // 计算统计信息
  const analyticsStats = analyticsReport ? {
    totalInsights: analyticsReport.insights.length,
    highRiskCount: risks.filter(r => r.severity === 'high' || r.severity === 'critical').length,
    activeInterventionCount: activeInterventions.filter(i => i.status === 'active').length,
    reportFreshness: Math.floor((Date.now() - new Date(analyticsReport.generatedAt).getTime()) / (1000 * 60 * 60))
  } : null;

  // 过滤已忽略的警报
  const filteredAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.alertId));

  return {
    // 分析报告
    analyticsReport,
    isReportLoading,
    reportError,
    
    // 趋势分析
    trends: analyticsReport?.trends || [],
    patterns: analyticsReport?.patterns || [],
    predictions: analyticsReport?.predictions || [],
    correlations: analyticsReport?.correlations || [],
    
    // 风险评估
    risks,
    isRiskAnalyzing,
    riskError,
    
    // 预测性干预
    alerts: filteredAlerts,
    interventionStrategies,
    activeInterventions,
    
    // 操作方法
    generateReport,
    analyzeRisks,
    executeIntervention,
    dismissAlert,
    
    // 统计信息
    analyticsStats
  };
}

// 扩展Hook：用于特定类型的趋势分析
export function useLearningTrends(trendType?: string) {
  const { trends } = useAdvancedAnalytics();
  
  if (trendType) {
    return trends.filter(trend => trend.metric.includes(trendType));
  }
  
  return trends;
}

// 扩展Hook：用于高风险警报
export function useHighRiskAlerts() {
  const { alerts } = useAdvancedAnalytics();
  
  return alerts.filter(alert => 
    alert.alertType === 'critical' || 
    (alert.alertType === 'warning' && alert.urgency > 0.7)
  );
}

// 扩展Hook：用于预测模型
export function usePredictiveModels(targetMetric?: string) {
  const { predictions } = useAdvancedAnalytics();
  
  if (targetMetric) {
    return predictions.filter(model => model.targetMetric === targetMetric);
  }
  
  return predictions;
}

// 扩展Hook：用于学习模式分析
export function useLearningPatterns(impactType?: 'positive' | 'negative' | 'neutral') {
  const { patterns } = useAdvancedAnalytics();
  
  if (impactType) {
    return patterns.filter(pattern => pattern.impact === impactType);
  }
  
  return patterns;
}

// 扩展Hook：用于相关性分析
export function useCorrelationAnalysis(minCorrelation: number = 0.3) {
  const { correlations } = useAdvancedAnalytics();
  
  return correlations.filter(corr => Math.abs(corr.correlation) >= minCorrelation);
}
