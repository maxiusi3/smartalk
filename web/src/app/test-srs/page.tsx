/**
 * SRS 测试页面
 * 用于测试和验证SRS功能的完整性
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useSRS, useSRSStatistics } from '../../hooks/useSRS';
import { srsService, SRSCard, SRSAssessment } from '../../lib/services/SRSService';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export default function TestSRSPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SRSCard | null>(null);
  const [testWords] = useState([
    { word: 'hello', translation: '你好', audioUrl: '/audio/hello.mp3' },
    { word: 'world', translation: '世界', audioUrl: '/audio/world.mp3' },
    { word: 'learning', translation: '学习', audioUrl: '/audio/learning.mp3' },
    { word: 'memory', translation: '记忆', audioUrl: '/audio/memory.mp3' },
    { word: 'review', translation: '复习', audioUrl: '/audio/review.mp3' }
  ]);

  const {
    dueCards,
    newCards,
    allCards,
    currentSession,
    isSessionActive,
    statistics,
    addCard,
    reviewCard,
    startSession,
    endSession,
    isLoading,
    error
  } = useSRS();

  const { statistics: realtimeStats } = useSRSStatistics();

  // 添加测试结果
  const addTestResult = (testName: string, passed: boolean, details: string) => {
    const result: TestResult = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    setTestResults(prev => [...prev, result]);
  };

  // 运行基础功能测试
  const runBasicTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      // 测试1: 服务初始化
      const service = srsService;
      addTestResult(
        'SRS服务初始化',
        service !== null,
        `服务实例: ${service ? '创建成功' : '创建失败'}`
      );

      // 测试2: 添加卡片
      const testCard = await addCard(
        'test_word_' + Date.now(),
        'test',
        '测试',
        '/audio/test.mp3',
        { difficulty: 3, interest: 'technology' }
      );
      addTestResult(
        '添加SRS卡片',
        testCard && testCard.id,
        `卡片ID: ${testCard?.id}, 单词: ${testCard?.word}, 难度因子: ${testCard?.easeFactor}`
      );

      // 测试3: 获取统计数据
      const stats = srsService.getSRSStatistics();
      addTestResult(
        '获取统计数据',
        stats && typeof stats.totalCards === 'number',
        `总卡片: ${stats.totalCards}, 新卡片: ${stats.newCards}, 今日复习: ${stats.todayReviews}`
      );

      // 测试4: SuperMemo 2算法测试
      if (testCard) {
        const reviewedCard = await reviewCard(testCard.id, 'good', 2000);
        addTestResult(
          'SuperMemo 2算法测试',
          reviewedCard.repetitions === 1 && reviewedCard.interval > 0,
          `复习后: 重复次数=${reviewedCard.repetitions}, 间隔=${reviewedCard.interval}天, 难度因子=${reviewedCard.easeFactor.toFixed(2)}`
        );
      }

    } catch (error) {
      addTestResult(
        '基础测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 运行算法测试
  const runAlgorithmTests = async () => {
    setIsRunningTests(true);

    try {
      // 创建测试卡片
      const testCard = await addCard(
        'algorithm_test_' + Date.now(),
        'algorithm',
        '算法',
        '/audio/algorithm.mp3'
      );

      if (!testCard) {
        addTestResult('算法测试', false, '无法创建测试卡片');
        return;
      }

      // 测试不同评估结果的算法行为
      const assessments: SRSAssessment[] = ['forgot', 'hard', 'good', 'easy', 'perfect'];
      
      for (const assessment of assessments) {
        const beforeReview = { ...testCard };
        const afterReview = await reviewCard(testCard.id, assessment, 1500);
        
        addTestResult(
          `算法测试 - ${assessment}`,
          afterReview.id === testCard.id,
          `评估: ${assessment} | 间隔: ${beforeReview.interval}→${afterReview.interval}天 | 难度因子: ${beforeReview.easeFactor.toFixed(2)}→${afterReview.easeFactor.toFixed(2)} | 重复: ${beforeReview.repetitions}→${afterReview.repetitions}`
        );
      }

    } catch (error) {
      addTestResult(
        '算法测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 运行会话测试
  const runSessionTests = async () => {
    setIsRunningTests(true);

    try {
      // 测试开始会话
      const sessionId = await startSession('practice', { targetCards: 5, maxDuration: 10 });
      addTestResult(
        '开始复习会话',
        sessionId && sessionId.length > 0,
        `会话ID: ${sessionId}, 当前会话: ${currentSession ? '已创建' : '未创建'}`
      );

      // 等待一秒
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 测试结束会话
      const completedSession = await endSession();
      addTestResult(
        '结束复习会话',
        completedSession !== null,
        `会话结果: ${completedSession ? `复习${completedSession.cardsReviewed}张卡片, 准确率${completedSession.accuracyRate.toFixed(1)}%` : '无会话数据'}`
      );

    } catch (error) {
      addTestResult(
        '会话测试执行错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 批量添加测试卡片
  const addTestCards = async () => {
    setIsRunningTests(true);
    let successCount = 0;

    try {
      for (const testWord of testWords) {
        try {
          await addCard(
            testWord.word + '_' + Date.now(),
            testWord.word,
            testWord.translation,
            testWord.audioUrl,
            { difficulty: Math.floor(Math.random() * 3) + 2, interest: 'general' }
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to add card for ${testWord.word}:`, error);
        }
      }

      addTestResult(
        '批量添加测试卡片',
        successCount === testWords.length,
        `成功添加 ${successCount}/${testWords.length} 张卡片`
      );

    } catch (error) {
      addTestResult(
        '批量添加卡片错误',
        false,
        `错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      setIsRunningTests(false);
    }
  };

  // 模拟复习卡片
  const simulateReview = async (card: SRSCard, assessment: SRSAssessment) => {
    try {
      const responseTime = Math.floor(Math.random() * 3000) + 1000; // 1-4秒
      await reviewCard(card.id, assessment, responseTime);
      addTestResult(
        '模拟复习',
        true,
        `复习卡片 "${card.word}" - 评估: ${assessment}, 响应时间: ${responseTime}ms`
      );
    } catch (error) {
      addTestResult(
        '模拟复习失败',
        false,
        `复习卡片 "${card.word}" 失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  };

  // 计算测试通过率
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧠 SRS 间隔重复系统测试
          </h1>
          <p className="text-gray-300 text-lg">
            测试SuperMemo 2算法和复习调度功能
          </p>
        </div>

        {/* 当前状态显示 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">系统状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📚</div>
                <div className="font-semibold text-white">总卡片</div>
                <div className="text-sm text-gray-300">
                  {statistics?.totalCards || 0}张
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-400 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🆕</div>
                <div className="font-semibold text-white">新卡片</div>
                <div className="text-sm text-gray-300">
                  {statistics?.newCards || 0}张
                </div>
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-white">今日复习</div>
                <div className="text-sm text-gray-300">
                  {statistics?.todayReviews || 0}张
                </div>
              </div>
            </div>

            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-semibold text-white">准确率</div>
                <div className="text-sm text-gray-300">
                  {statistics?.overallAccuracy || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* 会话状态 */}
          {isSessionActive && currentSession && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-green-800 font-semibold mb-2">当前复习会话</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-green-600">类型:</span>
                  <span className="text-green-800 ml-1">{currentSession.sessionType}</span>
                </div>
                <div>
                  <span className="text-green-600">已复习:</span>
                  <span className="text-green-800 ml-1">{currentSession.cardsReviewed}张</span>
                </div>
                <div>
                  <span className="text-green-600">准确率:</span>
                  <span className="text-green-800 ml-1">{currentSession.accuracyRate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-green-600">完成率:</span>
                  <span className="text-green-800 ml-1">{currentSession.completionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runBasicTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '基础功能测试'}
            </button>
            
            <button
              onClick={runAlgorithmTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              算法测试
            </button>
            
            <button
              onClick={runSessionTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              会话测试
            </button>
            
            <button
              onClick={addTestCards}
              disabled={isRunningTests}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              添加测试卡片
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              清除结果
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

        {/* 卡片列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 到期卡片 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">到期卡片 ({dueCards.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dueCards.map((card) => (
                <div key={card.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{card.word}</div>
                      <div className="text-sm text-gray-300">{card.translation}</div>
                      <div className="text-xs text-gray-400">
                        间隔: {card.interval}天 | 难度: {card.easeFactor.toFixed(2)} | 重复: {card.repetitions}次
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => simulateReview(card, 'forgot')}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        忘记
                      </button>
                      <button
                        onClick={() => simulateReview(card, 'good')}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        良好
                      </button>
                      <button
                        onClick={() => simulateReview(card, 'easy')}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                      >
                        简单
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {dueCards.length === 0 && (
                <p className="text-gray-400 text-center py-4">暂无到期卡片</p>
              )}
            </div>
          </div>

          {/* 新卡片 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">新卡片 ({newCards.length})</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {newCards.map((card) => (
                <div key={card.id} className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{card.word}</div>
                      <div className="text-sm text-gray-300">{card.translation}</div>
                      <div className="text-xs text-gray-400">
                        创建时间: {new Date(card.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => simulateReview(card, 'hard')}
                        className="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                      >
                        困难
                      </button>
                      <button
                        onClick={() => simulateReview(card, 'good')}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        良好
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {newCards.length === 0 && (
                <p className="text-gray-400 text-center py-4">暂无新卡片</p>
              )}
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始测试</p>
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
                    <span className="text-xs text-gray-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
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
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            返回 vTPR 训练
          </a>
          <a
            href="/integration-test"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            集成测试
          </a>
        </div>
      </div>
    </div>
  );
}
