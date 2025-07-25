'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { VideoPlayer } from '@/components/video/video-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useLearningStore } from '@/store/learning-store'

export default function MagicMomentPage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as string

  const {
    currentStory,
    progress,
    completeMagicMoment,
    canAccessMagicMoment
  } = useLearningStore()

  const [currentPhase, setCurrentPhase] = useState<'preparation' | 'watching' | 'celebration'>('preparation')
  const [isVideoEnded, setIsVideoEnded] = useState(false)

  // 检查访问权限
  useEffect(() => {
    if (!currentStory || !progress || !canAccessMagicMoment()) {
      router.push(`/story-clues/${interest}`)
      return
    }
  }, [currentStory, progress, interest, router, canAccessMagicMoment])

  const handleStartWatching = () => {
    setCurrentPhase('watching')
  }

  const handleVideoEnd = useCallback(() => {
    setIsVideoEnded(true)
    setCurrentPhase('celebration')
    completeMagicMoment()
  }, [completeMagicMoment])

  const handleContinueLearning = () => {
    // 跳转到学习地图或下一个故事
    router.push('/learning')
  }

  if (!currentStory || !progress) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">加载中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-800">
        {currentPhase === 'preparation' && (
          /* 准备阶段 */
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  ✨ 准备见证魔法时刻！
                </h1>
                <p className="text-xl text-primary-100 mb-6">
                  你已经收集了所有魔法钥匙，现在让我们看看你能理解多少
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-lg font-medium mb-8">
                  <span className="mr-3">🎧</span>
                  建议戴上耳机以获得最佳体验
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  接下来会发生什么？
                </h2>
                <div className="space-y-4 text-left">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <p className="text-primary-100">
                      你将观看同一个故事，但这次<strong className="text-white">没有字幕</strong>
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <p className="text-primary-100">
                      放松心情，<strong className="text-white">不要有压力</strong>，只需要静静观看
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <p className="text-primary-100">
                      你会惊讶地发现自己<strong className="text-white">竟然能理解这么多内容</strong>！
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStartWatching}
                size="lg"
                className="px-12 py-4 text-xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                开始魔法时刻 ✨
              </Button>
            </div>
          </div>
        )}

        {currentPhase === 'watching' && (
          /* 观看阶段 */
          <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="w-full max-w-6xl mx-auto px-4">
              <div className="relative">
                {/* 全屏视频播放器 */}
                <VideoPlayer
                  src={currentStory.videoWithoutSubtitlesSrc}
                  onEnded={handleVideoEnd}
                  showSubtitles={false}
                  controls={true}
                  autoPlay={true}
                  className="w-full aspect-video rounded-lg shadow-2xl"
                />
                
                {/* 顶部提示 */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-black/50 backdrop-blur-sm text-white px-6 py-2 rounded-full text-sm font-medium">
                    🎬 魔法时刻进行中... 放松观看，不要有压力
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPhase === 'celebration' && (
          /* 庆祝阶段 */
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* 庆祝动画 */}
              <div className="mb-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {/* 装饰性光芒 */}
                  <div className="absolute inset-0 -m-4">
                    <div className="w-full h-full border-4 border-yellow-400/30 rounded-full animate-ping"></div>
                  </div>
                  <div className="absolute inset-0 -m-8">
                    <div className="w-full h-full border-4 border-orange-400/20 rounded-full animate-ping animation-delay-75"></div>
                  </div>
                </div>
                
                <h1 className="text-5xl font-bold text-white mb-4">
                  🎉 恭喜你！
                </h1>
                <h2 className="text-3xl font-semibold text-yellow-300 mb-6">
                  你刚刚体验了语言学习的魔法时刻！
                </h2>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
                <h3 className="text-2xl font-semibold text-white mb-6">
                  你刚刚做到了什么？
                </h3>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">理解了完整故事</h4>
                        <p className="text-primary-100 text-sm">
                          没有字幕帮助，你依然能跟上故事情节
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">激活了语言直觉</h4>
                        <p className="text-primary-100 text-sm">
                          你的大脑建立了声音与画面的直接连接
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">掌握了5个核心词汇</h4>
                        <p className="text-primary-100 text-sm">
                          通过音画匹配，这些词汇已深深印在你的记忆中
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold mb-1">体验了自然学习</h4>
                        <p className="text-primary-100 text-sm">
                          就像婴儿学母语一样，通过情境理解语言
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-6 border border-yellow-400/30 mb-8">
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  💡 这就是神经沉浸法的力量
                </h3>
                <p className="text-white/90 leading-relaxed">
                  你刚刚体验的不是传统的"背单词"学习法，而是让大脑建立自然语言连接的科学方法。
                  这种理解力会随着练习越来越强，最终让你在真实场景中自信开口！
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleContinueLearning}
                  size="lg"
                  className="px-12 py-4 text-xl bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  继续学习之旅 🚀
                </Button>
                <p className="text-primary-200 text-sm">
                  还有更多精彩故事等着你探索
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
