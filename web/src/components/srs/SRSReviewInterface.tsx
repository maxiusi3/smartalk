/**
 * SRSReviewInterface - SRS复习界面组件
 * 提供完整的卡片复习体验，包括显示、评估、进度管理
 */

'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useSRS } from '../../hooks/useSRS';
import { SRSCard, SRSAssessment } from '../../lib/services/SRSService';
import { animationSystem } from '../../lib/utils/AnimationSystem';
import { accessibilityHelper } from '../../lib/utils/AccessibilityHelper';

interface SRSReviewInterfaceProps {
  onComplete?: (session: any) => void;
  onClose?: () => void;
  className?: string;
}

type ReviewPhase = 'setup' | 'question' | 'answer' | 'assessment' | 'completed';

export default function SRSReviewInterface({
  onComplete,
  onClose,
  className = ''
}: SRSReviewInterfaceProps) {
  const {
    dueCards,
    newCards,
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    reviewCard,
    isLoading,
    error
  } = useSRS();

  const [reviewPhase, setReviewPhase] = useState<ReviewPhase>('setup');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reviewQueue, setReviewQueue] = useState<SRSCard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionConfig, setSessionConfig] = useState({
    targetCards: 20,
    maxDuration: 30,
    includeNew: true,
    includeReview: true
  });
  const [startTime, setStartTime] = useState<number>(0);
  const [responseStartTime, setResponseStartTime] = useState<number>(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 初始化复习队列
  useEffect(() => {
    if (reviewPhase === 'setup') {
      const queue: SRSCard[] = [];
      
      if (sessionConfig.includeReview) {
        queue.push(...dueCards.slice(0, Math.floor(sessionConfig.targetCards * 0.7)));
      }
      
      if (sessionConfig.includeNew) {
        const remainingSlots = sessionConfig.targetCards - queue.length;
        queue.push(...newCards.slice(0, remainingSlots));
      }
      
      // 随机打乱队列
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
      
      setReviewQueue(queue);
    }
  }, [dueCards, newCards, sessionConfig, reviewPhase]);

  // 开始复习会话
  const handleStartReview = async () => {
    try {
      if (reviewQueue.length === 0) {
        alert('没有可复习的卡片');
        return;
      }

      await startSession('daily', {
        targetCards: sessionConfig.targetCards,
        maxDuration: sessionConfig.maxDuration
      });

      setReviewPhase('question');
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setStartTime(Date.now());
      setResponseStartTime(Date.now());

      // 无障碍访问公告
      accessibilityHelper.announce('复习会话开始，请准备回忆第一张卡片', 'assertive');
      
    } catch (error) {
      console.error('Failed to start review session:', error);
      alert('开始复习失败，请重试');
    }
  };

  // 显示答案
  const handleShowAnswer = () => {
    setShowAnswer(true);
    setReviewPhase('answer');
    
    // 播放音频
    if (audioRef.current && currentCard?.audioUrl) {
      audioRef.current.play().catch(console.error);
    }

    // 动画效果
    if (cardRef.current) {
      animationSystem.animateFocusModeHighlight(cardRef.current);
    }

    // 无障碍访问公告
    accessibilityHelper.announce(`答案是：${currentCard?.translation}`, 'assertive');
  };

  // 评估卡片
  const handleAssessment = async (assessment: SRSAssessment) => {
    if (!currentCard) return;

    try {
      const responseTime = Date.now() - responseStartTime;
      
      // 记录复习结果
      await reviewCard(currentCard.id, assessment, responseTime, {
        difficulty: getDifficultyFromAssessment(assessment),
        confidence: getConfidenceFromAssessment(assessment)
      });

      // 动画效果
      if (cardRef.current) {
        if (assessment === 'forgot') {
          animationSystem.animatePronunciationFailure(cardRef.current);
        } else {
          animationSystem.animatePronunciationSuccess(cardRef.current, getScoreFromAssessment(assessment));
        }
      }

      // 进入下一张卡片或完成复习
      setTimeout(() => {
        if (currentCardIndex < reviewQueue.length - 1) {
          setCurrentCardIndex(prev => prev + 1);
          setShowAnswer(false);
          setReviewPhase('question');
          setResponseStartTime(Date.now());
          
          // 无障碍访问公告
          accessibilityHelper.announce(`第${currentCardIndex + 2}张卡片`, 'polite');
        } else {
          handleCompleteReview();
        }
      }, 1500);

    } catch (error) {
      console.error('Failed to assess card:', error);
      alert('评估失败，请重试');
    }
  };

  // 完成复习
  const handleCompleteReview = async () => {
    try {
      const session = await endSession();
      setReviewPhase('completed');
      
      // 庆祝动画
      if (cardRef.current) {
        animationSystem.animateLearningCompletion(cardRef.current);
      }

      // 无障碍访问公告
      accessibilityHelper.announce('复习会话完成，恭喜你！', 'assertive');
      
      onComplete?.(session);
    } catch (error) {
      console.error('Failed to complete review:', error);
    }
  };

  // 暂停复习
  const handlePauseReview = () => {
    setReviewPhase('setup');
    accessibilityHelper.announce('复习已暂停', 'polite');
  };

  // 退出复习
  const handleExitReview = async () => {
    if (isSessionActive) {
      await endSession();
    }
    onClose?.();
  };

  // 辅助函数
  const getDifficultyFromAssessment = (assessment: SRSAssessment): number => {
    switch (assessment) {
      case 'forgot': return 5;
      case 'hard': return 4;
      case 'good': return 3;
      case 'easy': return 2;
      case 'perfect': return 1;
      default: return 3;
    }
  };

  const getConfidenceFromAssessment = (assessment: SRSAssessment): number => {
    switch (assessment) {
      case 'forgot': return 1;
      case 'hard': return 2;
      case 'good': return 3;
      case 'easy': return 4;
      case 'perfect': return 5;
      default: return 3;
    }
  };

  const getScoreFromAssessment = (assessment: SRSAssessment): number => {
    switch (assessment) {
      case 'forgot': return 0;
      case 'hard': return 60;
      case 'good': return 80;
      case 'easy': return 90;
      case 'perfect': return 100;
      default: return 70;
    }
  };

  const currentCard = reviewQueue[currentCardIndex];
  const progress = reviewQueue.length > 0 ? ((currentCardIndex + 1) / reviewQueue.length) * 100 : 0;
  const sessionDuration = startTime > 0 ? Math.floor((Date.now() - startTime) / 1000 / 60) : 0;

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载复习数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-xl ${className}`}>
      {/* 头部状态栏 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">🧠 SRS 复习模式</h2>
            {isSessionActive && (
              <div className="flex items-center space-x-2 text-sm">
                <span>📊 进度: {Math.round(progress)}%</span>
                <span>⏱️ 时长: {sessionDuration}分钟</span>
                <span>📚 {currentCardIndex + 1}/{reviewQueue.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {isSessionActive && (
              <button
                onClick={handlePauseReview}
                className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              >
                ⏸️ 暂停
              </button>
            )}
            <button
              onClick={handleExitReview}
              className="px-3 py-1 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm"
              aria-label="退出复习模式"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* 进度条 */}
        {isSessionActive && (
          <div className="mt-3">
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 主要内容区域 */}
      <div className="p-6">
        {/* 设置阶段 */}
        {reviewPhase === 'setup' && (
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">开始复习会话</h3>
              <p className="text-gray-600">
                准备复习 {reviewQueue.length} 张卡片
              </p>
            </div>

            {/* 会话配置 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">复习设置</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    目标卡片数量
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={sessionConfig.targetCards}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      targetCards: parseInt(e.target.value) || 20
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    最大时长（分钟）
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={sessionConfig.maxDuration}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      maxDuration: parseInt(e.target.value) || 30
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionConfig.includeReview}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      includeReview: e.target.checked
                    }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    包含复习卡片 ({dueCards.length}张)
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sessionConfig.includeNew}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      includeNew: e.target.checked
                    }))}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    包含新卡片 ({newCards.length}张)
                  </span>
                </label>
              </div>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={handleStartReview}
              disabled={reviewQueue.length === 0}
              className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors text-lg"
            >
              🚀 开始复习
            </button>
          </div>
        )}

        {/* 问题阶段 */}
        {reviewPhase === 'question' && currentCard && (
          <div className="text-center">
            <div ref={cardRef} className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                <span className="text-4xl">🤔</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {currentCard.word}
              </h3>
              <p className="text-gray-600 mb-6">
                请回忆这个单词的中文意思
              </p>
              
              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  💡 在心中默念答案，然后点击"显示答案"查看正确翻译
                </p>
              </div>
            </div>

            <button
              onClick={handleShowAnswer}
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              👁️ 显示答案
            </button>
          </div>
        )}

        {/* 答案阶段 */}
        {reviewPhase === 'answer' && currentCard && (
          <div className="text-center">
            <div ref={cardRef} className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <span className="text-4xl">💡</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {currentCard.word}
              </h3>
              <p className="text-2xl font-semibold text-green-600 mb-6">
                {currentCard.translation}
              </p>
              
              {/* 音频播放 */}
              {currentCard.audioUrl && (
                <div className="mb-6">
                  <audio
                    ref={audioRef}
                    src={currentCard.audioUrl}
                    className="hidden"
                  />
                  <button
                    onClick={() => audioRef.current?.play()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    🔊 播放发音
                  </button>
                </div>
              )}
              
              {/* 评估提示 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  🎯 请根据你的回忆情况选择合适的评估
                </p>
              </div>
            </div>

            {/* 评估按钮 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <button
                onClick={() => handleAssessment('forgot')}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                😵 忘记了
              </button>
              <button
                onClick={() => handleAssessment('hard')}
                className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                😰 困难
              </button>
              <button
                onClick={() => handleAssessment('good')}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                😊 良好
              </button>
              <button
                onClick={() => handleAssessment('easy')}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                😎 简单
              </button>
              <button
                onClick={() => handleAssessment('perfect')}
                className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                🤩 完美
              </button>
            </div>
          </div>
        )}

        {/* 完成阶段 */}
        {reviewPhase === 'completed' && (
          <div className="text-center">
            <div ref={cardRef} className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 rounded-full mb-6">
                <span className="text-4xl">🎉</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                复习完成！
              </h3>
              <p className="text-gray-600 mb-6">
                恭喜你完成了今天的复习任务
              </p>
              
              {/* 会话统计 */}
              {currentSession && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-4">复习统计</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {currentSession.cardsReviewed}
                      </div>
                      <div className="text-yellow-600">复习卡片</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {Math.round(currentSession.accuracyRate)}%
                      </div>
                      <div className="text-yellow-600">准确率</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {Math.round(currentSession.averageResponseTime / 1000)}s
                      </div>
                      <div className="text-yellow-600">平均响应</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-700">
                        {sessionDuration}
                      </div>
                      <div className="text-yellow-600">分钟</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setReviewPhase('setup')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                🔄 再次复习
              </button>
              <button
                onClick={handleExitReview}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✅ 完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
