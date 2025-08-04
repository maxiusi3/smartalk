/**
 * RescueModeModal - 救援模式模态框组件
 * 显示慢动作视频、发音技巧和鼓励性消息
 */

'use client'

import React, { useState, useEffect } from 'react';
import { useRescueMode } from '../../hooks/useRescueMode';
import SlowMotionVideoPlayer from './SlowMotionVideoPlayer';

interface RescueModeModalProps {
  isVisible?: boolean;
  targetText: string;
  onClose?: () => void;
  onContinuePractice?: () => void;
  className?: string;
}

export default function RescueModeModal({
  isVisible,
  targetText,
  onClose,
  onContinuePractice,
  className = ''
}: RescueModeModalProps) {
  const {
    isActive,
    supportiveMessage,
    phoneticTips,
    rescueVideoUrl,
    currentPassThreshold,
    exitRescueMode
  } = useRescueMode();

  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'intro' | 'video' | 'tips' | 'ready'>('intro');
  const [videoCompleted, setVideoCompleted] = useState(false);

  // 控制模态框显示
  useEffect(() => {
    if (isVisible !== undefined) {
      setShowModal(isVisible);
    } else {
      setShowModal(isActive);
    }

    // 重置步骤
    if (isActive) {
      setCurrentStep('intro');
      setVideoCompleted(false);
    }
  }, [isVisible, isActive]);

  // 处理关闭
  const handleClose = async () => {
    setShowModal(false);
    await exitRescueMode();
    onClose?.();
  };

  // 处理继续练习
  const handleContinuePractice = () => {
    setShowModal(false);
    onContinuePractice?.();
  };

  // 处理视频播放完成
  const handleVideoComplete = () => {
    setVideoCompleted(true);
    setCurrentStep('ready');
  };

  // 进入下一步
  const nextStep = () => {
    switch (currentStep) {
      case 'intro':
        setCurrentStep('video');
        break;
      case 'video':
        setCurrentStep('tips');
        break;
      case 'tips':
        setCurrentStep('ready');
        break;
      default:
        break;
    }
  };

  if (!showModal) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 transition-opacity duration-300" />
      
      {/* 模态框内容 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${className}`}>
          
          {/* 步骤1: 介绍 */}
          {currentStep === 'intro' && (
            <div className="p-8 text-center">
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="关闭救援模式"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* 救援模式图标和标题 */}
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                  <span className="text-4xl">🆘</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  救援模式启动
                </h2>
                <p className="text-lg text-gray-600">
                  别担心，我来帮助你掌握 "<span className="font-semibold text-purple-600">{targetText}</span>" 的发音！
                </p>
              </div>

              {/* 支持消息 */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <p className="text-purple-800 text-lg font-medium">
                  {supportiveMessage || '🆘 别担心，让我来帮你！看看这个慢动作示范'}
                </p>
              </div>

              {/* 救援模式说明 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">🎯 救援模式特色</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-start space-x-3">
                    <span className="text-blue-600 text-xl">🎬</span>
                    <div>
                      <div className="font-medium text-blue-800">慢动作视频</div>
                      <div className="text-sm text-blue-600">0.5倍速播放，清晰展示口型</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-600 text-xl">💡</span>
                    <div>
                      <div className="font-medium text-green-800">发音技巧</div>
                      <div className="text-sm text-green-600">专业的发音指导和技巧</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-600 text-xl">🎯</span>
                    <div>
                      <div className="font-medium text-yellow-800">降低标准</div>
                      <div className="text-sm text-yellow-600">通过分数降至 {currentPassThreshold} 分</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-purple-600 text-xl">⭐</span>
                    <div>
                      <div className="font-medium text-purple-800">奖励加分</div>
                      <div className="text-sm text-purple-600">额外获得鼓励分数</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 开始按钮 */}
              <button
                onClick={nextStep}
                className="px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors text-lg"
              >
                🚀 开始救援训练
              </button>
            </div>
          )}

          {/* 步骤2: 视频播放 */}
          {currentStep === 'video' && rescueVideoUrl && (
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎬 慢动作发音示范
                </h3>
                <p className="text-gray-600">
                  请仔细观察口型和舌头位置，视频会循环播放3次
                </p>
              </div>

              <SlowMotionVideoPlayer
                videoUrl={rescueVideoUrl}
                phoneticTips={phoneticTips}
                targetText={targetText}
                onVideoComplete={handleVideoComplete}
                onTipShown={(tip) => console.log('Showing tip:', tip)}
              />

              <div className="flex justify-center mt-6 space-x-4">
                <button
                  onClick={() => setCurrentStep('tips')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  查看发音技巧
                </button>
                {videoCompleted && (
                  <button
                    onClick={() => setCurrentStep('ready')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    我准备好了
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 步骤3: 发音技巧 */}
          {currentStep === 'tips' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  💡 专业发音技巧
                </h3>
                <p className="text-gray-600">
                  掌握这些技巧，让你的发音更加准确
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {phoneticTips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">{tip}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('ready')}
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                  ✅ 我明白了，开始练习
                </button>
              </div>
            </div>
          )}

          {/* 步骤4: 准备练习 */}
          {currentStep === 'ready' && (
            <div className="p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <span className="text-4xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  准备好了吗？
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  现在你可以重新尝试发音 "<span className="font-semibold text-green-600">{targetText}</span>"
                </p>
              </div>

              {/* 救援模式优势提醒 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">🌟 救援模式优势</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-700">通过分数降至 {currentPassThreshold} 分</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-700">获得额外鼓励分数</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-700">已掌握发音技巧</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-700">观看了慢动作示范</span>
                  </div>
                </div>
              </div>

              {/* 鼓励消息 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">
                  💪 相信自己，你一定可以的！每一次练习都是进步！
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleContinuePractice}
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-lg"
                >
                  🎤 开始录音练习
                </button>
                <button
                  onClick={() => setCurrentStep('video')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 重看视频
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  稍后练习
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 救援模式指示器组件
export function RescueModeIndicator() {
  const { isActive, currentPassThreshold, supportiveMessage } = useRescueMode();

  if (!isActive) return null;

  return (
    <div className="fixed top-4 left-4 z-30">
      <div className="bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
        <span className="text-sm">🆘</span>
        <span className="text-sm font-medium">救援模式</span>
        <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
          {currentPassThreshold}分通过
        </span>
      </div>
      
      {supportiveMessage && (
        <div className="mt-2 bg-white border border-purple-300 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-sm text-gray-700">{supportiveMessage}</p>
        </div>
      )}
    </div>
  );
}
