'use client'

// 禁用静态生成
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAnalytics, usePageAnalytics } from '@/hooks/useAnalytics'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuthStore()
  const { trackButtonClick, trackFunnelStep } = useAnalytics()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  // 页面访问跟踪
  usePageAnalytics('/auth/register', {
    source: 'register_page'
  })

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '姓名至少需要2个字符'
    }

    if (!formData.email) {
      newErrors.email = '请输入邮箱地址'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.password) {
      newErrors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      newErrors.password = '密码至少需要6个字符'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    // 跟踪注册尝试
    trackButtonClick('register_submit', 'register_page')
    trackFunnelStep('REGISTER_ATTEMPT', true, {
      email: formData.email,
      hasName: !!formData.name
    })

    try {
      const success = await register(formData.email, formData.password, formData.name)
      
      if (success) {
        // 注册成功，跳转到onboarding
        trackFunnelStep('REGISTER_SUCCESS', true, {
          email: formData.email
        })
        router.push('/onboarding')
      } else {
        setErrors({
          general: '注册失败，请检查信息是否正确或稍后重试'
        })
        trackFunnelStep('REGISTER_FAILURE', false, {
          error: 'registration_failed'
        })
      }
    } catch (error) {
      setErrors({
        general: '注册过程中发生错误，请稍后重试'
      })
      trackFunnelStep('REGISTER_ERROR', false, {
        error: 'network_error'
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
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
                    创建账户
                  </h1>
                  <p className="text-neutral-600 mt-2">
                    加入开芯说，开始你的语言学习之旅
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    姓名
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="请输入你的姓名"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="请输入邮箱地址"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    密码
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="请输入密码（至少6个字符）"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                    确认密码
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-300'
                    }`}
                    placeholder="请再次输入密码"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? '注册中...' : '创建账户'}
                </Button>
              </form>

              <div className="text-center text-sm text-neutral-600">
                已有账户？{' '}
                <Link
                  href="/auth/login"
                  className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  立即登录
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
