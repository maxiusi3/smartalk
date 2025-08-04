/**
 * CodeQualityDashboard - 代码质量管理仪表板
 * 显示代码质量分析、重构管理和质量监控
 */

'use client'

import React, { useState } from 'react';
import { useCodeQuality } from '../../hooks/useCodeQuality';
import { QualityStatus, QualityAlert } from '../../hooks/useCodeQuality';
import { CodeSmell, RefactoringOpportunity } from '../../lib/quality/CodeQualityAnalyzer';
import { RefactoringTask } from '../../lib/quality/CodeRefactoringEngine';

interface CodeQualityDashboardProps {
  className?: string;
}

export default function CodeQualityDashboard({ className = '' }: CodeQualityDashboardProps) {
  const {
    qualityStatus,
    isAnalyzing,
    qualityReport,
    qualityMetrics,
    codeSmells,
    refactoringOpportunities,
    refactoringPlans,
    activeRefactoringPlan,
    refactoringProgress,
    isRefactoring,
    qualityAlerts,
    analyzeCodeQuality,
    createRefactoringPlan,
    executeRefactoringTask,
    cancelRefactoringPlan,
    dismissAlert,
    qualityStats
  } = useCodeQuality();

  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'refactoring' | 'alerts' | 'metrics'>('overview');
  const [selectedSmell, setSelectedSmell] = useState<CodeSmell | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  // 获取质量状态颜色
  const getQualityColor = (status?: QualityStatus['overall']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取严重程度颜色
  const getSeverityColor = (severity: 'critical' | 'major' | 'minor' | 'info') => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-100 border-red-300';
      case 'major': return 'text-orange-800 bg-orange-100 border-orange-300';
      case 'minor': return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      case 'info': return 'text-blue-800 bg-blue-100 border-blue-300';
      default: return 'text-gray-800 bg-gray-100 border-gray-300';
    }
  };

  // 创建重构计划
  const handleCreateRefactoringPlan = async () => {
    setIsCreatingPlan(true);
    try {
      await createRefactoringPlan();
    } catch (error) {
      console.error('Failed to create refactoring plan:', error);
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // 执行重构任务
  const handleExecuteTask = async (taskId: string) => {
    try {
      await executeRefactoringTask(taskId);
    } catch (error) {
      console.error('Failed to execute refactoring task:', error);
    }
  };

  // 加载状态
  if (isAnalyzing && !qualityStatus) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在分析代码质量...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔧 代码质量管理中心</h2>
            <p className="text-purple-100">代码质量分析、重构管理和质量监控</p>
          </div>
          
          {qualityStatus && (
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getQualityColor(qualityStatus.overall)}`}>
                <span className="mr-2">
                  {qualityStatus.overall === 'excellent' && '🟢'}
                  {qualityStatus.overall === 'good' && '🔵'}
                  {qualityStatus.overall === 'fair' && '🟡'}
                  {qualityStatus.overall === 'poor' && '🟠'}
                  {qualityStatus.overall === 'critical' && '🔴'}
                </span>
                代码质量: {
                  qualityStatus.overall === 'excellent' ? '优秀' :
                  qualityStatus.overall === 'good' ? '良好' :
                  qualityStatus.overall === 'fair' ? '一般' :
                  qualityStatus.overall === 'poor' ? '较差' : '严重'
                } ({qualityStatus.score})
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
            { id: 'analysis', label: '质量分析', icon: '🔍' },
            { id: 'refactoring', label: '重构管理', icon: '🔧' },
            { id: 'alerts', label: '质量警报', icon: '🚨' },
            { id: 'metrics', label: '质量指标', icon: '📈' }
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
            {/* 质量状态卡片 */}
            {qualityStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">代码异味</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{qualityStats.totalCodeSmells}</div>
                  <div className="text-sm text-purple-700">
                    {qualityStats.criticalIssues} 项严重
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">重构机会</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{qualityStats.refactoringOpportunities}</div>
                  <div className="text-sm text-blue-700">待优化</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">技术债务</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{qualityStats.technicalDebtScore}</div>
                  <div className="text-sm text-orange-700">评分</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">质量趋势</h3>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {qualityStats.qualityTrend === 'improving' && '📈 改善'}
                    {qualityStats.qualityTrend === 'stable' && '➡️ 稳定'}
                    {qualityStats.qualityTrend === 'declining' && '📉 下降'}
                  </div>
                  <div className="text-sm text-green-700">趋势</div>
                </div>
              </div>
            )}

            {/* 快速操作 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={analyzeCodeQuality}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  <span className="mr-2">🔍</span>
                  {isAnalyzing ? '分析中...' : '重新分析代码质量'}
                </button>

                <button
                  onClick={handleCreateRefactoringPlan}
                  disabled={isCreatingPlan || refactoringOpportunities.length === 0}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <span className="mr-2">🔧</span>
                  {isCreatingPlan ? '创建中...' : '创建重构计划'}
                </button>

                <button
                  onClick={() => setActiveTab('alerts')}
                  className="flex items-center justify-center px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <span className="mr-2">🚨</span>
                  查看质量警报 ({qualityAlerts.length})
                </button>
              </div>
            </div>

            {/* 最近的代码异味 */}
            {codeSmells.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 最近发现的代码异味</h3>
                <div className="space-y-3">
                  {codeSmells.slice(0, 3).map((smell) => (
                    <div key={smell.id} className={`border rounded-lg p-3 ${getSeverityColor(smell.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{smell.title}</h4>
                          <p className="text-sm mt-1">{smell.description}</p>
                          <div className="text-xs mt-2 opacity-75">
                            {smell.file} {smell.line && `(行 ${smell.line})`}
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-white/50">
                          {smell.severity === 'critical' && '严重'}
                          {smell.severity === 'major' && '主要'}
                          {smell.severity === 'minor' && '次要'}
                          {smell.severity === 'info' && '信息'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 质量分析标签 */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">🔍 代码质量分析</h3>
              <button
                onClick={analyzeCodeQuality}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                🔄 重新分析
              </button>
            </div>

            {qualityReport && (
              <div className="space-y-6">
                {/* 分类评分 */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-4">质量评分详情</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{qualityReport.categoryScores.maintainability}</div>
                      <div className="text-sm text-purple-700">可维护性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{qualityReport.categoryScores.reliability}</div>
                      <div className="text-sm text-blue-700">可靠性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{qualityReport.categoryScores.security}</div>
                      <div className="text-sm text-green-700">安全性</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{qualityReport.categoryScores.performance}</div>
                      <div className="text-sm text-orange-700">性能</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{qualityReport.categoryScores.readability}</div>
                      <div className="text-sm text-red-700">可读性</div>
                    </div>
                  </div>
                </div>

                {/* 代码异味列表 */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">代码异味详情</h4>
                  <div className="space-y-3">
                    {codeSmells.map((smell) => (
                      <div 
                        key={smell.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${getSeverityColor(smell.severity)} ${
                          selectedSmell?.id === smell.id ? 'ring-2 ring-purple-500' : ''
                        }`}
                        onClick={() => setSelectedSmell(selectedSmell?.id === smell.id ? null : smell)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h5 className="font-medium">{smell.title}</h5>
                              <span className="px-2 py-1 rounded text-xs font-medium bg-white/50">
                                {smell.type === 'complexity' && '复杂度'}
                                {smell.type === 'duplication' && '重复代码'}
                                {smell.type === 'naming' && '命名'}
                                {smell.type === 'structure' && '结构'}
                                {smell.type === 'performance' && '性能'}
                                {smell.type === 'type_safety' && '类型安全'}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{smell.description}</p>
                            <div className="text-xs opacity-75">
                              {smell.file} {smell.line && `(行 ${smell.line})`} • 工作量: {
                                smell.effort === 'low' ? '低' :
                                smell.effort === 'medium' ? '中' : '高'
                              } • 影响: {
                                smell.impact === 'low' ? '低' :
                                smell.impact === 'medium' ? '中' : '高'
                              }
                            </div>
                            
                            {selectedSmell?.id === smell.id && (
                              <div className="mt-3 pt-3 border-t border-white/30">
                                <p className="text-sm font-medium mb-1">建议解决方案:</p>
                                <p className="text-sm">{smell.suggestion}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 重构管理标签 */}
        {activeTab === 'refactoring' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">🔧 重构管理</h3>
              <button
                onClick={handleCreateRefactoringPlan}
                disabled={isCreatingPlan || refactoringOpportunities.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
              >
                {isCreatingPlan ? '创建中...' : '🔧 创建重构计划'}
              </button>
            </div>

            {/* 活跃的重构计划 */}
            {activeRefactoringPlan && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-blue-900">当前重构计划</h4>
                  <button
                    onClick={() => cancelRefactoringPlan(activeRefactoringPlan.planId)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    取消计划
                  </button>
                </div>
                
                {refactoringProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-blue-700 mb-2">
                      <span>进度: {refactoringProgress.completedTasks}/{refactoringProgress.totalTasks} 任务</span>
                      <span>{refactoringProgress.completionPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${refactoringProgress.completionPercentage}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-blue-600 mt-2">
                      <span>已用时间: {refactoringProgress.actualTimeSpent.toFixed(1)}h</span>
                      <span>预计剩余: {refactoringProgress.estimatedTimeRemaining.toFixed(1)}h</span>
                    </div>
                  </div>
                )}

                {/* 重构任务列表 */}
                <div className="space-y-3">
                  {activeRefactoringPlan.tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="bg-white rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{task.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span>优先级: {
                              task.priority === 'critical' ? '严重' :
                              task.priority === 'high' ? '高' :
                              task.priority === 'medium' ? '中' : '低'
                            }</span>
                            <span>预计: {task.estimatedEffort}h</span>
                            <span>状态: {
                              task.status === 'pending' ? '待处理' :
                              task.status === 'in_progress' ? '进行中' :
                              task.status === 'completed' ? '已完成' :
                              task.status === 'failed' ? '失败' : '跳过'
                            }</span>
                          </div>
                        </div>
                        
                        {task.status === 'pending' && (
                          <button
                            onClick={() => handleExecuteTask(task.id)}
                            disabled={isRefactoring}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                          >
                            {isRefactoring ? '执行中...' : '执行'}
                          </button>
                        )}
                        
                        {task.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">
                            ✅ 已完成
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 重构机会 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">重构机会</h4>
              <div className="space-y-3">
                {refactoringOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-medium text-gray-900">{opportunity.title}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            opportunity.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            opportunity.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            opportunity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {opportunity.priority === 'critical' && '严重'}
                            {opportunity.priority === 'high' && '高'}
                            {opportunity.priority === 'medium' && '中'}
                            {opportunity.priority === 'low' && '低'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
                        <div className="text-xs text-gray-500">
                          预计工作量: {opportunity.estimatedEffort}小时 • 预期收益: {opportunity.expectedBenefit}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 质量警报标签 */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">🚨 质量警报</h3>
            
            {qualityAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <p className="text-gray-600">当前无质量警报，代码质量良好！</p>
              </div>
            ) : (
              <div className="space-y-4">
                {qualityAlerts.map((alert) => (
                  <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/50">
                            {alert.type === 'code_smell' && '代码异味'}
                            {alert.type === 'refactoring_needed' && '需要重构'}
                            {alert.type === 'quality_decline' && '质量下降'}
                            {alert.type === 'technical_debt' && '技术债务'}
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
                            onClick={handleCreateRefactoringPlan}
                            className="px-3 py-1 bg-white/80 hover:bg-white text-gray-800 text-sm rounded transition-colors"
                          >
                            自动修复
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

        {/* 质量指标标签 */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">📈 质量指标</h3>
            
            {qualityMetrics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 复杂度指标 */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="font-semibold text-blue-900 mb-4">复杂度指标</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">圈复杂度:</span>
                      <span className="font-medium">{qualityMetrics.cyclomaticComplexity.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">认知复杂度:</span>
                      <span className="font-medium">{qualityMetrics.cognitiveComplexity.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">可维护性指数:</span>
                      <span className="font-medium">{qualityMetrics.maintainabilityIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">技术债务:</span>
                      <span className="font-medium">{qualityMetrics.technicalDebt}</span>
                    </div>
                  </div>
                </div>

                {/* 结构指标 */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="font-semibold text-green-900 mb-4">代码结构</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">模块数量:</span>
                      <span className="font-medium">{qualityMetrics.moduleCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">组件数量:</span>
                      <span className="font-medium">{qualityMetrics.componentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Hook数量:</span>
                      <span className="font-medium">{qualityMetrics.hookCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">工具函数:</span>
                      <span className="font-medium">{qualityMetrics.utilityCount}</span>
                    </div>
                  </div>
                </div>

                {/* 类型安全指标 */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="font-semibold text-purple-900 mb-4">类型安全</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-700">TypeScript覆盖率:</span>
                      <span className="font-medium">{qualityMetrics.typeScriptCoverage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">类型错误:</span>
                      <span className="font-medium">{qualityMetrics.typeErrors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">any类型使用:</span>
                      <span className="font-medium">{qualityMetrics.anyTypeUsage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">严格模式合规:</span>
                      <span className="font-medium">{qualityMetrics.strictModeCompliance}%</span>
                    </div>
                  </div>
                </div>

                {/* 性能指标 */}
                <div className="bg-orange-50 rounded-lg p-6">
                  <h4 className="font-semibold text-orange-900 mb-4">性能指标</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-orange-700">打包大小:</span>
                      <span className="font-medium">{qualityMetrics.bundleSize}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">未使用代码:</span>
                      <span className="font-medium">{qualityMetrics.unusedCode}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">重复代码:</span>
                      <span className="font-medium">{qualityMetrics.duplicateCode}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">潜在内存泄漏:</span>
                      <span className="font-medium">{qualityMetrics.memoryLeaks}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
