'use client'

// 禁用静态生成
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

interface PracticeQuestion {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'translation'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  hint?: string
}

interface PracticeLesson {
  id: string
  title: string
  description: string
  questions: PracticeQuestion[]
  passingScore: number
}

// 模拟数据 - 根据lessonId获取对应练习
const getPracticeData = (lessonId: string): PracticeLesson => {
  const practices: Record<string, PracticeLesson> = {
    'lesson-1': {
      id: 'lesson-1',
      title: '机场办理登机手续 - 练习',
      description: '通过练习巩固机场办理登机手续的英语表达',
      passingScore: 80,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: '当你想办理登机手续时，应该说：',
          options: [
            "I'd like to check in for my flight",
            "I want to buy a ticket",
            "Where is the bathroom?",
            "Can I have some water?"
          ],
          correctAnswer: "I'd like to check in for my flight",
          explanation: '办理登机手续的标准表达是 "I\'d like to check in for my flight"'
        },
        {
          id: 'q2',
          type: 'fill-blank',
          question: '请填空：Do you have any _____ to check?',
          correctAnswer: 'bags',
          explanation: '这句话询问是否有行李需要托运，空格应填入 "bags"',
          hint: '提示：询问行李托运'
        },
        {
          id: 'q3',
          type: 'translation',
          question: '请翻译：这是您的登机牌',
          correctAnswer: "Here's your boarding pass",
          explanation: '"这是您的登机牌" 的英文表达是 "Here\'s your boarding pass"'
        },
        {
          id: 'q4',
          type: 'multiple-choice',
          question: '登机口的英文是：',
          options: [
            'Gate',
            'Door',
            'Window',
            'Counter'
          ],
          correctAnswer: 'Gate',
          explanation: '登机口的英文是 "Gate"'
        }
      ]
    },
    'lesson-2': {
      id: 'lesson-2',
      title: '安检流程 - 练习',
      description: '练习机场安检相关的英语对话',
      passingScore: 80,
      questions: [
        {
          id: 'q1',
          type: 'multiple-choice',
          question: '安检人员要求你脱鞋时会说：',
          options: [
            'Please remove your shoes',
            'Please put on your shoes',
            'Please buy new shoes',
            'Please clean your shoes'
          ],
          correctAnswer: 'Please remove your shoes',
          explanation: '"Please remove your shoes" 是要求脱鞋的标准表达'
        },
        {
          id: 'q2',
          type: 'fill-blank',
          question: '请填空：Put your laptop in a _____ bin',
          correctAnswer: 'separate',
          explanation: '笔记本电脑需要单独放在托盘里，所以是 "separate bin"'
        }
      ]
    }
  }

  return practices[lessonId] || practices['lesson-1']
}

export default function PracticeLessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params.lessonId as string
  
  const [lesson] = useState<PracticeLesson>(() => getPracticeData(lessonId))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  const currentQuestion = lesson.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / lesson.questions.length) * 100

  const handleAnswerSelect = (answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < lesson.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowResult(false)
    } else {
      // 计算最终分数
      const correctAnswers = lesson.questions.filter(
        q => userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      ).length
      
      const finalScore = Math.round((correctAnswers / lesson.questions.length) * 100)
      setScore(finalScore)
      setIsCompleted(true)
    }
  }

  const handleSubmitAnswer = () => {
    setShowResult(true)
  }

  const handleRetry = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers({})
    setShowResult(false)
    setIsCompleted(false)
    setScore(0)
  }

  const handleFinish = () => {
    router.push('/learning')
  }

  const isCorrect = userAnswers[currentQuestion.id]?.toLowerCase().trim() === 
                   currentQuestion.correctAnswer.toLowerCase().trim()

  if (isCompleted) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                    score >= lesson.passingScore ? 'bg-success-100' : 'bg-red-100'
                  }`}>
                    {score >= lesson.passingScore ? (
                      <svg className="w-10 h-10 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-medium text-neutral-800 mb-2">
                      练习完成！
                    </h1>
                    <p className="text-xl text-neutral-600">
                      您的得分：{score} 分
                    </p>
                    <p className="text-neutral-500 mt-2">
                      {score >= lesson.passingScore ? '恭喜通过！' : `需要 ${lesson.passingScore} 分才能通过`}
                    </p>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-6">
                    <h3 className="font-medium text-neutral-800 mb-4">练习总结</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">总题数</p>
                        <p className="font-medium">{lesson.questions.length}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">正确答案</p>
                        <p className="font-medium text-success-600">
                          {lesson.questions.filter(q => 
                            userAnswers[q.id]?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
                          ).length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {score < lesson.passingScore && (
                      <Button
                        variant="outline"
                        onClick={handleRetry}
                        className="px-8"
                      >
                        重新练习
                      </Button>
                    )}
                    
                    <Button
                      onClick={handleFinish}
                      className="px-8"
                    >
                      返回学习地图
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <p className="text-sm text-neutral-600">练习模式</p>
                <p className="font-medium text-neutral-800">
                  题目 {currentQuestionIndex + 1} / {lesson.questions.length}
                </p>
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

          {/* Question Card */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-medium text-neutral-800 mb-6">
                {currentQuestion.question}
              </h2>

              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-4 text-left rounded-lg border transition-all duration-200 ${
                        userAnswers[currentQuestion.id] === option
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white'
                      } ${
                        showResult && option === currentQuestion.correctAnswer
                          ? 'border-success-500 bg-success-50'
                          : showResult && userAnswers[currentQuestion.id] === option && !isCorrect
                          ? 'border-red-500 bg-red-50'
                          : ''
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {(currentQuestion.type === 'fill-blank' || currentQuestion.type === 'translation') && (
                <div className="space-y-4">
                  {currentQuestion.hint && (
                    <p className="text-sm text-neutral-500 italic">
                      {currentQuestion.hint}
                    </p>
                  )}
                  <Input
                    placeholder="请输入您的答案..."
                    value={userAnswers[currentQuestion.id] || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    className="text-lg p-4"
                    disabled={showResult}
                  />
                </div>
              )}

              {/* Result Feedback */}
              {showResult && (
                <div className={`mt-6 p-4 rounded-lg ${
                  isCorrect ? 'bg-success-50 border border-success-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-success-500' : 'bg-red-500'
                    }`}>
                      {isCorrect ? (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isCorrect ? 'text-success-800' : 'text-red-800'}`}>
                        {isCorrect ? '回答正确！' : '回答错误'}
                      </p>
                      {!isCorrect && (
                        <p className="text-red-700 mt-1">
                          正确答案：{currentQuestion.correctAnswer}
                        </p>
                      )}
                      <p className="text-neutral-700 mt-2">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center">
            {!showResult ? (
              <Button
                size="lg"
                onClick={handleSubmitAnswer}
                disabled={!userAnswers[currentQuestion.id]}
                className="px-8"
              >
                提交答案
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleNext}
                className="px-8"
              >
                {currentQuestionIndex < lesson.questions.length - 1 ? '下一题' : '查看结果'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
