/**
 * 代码质量管理主页面
 * 整合代码质量分析、重构管理和质量监控的完整体验
 */

'use client'

import React, { useState } from 'react';
import CodeQualityDashboard from '../../components/quality/CodeQualityDashboard';
import { useCodeQuality } from '../../hooks/useCodeQuality';

type QualityView = 'dashboard' | 'analysis' | 'refactoring' | 'monitoring' | 'reports';

export default function CodeQualityPage() {
  const [currentView, setCurrentView] = useState<QualityView>('dashboard');
  const { 
    qualityStatus,
    qualityStats,
    codeSmells,
    refactoringOpportunities,
    qualityAlerts,
    activeRefactoringPlan,
    refactoringProgress
  } = useCodeQuality();

  // 导航菜单项
  const navigationItems = [
    {
      id: 'dashboard' as QualityView,
      label: '质量仪表板',
      icon: '🔧',
      description: '代码质量分析和重构管理综合视图'
    },
    {
      id: 'analysis' as QualityView,
      label: '质量分析',
      icon: '🔍',
      description: '深度代码质量分析和异味检测'
    },
    {
      id: 'refactoring' as QualityView,
      label: '重构管理',
      icon: '⚙️',
      description: '重构计划管理和执行监控'
    },
    {
      id: 'monitoring' as QualityView,
      label: '质量监控',
      icon: '📊',
      description: '实时质量监控和趋势分析'
    },
    {
      id: 'reports' as QualityView,
      label: '质量报告',
      icon: '📋',
      description: '详细的质量分析报告'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🔧</span>
                <h1 className="text-xl font-bold text-white">代码质量管理中心</h1>
              </div>
              
              {/* 快速状态指示器 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                {qualityStatus && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>
                        {qualityStatus.overall === 'excellent' && '🟢'}
                        {qualityStatus.overall === 'good' && '🔵'}
                        {qualityStatus.overall === 'fair' && '🟡'}
                        {qualityStatus.overall === 'poor' && '🟠'}
                        {qualityStatus.overall === 'critical' && '🔴'}
                      </span>
                      <span>质量: {
                        qualityStatus.overall === 'excellent' ? '优秀' :
                        qualityStatus.overall === 'good' ? '良好' :
                        qualityStatus.overall === 'fair' ? '一般' :
                        qualityStatus.overall === 'poor' ? '较差' : '严重'
                      } ({qualityStatus.score})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📈</span>
                      <span>趋势: {
                        qualityStatus.trendsDirection === 'improving' ? '改善' :
                        qualityStatus.trendsDirection === 'stable' ? '稳定' : '下降'
                      }</span>
                    </div>
                  </>
                )}
                
                {qualityStats && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>🚨</span>
                      <span>{qualityStats.criticalIssues} 项严重问题</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>🔧</span>
                      <span>{qualityStats.refactoringOpportunities} 个重构机会</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              {activeRefactoringPlan && refactoringProgress && (
                <div className="flex items-center space-x-2 text-sm text-white/80">
                  <span>🔧</span>
                  <span>重构进度: {refactoringProgress.completionPercentage.toFixed(0)}%</span>
                </div>
              )}
              
              <a
                href="/system-optimization"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ⚡ 系统优化
              </a>
              
              <a
                href="/advanced-analytics"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                📊 高级分析
              </a>
              
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                📖 返回学习
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
              <h2 className="text-lg font-semibold text-white mb-4">质量管理功能</h2>
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

              {/* 质量状态卡片 */}
              <div className="mt-6 space-y-3">
                {/* 代码质量状态 */}
                {qualityStatus && (
                  <div className={`${
                    qualityStatus.overall === 'excellent' || qualityStatus.overall === 'good' 
                      ? 'bg-green-500/20 border-green-400/30' 
                      : qualityStatus.overall === 'fair'
                      ? 'bg-yellow-500/20 border-yellow-400/30'
                      : 'bg-red-500/20 border-red-400/30'
                  } border rounded-lg p-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        qualityStatus.overall === 'excellent' || qualityStatus.overall === 'good' 
                          ? 'text-green-200' 
                          : qualityStatus.overall === 'fair'
                          ? 'text-yellow-200'
                          : 'text-red-200'
                      } text-sm`}>
                        代码质量
                      </span>
                      <span className={`${
                        qualityStatus.overall === 'excellent' || qualityStatus.overall === 'good' 
                          ? 'text-green-100' 
                          : qualityStatus.overall === 'fair'
                          ? 'text-yellow-100'
                          : 'text-red-100'
                      } font-bold text-xs`}>
                        {qualityStatus.score}/100
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 代码异味数量 */}
                {qualityStats && qualityStats.totalCodeSmells > 0 && (
                  <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-200 text-sm">代码异味</span>
                      <span className="text-orange-100 font-bold text-xs">
                        {qualityStats.totalCodeSmells} 项
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 重构机会 */}
                {qualityStats && qualityStats.refactoringOpportunities > 0 && (
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm">重构机会</span>
                      <span className="text-blue-100 font-bold text-xs">
                        {qualityStats.refactoringOpportunities} 个
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 质量警报 */}
                {qualityAlerts.length > 0 && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">质量警报</span>
                      <span className="text-red-100 font-bold text-xs">
                        {qualityAlerts.length} 项
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 技术债务 */}
                {qualityStats && (
                  <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm">技术债务</span>
                      <span className="text-purple-100 font-bold text-xs">
                        {qualityStats.technicalDebtScore}/100
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
                    🔧 代码质量管理仪表板
                  </h2>
                  <p className="text-white/70 text-lg">
                    代码质量分析、重构管理和质量监控的综合视图
                  </p>
                </div>

                {/* 代码质量仪表板 */}
                <CodeQualityDashboard className="w-full" />

                {/* 质量管理能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🚀 代码质量管理能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🔍</span>
                        <h4 className="font-semibold text-white">深度质量分析</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        全面分析代码复杂度、类型安全、性能指标和架构健康度。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🚨</span>
                        <h4 className="font-semibold text-white">智能异味检测</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        自动识别代码异味、结构问题和潜在的质量风险。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚙️</span>
                        <h4 className="font-semibold text-white">自动化重构</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        生成重构计划，提供自动化重构建议和执行监控。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">📊</span>
                        <h4 className="font-semibold text-white">质量监控</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        实时监控代码质量趋势，提供预防性质量管理。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他视图使用相同的仪表板组件 */}
            {currentView !== 'dashboard' && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    {currentView === 'analysis' && '🔍 代码质量分析'}
                    {currentView === 'refactoring' && '⚙️ 重构管理中心'}
                    {currentView === 'monitoring' && '📊 质量监控中心'}
                    {currentView === 'reports' && '📋 质量报告中心'}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {currentView === 'analysis' && '深度代码质量分析和异味检测'}
                    {currentView === 'refactoring' && '重构计划管理和执行监控'}
                    {currentView === 'monitoring' && '实时质量监控和趋势分析'}
                    {currentView === 'reports' && '详细的代码质量分析报告'}
                  </p>
                </div>
                
                <CodeQualityDashboard className="w-full" />
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
              SmarTalk 代码质量管理中心 - 智能代码质量分析和重构管理平台
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/system-optimization"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                系统优化监控
              </a>
              <a
                href="/advanced-analytics"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                高级数据分析
              </a>
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
                href="/test-code-quality"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                质量测试
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
