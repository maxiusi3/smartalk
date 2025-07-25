'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface AchievementData {
  id: string
  title: string
  theme: 'travel' | 'movie' | 'workplace'
  storyTitle: string
  completionTime: string
  experienceDescription: string
  nextSteps: string[]
  stats: {
    cluesCollected: number
    totalClues: number
    accuracy: number
    timeSpent: string
  }
}

// 模拟成就数据
const mockAchievementData: Record<string, AchievementData> = {
  travel: {
    id: 'travel-achievement-1',
    title: '机场达人',
    theme: 'travel',
    storyTitle: '机场奇遇记',
    completionTime: new Date().toLocaleString('zh-CN'),
    experienceDescription: '你刚刚体验了神经沉浸法学习的完整过程。通过故事线索收集，你的大脑建立了完整的语言神经连接，最终能够无字幕理解整个故事。这就是语言学习的魔法时刻！',
    nextSteps: [
      '继续学习更多旅行主题的故事',
      '挑战更高难度的语言场景',
      '与朋友分享你的学习成果',
      '探索其他兴趣主题的内容'
    ],
    stats: {
      cluesCollected: 15,
      totalClues: 15,
      accuracy: 87,
      timeSpent: '25分钟'
    }
  },
  movie: {
    id: 'movie-achievement-1',
    title: '电影鉴赏家',
    theme: 'movie',
    storyTitle: '咖啡店邂逅',
    completionTime: new Date().toLocaleString('zh-CN'),
    experienceDescription: '恭喜你完成了一段美妙的学习旅程！你不仅学会了语言，更体验了故事的情感。神经沉浸法让你在不知不觉中掌握了自然的语言表达。',
    nextSteps: [
      '探索更多浪漫电影场景',
      '学习情感表达的高级技巧',
      '参与社区讨论分享感受',
      '尝试其他类型的故事主题'
    ],
    stats: {
      cluesCollected: 15,
      totalClues: 15,
      accuracy: 92,
      timeSpent: '22分钟'
    }
  },
  workplace: {
    id: 'workplace-achievement-1',
    title: '职场精英',
    theme: 'workplace',
    storyTitle: '项目会议',
    completionTime: new Date().toLocaleString('zh-CN'),
    experienceDescription: '出色的表现！你已经掌握了职场沟通的核心技能。通过神经沉浸法学习，你不仅学会了专业词汇，更理解了职场文化和沟通艺术。',
    nextSteps: [
      '学习更多商务沟通场景',
      '提升演讲和谈判技巧',
      '建立专业的语言表达习惯',
      '挑战跨文化商务交流'
    ],
    stats: {
      cluesCollected: 15,
      totalClues: 15,
      accuracy: 89,
      timeSpent: '28分钟'
    }
  }
}

