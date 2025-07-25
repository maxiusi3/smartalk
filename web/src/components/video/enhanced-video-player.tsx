'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface KeywordData {
  id: string
  word: string
  translation: string
  startTime: number
  endTime: number
  isHighlighted: boolean
}

interface SubtitleSegment {
  text: string
  isKeyword: boolean
  keywordId?: string
}

interface EnhancedVideoPlayerProps {
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
}

const EnhancedVideoPlayer: React.FC<EnhancedVideoPlayerProps> = ({
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
  showSubtitles = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [activeKeywords, setActiveKeywords] = useState<Set<string>>(new Set())

  // 模拟字幕数据 - 在实际应用中应该从API获取
  const subtitleText = "Welcome to the airport. Please proceed to check-in counter for your boarding pass. After security check, go to gate number 15 for departure."

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const time = video.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)

      // 检查当前时间是否有活跃的关键词
      const currentActiveKeywords = new Set<string>()
      keywords.forEach(keyword => {
        if (time >= keyword.startTime && time <= keyword.endTime) {
          currentActiveKeywords.add(keyword.id)
          onKeywordHighlight?.(keyword.id)
        }
      })
      setActiveKeywords(currentActiveKeywords)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [keywords, onTimeUpdate, onKeywordHighlight, onPlay, onPause, onEnded])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const time = parseFloat(e.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const vol = parseFloat(e.target.value)
    video.volume = vol
    setVolume(vol)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
  }

  // 将字幕文本分割为包含关键词高亮的片段
  const renderSubtitleWithKeywords = () => {
    if (!showSubtitles || !subtitleText) return null

    const segments: SubtitleSegment[] = []
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
              isKeyword: false
            })
          }
          
          // 添加关键词
          segments.push({
            text: subtitleText.slice(keywordIndex, keywordIndex + keyword.word.length),
            isKeyword: true,
            keywordId: keyword.id
          })
          
          lastIndex = keywordIndex + keyword.word.length
        }
      }
    })
    
    // 添加剩余的普通文本
    if (lastIndex < subtitleText.length) {
      segments.push({
        text: subtitleText.slice(lastIndex),
        isKeyword: false
      })
    }
    
    // 如果没有活跃关键词，显示完整文本
    if (segments.length === 0) {
      segments.push({
        text: subtitleText,
        isKeyword: false
      })
    }

    return (
      <div className="absolute bottom-20 left-0 right-0 flex justify-center px-4">
        <div className="bg-black/90 text-white px-6 py-3 rounded-xl text-center max-w-4xl shadow-lg">
          <p className="text-lg leading-relaxed">
            {segments.map((segment, index) => (
              segment.isKeyword ? (
                <span
                  key={index}
                  className="bg-accent-500 text-white px-2 py-1 rounded-md font-bold animate-pulse shadow-lg"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)'
                  }}
                >
                  {segment.text}
                </span>
              ) : (
                <span key={index}>{segment.text}</span>
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
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        controls={false}
        playsInline
        muted={false}
      />

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
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider"
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
              {/* 后退10秒 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-xs">10s</span>
              </Button>

              {/* 播放/暂停 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 p-2"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>

              {/* 前进10秒 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-xs">10s</span>
              </Button>

              {/* 时间显示 */}
              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* 音量控制 */}
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { EnhancedVideoPlayer }
export type { EnhancedVideoPlayerProps, KeywordData }
