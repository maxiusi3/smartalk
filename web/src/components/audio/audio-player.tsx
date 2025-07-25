'use client'

import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  src: string
  onTimeUpdate?: (currentTime: number) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: () => void
  className?: string
  autoPlay?: boolean
  showWaveform?: boolean
  repeatMode?: 'none' | 'single' | 'segment'
  segmentStart?: number
  segmentEnd?: number
  allowSkip?: boolean
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
  className = '',
  autoPlay = false,
  showWaveform = true,
  repeatMode = 'none',
  segmentStart = 0,
  segmentEnd,
  allowSkip = false
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null)
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化音频分析器（用于波形显示）
  useEffect(() => {
    // 只在浏览器环境中初始化
    if (typeof window === 'undefined') return
    if (!showWaveform) return

    const initAudioContext = async () => {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)()
        const audio = audioRef.current
        if (!audio) return

        const source = context.createMediaElementSource(audio)
        const analyserNode = context.createAnalyser()

        analyserNode.fftSize = 256
        const bufferLength = analyserNode.frequencyBinCount
        const dataArr = new Uint8Array(bufferLength)

        source.connect(analyserNode)
        analyserNode.connect(context.destination)

        setAudioContext(context)
        setAnalyser(analyserNode)
        setDataArray(dataArr)
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
      }
    }

    initAudioContext()

    return () => {
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [showWaveform])

  // 绘制波形
  useEffect(() => {
    if (!showWaveform || !analyser || !dataArray || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      if (!isPlaying) return

      analyser.getByteFrequencyData(dataArray)

      ctx.fillStyle = 'rgb(15, 23, 42)' // bg-slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / dataArray.length) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < dataArray.length; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        // 渐变色
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#ff6b35') // accent-500
        gradient.addColorStop(1, '#1a237e') // primary-900

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }

      requestAnimationFrame(draw)
    }

    if (isPlaying) {
      draw()
    }
  }, [isPlaying, analyser, dataArray, showWaveform])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const time = audio.currentTime
      setCurrentTime(time)
      onTimeUpdate?.(time)

      // 处理片段重复播放
      if (repeatMode === 'segment' && segmentEnd && time >= segmentEnd) {
        audio.currentTime = segmentStart
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      setHasError(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setHasError(false)
    }

    const handleError = () => {
      console.error('Audio loading failed:', audio.error)
      setHasError(true)
      setIsLoading(false)
      onError?.()
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setHasError(false)
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()

      // 恢复音频上下文（某些浏览器需要用户交互后才能播放）
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume()
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)

      if (repeatMode === 'single') {
        audio.currentTime = segmentStart
        audio.play()
      } else {
        onEnded?.()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [repeatMode, segmentStart, segmentEnd, onTimeUpdate, onPlay, onPause, onEnded, audioContext])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const vol = parseFloat(e.target.value)
    audio.volume = vol
    setVolume(vol)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const playSegment = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = segmentStart
    audio.play()
  }

  const repeatSegment = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = segmentStart
    if (!isPlaying) {
      audio.play()
    }
  }

  const handleSkip = () => {
    onEnded?.()
  }

  const handleRetry = () => {
    const audio = audioRef.current
    if (!audio) return

    setHasError(false)
    setIsLoading(true)
    audio.load() // 重新加载音频
  }

  // 如果有错误，显示错误状态
  if (hasError) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">音频加载失败</h3>
          <p className="text-neutral-600 mb-4">无法播放音频文件，但您可以继续学习</p>
          <div className="flex justify-center space-x-3">
            <Button
              variant="outline"
              onClick={handleRetry}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>重试</span>
            </Button>
            {allowSkip && (
              <Button
                onClick={handleSkip}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span>跳过继续</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* 隐藏的音频元素 */}
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        preload="metadata"
      />

      {/* 加载状态 */}
      {isLoading && (
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
          <p className="text-neutral-600 text-sm">加载音频中...</p>
        </div>
      )}

      {/* 波形显示 */}
      {showWaveform && !isLoading && (
        <div className="mb-6">
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            className="w-full h-24 bg-slate-900 rounded-lg"
          />
        </div>
      )}

      {/* 进度条 */}
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${(currentTime / duration) * 100}%, #e5e5e5 ${(currentTime / duration) * 100}%, #e5e5e5 100%)`
          }}
        />
        <div className="flex justify-between text-sm text-neutral-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {/* 播放片段 */}
        <Button
          variant="outline"
          size="sm"
          onClick={playSegment}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          <span>播放片段</span>
        </Button>

        {/* 主播放按钮 */}
        <Button
          size="lg"
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </Button>

        {/* 重复播放 */}
        <Button
          variant="outline"
          size="sm"
          onClick={repeatSegment}
          className="flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span>重复</span>
        </Button>

        {/* 跳过按钮 */}
        {allowSkip && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h10a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>跳过</span>
          </Button>
        )}
      </div>

      {/* 音量控制 */}
      <div className="flex items-center justify-center space-x-3">
        <svg className="w-5 h-5 text-neutral-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 max-w-32 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm text-neutral-600 w-8">{Math.round(volume * 100)}</span>
      </div>
    </div>
  )
}

export { AudioPlayer }
export type { AudioPlayerProps }
