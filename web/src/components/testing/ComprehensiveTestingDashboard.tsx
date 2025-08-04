/**
 * ComprehensiveTestingDashboard - 综合测试管理仪表板
 * 显示用户体验测试、功能测试、性能测试和兼容性测试的综合管理界面
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useComprehensiveTesting } from '../../hooks/useComprehensiveTesting';
import { productionMonitoring } from '../../lib/monitoring/ProductionMonitoring';

interface ComprehensiveTestingDashboardProps {
  className?: string;
}

export default function ComprehensiveTestingDashboard({ className = '' }: ComprehensiveTestingDashboardProps) {
  const {
    isRunning,
    progress,
    testResults,
    testingSummary,
    uxTestResults,
    functionalTestResults,
    performanceTestResults,
    compatibilityTestResults,
    browserCompatibilityMatrix,
    deviceCompatibilityReport,
    createTestPlan,
    executeTestPlan,
    generateTestReport,
    getProductionReadinessAssessment,
    clearAllResults,
    stopCurrentTest
  } = useComprehensiveTesting();

  const [activeTab, setActiveTab] = useState<'overview' | 'functional' | 'performance' | 'compatibility' | 'ux' | 'monitoring' | 'deployment'>('overview');
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [monitoringMetrics, setMonitoringMetrics] = useState<any>(null);

  // 更新监控数据
  useEffect(() => {
    const updateMonitoringData = () => {
      setSystemHealth(productionMonitoring.getSystemHealth());
      setMonitoringMetrics(productionMonitoring.getLatestMetrics());
    };

    updateMonitoringData();
    const interval = setInterval(updateMonitoringData, 30000); // 每30秒更新

    return () => clearInterval(interval);
  }, []);

  // 执行完整测试套件
  const handleRunFullTestSuite = async () => {
    const testSuites = [
      {
        id: 'focus_mode',
        name: 'Focus Mode 测试',
        description: '智能视觉引导功能测试',
        category: 'functional' as const,
        priority: 'critical' as const,
        estimatedDuration: 10
      },
      {
        id: 'pronunciation',
        name: '发音评估测试',
        description: '实时发音反馈功能测试',
        category: 'functional' as const,
        priority: 'critical' as const,
        estimatedDuration: 15
      },
      {
        id: 'rescue_mode',
        name: 'Rescue Mode 测试',
        description: '智能学习救援功能测试',
        category: 'functional' as const,
        priority: 'critical' as const,
        estimatedDuration: 12
      },
      {
        id: 'srs',
        name: 'SRS 系统测试',
        description: '科学间隔重复学习系统测试',
        category: 'functional' as const,
        priority: 'high' as const,
        estimatedDuration: 8
      },
      {
        id: 'ai_assistant',
        name: 'AI 学习助手测试',
        description: '个性化学习优化功能测试',
        category: 'functional' as const,
        priority: 'high' as const,
        estimatedDuration: 10
      },
      {
        id: 'performance_load',
        name: '性能负载测试',
        description: '系统负载和响应时间测试',
        category: 'performance' as const,
        priority: 'high' as const,
        estimatedDuration: 20
      },
      {
        id: 'compatibility_browser',
        name: '浏览器兼容性测试',
        description: '跨浏览器兼容性验证',
        category: 'compatibility' as const,
        priority: 'medium' as const,
        estimatedDuration: 25
      },
      {
        id: 'user_journey',
        name: '用户体验测试',
        description: '完整用户旅程和可用性测试',
        category: 'user_experience' as const,
        priority: 'high' as const,
        estimatedDuration: 18
      }
    ];

    const plan = createTestPlan(testSuites);
    await executeTestPlan(plan);
  };

  // 获取生产就绪评估
  const productionReadiness = getProductionReadinessAssessment();

  // 获取测试统计
  const getTestStats = () => {
    if (!testingSummary) return null;

    return {
      totalTests: testingSummary.totalTests,
      passedTests: testingSummary.passedTests,
      failedTests: testingSummary.failedTests,
      passRate: testingSummary.totalTests > 0 ? (testingSummary.passedTests / testingSummary.totalTests * 100).toFixed(1) : '0',
      overallScore: testingSummary.overallScore.toFixed(1),
      criticalIssues: testingSummary.criticalIssues,
      readinessLevel: testingSummary.readinessLevel
    };
  };

  const testStats = getTestStats();

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🧪 综合测试管理中心</h2>
            <p className="text-indigo-100">用户体验、功能、性能和兼容性测试的统一管理平台</p>
          </div>
          
          {testStats && (
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                testStats.readinessLevel === 'production_ready' ? 'bg-green-500 text-white' :
                testStats.readinessLevel === 'needs_fixes' ? 'bg-yellow-500 text-white' :
                testStats.readinessLevel === 'major_issues' ? 'bg-orange-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                <span className="mr-2">
                  {testStats.readinessLevel === 'production_ready' && '✅'}
                  {testStats.readinessLevel === 'needs_fixes' && '⚠️'}
                  {testStats.readinessLevel === 'major_issues' && '🔶'}
                  {testStats.readinessLevel === 'not_ready' && '❌'}
                </span>
                生产就绪度: {
                  testStats.readinessLevel === 'production_ready' ? '已就绪' :
                  testStats.readinessLevel === 'needs_fixes' ? '需修复' :
                  testStats.readinessLevel === 'major_issues' ? '重大问题' : '未就绪'
                } ({testStats.overallScore})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 导航标签 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 px-6">
          {[
            { id: 'overview', label: '测试概览', icon: '📊' },
            { id: 'functional', label: '功能测试', icon: '⚙️' },
            { id: 'performance', label: '性能测试', icon: '⚡' },
            { id: 'compatibility', label: '兼容性测试', icon: '🌐' },
            { id: 'ux', label: '用户体验', icon: '👤' },
            { id: 'monitoring', label: '生产监控', icon: '📈' },
            { id: 'deployment', label: '部署就绪', icon: '🚀' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
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
        {/* 测试概览标签 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 快速操作 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button
                  onClick={handleRunFullTestSuite}
                  disabled={isRunning}
                  className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
                >
                  <span className="mr-2">🚀</span>
                  {isRunning ? '测试中...' : '运行完整测试'}
                </button>

                <button
                  onClick={() => {
                    const report = generateTestReport();
                    const blob = new Blob([report], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'smartalk-test-report.md';
                    a.click();
                  }}
                  disabled={!testingSummary}
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <span className="mr-2">📋</span>
                  导出测试报告
                </button>

                <button
                  onClick={clearAllResults}
                  className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">🗑️</span>
                  清除测试结果
                </button>

                <button
                  onClick={stopCurrentTest}
                  disabled={!isRunning}
                  className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <span className="mr-2">⏹️</span>
                  停止测试
                </button>
              </div>
            </div>

            {/* 测试进度 */}
            {progress && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">测试进度</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-blue-700">
                    <span>当前阶段: {
                      progress.currentPhase === 'preparation' ? '准备中' :
                      progress.currentPhase === 'execution' ? '执行中' :
                      progress.currentPhase === 'analysis' ? '分析中' : '已完成'
                    }</span>
                    <span>{progress.completedSuites}/{progress.totalSuites} 套件</span>
                  </div>
                  
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progress.overallProgress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-blue-600">
                    <span>进度: {progress.overallProgress.toFixed(1)}%</span>
                    <span>预计剩余: {Math.ceil(progress.estimatedTimeRemaining)}分钟</span>
                  </div>
                  
                  {progress.currentSuite && (
                    <div className="text-sm text-blue-700">
                      正在执行: {progress.currentSuite}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 测试统计 */}
            {testStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">通过测试</h3>
                  <div className="text-3xl font-bold text-green-600 mb-1">{testStats.passedTests}</div>
                  <div className="text-sm text-green-700">通过率: {testStats.passRate}%</div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
                  <h3 className="font-semibold text-red-900 mb-2">失败测试</h3>
                  <div className="text-3xl font-bold text-red-600 mb-1">{testStats.failedTests}</div>
                  <div className="text-sm text-red-700">严重问题: {testStats.criticalIssues}</div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">总体评分</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">{testStats.overallScore}</div>
                  <div className="text-sm text-blue-700">满分100分</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">测试总数</h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">{testStats.totalTests}</div>
                  <div className="text-sm text-purple-700">已执行</div>
                </div>
              </div>
            )}

            {/* 生产就绪评估 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">生产就绪评估</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">分类评分</h4>
                  <div className="space-y-3">
                    {Object.entries(productionReadiness.categories).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category === 'functionality' ? '功能性' :
                           category === 'performance' ? '性能' :
                           category === 'usability' ? '可用性' :
                           category === 'compatibility' ? '兼容性' : '无障碍性'}:
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score >= 90 ? 'bg-green-500' :
                                score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{score.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">关键建议</h4>
                  <div className="space-y-2">
                    {productionReadiness.recommendations.slice(0, 5).map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span className="text-sm text-gray-600">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 测试结果概览 */}
            {testResults.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近测试结果</h3>
                <div className="space-y-3">
                  {testResults.slice(-5).map((result, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${
                      result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{result.category} 测试</h4>
                            <p className="text-sm text-gray-600">评分: {result.score}/100</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            耗时: {result.duration}ms
                          </div>
                        </div>
                      </div>
                      
                      {result.issues.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            问题: {result.issues.length} 项 
                            ({result.issues.filter(i => i.type === 'critical').length} 严重)
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 功能测试标签 */}
        {activeTab === 'functional' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">⚙️ 功能测试结果</h3>
              <span className="text-sm text-gray-500">
                {functionalTestResults.length} 个测试结果
              </span>
            </div>

            {functionalTestResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🧪</div>
                <p className="text-gray-600">暂无功能测试结果，请运行测试套件</p>
              </div>
            ) : (
              <div className="space-y-4">
                {functionalTestResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <h4 className="font-medium text-gray-900">{result.testId}</h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {result.suiteId}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          执行时间: {result.duration}ms | 
                          步骤: {result.stepResults.length} | 
                          通过: {result.stepResults.filter(s => s.passed).length}
                        </div>

                        {result.error && (
                          <div className="text-sm text-red-600 mb-2">
                            错误: {result.error}
                          </div>
                        )}

                        {result.performance && (
                          <div className="text-xs text-gray-500">
                            响应时间: {result.performance.responseTime.toFixed(0)}ms | 
                            内存使用: {result.performance.memoryUsage.toFixed(1)}MB | 
                            CPU使用: {result.performance.cpuUsage.toFixed(1)}%
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 性能测试标签 */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">⚡ 性能测试结果</h3>
              <span className="text-sm text-gray-500">
                {performanceTestResults.length} 个测试结果
              </span>
            </div>

            {performanceTestResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">⚡</div>
                <p className="text-gray-600">暂无性能测试结果，请运行性能测试</p>
              </div>
            ) : (
              <div className="space-y-4">
                {performanceTestResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <h4 className="font-medium text-gray-900">{result.testId}</h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {result.testType}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          测试时长: {(result.duration / 1000).toFixed(1)}秒
                        </div>
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {new Date(result.endTime).toLocaleString()}
                      </div>
                    </div>

                    {/* 性能指标 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {result.metrics.averageResponseTime.toFixed(0)}ms
                        </div>
                        <div className="text-xs text-gray-500">平均响应时间</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {result.metrics.requestsPerSecond.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">请求/秒</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {result.metrics.errorRate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">错误率</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {result.metrics.peakMemoryUsage.toFixed(0)}MB
                        </div>
                        <div className="text-xs text-gray-500">峰值内存</div>
                      </div>
                    </div>

                    {/* 阈值违规 */}
                    {result.thresholdViolations.length > 0 && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-red-800 mb-2">阈值违规:</h5>
                        <div className="space-y-1">
                          {result.thresholdViolations.map((violation, vIndex) => (
                            <div key={vIndex} className="text-sm text-red-600">
                              • {violation.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 性能建议 */}
                    {result.recommendations.length > 0 && (
                      <div className="border-t pt-3">
                        <h5 className="font-medium text-blue-800 mb-2">优化建议:</h5>
                        <div className="space-y-1">
                          {result.recommendations.slice(0, 3).map((rec, rIndex) => (
                            <div key={rIndex} className="text-sm text-blue-600">
                              • {rec.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 兼容性测试标签 */}
        {activeTab === 'compatibility' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">🌐 兼容性测试结果</h3>
              <span className="text-sm text-gray-500">
                {compatibilityTestResults.length} 个测试结果
              </span>
            </div>

            {/* 浏览器兼容性矩阵 */}
            {browserCompatibilityMatrix.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">浏览器兼容性矩阵</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium text-gray-900">功能</th>
                        {Object.keys(browserCompatibilityMatrix[0]?.browsers || {}).map(browser => (
                          <th key={browser} className="text-center py-2 px-3 font-medium text-gray-900">
                            {browser}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {browserCompatibilityMatrix.map((feature, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3 font-medium text-gray-800">{feature.feature}</td>
                          {Object.entries(feature.browsers).map(([browser, support]) => (
                            <td key={browser} className="text-center py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                support.supported 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {support.supported ? '✅' : '❌'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 设备兼容性报告 */}
            {deviceCompatibilityReport.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">设备兼容性报告</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deviceCompatibilityReport.map((report, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">
                        {report.deviceCategory === 'mobile' ? '📱 移动设备' :
                         report.deviceCategory === 'tablet' ? '📱 平板设备' : '💻 桌面设备'}
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">测试设备:</span>
                          <span className="font-medium">{report.testedDevices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">通过设备:</span>
                          <span className="font-medium text-green-600">{report.passedDevices}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">严重问题:</span>
                          <span className="font-medium text-red-600">{report.criticalIssues}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">通过率:</span>
                          <span className="font-medium">
                            {report.testedDevices > 0 ? 
                              ((report.passedDevices / report.testedDevices) * 100).toFixed(1) : 0
                            }%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 兼容性测试详细结果 */}
            {compatibilityTestResults.length > 0 && (
              <div className="space-y-4">
                {compatibilityTestResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <h4 className="font-medium text-gray-900">{result.target.name}</h4>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {result.target.type}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          评分: {result.score}/100 | 
                          测试时长: {result.duration}ms | 
                          问题: {result.issues.length}
                        </div>

                        {result.issues.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">主要问题:</span>
                            <ul className="mt-1 space-y-1">
                              {result.issues.slice(0, 3).map((issue, iIndex) => (
                                <li key={iIndex} className="text-gray-600">
                                  • [{issue.severity}] {issue.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 用户体验标签 */}
        {activeTab === 'ux' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">👤 用户体验测试结果</h3>
              <span className="text-sm text-gray-500">
                {uxTestResults.length} 个测试结果
              </span>
            </div>

            {uxTestResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👤</div>
                <p className="text-gray-600">暂无用户体验测试结果，请运行用户旅程测试</p>
              </div>
            ) : (
              <div className="space-y-4">
                {uxTestResults.map((result, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    result.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {result.passed ? '✅' : '❌'}
                          </span>
                          <h4 className="font-medium text-gray-900">用户旅程测试</h4>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          执行时间: {result.duration}ms
                        </div>

                        {result.error && (
                          <div className="text-sm text-red-600 mb-2">
                            错误: {result.error}
                          </div>
                        )}

                        {result.details.performanceMetrics && (
                          <div className="text-xs text-gray-500">
                            页面加载: {result.details.performanceMetrics.pageLoadTime.toFixed(0)}ms | 
                            FCP: {result.details.performanceMetrics.firstContentfulPaint.toFixed(0)}ms | 
                            LCP: {result.details.performanceMetrics.largestContentfulPaint.toFixed(0)}ms
                          </div>
                        )}

                        {result.details.accessibilityIssues && result.details.accessibilityIssues.length > 0 && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-orange-700">无障碍问题:</span>
                            <ul className="mt-1 space-y-1">
                              {result.details.accessibilityIssues.slice(0, 2).map((issue, iIndex) => (
                                <li key={iIndex} className="text-orange-600">
                                  • [{issue.severity}] {issue.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 生产监控标签 */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">📈 生产监控状态</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  productionMonitoring.isMonitoringActive() ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {productionMonitoring.isMonitoringActive() ? '监控中' : '未监控'}
                </span>
              </div>
            </div>

            {/* 系统健康状态 */}
            {systemHealth && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">系统健康状态</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-4 h-4 rounded-full ${
                        systemHealth.overall === 'healthy' ? 'bg-green-500' :
                        systemHealth.overall === 'warning' ? 'bg-yellow-500' :
                        systemHealth.overall === 'critical' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <span className="font-medium text-gray-900">
                        整体状态: {
                          systemHealth.overall === 'healthy' ? '健康' :
                          systemHealth.overall === 'warning' ? '警告' :
                          systemHealth.overall === 'critical' ? '严重' : '未知'
                        }
                      </span>
                      <span className="text-sm text-gray-600">({systemHealth.score}/100)</span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(systemHealth.components).map(([name, component]) => (
                        <div key={name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              component.status === 'healthy' ? 'bg-green-500' :
                              component.status === 'warning' ? 'bg-yellow-500' :
                              component.status === 'critical' ? 'bg-red-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-sm text-gray-700">{name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              {component.responseTime.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-gray-500">
                              {component.uptime.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">趋势分析</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">性能趋势:</span>
                        <span className={`text-sm font-medium ${
                          systemHealth.trends.performance === 'improving' ? 'text-green-600' :
                          systemHealth.trends.performance === 'degrading' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {systemHealth.trends.performance === 'improving' ? '📈 改善' :
                           systemHealth.trends.performance === 'degrading' ? '📉 下降' : '➡️ 稳定'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">可靠性趋势:</span>
                        <span className={`text-sm font-medium ${
                          systemHealth.trends.reliability === 'improving' ? 'text-green-600' :
                          systemHealth.trends.reliability === 'degrading' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {systemHealth.trends.reliability === 'improving' ? '📈 改善' :
                           systemHealth.trends.reliability === 'degrading' ? '📉 下降' : '➡️ 稳定'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">用户体验趋势:</span>
                        <span className={`text-sm font-medium ${
                          systemHealth.trends.userExperience === 'improving' ? 'text-green-600' :
                          systemHealth.trends.userExperience === 'degrading' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {systemHealth.trends.userExperience === 'improving' ? '📈 改善' :
                           systemHealth.trends.userExperience === 'degrading' ? '📉 下降' : '➡️ 稳定'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 最新监控指标 */}
            {monitoringMetrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">实时监控指标</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {monitoringMetrics.performance.responseTime.toFixed(0)}ms
                    </div>
                    <div className="text-sm text-gray-600">响应时间</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {monitoringMetrics.performance.availability.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">可用性</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {monitoringMetrics.performance.errorRate.toFixed(2)}%
                    </div>
                    <div className="text-sm text-gray-600">错误率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {monitoringMetrics.business.activeUsers}
                    </div>
                    <div className="text-sm text-gray-600">活跃用户</div>
                  </div>
                </div>
              </div>
            )}

            {/* 监控控制 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">监控控制</h4>
              <div className="flex space-x-4">
                <button
                  onClick={() => productionMonitoring.startMonitoring()}
                  disabled={productionMonitoring.isMonitoringActive()}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  开始监控
                </button>
                <button
                  onClick={() => productionMonitoring.stopMonitoring()}
                  disabled={!productionMonitoring.isMonitoringActive()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  停止监控
                </button>
                <button
                  onClick={() => {
                    const report = productionMonitoring.generateMonitoringReport();
                    const blob = new Blob([report], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'monitoring-report.md';
                    a.click();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  导出监控报告
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 部署就绪标签 */}
        {activeTab === 'deployment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">🚀 部署就绪评估</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                productionReadiness.overallReadiness === 'ready' ? 'bg-green-100 text-green-800' :
                productionReadiness.overallReadiness === 'conditional' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {productionReadiness.overallReadiness === 'ready' ? '✅ 就绪' :
                 productionReadiness.overallReadiness === 'conditional' ? '⚠️ 有条件就绪' : '❌ 未就绪'}
              </div>
            </div>

            {/* 就绪评估详情 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">就绪评估详情</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">分类评分</h5>
                  <div className="space-y-3">
                    {Object.entries(productionReadiness.categories).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">
                          {category === 'functionality' ? '功能性' :
                           category === 'performance' ? '性能' :
                           category === 'usability' ? '可用性' :
                           category === 'compatibility' ? '兼容性' : '无障碍性'}:
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score >= 90 ? 'bg-green-500' :
                                score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-10">{score.toFixed(0)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900 mb-3">整体评分</h5>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      {productionReadiness.score.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-600">满分100分</div>
                    <div className="w-32 bg-gray-200 rounded-full h-3 mx-auto mt-3">
                      <div 
                        className={`h-3 rounded-full ${
                          productionReadiness.score >= 90 ? 'bg-green-500' :
                          productionReadiness.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${productionReadiness.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 阻塞问题 */}
            {productionReadiness.blockers.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="font-semibold text-red-900 mb-4">🚫 阻塞问题</h4>
                <div className="space-y-3">
                  {productionReadiness.blockers.map((blocker, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-red-500 mt-1">•</span>
                      <div className="flex-1">
                        <div className="font-medium text-red-800">{blocker.description}</div>
                        <div className="text-sm text-red-600 mt-1">
                          影响: {blocker.impact}
                        </div>
                        <div className="text-sm text-red-600">
                          解决方案: {blocker.solution}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 部署建议 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-semibold text-blue-900 mb-4">💡 部署建议</h4>
              <div className="space-y-2">
                {productionReadiness.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm text-blue-700">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 部署风险 */}
            {productionReadiness.deploymentRisks.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="font-semibold text-yellow-900 mb-4">⚠️ 部署风险</h4>
                <div className="space-y-2">
                  {productionReadiness.deploymentRisks.map((risk, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span className="text-sm text-yellow-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 下一步行动 */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-4">📋 下一步行动</h4>
              <div className="space-y-2">
                {productionReadiness.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-sm text-green-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
