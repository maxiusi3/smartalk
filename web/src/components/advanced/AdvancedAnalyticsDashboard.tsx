/**
 * AdvancedAnalyticsDashboard - 高级数据分析仪表板
 * 显示深度学习分析、趋势预测、风险评估和预测性干预
 */

'use client'

import React, { useState } from 'react';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { LearningTrend, LearningPattern, PredictiveModel } from '../../lib/analytics/AdvancedAnalytics';
import { LearningRisk, PredictiveAlert, InterventionStrategy } from '../../lib/ai/PredictiveInterventionSystem';

interface AdvancedAnalyticsDashboardProps {
  className?: string;
}

export default function AdvancedAnalyticsDashboard({ className = '' }: AdvancedAnalyticsDashboardProps) {
  const {
    analyticsReport,
    isReportLoading,
    reportError,
    trends,
    patterns,
    predictions,
    correlations,
    risks,
    isRiskAnalyzing,
    alerts,
    interventionStrategies,
    activeInterventions,
    generateReport,
    analyzeRisks,
    executeIntervention,
    dismissAlert,
    analyticsStats
  } = useAdvancedAnalytics();

  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'patterns' | 'predictions' | 'risks' | 'interventions'>('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30_days');

  // 加载状态
  if (isReportLoading && !analyticsReport) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在生成高级分析报告...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (reportError && !analyticsReport) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{reportError}</p>
          <button
            onClick={() => generateReport()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            重新生成报告
          </button>
        </div>
      </div>
    );
  }

  // 获取趋势颜色
  const getTrendColor = (trend: LearningTrend['trend']) => {
    switch (trend) {
      case 'increasing': return 'text-green-600 bg-green-100';
      case 'decreasing': return 'text-red-600 bg-red-100';
      case 'stable': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取风险严重程度颜色
  const getRiskColor = (severity: LearningRisk['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200 border-red-400';
      case 'high': return 'text-red-700 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  // 获取模式影响颜色
  const getPatternColor = (impact: LearningPattern['impact']) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100 border-green-300';
      case 'negative': return 'text-red-600 bg-red-100 border-red-300';
      case 'neutral': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 高级数据分析</h2>
            <p className="text-indigo-100">深度学习分析、趋势预测和智能干预</p>
          </div>
          
          {analyticsStats && (
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-2xl font-bold">{analyticsStats.totalInsights}</div>
                  <div className="text-indigo-100">洞察数量</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-200">{analyticsStats.highRiskCount}</div>
                  <div className="text-indigo-100">高风险项</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 px-6">
          {[
            { id: 'overview', label: '概览', icon: '📊' },
            { id: 'trends', label: '趋势分析', icon: '📈' },
            { id: 'patterns', label: '模式识别', icon: '🔍' },
            { id: 'predictions', label: '预测模型', icon: '🔮' },
            { id: 'risks', label: '风险评估', icon: '⚠️' },
            { id: 'interventions', label: '智能干预', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 概览标签 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">趋势分析</h3>
                <div className="text-2xl font-bold text-blue-600 mb-1">{trends.length}</div>
                <div className="text-sm text-blue-700">
                  {trends.filter(t => t.trend === 'increasing').length} 项改善
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">学习模式</h3>
                <div className="text-2xl font-bold text-green-600 mb-1">{patterns.length}</div>
                <div className="text-sm text-green-700">
                  {patterns.filter(p => p.impact === 'positive').length} 项积极模式
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">预测模型</h3>
                <div className="text-2xl font-bold text-purple-600 mb-1">{predictions.length}</div>
                <div className="text-sm text-purple-700">
                  平均准确率 {predictions.length > 0 ? Math.round(predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length * 100) : 0}%
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">风险警报</h3>
                <div className="text-2xl font-bold text-red-600 mb-1">{alerts.length}</div>
                <div className="text-sm text-red-700">
                  {alerts.filter(a => a.alertType === 'critical').length} 项紧急
                </div>
              </div>
            </div>

            {/* 紧急警报 */}
            {alerts.filter(a => a.alertType === 'critical' || a.urgency > 0.8).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3">🚨 紧急警报</h3>
                <div className="space-y-3">
                  {alerts
                    .filter(a => a.alertType === 'critical' || a.urgency > 0.8)
                    .slice(0, 3)
                    .map((alert) => (
                      <div key={alert.alertId} className="bg-white rounded-lg p-3 border border-red-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900">{alert.title}</h4>
                            <p className="text-sm text-red-700 mt-1">{alert.message}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {alert.recommendedStrategies.length > 0 && (
                              <button
                                onClick={() => executeIntervention(alert.recommendedStrategies[0].strategyId)}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                              >
                                立即处理
                              </button>
                            )}
                            <button
                              onClick={() => dismissAlert(alert.alertId)}
                              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                            >
                              忽略
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 最新洞察 */}
            {analyticsReport?.insights && analyticsReport.insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 最新洞察</h3>
                <div className="space-y-3">
                  {analyticsReport.insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                          insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {insight.impact === 'high' && '高影响'}
                          {insight.impact === 'medium' && '中影响'}
                          {insight.impact === 'low' && '低影响'}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {insight.category === 'performance' && '性能分析'}
                          {insight.category === 'behavior' && '行为分析'}
                          {insight.category === 'efficiency' && '效率分析'}
                          {insight.category === 'prediction' && '预测分析'}
                        </span>
                      </div>
                      <p className="text-gray-800 mb-2">{insight.insight}</p>
                      {insight.recommendations.length > 0 && (
                        <div className="text-sm text-gray-600">
                          <strong>建议：</strong> {insight.recommendations[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 趋势分析标签 */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">📈 学习趋势分析</h3>
              <button
                onClick={() => generateReport()}
                disabled={isReportLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {isReportLoading ? '更新中...' : '🔄 更新趋势'}
              </button>
            </div>

            {trends.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-gray-600">暂无趋势数据，继续学习以获得更多分析</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {trends.map((trend, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {trend.metric === 'overall_accuracy' && '整体准确率'}
                        {trend.metric === 'focus_effectiveness' && 'Focus Mode效果'}
                        {trend.metric === 'pronunciation_score' && '发音评分'}
                        {trend.metric === 'srs_retention' && 'SRS记忆保持'}
                        {trend.metric === 'learning_consistency' && '学习一致性'}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrendColor(trend.trend)}`}>
                        {trend.trend === 'increasing' && '📈 上升'}
                        {trend.trend === 'decreasing' && '📉 下降'}
                        {trend.trend === 'stable' && '➡️ 稳定'}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">当前值:</span>
                        <span className="font-medium">{trend.value.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">变化:</span>
                        <span className={`font-medium ${trend.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {trend.change >= 0 ? '+' : ''}{trend.change.toFixed(1)} ({trend.changePercent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">置信度:</span>
                        <span className="font-medium">{(trend.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 模式识别标签 */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🔍 学习模式识别</h3>
            
            {patterns.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-gray-600">暂无识别到的学习模式</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patterns.map((pattern, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getPatternColor(pattern.impact)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{pattern.patternName}</h4>
                        <p className="text-sm text-gray-700 mt-1">{pattern.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">频率: {pattern.frequency}</div>
                        <div className="text-sm text-gray-600">置信度: {(pattern.confidence * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">相关指标:</div>
                      <div className="flex flex-wrap gap-2">
                        {pattern.relatedMetrics.map((metric, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">建议:</div>
                      <ul className="text-sm text-gray-700 list-disc list-inside">
                        {pattern.recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 预测模型标签 */}
        {activeTab === 'predictions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🔮 预测模型</h3>
            
            {predictions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🔮</div>
                <p className="text-gray-600">预测模型正在训练中</p>
              </div>
            ) : (
              <div className="space-y-6">
                {predictions.map((model, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900">{model.modelName}</h4>
                        <p className="text-sm text-gray-600">目标指标: {model.targetMetric}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">{(model.accuracy * 100).toFixed(0)}%</div>
                        <div className="text-sm text-gray-600">模型准确率</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {model.predictions.map((prediction, i) => (
                        <div key={i} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {prediction.timeframe === '7_days' && '7天预测'}
                              {prediction.timeframe === '30_days' && '30天预测'}
                            </span>
                            <span className="text-lg font-bold text-purple-600">
                              {prediction.predictedValue.toFixed(1)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            置信度: {(prediction.confidence * 100).toFixed(0)}%
                          </div>
                          
                          <div>
                            <div className="text-sm font-medium text-gray-900 mb-1">影响因素:</div>
                            <div className="space-y-1">
                              {prediction.factors.slice(0, 3).map((factor, j) => (
                                <div key={j} className="flex justify-between text-xs">
                                  <span className="text-gray-600">{factor.factor}:</span>
                                  <span className="font-medium">{(factor.weight * 100).toFixed(0)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-xs text-gray-500">
                      最后训练: {new Date(model.lastTrained).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 风险评估标签 */}
        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">⚠️ 学习风险评估</h3>
              <button
                onClick={analyzeRisks}
                disabled={isRiskAnalyzing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {isRiskAnalyzing ? '分析中...' : '🔍 重新分析'}
              </button>
            </div>
            
            {risks.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-600">未检测到学习风险，继续保持良好状态！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {risks.map((risk, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${getRiskColor(risk.severity)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {risk.riskType === 'attention_decline' && '⚠️ 注意力下降风险'}
                          {risk.riskType === 'motivation_drop' && '📉 学习动机下降'}
                          {risk.riskType === 'skill_plateau' && '📊 技能发展停滞'}
                          {risk.riskType === 'memory_decay' && '🧠 记忆衰退风险'}
                          {risk.riskType === 'pronunciation_regression' && '🗣️ 发音技能退化'}
                        </h4>
                        <p className="text-sm text-gray-700 mt-1">
                          预计在 {risk.timeToImpact} 小时内产生影响
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{(risk.probability * 100).toFixed(0)}%</div>
                        <div className="text-sm">风险概率</div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-900 mb-1">影响领域:</div>
                      <div className="flex flex-wrap gap-2">
                        {risk.affectedAreas.map((area, i) => (
                          <span key={i} className="px-2 py-1 bg-white/50 text-gray-700 text-xs rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-900 mb-1">风险指标:</div>
                      <div className="space-y-1">
                        {risk.indicators.slice(0, 2).map((indicator, i) => (
                          <div key={i} className="text-xs text-gray-700">
                            {indicator.metric}: {indicator.currentValue.toFixed(2)} (阈值: {indicator.threshold})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 智能干预标签 */}
        {activeTab === 'interventions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🎯 智能干预系统</h3>
            
            {/* 活跃干预 */}
            {activeInterventions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">🔄 活跃干预</h4>
                <div className="space-y-3">
                  {activeInterventions.map((intervention, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-900">干预执行中</span>
                        <span className="text-sm text-blue-700">
                          进度: {intervention.progress.completedActions}/{intervention.progress.totalActions}
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        当前阶段: {intervention.progress.currentPhase}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 推荐干预策略 */}
            {interventionStrategies.length > 0 ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">💡 推荐干预策略</h4>
                <div className="space-y-4">
                  {interventionStrategies.map((strategy, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{strategy.strategyName}</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            类型: {strategy.interventionType === 'immediate' ? '立即干预' : 
                                  strategy.interventionType === 'gradual' ? '渐进干预' : '预防性干预'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            strategy.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            strategy.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            strategy.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {strategy.priority === 'urgent' && '紧急'}
                            {strategy.priority === 'high' && '高优先级'}
                            {strategy.priority === 'medium' && '中优先级'}
                            {strategy.priority === 'low' && '低优先级'}
                          </span>
                          <button
                            onClick={() => executeIntervention(strategy.strategyId)}
                            className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                          >
                            执行
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-900 mb-1">干预措施:</div>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {strategy.actions.slice(0, 2).map((action, i) => (
                            <li key={i}>{action.description}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>预期效果: {(strategy.estimatedEffectiveness * 100).toFixed(0)}%</span>
                        <span>置信度: {(strategy.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-gray-600">当前无需干预，学习状态良好！</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
