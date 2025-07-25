'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface KeywordData {
  id: string
  word: string
  translation: string
  startTime: number
  endTime: number
  isHighlighted: boolean
}

interface MockVideoPlayerProps {
  src: string
  keywords?: KeywordData[]
  onTimeUpdate?: (currentTime: number) => void
  onKeywordHighlight?: (keywordId: string) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  className?: string
  autoPlay?: boolean
  controls?: boolean
  showSubtitles?: boolean
  duration?: number
}

const MockVideoPlayer: React.FC<MockVideoPlayerProps> = ({
  src,
  keywords = [],
  onTimeUpdate,
  onKeywordHighlight,
  onPlay,
  onPause,
  onEnded,
  className = '',
  autoPlay = false,
  controls = true,
  showSubtitles = true,
  duration = 60
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [activeKeywords, setActiveKeywords] = useState<Set<string>>(new Set())
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 模拟字幕数据
  const subtitleText = "Welcome to the airport. Please proceed to check-in counter for your boarding pass. After security check, go to gate number 15 for departure."

  // 模拟视频播放
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          if (newTime >= duration) {
            setIsPlaying(false)
            // 使用 setTimeout 来避免在渲染过程中触发回调
            setTimeout(() => {
              onEnded?.();
            }, 10);
            return duration;
          }
          
          // 将onTimeUpdate移到setTimeout中，避免在渲染过程中调用
          setTimeout(() => {
            onTimeUpdate?.(newTime);
          }, 0);
          
          // 检查当前时间是否有活跃的关键词
          const currentActiveKeywords = new Set<string>();
          const newlyHighlightedKeywords = new Set<string>();

          keywords.forEach(keyword => {
            if (newTime >= keyword.startTime && newTime <= keyword.endTime) {
              currentActiveKeywords.add(keyword.id);
              // 只有当关键词刚刚变为活跃状态时才触发回调
              if (!activeKeywords.has(keyword.id)) {
                newlyHighlightedKeywords.add(keyword.id);
              }
            }
          });

          // 使用setTimeout来更新activeKeywords状态
          setTimeout(() => {
            setActiveKeywords(currentActiveKeywords);
          }, 0);

          // 使用 setTimeout 来避免在渲染过程中更新状态
          if (newlyHighlightedKeywords.size > 0) {
            // 使用更长的延迟确保不在渲染过程中触发
            setTimeout(() => {
              newlyHighlightedKeywords.forEach(keywordId => {
                onKeywordHighlight?.(keywordId);
              });
            }, 10);
          }
          
          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, duration, keywords, onTimeUpdate, onKeywordHighlight, onEnded, activeKeywords])

  const togglePlay = () => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)
    
    if (newIsPlaying) {
      onPlay?.()
    } else {
      onPause?.()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    onTimeUpdate?.(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const skipTime = (seconds: number) => {
    setCurrentTime(prev => Math.max(0, Math.min(duration, prev + seconds)))
  }

  // 渲染字幕和关键词高亮
  const renderSubtitleWithKeywords = () => {
    if (!showSubtitles || !subtitleText) return null

    const segments = []
    let lastIndex = 0
    
    // 按开始时间排序关键词
    const sortedKeywords = [...keywords].sort((a, b) => a.startTime - b.startTime)
    
    sortedKeywords.forEach(keyword => {
      if (activeKeywords.has(keyword.id)) {
        const keywordIndex = subtitleText.toLowerCase().indexOf(keyword.word.toLowerCase(), lastIndex)
        if (keywordIndex !== -1) {
          // 添加关键词前的普通文本
          if (keywordIndex > lastIndex) {
            segments.push({
              text: subtitleText.slice(lastIndex, keywordIndex),
              isKeyword: false,
              key: `text-${lastIndex}`
            })
          }
          
          // 添加关键词
          segments.push({
            text: subtitleText.slice(keywordIndex, keywordIndex + keyword.word.length),
            isKeyword: true,
            keywordId: keyword.id,
            key: `keyword-${keyword.id}`
          })
          
          lastIndex = keywordIndex + keyword.word.length
        }
      }
    })
    
    // 添加剩余的普通文本
    if (lastIndex < subtitleText.length) {
      segments.push({
        text: subtitleText.slice(lastIndex),
        isKeyword: false,
        key: `text-end`
      })
    }
    
    // 如果没有活跃关键词，显示完整文本
    if (segments.length === 0) {
      segments.push({
        text: subtitleText,
        isKeyword: false,
        key: 'full-text'
      })
    }

    return (
      <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
        <div className="bg-black/90 text-white px-6 py-3 rounded-xl text-center max-w-4xl shadow-lg">
          <p className="text-lg leading-relaxed">
            {segments.map((segment) => (
              segment.isKeyword ? (
                <span
                  key={segment.key}
                  className="bg-accent-500 text-white px-2 py-1 rounded-md font-bold animate-pulse shadow-lg"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
                  }}
                >
                  {segment.text}
                </span>
              ) : (
                <span key={segment.key}>{segment.text}</span>
              )
            ))}
          </p>
          
          {/* 显示当前高亮关键词的翻译 */}
          {activeKeywords.size > 0 && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {Array.from(activeKeywords).map(keywordId => {
                const keyword = keywords.find(k => k.id === keywordId)
                return keyword ? (
                  <div
                    key={keywordId}
                    className="bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {keyword.word} - {keyword.translation}
                  </div>
                ) : null
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl overflow-hidden ${className}`}>
      {/* 模拟视频画面 */}
      <div className="w-full aspect-video flex items-center justify-center relative">
        {/* 背景动画 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        </div>
        
        {/* 播放状态指示 */}
        <div className="text-center text-white z-10">
          <div className="text-6xl mb-4">
            {isPlaying ? '🎬' : '⏸️'}
          </div>
          <div className="text-xl font-medium mb-2">
            模拟视频播放器
          </div>
          <div className="text-sm opacity-75">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* 关键词高亮字幕 */}
      {renderSubtitleWithKeywords()}

      {/* 关键词指示器 */}
      {activeKeywords.size > 0 && (
        <div className="absolute top-4 right-4">
          <div className="bg-accent-500 text-white px-3 py-2 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🔍</span>
              <span className="text-sm font-medium">
                发现 {activeKeywords.size} 个故事线索！
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 自定义控制器 */}
      {controls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          {/* 进度条 */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${(currentTime / duration) * 100}%, #525252 ${(currentTime / duration) * 100}%, #525252 100%)`
              }}
            />
            
            {/* 关键词时间标记 */}
            <div className="relative mt-1">
              {keywords.map(keyword => (
                <div
                  key={keyword.id}
                  className="absolute w-1 h-3 bg-accent-400 rounded-full transform -translate-x-1/2"
                  style={{
                    left: `${(keyword.startTime / duration) * 100}%`,
                    top: '-2px'
                  }}
                  title={`${keyword.word} - ${keyword.translation}`}
                />
              ))}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                ⏪ 10s
              </Button>
              
              <Button
                variant="ghost"
                size="lg"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                10s ⏩
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-neutral-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { MockVideoPlayer }
