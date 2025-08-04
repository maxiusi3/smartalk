/**
 * 综合测试管理页面
 * Phase 5 - 最终优化与部署准备的综合测试管理中心
 */

'use client'

import React, { useState } from 'react';
import ComprehensiveTestingDashboard from '../../components/testing/ComprehensiveTestingDashboard';
import { useComprehensiveTesting } from '../../hooks/useComprehensiveTesting';
import { productionMonitoring } from '../../lib/monitoring/ProductionMonitoring';
import { productionDeployment } from '../../lib/deployment/ProductionDeployment';

export default function ComprehensiveTestingPage() {
  const [currentView, setCurrentView] = useState<'testing' | 'monitoring' | 'deployment'>('testing');
  const [deploymentResult, setDeploymentResult] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  const {
    testingSummary,
    getProductionReadinessAssessment
  } = useComprehensiveTesting();

  // 获取生产就绪评估
  const productionReadiness = getProductionReadinessAssessment();

  // 执行生产部署
  const handleProductionDeployment = async () => {
    setIsDeploying(true);
    
    try {
      const config = productionDeployment.generateProductionConfig();
      const result = await productionDeployment.executeDeployment(config);
      setDeploymentResult(result);
    } catch (error) {
      console.error('Deployment failed:', error);
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  // 导航菜单项
  const navigationItems = [
    {
      id: 'testing' as const,
      label: '综合测试',
      icon: '🧪',
      description: '用户体验、功能、性能和兼容性测试管理'
    },
    {
      id: 'monitoring' as const,
      label: '生产监控',
      icon: '📊',
      description: '实时监控、性能指标和系统健康状态'
    },
    {
      id: 'deployment' as const,
      label: '部署管理',
      icon: '🚀',
      description: '生产部署配置和部署执行管理'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* 顶部导航栏 */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🧪</span>
                <h1 className="text-xl font-bold text-white">综合测试与部署管理中心</h1>
              </div>
              
              {/* 快速状态指示器 */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-white/80">
                {testingSummary && (
                  <>
                    <div className="flex items-center space-x-1">
                      <span>
                        {testingSummary.readinessLevel === 'production_ready' && '🟢'}
                        {testingSummary.readinessLevel === 'needs_fixes' && '🟡'}
                        {testingSummary.readinessLevel === 'major_issues' && '🟠'}
                        {testingSummary.readinessLevel === 'not_ready' && '🔴'}
                      </span>
                      <span>就绪度: {
                        testingSummary.readinessLevel === 'production_ready' ? '已就绪' :
                        testingSummary.readinessLevel === 'needs_fixes' ? '需修复' :
                        testingSummary.readinessLevel === 'major_issues' ? '重大问题' : '未就绪'
                      }</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📊</span>
                      <span>评分: {testingSummary.overallScore.toFixed(0)}/100</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>✅</span>
                      <span>{testingSummary.passedTests}/{testingSummary.totalTests} 通过</span>
                    </div>
                  </>
                )}
                
                <div className="flex items-center space-x-1">
                  <span>📈</span>
                  <span>监控: {productionMonitoring.isMonitoringActive() ? '运行中' : '已停止'}</span>
                </div>
              </div>
            </div>

            {/* 快速操作按钮 */}
            <div className="flex items-center space-x-3">
              <a
                href="/system-optimization"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ⚡ 系统优化
              </a>
              
              <a
                href="/code-quality"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                🔧 代码质量
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
              <h2 className="text-lg font-semibold text-white mb-4">管理功能</h2>
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

              {/* 快速状态卡片 */}
              <div className="mt-6 space-y-3">
                {/* 测试状态 */}
                {testingSummary && (
                  <div className={`${
                    testingSummary.readinessLevel === 'production_ready' 
                      ? 'bg-green-500/20 border-green-400/30' 
                      : testingSummary.readinessLevel === 'needs_fixes'
                      ? 'bg-yellow-500/20 border-yellow-400/30'
                      : 'bg-red-500/20 border-red-400/30'
                  } border rounded-lg p-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        testingSummary.readinessLevel === 'production_ready' 
                          ? 'text-green-200' 
                          : testingSummary.readinessLevel === 'needs_fixes'
                          ? 'text-yellow-200'
                          : 'text-red-200'
                      } text-sm`}>
                        测试状态
                      </span>
                      <span className={`${
                        testingSummary.readinessLevel === 'production_ready' 
                          ? 'text-green-100' 
                          : testingSummary.readinessLevel === 'needs_fixes'
                          ? 'text-yellow-100'
                          : 'text-red-100'
                      } font-bold text-xs`}>
                        {testingSummary.overallScore.toFixed(0)}/100
                      </span>
                    </div>
                  </div>
                )}
                
                {/* 生产就绪度 */}
                <div className={`${
                  productionReadiness.overallReadiness === 'ready' 
                    ? 'bg-green-500/20 border-green-400/30' 
                    : productionReadiness.overallReadiness === 'conditional'
                    ? 'bg-yellow-500/20 border-yellow-400/30'
                    : 'bg-red-500/20 border-red-400/30'
                } border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${
                      productionReadiness.overallReadiness === 'ready' 
                        ? 'text-green-200' 
                        : productionReadiness.overallReadiness === 'conditional'
                        ? 'text-yellow-200'
                        : 'text-red-200'
                    } text-sm`}>
                      部署就绪
                    </span>
                    <span className={`${
                      productionReadiness.overallReadiness === 'ready' 
                        ? 'text-green-100' 
                        : productionReadiness.overallReadiness === 'conditional'
                        ? 'text-yellow-100'
                        : 'text-red-100'
                    } font-bold text-xs`}>
                      {productionReadiness.score.toFixed(0)}/100
                    </span>
                  </div>
                </div>
                
                {/* 监控状态 */}
                <div className={`${
                  productionMonitoring.isMonitoringActive() 
                    ? 'bg-blue-500/20 border-blue-400/30' 
                    : 'bg-gray-500/20 border-gray-400/30'
                } border rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <span className={`${
                      productionMonitoring.isMonitoringActive() 
                        ? 'text-blue-200' 
                        : 'text-gray-200'
                    } text-sm`}>
                      生产监控
                    </span>
                    <span className={`${
                      productionMonitoring.isMonitoringActive() 
                        ? 'text-blue-100' 
                        : 'text-gray-100'
                    } font-bold text-xs`}>
                      {productionMonitoring.isMonitoringActive() ? '运行中' : '已停止'}
                    </span>
                  </div>
                </div>
                
                {/* 部署状态 */}
                {deploymentResult && (
                  <div className={`${
                    deploymentResult.success 
                      ? 'bg-green-500/20 border-green-400/30' 
                      : 'bg-red-500/20 border-red-400/30'
                  } border rounded-lg p-3`}>
                    <div className="flex items-center justify-between">
                      <span className={`${
                        deploymentResult.success 
                          ? 'text-green-200' 
                          : 'text-red-200'
                      } text-sm`}>
                        最新部署
                      </span>
                      <span className={`${
                        deploymentResult.success 
                          ? 'text-green-100' 
                          : 'text-red-100'
                      } font-bold text-xs`}>
                        {deploymentResult.success ? '成功' : '失败'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 主要内容区域 */}
          <div className="lg:col-span-3">
            {/* 综合测试视图 */}
            {currentView === 'testing' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    🧪 综合测试管理中心
                  </h2>
                  <p className="text-white/70 text-lg">
                    用户体验、功能、性能和兼容性测试的统一管理平台
                  </p>
                </div>

                {/* 综合测试仪表板 */}
                <ComprehensiveTestingDashboard className="w-full" />

                {/* 测试能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🚀 综合测试能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">👤</span>
                        <h4 className="font-semibold text-white">用户体验测试</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        完整用户旅程测试、可用性测试和无障碍性验证。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚙️</span>
                        <h4 className="font-semibold text-white">功能测试</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        八方核心功能的端到端测试和集成测试验证。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚡</span>
                        <h4 className="font-semibold text-white">性能测试</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        负载测试、压力测试、内存泄漏和响应时间测试。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🌐</span>
                        <h4 className="font-semibold text-white">兼容性测试</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        跨浏览器兼容性、移动设备适配和屏幕尺寸测试。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 生产监控视图 */}
            {currentView === 'monitoring' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    📊 生产监控中心
                  </h2>
                  <p className="text-white/70 text-lg">
                    实时监控、性能指标收集和系统健康状态管理
                  </p>
                </div>

                {/* 监控仪表板 */}
                <ComprehensiveTestingDashboard className="w-full" />

                {/* 监控能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">📈 监控能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🔍</span>
                        <h4 className="font-semibold text-white">实时监控</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        系统性能、用户体验和业务指标的实时监控。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🚨</span>
                        <h4 className="font-semibold text-white">智能告警</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        基于阈值的自动告警和分级告警管理系统。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">📊</span>
                        <h4 className="font-semibold text-white">趋势分析</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        性能趋势分析和预测性质量管理。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🏥</span>
                        <h4 className="font-semibold text-white">健康检查</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        系统组件健康状态检查和可用性监控。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 部署管理视图 */}
            {currentView === 'deployment' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">
                    🚀 部署管理中心
                  </h2>
                  <p className="text-white/70 text-lg">
                    生产部署配置、部署执行和部署监控管理
                  </p>
                </div>

                {/* 部署控制面板 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">部署控制</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-white mb-3">生产就绪评估</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/80">整体就绪度:</span>
                          <span className={`font-bold ${
                            productionReadiness.overallReadiness === 'ready' ? 'text-green-400' :
                            productionReadiness.overallReadiness === 'conditional' ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {productionReadiness.overallReadiness === 'ready' ? '✅ 已就绪' :
                             productionReadiness.overallReadiness === 'conditional' ? '⚠️ 有条件就绪' : '❌ 未就绪'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white/80">评分:</span>
                          <span className="text-white font-bold">{productionReadiness.score.toFixed(0)}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">阻塞问题:</span>
                          <span className={`font-bold ${
                            productionReadiness.blockers.length === 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {productionReadiness.blockers.length} 项
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white mb-3">部署历史</h4>
                      <div className="bg-white/5 rounded-lg p-4">
                        {deploymentResult ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white/80">最新部署:</span>
                              <span className={`font-bold ${
                                deploymentResult.success ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {deploymentResult.success ? '✅ 成功' : '❌ 失败'}
                              </span>
                            </div>
                            {deploymentResult.success && (
                              <>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-white/80">部署时间:</span>
                                  <span className="text-white text-sm">
                                    {(deploymentResult.duration / 1000).toFixed(1)}秒
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-white/80">版本:</span>
                                  <span className="text-white text-sm">{deploymentResult.version}</span>
                                </div>
                              </>
                            )}
                            {deploymentResult.error && (
                              <div className="text-red-400 text-sm mt-2">
                                错误: {deploymentResult.error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-white/60 text-sm">暂无部署历史</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleProductionDeployment}
                      disabled={isDeploying || productionReadiness.overallReadiness === 'not_ready'}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-600 transition-colors font-medium"
                    >
                      {isDeploying ? '部署中...' : '🚀 执行生产部署'}
                    </button>

                    <button
                      onClick={() => {
                        const config = productionDeployment.generateProductionConfig();
                        const envFile = productionDeployment.generateEnvironmentFile(config);
                        const blob = new Blob([envFile], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = '.env.production';
                        a.click();
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      📄 导出环境配置
                    </button>

                    <button
                      onClick={() => {
                        const config = productionDeployment.generateProductionConfig();
                        const script = productionDeployment.generateDeploymentScript(config);
                        const blob = new Blob([script], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'deploy.sh';
                        a.click();
                      }}
                      className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      📜 导出部署脚本
                    </button>
                  </div>
                </div>

                {/* 部署能力介绍 */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">🛠️ 部署能力</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">⚙️</span>
                        <h4 className="font-semibold text-white">构建优化</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        代码分割、压缩优化、资源优化和缓存配置。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🔒</span>
                        <h4 className="font-semibold text-white">安全配置</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        CSP策略、安全头配置和数据保护机制。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">🚀</span>
                        <h4 className="font-semibold text-white">CI/CD集成</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        自动化构建、测试和部署流程管理。
                      </p>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">📊</span>
                        <h4 className="font-semibold text-white">部署监控</h4>
                      </div>
                      <p className="text-white/70 text-sm">
                        部署状态监控、回滚机制和部署指标收集。
                      </p>
                    </div>
                  </div>
                </div>
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
              SmarTalk Web 综合测试与部署管理中心 - Phase 5 最终优化与部署准备
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="/system-optimization"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                系统优化监控
              </a>
              <a
                href="/code-quality"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                代码质量管理
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
