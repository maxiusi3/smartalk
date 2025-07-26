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

