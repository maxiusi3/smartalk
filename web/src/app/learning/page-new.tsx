'use client'

// 禁用静态生成
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/auth-store'
import { useLearningStore } from '@/store/learning-store'
import { getAllStories } from '@/data/stories'
import { Story } from '@/types/story'

export default function LearningMapPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentSession, progress } = useLearningStore()
  
  const [stories, setStories] = useState<Story[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    setStories(getAllStories())
  }, [])

  // 如果用户没有选择兴趣，重定向到引导流程
  useEffect(() => {
    if (isHydrated && (!user || !user.preferences?.interests)) {
      router.push('/onboarding')
    }
  }, [isHydrated, user, router])

  const handleStorySelect = (story: Story) => {
    // 跳转到故事预览页面
    router.push(`/story-preview/${story.theme}`)
  }

  const handleContinueLearning = () => {
    if (!currentSession || !progress) return

    // 根据当前学习阶段跳转到对应页面
    switch (progress.currentPhase) {
      case 'preview':
        router.push(`/story-preview/${currentSession.storyId.split('-')[0]}`)
        break
      case 'collecting':
        router.push(`/story-clues/${currentSession.storyId.split('-')[0]}`)
        break
      case 'magic-moment':
        router.push(`/magic-moment/${currentSession.storyId.split('-')[0]}`)
        break
      default:
        // 如果已完成，显示成就或开始新故事
        break
    }
  }

  if (!isHydrated) {
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
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium text-primary-900">
                  学习地图
                </h1>
                <p className="text-neutral-600 mt-1">
                  选择你感兴趣的故事主题，开始神经沉浸法学习之旅
                </p>
              </div>
              
              {user && (
                <div className="text-right">
                  <p className="text-sm text-neutral-600">欢迎回来</p>
                  <p className="font-medium text-neutral-800">{user.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 继续学习卡片 */}
          {currentSession && progress && progress.currentPhase !== 'completed' && (
            <Card className="mb-8 border-primary-200 bg-primary-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-primary-900">
                        继续学习
                      </h3>
                      <p className="text-primary-700">
                        {progress.currentPhase === 'preview' && '观看故事预告片'}
                        {progress.currentPhase === 'collecting' && `收集故事线索 (${progress.collectedKeywords}/${progress.totalKeywords})`}
                        {progress.currentPhase === 'magic-moment' && '体验魔法时刻'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-primary-600 mb-1">故事探索进度</div>
                      <Progress 
                        value={
                          progress.currentPhase === 'preview' ? 10 :
                          progress.currentPhase === 'collecting' ? 10 + (progress.collectedKeywords / progress.totalKeywords) * 80 :
                          progress.currentPhase === 'magic-moment' ? 90 : 100
                        } 
                        className="w-32" 
                      />
                    </div>
                    <Button onClick={handleContinueLearning} className="px-6">
                      继续探索
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 故事主题选择 */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-medium text-neutral-800 mb-2">
                选择学习主题
              </h2>
              <p className="text-neutral-600 mb-6">
                每个主题包含一个完整的故事和5个核心词汇，通过音画匹配的方式进行学习
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {stories.map((story) => {
                const isUserPreferred = user?.preferences?.interests === story.theme
                const isCompleted = currentSession?.storyId === story.id && progress?.currentPhase === 'completed'
                
                return (
                  <Card 
                    key={story.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      isUserPreferred ? 'ring-2 ring-primary-500 shadow-lg' : ''
                    } ${isCompleted ? 'bg-success-50 border-success-200' : ''}`}
                    onClick={() => handleStorySelect(story)}
                  >
                    <CardContent className="p-0">
                      {/* 故事缩略图 */}
                      <div className="aspect-video bg-neutral-200 rounded-t-lg overflow-hidden">
                        <img
                          src={story.thumbnailSrc}
                          alt={story.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-medium text-neutral-800">
                            {story.title}
                          </h3>
                          {isUserPreferred && (
                            <div className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                              推荐
                            </div>
                          )}
                          {isCompleted && (
                            <div className="px-2 py-1 bg-success-100 text-success-700 text-xs font-medium rounded-full">
                              已完成
                            </div>
                          )}
                        </div>
                        
                        <p className="text-neutral-600 text-sm mb-4">
                          {story.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                              </svg>
                              <span>{story.duration}秒</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{story.keywords.length}个词汇</span>
                            </div>
                          </div>
                          
                          <div className="text-primary-600 font-medium text-sm">
                            {isCompleted ? '重新学习' : '开始学习'} →
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* 学习方法说明 */}
          <div className="mt-12">
            <Card className="bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
              <CardContent className="p-8">
                <h3 className="text-xl font-medium text-primary-900 mb-4">
                  🧠 神经沉浸法学习流程
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <h4 className="font-medium text-primary-800 mb-2">故事预览</h4>
                    <p className="text-primary-700 text-sm">
                      观看30秒带字幕的故事，了解5个核心词汇
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h4 className="font-medium text-accent-800 mb-2">线索收集</h4>
                    <p className="text-accent-700 text-sm">
                      通过音画匹配学习每个词汇，完全无文字交互
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h4 className="font-medium text-success-800 mb-2">魔法时刻</h4>
                    <p className="text-success-700 text-sm">
                      观看无字幕版本，体验理解的成就感
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
