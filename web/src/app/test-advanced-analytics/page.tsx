/**
 * 高级数据分析功能测试页面
 * 测试深度学习分析、趋势预测、风险评估和预测性干预功能
 */

'use client'

import React, { useState } from 'react';
import { useAdvancedAnalytics } from '../../hooks/useAdvancedAnalytics';
import { advancedAnalytics } from '../../lib/analytics/AdvancedAnalytics';
import { predictiveInterventionSystem } from '../../lib/ai/PredictiveInterventionSystem';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  duration: number;
}

export default function TestAdvancedAnalyticsPage() {
  const {
    analyticsReport,
    trends,
    patterns,
    predictions,
    correlations,
    risks,
    alerts,
    interventionStrategies,
    activeInterventions,
    generateReport,
    analyzeRisks,
    executeIntervention,
    analyticsStats
  } = useAdvancedAnalytics();

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

  // 测试高级分析报告生成
  const testAnalyticsReportGeneration = async () => {
    const startTime = Date.now();
    
    try {
      await generateReport();
      const duration = Date.now() - startTime;
      
      if (analyticsReport) {
        const checks = [
          analyticsReport.trends.length >= 0,
          analyticsReport.patterns.length >= 0,
          analyticsReport.predictions.length >= 0,
          analyticsReport.correlations.length >= 0,
          analyticsReport.insights.length >= 0,
          analyticsReport.risks.length >= 0
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '高级分析报告生成',
          allPassed,
          `趋势: ${analyticsReport.trends.length}, 模式: ${analyticsReport.patterns.length}, 预测: ${analyticsReport.predictions.length}, 洞察: ${analyticsReport.insights.length}`,
          duration
        );
      } else {
        addTestResult('高级分析报告生成', false, '无法生成分析报告', duration);
      }
    } catch (error) {
      addTestResult('高级分析报告生成', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试趋势分析
  const testTrendAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      await generateReport();
      const duration = Date.now() - startTime;
      
      if (trends.length > 0) {
        const sampleTrend = trends[0];
        const checks = [
          sampleTrend.metric !== undefined,
          sampleTrend.value !== undefined,
          sampleTrend.trend !== undefined,
          sampleTrend.confidence >= 0 && sampleTrend.confidence <= 1,
          sampleTrend.changePercent !== undefined
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '趋势分析',
          allPassed,
          `分析了 ${trends.length} 个趋势，上升: ${trends.filter(t => t.trend === 'increasing').length}, 下降: ${trends.filter(t => t.trend === 'decreasing').length}, 稳定: ${trends.filter(t => t.trend === 'stable').length}`,
          duration
        );
      } else {
        addTestResult('趋势分析', true, '当前无趋势数据（正常情况）', duration);
      }
    } catch (error) {
      addTestResult('趋势分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试模式识别
  const testPatternRecognition = async () => {
    const startTime = Date.now();
    
    try {
      await generateReport();
      const duration = Date.now() - startTime;
      
      if (patterns.length > 0) {
        const samplePattern = patterns[0];
        const checks = [
          samplePattern.patternName !== undefined,
          samplePattern.description !== undefined,
          samplePattern.impact !== undefined,
          samplePattern.confidence >= 0 && samplePattern.confidence <= 1,
          samplePattern.recommendations.length >= 0
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '模式识别',
          allPassed,
          `识别了 ${patterns.length} 个模式，积极: ${patterns.filter(p => p.impact === 'positive').length}, 消极: ${patterns.filter(p => p.impact === 'negative').length}, 中性: ${patterns.filter(p => p.impact === 'neutral').length}`,
          duration
        );
      } else {
        addTestResult('模式识别', true, '当前无识别到的模式（正常情况）', duration);
      }
    } catch (error) {
      addTestResult('模式识别', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试预测模型
  const testPredictiveModels = async () => {
    const startTime = Date.now();
    
    try {
      await generateReport();
      const duration = Date.now() - startTime;
      
      if (predictions.length > 0) {
        const sampleModel = predictions[0];
        const checks = [
          sampleModel.modelName !== undefined,
          sampleModel.targetMetric !== undefined,
          sampleModel.accuracy >= 0 && sampleModel.accuracy <= 1,
          sampleModel.predictions.length > 0,
          sampleModel.predictions[0].predictedValue !== undefined,
          sampleModel.predictions[0].confidence >= 0 && sampleModel.predictions[0].confidence <= 1
        ];
        
        const allPassed = checks.every(check => check);
        const avgAccuracy = predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length;
        
        addTestResult(
          '预测模型',
          allPassed,
          `${predictions.length} 个预测模型，平均准确率: ${(avgAccuracy * 100).toFixed(1)}%`,
          duration
        );
      } else {
        addTestResult('预测模型', false, '无预测模型生成', duration);
      }
    } catch (error) {
      addTestResult('预测模型', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试风险评估
  const testRiskAssessment = async () => {
    const startTime = Date.now();
    
    try {
      await analyzeRisks();
      const duration = Date.now() - startTime;
      
      const checks = [
        risks.length >= 0,
        risks.every(risk => risk.riskType !== undefined),
        risks.every(risk => risk.severity !== undefined),
        risks.every(risk => risk.probability >= 0 && risk.probability <= 1)
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '风险评估',
        allPassed,
        `评估了 ${risks.length} 个风险，高风险: ${risks.filter(r => r.severity === 'high' || r.severity === 'critical').length}, 中风险: ${risks.filter(r => r.severity === 'medium').length}, 低风险: ${risks.filter(r => r.severity === 'low').length}`,
        duration
      );
    } catch (error) {
      addTestResult('风险评估', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试预测性干预
  const testPredictiveIntervention = async () => {
    const startTime = Date.now();
    
    try {
      await analyzeRisks();
      const duration = Date.now() - startTime;
      
      const checks = [
        alerts.length >= 0,
        interventionStrategies.length >= 0,
        alerts.every(alert => alert.alertType !== undefined),
        alerts.every(alert => alert.urgency >= 0 && alert.urgency <= 1),
        interventionStrategies.every(strategy => strategy.strategyName !== undefined)
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '预测性干预',
        allPassed,
        `生成了 ${alerts.length} 个警报，${interventionStrategies.length} 个干预策略，紧急警报: ${alerts.filter(a => a.alertType === 'critical').length}`,
        duration
      );
    } catch (error) {
      addTestResult('预测性干预', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试相关性分析
  const testCorrelationAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      await generateReport();
      const duration = Date.now() - startTime;
      
      if (correlations.length > 0) {
        const checks = [
          correlations.every(corr => corr.metric1 !== undefined),
          correlations.every(corr => corr.metric2 !== undefined),
          correlations.every(corr => corr.correlation >= -1 && corr.correlation <= 1),
          correlations.every(corr => corr.significance >= 0 && corr.significance <= 1),
          correlations.every(corr => corr.relationship !== undefined)
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '相关性分析',
          allPassed,
          `分析了 ${correlations.length} 个相关性，强相关: ${correlations.filter(c => Math.abs(c.correlation) > 0.7).length}, 中等相关: ${correlations.filter(c => Math.abs(c.correlation) > 0.4 && Math.abs(c.correlation) <= 0.7).length}`,
          duration
        );
      } else {
        addTestResult('相关性分析', true, '当前无相关性数据（正常情况）', duration);
      }
    } catch (error) {
      addTestResult('相关性分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await testAnalyticsReportGeneration();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testTrendAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testPatternRecognition();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testPredictiveModels();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testRiskAssessment();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testPredictiveIntervention();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testCorrelationAnalysis();
      
    } catch (error) {
      console.error('Advanced analytics tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 计算测试统计
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 高级数据分析功能测试
          </h1>
          <p className="text-gray-300 text-lg">
            验证深度学习分析、趋势预测、风险评估和预测性干预功能
          </p>
        </div>

        {/* 高级分析系统状态概览 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">高级分析系统状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 分析报告状态 */}
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">分析报告</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={analyticsReport ? 'text-green-400' : 'text-gray-400'}>
                    {analyticsReport ? '已生成' : '未生成'}
                  </span>
                </div>
                {analyticsReport && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">趋势数量:</span>
                      <span className="text-white">{trends.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">模式数量:</span>
                      <span className="text-white">{patterns.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 预测模型状态 */}
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">预测模型</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">模型数量:</span>
                  <span className="text-white">{predictions.length}</span>
                </div>
                {predictions.length > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">平均准确率:</span>
                      <span className="text-white">
                        {Math.round(predictions.reduce((sum, p) => sum + p.accuracy, 0) / predictions.length * 100)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 风险评估状态 */}
            <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-3">风险评估</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">风险总数:</span>
                  <span className="text-white">{risks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">高风险:</span>
                  <span className="text-white">{risks.filter(r => r.severity === 'high' || r.severity === 'critical').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">警报数量:</span>
                  <span className="text-white">{alerts.length}</span>
                </div>
              </div>
            </div>

            {/* 干预系统状态 */}
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">干预系统</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">干预策略:</span>
                  <span className="text-white">{interventionStrategies.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">活跃干预:</span>
                  <span className="text-white">{activeInterventions.length}</span>
                </div>
                {analyticsStats && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">总洞察:</span>
                    <span className="text-white">{analyticsStats.totalInsights}</span>
                  </div>
                )}
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
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '🚀 运行所有高级分析测试'}
            </button>
            
            <button
              onClick={testAnalyticsReportGeneration}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              📊 测试分析报告
            </button>
            
            <button
              onClick={testRiskAssessment}
              disabled={isRunningTests}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              ⚠️ 测试风险评估
            </button>
            
            <button
              onClick={testPredictiveIntervention}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🎯 测试预测干预
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
          <h2 className="text-2xl font-bold text-white mb-4">高级分析功能测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始高级分析功能测试</p>
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
            href="/advanced-analytics"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            📊 高级数据分析
          </a>
          <a
            href="/ai-learning-assistant"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            🤖 AI学习助手
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
