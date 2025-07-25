'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { useAnalytics, usePageAnalytics } from '@/hooks/useAnalytics'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  const { trackFunnelStep, trackButtonClick } = useAnalytics()
  const [isClient, setIsClient] = useState(false)

  // 确保组件在客户端渲染后才执行客户端逻辑
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 使用 useMemo 优化页面分析数据，避免不必要的重新渲染
  const pageAnalyticsData = useMemo(() => ({
    isAuthenticated,
    hasCompletedOnboarding: !!user?.preferences?.interests // 改为检查字符串是否存在
  }), [isAuthenticated, user?.preferences?.interests])

  // 页面访问跟踪
  usePageAnalytics('/', pageAnalyticsData)

  useEffect(() => {
    // 只在客户端执行重定向逻辑，避免水合不匹配
    if (!isClient) return

    // 如果用户已登录，根据用户状态决定跳转
    if (isAuthenticated && user) {
      if (!user.preferences?.interests) {
        // 用户还没有选择兴趣，跳转到引导流程
        router.push('/onboarding')
      } else {
        // 用户已完成兴趣选择，进入核心学习流程
        // 根据需求文档，应该先观看故事预告片，然后进行故事线索收集
        const selectedInterest = user.preferences.interests
        router.push(`/story-preview/${selectedInterest}`)
      }
    }
  }, [isClient, isAuthenticated, user, router])

  const handleGetStarted = () => {
    // 跟踪CTA点击
    trackButtonClick('hero_cta_get_started', 'homepage')
    trackFunnelStep('HERO_CTA_CLICK', true, {
      isAuthenticated,
      hasCompletedOnboarding: !!user?.preferences?.interests
    })

    router.push('/onboarding')
  }

  const handleLogin = () => {
    trackButtonClick('login_button', 'homepage')
    router.push('/auth/login')
  }

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-primary-900 leading-tight">
                开芯说
              </h1>
              <p className="text-xl sm:text-2xl text-primary-700 font-light">
                神经沉浸法语言学习
              </p>
            </div>

            {/* Pain Point Hook */}
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-sm font-medium mb-4">
                <span className="mr-2">⚠️</span>
                还在为"哑巴英语"而苦恼吗？
              </div>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                传统学习方法让你背了无数单词，却在真实场景中开不了口？
              </p>
            </div>

            <div className="space-y-6">
              <p className="text-lg text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                通过<strong className="text-primary-700">故事线索收集</strong>和<strong className="text-accent-600">无字幕验证</strong>，
                让你的大脑建立自然的语言神经连接，<br/>
                <span className="text-xl font-medium text-primary-800">体验语言学习的魔法时刻！</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto px-8 py-4 text-lg bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <span className="mr-2">🚀</span>
                  免费体验魔法时刻
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLogin}
                  className="w-full sm:w-auto px-8 py-4 text-lg border-2 border-primary-200 text-primary-700 hover:bg-primary-50 rounded-xl transition-all duration-300"
                >
                  已有账号登录
                </Button>
              </div>
            </div>

            {/* How It Works - Neural Immersion Method */}
            <div className="mt-16 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  🧠 神经沉浸法是如何工作的？
                </h2>
                <p className="text-neutral-600 max-w-3xl mx-auto">
                  不同于传统的死记硬背，我们通过科学的三步法让你的大脑自然建立语言神经连接
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-neutral-100">
                  <div className="text-4xl mb-4 text-center">🎬</div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-3 text-center">
                    1. 故事沉浸
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    观看1分钟迷你剧，15个关键词汇在字幕中高亮显示。
                    你的大脑开始在真实情境中理解语言，而不是孤立的单词。
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-neutral-100">
                  <div className="text-4xl mb-4 text-center">🔍</div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-3 text-center">
                    2. 线索收集
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    通过音-画匹配训练收集15个故事线索。
                    每次正确匹配都在强化你的语言神经连接，建立自然的语言思维。
                  </p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-neutral-100">
                  <div className="text-4xl mb-4 text-center">✨</div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-3 text-center">
                    3. 魔法时刻
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    无字幕观看完整故事，你会惊喜地发现自己完全能够理解！
                    这就是神经沉浸法的魔法——自然的语言理解能力。
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof & CTA */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-success-50 border border-success-200 rounded-full text-success-800 text-sm font-medium mb-4">
                <span className="mr-2">🌟</span>
                已有 10,000+ 学习者体验了语言学习的魔法时刻
              </div>
              <p className="text-neutral-500 text-sm">
                平均学习时长 25 分钟 | 平均完成率 87% | 用户满意度 4.8/5
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
