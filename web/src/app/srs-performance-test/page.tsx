/**
 * SRS性能测试页面
 * 专门测试SRS系统的性能、稳定性和可扩展性
 */

'use client'

import React, { useState, useEffect } from 'react';
import { srsPerformanceOptimizer, SRSPerformanceMetrics, SRSStressTestResult } from '../../lib/utils/SRSPerformanceOptimizer';

export default function SRSPerformanceTestPage() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<SRSPerformanceMetrics | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<SRSPerformanceMetrics[]>([]);
  const [stressTestResults, setStressTestResults] = useState<SRSStressTestResult[]>([]);
  const [isRunningStressTest, setIsRunningStressTest] = useState(false);
  const [stressTestConfig, setStressTestConfig] = useState({
    cardCount: 1000,
    sessionCount: 5,
    durationMs: 30000
  });

  // 加载当前性能指标
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await srsPerformanceOptimizer.getCurrentSRSMetrics();
        setCurrentMetrics(metrics);
      } catch (error) {
        console.error('Failed to load SRS metrics:', error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  // 开始/停止性能监控
  const toggleMonitoring = () => {
    if (isMonitoring) {
      srsPerformanceOptimizer.stopMonitoring();
      setIsMonitoring(false);
    } else {
      srsPerformanceOptimizer.startMonitoring(2000);
      setIsMonitoring(true);
      
      // 定期更新历史数据
      const historyInterval = setInterval(() => {
        const history = srsPerformanceOptimizer.getPerformanceHistory();
        setPerformanceHistory(history);
      }, 2000);
      
      // 清理函数
      setTimeout(() => {
        clearInterval(historyInterval);
      }, 300000); // 5分钟后停止
    }
  };

  // 运行压力测试
  const runStressTest = async () => {
    setIsRunningStressTest(true);
    
    try {
      const result = await srsPerformanceOptimizer.runStressTest(
        stressTestConfig.cardCount,
        stressTestConfig.sessionCount,
        stressTestConfig.durationMs
      );
      
      setStressTestResults(prev => [result, ...prev.slice(0, 4)]); // 保留最近5个结果
    } catch (error) {
      console.error('Stress test failed:', error);
    } finally {
      setIsRunningStressTest(false);
    }
  };

  // 运行预设压力测试
  const runPresetStressTests = async () => {
    const presets = [
      { cardCount: 100, sessionCount: 2, durationMs: 10000, name: '轻量测试' },
      { cardCount: 500, sessionCount: 3, durationMs: 20000, name: '中等测试' },
      { cardCount: 1000, sessionCount: 5, durationMs: 30000, name: '重度测试' },
      { cardCount: 2000, sessionCount: 8, durationMs: 60000, name: '极限测试' }
    ];

    setIsRunningStressTest(true);
    
    for (const preset of presets) {
      try {
        const result = await srsPerformanceOptimizer.runStressTest(
          preset.cardCount,
          preset.sessionCount,
          preset.durationMs
        );
        result.testName = preset.name;
        setStressTestResults(prev => [result, ...prev]);
        
        // 测试间隔
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Preset test ${preset.name} failed:`, error);
      }
    }
    
    setIsRunningStressTest(false);
  };

  // 获取性能评级
  const getPerformanceGrade = (metrics: SRSPerformanceMetrics): { grade: string; color: string } => {
    const score = metrics.scalabilityMetrics.systemStabilityScore;
    
    if (score >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (score >= 80) return { grade: 'A', color: 'text-green-500' };
    if (score >= 70) return { grade: 'B', color: 'text-blue-500' };
    if (score >= 60) return { grade: 'C', color: 'text-yellow-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  // 格式化时间
  const formatTime = (ms: number): string => {
    if (ms < 1) return `${(ms * 1000).toFixed(1)}μs`;
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // 格式化内存大小
  const formatMemory = (bytes: number): string => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚡ SRS 系统性能测试
          </h1>
          <p className="text-gray-300 text-lg">
            监控和优化SRS算法、界面性能和系统稳定性
          </p>
        </div>

        {/* 实时性能指标 */}
        {currentMetrics && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">实时性能指标</h2>
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${getPerformanceGrade(currentMetrics).color}`}>
                  {getPerformanceGrade(currentMetrics).grade}
                </div>
                <button
                  onClick={toggleMonitoring}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isMonitoring
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isMonitoring ? '⏹️ 停止监控' : '▶️ 开始监控'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 算法性能 */}
              <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-300 mb-3">算法性能</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">SM2计算:</span>
                    <span className="text-white">{formatTime(currentMetrics.algorithmPerformance.sm2CalculationTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">卡片排序:</span>
                    <span className="text-white">{formatTime(currentMetrics.algorithmPerformance.cardSortingTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">优先级计算:</span>
                    <span className="text-white">{formatTime(currentMetrics.algorithmPerformance.priorityCalculationTime)}</span>
                  </div>
                </div>
              </div>

              {/* 内存使用 */}
              <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-300 mb-3">内存使用</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">卡片数量:</span>
                    <span className="text-white">{currentMetrics.memoryUsage.cardsInMemory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">会话数量:</span>
                    <span className="text-white">{currentMetrics.memoryUsage.sessionsInMemory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">总占用:</span>
                    <span className="text-white">{formatMemory(currentMetrics.memoryUsage.totalMemoryFootprint)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">内存泄漏:</span>
                    <span className={currentMetrics.memoryUsage.memoryLeakDetected ? 'text-red-400' : 'text-green-400'}>
                      {currentMetrics.memoryUsage.memoryLeakDetected ? '检测到' : '正常'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 数据库性能 */}
              <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">数据库性能</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">保存操作:</span>
                    <span className="text-white">{formatTime(currentMetrics.databasePerformance.saveOperationTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">加载操作:</span>
                    <span className="text-white">{formatTime(currentMetrics.databasePerformance.loadOperationTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">同步操作:</span>
                    <span className="text-white">{formatTime(currentMetrics.databasePerformance.syncOperationTime)}</span>
                  </div>
                </div>
              </div>

              {/* UI性能 */}
              <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-300 mb-3">UI性能</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">复习界面:</span>
                    <span className="text-white">{formatTime(currentMetrics.uiPerformance.reviewInterfaceRenderTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">进度仪表板:</span>
                    <span className="text-white">{formatTime(currentMetrics.uiPerformance.progressDashboardRenderTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">动画帧率:</span>
                    <span className="text-white">{currentMetrics.uiPerformance.animationFrameRate}fps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">交互响应:</span>
                    <span className="text-white">{formatTime(currentMetrics.uiPerformance.userInteractionResponseTime)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 可扩展性指标 */}
            <div className="mt-6 bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">可扩展性指标</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{currentMetrics.scalabilityMetrics.maxCardsHandled}</div>
                  <div className="text-gray-300">最大卡片数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{currentMetrics.scalabilityMetrics.concurrentSessionsSupported}</div>
                  <div className="text-gray-300">并发会话数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{formatTime(currentMetrics.scalabilityMetrics.performanceDegradationThreshold)}</div>
                  <div className="text-gray-300">性能阈值</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{currentMetrics.scalabilityMetrics.systemStabilityScore}</div>
                  <div className="text-gray-300">稳定性评分</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 压力测试控制 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">压力测试</h2>
          
          {/* 测试配置 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                卡片数量
              </label>
              <input
                type="number"
                min="10"
                max="5000"
                value={stressTestConfig.cardCount}
                onChange={(e) => setStressTestConfig(prev => ({
                  ...prev,
                  cardCount: parseInt(e.target.value) || 1000
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                并发会话数
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={stressTestConfig.sessionCount}
                onChange={(e) => setStressTestConfig(prev => ({
                  ...prev,
                  sessionCount: parseInt(e.target.value) || 5
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                测试时长（秒）
              </label>
              <input
                type="number"
                min="5"
                max="300"
                value={stressTestConfig.durationMs / 1000}
                onChange={(e) => setStressTestConfig(prev => ({
                  ...prev,
                  durationMs: (parseInt(e.target.value) || 30) * 1000
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 测试按钮 */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={runStressTest}
              disabled={isRunningStressTest}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningStressTest ? '运行中...' : '🔥 运行自定义压力测试'}
            </button>
            
            <button
              onClick={runPresetStressTests}
              disabled={isRunningStressTest}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              📊 运行预设测试套件
            </button>
            
            <button
              onClick={() => setStressTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              🗑️ 清除结果
            </button>
          </div>
        </div>

        {/* 压力测试结果 */}
        {stressTestResults.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">压力测试结果</h2>
            
            <div className="space-y-4">
              {stressTestResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.success 
                      ? 'bg-green-900/20 border-green-400' 
                      : 'bg-red-900/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">
                      {result.success ? '✅' : '❌'} {result.testName}
                    </h3>
                    <div className="text-sm text-gray-400">
                      耗时: {formatTime(result.duration)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-sm">
                      <span className="text-gray-300">卡片数量:</span>
                      <span className="text-white ml-2">{result.cardCount}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-300">并发会话:</span>
                      <span className="text-white ml-2">{result.sessionCount}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-300">稳定性评分:</span>
                      <span className="text-white ml-2">{result.performanceMetrics.scalabilityMetrics.systemStabilityScore}/100</span>
                    </div>
                  </div>
                  
                  {result.errors.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-red-300 mb-1">错误信息:</div>
                      <div className="text-xs text-red-200 bg-red-900/20 rounded p-2 max-h-20 overflow-y-auto">
                        {result.errors.slice(0, 3).map((error, i) => (
                          <div key={i}>{error}</div>
                        ))}
                        {result.errors.length > 3 && (
                          <div>... 还有 {result.errors.length - 3} 个错误</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {result.recommendations.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-yellow-300 mb-1">优化建议:</div>
                      <div className="text-xs text-yellow-200">
                        {result.recommendations.slice(0, 2).map((rec, i) => (
                          <div key={i}>• {rec}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 性能历史趋势 */}
        {performanceHistory.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">性能历史趋势</h2>
            
            <div className="space-y-4">
              {performanceHistory.slice(-10).map((metrics, index) => (
                <div key={index} className="flex items-center space-x-4 text-sm">
                  <div className="w-20 text-gray-400">
                    {new Date().toLocaleTimeString()}
                  </div>
                  <div className="flex-1 grid grid-cols-4 gap-4">
                    <div>
                      <span className="text-gray-300">SM2: </span>
                      <span className="text-white">{formatTime(metrics.algorithmPerformance.sm2CalculationTime)}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">内存: </span>
                      <span className="text-white">{formatMemory(metrics.memoryUsage.totalMemoryFootprint)}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">UI: </span>
                      <span className="text-white">{formatTime(metrics.uiPerformance.reviewInterfaceRenderTime)}</span>
                    </div>
                    <div>
                      <span className="text-gray-300">稳定性: </span>
                      <span className="text-white">{metrics.scalabilityMetrics.systemStabilityScore}/100</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/srs"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            🧠 返回SRS系统
          </a>
          <a
            href="/four-way-integration-test"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            🔗 四方集成测试
          </a>
          <a
            href="/integration-test"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            🧪 三方集成测试
          </a>
        </div>
      </div>
    </div>
  );
}
