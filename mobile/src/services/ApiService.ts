import axios, {AxiosInstance, AxiosResponse, AxiosError} from 'axios';
import NetInfo from '@react-native-community/netinfo';
import {
  ApiResponse,
  User,
  CreateUserRequest,
  Interest,
  Drama,
  Keyword,
  UserProgress,
  UpdateProgressRequest,
  RecordEventRequest,
  HealthResponse,
} from '@/types/api';
import { ContentCacheService } from './ContentCacheService';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ErrorHandler } from '@/utils/ErrorHandler';

class ApiServiceClass {
  private api: AxiosInstance;
  private baseURL: string;
  private networkState: any = null;
  private requestQueue: Array<() => Promise<any>> = [];
  private isOnline: boolean = true;
  private retryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryCondition: (error: AxiosError) => {
      return !error.response || error.response.status >= 500;
    }
  };

  constructor() {
    // 开发环境API地址
    this.baseURL = __DEV__ 
      ? 'http://localhost:3001/api/v1' 
      : 'https://api.smartalk.app/api/v1';

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: this.getTimeoutForNetwork(),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    this.setupInterceptors();
    this.setupNetworkMonitoring();
  }

  /**
   * Get appropriate timeout based on network conditions
   */
  private getTimeoutForNetwork(): number {
    if (this.networkState?.type === 'wifi') {
      return 10000; // 10s on WiFi
    } else if (this.networkState?.type === 'cellular') {
      return 20000; // 20s on cellular
    }
    return 15000; // 15s default
  }

  // 初始化API服务
  initialize() {
    console.log('🔗 API Service initialized with base URL:', this.baseURL);
  }

  // 设置网络监控
  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      this.networkState = state;
      this.isOnline = state.isConnected ?? true;
      
      if (this.isOnline && this.requestQueue.length > 0) {
        // Process queued requests when back online
        this.processRequestQueue();
      }
    });
  }

  // 处理离线请求队列
  private async processRequestQueue() {
    const queue = [...this.requestQueue];
    this.requestQueue = [];
    
    for (const request of queue) {
      try {
        await request();
      } catch (error) {
        console.error('Queued request failed:', error);
      }
    }
  }

  // 设置请求和响应拦截器
  private setupInterceptors() {
    // 请求拦截器 - 添加性能监控
    this.api.interceptors.request.use(
      (config) => {
        // Start performance tracking
        const requestId = `${config.method}_${config.url}_${Date.now()}`;
        config.metadata = { requestId, startTime: Date.now() };
        
        PerformanceMonitor.startMetric(`api_request_${requestId}`);
        console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('📤 Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 添加性能监控和重试逻辑
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        // Track performance
        const { requestId, startTime } = response.config.metadata || {};
        if (requestId && startTime) {
          const duration = Date.now() - startTime;
          PerformanceMonitor.endMetric(`api_request_${requestId}`, {
            status: response.status,
            url: response.config.url,
            method: response.config.method,
          });
          
          // Track network performance
          PerformanceMonitor.trackNetworkRequest(
            response.config.url || '',
            response.config.method?.toUpperCase() || 'GET',
            startTime,
            Date.now(),
            response.status,
            JSON.stringify(response.data).length
          );
        }
        
        console.log(`📥 API Response: ${response.status} ${response.config.url} (${Date.now() - (response.config.metadata?.startTime || Date.now())}ms)`);
        return response;
      },
      async (error: AxiosError) => {
        // Track failed request performance
        const { requestId, startTime } = error.config?.metadata || {};
        if (requestId && startTime) {
          PerformanceMonitor.endMetric(`api_request_${requestId}`, {
            error: true,
            status: error.response?.status,
            url: error.config?.url,
            method: error.config?.method,
          });
        }
        
        console.error('📥 Response Error:', error.response?.status, error.message);
        
        // Implement retry logic
        const shouldRetry = this.shouldRetryRequest(error);
        if (shouldRetry && error.config) {
          return this.retryRequest(error.config);
        }
        
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Check if request should be retried
   */
  private shouldRetryRequest(error: AxiosError): boolean {
    if (!error.config || (error.config as any).__retryCount >= this.retryConfig.maxRetries) {
      return false;
    }
    
    return this.retryConfig.retryCondition(error);
  }

  /**
   * Retry failed request with exponential backoff
   */
  private async retryRequest(config: any): Promise<AxiosResponse> {
    config.__retryCount = config.__retryCount || 0;
    config.__retryCount++;
    
    const delay = this.retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1);
    
    console.log(`🔄 Retrying request (${config.__retryCount}/${this.retryConfig.maxRetries}) after ${delay}ms: ${config.url}`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.api.request(config);
  }

  // 错误处理
  private handleError(error: AxiosError): Error {
    // Use enhanced error handler
    return ErrorHandler.handleApiError(error, {
      showAlert: false,
      trackError: true,
      context: 'api_service',
    });
  }

  // 健康检查
  async checkHealth(): Promise<HealthResponse> {
    const response = await this.api.get<ApiResponse<HealthResponse>>('/health');
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('Health check failed');
  }

  // 用户管理
  async createAnonymousUser(deviceId: string): Promise<User> {
    const request: CreateUserRequest = {deviceId};
    const response = await this.api.post<ApiResponse<{user: User}>>('/users/anonymous', request);
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    throw new Error('Failed to create user');
  }

  async getUserProgress(userId: string, dramaId: string): Promise<UserProgress[]> {
    const response = await this.api.get<ApiResponse<{progress: UserProgress[]}>>(`/users/${userId}/progress/${dramaId}`);

    if (response.data.success && response.data.data) {
      return response.data.data.progress;
    }
    throw new Error('Failed to get user progress');
  }

  // 解锁关键词进度
  async unlockProgress(request: UpdateProgressRequest): Promise<UserProgress> {
    const response = await this.api.post<ApiResponse<{progress: UserProgress}>>('/progress/unlock', request);
    
    if (response.data.success && response.data.data) {
      return response.data.data.progress;
    }
    throw new Error('Failed to unlock progress');
  }

  // 内容管理 - 带智能缓存
  async getInterests(): Promise<Interest[]> {
    const cacheKey = 'interests';
    
    // Try cache first
    const cached = await ContentCacheService.get<Interest[]>(cacheKey);
    if (cached) {
      console.log('📦 Using cached interests');
      return cached;
    }

    // Fetch from network
    const response = await this.api.get<ApiResponse<{interests: Interest[]}>>('/interests');
    
    if (response.data.success && response.data.data) {
      const interests = response.data.data.interests;
      
      // Cache for 24 hours
      await ContentCacheService.set(cacheKey, interests, 24 * 60 * 60 * 1000);
      
      return interests;
    }
    throw new Error('Failed to get interests');
  }

  async getDramasByInterest(interestId: string): Promise<Drama[]> {
    const cacheKey = `dramas_interest_${interestId}`;
    
    // Try cache first
    const cached = await ContentCacheService.get<Drama[]>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached dramas for interest ${interestId}`);
      return cached;
    }

    // Fetch from network
    const response = await this.api.get<ApiResponse<{dramas: Drama[]}>>(`/dramas/by-interest/${interestId}`);
    
    if (response.data.success && response.data.data) {
      const dramas = response.data.data.dramas;
      
      // Cache for 12 hours
      await ContentCacheService.set(cacheKey, dramas, 12 * 60 * 60 * 1000);
      
      return dramas;
    }
    throw new Error('Failed to get dramas');
  }

  async getDramaKeywords(dramaId: string): Promise<Keyword[]> {
    const cacheKey = `keywords_${dramaId}`;

    // Try cache first
    const cached = await ContentCacheService.get<Keyword[]>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached keywords for drama ${dramaId}`);
      return cached;
    }

    // Fetch from network
    const response = await this.api.get<ApiResponse<{keywords: Keyword[]}>>(`/dramas/${dramaId}/keywords`);

    if (response.data.success && response.data.data) {
      const keywords = response.data.data.keywords;

      // Cache for 6 hours
      await ContentCacheService.set(cacheKey, keywords, 6 * 60 * 60 * 1000);

      return keywords;
    }
    throw new Error('Failed to get keywords');
  }

  async getDrama(dramaId: string): Promise<Drama> {
    const cacheKey = `drama_${dramaId}`;

    // Try cache first
    const cached = await ContentCacheService.get<Drama>(cacheKey);
    if (cached) {
      console.log(`📦 Using cached drama ${dramaId}`);
      return cached;
    }

    // Fetch from network
    const response = await this.api.get<ApiResponse<{drama: Drama}>>(`/dramas/${dramaId}`);

    if (response.data.success && response.data.data) {
      const drama = response.data.data.drama;

      // Cache for 12 hours
      await ContentCacheService.set(cacheKey, drama, 12 * 60 * 60 * 1000);

      return drama;
    }
    throw new Error('Failed to get drama');
  }

  // 进度管理
  async updateProgress(request: UpdateProgressRequest): Promise<UserProgress> {
    const response = await this.api.post<ApiResponse<{progress: UserProgress}>>('/progress/unlock', request);
    
    if (response.data.success && response.data.data) {
      return response.data.data.progress;
    }
    throw new Error('Failed to update progress');
  }

  // 分析事件
  async recordEvent(request: RecordEventRequest): Promise<void> {
    const response = await this.api.post<ApiResponse<any>>('/analytics/events', request);
    
    if (!response.data.success) {
      throw new Error('Failed to record event');
    }
  }

  // 通用POST方法（用于Analytics服务）
  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  // 通用GET方法
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }
}

// 导出单例实例
export const ApiService = new ApiServiceClass();
