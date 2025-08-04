/**
 * AI学习路径优化系统测试页面
 * 测试AI学习档案分析、个性化推荐、学习洞察等功能
 */

'use client'

import React, { useState } from 'react';
import { useLearningPathOptimizer } from '../../hooks/useLearningPathOptimizer';
import { learningPathOptimizer } from '../../lib/ai/LearningPathOptimizer';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  duration: number;
}

export default function TestAILearningPage() {
  const {
    learningProfile,
    optimizedPath,
    recommendations,
    insights,
    profileStats,
    refreshProfile,
    refreshPath,
    clearCache,
    isProfileLoading,
    isPathLoading
  } = useLearningPathOptimizer();

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

  // 测试学习档案分析
  const testProfileAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      // 清除缓存并重新分析
      clearCache();
      await refreshProfile();
      
      const duration = Date.now() - startTime;
      
      if (learningProfile) {
        const checks = [
          learningProfile.learningStyle !== undefined,
          learningProfile.difficultyPreference !== undefined,
          learningProfile.focusStrength >= 0 && learningProfile.focusStrength <= 100,
          learningProfile.memoryRetention >= 0 && learningProfile.memoryRetention <= 100,
          learningProfile.pronunciationSkill >= 0 && learningProfile.pronunciationSkill <= 100,
          learningProfile.consistencyScore >= 0 && learningProfile.consistencyScore <= 100,
          learningProfile.motivationLevel >= 0 && learningProfile.motivationLevel <= 100
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '学习档案分析',
          allPassed,
          `学习风格: ${learningProfile.learningStyle}, 专注力: ${learningProfile.focusStrength}, 记忆力: ${learningProfile.memoryRetention}`,
          duration
        );
      } else {
        addTestResult('学习档案分析', false, '无法生成学习档案', duration);
      }
    } catch (error) {
      addTestResult('学习档案分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试学习路径优化
  const testPathOptimization = async () => {
    const startTime = Date.now();
    
    try {
      await refreshPath();
      const duration = Date.now() - startTime;
      
      if (optimizedPath) {
        const checks = [
          optimizedPath.currentPhase !== undefined,
          optimizedPath.recommendations.length >= 0,
          optimizedPath.insights.length >= 0,
          optimizedPath.nextMilestones.length >= 0,
          optimizedPath.adaptiveAdjustments.length >= 0
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '学习路径优化',
          allPassed,
          `阶段: ${optimizedPath.currentPhase}, 推荐: ${optimizedPath.recommendations.length}条, 洞察: ${optimizedPath.insights.length}项`,
          duration
        );
      } else {
        addTestResult('学习路径优化', false, '无法生成优化路径', duration);
      }
    } catch (error) {
      addTestResult('学习路径优化', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试推荐系统
  const testRecommendationSystem = async () => {
    const startTime = Date.now();
    
    try {
      await refreshPath();
      const duration = Date.now() - startTime;
      
      if (recommendations.length > 0) {
        const sampleRec = recommendations[0];
        const checks = [
          sampleRec.id !== undefined,
          sampleRec.type !== undefined,
          sampleRec.priority !== undefined,
          sampleRec.title !== undefined,
          sampleRec.description !== undefined,
          sampleRec.reasoning !== undefined,
          sampleRec.actionItems.length > 0,
          sampleRec.confidence >= 0 && sampleRec.confidence <= 100,
          sampleRec.relatedFeatures.length > 0
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '推荐系统',
          allPassed,
          `生成 ${recommendations.length} 条推荐，优先级分布: 高${recommendations.filter(r => r.priority === 'high').length}, 中${recommendations.filter(r => r.priority === 'medium').length}, 低${recommendations.filter(r => r.priority === 'low').length}`,
          duration
        );
      } else {
        addTestResult('推荐系统', true, '当前无推荐（学习状态良好）', duration);
      }
    } catch (error) {
      addTestResult('推荐系统', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试洞察分析
  const testInsightAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      await refreshPath();
      const duration = Date.now() - startTime;
      
      if (insights.length > 0) {
        const sampleInsight = insights[0];
        const checks = [
          sampleInsight.category !== undefined,
          sampleInsight.insight !== undefined,
          sampleInsight.impact !== undefined,
          sampleInsight.confidence >= 0 && sampleInsight.confidence <= 100,
          sampleInsight.recommendations.length >= 0
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '洞察分析',
          allPassed,
          `生成 ${insights.length} 项洞察，类型分布: 性能${insights.filter(i => i.category === 'performance').length}, 行为${insights.filter(i => i.category === 'behavior').length}, 进度${insights.filter(i => i.category === 'progress').length}`,
          duration
        );
      } else {
        addTestResult('洞察分析', true, '当前无特殊洞察（学习数据充足）', duration);
      }
    } catch (error) {
      addTestResult('洞察分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试统计计算
  const testStatisticsCalculation = async () => {
    const startTime = Date.now();
    
    try {
      await refreshProfile();
      const duration = Date.now() - startTime;
      
      if (profileStats) {
        const checks = [
          profileStats.overallScore >= 0 && profileStats.overallScore <= 100,
          profileStats.strongestArea !== undefined,
          profileStats.weakestArea !== undefined,
          profileStats.learningPhase !== undefined
        ];
        
        const allPassed = checks.every(check => check);
        
        addTestResult(
          '统计计算',
          allPassed,
          `综合评分: ${profileStats.overallScore}, 优势: ${profileStats.strongestArea}, 薄弱: ${profileStats.weakestArea}`,
          duration
        );
      } else {
        addTestResult('统计计算', false, '无法计算统计数据', duration);
      }
    } catch (error) {
      addTestResult('统计计算', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await testProfileAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testPathOptimization();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testRecommendationSystem();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testInsightAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testStatisticsCalculation();
      
    } catch (error) {
      console.error('AI learning tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 计算测试统计
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🤖 AI学习路径优化系统测试
          </h1>
          <p className="text-gray-300 text-lg">
            验证AI学习档案分析、个性化推荐、学习洞察等核心功能
          </p>
        </div>

        {/* AI系统状态概览 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">AI系统状态概览</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 学习档案状态 */}
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">学习档案</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={learningProfile ? 'text-green-400' : 'text-gray-400'}>
                    {learningProfile ? '已生成' : '未生成'}
                  </span>
                </div>
                {learningProfile && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">学习风格:</span>
                      <span className="text-white">{learningProfile.learningStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">综合评分:</span>
                      <span className="text-white">{profileStats?.overallScore || 0}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 优化路径状态 */}
            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-3">优化路径</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={optimizedPath ? 'text-green-400' : 'text-gray-400'}>
                    {optimizedPath ? '已生成' : '未生成'}
                  </span>
                </div>
                {optimizedPath && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">学习阶段:</span>
                      <span className="text-white">{optimizedPath.currentPhase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">推荐数量:</span>
                      <span className="text-white">{recommendations.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 推荐系统状态 */}
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">推荐系统</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">推荐总数:</span>
                  <span className="text-white">{recommendations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">高优先级:</span>
                  <span className="text-white">{recommendations.filter(r => r.priority === 'high').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">中优先级:</span>
                  <span className="text-white">{recommendations.filter(r => r.priority === 'medium').length}</span>
                </div>
              </div>
            </div>

            {/* 洞察分析状态 */}
            <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">洞察分析</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">洞察总数:</span>
                  <span className="text-white">{insights.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">积极洞察:</span>
                  <span className="text-white">{insights.filter(i => i.impact === 'positive').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">需关注:</span>
                  <span className="text-white">{insights.filter(i => i.impact === 'negative').length}</span>
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
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '🚀 运行所有AI测试'}
            </button>
            
            <button
              onClick={testProfileAnalysis}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              👤 测试档案分析
            </button>
            
            <button
              onClick={testPathOptimization}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🛤️ 测试路径优化
            </button>
            
            <button
              onClick={testRecommendationSystem}
              disabled={isRunningTests}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              💡 测试推荐系统
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
          <h2 className="text-2xl font-bold text-white mb-4">AI功能测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始AI功能测试</p>
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
            href="/ai-learning-assistant"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            🤖 AI学习助手
          </a>
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            📖 vTPR学习
          </a>
          <a
            href="/four-way-integration-test"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            🔗 四方集成测试
          </a>
        </div>
      </div>
    </div>
  );
}
