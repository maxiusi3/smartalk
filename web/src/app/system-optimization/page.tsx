/**
 * 系统优化主页面
 * 整合性能监控、用户体验优化和系统健康管理的完整体验
 */

'use client'

import React, { useState } from 'react';
import SystemOptimizationDashboard from '../../components/optimization/SystemOptimizationDashboard';
import { useSystemOptimization } from '../../hooks/useSystemOptimization';

type OptimizationView = 'dashboard' | 'performance' | 'ux' | 'health' | 'reports';

export default function SystemOptimizationPage() {
  const [currentView, setCurrentView] = useState<OptimizationView>('dashboard');
  const { 
    systemHealth,
    optimizationStats,
    isPerformanceMonitoring,
    isUXTracking,
    optimizationAlerts
  } = useSystemOptimization();

  // 导航菜单项
  const navigationItems = [
    {
      id: 'dashboard' as OptimizationView,
      label: '优化仪表板',
      icon: '⚡',
      description: '系统性能和用户体验综合监控'
    },
    {
      id: 'performance' as OptimizationView,
      label: '性能监控',
      icon: '📊',
      description: '实时性能指标和优化建议'
    },
    {
      id: 'ux' as OptimizationView,
      label: '用户体验',
      icon: '👥',
      description: '用户行为分析和体验优化'
    },
    {
      id: 'health' as OptimizationView,
      label: '系统健康',
      icon: '🏥',
      description: '系统健康状态和诊断'
    },
    {
      id: 'reports' as OptimizationView,
      label: '优化报告',
      icon: '📋',
      description: '详细的优化分析报告'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">⚡</span>
                <h1 className="text-xl font-bold text-white">系统优化中心</h1>
              </div>
              
              {/* 快速状态指示器 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                {systemHealth && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>
                        {systemHealth.overall === 'excellent' && '🟢'}
                        {systemHealth.overall === 'good' && '🔵'}
                        {systemHealth.overall === 'fair' && '🟡'}
                        {systemHealth.overall === 'poor' && '🟠'}
                        {systemHealth.overall === 'critical' && '🔴'}
                      </span>
                      <span>系统状态: {
                        systemHealth.overall === 'excellent' ? '优秀' :
                        systemHealth.overall === 'good' ? '良好' :
                        systemHealth.overall === 'fair' ? '一般' :
                        systemHealth.overall === 'poor' ? '较差' : '严重'
                      }</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📊</span>
                      <span>性能: {systemHealth.performance}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👥</span>
                      <span>体验: {systemHealth.userExperience}</span>
                    </div>
                  </>
                )}
                
                {optimizationStats && (
                  <div className="flex items-center space-x-1">
                    <span>🚨</span>
                    <span>{optimizationStats.criticalIssues} 项紧急</span>
                  </div>
                )}
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className={`w-2 h-2 rounded-full ${isPerformanceMonitoring ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span>性能监控</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-white/80">
                <div className={`w-2 h-2 rounded-full ${isUXTracking ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span>UX跟踪</span>
              </div>
              
              <a
                href="/advanced-analytics"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                📊 高级分析
              </a>
              
              <a
                href="/learning/vtpr?interest=travel&keyword=hello"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
              <h2 className="text-lg font-semibold text-white mb-4">优化功能</h2>
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

              {/* 监控状态卡片 */}
              <div className="mt-6 space-y-3">
                {/* 性能监控状态 */}
                <div className={`${isPerformanceMonitoring ? 'bg-green-500/20 border-green-400/30' : 'bg-gray-500/20 border-gray-400/30'} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${isPerformanceMonitoring ? 'text-green-200' : 'text-gray-200'} text-sm`}>
                      性能监控
                    </span>
                    <span className={`${isPerformanceMonitoring ? 'text-green-100' : 'text-gray-100'} font-bold text-xs`}>
                      {isPerformanceMonitoring ? '运行中' : '已停止'}
                    </span>
                  </div>
                </div>
                
                {/* UX跟踪状态 */}
                <div className={`${isUXTracking ? 'bg-blue-500/20 border-blue-400/30' : 'bg-gray-500/20 border-gray-400/30'} border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${isUXTracking ? 'text-blue-200' : 'text-gray-200'} text-sm`}>
                      UX跟踪
                    </span>
                    <span className={`${isUXTracking ? 'text-blue-100' : 'text-gray-100'} font-bold text-xs`}>
                      {isUXTracking ? '跟踪中' : '已停止'}
                    </span>
                  </div>
                </div>
                
                {/* 警报数量 */}
                {optimizationAlerts.length > 0 && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">优化警报</span>
                      <span className="text-red-100 font-bold text-xs">
                        {optimizationAlerts.length} 项
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 监控时长 */}
                {optimizationStats && optimizationStats.monitoringUptime > 0 && (
                  <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm">运行时长</span>
                      <span className="text-purple-100 font-bold text-xs">
                        {optimizationStats.monitoringUptime}小时
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
                    ⚡ 系统优化仪表板
                  </h2>
                  <p className="text-white/70 text-lg">
                    性能监控、用户体验优化和系统健康管理的综合视图
                  </p>
                </div>

                {/* 系统优化仪表板 */}
                <SystemOptimizationDashboard className="w-full" />

                {/* 优化能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🚀 系统优化能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚡</span>
                        <h4 className="font-semibold text-white">性能监控</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        实时监控页面加载、交互响应、资源使用等关键性能指标。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">👥</span>
                        <h4 className="font-semibold text-white">用户体验优化</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        分析用户行为模式，识别体验问题，提供优化建议。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🚨</span>
                        <h4 className="font-semibold text-white">智能警报</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        主动识别性能和体验问题，提供自动修复和优化建议。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🏥</span>
                        <h4 className="font-semibold text-white">系统健康</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        综合评估系统健康状态，提供全面的诊断和优化方案。
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
                    {currentView === 'performance' && '📊 性能监控中心'}
                    {currentView === 'ux' && '👥 用户体验分析'}
                    {currentView === 'health' && '🏥 系统健康诊断'}
                    {currentView === 'reports' && '📋 优化报告中心'}
                  </h2>
                  <p className="text-white/70 text-lg">
                    {currentView === 'performance' && '实时性能监控和优化建议'}
                    {currentView === 'ux' && '用户行为分析和体验优化'}
                    {currentView === 'health' && '系统健康状态和诊断报告'}
                    {currentView === 'reports' && '详细的系统优化分析报告'}
                  </p>
                </div>
                
                <SystemOptimizationDashboard className="w-full" />
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
              SmarTalk 系统优化中心 - 智能性能监控和用户体验优化平台
            </div>
            
            <div className="flex items-center space-x-4">
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
                href="/test-system-optimization"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                系统测试
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
