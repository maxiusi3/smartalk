/**
 * PronunciationTrainer - 发音训练器组件
 * 提供录音、波形显示、评分反馈等功能
 */

'use client'

import React, { useState, useEffect } from 'react';
import { usePronunciation } from '../../hooks/usePronunciation';
import { useRescueMode } from '../../hooks/useRescueMode';
import RescueModeModal from './RescueModeModal';

interface PronunciationTrainerProps {
  keywordId: string;
  targetText: string;
  onAssessmentComplete?: (assessment: any) => void;
  onCancel?: () => void;
  className?: string;
}

export default function PronunciationTrainer({
  keywordId,
  targetText,
  onAssessmentComplete,
  onCancel,
  className = ''
}: PronunciationTrainerProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioLevel,
    recordingQuality,
    isAssessing,
    assessment,
    hasPermission,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    isLoading,
    error
  } = usePronunciation();

  const [showInstructions, setShowInstructions] = useState(true);
  const [sessionId, setSessionId] = useState<string>('');

  // Rescue Mode 集成
  const {
    isActive: isRescueModeActive,
    recordFailure: recordRescueFailure,
    recordImprovement: recordRescueImprovement,
    calculateRescueScore,
    currentPassThreshold,
    shouldUseLoweredThreshold
  } = useRescueMode();

  // 初始化会话ID
  useEffect(() => {
    const newSessionId = `pronunciation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setSessionId(newSessionId);
  }, []);

  // 当评估完成时调用回调和Rescue Mode处理
  useEffect(() => {
    if (assessment && onAssessmentComplete) {
      handleAssessmentComplete(assessment);
    }
  }, [assessment, onAssessmentComplete]);

  // 处理评估完成
  const handleAssessmentComplete = async (assessmentResult: any) => {
    try {
      const originalScore = assessmentResult.overallScore;
      const passThreshold = currentPassThreshold;

      // 检查是否通过
      const passed = originalScore >= passThreshold;

      if (passed) {
        // 通过了，记录改善（如果在Rescue Mode中）
        if (isRescueModeActive) {
          await recordRescueImprovement(originalScore, true);
        }

        // 调用原始回调
        onAssessmentComplete(assessmentResult);
      } else {
        // 没有通过，记录失败到Rescue Mode
        const rescueTriggered = await recordRescueFailure(
          keywordId,
          sessionId,
          originalScore,
          [] // 可以添加具体的发音技巧
        );

        if (rescueTriggered) {
          console.log('Rescue Mode triggered due to pronunciation failure');
        }

        // 如果在Rescue Mode中，应用救援评分
        let finalAssessment = assessmentResult;
        if (isRescueModeActive) {
          const rescueScore = calculateRescueScore(originalScore);
          finalAssessment = {
            ...assessmentResult,
            overallScore: rescueScore,
            isRescueMode: true,
            originalScore: originalScore,
            rescueBonus: rescueScore - originalScore
          };

          // 重新检查是否通过
          if (rescueScore >= passThreshold) {
            await recordRescueImprovement(rescueScore, true);
          }
        }

        // 调用原始回调
        onAssessmentComplete(finalAssessment);
      }
    } catch (error) {
      console.error('Error handling assessment completion:', error);
      // 出错时仍然调用原始回调
      onAssessmentComplete(assessment);
    }
  };

  // 格式化时间显示
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 100);
    return `${seconds}.${milliseconds}s`;
  };

  // 获取录音质量颜色
  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // 获取录音质量文本
  const getQualityText = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'fair': return '一般';
      case 'poor': return '较差';
      default: return '未知';
    }
  };

  // 处理开始录音
  const handleStartRecording = async () => {
    setShowInstructions(false);
    try {
      await startRecording(keywordId, targetText);
    } catch (err) {
      console.error('开始录音失败:', err);
    }
  };

  // 处理停止录音
  const handleStopRecording = async () => {
    try {
      await stopRecording();
    } catch (err) {
      console.error('停止录音失败:', err);
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (isRecording) {
      cancelRecording();
    }
    onCancel?.();
  };

  // 如果正在加载
  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在初始化发音评估...</p>
        </div>
      </div>
    );
  }

  // 如果不支持或没有权限
  if (!isSupported || !hasPermission) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {!isSupported ? '浏览器不支持录音功能' : '需要麦克风权限'}
          </h3>
          <p className="text-gray-600 mb-4">
            {!isSupported 
              ? '请使用支持录音功能的现代浏览器（Chrome、Firefox、Safari等）'
              : '请允许访问麦克风以进行发音评估'
            }
          </p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 如果有错误
  if (error) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">发音评估失败</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 显示评估结果
  if (assessment) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">
            {assessment.overallScore >= 90 ? '🎉' : 
             assessment.overallScore >= 80 ? '👏' : 
             assessment.overallScore >= 70 ? '👍' : '💪'}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            发音评估结果
            {(assessment as any).isRescueMode && (
              <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                🆘 救援模式
              </span>
            )}
          </h3>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {assessment.overallScore}分
            {(assessment as any).isRescueMode && (assessment as any).rescueBonus > 0 && (
              <span className="text-lg text-purple-600 ml-2">
                (+{(assessment as any).rescueBonus} 救援加分)
              </span>
            )}
          </div>
          <p className="text-gray-600">{assessment.feedback.overallMessage}</p>

          {/* Rescue Mode 特殊提示 */}
          {(assessment as any).isRescueMode && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600">🆘</span>
                <span className="text-purple-800 font-medium">
                  救援模式帮助: 原始分数 {(assessment as any).originalScore}分，
                  救援后 {assessment.overallScore}分 (通过标准: {currentPassThreshold}分)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 详细分数 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{assessment.accuracy}</div>
            <div className="text-sm text-gray-600">准确度</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{assessment.fluency}</div>
            <div className="text-sm text-gray-600">流利度</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{assessment.completeness}</div>
            <div className="text-sm text-gray-600">完整度</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-900">{assessment.prosody}</div>
            <div className="text-sm text-gray-600">韵律</div>
          </div>
        </div>

        {/* 反馈信息 */}
        <div className="mb-6">
          {assessment.feedback.strengths.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-green-700 mb-2">✅ 优点</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {assessment.feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.feedback.weaknesses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ 需要改进</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {assessment.feedback.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
          )}

          {assessment.feedback.specificTips.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-blue-700 mb-2">💡 具体建议</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {assessment.feedback.specificTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 鼓励信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-center font-medium">
            {assessment.feedback.encouragement}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setShowInstructions(true);
              // 重置状态以便重新录音
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            再次练习
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    );
  }

  // 正在评估
  if (isAssessing) {
    return (
      <div className={`bg-white rounded-2xl p-6 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">正在评估发音...</h3>
          <p className="text-gray-600 mb-4">AI正在分析您的发音，请稍候</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div className={`bg-white rounded-2xl p-6 ${className}`}>
      {/* Rescue Mode Modal */}
      <RescueModeModal
        targetText={targetText}
        onContinuePractice={() => {
          // 继续练习时重置状态
          setShowInstructions(false);
        }}
      />

      {/* 标题 */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎤 发音训练
          {isRescueModeActive && (
            <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              🆘 救援模式
            </span>
          )}
        </h3>
        <p className="text-gray-600">
          请清晰地朗读以下内容
          {shouldUseLoweredThreshold && (
            <span className="block text-sm text-purple-600 font-medium mt-1">
              通过分数已降至 {currentPassThreshold} 分
            </span>
          )}
        </p>
      </div>

      {/* 目标文本 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900 mb-2">{targetText}</div>
          <div className="text-sm text-blue-700">请大声清晰地朗读上面的内容</div>
        </div>
      </div>

      {/* 使用说明 */}
      {showInstructions && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-2">📋 录音提示</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 确保环境安静，减少背景噪音</li>
            <li>• 保持麦克风距离适中（约20-30cm）</li>
            <li>• 发音清晰，语速适中</li>
            <li>• 录音时长建议3-8秒</li>
          </ul>
        </div>
      )}

      {/* 录音状态显示 */}
      {isRecording && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-700 font-medium">正在录音</span>
            </div>
            <div className="text-right">
              <div className="text-red-700 font-mono">{formatDuration(duration)}</div>
              <div className={`text-xs ${getQualityColor(recordingQuality)}`}>
                音质: {getQualityText(recordingQuality)}
              </div>
            </div>
          </div>
          
          {/* 音频电平指示器 */}
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600">音量:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600">{Math.round(audioLevel * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-center space-x-4">
        {!isRecording ? (
          <>
            <button
              onClick={handleStartRecording}
              className="px-8 py-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center space-x-2 text-lg font-semibold"
            >
              <span>🎤</span>
              <span>开始录音</span>
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleStopRecording}
              className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2 text-lg font-semibold"
            >
              <span>⏹️</span>
              <span>完成录音</span>
            </button>
            <button
              onClick={cancelRecording}
              className="px-6 py-4 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              取消
            </button>
          </>
        )}
      </div>

      {/* 键盘快捷键提示 */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>快捷键: 空格键开始/停止录音，ESC键取消</p>
      </div>
    </div>
  );
}

// 简化的发音训练器组件（用于快速集成）
export function SimplePronunciationTrainer({
  targetText,
  onComplete
}: {
  targetText: string;
  onComplete: (score: number) => void;
}) {
  return (
    <PronunciationTrainer
      keywordId="simple"
      targetText={targetText}
      onAssessmentComplete={(assessment) => onComplete(assessment.overallScore)}
      className="max-w-md mx-auto"
    />
  );
}
