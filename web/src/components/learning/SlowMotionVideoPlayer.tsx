/**
 * SlowMotionVideoPlayer - 慢动作视频播放器组件
 * 用于Rescue Mode中播放口型指导视频
 * 支持0.5x速度播放和发音技巧显示
 */

'use client'

import React, { useState, useRef, useEffect } from 'react';

interface SlowMotionVideoPlayerProps {
  videoUrl: string;
  phoneticTips: string[];
  targetText: string;
  playbackSpeed?: number;
  loopCount?: number;
  showPhoneticGuide?: boolean;
  onVideoComplete?: () => void;
  onTipShown?: (tip: string) => void;
  className?: string;
}

export default function SlowMotionVideoPlayer({
  videoUrl,
  phoneticTips,
  targetText,
  playbackSpeed = 0.5,
  loopCount = 3,
  showPhoneticGuide = true,
  onVideoComplete,
  onTipShown,
  className = ''
}: SlowMotionVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLoop, setCurrentLoop] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // 初始化视频
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      video.playbackRate = playbackSpeed;
    };

    const handleError = () => {
      setVideoError('视频加载失败，请检查网络连接');
    };

    const handleEnded = () => {
      setCurrentLoop(prev => {
        const newLoop = prev + 1;
        if (newLoop < loopCount) {
          // 继续循环播放
          video.currentTime = 0;
          video.play();
          return newLoop;
        } else {
          // 播放完成
          setIsPlaying(false);
          onVideoComplete?.();
          return newLoop;
        }
      });
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('ended', handleEnded);
    };
  }, [playbackSpeed, loopCount, onVideoComplete]);

  // 播放视频
  const playVideo = async () => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    try {
      setIsPlaying(true);
      setCurrentLoop(0);
      video.currentTime = 0;
      video.playbackRate = playbackSpeed;
      await video.play();
      
      // 显示发音技巧
      if (showPhoneticGuide && phoneticTips.length > 0) {
        setShowTips(true);
        setCurrentTipIndex(0);
        startTipRotation();
      }
    } catch (error) {
      console.error('视频播放失败:', error);
      setVideoError('视频播放失败');
      setIsPlaying(false);
    }
  };

  // 暂停视频
  const pauseVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    setIsPlaying(false);
  };

  // 重新播放
  const replayVideo = () => {
    setCurrentLoop(0);
    setVideoError(null);
    playVideo();
  };

  // 开始技巧轮播
  const startTipRotation = () => {
    if (phoneticTips.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTipIndex(prev => {
        const nextIndex = (prev + 1) % phoneticTips.length;
        onTipShown?.(phoneticTips[nextIndex]);
        return nextIndex;
      });
    }, 3000); // 每3秒切换一个技巧

    // 清理定时器
    setTimeout(() => {
      clearInterval(interval);
    }, loopCount * 10000); // 根据循环次数估算总时间
  };

  // 获取播放速度文本
  const getSpeedText = (speed: number): string => {
    if (speed === 0.5) return '0.5x 慢速';
    if (speed === 0.75) return '0.75x 慢速';
    if (speed === 1) return '正常速度';
    return `${speed}x 速度`;
  };

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg ${className}`}>
      {/* 视频标题 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🎬 慢动作发音示范</h3>
            <p className="text-sm opacity-90">
              目标单词: <span className="font-semibold">{targetText}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">播放速度</div>
            <div className="font-semibold">{getSpeedText(playbackSpeed)}</div>
          </div>
        </div>
      </div>

      {/* 视频播放区域 */}
      <div className="relative bg-black">
        {videoError ? (
          // 错误状态
          <div className="aspect-video flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-lg mb-4">{videoError}</p>
              <button
                onClick={replayVideo}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                重试
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full aspect-video object-cover"
              preload="metadata"
              playsInline
              muted={false}
            >
              <source src={videoUrl} type="video/mp4" />
              <p className="text-white p-4">您的浏览器不支持视频播放</p>
            </video>

            {/* 视频加载指示器 */}
            {!isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p>正在加载视频...</p>
                </div>
              </div>
            )}

            {/* 播放控制覆盖层 */}
            {!isPlaying && isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <button
                  onClick={playVideo}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all transform hover:scale-110"
                >
                  <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            )}

            {/* 播放进度指示器 */}
            {isPlaying && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm">
                第 {currentLoop + 1} / {loopCount} 次
              </div>
            )}
          </>
        )}
      </div>

      {/* 发音技巧显示区域 */}
      {showPhoneticGuide && phoneticTips.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">💡</span>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-800 mb-2">发音技巧</h4>
              {showTips ? (
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 border-l-4 border-purple-500">
                    <p className="text-gray-800 font-medium">
                      {phoneticTips[currentTipIndex]}
                    </p>
                  </div>
                  
                  {/* 技巧指示器 */}
                  {phoneticTips.length > 1 && (
                    <div className="flex justify-center space-x-1">
                      {phoneticTips.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentTipIndex ? 'bg-purple-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {phoneticTips.map((tip, index) => (
                    <div key={index} className="bg-white rounded-lg p-2 text-sm text-gray-700">
                      • {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex justify-center space-x-4">
          {isPlaying ? (
            <button
              onClick={pauseVideo}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <span>⏸️</span>
              <span>暂停</span>
            </button>
          ) : (
            <button
              onClick={playVideo}
              disabled={!isVideoLoaded}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
            >
              <span>▶️</span>
              <span>{currentLoop === 0 ? '开始播放' : '继续播放'}</span>
            </button>
          )}
          
          <button
            onClick={replayVideo}
            disabled={!isVideoLoaded}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>重新播放</span>
          </button>
        </div>

        {/* 播放说明 */}
        <div className="mt-3 text-center text-sm text-gray-600">
          <p>视频将以 {getSpeedText(playbackSpeed)} 循环播放 {loopCount} 次</p>
          <p>请仔细观察口型变化和舌头位置</p>
        </div>
      </div>
    </div>
  );
}

// 简化版慢动作播放器
export function SimpleSlowMotionPlayer({
  videoUrl,
  targetText,
  onComplete
}: {
  videoUrl: string;
  targetText: string;
  onComplete?: () => void;
}) {
  return (
    <SlowMotionVideoPlayer
      videoUrl={videoUrl}
      phoneticTips={[
        '注意观察口型变化',
        '跟随视频中的发音节奏',
        '重复练习直到熟练'
      ]}
      targetText={targetText}
      onVideoComplete={onComplete}
      className="max-w-2xl mx-auto"
    />
  );
}
