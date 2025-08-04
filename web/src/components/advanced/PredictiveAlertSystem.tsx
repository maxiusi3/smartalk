/**
 * PredictiveAlertSystem - 预测性警报系统组件
 * 显示智能学习风险警报和干预建议
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { PredictiveAlert, LearningRisk } from '../../lib/ai/PredictiveInterventionSystem';

interface PredictiveAlertSystemProps {
  className?: string;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  maxAlerts?: number;
}

export default function PredictiveAlertSystem({ 
  className = '', 
  position = 'top-right',
  maxAlerts = 3 
}: PredictiveAlertSystemProps) {
  const {
    alerts,
    executeIntervention,
    dismissAlert,
    isRiskAnalyzing
  } = useAdvancedAnalytics();

  const [visibleAlerts, setVisibleAlerts] = useState<PredictiveAlert[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // 更新可见警报
  useEffect(() => {
    const sortedAlerts = alerts
      .filter(alert => new Date(alert.expiresAt) > new Date()) // 过滤过期警报
      .sort((a, b) => b.urgency - a.urgency) // 按紧急程度排序
      .slice(0, maxAlerts); // 限制显示数量
    
    setVisibleAlerts(sortedAlerts);
  }, [alerts, maxAlerts]);

  // 如果没有警报，不显示组件
  if (visibleAlerts.length === 0 && !isRiskAnalyzing) {
    return null;
  }

  // 获取位置样式
  const getPositionStyles = () => {
    const baseStyles = 'fixed z-50';
    switch (position) {
      case 'top-right':
        return `${baseStyles} top-4 right-4`;
      case 'bottom-right':
        return `${baseStyles} bottom-4 right-4`;
      case 'top-left':
        return `${baseStyles} top-4 left-4`;
      case 'bottom-left':
        return `${baseStyles} bottom-4 left-4`;
      default:
        return `${baseStyles} top-4 right-4`;
    }
  };

  // 获取警报类型图标
  const getAlertIcon = (alertType: PredictiveAlert['alertType']) => {
    switch (alertType) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'opportunity': return '💡';
      default: return 'ℹ️';
    }
  };

  // 获取警报颜色
  const getAlertColor = (alertType: PredictiveAlert['alertType'], urgency: number) => {
    if (alertType === 'critical' || urgency > 0.8) {
      return {
        bg: 'bg-red-500',
        border: 'border-red-400',
        text: 'text-red-100',
        contentBg: 'bg-red-50',
        contentText: 'text-red-900',
        contentBorder: 'border-red-200'
      };
    } else if (alertType === 'warning' || urgency > 0.6) {
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-400',
        text: 'text-yellow-100',
        contentBg: 'bg-yellow-50',
        contentText: 'text-yellow-900',
        contentBorder: 'border-yellow-200'
      };
    } else {
      return {
        bg: 'bg-blue-500',
        border: 'border-blue-400',
        text: 'text-blue-100',
        contentBg: 'bg-blue-50',
        contentText: 'text-blue-900',
        contentBorder: 'border-blue-200'
      };
    }
  };

  // 获取风险严重程度文本
  const getRiskSeverityText = (severity: LearningRisk['severity']) => {
    switch (severity) {
      case 'critical': return '严重';
      case 'high': return '高';
      case 'medium': return '中等';
      case 'low': return '低';
      default: return '未知';
    }
  };

  // 处理警报操作
  const handleExecuteIntervention = async (alert: PredictiveAlert) => {
    if (alert.recommendedStrategies.length > 0) {
      try {
        await executeIntervention(alert.recommendedStrategies[0].strategyId);
        // 可以添加成功提示
      } catch (error) {
        console.error('Failed to execute intervention:', error);
        // 可以添加错误提示
      }
    }
  };

  const handleDismissAlert = (alertId: string) => {
    dismissAlert(alertId);
    setExpandedAlert(null);
  };

  return (
    <div className={`${getPositionStyles()} ${className}`}>
      <div className="space-y-3 max-w-sm">
        {/* 分析状态指示器 */}
        {isRiskAnalyzing && (
          <div className="bg-purple-500 text-purple-100 rounded-lg p-3 shadow-lg border border-purple-400">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-100"></div>
              <span className="text-sm font-medium">正在分析学习风险...</span>
            </div>
          </div>
        )}

        {/* 警报列表 */}
        {visibleAlerts.map((alert) => {
          const colors = getAlertColor(alert.alertType, alert.urgency);
          const isExpanded = expandedAlert === alert.alertId;
          
          return (
            <div
              key={alert.alertId}
              className={`${colors.bg} ${colors.border} ${colors.text} rounded-lg shadow-lg border transition-all duration-300 ${
                isExpanded ? 'transform scale-105' : ''
              }`}
            >
              {/* 警报头部 */}
              <div
                className="p-3 cursor-pointer"
                onClick={() => setExpandedAlert(isExpanded ? null : alert.alertId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <span className="text-lg">{getAlertIcon(alert.alertType)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-xs opacity-90 mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded">
                      {(alert.urgency * 100).toFixed(0)}%
                    </span>
                    <span className="text-lg">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 展开的详细信息 */}
              {isExpanded && (
                <div className={`${colors.contentBg} ${colors.contentBorder} ${colors.contentText} border-t rounded-b-lg p-4`}>
                  {/* 风险详情 */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm mb-2">风险详情</h5>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>风险类型:</span>
                        <span className="font-medium">
                          {alert.risk.riskType === 'attention_decline' && '注意力下降'}
                          {alert.risk.riskType === 'motivation_drop' && '动机下降'}
                          {alert.risk.riskType === 'skill_plateau' && '技能停滞'}
                          {alert.risk.riskType === 'memory_decay' && '记忆衰退'}
                          {alert.risk.riskType === 'pronunciation_regression' && '发音退化'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>严重程度:</span>
                        <span className="font-medium">{getRiskSeverityText(alert.risk.severity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>风险概率:</span>
                        <span className="font-medium">{(alert.risk.probability * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>预计影响时间:</span>
                        <span className="font-medium">{alert.risk.timeToImpact}小时内</span>
                      </div>
                    </div>
                  </div>

                  {/* 影响领域 */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm mb-2">影响领域</h5>
                    <div className="flex flex-wrap gap-1">
                      {alert.risk.affectedAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/20 text-xs rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 推荐策略 */}
                  {alert.recommendedStrategies.length > 0 && (
                    <div className="mb-4">
                      <h5 className="font-semibold text-sm mb-2">推荐干预策略</h5>
                      <div className="space-y-2">
                        {alert.recommendedStrategies.slice(0, 2).map((strategy, index) => (
                          <div key={index} className="bg-white/10 rounded p-2">
                            <div className="font-medium text-xs">{strategy.strategyName}</div>
                            <div className="text-xs opacity-80 mt-1">
                              预期效果: {(strategy.estimatedEffectiveness * 100).toFixed(0)}%
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex space-x-2">
                    {alert.recommendedStrategies.length > 0 && (
                      <button
                        onClick={() => handleExecuteIntervention(alert)}
                        className="flex-1 px-3 py-2 bg-white/20 hover:bg-white/30 text-xs font-medium rounded transition-colors"
                      >
                        {alert.autoExecutable ? '自动执行' : '立即处理'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDismissAlert(alert.alertId)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-xs rounded transition-colors"
                    >
                      忽略
                    </button>
                  </div>

                  {/* 过期时间 */}
                  <div className="mt-3 text-xs opacity-60 text-center">
                    警报过期时间: {new Date(alert.expiresAt).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 查看更多按钮 */}
        {alerts.length > maxAlerts && (
          <div className="text-center">
            <a
              href="/ai-learning-assistant?view=risks"
              className="inline-block px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              查看全部 {alerts.length} 个警报
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// 简化版本的警报指示器
export function PredictiveAlertIndicator() {
  const { alerts, analyticsStats } = useAdvancedAnalytics();
  
  const criticalAlerts = alerts.filter(a => a.alertType === 'critical' || a.urgency > 0.8);
  
  if (criticalAlerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40">
      <a
        href="/ai-learning-assistant?view=risks"
        className="flex items-center space-x-2 bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-red-700 transition-colors animate-pulse"
      >
        <span className="text-lg">🚨</span>
        <div>
          <div className="text-sm font-semibold">紧急警报</div>
          <div className="text-xs">{criticalAlerts.length} 项需要处理</div>
        </div>
      </a>
    </div>
  );
}

// 浮动警报组件，用于关键警报
export function FloatingAlert({ alert, onDismiss, onExecute }: {
  alert: PredictiveAlert;
  onDismiss: () => void;
  onExecute: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // 自动隐藏非关键警报
    if (alert.alertType !== 'critical' && alert.urgency < 0.8) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 10000); // 10秒后自动隐藏
      
      return () => clearTimeout(timer);
    }
  }, [alert, onDismiss]);

  if (!isVisible) {
    return null;
  }

  const colors = alert.alertType === 'critical' || alert.urgency > 0.8 ? {
    bg: 'bg-red-600',
    text: 'text-white'
  } : {
    bg: 'bg-yellow-500',
    text: 'text-yellow-900'
  };

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 ${colors.bg} ${colors.text} rounded-lg shadow-2xl p-6 max-w-md animate-bounce`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{getAlertIcon(alert.alertType)}</span>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">{alert.title}</h3>
          <p className="text-sm mb-4">{alert.message}</p>
          
          <div className="flex space-x-3">
            {alert.recommendedStrategies.length > 0 && (
              <button
                onClick={onExecute}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded font-medium transition-colors"
              >
                立即处理
              </button>
            )}
            <button
              onClick={onDismiss}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
            >
              稍后处理
            </button>
          </div>
        </div>
        
        <button
          onClick={onDismiss}
          className="text-xl hover:bg-white/20 rounded p-1 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function getAlertIcon(alertType: PredictiveAlert['alertType']) {
  switch (alertType) {
    case 'critical': return '🚨';
    case 'warning': return '⚠️';
    case 'opportunity': return '💡';
    default: return 'ℹ️';
  }
}
