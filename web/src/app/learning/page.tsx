'use client'

// 禁用静态生成
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuthStore, useUIStore, useLearningStore } from '@/lib/store'
import { SpeakingTips } from '@/components/learning/speaking-tips'

interface LessonNode {
  id: string
  title: string
  type: 'video' | 'vtpr' | 'practice'
  isCompleted: boolean
  isLocked: boolean
  progress: number
  position: { x: number; y: number }
}

interface ChapterData {
  id: string
  title: string
  theme: 'travel' | 'movie' | 'workplace'
  progress: number
  totalLessons: number
  completedLessons: number
  lessons: LessonNode[]
}

// 模拟数据
const mockChapters: ChapterData[] = [
  {
    id: 'travel-1',
    title: '机场与航班',
    theme: 'travel',
    progress: 75,
    totalLessons: 8,
    completedLessons: 6,
    lessons: [
      { id: 'lesson-1', title: '办理登机手续', type: 'video', isCompleted: true, isLocked: false, progress: 100, position: { x: 100, y: 100 } },
      { id: 'lesson-2', title: '安检流程', type: 'vtpr', isCompleted: true, isLocked: false, progress: 100, position: { x: 200, y: 150 } },
      { id: 'lesson-3', title: '候机室对话', type: 'practice', isCompleted: true, isLocked: false, progress: 100, position: { x: 300, y: 100 } },
      { id: 'lesson-4', title: '登机广播', type: 'video', isCompleted: true, isLocked: false, progress: 100, position: { x: 400, y: 150 } },
      { id: 'lesson-5', title: '机上服务', type: 'vtpr', isCompleted: true, isLocked: false, progress: 100, position: { x: 500, y: 100 } },
      { id: 'lesson-6', title: '入境检查', type: 'practice', isCompleted: true, isLocked: false, progress: 100, position: { x: 600, y: 150 } },
      { id: 'lesson-7', title: '行李提取', type: 'vtpr', isCompleted: false, isLocked: false, progress: 60, position: { x: 700, y: 100 } },
      { id: 'lesson-8', title: '综合练习', type: 'practice', isCompleted: false, isLocked: true, progress: 0, position: { x: 800, y: 150 } },
    ]
  },
  {
    id: 'travel-2',
    title: '酒店住宿',
    theme: 'travel',
    progress: 0,
    totalLessons: 6,
    completedLessons: 0,
    lessons: [
      { id: 'lesson-9', title: '预订房间', type: 'video', isCompleted: false, isLocked: true, progress: 0, position: { x: 100, y: 300 } },
      { id: 'lesson-10', title: '办理入住', type: 'vtpr', isCompleted: false, isLocked: true, progress: 0, position: { x: 200, y: 350 } },
      { id: 'lesson-11', title: '客房服务', type: 'practice', isCompleted: false, isLocked: true, progress: 0, position: { x: 300, y: 300 } },
      { id: 'lesson-12', title: '酒店设施', type: 'video', isCompleted: false, isLocked: true, progress: 0, position: { x: 400, y: 350 } },
      { id: 'lesson-13', title: '退房结账', type: 'vtpr', isCompleted: false, isLocked: true, progress: 0, position: { x: 500, y: 300 } },
      { id: 'lesson-14', title: '综合练习', type: 'practice', isCompleted: false, isLocked: true, progress: 0, position: { x: 600, y: 350 } },
    ]
  }
]

