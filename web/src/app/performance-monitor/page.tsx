/**
 * 性能监控页面
 * 监控系统性能，检查内存泄漏，提供优化建议
 */

'use client'

import React, { useState, useEffect } from 'react';
import { performanceOptimizer, PerformanceMetrics, OptimizationReport } from '../../lib/utils/PerformanceOptimizer';

export default function PerformanceMonitorPage() {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationReport, setOptimizationReport] = useState<OptimizationReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceMetrics[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 加载性能指标
  const loadMetrics = async () => {
    try {
      const metrics = await performanceOptimizer.getCurrentMetrics();
      setCurrentMetrics(metrics);
      
      const history = performanceOptimizer.getPerformanceHistory();
      setPerformanceHistory(history);
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  };

  // 生成优化报告
  const generateReport = async () => {
    setIsMonitoring(true);
    try {
      const report = await performanceOptimizer.generateOptimizationReport();
      setOptimizationReport(report);
    } catch (error) {
      console.error('Failed to generate optimization report:', error);
    } finally {
      setIsMonitoring(false);
    }
  };

  // 自动刷新
  useEffect(() => {
    loadMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 5000); // 每5秒刷新
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // 格式化内存大小
  const formatMemorySize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  // 获取性能评级
  const getPerformanceGrade = (score: number): { grade: string; color: string } => {
    if (score >= 90) return { grade: 'A', color: 'text-green-400' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-400' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-400' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-400' };
    return { grade: 'F', color: 'text-red-400' };
  };

  // 获取问题严重程度颜色
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-400';
      case 'high': return 'text-orange-400 bg-orange-900/20 border-orange-400';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-400';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 性能监控中心
          </h1>
          <p className="text-gray-300 text-lg">
            监控系统性能，检查内存泄漏，提供优化建议
          </p>
        </div>

        {/* 控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <button
                onClick={loadMetrics}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                🔄 刷新指标
              </button>
              
              <button
                onClick={generateReport}
                disabled={isMonitoring}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                {isMonitoring ? '生成中...' : '📋 生成报告'}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>自动刷新</span>
              </label>
              
              {currentMetrics && (
                <div className="text-sm text-gray-300">
                  最后更新: {new Date().toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 性能概览 */}
        {currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* 内存使用 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💾 内存使用</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">已使用:</span>
                  <span className="text-white font-medium">
                    {formatMemorySize(currentMetrics.memoryUsage.used)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">总计:</span>
                  <span className="text-white font-medium">
                    {formatMemorySize(currentMetrics.memoryUsage.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">使用率:</span>
                  <span className={`font-medium ${
                    currentMetrics.memoryUsage.percentage > 80 ? 'text-red-400' :
                    currentMetrics.memoryUsage.percentage > 60 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.memoryUsage.percentage.toFixed(1)}%
                  </span>
                </div>
                
                {/* 内存使用进度条 */}
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentMetrics.memoryUsage.percentage > 80 ? 'bg-red-500' :
                      currentMetrics.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, currentMetrics.memoryUsage.percentage)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 响应时间 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">⚡ 响应时间</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Focus Mode:</span>
                  <span className={`font-medium ${
                    currentMetrics.responseTime.focusMode > 200 ? 'text-red-400' :
                    currentMetrics.responseTime.focusMode > 100 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.responseTime.focusMode.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">发音评估:</span>
                  <span className={`font-medium ${
                    currentMetrics.responseTime.pronunciation > 300 ? 'text-red-400' :
                    currentMetrics.responseTime.pronunciation > 150 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.responseTime.pronunciation.toFixed(1)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Rescue Mode:</span>
                  <span className={`font-medium ${
                    currentMetrics.responseTime.rescueMode > 200 ? 'text-red-400' :
                    currentMetrics.responseTime.rescueMode > 100 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.responseTime.rescueMode.toFixed(1)}ms
                  </span>
                </div>
              </div>
            </div>

            {/* 资源使用 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔧 资源使用</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">事件监听器:</span>
                  <span className={`font-medium ${
                    currentMetrics.resourceUsage.eventListeners > 100 ? 'text-red-400' :
                    currentMetrics.resourceUsage.eventListeners > 50 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.resourceUsage.eventListeners}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">定时器:</span>
                  <span className={`font-medium ${
                    currentMetrics.resourceUsage.timers > 20 ? 'text-red-400' :
                    currentMetrics.resourceUsage.timers > 10 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {currentMetrics.resourceUsage.timers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Promise:</span>
                  <span className="text-white font-medium">
                    {currentMetrics.resourceUsage.promises}
                  </span>
                </div>
              </div>
            </div>

            {/* 浏览器兼容性 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🌐 浏览器兼容性</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">MediaRecorder:</span>
                  <span className={currentMetrics.browserCompatibility.mediaRecorder ? 'text-green-400' : 'text-red-400'}>
                    {currentMetrics.browserCompatibility.mediaRecorder ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Web Audio:</span>
                  <span className={currentMetrics.browserCompatibility.webAudio ? 'text-green-400' : 'text-red-400'}>
                    {currentMetrics.browserCompatibility.webAudio ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">LocalStorage:</span>
                  <span className={currentMetrics.browserCompatibility.localStorage ? 'text-green-400' : 'text-red-400'}>
                    {currentMetrics.browserCompatibility.localStorage ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">IndexedDB:</span>
                  <span className={currentMetrics.browserCompatibility.indexedDB ? 'text-green-400' : 'text-red-400'}>
                    {currentMetrics.browserCompatibility.indexedDB ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 优化报告 */}
        {optimizationReport && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">📋 优化报告</h2>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-300">总体评分</div>
                  <div className={`text-3xl font-bold ${getPerformanceGrade(optimizationReport.overallScore).color}`}>
                    {getPerformanceGrade(optimizationReport.overallScore).grade}
                  </div>
                  <div className="text-sm text-gray-300">
                    {optimizationReport.overallScore.toFixed(0)}分
                  </div>
                </div>
              </div>
            </div>

            {/* 问题列表 */}
            {optimizationReport.issues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">🚨 发现的问题</h3>
                <div className="space-y-3">
                  {optimizationReport.issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">
                          {issue.type === 'memory' && '💾'}
                          {issue.type === 'performance' && '⚡'}
                          {issue.type === 'compatibility' && '🌐'}
                          {issue.type === 'resource' && '🔧'}
                          {' '}
                          {issue.description}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">
                        💡 解决方案: {issue.solution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 优化建议 */}
            {optimizationReport.recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">💡 优化建议</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {optimizationReport.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <p className="text-sm text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 报告时间 */}
            <div className="mt-6 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                报告生成时间: {new Date(optimizationReport.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* 性能历史图表 */}
        {performanceHistory.length > 1 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">📈 性能趋势</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 内存使用趋势 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">内存使用趋势</h3>
                <div className="space-y-2">
                  {performanceHistory.slice(-10).map((metrics, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        {formatMemorySize(metrics.memoryUsage.used)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 响应时间趋势 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">响应时间趋势</h3>
                <div className="space-y-2">
                  {performanceHistory.slice(-10).map((metrics, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        Focus: {metrics.responseTime.focusMode.toFixed(0)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 资源使用趋势 */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">资源使用趋势</h3>
                <div className="space-y-2">
                  {performanceHistory.slice(-10).map((metrics, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-300">
                        监听器: {metrics.resourceUsage.eventListeners}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/integration-test"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            集成测试
          </a>
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            返回 vTPR 训练
          </a>
        </div>
      </div>
    </div>
  );
}
