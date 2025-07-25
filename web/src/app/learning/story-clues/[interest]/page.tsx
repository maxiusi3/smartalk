'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/lib/store'
import { ArrowLeft, Play, Volume2 } from 'lucide-react'

interface StoryClue {
  id: string
  word: string
  translation: string
  audioUrl: string
  imageOptions: {
    id: string
    imageUrl: string
    description: string
    isCorrect: boolean
  }[]
  isUnlocked: boolean
}

interface StoryCluesData {
  id: string
  title: string
  theme: 'travel' | 'movie' | 'workplace'
  clues: StoryClue[]
  totalClues: number
  unlockedClues: number
}

// 模拟故事线索数据
const mockStoryCluesData: Record<string, StoryCluesData> = {
  travel: {
    id: 'travel-clues-1',
    title: '机场奇遇记',
    theme: 'travel',
    totalClues: 15,
    unlockedClues: 7, // 模拟已解锁7个
    clues: [
      {
        id: 'clue-8',
        word: 'Coffee',
        translation: '咖啡',
        audioUrl: '/audio/travel/coffee.mp3',
        imageOptions: [
          { id: 'img1', imageUrl: '/images/coffee-cup.jpg', description: '一杯热咖啡', isCorrect: true },
          { id: 'img2', imageUrl: '/images/rain-drops.jpg', description: '雨滴', isCorrect: false },
          { id: 'img3', imageUrl: '/images/clock-ticking.jpg', description: '时钟', isCorrect: false },
          { id: 'img4', imageUrl: '/images/burger.jpg', description: '汉堡', isCorrect: false }
        ],
        isUnlocked: false
      }
      // 这里应该有15个线索，为了演示只显示1个
    ]
  },
  movie: {
    id: 'movie-clues-1',
    title: '电影奇遇记',
    theme: 'movie',
    totalClues: 15,
    unlockedClues: 7, // 模拟已解锁7个
    clues: [
      {
        id: 'clue-8',
        word: 'Coffee',
        translation: '咖啡',
        audioUrl: '/audio/movie/coffee.mp3',
        imageOptions: [
          { id: 'img1', imageUrl: '/images/coffee-cup.jpg', description: '一杯热咖啡', isCorrect: true },
          { id: 'img2', imageUrl: '/images/rain-drops.jpg', description: '雨滴', isCorrect: false },
          { id: 'img3', imageUrl: '/images/clock-ticking.jpg', description: '时钟', isCorrect: false },
          { id: 'img4', imageUrl: '/images/burger.jpg', description: '汉堡', isCorrect: false }
        ],
        isUnlocked: false
      }
    ]
  }
}