export default function LearningMapPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { currentInterest } = useUIStore()
  const [selectedChapter, setSelectedChapter] = useState<ChapterData | null>(null)
  const [chapters, setChapters] = useState<ChapterData[]>(mockChapters)
  const [showSpeakingTips, setShowSpeakingTips] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // 标记客户端已水合
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    // 只在客户端水合完成后处理章节过滤逻辑
    if (isHydrated) {
      // 如果用户有偏好且偏好不为空，则根据偏好过滤章节
      if (user?.preferences?.interests && user.preferences.interests.length > 0) {
        const filteredChapters = mockChapters.filter(chapter =>
          user.preferences.interests.includes(chapter.theme)
        )
        setChapters(filteredChapters)
      } else {
        // 如果用户没有偏好或偏好为空，显示所有章节
        setChapters(mockChapters)
      }
    }
  }, [user, isHydrated])

  const handleLessonClick = (lesson: LessonNode) => {
    if (lesson.isLocked) return

    // 根据课程类型跳转到不同页面
    switch (lesson.type) {
      case 'video':
        router.push(`/learning/video/${lesson.id}`)
        break
      case 'vtpr':
        router.push(`/learning/vtpr`)
        break
      case 'practice':
        router.push(`/learning/practice/${lesson.id}`)
        break
    }
  }

  const getThemeColors = (theme: 'travel' | 'movie' | 'workplace') => {
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
    }
  }

  const getLessonIcon = (type: 'video' | 'vtpr' | 'practice') => {
    switch (type) {
      case 'video':
        return '🎬'
      case 'vtpr':
        return '🎧'
      case 'practice':
        return '✏️'
    }
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-medium text-primary-900">
                  学习地图
                </h1>
                <p className="text-neutral-600 mt-1">
                  选择你感兴趣的主题，开始学习之旅
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-neutral-600">总体进度</p>
                  <p className="text-lg font-medium text-primary-900">
                    {isHydrated && chapters.length > 0
                      ? Math.round(chapters.reduce((acc, ch) => acc + ch.progress, 0) / chapters.length)
                      : 38
                    }%
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setShowSpeakingTips(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-accent-50 to-primary-50 border-accent-200 text-accent-700 hover:from-accent-100 hover:to-primary-100"
                >
                  <span className="text-lg">💡</span>
                  <span>说话技巧</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>个人中心</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 章节列表 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：章节卡片 */}
            <div className="lg:col-span-1 space-y-6">
              <h2 className="text-lg font-medium text-neutral-800">
                学习章节
              </h2>
              
              {chapters.map((chapter) => {
                const colors = getThemeColors(chapter.theme)
                const isSelected = selectedChapter?.id === chapter.id
                
                return (
                  <Card
                    key={chapter.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'
                    } ${colors.bg} ${colors.border} border-2`}
                    onClick={() => setSelectedChapter(chapter)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-medium ${colors.text}`}>
                          {chapter.title}
                        </h3>
                        <div className={`w-3 h-3 rounded-full ${colors.accent}`} />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <Progress 
                          value={chapter.progress} 
                          className="h-2"
                          variant={chapter.progress > 0 ? 'default' : 'default'}
                        />
                        
                        <div className="flex justify-between text-sm text-neutral-600">
                          <span>{chapter.completedLessons}/{chapter.totalLessons} 课程</span>
                          <span>{chapter.progress}% 完成</span>
                        </div>
                        
                        {chapter.progress > 0 && (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              // 找到下一个未完成的课程
                              const nextLesson = chapter.lessons.find(lesson => !lesson.isCompleted && !lesson.isLocked)
                              if (nextLesson) {
                                handleLessonClick(nextLesson)
                              }
                            }}
                          >
                            继续学习
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* 右侧：学习路径图 */}
            <div className="lg:col-span-2">
              {selectedChapter ? (
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-neutral-800">
                        {selectedChapter.title} - 学习路径
                      </h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-neutral-600">
                          {selectedChapter.completedLessons}/{selectedChapter.totalLessons} 完成
                        </span>
                        <Progress value={selectedChapter.progress} className="w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {/* 课程节点图 */}
                    <div className="relative bg-neutral-50 rounded-lg p-8 min-h-96 overflow-auto">
                      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                        {/* 绘制连接线 */}
                        {selectedChapter.lessons.map((lesson, index) => {
                          const nextLesson = selectedChapter.lessons[index + 1]
                          if (!nextLesson) return null
                          
                          return (
                            <line
                              key={`line-${lesson.id}`}
                              x1={lesson.position.x + 20}
                              y1={lesson.position.y + 20}
                              x2={nextLesson.position.x + 20}
                              y2={nextLesson.position.y + 20}
                              stroke={lesson.isCompleted ? '#4caf50' : '#d1d5db'}
                              strokeWidth="2"
                              strokeDasharray={lesson.isCompleted ? '0' : '5,5'}
                            />
                          )
                        })}
                      </svg>
                      
                      {/* 课程节点 */}
                      {selectedChapter.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 ${
                            lesson.isCompleted
                              ? 'bg-success-500 text-white shadow-lg'
                              : lesson.isLocked
                              ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                              : 'bg-white border-4 border-primary-500 text-primary-600 hover:shadow-lg hover:scale-110'
                          }`}
                          style={{ 
                            left: lesson.position.x, 
                            top: lesson.position.y,
                            zIndex: 2
                          }}
                          onClick={() => handleLessonClick(lesson)}
                          title={lesson.title}
                        >
                          {lesson.isCompleted ? (
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : lesson.isLocked ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            getLessonIcon(lesson.type)
                          )}
                        </div>
                      ))}
                      
                      {/* 课程信息卡片 */}
                      {selectedChapter.lessons.map((lesson) => (
                        <div
                          key={`info-${lesson.id}`}
                          className="absolute bg-white rounded-lg shadow-sm border border-neutral-200 p-3 text-center min-w-24"
                          style={{ 
                            left: lesson.position.x - 20, 
                            top: lesson.position.y + 80,
                            zIndex: 2
                          }}
                        >
                          <p className="text-xs font-medium text-neutral-800 mb-1">
                            {lesson.title}
                          </p>
                          {lesson.progress > 0 && lesson.progress < 100 && (
                            <div className="w-full bg-neutral-200 rounded-full h-1">
                              <div 
                                className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${lesson.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center py-16">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-neutral-800 mb-2">
                      选择一个章节开始学习
                    </h3>
                    <p className="text-neutral-600">
                      点击左侧的章节卡片查看详细的学习路径
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Speaking Tips Modal */}
      <SpeakingTips
        isOpen={showSpeakingTips}
        onClose={() => setShowSpeakingTips(false)}
      />
    </MainLayout>
  )
}