export default function AchievementPage() {
  const router = useRouter()
  const params = useParams()
  const interest = params.interest as string

  const [achievementData, setAchievementData] = useState<AchievementData | null>(null)
  const [showCelebration, setShowCelebration] = useState(true)
  const [userFeedback, setUserFeedback] = useState('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)

  useEffect(() => {
    // 加载对应兴趣的成就数据
    const achievement = mockAchievementData[interest]
    if (achievement) {
      setAchievementData(achievement)
    } else {
      router.push('/learning')
    }
  }, [interest, router])

  useEffect(() => {
    // 庆祝动画持续3秒
    const timer = setTimeout(() => {
      setShowCelebration(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleContinueLearning = () => {
    router.push('/learning')
  }

  const handleShareAchievement = () => {
    // 分享功能
    if (navigator.share && achievementData) {
      navigator.share({
        title: `我解锁了${achievementData.storyTitle}的所有秘密！`,
        text: `通过神经沉浸法，我成功发现了${achievementData.theme === 'travel' ? '旅行' : achievementData.theme === 'movie' ? '电影' : '职场'}故事的所有线索！`,
        url: window.location.origin
      })
    } else {
      // 复制到剪贴板
      const shareText = `我刚刚在开芯说解锁了《${achievementData?.storyTitle}》的所有秘密，通过神经沉浸法成功发现了故事的所有线索！快来体验吧：${window.location.origin}`
      navigator.clipboard.writeText(shareText)
      alert('分享内容已复制到剪贴板！')
    }
  }

  const handleSubmitFeedback = () => {
    if (selectedRating && userFeedback.trim()) {
      // 提交反馈到后端
      console.log('Feedback submitted:', {
        rating: selectedRating,
        feedback: userFeedback,
        achievement: achievementData?.id
      })
      
      alert('感谢你的反馈！这将帮助我们改进学习体验。')
      setShowFeedbackForm(false)
    }
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

  if (!achievementData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">加载成就数据中...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const colors = getThemeColors(achievementData.theme)

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 relative overflow-hidden">
        {/* Celebration Animation */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse shadow-2xl`}></div>
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                  <span className="text-6xl animate-bounce">🎉</span>
                </div>
                {/* 烟花效果 */}
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-accent-400 rounded-full animate-ping"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${i * 45}deg) translateY(-60px) rotate(-${i * 45}deg)`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </div>
              <h1 className="text-5xl font-bold mb-4 animate-pulse">
                🌟 学习成就解锁！
              </h1>
              <p className="text-2xl animate-fade-in">
                恭喜完成 {achievementData.storyTitle}
              </p>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Achievement Header */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full shadow-xl`}></div>
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl">
                  {achievementData.theme === 'travel' ? '✈️' : 
                   achievementData.theme === 'movie' ? '🎬' : '💼'}
                </span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              🏆 {achievementData.title}
            </h1>
            <p className="text-xl text-neutral-600">
              《{achievementData.storyTitle}》故事线索全部发现
            </p>
            <p className="text-sm text-neutral-500 mt-2">
              完成时间：{achievementData.completionTime}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Experience Description */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center">
                  <span className="mr-3">🧠</span>
                  你的学习体验
                </h2>
                <p className="text-lg text-neutral-600 leading-relaxed">
                  {achievementData.experienceDescription}
                </p>
              </CardContent>
            </Card>

            {/* Learning Stats */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                  <span className="mr-3">📊</span>
                  学习统计
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-success-600 mb-2">
                      {achievementData.stats.cluesCollected}/{achievementData.stats.totalClues}
                    </div>
                    <div className="text-sm text-neutral-600">故事线索</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {achievementData.stats.accuracy}%
                    </div>
                    <div className="text-sm text-neutral-600">准确率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-600 mb-2">
                      {achievementData.stats.timeSpent}
                    </div>
                    <div className="text-sm text-neutral-600">学习时长</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      1
                    </div>
                    <div className="text-sm text-neutral-600">里程碑</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-6 flex items-center">
                  <span className="mr-3">🚀</span>
                  继续你的学习之旅
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementData.nextSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-neutral-700">{step}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleContinueLearning}
                className="flex items-center space-x-2 px-8 py-4"
              >
                <span>🎯</span>
                <span>继续探索更多故事</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShareAchievement}
                className="flex items-center space-x-2 px-8 py-4"
              >
                <span>📤</span>
                <span>分享我的成就</span>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFeedbackForm(true)}
                className="flex items-center space-x-2 px-8 py-4"
              >
                <span>💬</span>
                <span>分享学习感受</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Feedback Modal */}
        {showFeedbackForm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-neutral-800 mb-4">
                  分享你的学习感受
                </h3>
                
                {/* Rating */}
                <div className="mb-4">
                  <p className="text-sm text-neutral-600 mb-2">这次学习体验如何？</p>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(rating)}
                        className={`text-2xl transition-colors ${
                          selectedRating && rating <= selectedRating
                            ? 'text-yellow-400'
                            : 'text-neutral-300 hover:text-yellow-300'
                        }`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="mb-6">
                  <p className="text-sm text-neutral-600 mb-2">详细感受（可选）</p>
                  <textarea
                    value={userFeedback}
                    onChange={(e) => setUserFeedback(e.target.value)}
                    placeholder="分享你的学习体验、感受或建议..."
                    className="w-full h-24 p-3 border border-neutral-200 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={!selectedRating}
                    className="flex-1"
                  >
                    提交反馈
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 15 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-accent-400 rounded-full opacity-40 animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </MainLayout>
  )
}
