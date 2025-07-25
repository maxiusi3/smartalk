'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { VideoPlayer } from '@/components/video/video-player'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface VideoLesson {
  id: string
  title: string
  description: string
  videoSrc: string
  subtitleSrc?: string
  duration: number
  objectives: string[]
  keyPhrases: Array<{
    phrase: string
    translation: string
    timestamp: number
  }>
}

// 模拟数据 - 根据lessonId获取对应课程
const getLessonData = (lessonId: string): VideoLesson => {
  const lessons: Record<string, VideoLesson> = {
    'lesson-1': {
      id: 'lesson-1',
      title: '办理登机手续',
      description: '学习在机场办理登机手续的常用英语表达',
      videoSrc: '/videos/airport-checkin.mp4',
      subtitleSrc: '/subtitles/airport-checkin.vtt',
      duration: 180,
      objectives: [
        '掌握办理登机手续的基本流程',
        '学会询问登机口和座位信息',
        '了解行李托运相关表达'
      ],
      keyPhrases: [
        {
          phrase: "I'd like to check in for flight BA123",
          translation: '我想办理BA123航班的登机手续',
          timestamp: 15
        },
        {
          phrase: "Do you have any bags to check?",
          translation: '您有行李需要托运吗？',
          timestamp: 45
        },
        {
          phrase: "Here's your boarding pass",
          translation: '这是您的登机牌',
          timestamp: 90
        }
      ]
    },
    'lesson-2': {
      id: 'lesson-2',
      title: '安检流程',
      description: '学习机场安检环节的英语对话',
      videoSrc: '/videos/airport-security.mp4',
      subtitleSrc: '/subtitles/airport-security.vtt',
      duration: 150,
      objectives: [
        '了解安检流程和要求',
        '学会配合安检人员的指示',
        '掌握安检相关词汇'
      ],
      keyPhrases: [
        {
          phrase: "Please remove your shoes and belt",
          translation: '请脱掉鞋子和腰带',
          timestamp: 20
        },
        {
          phrase: "Put your laptop in a separate bin",
          translation: '请将笔记本电脑单独放在托盘里',
          timestamp: 35
        }
      ]
    }
  }

  return lessons[lessonId] || lessons['lesson-1']
}

export default function VideoLessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string
  
  const [lesson] = useState<VideoLesson>(() => getLessonData(lessonId))
  const [progress, setProgress] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState<number | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleVideoProgress = (currentTime: number) => {
    const progressPercent = (currentTime / lesson.duration) * 100
    setProgress(progressPercent)

    // 检查是否到达关键短语时间点
    const activePhrase = lesson.keyPhrases.find(
      phrase => Math.abs(phrase.timestamp - currentTime) < 2
    )
    
    if (activePhrase) {
      const phraseIndex = lesson.keyPhrases.indexOf(activePhrase)
      setCurrentPhrase(phraseIndex)
    }
  }

  const handleVideoEnd = () => {
    setProgress(100)
    setIsCompleted(true)
  }

  const handleNext = () => {
    // 返回学习地图或跳转到下一课程
    router.push('/learning')
  }

  const handleReplay = () => {
    setProgress(0)
    setIsCompleted(false)
    setCurrentPhrase(null)
  }

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
                <p className="text-sm text-neutral-600">视频学习</p>
                <p className="font-medium text-neutral-800">课程 {lessonId}</p>
              </div>
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <h1 className="text-2xl font-medium text-primary-900 mb-2">
              {lesson.title}
            </h1>
            <p className="text-neutral-600">
              {lesson.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：视频播放器 */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <VideoPlayer
                    src={lesson.videoSrc}
                    subtitleSrc={lesson.subtitleSrc}
                    onTimeUpdate={handleVideoProgress}
                    onEnded={handleVideoEnd}
                    showSubtitles={true}
                    className="w-full aspect-video rounded-lg"
                  />
                </CardContent>
              </Card>

              {/* 学习目标 */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">
                    🎯 学习目标
                  </h3>
                  <ul className="space-y-2">
                    {lesson.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-primary-500 mt-1">•</span>
                        <span className="text-neutral-700">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* 右侧：关键短语 */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-medium text-neutral-800 mb-4">
                    💬 关键短语
                  </h3>
                  <div className="space-y-4">
                    {lesson.keyPhrases.map((phrase, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          currentPhrase === index
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-200 bg-white'
                        }`}
                      >
                        <p className="font-medium text-neutral-800 mb-2">
                          "{phrase.phrase}"
                        </p>
                        <p className="text-sm text-neutral-600">
                          {phrase.translation}
                        </p>
                        <p className="text-xs text-neutral-400 mt-2">
                          {Math.floor(phrase.timestamp / 60)}:{(phrase.timestamp % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 完成状态 */}
              {isCompleted && (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-medium text-success-600">
                          课程完成！
                        </h3>
                        <p className="text-neutral-600 mt-2">
                          恭喜您完成了本节课程
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={handleReplay}
                          className="px-6"
                        >
                          重新观看
                        </Button>
                        
                        <Button
                          onClick={handleNext}
                          className="px-6"
                        >
                          继续学习
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
