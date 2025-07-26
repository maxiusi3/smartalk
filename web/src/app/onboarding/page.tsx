import Link from 'next/link'

// 禁用静态生成
export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            欢迎来到 SmarTalk
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            开始您的智能英语学习之旅
          </p>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                选择您的学习兴趣
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/story-preview/travel"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl mb-2">✈️</div>
                  <h3 className="font-semibold">旅行探索</h3>
                  <p className="text-sm text-gray-600">在旅途中学习英语</p>
                </Link>

                <Link
                  href="/story-preview/movie"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl mb-2">🎬</div>
                  <h3 className="font-semibold">电影世界</h3>
                  <p className="text-sm text-gray-600">通过电影学习英语</p>
                </Link>

                <Link
                  href="/story-preview/workplace"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="text-3xl mb-2">💼</div>
                  <h3 className="font-semibold">职场商务</h3>
                  <p className="text-sm text-gray-600">掌握商务英语</p>
                </Link>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回首页
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                登录账号
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  const handleInterestSelect = (interestId: string) => {
    setSelectedInterest(interestId) // 直接设置选中的兴趣
  }

  const handleNext = async () => {
    if (currentStep === 1) {
      if (!selectedInterest) {
        alert('请选择一个感兴趣的主题')
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setIsLoading(true)

      try {
        const success = await updateUserPreferences({
          interests: selectedInterest, // 传递单个兴趣值
          level: 'beginner',
          language: 'zh-CN'
        })

        if (success) {
          // 设置当前兴趣主题
          setCurrentInterest(selectedInterest as any)

          // 跳转到选择的兴趣的故事预览页面
          router.push(`/story-preview/${selectedInterest}`)
        } else {
          alert('设置失败，请重试')
        }
      } catch (error) {
        alert('设置失败，请重试')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 rounded ${
                currentStep >= 2 ? 'bg-primary-600' : 'bg-neutral-200'
              }`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-500'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Step 1: Interest Selection */}
          {currentStep === 1 && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-medium text-primary-900">
                  选择你感兴趣的主题
                </h1>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  我们将根据你的兴趣为你推荐最适合的学习内容，让学习变得更有趣
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {interests.map((interest) => (
                  <Card
                    key={interest.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedInterest === interest.id
                        ? 'ring-2 ring-primary-500 shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleInterestSelect(interest.id)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className={`w-16 h-16 rounded-2xl ${interest.bgColor} flex items-center justify-center mx-auto transition-colors duration-300`}>
                        <span className="text-2xl">{interest.icon}</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className={`text-xl font-medium ${interest.color}`}>
                          {interest.title}
                        </h3>
                        <p className="text-neutral-600 text-sm leading-relaxed">
                          {interest.description}
                        </p>
                      </div>
                      {/* Radio button indicator */}
                      <div className="flex justify-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                          selectedInterest === interest.id
                            ? 'border-primary-600 bg-primary-600'
                            : 'border-neutral-300'
                        }`}>
                          {selectedInterest === interest.id && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!selectedInterest}
                  className="px-8 py-4 text-lg"
                >
                  下一步
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Welcome & Confirmation */}
          {currentStep === 2 && (
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-medium text-primary-900">
                  欢迎来到开芯说！
                </h1>
                <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                  你已经选择了感兴趣的主题，我们将为你量身定制学习内容
                </p>
              </div>

              <div className="flex justify-center">
                {(() => {
                  const interest = interests.find(i => i.id === selectedInterest)
                  return interest ? (
                    <div
                      className={`px-6 py-3 rounded-full ${interest.bgColor} ${interest.color} font-medium text-lg`}
                    >
                      {interest.icon} {interest.title}
                    </div>
                  ) : null
                })()}
              </div>

              <div className="space-y-4">
                <p className="text-neutral-600">
                  准备好开始你的语言学习之旅了吗？
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="px-6 py-3"
                  >
                    返回修改
                  </Button>
                  
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={isLoading}
                    className="px-8 py-3 text-lg"
                  >
                    {isLoading ? '设置中...' : '开始学习'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
