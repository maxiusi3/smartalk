import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">SmarTalk</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                href="/onboarding"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                开始学习
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                SmarTalk
              </h1>
              <p className="text-xl sm:text-2xl text-gray-700 font-light">
                智能英语学习平台
              </p>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                通过故事化学习和智能分析，提升英语口语和听力能力
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/onboarding"
                className="inline-block w-full sm:w-auto px-8 py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <span className="mr-2">🚀</span>
                免费开始学习
              </Link>

              <Link
                href="/auth/login"
                className="inline-block w-full sm:w-auto px-8 py-4 text-lg border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 text-center"
              >
                已有账号登录
              </Link>
            </div>

          {/* Features Section */}
          <div className="mt-16 space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🧠 智能学习方法
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                通过科学的学习方法，让您的英语学习更高效、更有趣
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4 text-center">🎬</div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                  故事化学习
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  通过有趣的故事情节，在真实语境中学习英语，
                  让学习过程更加生动有趣。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4 text-center">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                  智能分析
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  AI 智能分析您的学习进度，提供个性化的学习建议，
                  帮助您更快提升英语水平。
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-4xl mb-4 text-center">✨</div>
                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                  互动练习
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  丰富的互动练习和即时反馈，让您在实践中
                  掌握英语口语和听力技能。
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">快速导航</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/stories"
                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                浏览故事
              </Link>
              <Link
                href="/learning"
                className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                学习中心
              </Link>
              <Link
                href="/api/health"
                className="px-4 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
              >
                系统状态
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
