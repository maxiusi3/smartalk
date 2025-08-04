/**
 * 系统优化功能测试页面
 * 测试性能监控、用户体验优化和系统健康管理功能
 */

'use client'

import React, { useState } from 'react';
import { useSystemOptimization } from '../../hooks/useSystemOptimization';
import { performanceOptimizer } from '../../lib/performance/PerformanceOptimizer';
import { userExperienceOptimizer } from '../../lib/ux/UserExperienceOptimizer';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  duration: number;
}

export default function TestSystemOptimizationPage() {
  const {
    systemHealth,
    performanceMetrics,
    performanceReport,
    uxMetrics,
    uxReport,
    optimizationAlerts,
    isPerformanceMonitoring,
    isUXTracking,
    startMonitoring,
    stopMonitoring,
    generatePerformanceReport,
    generateUXReport,
    recordVideoLoadTime,
    recordPronunciationApiTime,
    recordUserInteraction,
    optimizationStats
  } = useSystemOptimization();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // 添加测试结果
  const addTestResult = (testName: string, passed: boolean, details: string, duration: number) => {
    const result: TestResult = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
      duration
    };
    setTestResults(prev => [...prev, result]);
  };

  // 测试性能监控功能
  const testPerformanceMonitoring = async () => {
    const startTime = Date.now();
    
    try {
      // 启动性能监控
      startMonitoring();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 生成性能报告
      await generatePerformanceReport();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        isPerformanceMonitoring === true,
        performanceMetrics !== null,
        performanceReport !== null,
        performanceReport?.overallScore !== undefined,
        performanceReport?.suggestions !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '性能监控功能',
        allPassed,
        `监控状态: ${isPerformanceMonitoring ? '运行中' : '已停止'}, 性能评分: ${performanceReport?.overallScore || 0}, 建议数量: ${performanceReport?.suggestions.length || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('性能监控功能', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试用户体验跟踪
  const testUXTracking = async () => {
    const startTime = Date.now();
    
    try {
      // 模拟用户交互
      recordUserInteraction({
        type: 'click',
        element: 'test_button',
        success: true,
        context: {
          page: 'test',
          feature: 'testing',
          userState: 'exploring'
        }
      });
      
      recordUserInteraction({
        type: 'input',
        element: 'test_input',
        success: true,
        context: {
          page: 'test',
          feature: 'testing',
          userState: 'exploring'
        }
      });
      
      // 生成UX报告
      await generateUXReport();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        isUXTracking === true,
        uxReport !== null,
        uxReport?.overallUXScore !== undefined,
        uxReport?.suggestions !== undefined,
        uxReport?.behaviorInsights !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '用户体验跟踪',
        allPassed,
        `跟踪状态: ${isUXTracking ? '运行中' : '已停止'}, UX评分: ${uxReport?.overallUXScore || 0}, 建议数量: ${uxReport?.suggestions.length || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('用户体验跟踪', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试系统健康评估
  const testSystemHealthAssessment = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有性能和UX数据
      await generatePerformanceReport();
      await generateUXReport();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        systemHealth !== null,
        systemHealth?.overall !== undefined,
        systemHealth?.performance !== undefined,
        systemHealth?.userExperience !== undefined,
        systemHealth?.stability !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '系统健康评估',
        allPassed,
        `整体状态: ${systemHealth?.overall || 'unknown'}, 性能: ${systemHealth?.performance || 0}, 体验: ${systemHealth?.userExperience || 0}, 稳定性: ${systemHealth?.stability || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('系统健康评估', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试优化警报系统
  const testOptimizationAlerts = async () => {
    const startTime = Date.now();
    
    try {
      // 生成报告以触发警报
      await generatePerformanceReport();
      await generateUXReport();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        optimizationAlerts !== undefined,
        Array.isArray(optimizationAlerts),
        optimizationStats !== null,
        optimizationStats?.totalSuggestions !== undefined,
        optimizationStats?.criticalIssues !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '优化警报系统',
        allPassed,
        `警报数量: ${optimizationAlerts.length}, 总建议: ${optimizationStats?.totalSuggestions || 0}, 紧急问题: ${optimizationStats?.criticalIssues || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('优化警报系统', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试性能数据记录
  const testPerformanceDataRecording = async () => {
    const startTime = Date.now();
    
    try {
      // 记录模拟的性能数据
      recordVideoLoadTime(800);
      recordVideoLoadTime(1200);
      recordVideoLoadTime(600);
      
      recordPronunciationApiTime(1000);
      recordPronunciationApiTime(1500);
      recordPronunciationApiTime(800);
      
      // 生成报告以验证数据记录
      await generatePerformanceReport();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        performanceMetrics?.videoLoadTime !== undefined,
        performanceMetrics?.pronunciationApiResponseTime !== undefined,
        performanceMetrics?.videoLoadTime > 0,
        performanceMetrics?.pronunciationApiResponseTime > 0
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '性能数据记录',
        allPassed,
        `视频加载时间: ${performanceMetrics?.videoLoadTime.toFixed(0) || 0}ms, API响应时间: ${performanceMetrics?.pronunciationApiResponseTime.toFixed(0) || 0}ms`,
        duration
      );
    } catch (error) {
      addTestResult('性能数据记录', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试监控控制
  const testMonitoringControl = async () => {
    const startTime = Date.now();
    
    try {
      // 测试停止监控
      stopMonitoring();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stoppedState = !isPerformanceMonitoring && !isUXTracking;
      
      // 测试启动监控
      startMonitoring();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const startedState = isPerformanceMonitoring && isUXTracking;
      
      const duration = Date.now() - startTime;
      
      const checks = [
        stoppedState === true,
        startedState === true
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '监控控制',
        allPassed,
        `停止测试: ${stoppedState ? '成功' : '失败'}, 启动测试: ${startedState ? '成功' : '失败'}`,
        duration
      );
    } catch (error) {
      addTestResult('监控控制', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await testPerformanceMonitoring();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testUXTracking();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testSystemHealthAssessment();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testOptimizationAlerts();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testPerformanceDataRecording();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testMonitoringControl();
      
    } catch (error) {
      console.error('System optimization tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 计算测试统计
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚡ 系统优化功能测试
          </h1>
          <p className="text-gray-300 text-lg">
            验证性能监控、用户体验优化和系统健康管理功能
          </p>
        </div>

        {/* 系统优化状态概览 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">系统优化状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 系统健康状态 */}
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">系统健康</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">整体状态:</span>
                  <span className={systemHealth ? 'text-green-400' : 'text-gray-400'}>
                    {systemHealth?.overall || '未知'}
                  </span>
                </div>
                {systemHealth && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">性能评分:</span>
                      <span className="text-white">{systemHealth.performance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">体验评分:</span>
                      <span className="text-white">{systemHealth.userExperience}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 性能监控状态 */}
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">性能监控</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">监控状态:</span>
                  <span className={isPerformanceMonitoring ? 'text-green-400' : 'text-gray-400'}>
                    {isPerformanceMonitoring ? '运行中' : '已停止'}
                  </span>
                </div>
                {performanceReport && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">性能评分:</span>
                      <span className="text-white">{performanceReport.overallScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">优化建议:</span>
                      <span className="text-white">{performanceReport.suggestions.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 用户体验状态 */}
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">用户体验</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">跟踪状态:</span>
                  <span className={isUXTracking ? 'text-green-400' : 'text-gray-400'}>
                    {isUXTracking ? '跟踪中' : '已停止'}
                  </span>
                </div>
                {uxReport && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">UX评分:</span>
                      <span className="text-white">{uxReport.overallUXScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">UX建议:</span>
                      <span className="text-white">{uxReport.suggestions.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 优化警报状态 */}
            <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-3">优化警报</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">警报总数:</span>
                  <span className="text-white">{optimizationAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">紧急问题:</span>
                  <span className="text-white">{optimizationStats?.criticalIssues || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">总建议:</span>
                  <span className="text-white">{optimizationStats?.totalSuggestions || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '🚀 运行所有优化测试'}
            </button>
            
            <button
              onClick={testPerformanceMonitoring}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              ⚡ 测试性能监控
            </button>
            
            <button
              onClick={testUXTracking}
              disabled={isRunningTests}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              👥 测试UX跟踪
            </button>
            
            <button
              onClick={testSystemHealthAssessment}
              disabled={isRunningTests}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🏥 测试系统健康
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              🗑️ 清除结果
            </button>
          </div>

          {/* 测试统计 */}
          {totalTests > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">测试统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{totalTests}</div>
                  <div className="text-sm text-gray-300">总测试数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{passedTests}</div>
                  <div className="text-sm text-gray-300">通过测试</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${parseFloat(passRate) >= 90 ? 'text-green-400' : parseFloat(passRate) >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {passRate}%
                  </div>
                  <div className="text-sm text-gray-300">通过率</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">系统优化功能测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始系统优化功能测试</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.passed 
                      ? 'bg-green-900/20 border-green-400' 
                      : 'bg-red-900/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">
                      {result.passed ? '✅' : '❌'} {result.testName}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>⏱️ {result.duration}ms</span>
                      <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{result.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/system-optimization"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            ⚡ 系统优化中心
          </a>
          <a
            href="/advanced-analytics"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            📊 高级数据分析
          </a>
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            📖 返回学习
          </a>
        </div>
      </div>
    </div>
  );
}
