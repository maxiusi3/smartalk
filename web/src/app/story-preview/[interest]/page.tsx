'use client'

// 禁用静态生成
export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { VideoPlayer } from '@/components/video/video-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LearningRouteGuard } from '@/components/navigation/learning-route-guard'
import { LearningFlowManager } from '@/lib/learning-flow-manager'
import { useAuthStore } from '@/lib/store'
import { useLearningStore } from '@/store/learning-store'
import { getStoryByTheme } from '@/data/stories'
import { Story } from '@/types/story'

export default function StoryPreviewPage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as 'travel' | 'movies' | 'workplace'
  
  const { user } = useAuthStore()
  const {
    startLearningSession
  } = useLearningStore()

  const [story, setStory] = useState<Story | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [highlightedKeywords, setHighlightedKeywords] = useState<Set<string>>(new Set())

  // 加载故事数据
  useEffect(() => {
    const storyData = getStoryByTheme(interest)

    if (!storyData) {
      console.error(`Story not found for theme: ${interest}`)
      // 重定向到学习页面或显示错误
      router.push('/learning')
      return
    }

    setStory(storyData)

    // 开始学习会话，如果没有用户ID则使用访客ID
    const userId = user?.id || `guest-user-${Date.now()}`
    startLearningSession(storyData, userId)
  }, [interest, user?.id, startLearningSession, router])

  // 处理视频时间更新，高亮对应的关键词
  useEffect(() => {
    if (!story) return

    const keywordsToHighlight = story.keywords.filter(
      keyword => currentTime >= keyword.startTime && currentTime <= keyword.endTime
    )

    const newHighlightedKeywords = new Set(keywordsToHighlight.map(k => k.id))
    setHighlightedKeywords(newHighlightedKeywords)
  }, [currentTime, story])

  const handleVideoTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const handleVideoEnd = useCallback(() => {
    LearningFlowManager.completeCurrentPhaseAndNavigate(interest, router)
  }, [router, interest])

  const handleVideoError = useCallback(() => {
    console.warn('视频加载失败，但用户可以选择跳过')
  }, [])

  const handleSkipVideo = useCallback(() => {
    LearningFlowManager.completeCurrentPhaseAndNavigate(interest, router)
  }, [router, interest])

  if (!story) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">加载故事中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <LearningRouteGuard
      requiredPhase="preview"
      currentRoute={`/story-preview/${interest}`}
      interest={interest}
    >
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium text-primary-900">
                  {story.title}
                </h1>
                <p className="text-neutral-600 mt-1">
                  {story.description}
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>返回</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 故事预览阶段 */}
          <div className="space-y-6">
            {/* 说明文字 */}
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-medium text-neutral-800 mb-2">
                    观看故事预告片
                  </h2>
                  <p className="text-neutral-600">
                    仔细观看这个30秒的故事，注意高亮显示的关键词汇
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 视频播放器 */}
            <Card>
              <CardContent className="p-0">
                <VideoPlayer
                  src={story.videoWithSubtitlesSrc}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnd}
                  onError={handleVideoError}
                  onSkip={handleSkipVideo}
                  showSubtitles={true}
                  controls={true}
                  allowSkip={true}
                  className="w-full aspect-video"
                />
              </CardContent>
            </Card>

            {/* 关键词高亮显示 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium text-neutral-800 mb-4">
                  故事中的关键词汇 ({story.keywords.length}个)
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {story.keywords.map((keyword) => (
                    <div
                      key={keyword.id}
                      className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                        highlightedKeywords.has(keyword.id)
                          ? 'border-primary-500 bg-primary-50 shadow-md scale-105'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-2">
                        <img
                          src={keyword.iconSrc}
                          alt=""
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            // 如果图标加载失败，显示默认图标
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        {/* 默认图标（当图片加载失败时显示） */}
                        <svg className="w-full h-full text-neutral-400 hidden" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-xs text-center text-neutral-600">
                        {Math.floor(keyword.startTime)}s
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
    </LearningRouteGuard>
  )
}
