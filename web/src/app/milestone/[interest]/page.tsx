'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MilestoneData {
  id: string
  title: string
  theme: 'travel' | 'movie' | 'workplace'
  storyTitle: string
  encouragementText: string
  achievementDescription: string
  theaterVideoUrl: string
}

// 模拟里程碑数据
const mockMilestoneData: Record<string, MilestoneData> = {
  travel: {
    id: 'travel-milestone-1',
    title: '机场奇遇记完成',
    theme: 'travel',
    storyTitle: '机场奇遇记',
    encouragementText: '恭喜你！你已经成功收集了所有15个故事线索。现在，是时候见证真正的奇迹了！',
    achievementDescription: '通过收集故事线索，你的大脑已经建立了完整的语言神经连接。接下来的无字幕播放将验证你的学习成果。',
    theaterVideoUrl: '/videos/travel/airport-story-no-subtitles.mp4'
  },
  movie: {
    id: 'movie-milestone-1',
    title: '咖啡店邂逅完成',
    theme: 'movie',
    storyTitle: '咖啡店邂逅',
    encouragementText: '太棒了！你已经掌握了这个温馨故事的所有关键元素。准备好体验语言学习的魔法时刻吧！',
    achievementDescription: '你的神经沉浸法学习即将达到高潮。无字幕观看将证明你已经真正理解了这个故事。',
    theaterVideoUrl: '/videos/movie/coffee-story-no-subtitles.mp4'
  },
  workplace: {
    id: 'workplace-milestone-1',
    title: '项目会议完成',
    theme: 'workplace',
    storyTitle: '项目会议',
    encouragementText: '出色的表现！你已经完全掌握了职场沟通的精髓。现在让我们验证你的学习成果！',
    achievementDescription: '通过系统性的线索收集，你已经建立了职场英语的完整认知框架。无字幕测试将展现你的真实水平。',
    theaterVideoUrl: '/videos/workplace/meeting-story-no-subtitles.mp4'
  }
}

