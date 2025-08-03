/**
 * PrivacyComplianceService - V2 隐私合规和数据管理服务
 * 提供完整的隐私保护：用户同意管理、数据导出、账户删除
 * 支持GDPR合规、应用商店政策、数据保留策略
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { AnalyticsService } from './AnalyticsService';
import LearningProgressService from './LearningProgressService';
import UserStateService from './UserStateService';

// 用户同意类型
export type ConsentType = 
  | 'analytics'          // 分析数据收集
  | 'personalization'    // 个性化推荐
  | 'marketing'          // 营销通信
  | 'crash_reporting'    // 崩溃报告
  | 'performance'        // 性能监控
  | 'location'           // 位置数据
  | 'camera'             // 摄像头访问
  | 'microphone'         // 麦克风访问
  | 'notifications'      // 推送通知
  | 'cloud_sync';        // 云端同步

// 用户同意状态
export interface UserConsent {
  userId: string;
  consents: {
    [key in ConsentType]: {
      granted: boolean;
      timestamp: string;
      version: string; // 隐私政策版本
    };
  };
  
  // 合规信息
  privacyPolicyVersion: string;
  termsOfServiceVersion: string;
  lastUpdated: string;
  
  // GDPR相关
  isEUUser: boolean;
  explicitConsentRequired: boolean;
}

// 数据导出类型
export type DataExportType = 
  | 'learning_progress'  // 学习进度数据
  | 'user_profile'       // 用户资料
  | 'settings'           // 应用设置
  | 'analytics'          // 分析数据
  | 'achievements'       // 成就数据
  | 'complete';          // 完整数据

// 数据导出请求
export interface DataExportRequest {
  requestId: string;
  userId: string;
  exportType: DataExportType;
  
  // 请求信息
  requestedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  
  // 处理信息
  processedAt?: string;
  expiresAt: string; // 下载链接过期时间
  downloadUrl?: string;
  fileSize?: number;
  
  // 错误信息
  error?: string;
}

// 账户删除请求
export interface AccountDeletionRequest {
  requestId: string;
  userId: string;
  
  // 请求信息
  requestedAt: string;
  reason?: string;
  
  // 状态管理
  status: 'pending' | 'grace_period' | 'processing' | 'completed' | 'cancelled';
  gracePeriodEndsAt: string; // 宽限期结束时间
  
  // 处理信息
  processedAt?: string;
  dataExportRequested: boolean;
  dataExportCompleted: boolean;
  
  // 恢复信息
  recoveryToken?: string;
  recoveryExpiresAt?: string;
}

// 数据保留策略
export interface DataRetentionPolicy {
  category: string;
  retentionPeriodDays: number;
  description: string;
  autoCleanup: boolean;
}

class PrivacyComplianceService {
  private static instance: PrivacyComplianceService;
  private analyticsService = AnalyticsService.getInstance();
  private learningProgressService = LearningProgressService.getInstance();
  private userStateService = UserStateService.getInstance();
  
  // 用户同意和请求管理
  private userConsents: Map<string, UserConsent> = new Map();
  private exportRequests: Map<string, DataExportRequest> = new Map();
  private deletionRequests: Map<string, AccountDeletionRequest> = new Map();
  
  // 当前政策版本
  private readonly PRIVACY_POLICY_VERSION = '2.0.0';
  private readonly TERMS_OF_SERVICE_VERSION = '2.0.0';
  
  // 存储键
  private readonly CONSENTS_KEY = 'user_consents';
  private readonly EXPORT_REQUESTS_KEY = 'export_requests';
  private readonly DELETION_REQUESTS_KEY = 'deletion_requests';
  
  // 数据保留策略
  private readonly DATA_RETENTION_POLICIES: DataRetentionPolicy[] = [
    {
      category: 'learning_progress',
      retentionPeriodDays: 1095, // 3年
      description: '学习进度和成就数据',
      autoCleanup: false,
    },
    {
      category: 'analytics',
      retentionPeriodDays: 730, // 2年
      description: '匿名使用分析数据',
      autoCleanup: true,
    },
    {
      category: 'crash_reports',
      retentionPeriodDays: 90, // 3个月
      description: '崩溃报告和错误日志',
      autoCleanup: true,
    },
    {
      category: 'temporary_files',
      retentionPeriodDays: 7, // 1周
      description: '临时文件和缓存',
      autoCleanup: true,
    },
  ];

  static getInstance(): PrivacyComplianceService {
    if (!PrivacyComplianceService.instance) {
      PrivacyComplianceService.instance = new PrivacyComplianceService();
    }
    return PrivacyComplianceService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化隐私合规服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 开始定期清理
      this.startPeriodicCleanup();
      
      this.analyticsService.track('privacy_compliance_service_initialized', {
        privacyPolicyVersion: this.PRIVACY_POLICY_VERSION,
        termsVersion: this.TERMS_OF_SERVICE_VERSION,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing privacy compliance service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载用户同意
      const consentsData = await AsyncStorage.getItem(this.CONSENTS_KEY);
      if (consentsData) {
        const consents: UserConsent[] = JSON.parse(consentsData);
        consents.forEach(consent => {
          this.userConsents.set(consent.userId, consent);
        });
      }

      // 加载导出请求
      const exportData = await AsyncStorage.getItem(this.EXPORT_REQUESTS_KEY);
      if (exportData) {
        const requests: DataExportRequest[] = JSON.parse(exportData);
        requests.forEach(request => {
          this.exportRequests.set(request.requestId, request);
        });
      }

      // 加载删除请求
      const deletionData = await AsyncStorage.getItem(this.DELETION_REQUESTS_KEY);
      if (deletionData) {
        const requests: AccountDeletionRequest[] = JSON.parse(deletionData);
        requests.forEach(request => {
          this.deletionRequests.set(request.requestId, request);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 开始定期清理
   */
  private startPeriodicCleanup(): void {
    // 每天执行一次清理
    setInterval(() => {
      this.performPeriodicCleanup();
    }, 24 * 60 * 60 * 1000);
    
    // 立即执行一次清理
    this.performPeriodicCleanup();
  }

  /**
   * 执行定期清理
   */
  private async performPeriodicCleanup(): Promise<void> {
    try {
      // 清理过期的导出请求
      await this.cleanupExpiredExportRequests();
      
      // 处理宽限期结束的删除请求
      await this.processExpiredDeletionRequests();
      
      // 执行数据保留策略
      await this.enforceDataRetentionPolicies();
      
    } catch (error) {
      console.error('Error performing periodic cleanup:', error);
    }
  }

  // ===== 用户同意管理 =====

  /**
   * 获取用户同意状态
   */
  getUserConsent(userId: string): UserConsent | null {
    return this.userConsents.get(userId) || null;
  }

  /**
   * 更新用户同意
   */
  async updateUserConsent(
    userId: string,
    consentType: ConsentType,
    granted: boolean
  ): Promise<void> {
    try {
      let userConsent = this.userConsents.get(userId);
      
      if (!userConsent) {
        userConsent = this.createDefaultConsent(userId);
      }

      // 更新特定同意
      userConsent.consents[consentType] = {
        granted,
        timestamp: new Date().toISOString(),
        version: this.PRIVACY_POLICY_VERSION,
      };
      
      userConsent.lastUpdated = new Date().toISOString();
      
      this.userConsents.set(userId, userConsent);
      await this.saveUserConsents();

      this.analyticsService.track('user_consent_updated', {
        userId,
        consentType,
        granted,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating user consent:', error);
    }
  }

  /**
   * 批量更新用户同意
   */
  async updateMultipleConsents(
    userId: string,
    consents: { [key in ConsentType]?: boolean }
  ): Promise<void> {
    try {
      let userConsent = this.userConsents.get(userId);
      
      if (!userConsent) {
        userConsent = this.createDefaultConsent(userId);
      }

      // 批量更新同意
      Object.entries(consents).forEach(([type, granted]) => {
        if (granted !== undefined) {
          userConsent!.consents[type as ConsentType] = {
            granted,
            timestamp: new Date().toISOString(),
            version: this.PRIVACY_POLICY_VERSION,
          };
        }
      });
      
      userConsent.lastUpdated = new Date().toISOString();
      
      this.userConsents.set(userId, userConsent);
      await this.saveUserConsents();

      this.analyticsService.track('multiple_consents_updated', {
        userId,
        consentTypes: Object.keys(consents),
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error updating multiple consents:', error);
    }
  }

  /**
   * 创建默认同意
   */
  private createDefaultConsent(userId: string): UserConsent {
    const defaultConsent: UserConsent = {
      userId,
      consents: {} as any,
      privacyPolicyVersion: this.PRIVACY_POLICY_VERSION,
      termsOfServiceVersion: this.TERMS_OF_SERVICE_VERSION,
      lastUpdated: new Date().toISOString(),
      isEUUser: false, // 需要根据实际情况检测
      explicitConsentRequired: false,
    };

    // 初始化所有同意类型为false
    const consentTypes: ConsentType[] = [
      'analytics', 'personalization', 'marketing', 'crash_reporting',
      'performance', 'location', 'camera', 'microphone', 'notifications', 'cloud_sync'
    ];

    consentTypes.forEach(type => {
      defaultConsent.consents[type] = {
        granted: false,
        timestamp: new Date().toISOString(),
        version: this.PRIVACY_POLICY_VERSION,
      };
    });

    return defaultConsent;
  }

  /**
   * 保存用户同意
   */
  private async saveUserConsents(): Promise<void> {
    try {
      const consents = Array.from(this.userConsents.values());
      await AsyncStorage.setItem(this.CONSENTS_KEY, JSON.stringify(consents));
    } catch (error) {
      console.error('Error saving user consents:', error);
    }
  }

  // ===== 数据导出 =====

  /**
   * 请求数据导出
   */
  async requestDataExport(userId: string, exportType: DataExportType): Promise<string> {
    try {
      const requestId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const exportRequest: DataExportRequest = {
        requestId,
        userId,
        exportType,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后过期
      };

      this.exportRequests.set(requestId, exportRequest);
      await this.saveExportRequests();

      // 异步处理导出
      this.processDataExport(requestId);

      this.analyticsService.track('data_export_requested', {
        userId,
        exportType,
        requestId,
        timestamp: Date.now(),
      });

      return requestId;

    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  /**
   * 处理数据导出
   */
  private async processDataExport(requestId: string): Promise<void> {
    try {
      const request = this.exportRequests.get(requestId);
      if (!request) return;

      request.status = 'processing';
      this.exportRequests.set(requestId, request);
      await this.saveExportRequests();

      // 收集数据
      const exportData = await this.collectUserData(request.userId, request.exportType);
      
      // 生成文件
      const filePath = await this.generateExportFile(request.userId, exportData);
      
      // 更新请求状态
      request.status = 'completed';
      request.processedAt = new Date().toISOString();
      request.downloadUrl = filePath;
      request.fileSize = (await FileSystem.getInfoAsync(filePath)).size;
      
      this.exportRequests.set(requestId, request);
      await this.saveExportRequests();

    } catch (error) {
      console.error('Error processing data export:', error);
      
      const request = this.exportRequests.get(requestId);
      if (request) {
        request.status = 'failed';
        request.error = error.message;
        this.exportRequests.set(requestId, request);
        await this.saveExportRequests();
      }
    }
  }

  /**
   * 收集用户数据
   */
  private async collectUserData(userId: string, exportType: DataExportType): Promise<any> {
    const data: any = {};

    if (exportType === 'complete' || exportType === 'user_profile') {
      const userState = await this.userStateService.getUserState(userId);
      data.userProfile = userState;
    }

    if (exportType === 'complete' || exportType === 'learning_progress') {
      const progress = await this.learningProgressService.getUserProgress(userId);
      data.learningProgress = progress;
    }

    if (exportType === 'complete' || exportType === 'settings') {
      // 收集用户设置
      data.settings = {
        consents: this.userConsents.get(userId),
        // 其他设置...
      };
    }

    if (exportType === 'complete' || exportType === 'achievements') {
      // 收集成就数据
      data.achievements = {
        // 成就数据...
      };
    }

    if (exportType === 'complete' || exportType === 'analytics') {
      // 收集分析数据（匿名化）
      data.analytics = {
        // 匿名化的分析数据...
      };
    }

    return data;
  }

  /**
   * 生成导出文件
   */
  private async generateExportFile(userId: string, data: any): Promise<string> {
    try {
      const fileName = `smartalk_data_export_${userId}_${Date.now()}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      const exportContent = {
        exportedAt: new Date().toISOString(),
        userId,
        data,
        metadata: {
          appVersion: '2.0.0',
          exportFormat: 'JSON',
          privacyPolicyVersion: this.PRIVACY_POLICY_VERSION,
        },
      };

      await FileSystem.writeAsStringAsync(
        filePath,
        JSON.stringify(exportContent, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 }
      );

      return filePath;

    } catch (error) {
      console.error('Error generating export file:', error);
      throw error;
    }
  }

  /**
   * 获取导出请求状态
   */
  getExportRequest(requestId: string): DataExportRequest | null {
    return this.exportRequests.get(requestId) || null;
  }

  /**
   * 下载导出文件
   */
  async downloadExportFile(requestId: string): Promise<void> {
    try {
      const request = this.exportRequests.get(requestId);
      if (!request || request.status !== 'completed' || !request.downloadUrl) {
        throw new Error('Export file not available');
      }

      // 检查文件是否过期
      if (new Date() > new Date(request.expiresAt)) {
        throw new Error('Export file has expired');
      }

      // 使用Expo Sharing分享文件
      await Sharing.shareAsync(request.downloadUrl, {
        mimeType: 'application/json',
        dialogTitle: 'Download Your Data Export',
      });

      this.analyticsService.track('data_export_downloaded', {
        requestId,
        userId: request.userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error downloading export file:', error);
      throw error;
    }
  }

  /**
   * 清理过期的导出请求
   */
  private async cleanupExpiredExportRequests(): Promise<void> {
    try {
      const now = new Date();
      const expiredRequests: string[] = [];

      this.exportRequests.forEach((request, requestId) => {
        if (now > new Date(request.expiresAt)) {
          expiredRequests.push(requestId);
          
          // 删除文件
          if (request.downloadUrl) {
            FileSystem.deleteAsync(request.downloadUrl, { idempotent: true });
          }
        }
      });

      expiredRequests.forEach(requestId => {
        this.exportRequests.delete(requestId);
      });

      if (expiredRequests.length > 0) {
        await this.saveExportRequests();
      }

    } catch (error) {
      console.error('Error cleaning up expired export requests:', error);
    }
  }

  /**
   * 保存导出请求
   */
  private async saveExportRequests(): Promise<void> {
    try {
      const requests = Array.from(this.exportRequests.values());
      await AsyncStorage.setItem(this.EXPORT_REQUESTS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving export requests:', error);
    }
  }

  // ===== 账户删除 =====

  /**
   * 请求账户删除
   */
  async requestAccountDeletion(userId: string, reason?: string): Promise<string> {
    try {
      const requestId = `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deletionRequest: AccountDeletionRequest = {
        requestId,
        userId,
        requestedAt: new Date().toISOString(),
        reason,
        status: 'grace_period',
        gracePeriodEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天宽限期
        dataExportRequested: false,
        dataExportCompleted: false,
        recoveryToken: this.generateRecoveryToken(),
        recoveryExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };

      this.deletionRequests.set(requestId, deletionRequest);
      await this.saveDeletionRequests();

      this.analyticsService.track('account_deletion_requested', {
        userId,
        requestId,
        reason,
        timestamp: Date.now(),
      });

      return requestId;

    } catch (error) {
      console.error('Error requesting account deletion:', error);
      throw error;
    }
  }

  /**
   * 生成恢复令牌
   */
  private generateRecoveryToken(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * 取消账户删除
   */
  async cancelAccountDeletion(requestId: string, recoveryToken: string): Promise<void> {
    try {
      const request = this.deletionRequests.get(requestId);
      if (!request) {
        throw new Error('Deletion request not found');
      }

      if (request.recoveryToken !== recoveryToken) {
        throw new Error('Invalid recovery token');
      }

      if (new Date() > new Date(request.recoveryExpiresAt!)) {
        throw new Error('Recovery token has expired');
      }

      request.status = 'cancelled';
      this.deletionRequests.set(requestId, request);
      await this.saveDeletionRequests();

      this.analyticsService.track('account_deletion_cancelled', {
        requestId,
        userId: request.userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error cancelling account deletion:', error);
      throw error;
    }
  }

  /**
   * 处理过期的删除请求
   */
  private async processExpiredDeletionRequests(): Promise<void> {
    try {
      const now = new Date();
      const expiredRequests: AccountDeletionRequest[] = [];

      this.deletionRequests.forEach(request => {
        if (request.status === 'grace_period' && now > new Date(request.gracePeriodEndsAt)) {
          expiredRequests.push(request);
        }
      });

      for (const request of expiredRequests) {
        await this.processAccountDeletion(request.requestId);
      }

    } catch (error) {
      console.error('Error processing expired deletion requests:', error);
    }
  }

  /**
   * 处理账户删除
   */
  private async processAccountDeletion(requestId: string): Promise<void> {
    try {
      const request = this.deletionRequests.get(requestId);
      if (!request) return;

      request.status = 'processing';
      this.deletionRequests.set(requestId, request);
      await this.saveDeletionRequests();

      // 删除用户数据
      await this.deleteUserData(request.userId);

      request.status = 'completed';
      request.processedAt = new Date().toISOString();
      this.deletionRequests.set(requestId, request);
      await this.saveDeletionRequests();

      this.analyticsService.track('account_deletion_completed', {
        requestId,
        userId: request.userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.error('Error processing account deletion:', error);
    }
  }

  /**
   * 删除用户数据
   */
  private async deleteUserData(userId: string): Promise<void> {
    try {
      // 删除学习进度数据
      await this.learningProgressService.deleteUserData(userId);
      
      // 删除用户状态数据
      await this.userStateService.deleteUserData(userId);
      
      // 删除同意记录
      this.userConsents.delete(userId);
      await this.saveUserConsents();
      
      // 删除相关的导出请求
      const userExportRequests = Array.from(this.exportRequests.entries())
        .filter(([_, request]) => request.userId === userId);
      
      userExportRequests.forEach(([requestId, request]) => {
        if (request.downloadUrl) {
          FileSystem.deleteAsync(request.downloadUrl, { idempotent: true });
        }
        this.exportRequests.delete(requestId);
      });
      
      await this.saveExportRequests();

    } catch (error) {
      console.error('Error deleting user data:', error);
      throw error;
    }
  }

  /**
   * 获取删除请求状态
   */
  getDeletionRequest(requestId: string): AccountDeletionRequest | null {
    return this.deletionRequests.get(requestId) || null;
  }

  /**
   * 保存删除请求
   */
  private async saveDeletionRequests(): Promise<void> {
    try {
      const requests = Array.from(this.deletionRequests.values());
      await AsyncStorage.setItem(this.DELETION_REQUESTS_KEY, JSON.stringify(requests));
    } catch (error) {
      console.error('Error saving deletion requests:', error);
    }
  }

  // ===== 数据保留策略 =====

  /**
   * 执行数据保留策略
   */
  private async enforceDataRetentionPolicies(): Promise<void> {
    try {
      for (const policy of this.DATA_RETENTION_POLICIES) {
        if (policy.autoCleanup) {
          await this.cleanupDataByPolicy(policy);
        }
      }
    } catch (error) {
      console.error('Error enforcing data retention policies:', error);
    }
  }

  /**
   * 根据策略清理数据
   */
  private async cleanupDataByPolicy(policy: DataRetentionPolicy): Promise<void> {
    try {
      const cutoffDate = new Date(Date.now() - policy.retentionPeriodDays * 24 * 60 * 60 * 1000);
      
      switch (policy.category) {
        case 'analytics':
          // 清理分析数据
          break;
        case 'crash_reports':
          // 清理崩溃报告
          break;
        case 'temporary_files':
          // 清理临时文件
          await this.cleanupTemporaryFiles(cutoffDate);
          break;
      }
    } catch (error) {
      console.error(`Error cleaning up data for policy ${policy.category}:`, error);
    }
  }

  /**
   * 清理临时文件
   */
  private async cleanupTemporaryFiles(cutoffDate: Date): Promise<void> {
    try {
      const tempDir = `${FileSystem.documentDirectory}temp/`;
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      
      if (dirInfo.exists && dirInfo.isDirectory) {
        const files = await FileSystem.readDirectoryAsync(tempDir);
        
        for (const file of files) {
          const filePath = `${tempDir}${file}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          
          if (fileInfo.exists && fileInfo.modificationTime! < cutoffDate.getTime()) {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up temporary files:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取隐私政策版本
   */
  getPrivacyPolicyVersion(): string {
    return this.PRIVACY_POLICY_VERSION;
  }

  /**
   * 获取服务条款版本
   */
  getTermsOfServiceVersion(): string {
    return this.TERMS_OF_SERVICE_VERSION;
  }

  /**
   * 获取数据保留策略
   */
  getDataRetentionPolicies(): DataRetentionPolicy[] {
    return [...this.DATA_RETENTION_POLICIES];
  }

  /**
   * 检查是否需要更新同意
   */
  needsConsentUpdate(userId: string): boolean {
    const consent = this.userConsents.get(userId);
    if (!consent) return true;
    
    return consent.privacyPolicyVersion !== this.PRIVACY_POLICY_VERSION ||
           consent.termsOfServiceVersion !== this.TERMS_OF_SERVICE_VERSION;
  }

  /**
   * 获取用户的所有请求
   */
  getUserRequests(userId: string): {
    exportRequests: DataExportRequest[];
    deletionRequests: AccountDeletionRequest[];
  } {
    const exportRequests = Array.from(this.exportRequests.values())
      .filter(request => request.userId === userId);
    
    const deletionRequests = Array.from(this.deletionRequests.values())
      .filter(request => request.userId === userId);

    return { exportRequests, deletionRequests };
  }
}

export default PrivacyComplianceService;

export { ConsentType, UserConsent, DataExportType, DataExportRequest, AccountDeletionRequest, DataRetentionPolicy };
