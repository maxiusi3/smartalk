/**
 * 高级数据分析主页面
 * 整合深度学习分析、趋势预测、风险评估和预测性干预的完整体验
 */

'use client'

import React, { useState } from 'react';
import AdvancedAnalyticsDashboard from '../../components/advanced/AdvancedAnalyticsDashboard';
import PredictiveAlertSystem from '../../components/advanced/PredictiveAlertSystem';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';

type AnalyticsView = 'dashboard' | 'trends' | 'predictions' | 'risks' | 'reports';

export default function AdvancedAnalyticsPage() {
  const [currentView, setCurrentView] = useState<AnalyticsView>('dashboard');
  const { 
    analyticsReport, 
    trends, 
    patterns, 
    predictions, 
    risks, 
    alerts, 
    analyticsStats,
    isReportLoading,
    isRiskAnalyzing
  } = useAdvancedAnalytics();

  // 导航菜单项
  const navigationItems = [
    {
      id: 'dashboard' as AnalyticsView,
      label: '分析仪表板',
      icon: '📊',
      description: '综合数据分析和洞察'
    },
    {
      id: 'trends' as AnalyticsView,
      label: '趋势预测',
      icon: '📈',
      description: '学习趋势和预测模型'
    },
    {
      id: 'predictions' as AnalyticsView,
      label: '智能预测',
      icon: '🔮',
      description: '学习效果预测分析'
    },
    {
      id: 'risks' as AnalyticsView,
      label: '风险管理',
      icon: '⚠️',
      description: '学习风险评估和干预'
    },
    {
      id: 'reports' as AnalyticsView,
      label: '分析报告',
      icon: '📋',
      description: '详细分析报告生成'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* 预测性警报系统 */}
      <PredictiveAlertSystem position="top-right" maxAlerts={3} />

      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📊</span>
                <h1 className="text-xl font-bold text-white">高级数据分析</h1>
              </div>
              
              {/* 快速统计 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                {analyticsStats && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>💡</span>
                      <span>{analyticsStats.totalInsights} 项洞察</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📈</span>
                      <span>{trends.length} 个趋势</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>⚠️</span>
                      <span>{analyticsStats.highRiskCount} 项高风险</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🎯</span>
                      <span>{analyticsStats.activeInterventionCount} 个活跃干预</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              <a
                href="/ai-learning-assistant"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🤖 AI助手
              </a>
              
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                📖 继续学习
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-white mb-4">分析功能</h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentView === item.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              {/* 系统状态卡片 */}
              <div className="mt-6 space-y-3">
                {/* 分析状态 */}
                <div className={`${isReportLoading ? 'bg-blue-500/20 border-blue-400/30' : 'bg-green-500/20 border-green-400/30'} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${isReportLoading ? 'text-blue-200' : 'text-green-200'} text-sm`}>
                      分析状态
                    </span>
                    <span className={`${isReportLoading ? 'text-blue-100' : 'text-green-100'} font-bold text-xs`}>
                      {isReportLoading ? '分析中...' : '已完成'}
                    </span>
                  </div>
                </div>
                
                {/* 风险监控状态 */}
                <div className={`${isRiskAnalyzing ? 'bg-yellow-500/20 border-yellow-400/30' : 'bg-green-500/20 border-green-400/30'} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${isRiskAnalyzing ? 'text-yellow-200' : 'text-green-200'} text-sm`}>
                      风险监控
                    </span>
                    <span className={`${isRiskAnalyzing ? 'text-yellow-100' : 'text-green-100'} font-bold text-xs`}>
                      {isRiskAnalyzing ? '监控中...' : '正常'}
                    </span>
                  </div>
                </div>
                
                {/* 数据新鲜度 */}
                {analyticsStats && (
                  <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm">数据新鲜度</span>
                      <span className="text-purple-100 font-bold text-xs">
                        {analyticsStats.reportFreshness}小时前
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {/* 仪表板视图 */}
            {currentView === 'dashboard' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    📊 高级数据分析仪表板
                  </h2>
                  <p className="text-white/70 text-lg">
                    深度学习分析、趋势预测和智能干预的综合视图
                  </p>
                </div>

                {/* 高级分析仪表板 */}
                <AdvancedAnalyticsDashboard className="w-full" />

                {/* 分析能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🚀 高级分析能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">📈</span>
                        <h4 className="font-semibold text-white">趋势分析</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        基于历史数据的深度趋势分析，识别学习模式和发展轨迹。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🔮</span>
                        <h4 className="font-semibold text-white">预测建模</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        使用机器学习算法预测学习效果和潜在问题。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚠️</span>
                        <h4 className="font-semibold text-white">风险评估</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        主动识别学习风险，提供预防性建议和干预措施。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🎯</span>
                        <h4 className="font-semibold text-white">智能干预</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        基于风险评估的智能干预策略，主动优化学习体验。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他视图使用相同的仪表板组件，但设置不同的默认标签 */}
            {currentView !== 'dashboard' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentView === 'trends' && '📈 趋势预测分析'}
                    {currentView === 'predictions' && '🔮 智能预测模型'}
                    {currentView === 'risks' && '⚠️ 风险管理系统'}
                    {currentView === 'reports' && '📋 分析报告中心'}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {currentView === 'trends' && '深度的学习趋势分析和预测'}
                    {currentView === 'predictions' && '基于AI的学习效果预测'}
                    {currentView === 'risks' && '学习风险评估和智能干预'}
                    {currentView === 'reports' && '详细的学习分析报告'}
                  </p>
                </div>
                
                <AdvancedAnalyticsDashboard className="w-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 底部链接 */}
      <footer className="bg-white/5 backdrop-blur-lg border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              SmarTalk 高级数据分析系统 - 基于机器学习的深度学习分析平台
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/ai-learning-assistant"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                AI学习助手
              </a>
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                返回学习
              </a>
              <a
                href="/test-ai-learning"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                AI功能测试
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