export default function StoryCluesPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuthStore()
  const interest = params.interest as string

  const [storyData, setStoryData] = useState<StoryCluesData | null>(null)
  const [currentClue, setCurrentClue] = useState<StoryClue | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // 加载对应兴趣的故事线索数据
    const story = mockStoryCluesData[interest]
    if (story) {
      setStoryData(story)
      // 找到第一个未解锁的线索
      const firstLockedClue = story.clues.find(clue => !clue.isUnlocked)
      if (firstLockedClue) {
        setCurrentClue(firstLockedClue)
      }
    } else {
      router.push('/learning')
    }
  }, [interest, router])

  const playAudio = () => {
    if (!currentClue || typeof window === 'undefined') return

    setIsAudioPlaying(true)
    // 模拟音频播放
    try {
      const audio = new Audio(currentClue.audioUrl)
      audio.play().catch(() => {
        // 处理音频播放失败的情况
        console.log('Audio playback failed')
        setIsAudioPlaying(false)
      })

      audio.onended = () => {
        setIsAudioPlaying(false)
      }

      // 模拟音频播放时长
      setTimeout(() => {
        setIsAudioPlaying(false)
      }, 2000)
    } catch (error) {
      console.log('Audio creation failed:', error)
      setIsAudioPlaying(false)
    }
  }

  const handleImageSelect = (imageId: string) => {
    if (!currentClue) return

    setSelectedImage(imageId)
    const selectedOption = currentClue.imageOptions.find(option => option.id === imageId)

    if (selectedOption) {
      setIsCorrect(selectedOption.isCorrect)
      setShowResult(true)

      if (selectedOption.isCorrect) {
        // 解锁当前线索
        const updatedClue = {
          ...currentClue,
          isUnlocked: true
        }

        // 更新故事数据
        if (storyData) {
          const updatedStoryData = {
            ...storyData,
            unlockedClues: storyData.unlockedClues + 1,
            clues: storyData.clues.map(clue =>
              clue.id === currentClue.id ? updatedClue : clue
            )
          }
          setStoryData(updatedStoryData)
          setCurrentClue(updatedClue)
        }
      } else {
        // 答错时，延迟一段时间后重置状态，让用户可以重新选择
        setTimeout(() => {
          setShowResult(false)
          setSelectedImage(null)
          setIsCorrect(false)
        }, 1500)
      }
    }
  }

  const handleNextClue = () => {
    if (!storyData || !isCorrect) return

    setShowResult(false)
    setSelectedImage(null)
    setIsCorrect(false)

    // 找下一个未解锁的线索
    const nextClue = storyData.clues.find(clue => !clue.isUnlocked)
    if (nextClue) {
      setCurrentClue(nextClue)
    } else {
      // 所有线索都解锁了，跳转到里程碑页面
      router.push(`/milestone/${interest}`)
    }
  }

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'travel':
        return {
          bg: 'bg-travel-sky/10',
          border: 'border-travel-sky/30',
          text: 'text-travel-sky',
          accent: 'bg-travel-sky'
        }
      case 'movie':
        return {
          bg: 'bg-movie-purple/10',
          border: 'border-movie-purple/30',
          text: 'text-movie-purple',
          accent: 'bg-movie-purple'
        }
      case 'workplace':
        return {
          bg: 'bg-workplace-blue/10',
          border: 'border-workplace-blue/30',
          text: 'text-workplace-blue',
          accent: 'bg-workplace-blue'
        }
      default:
        return {
          bg: 'bg-primary-50',
          border: 'border-primary-200',
          text: 'text-primary-600',
          accent: 'bg-primary-500'
        }
    }
  }

  // 防止hydration错误，确保客户端和服务器端渲染一致
  if (!mounted || !storyData || !currentClue) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">加载故事线索中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const colors = getThemeColors(storyData.theme)
  const progress = (storyData.unlockedClues / storyData.totalClues) * 100

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/learning')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回学习地图</span>
                </Button>

                <div>
                  <h1 className="text-2xl font-bold text-primary-900">
                    🔍 {storyData.title}
                  </h1>
                  <p className="text-neutral-600 mt-1">
                    通过音-画匹配训练，收集所有故事线索
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-neutral-600 mb-1">进度</div>
                <div className="text-2xl font-bold text-primary-600">
                  {storyData.unlockedClues} / {storyData.totalClues}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <Progress
                value={progress}
                className="h-3"
              />
              <p className="text-sm text-neutral-600 mt-2">
                {progress === 100
                  ? "🎉 恭喜！你已经收集了所有故事线索，准备见证奇迹吧！"
                  : "继续努力！每个线索都让你更接近故事的真相。"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Audio and Clue Info */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-neutral-800 mb-2 flex items-center justify-center">
                    <span className="mr-2">🎧</span>
                    当前线索
                  </h3>
                  <p className="text-neutral-600">
                    仔细听这个声音线索，然后选择匹配的画面
                  </p>
                </div>

                {/* Clue Word */}
                <div className="text-center mb-8">
                  <div className={`inline-block px-8 py-4 rounded-xl ${colors.bg} ${colors.border} border-2`}>
                    <div className="text-3xl font-bold text-neutral-800 mb-2">
                      {currentClue.word}
                    </div>
                    <div className="text-lg text-neutral-600">
                      {currentClue.translation}
                    </div>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="text-center mb-6">
                  <Button
                    size="lg"
                    onClick={playAudio}
                    disabled={isAudioPlaying}
                    className={`w-full max-w-sm h-16 text-lg ${isAudioPlaying ? 'animate-pulse' : ''}`}
                    style={{
                      background: isAudioPlaying
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)'
                        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {isAudioPlaying ? (
                        <Volume2 className="w-6 h-6 text-white" />
                      ) : (
                        <Play className="w-6 h-6 text-white" />
                      )}
                      <span className="text-white font-medium">
                        {isAudioPlaying ? '播放中...' : '播放音频'}
                      </span>
                    </div>
                  </Button>
                </div>

                {/* Hint */}
                <div className="text-center text-sm text-neutral-600">
                  <p>💡 仔细听音频中的关键信息，选择最匹配的画面</p>
                </div>
              </CardContent>
            </Card>

            {/* Right: Image Selection */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-neutral-800 mb-2 flex items-center justify-center">
                    <span className="mr-2">🎬</span>
                    选择匹配的画面
                  </h3>
                  <p className="text-neutral-600">
                    哪个画面能够表达这个声音的含义？
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {currentClue.imageOptions.map((option, index) => (
                    <div
                      key={option.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedImage === option.id
                          ? showResult
                            ? option.isCorrect
                              ? 'ring-4 ring-success-500 shadow-lg scale-105'
                              : 'ring-4 ring-red-500 shadow-lg'
                            : 'ring-4 ring-primary-500 shadow-lg scale-105'
                          : 'hover:ring-2 hover:ring-primary-300 hover:shadow-md hover:scale-105'
                      } ${showResult && !option.isCorrect && selectedImage !== option.id ? 'opacity-50 scale-95' : ''}`}
                      onClick={() => handleImageSelect(option.id)}
                    >
                      {/* Mock Image */}
                      <div
                        className="w-full h-full flex items-center justify-center text-white relative"
                        style={{
                          background: index === 0
                            ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' // Coffee - warm colors
                            : index === 1
                            ? 'linear-gradient(135deg, #6b7280 0%, #374151 100%)' // Rain - cool grays
                            : index === 2
                            ? 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)' // Clock - neutral
                            : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' // Burger - red
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">
                            {index === 0 ? '☕' : index === 1 ? '🌧️' : index === 2 ? '⏰' : '🍔'}
                          </div>
                          <div className="text-sm font-medium opacity-90">
                            {option.description}
                          </div>
                        </div>
                      </div>

                      {/* Result Indicator */}
                      {showResult && selectedImage === option.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            option.isCorrect ? 'bg-success-500' : 'bg-red-500'
                          }`}>
                            <span className="text-2xl text-white">
                              {option.isCorrect ? '✓' : '✗'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Result Message */}
          {showResult && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
              <Card className="bg-white shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className={`p-4 rounded-lg ${
                    isCorrect ? 'bg-success-50 border border-success-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium text-lg ${
                      isCorrect ? 'text-success-800' : 'text-red-800'
                    }`}>
                      {isCorrect
                        ? '🎉 太棒了！线索解锁成功！'
                        : '😔 这次不对，再试试看吧！'
                      }
                    </p>
                    {isCorrect && (
                      <p className="text-success-600 text-sm mt-2">
                        你成功解锁了一个故事线索，继续收集更多线索吧！
                      </p>
                    )}
                  </div>

                  {isCorrect && (
                    <Button
                      onClick={handleNextClue}
                      className="mt-6 px-8 py-3 text-lg font-medium"
                      size="lg"
                    >
                      {storyData.unlockedClues >= storyData.totalClues
                        ? '见证奇迹时刻 ✨'
                        : '继续下一个线索 →'
                      }
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
