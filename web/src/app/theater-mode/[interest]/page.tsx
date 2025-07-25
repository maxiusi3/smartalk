'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface TheaterData {
  id: string
  title: string
  theme: 'travel' | 'movie' | 'workplace'
  videoUrl: string
  duration: number
}

// 模拟剧场模式数据
const mockTheaterData: Record<string, TheaterData> = {
  travel: {
    id: 'travel-theater-1',
    title: '机场奇遇记',
    theme: 'travel',
    videoUrl: '/videos/travel/airport-story-no-subtitles.mp4',
    duration: 60
  },
  movie: {
    id: 'movie-theater-1',
    title: '咖啡店邂逅',
    theme: 'movie',
    videoUrl: '/videos/movie/coffee-story-no-subtitles.mp4',
    duration: 60
  },
  workplace: {
    id: 'workplace-theater-1',
    title: '项目会议',
    theme: 'workplace',
    videoUrl: '/videos/workplace/meeting-story-no-subtitles.mp4',
    duration: 60
  }
}

export default function TheaterModePage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as string
  const videoRef = useRef<HTMLVideoElement>(null)

  const [theaterData, setTheaterData] = useState<TheaterData | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isVideoEnded, setIsVideoEnded] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    // 加载对应兴趣的剧场数据
    const theater = mockTheaterData[interest]
    if (theater) {
      setTheaterData(theater)
    } else {
      router.push('/learning')
    }
  }, [interest, router])

  useEffect(() => {
    // 自动进入全屏模式
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (error) {
        console.log('Fullscreen not supported or denied')
      }
    }

    enterFullscreen()

    // 监听全屏状态变化
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement
      setIsFullscreen(isCurrentlyFullscreen)

      // 如果用户通过ESC退出全屏，显示退出确认
      if (!isCurrentlyFullscreen && isFullscreen) {
        setShowExitConfirm(true)
      }
    }

    // 监听键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'Escape':
          e.preventDefault()
          // 如果在全屏模式，先退出全屏，否则显示退出确认
          if (document.fullscreenElement) {
            document.exitFullscreen()
          } else {
            handleExit()
          }
          break
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    // 隐藏鼠标和控制器的定时器
    let hideControlsTimer: NodeJS.Timeout

    const resetHideTimer = () => {
      setShowControls(true)
      clearTimeout(hideControlsTimer)
      hideControlsTimer = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    const handleMouseMove = () => {
      resetHideTimer()
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hideControlsTimer)
    }
  }, [isPlaying, isFullscreen])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setIsVideoEnded(true)
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
  }, [])

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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleExit = () => {
    console.log('Theater mode exit requested')
    setShowExitConfirm(true)
  }

  const confirmExit = async () => {
    try {
      // 退出全屏
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }

      // 暂停视频
      const video = videoRef.current
      if (video) {
        video.pause()
      }

      // 清理状态
      setShowExitConfirm(false)
      setIsPlaying(false)

      // 跳转到成就确认页面
      router.push(`/achievement/${interest}`)
    } catch (error) {
      console.error('Error during exit:', error)
      // 即使出错也要跳转
      router.push(`/achievement/${interest}`)
    }
  }

  const cancelExit = () => {
    setShowExitConfirm(false)
  }

  const handleVideoComplete = () => {
    // 视频播放完成，显示完成提示然后跳转到成就确认页面
    setIsVideoEnded(true)
    setIsPlaying(false)

    setTimeout(() => {
      confirmExit()
    }, 2000)
  }

  if (!theaterData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>加载剧场内容中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Video Player */}
      <video
        ref={videoRef}
        src={theaterData.videoUrl}
        className="w-full h-full object-cover"
        autoPlay
        controls={false}
        playsInline
      />

      {/* Theater Mode Overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h1 className="text-2xl font-bold mb-1">🎭 剧场模式</h1>
              <p className="text-white/80">{theaterData.title} - 无字幕版本</p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Emergency Exit Button */}
              <Button
                variant="ghost"
                onClick={() => router.push('/learning')}
                className="text-white/60 hover:bg-white/10 text-sm"
                title="紧急退出到学习页面"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Button>

              {/* Normal Exit Button */}
              <Button
                variant="ghost"
                onClick={handleExit}
                className="text-white hover:bg-white/20"
                title="退出剧场模式"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!isPlaying && !isVideoEnded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlay}
              className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50"
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        )}

        {/* Video Ended Overlay */}
        {isVideoEnded && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white max-w-2xl px-8">
              <div className="w-24 h-24 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">✨</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">🎉 魔法时刻完成！</h2>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                恭喜你！你刚刚完成了无字幕观看，这证明你已经真正掌握了这个故事的内容。
                神经沉浸法学习成功！
              </p>
              <Button
                size="lg"
                onClick={handleVideoComplete}
                className="bg-success-500 hover:bg-success-600 text-white px-8 py-4 text-lg"
              >
                查看学习成就 →
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #ff6b35 0%, #ff6b35 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 p-3"
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </Button>

              {/* Time Display */}
              <span className="text-white text-lg font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theater Mode Indicator */}
              <div className="flex items-center space-x-2 text-white/80">
                <span className="text-2xl">🎭</span>
                <span className="text-sm">剧场模式 - 无字幕</span>
              </div>

              {/* Fullscreen Toggle */}
              <Button
                variant="ghost"
                onClick={() => {
                  if (isFullscreen) {
                    document.exitFullscreen()
                  } else {
                    document.documentElement.requestFullscreen()
                  }
                }}
                className="text-white hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9h4.5M15 9V4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15h4.5M15 15v4.5m0-4.5l5.5 5.5" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-neutral-800 mb-4">
              确定要退出剧场模式吗？
            </h3>
            <p className="text-neutral-600 mb-6">
              退出后将跳转到成就确认页面，你可以查看本次学习的详细成果。
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={cancelExit}
                className="flex-1"
              >
                继续观看
              </Button>
              <Button
                onClick={confirmExit}
                className="flex-1"
              >
                确定退出
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="absolute bottom-20 right-6 text-white/60 text-sm">
        <p>空格键：播放/暂停 | ESC：退出剧场模式</p>
      </div>

      {/* Video Completion Overlay */}
      {isVideoEnded && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-40">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">恭喜完成！</h2>
            <p className="text-xl mb-6">你刚刚完成了无字幕观看体验</p>
            <div className="animate-pulse">
              <p className="text-lg">正在跳转到成就页面...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
