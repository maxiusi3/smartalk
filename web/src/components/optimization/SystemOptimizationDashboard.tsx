/**
 * SystemOptimizationDashboard - 系统优化仪表板
 * 显示性能监控、用户体验优化和系统健康状态
 */

'use client'

import React, { useState } from 'react';
import { useSystemOptimization } from '../../hooks/useSystemOptimization';
import { SystemHealth, OptimizationAlert } from '../../hooks/useSystemOptimization';

interface SystemOptimizationDashboardProps {
  className?: string;
}

export default function SystemOptimizationDashboard({ className = '' }: SystemOptimizationDashboardProps) {
  const {
    systemHealth,
    isHealthLoading,
    performanceMetrics,
    performanceReport,
    performanceSuggestions,
    uxMetrics,
    uxReport,
    uxSuggestions,
    optimizationAlerts,
    isPerformanceMonitoring,
    isUXTracking,
    generatePerformanceReport,
    generateUXReport,
    dismissAlert,
    applyAutoFix,
    optimizationStats
  } = useSystemOptimization();

  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'ux' | 'alerts' | 'suggestions'>('overview');
  const [isApplyingFix, setIsApplyingFix] = useState<string | null>(null);

  // 获取系统健康状态颜色
  const getHealthColor = (health?: SystemHealth['overall']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取警报严重程度颜色
  const getAlertColor = (severity: OptimizationAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      case 'high': return 'text-orange-800 bg-orange-100 border-orange-300';
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-blue-800 bg-blue-100 border-blue-300';
      default: return 'text-gray-800 bg-gray-100 border-gray-300';
    }
  };

  // 应用自动修复
  const handleApplyAutoFix = async (suggestionId: string) => {
    setIsApplyingFix(suggestionId);
    try {
      const success = await applyAutoFix(suggestionId);
      if (success) {
        // 重新生成报告以反映修复效果
        await generatePerformanceReport();
      }
    } catch (error) {
      console.error('Failed to apply auto fix:', error);
    } finally {
      setIsApplyingFix(null);
    }
  };

  // 加载状态
  if (isHealthLoading && !systemHealth) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在分析系统状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">⚡ 系统优化中心</h2>
            <p className="text-blue-100">性能监控、用户体验优化和系统健康管理</p>
          </div>
          
          {systemHealth && (
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getHealthColor(systemHealth.overall)}`}>
                <span className="mr-2">
                  {systemHealth.overall === 'excellent' && '🟢'}
                  {systemHealth.overall === 'good' && '🔵'}
                  {systemHealth.overall === 'fair' && '🟡'}
                  {systemHealth.overall === 'poor' && '🟠'}
                  {systemHealth.overall === 'critical' && '🔴'}
                </span>
                系统状态: {
                  systemHealth.overall === 'excellent' ? '优秀' :
                  systemHealth.overall === 'good' ? '良好' :
                  systemHealth.overall === 'fair' ? '一般' :
                  systemHealth.overall === 'poor' ? '较差' : '严重'
                }
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
            { id: 'performance', label: '性能监控', icon: '⚡' },
            { id: 'ux', label: '用户体验', icon: '👥' },
            { id: 'alerts', label: '优化警报', icon: '🚨' },
            { id: 'suggestions', label: '优化建议', icon: '💡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
            {/* 系统健康状态卡片 */}
            {systemHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">性能评分</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{systemHealth.performance}</div>
                  <div className="text-sm text-blue-700">
                    {isPerformanceMonitoring ? '实时监控中' : '监控已停止'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">用户体验</h3>
                  <div className="text-3xl font-bold text-green-600 mb-1">{systemHealth.userExperience}</div>
                  <div className="text-sm text-green-700">
                    {isUXTracking ? '跟踪中' : '跟踪已停止'}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">系统稳定性</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{systemHealth.stability}</div>
                  <div className="text-sm text-purple-700">稳定运行</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">优化建议</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {optimizationStats?.totalSuggestions || 0}
                  </div>
                  <div className="text-sm text-orange-700">
                    {optimizationStats?.criticalIssues || 0} 项紧急
                  </div>
                </div>
              </div>
            )}

            {/* 关键指标概览 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 性能指标 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ 性能指标</h3>
                {performanceMetrics ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">页面加载时间:</span>
                      <span className="font-medium">{performanceMetrics.pageLoadTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">交互响应时间:</span>
                      <span className="font-medium">{performanceMetrics.interactionResponseTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">视频加载时间:</span>
                      <span className="font-medium">{performanceMetrics.videoLoadTime.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">内存使用:</span>
                      <span className="font-medium">{performanceMetrics.memoryUsage.toFixed(1)}MB</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">暂无性能数据</p>
                )}
              </div>

              {/* 用户体验指标 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 用户体验指标</h3>
                {uxMetrics ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">任务完成率:</span>
                      <span className="font-medium">{uxMetrics.taskCompletionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">用户满意度:</span>
                      <span className="font-medium">{uxMetrics.userSatisfactionScore.toFixed(1)}/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">错误率:</span>
                      <span className="font-medium">{uxMetrics.errorRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">导航效率:</span>
                      <span className="font-medium">{uxMetrics.navigationEfficiency.toFixed(0)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">暂无用户体验数据</p>
                )}
              </div>
            </div>

            {/* 紧急警报 */}
            {optimizationAlerts.filter(a => a.severity === 'critical').length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-3">🚨 紧急警报</h3>
                <div className="space-y-3">
                  {optimizationAlerts
                    .filter(a => a.severity === 'critical')
                    .slice(0, 3)
                    .map((alert) => (
                      <div key={alert.id} className="bg-white rounded-lg p-3 border border-red-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-red-900">{alert.title}</h4>
                            <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {alert.autoFixAvailable && (
                              <button
                                onClick={() => handleApplyAutoFix(alert.id)}
                                disabled={isApplyingFix === alert.id}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                              >
                                {isApplyingFix === alert.id ? '修复中...' : '自动修复'}
                              </button>
                            )}
                            <button
                              onClick={() => dismissAlert(alert.id)}
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
          </div>
        )}

        {/* 性能监控标签 */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">⚡ 性能监控</h3>
              <button
                onClick={generatePerformanceReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🔄 更新报告
              </button>
            </div>

            {performanceReport ? (
              <div className="space-y-6">
                {/* 性能评分 */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">性能评分详情</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{performanceReport.categoryScores.loading.toFixed(0)}</div>
                      <div className="text-sm text-blue-700">加载性能</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{performanceReport.categoryScores.interaction.toFixed(0)}</div>
                      <div className="text-sm text-green-700">交互性能</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{performanceReport.categoryScores.stability.toFixed(0)}</div>
                      <div className="text-sm text-purple-700">稳定性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{performanceReport.categoryScores.learningFeatures.toFixed(0)}</div>
                      <div className="text-sm text-orange-700">学习功能</div>
                    </div>
                  </div>
                </div>

                {/* 性能趋势 */}
                {performanceReport.trends.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">性能趋势</h4>
                    <div className="space-y-3">
                      {performanceReport.trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-700">{trend.metric}:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trend.trend === 'improving' ? 'bg-green-100 text-green-800' :
                              trend.trend === 'degrading' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {trend.trend === 'improving' && '📈 改善'}
                              {trend.trend === 'degrading' && '📉 下降'}
                              {trend.trend === 'stable' && '➡️ 稳定'}
                            </span>
                            <span className="text-sm text-gray-600">{trend.changePercent.toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <p className="text-gray-600">点击"更新报告"生成性能分析</p>
              </div>
            )}
          </div>
        )}

        {/* 用户体验标签 */}
        {activeTab === 'ux' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">👥 用户体验分析</h3>
              <button
                onClick={generateUXReport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                🔄 更新报告
              </button>
            </div>

            {uxReport ? (
              <div className="space-y-6">
                {/* UX评分 */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">用户体验评分</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{uxReport.categoryScores.usability.toFixed(0)}</div>
                      <div className="text-sm text-blue-700">可用性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{uxReport.categoryScores.accessibility.toFixed(0)}</div>
                      <div className="text-sm text-green-700">可访问性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{uxReport.categoryScores.satisfaction.toFixed(0)}</div>
                      <div className="text-sm text-purple-700">满意度</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{uxReport.categoryScores.efficiency.toFixed(0)}</div>
                      <div className="text-sm text-orange-700">效率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{uxReport.categoryScores.learnability.toFixed(0)}</div>
                      <div className="text-sm text-red-700">可学习性</div>
                    </div>
                  </div>
                </div>

                {/* 行为洞察 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">用户行为洞察</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">最常用功能</h5>
                      <ul className="space-y-1">
                        {uxReport.behaviorInsights.mostUsedFeatures.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600">• {feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">流失点</h5>
                      <ul className="space-y-1">
                        {uxReport.behaviorInsights.dropOffPoints.map((point, index) => (
                          <li key={index} className="text-sm text-gray-600">• {point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👥</div>
                <p className="text-gray-600">点击"更新报告"生成用户体验分析</p>
              </div>
            )}
          </div>
        )}

        {/* 优化警报标签 */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🚨 优化警报</h3>
            
            {optimizationAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-600">当前无优化警报，系统运行良好！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {optimizationAlerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                            {alert.type === 'performance' && '性能'}
                            {alert.type === 'ux' && '用户体验'}
                            {alert.type === 'system' && '系统'}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{alert.description}</p>
                        <div className="text-xs opacity-75">
                          创建时间: {new Date(alert.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {alert.autoFixAvailable && (
                          <button
                            onClick={() => handleApplyAutoFix(alert.id)}
                            disabled={isApplyingFix === alert.id}
                            className="px-3 py-1 bg-white/80 hover:bg-white text-gray-800 text-sm rounded transition-colors"
                          >
                            {isApplyingFix === alert.id ? '修复中...' : '自动修复'}
                          </button>
                        )}
                        <button
                          onClick={() => dismissAlert(alert.id)}
                          className="px-3 py-1 bg-white/60 hover:bg-white/80 text-gray-800 text-sm rounded transition-colors"
                        >
                          忽略
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 优化建议标签 */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">💡 优化建议</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 性能优化建议 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">⚡ 性能优化建议</h4>
                {performanceSuggestions.length === 0 ? (
                  <p className="text-gray-500 text-sm">暂无性能优化建议</p>
                ) : (
                  <div className="space-y-3">
                    {performanceSuggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-blue-900">{suggestion.title}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            suggestion.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            suggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {suggestion.priority === 'critical' && '严重'}
                            {suggestion.priority === 'high' && '高'}
                            {suggestion.priority === 'medium' && '中'}
                            {suggestion.priority === 'low' && '低'}
                          </span>
                        </div>
                        <p className="text-sm text-blue-800 mb-2">{suggestion.description}</p>
                        <div className="text-xs text-blue-700">
                          预期改进: {suggestion.potentialImprovement}% | 工作量: {
                            suggestion.estimatedEffort === 'low' ? '低' :
                            suggestion.estimatedEffort === 'medium' ? '中' : '高'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 用户体验优化建议 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">👥 用户体验优化建议</h4>
                {uxSuggestions.length === 0 ? (
                  <p className="text-gray-500 text-sm">暂无用户体验优化建议</p>
                ) : (
                  <div className="space-y-3">
                    {uxSuggestions.slice(0, 3).map((suggestion) => (
                      <div key={suggestion.id} className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-green-900">{suggestion.title}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            suggestion.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            suggestion.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {suggestion.priority === 'critical' && '严重'}
                            {suggestion.priority === 'high' && '高'}
                            {suggestion.priority === 'medium' && '中'}
                            {suggestion.priority === 'low' && '低'}
                          </span>
                        </div>
                        <p className="text-sm text-green-800 mb-2">{suggestion.description}</p>
                        <div className="text-xs text-green-700">
                          工作量: {
                            suggestion.implementation.effort === 'low' ? '低' :
                            suggestion.implementation.effort === 'medium' ? '中' : '高'
                          } | 时间: {suggestion.implementation.timeline}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
