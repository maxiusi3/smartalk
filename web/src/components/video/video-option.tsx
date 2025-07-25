'use client'

import { useState, useRef, useEffect } from 'react'
import { VideoOption as VideoOptionType } from '@/types/story'

interface VideoOptionProps {
  option: VideoOptionType
  isSelected: boolean
  isCorrect?: boolean
  showResult: boolean
  onClick: () => void
  disabled?: boolean
}

export function VideoOption({
  option,
  isSelected,
  isCorrect,
  showResult,
  onClick,
  disabled = false
}: VideoOptionProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadStart = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)
    const handleError = () => {
      setHasError(true)
      setIsLoading(false)
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
    }
  }, [])

  const handleClick = () => {
    if (!disabled && !showResult) {
      onClick()
    }
  }

  const getResultIndicator = () => {
    if (!showResult || !isSelected) return null

    const isOptionCorrect = isCorrect ?? option.isCorrect
    
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${
        isOptionCorrect ? 'bg-success-500/80' : 'bg-red-500/80'
      }`}>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          {isOptionCorrect ? (
            <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-4 ring-primary-500 shadow-lg'
          : 'hover:shadow-md'
      } ${
        showResult && option.isCorrect
          ? 'ring-4 ring-success-500'
          : showResult && isSelected && !option.isCorrect
          ? 'ring-4 ring-red-500'
          : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
    >
      <div className="aspect-video bg-neutral-200 relative">
        {hasError ? (
          // 错误状态：显示占位符
          <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-100 text-neutral-500">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-center px-2">视频选项</span>
          </div>
        ) : (
          <>
            {/* 加载状态 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            )}
            
            {/* 尝试显示缩略图，如果失败则显示视频第一帧 */}
            {option.thumbnailSrc ? (
              <img
                src={option.thumbnailSrc}
                alt=""
                className="w-full h-full object-cover"
                onError={() => {
                  // 如果缩略图加载失败，尝试显示视频
                  setHasError(false)
                }}
              />
            ) : (
              <video
                ref={videoRef}
                src={option.videoSrc}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
                playsInline
              />
            )}
          </>
        )}
        
        {/* 播放图标覆盖层 */}
        {!hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
      
      {/* 结果指示器 */}
      {getResultIndicator()}
    </div>
  )
}
