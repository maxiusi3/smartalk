// API客户端 - 模拟后端服务（开发环境）

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const USE_MOCK_API = process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_API_URL

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface User {
  id: string
  email: string
  name: string
  avatar?: string
  preferences: {
    interests: string // 改为单个兴趣值而非数组
    level: string
    language: string
  }
}

interface LearningProgress {
  userId: string
  chapterId: string
  lessonId: string
  progress: number
  completedAt?: string
  score?: number
}

interface Chapter {
  id: string
  title: string
  description: string
  interest: 'travel' | 'movie' | 'workplace'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  lessons: Lesson[]
  isLocked: boolean
}

interface Lesson {
  id: string
  title: string
  description: string
  type: 'video' | 'vtpr' | 'practice'
  videoUrl?: string
  audioUrl?: string
  subtitles?: Subtitle[]
  duration: number
  isCompleted: boolean
}

interface Subtitle {
  start: number
  end: number
  text: string
  highlight?: boolean
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private mockUser: User | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl

    // 从localStorage获取token和模拟用户数据
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
      const mockUserData = localStorage.getItem('mock_user')
      if (mockUserData) {
        try {
          this.mockUser = JSON.parse(mockUserData)
        } catch (error) {
          console.error('Failed to parse mock user data:', error)
        }
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // 在开发环境使用模拟API
    if (USE_MOCK_API) {
      return this.mockRequest<T>(endpoint, options)
    }

    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 合并传入的headers
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络错误',
      }
    }
  }

  // 模拟API请求
  private async mockRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200))

    const method = options.method || 'GET'
    const body = options.body ? JSON.parse(options.body as string) : null

    try {
      // 处理不同的API端点
      switch (true) {
        case endpoint === '/auth/login':
          return this.mockLogin(body.email, body.password) as Promise<ApiResponse<T>>

        case endpoint === '/auth/register':
          return this.mockRegister(body.email, body.password, body.name) as Promise<ApiResponse<T>>

        case endpoint === '/user/profile':
          return this.mockGetCurrentUser() as Promise<ApiResponse<T>>

        case endpoint === '/user/preferences' && method === 'PUT':
          return this.mockUpdateUserPreferences(body) as Promise<ApiResponse<T>>

        case endpoint === '/chapters':
          return this.mockGetChapters() as Promise<ApiResponse<T>>

        default:
          return {
            success: false,
            error: `Mock API endpoint not implemented: ${method} ${endpoint}`,
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '模拟API错误',
      }
    }
  }

  // 模拟API方法实现
  private async mockLogin(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    // 简单的模拟登录验证
    if (email && password) {
      const user: User = {
        id: 'mock-user-' + Date.now(),
        email,
        name: email.split('@')[0],
        preferences: {
          interests: '', // 改为空字符串
          level: 'beginner',
          language: 'zh-CN'
        }
      }

      const token = 'mock-token-' + Date.now()

      this.mockUser = user
      this.token = token

      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(user))
        localStorage.setItem('auth_token', token)
      }

      return {
        success: true,
        data: { user, token }
      }
    }

    return {
      success: false,
      error: '邮箱或密码不能为空'
    }
  }

  private async mockRegister(email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> {
    if (email && password && name) {
      const user: User = {
        id: 'mock-user-' + Date.now(),
        email,
        name,
        preferences: {
          interests: '', // 改为空字符串
          level: 'beginner',
          language: 'zh-CN'
        }
      }

      const token = 'mock-token-' + Date.now()

      this.mockUser = user
      this.token = token

      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(user))
        localStorage.setItem('auth_token', token)
      }

      return {
        success: true,
        data: { user, token }
      }
    }

    return {
      success: false,
      error: '所有字段都是必填的'
    }
  }

  private async mockGetCurrentUser(): Promise<ApiResponse<User>> {
    if (this.mockUser) {
      return {
        success: true,
        data: this.mockUser
      }
    }

    return {
      success: false,
      error: '用户未登录'
    }
  }

  private async mockUpdateUserPreferences(preferences: Partial<User['preferences']>): Promise<ApiResponse<User>> {
    // 创建一个临时用户如果不存在
    if (!this.mockUser) {
      this.mockUser = {
        id: 'guest-user-' + Date.now(),
        email: 'guest@example.com',
        name: '访客用户',
        preferences: {
          interests: '', // 改为空字符串
          level: 'beginner',
          language: 'zh-CN'
        }
      }
    }

    // 更新用户偏好
    this.mockUser.preferences = {
      ...this.mockUser.preferences,
      ...preferences
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(this.mockUser))
    }

    return {
      success: true,
      data: this.mockUser
    }
  }

  private async mockGetChapters(): Promise<ApiResponse<Chapter[]>> {
    // 模拟章节数据
    const chapters: Chapter[] = [
      {
        id: 'travel-1',
        title: '机场问路',
        description: '学习在机场如何问路和寻求帮助',
        interest: 'travel',
        difficulty: 'beginner',
        lessons: [],
        isLocked: false
      },
      {
        id: 'movie-1',
        title: '咖啡店邂逅',
        description: '经典电影场景：在咖啡店的浪漫邂逅',
        interest: 'movie',
        difficulty: 'beginner',
        lessons: [],
        isLocked: false
      },
      {
        id: 'workplace-1',
        title: '会议讨论',
        description: '职场英语：参与会议讨论的技巧',
        interest: 'workplace',
        difficulty: 'beginner',
        lessons: [],
        isLocked: false
      }
    ]

    return {
      success: true,
      data: chapters
    }
  }

  // 认证相关
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    if (response.success && response.data) {
      this.token = response.data.token
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.data.token)
      }
    }

    return response
  }

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async logout(): Promise<void> {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // 用户相关
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/user/profile')
  }

  async updateUserPreferences(preferences: Partial<User['preferences']>): Promise<ApiResponse<User>> {
    return this.request<User>('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // 学习内容相关
  async getChapters(): Promise<ApiResponse<Chapter[]>> {
    return this.request<Chapter[]>('/chapters')
  }

  async getChapter(id: string): Promise<ApiResponse<Chapter>> {
    return this.request<Chapter>(`/chapters/${id}`)
  }

  async getLesson(chapterId: string, lessonId: string): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>(`/chapters/${chapterId}/lessons/${lessonId}`)
  }

  // 学习进度相关
  async getUserProgress(): Promise<ApiResponse<LearningProgress[]>> {
    return this.request<LearningProgress[]>('/progress')
  }

  async updateProgress(
    chapterId: string,
    lessonId: string,
    progress: number,
    score?: number
  ): Promise<ApiResponse<LearningProgress>> {
    return this.request<LearningProgress>('/progress', {
      method: 'POST',
      body: JSON.stringify({
        chapterId,
        lessonId,
        progress,
        score,
      }),
    })
  }

  async completeLesson(
    chapterId: string,
    lessonId: string,
    score: number
  ): Promise<ApiResponse<LearningProgress>> {
    return this.request<LearningProgress>('/progress/complete', {
      method: 'POST',
      body: JSON.stringify({
        chapterId,
        lessonId,
        score,
      }),
    })
  }
}

// 创建单例实例
const apiClient = new ApiClient()

export { apiClient, ApiClient }
export type { User, Chapter, Lesson, LearningProgress, Subtitle, ApiResponse }
