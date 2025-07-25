'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { VideoPlayer } from '@/components/video/video-player'
import { AudioPlayer } from '@/components/audio/audio-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface VTPROption {
  id: string
  type: 'video' | 'image'
  src: string
  title: string
  isCorrect: boolean
}

interface VTPRLesson {
  id: string
  title: string
  audioSrc: string
  audioText: string
  options: VTPROption[]
  explanation: string
}

// 模拟数据
const mockLesson: VTPRLesson = {
  id: 'lesson-7',
  title: '音画匹配训练：收集魔法钥匙',
  audioSrc: '/audio/travel/coffee.mp3',
  audioText: 'I would like a cappuccino, please. What do you recommend?',
  options: [
    {
      id: 'option-1',
      type: 'video',
      src: '/videos/travel/coffee-shop.mp4',
      title: '咖啡店点餐场景',
      isCorrect: true
    },
    {
      id: 'option-2',
      type: 'video',
      src: '/videos/travel/airport-checkin.mp4',
      title: '机场办理登机手续',
      isCorrect: false
    },
    {
      id: 'option-3',
      type: 'video',
      src: '/videos/travel/hotel-lobby.mp4',
      title: '酒店大堂场景',
      isCorrect: false
    },
    {
      id: 'option-4',
      type: 'video',
      src: '/videos/travel/shopping-street.mp4',
      title: '购物街场景',
      isCorrect: false
    }
  ],
  explanation: '这句话是在咖啡店点餐并询问推荐，所以正确答案是咖啡店点餐场景。通过音画匹配训练，你正在收集解锁"魔法时刻"的钥匙！'
}

export default function VTPRLearningPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'listening' | 'selecting' | 'feedback'>('listening')
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [progress, setProgress] = useState(0)

  const handleAudioComplete = () => {
    console.log('Audio completed, switching to selecting step')
    setCurrentStep('selecting')
    setProgress(33)
  }

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
  }

  const handleSubmit = () => {
    if (!selectedOption) return

    const selectedOptionData = mockLesson.options.find(opt => opt.id === selectedOption)
    const isCorrect = selectedOptionData?.isCorrect || false
    
    setAttempts(prev => prev + 1)
    
    if (isCorrect) {
      setScore(100 - (attempts * 10)) // 减分制，第一次答对100分
      setProgress(100)
    } else {
      setScore(Math.max(0, 100 - (attempts * 20))) // 错误答案扣更多分
      setProgress(66)
    }
    
    setShowResult(true)
    setCurrentStep('feedback')
  }

  const handleRetry = () => {
    setSelectedOption(null)
    setShowResult(false)
    setCurrentStep('listening')
    setProgress(0)
  }

  const handleNext = () => {
    // 这里应该加载下一个课程
    router.push('/learning')
  }

  const isCorrectAnswer = selectedOption && mockLesson.options.find(opt => opt.id === selectedOption)?.isCorrect

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
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
              
              <div className="text-right">
                <p className="text-sm text-neutral-600">vTPR学习</p>
                <p className="font-medium text-neutral-800">音-画匹配训练</p>
              </div>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <h1 className="text-2xl font-medium text-primary-900 mb-2">
              {mockLesson.title}
            </h1>
            <p className="text-neutral-600">
              通过音画匹配训练收集钥匙，解锁神秘的"魔法时刻"体验
            </p>
            <div className="mt-4 inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              🎯 目标：收集 3 把钥匙解锁魔法时刻
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左侧：音频播放器 */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-neutral-800 mb-4">
                    🎧 听音频内容
                  </h2>
                  
                  <AudioPlayer
                    src={mockLesson.audioSrc}
                    onEnded={handleAudioComplete}
                    showWaveform={true}
                    repeatMode="none"
                    className="mb-4"
                  />
                  
                  {currentStep === 'listening' && (
                    <div className="mt-4">
                      <Button
                        onClick={handleAudioComplete}
                        variant="outline"
                        className="w-full"
                      >
                        跳过音频，直接开始选择
                      </Button>
                    </div>
                  )}

                  {currentStep !== 'listening' && (
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <p className="text-sm text-neutral-600 mb-2">音频内容：</p>
                      <p className="text-neutral-800 font-medium">
                        "{mockLesson.audioText}"
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 说明卡片 */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-neutral-800 mb-3">
                    💡 vTPR学习法
                  </h3>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <p>• <strong>V</strong>isual - 视觉：观看真实场景视频</p>
                    <p>• <strong>T</strong>actile - 触觉：点击选择互动体验</p>
                    <p>• <strong>P</strong>hysical - 物理：身体参与学习过程</p>
                    <p>• <strong>R</strong>esponse - 反应：即时反馈强化记忆</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：视频选择 */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-medium text-neutral-800 mb-4">
                    🎬 选择匹配的场景
                  </h2>
                  
                  {currentStep === 'listening' && (
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
                  )}

                  {currentStep !== 'listening' && (
                    <div className="grid grid-cols-2 gap-4">
                      {mockLesson.options.map((option) => (
                        <div
                          key={option.id}
                          className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                            selectedOption === option.id
                              ? 'ring-4 ring-primary-500 shadow-lg'
                              : 'hover:shadow-md'
                          } ${
                            showResult && option.isCorrect
                              ? 'ring-4 ring-success-500'
                              : showResult && selectedOption === option.id && !option.isCorrect
                              ? 'ring-4 ring-red-500'
                              : ''
                          }`}
                          onClick={() => !showResult && handleOptionSelect(option.id)}
                        >
                          <div className="aspect-video bg-neutral-200 flex items-center justify-center">
                            {option.type === 'video' ? (
                              <VideoPlayer
                                src={option.src}
                                controls={false}
                                showSubtitles={false}
                                className="w-full h-full"
                              />
                            ) : (
                              <img
                                src={option.src}
                                alt={option.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          
                          <div className="p-3 bg-white">
                            <p className="text-sm font-medium text-neutral-800">
                              {option.title}
                            </p>
                          </div>

                          {/* 结果指示器 */}
                          {showResult && (
                            <div className="absolute top-2 right-2">
                              {option.isCorrect ? (
                                <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : selectedOption === option.id ? (
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 操作按钮 */}
              {currentStep === 'selecting' && !showResult && (
                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className="px-8 py-3"
                  >
                    确认选择
                  </Button>
                </div>
              )}

              {/* 反馈结果 */}
              {showResult && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                        isCorrectAnswer ? 'bg-success-100' : 'bg-red-100'
                      }`}>
                        {isCorrectAnswer ? (
                          <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      <div>
                        <h3 className={`text-xl font-medium ${
                          isCorrectAnswer ? 'text-success-600' : 'text-red-600'
                        }`}>
                          {isCorrectAnswer ? '回答正确！' : '回答错误'}
                        </h3>
                        <p className="text-neutral-600 mt-2">
                          得分: {score} 分
                        </p>
                      </div>

                      <div className="bg-neutral-50 rounded-lg p-4 text-left">
                        <p className="text-sm text-neutral-600 mb-2">解释：</p>
                        <p className="text-neutral-800">
                          {mockLesson.explanation}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {!isCorrectAnswer && (
                          <Button
                            variant="outline"
                            onClick={handleRetry}
                            className="px-6"
                          >
                            重新尝试
                          </Button>
                        )}
                        
                        <Button
                          onClick={handleNext}
                          className="px-6"
                        >
                          {isCorrectAnswer ? '下一题' : '继续学习'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
