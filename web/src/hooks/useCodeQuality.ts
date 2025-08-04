/**
 * useCodeQuality - 代码质量管理Hook
 * 提供代码质量分析、重构管理和质量监控的React集成
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  codeQualityAnalyzer, 
  CodeQualityMetrics, 
  QualityReport, 
  CodeSmell, 
  RefactoringOpportunity 
} from '../lib/quality/CodeQualityAnalyzer';
import { 
  codeRefactoringEngine, 
  RefactoringPlan, 
  RefactoringTask, 
  RefactoringProgress, 
  RefactoringResult 
} from '../lib/quality/CodeRefactoringEngine';

export interface QualityStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number; // 0-100
  lastAnalyzed: string;
  trendsDirection: 'improving' | 'stable' | 'declining';
}

export interface QualityAlert {
  id: string;
  type: 'code_smell' | 'refactoring_needed' | 'quality_decline' | 'technical_debt';
  severity: 'critical' | 'major' | 'minor' | 'info';
  title: string;
  description: string;
  actionRequired: boolean;
  autoFixAvailable: boolean;
  createdAt: string;
}

export interface UseCodeQualityReturn {
  // 质量状态
  qualityStatus: QualityStatus | null;
  isAnalyzing: boolean;
  
  // 质量报告
  qualityReport: QualityReport | null;
  qualityMetrics: CodeQualityMetrics | null;
  codeSmells: CodeSmell[];
  refactoringOpportunities: RefactoringOpportunity[];
  
  // 重构管理
  refactoringPlans: RefactoringPlan[];
  activeRefactoringPlan: RefactoringPlan | null;
  refactoringProgress: RefactoringProgress | null;
  isRefactoring: boolean;
  
  // 质量警报
  qualityAlerts: QualityAlert[];
  
  // 操作方法
  analyzeCodeQuality: () => Promise<void>;
  createRefactoringPlan: (opportunities?: RefactoringOpportunity[]) => Promise<RefactoringPlan>;
  executeRefactoringTask: (taskId: string) => Promise<RefactoringResult>;
  cancelRefactoringPlan: (planId: string) => boolean;
  dismissAlert: (alertId: string) => void;
  
  // 统计信息
  qualityStats: {
    totalCodeSmells: number;
    criticalIssues: number;
    refactoringOpportunities: number;
    technicalDebtScore: number;
    qualityTrend: 'improving' | 'stable' | 'declining';
    lastAnalysisTime: string | null;
  } | null;
}

export function useCodeQuality(): UseCodeQualityReturn {
  // 状态管理
  const [qualityStatus, setQualityStatus] = useState<QualityStatus | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<CodeQualityMetrics | null>(null);
  const [codeSmells, setCodeSmells] = useState<CodeSmell[]>([]);
  const [refactoringOpportunities, setRefactoringOpportunities] = useState<RefactoringOpportunity[]>([]);
  
  const [refactoringPlans, setRefactoringPlans] = useState<RefactoringPlan[]>([]);
  const [activeRefactoringPlan, setActiveRefactoringPlan] = useState<RefactoringPlan | null>(null);
  const [refactoringProgress, setRefactoringProgress] = useState<RefactoringProgress | null>(null);
  const [isRefactoring, setIsRefactoring] = useState(false);
  
  const [qualityAlerts, setQualityAlerts] = useState<QualityAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // 分析代码质量
  const analyzeCodeQuality = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const report = await codeQualityAnalyzer.analyzeCodeQuality();
      setQualityReport(report);
      setQualityMetrics(report.metrics);
      setCodeSmells(report.codeSmells);
      setRefactoringOpportunities(report.refactoringOpportunities);
      
      // 更新质量状态
      const status: QualityStatus = {
        overall: getQualityLevel(report.overallQuality),
        score: report.overallQuality,
        lastAnalyzed: report.generatedAt,
        trendsDirection: report.trends.qualityTrend
      };
      setQualityStatus(status);
      
      // 生成质量警报
      const alerts = generateQualityAlerts(report);
      setQualityAlerts(prev => {
        const existingIds = new Set(prev.map(a => a.id));
        const newAlerts = alerts.filter(a => !existingIds.has(a.id));
        return [...prev, ...newAlerts];
      });
      
    } catch (error) {
      console.error('Failed to analyze code quality:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 创建重构计划
  const createRefactoringPlan = useCallback(async (opportunities?: RefactoringOpportunity[]): Promise<RefactoringPlan> => {
    const targetOpportunities = opportunities || refactoringOpportunities;
    const plan = codeRefactoringEngine.createRefactoringPlan(targetOpportunities, codeSmells);
    
    setRefactoringPlans(prev => [...prev, plan]);
    setActiveRefactoringPlan(plan);
    
    return plan;
  }, [refactoringOpportunities, codeSmells]);

  // 执行重构任务
  const executeRefactoringTask = useCallback(async (taskId: string): Promise<RefactoringResult> => {
    if (!activeRefactoringPlan) {
      throw new Error('No active refactoring plan');
    }

    setIsRefactoring(true);
    
    try {
      const result = await codeRefactoringEngine.executeRefactoringTask(taskId, activeRefactoringPlan.planId);
      
      // 更新重构进度
      const progress = codeRefactoringEngine.getRefactoringProgress(activeRefactoringPlan.planId);
      setRefactoringProgress(progress);
      
      // 更新计划状态
      const updatedPlans = codeRefactoringEngine.getActivePlans();
      setRefactoringPlans(updatedPlans);
      
      return result;
    } catch (error) {
      console.error('Failed to execute refactoring task:', error);
      throw error;
    } finally {
      setIsRefactoring(false);
    }
  }, [activeRefactoringPlan]);

  // 取消重构计划
  const cancelRefactoringPlan = useCallback((planId: string): boolean => {
    const success = codeRefactoringEngine.cancelRefactoringPlan(planId);
    
    if (success) {
      setRefactoringPlans(prev => prev.filter(p => p.planId !== planId));
      
      if (activeRefactoringPlan?.planId === planId) {
        setActiveRefactoringPlan(null);
        setRefactoringProgress(null);
      }
    }
    
    return success;
  }, [activeRefactoringPlan]);

  // 忽略警报
  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  }, []);

  // 初始化时进行质量分析
  useEffect(() => {
    analyzeCodeQuality();
  }, [analyzeCodeQuality]);

  // 定期更新重构进度
  useEffect(() => {
    if (!activeRefactoringPlan) return;

    const interval = setInterval(() => {
      const progress = codeRefactoringEngine.getRefactoringProgress(activeRefactoringPlan.planId);
      setRefactoringProgress(progress);
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [activeRefactoringPlan]);

  // 计算统计信息
  const qualityStats = qualityReport ? {
    totalCodeSmells: codeSmells.length,
    criticalIssues: codeSmells.filter(s => s.severity === 'critical').length,
    refactoringOpportunities: refactoringOpportunities.length,
    technicalDebtScore: qualityReport.metrics.technicalDebt,
    qualityTrend: qualityReport.trends.qualityTrend,
    lastAnalysisTime: qualityReport.generatedAt
  } : null;

  // 过滤已忽略的警报
  const filteredAlerts = qualityAlerts.filter(alert => !dismissedAlerts.has(alert.id));

  return {
    // 质量状态
    qualityStatus,
    isAnalyzing,
    
    // 质量报告
    qualityReport,
    qualityMetrics,
    codeSmells,
    refactoringOpportunities,
    
    // 重构管理
    refactoringPlans,
    activeRefactoringPlan,
    refactoringProgress,
    isRefactoring,
    
    // 质量警报
    qualityAlerts: filteredAlerts,
    
    // 操作方法
    analyzeCodeQuality,
    createRefactoringPlan,
    executeRefactoringTask,
    cancelRefactoringPlan,
    dismissAlert,
    
    // 统计信息
    qualityStats
  };
}

// 辅助函数
function getQualityLevel(score: number): QualityStatus['overall'] {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'fair';
  if (score >= 60) return 'poor';
  return 'critical';
}

function generateQualityAlerts(report: QualityReport): QualityAlert[] {
  const alerts: QualityAlert[] = [];

  // 基于代码异味生成警报
  const criticalSmells = report.codeSmells.filter(s => s.severity === 'critical');
  if (criticalSmells.length > 0) {
    alerts.push({
      id: `critical_smells_${Date.now()}`,
      type: 'code_smell',
      severity: 'critical',
      title: '发现严重代码异味',
      description: `检测到 ${criticalSmells.length} 个严重代码异味，需要立即处理`,
      actionRequired: true,
      autoFixAvailable: false,
      createdAt: new Date().toISOString()
    });
  }

  // 基于技术债务生成警报
  if (report.metrics.technicalDebt > 30) {
    alerts.push({
      id: `technical_debt_${Date.now()}`,
      type: 'technical_debt',
      severity: report.metrics.technicalDebt > 50 ? 'critical' : 'major',
      title: '技术债务过高',
      description: `当前技术债务评分为 ${report.metrics.technicalDebt}，建议进行重构`,
      actionRequired: report.metrics.technicalDebt > 50,
      autoFixAvailable: false,
      createdAt: new Date().toISOString()
    });
  }

  // 基于质量趋势生成警报
  if (report.trends.qualityTrend === 'declining') {
    alerts.push({
      id: `quality_decline_${Date.now()}`,
      type: 'quality_decline',
      severity: 'major',
      title: '代码质量下降',
      description: '代码质量呈下降趋势，建议关注代码质量管理',
      actionRequired: false,
      autoFixAvailable: false,
      createdAt: new Date().toISOString()
    });
  }

  // 基于重构机会生成警报
  const highPriorityOpportunities = report.refactoringOpportunities.filter(
    o => o.priority === 'critical' || o.priority === 'high'
  );
  if (highPriorityOpportunities.length > 0) {
    alerts.push({
      id: `refactoring_needed_${Date.now()}`,
      type: 'refactoring_needed',
      severity: 'major',
      title: '发现重构机会',
      description: `识别到 ${highPriorityOpportunities.length} 个高优先级重构机会`,
      actionRequired: false,
      autoFixAvailable: true,
      createdAt: new Date().toISOString()
    });
  }

  return alerts;
}

// 扩展Hook：用于代码质量监控
export function useCodeQualityMonitoring() {
  const {
    qualityStatus,
    qualityMetrics,
    codeSmells,
    qualityStats,
    analyzeCodeQuality
  } = useCodeQuality();
  
  return {
    qualityStatus,
    qualityMetrics,
    codeSmells,
    qualityStats,
    analyzeCodeQuality
  };
}

// 扩展Hook：用于重构管理
export function useRefactoringManagement() {
  const {
    refactoringPlans,
    activeRefactoringPlan,
    refactoringProgress,
    isRefactoring,
    createRefactoringPlan,
    executeRefactoringTask,
    cancelRefactoringPlan
  } = useCodeQuality();
  
  return {
    refactoringPlans,
    activeRefactoringPlan,
    refactoringProgress,
    isRefactoring,
    createRefactoringPlan,
    executeRefactoringTask,
    cancelRefactoringPlan
  };
}

// 扩展Hook：用于质量警报
export function useQualityAlerts() {
  const {
    qualityAlerts,
    dismissAlert
  } = useCodeQuality();
  
  return {
    qualityAlerts,
    dismissAlert
  };
}
