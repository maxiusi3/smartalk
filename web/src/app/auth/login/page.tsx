import Link from 'next/link'

// 禁用静态生成
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              登录 SmarTalk
            </h1>
            <p className="text-gray-600">
              继续您的英语学习之旅
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的邮箱"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的密码"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              登录
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账号？{' '}
              <Link href="/auth/register" className="text-blue-600 hover:underline">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const success = await login(formData.email, formData.password)
      
      if (success) {
        router.push('/learning')
      } else {
        setErrors({
          general: '登录失败，请检查邮箱和密码是否正确'
        })
      }
    } catch (error) {
      setErrors({
        general: '登录过程中发生错误，请稍后重试'
      })
    }
  }

  return (
    <MainLayout showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">开</span>
                </div>
                <div>
                  <h1 className="text-2xl font-medium text-primary-900">
                    欢迎回来
                  </h1>
                  <p className="text-neutral-600 mt-2">
                    登录你的开芯说账户
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                )}

                <Input
                  label="邮箱地址"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  placeholder="请输入你的邮箱地址"
                  disabled={isLoading}
                />

                <Input
                  label="密码"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  placeholder="请输入你的密码"
                  disabled={isLoading}
                />

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-neutral-600">记住我</span>
                  </label>
                  
                  <Link
                    href="/auth/forgot-password"
                    className="text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    忘记密码？
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-neutral-500">或者</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>使用 Google 登录</span>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-center space-x-2"
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.221.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                  <span>使用微信登录</span>
                </Button>
              </div>

              <div className="text-center text-sm text-neutral-600">
                还没有账户？{' '}
                <Link
                  href="/auth/register"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  立即注册
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-neutral-500 hover:text-neutral-700 text-sm transition-colors"
            >
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