export default function MilestonePage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as string

  const [milestoneData, setMilestoneData] = useState<MilestoneData | null>(null)
  const [showAnimation, setShowAnimation] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // 加载对应兴趣的里程碑数据
    const milestone = mockMilestoneData[interest]
    if (milestone) {
      setMilestoneData(milestone)
    } else {
      router.push('/learning')
    }
  }, [interest, router])

  useEffect(() => {
    // 里程碑动画序列
    const animationSequence = [
      { phase: 0, duration: 1000 }, // 初始状态
      { phase: 1, duration: 2000 }, // 线索收集完成动画
      { phase: 2, duration: 2000 }, // 成就解锁动画
      { phase: 3, duration: 0 }     // 最终状态
    ]

    let currentIndex = 0
    const runAnimation = () => {
      if (currentIndex < animationSequence.length - 1) {
        const current = animationSequence[currentIndex]
        setAnimationPhase(current.phase)
        
        setTimeout(() => {
          currentIndex++
          runAnimation()
        }, current.duration)
      } else {
        setShowAnimation(false)
      }
    }

    if (showAnimation) {
      runAnimation()
    }
  }, [showAnimation])

  const handleStartTheaterMode = () => {
    if (milestoneData) {
      router.push(`/theater-mode/${interest}`)
    }
  }

  const handleSkipToLearningMap = () => {
    router.push('/learning')
  }

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'travel':
        return {
          bg: 'bg-travel-sky/10',
          border: 'border-travel-sky/30',
          text: 'text-travel-sky',
          accent: 'bg-travel-sky',
          gradient: 'from-travel-sky to-travel-orange'
        }
      case 'movie':
        return {
          bg: 'bg-movie-purple/10',
          border: 'border-movie-purple/30',
          text: 'text-movie-purple',
          accent: 'bg-movie-purple',
          gradient: 'from-movie-purple to-movie-gold'
        }
      case 'workplace':
        return {
          bg: 'bg-workplace-blue/10',
          border: 'border-workplace-blue/30',
          text: 'text-workplace-blue',
          accent: 'bg-workplace-blue',
          gradient: 'from-workplace-blue to-workplace-silver'
        }
      default:
        return {
          bg: 'bg-primary-50',
          border: 'border-primary-200',
          text: 'text-primary-600',
          accent: 'bg-primary-500',
          gradient: 'from-primary-500 to-accent-500'
        }
    }
  }

  if (!milestoneData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">加载里程碑数据中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const colors = getThemeColors(milestoneData.theme)

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} animate-pulse`}></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] animate-ping"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
          <div className="max-w-4xl w-full">
            {showAnimation ? (
              // 动画阶段
              <div className="text-center space-y-8">
                {/* Phase 0: 初始状态 */}
                {animationPhase === 0 && (
                  <div className="animate-fade-in">
                    <div className="w-32 h-32 mx-auto mb-8 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full animate-spin-slow"></div>
                      <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                        <span className="text-4xl">🔍</span>
                      </div>
                    </div>
                    <h1 className="text-3xl font-bold text-primary-900 mb-4">
                      正在分析你的学习成果...
                    </h1>
                  </div>
                )}

                {/* Phase 1: 线索收集完成 */}
                {animationPhase === 1 && (
                  <div className="animate-scale-in">
                    <div className="w-40 h-40 mx-auto mb-8 relative">
                      <div className="absolute inset-0 bg-success-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                        <span className="text-5xl">✨</span>
                      </div>
                      {/* 15个小星星围绕动画 */}
                      {Array.from({ length: 15 }, (_, i) => (
                        <div
                          key={i}
                          className="absolute w-4 h-4 bg-accent-400 rounded-full animate-bounce"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 24}deg) translateY(-80px) rotate(-${i * 24}deg)`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        >
                          ⭐
                        </div>
                      ))}
                    </div>
                    <h1 className="text-4xl font-bold text-success-700 mb-4">
                      🎉 所有故事线索收集完成！
                    </h1>
                    <p className="text-xl text-neutral-600">
                      你已经成功解锁了 {milestoneData.storyTitle} 的全部秘密
                    </p>
                  </div>
                )}

                {/* Phase 2: 成就解锁 */}
                {animationPhase === 2 && (
                  <div className="animate-fade-in">
                    <div className="w-48 h-48 mx-auto mb-8 relative">
                      <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse shadow-2xl`}></div>
                      <div className="absolute inset-6 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-6xl animate-bounce">🏆</span>
                      </div>
                      {/* 光芒效果 */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-spin-slow"></div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-6">
                      🌟 里程碑成就解锁！
                    </h1>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                      <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                        神经沉浸法学习完成
                      </h2>
                      <p className="text-lg text-neutral-600 leading-relaxed">
                        {milestoneData.achievementDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // 最终确认阶段
              <div className="text-center space-y-8">
                {/* 成就展示 */}
                <div className="mb-12">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full shadow-2xl`}></div>
                    <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                      <span className="text-5xl">🎭</span>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold text-primary-900 mb-4">
                    准备好见证奇迹了吗？
                  </h1>
                  <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
                    {milestoneData.encouragementText}
                  </p>
                </div>

                {/* 魔法时刻说明 */}
                <Card className="max-w-3xl mx-auto">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                        🎬 魔法时刻验证
                      </h2>
                      <p className="text-neutral-600 leading-relaxed">
                        接下来，你将观看完整的故事视频，但这次<strong>没有任何字幕</strong>。
                        如果你能理解故事内容，说明神经沉浸法学习已经成功！
                      </p>
                    </div>

                    <div className="bg-gradient-to-r from-accent-50 to-primary-50 rounded-xl p-6 mb-6">
                      <h3 className="font-bold text-neutral-800 mb-3">
                        🧠 科学原理
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        通过故事线索收集，你的大脑已经建立了完整的语言神经连接网络。
                        现在即使没有字幕提示，你也能理解故事内容，这就是神经沉浸法的魔法！
                      </p>
                    </div>

                    <div className="space-y-4">
                      <Button
                        size="lg"
                        onClick={handleStartTheaterMode}
                        className="w-full max-w-md mx-auto flex items-center justify-center space-x-2 text-lg py-6"
                      >
                        <span>🎭</span>
                        <span>进入剧场模式</span>
                        <span>✨</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleSkipToLearningMap}
                        className="w-full max-w-md mx-auto"
                      >
                        稍后体验，返回学习地图
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* 成就统计 */}
                <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600">15</div>
                    <div className="text-sm text-neutral-600">故事线索</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">100%</div>
                    <div className="text-sm text-neutral-600">完成度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-600">1</div>
                    <div className="text-sm text-neutral-600">里程碑</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 装饰性粒子效果 */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-accent-400 rounded-full opacity-30 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 1s ease-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </MainLayout>
  )
}
