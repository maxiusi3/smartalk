'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { VideoPlayer } from '@/components/video/video-player'
import { VideoOption } from '@/components/video/video-option'
import { AudioPlayer } from '@/components/audio/audio-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { MagicMomentModal } from '@/components/modals/magic-moment-modal'
import { LearningRouteGuard } from '@/components/navigation/learning-route-guard'
import { useLearningStore } from '@/store/learning-store'
import { StoryKeyword, VideoOption as VideoOptionType, VTPRAttempt } from '@/types/story'

export default function StoryCluesPage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as string

  const {
    currentStory,
    currentKeyword,
    progress,
    setCurrentKeyword,
    collectKeyword,
    getCollectedKeywordsCount,
    isKeywordCollected,
    canAccessMagicMoment
  } = useLearningStore()

  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false)
  const [showMagicMomentModal, setShowMagicMomentModal] = useState(false)

  // 检查学习状态并处理重定向
  useEffect(() => {
    // 如果没有当前故事数据或进度，尝试重新初始化
    if (!currentStory || !progress) {
      console.log('Missing learning state, redirecting to story preview to initialize...')
      router.push(`/story-preview/${interest}`)
      return
    }

    // 检查是否处于正确的学习阶段
    if (progress.currentPhase === 'preview') {
      console.log('Still in preview phase, redirecting to complete preview first...')
      router.push(`/story-preview/${interest}`)
      return
    }

    // 默认选择第一个未收集的图标
    if (!currentKeyword && currentStory.keywords.length > 0) {
      const firstUnlocked = getFirstUnlockedKeyword()
      if (firstUnlocked) {
        setCurrentKeyword(firstUnlocked)
      }
    }

    // 如果已经可以进入魔法时刻，显示提示
    if (canAccessMagicMoment()) {
      console.log('All keywords collected, magic moment available!')
    }
  }, [currentStory, progress, interest, router, canAccessMagicMoment, currentKeyword, setCurrentKeyword])

  // 获取第一个可解锁的关键词
  const getFirstUnlockedKeyword = () => {
    if (!currentStory) return null

    for (let i = 0; i < currentStory.keywords.length; i++) {
      const keyword = currentStory.keywords[i]
      if (!isKeywordCollected(keyword.id)) {
        // 检查是否可以解锁（前面的都已收集）
        const canUnlock = i === 0 || currentStory.keywords.slice(0, i).every(k => isKeywordCollected(k.id))
        if (canUnlock) {
          return keyword
        }
      }
    }
    return null
  }

  // 检查关键词是否被锁定
  const isKeywordLocked = (keywordIndex: number) => {
    if (!currentStory) return true
    if (keywordIndex === 0) return false // 第一个总是解锁的

    // 检查前面的关键词是否都已收集
    return !currentStory.keywords.slice(0, keywordIndex).every(k => isKeywordCollected(k.id))
  }

  const handleKeywordClick = (keyword: StoryKeyword, keywordIndex: number) => {
    if (isKeywordCollected(keyword.id)) return // 已收集的词汇不能再点击
    if (isKeywordLocked(keywordIndex)) return // 锁定的词汇不能点击

    setCurrentKeyword(keyword)
    setSelectedOption(null)
    setShowResult(false)
    setAttemptCount(0)
    setHasPlayedAudio(false)
  }

  const handleAudioComplete = () => {
    setHasPlayedAudio(true)
  }

  const handleOptionSelect = (optionId: string) => {
    if (!hasPlayedAudio) return // 必须先听完音频
    setSelectedOption(optionId)
  }

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentKeyword) return

    const selectedVideoOption = currentKeyword.videoOptions.find(opt => opt.id === selectedOption)
    if (!selectedVideoOption) return

    const isCorrect = selectedVideoOption.isCorrect
    const newAttemptCount = attemptCount + 1

    // 创建尝试记录
    const attempt: VTPRAttempt = {
      keywordId: currentKeyword.id,
      selectedOptionId: selectedOption,
      isCorrect,
      attemptTime: new Date(),
      attemptNumber: newAttemptCount
    }

    // 更新学习状态
    collectKeyword(currentKeyword.id, attempt)
    
    setAttemptCount(newAttemptCount)
    setShowResult(true)

    // 如果答对了，2秒后自动关闭
    if (isCorrect) {
      setTimeout(() => {
        setCurrentKeyword(null)
        setShowResult(false)
        setSelectedOption(null)
      }, 2000)
    }
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setShowResult(false)
    setHasPlayedAudio(false)
  }

  const handleGoToMagicMoment = () => {
    setShowMagicMomentModal(true)
  }

  const handleMagicMomentComplete = () => {
    // 魔法时刻完成后的处理
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

  const collectedCount = getCollectedKeywordsCount()
  const totalCount = currentStory.keywords.length
  const progressPercent = (collectedCount / totalCount) * 100

  return (
    <LearningRouteGuard
      requiredPhase="collecting"
      currentRoute={`/story-clues/${interest}`}
      interest={interest}
    >
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
                <div>
                  <h1 className="text-xl font-medium text-primary-900">
                    收集故事线索
                  </h1>
                  <p className="text-sm text-neutral-600">
                    通过音画匹配学习词汇
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-neutral-600 mb-1">
                  故事线索进度
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={progressPercent} className="w-32" />
                  <span className="text-sm font-medium text-neutral-800">
                    {collectedCount}/{totalCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：故事线索地图 */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-neutral-800 mb-4">
                    🗺️ 故事线索地图
                  </h2>
                  <p className="text-sm text-neutral-600 mb-6">
                    点击图标听音频，然后选择匹配的画面
                  </p>

                  {/* 垂直图标布局 */}
                  <div className="relative">
                    <div className="space-y-8">
                      {currentStory.keywords.map((keyword, index) => {
                        const isCollected = isKeywordCollected(keyword.id)
                        const isCurrent = currentKeyword?.id === keyword.id
                        const isLocked = isKeywordLocked(index)

                        return (
                          <div key={keyword.id} className="relative flex items-center">
                            {/* 连接线 */}
                            {index < currentStory.keywords.length - 1 && (
                              <div className="absolute left-6 top-12 w-0.5 h-8 bg-neutral-300"></div>
                            )}

                            {/* 图标 */}
                            <div
                              className={`relative cursor-pointer transform transition-all duration-300 ${
                                isCurrent ? 'scale-110 z-10' : isLocked ? '' : 'hover:scale-105'
                              } ${isLocked ? 'cursor-not-allowed' : ''}`}
                              onClick={() => !isLocked && handleKeywordClick(keyword, index)}
                            >
                              <div className={`w-12 h-12 rounded-full shadow-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                isCollected
                                  ? 'bg-success-500 border-success-600 shadow-success-200'
                                  : isCurrent
                                  ? 'bg-primary-500 border-primary-600 shadow-primary-200'
                                  : isLocked
                                  ? 'bg-neutral-200 border-neutral-300'
                                  : 'bg-white border-neutral-300 hover:border-primary-400'
                              }`}>
                                {isCollected ? (
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                ) : isLocked ? (
                                  <svg className="w-5 h-5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <img
                                    src={keyword.iconSrc}
                                    alt=""
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      // 如果图标加载失败，显示默认图标
                                      e.currentTarget.style.display = 'none'
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                    }}
                                  />
                                )}

                                {/* 默认图标（当图片加载失败时显示） */}
                                <svg className="w-6 h-6 text-neutral-400 hidden" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>

                              {/* 当前选中指示器 */}
                              {isCurrent && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
                              )}
                            </div>

                            {/* 关键词标签 */}
                            <div className="ml-4 flex-1">
                              <div className={`text-sm font-medium ${
                                isCollected ? 'text-success-700' : isCurrent ? 'text-primary-700' : isLocked ? 'text-neutral-400' : 'text-neutral-700'
                              }`}>
                                {keyword.word}
                              </div>
                              <div className={`text-xs ${
                                isCollected ? 'text-success-600' : isCurrent ? 'text-primary-600' : isLocked ? 'text-neutral-400' : 'text-neutral-500'
                              }`}>
                                {isCollected ? '已收集' : isLocked ? '已锁定' : isCurrent ? '学习中' : '待学习'}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 完成提示 */}
              {canAccessMagicMoment() && (
                <Card className="border-success-200 bg-success-50">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-success-800 mb-2">
                      🎉 所有魔法钥匙收集完成！
                    </h3>
                    <p className="text-success-700 mb-4">
                      准备好体验魔法时刻了吗？
                    </p>
                    <Button
                      onClick={handleGoToMagicMoment}
                      className="bg-success-600 hover:bg-success-700"
                    >
                      体验魔法时刻 ✨
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* 右侧：vTPR学习区域 */}
            <div className="lg:col-span-2 space-y-6">
              {!currentKeyword ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      选择一个故事线索开始学习
                    </h3>
                    <p className="text-neutral-600">
                      点击左侧地图上的图标来学习对应的词汇
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* 音频播放区域 */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-neutral-800 mb-4">
                        🎧 听音频内容
                      </h3>
                      <AudioPlayer
                        src={currentKeyword.audioSrc}
                        onEnded={handleAudioComplete}
                        onError={() => {
                          console.warn('音频加载失败，但用户可以继续学习')
                          // 音频失败时，自动标记为已播放，让用户可以继续
                          setHasPlayedAudio(true)
                        }}
                        showWaveform={false}
                        repeatMode="none"
                        allowSkip={true}
                        className="mb-4"
                      />
                      {!hasPlayedAudio && (
                        <p className="text-sm text-neutral-600 text-center">
                          请先听完音频内容
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* 视频选择区域 */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-medium text-neutral-800 mb-4">
                        🎬 选择匹配的画面
                      </h3>

                      {!hasPlayedAudio ? (
                        <div className="flex items-center justify-center h-64 bg-neutral-100 rounded-lg">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <p className="text-neutral-600">请先听完音频内容</p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {currentKeyword.videoOptions.map((option) => (
                            <VideoOption
                              key={option.id}
                              option={option}
                              isSelected={selectedOption === option.id}
                              showResult={showResult}
                              onClick={() => handleOptionSelect(option.id)}
                              disabled={showResult}
                            />
                          ))}
                        </div>
                      )}

                      {/* 操作按钮 */}
                      {hasPlayedAudio && (
                        <div className="mt-6 flex justify-center space-x-4">
                          {!showResult ? (
                            <Button
                              onClick={handleSubmitAnswer}
                              disabled={!selectedOption}
                              className="px-8"
                            >
                              确认选择
                            </Button>
                          ) : (
                            <>
                              {selectedOption && !currentKeyword.videoOptions.find(opt => opt.id === selectedOption)?.isCorrect && (
                                <Button
                                  onClick={handleRetry}
                                  variant="outline"
                                  className="px-8"
                                >
                                  重新尝试
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* 鼓励文字 */}
                      {showResult && (
                        <div className="mt-4 text-center">
                          {selectedOption && currentKeyword.videoOptions.find(opt => opt.id === selectedOption)?.isCorrect ? (
                            <p className="text-success-600 font-medium">
                              🎉 太棒了！线索收集成功！
                            </p>
                          ) : (
                            <p className="text-neutral-600">
                              💪 别担心，你的大脑正在建立连接！
                            </p>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* 魔法时刻模态 */}
        <MagicMomentModal
          isOpen={showMagicMomentModal}
          onClose={() => setShowMagicMomentModal(false)}
          onComplete={handleMagicMomentComplete}
        />
      </MainLayout>
    </LearningRouteGuard>
  )
}
