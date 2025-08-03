/**
 * UserAccountService - V2 用户账户管理和合规服务
 * 提供完整的账户管理功能：注册登录、数据隐私、GDPR合规、平台政策遵循
 * 支持多种认证方式、数据导出、账户删除、隐私控制
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { AnalyticsService } from './AnalyticsService';

// 用户账户状态
export type AccountStatus = 
  | 'active'          // 活跃
  | 'suspended'       // 暂停
  | 'deactivated'     // 停用
  | 'pending_deletion' // 待删除
  | 'deleted';        // 已删除

// 认证方式
export type AuthMethod = 
  | 'email'           // 邮箱
  | 'phone'           // 手机号
  | 'apple'           // Apple ID
  | 'google'          // Google
  | 'wechat'          // 微信
  | 'anonymous';      // 匿名

// 数据类型
export type DataType = 
  | 'profile'         // 个人资料
  | 'learning_progress' // 学习进度
  | 'achievements'    // 成就数据
  | 'analytics'       // 分析数据
  | 'preferences'     // 偏好设置
  | 'social'          // 社交数据
  | 'content'         // 内容数据
  | 'all';           // 所有数据

// 用户账户信息
export interface UserAccount {
  userId: string;
  
  // 基本信息
  email?: string;
  phone?: string;
  username: string;
  displayName: string;
  avatar?: string;
  
  // 认证信息
  authMethods: AuthMethod[];
  primaryAuthMethod: AuthMethod;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // 账户状态
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string;
  lastActiveAt: string;
  
  // 合规信息
  gdprConsent: {
    dataProcessing: boolean;
    marketing: boolean;
    analytics: boolean;
    consentDate: string;
    consentVersion: string;
  };
  
  // 隐私设置
  privacySettings: {
    profileVisibility: 'public' | 'friends' | 'private';
    learningDataSharing: boolean;
    analyticsOptOut: boolean;
    marketingOptOut: boolean;
    locationTracking: boolean;
    crashReporting: boolean;
  };
  
  // 数据管理
  dataRetention: {
    retentionPeriod: number; // days
    lastDataExport?: string;
    scheduledDeletion?: string;
  };
  
  // 安全设置
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    deviceTrust: boolean;
    sessionTimeout: number; // minutes
  };
  
  // 合规标记
  compliance: {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    coppaCompliant: boolean;
    platformPolicyVersion: string;
    termsAcceptedAt: string;
    privacyPolicyAcceptedAt: string;
  };
}

// 数据导出请求
export interface DataExportRequest {
  requestId: string;
  userId: string;
  
  // 请求信息
  requestedAt: string;
  dataTypes: DataType[];
  format: 'json' | 'csv' | 'xml';
  
  // 处理状态
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  
  // 结果信息
  downloadUrl?: string;
  expiresAt?: string;
  fileSize?: number;
  errorMessage?: string;
  
  // 合规信息
  legalBasis: string;
  processingNotes: string;
}

// 账户删除请求
export interface AccountDeletionRequest {
  requestId: string;
  userId: string;
  
  // 请求信息
  requestedAt: string;
  reason: string;
  feedback?: string;
  
  // 删除配置
  deletionType: 'immediate' | 'scheduled' | 'soft';
  scheduledDate?: string;
  retainData: DataType[];
  
  // 处理状态
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  confirmationToken?: string;
  confirmationExpiresAt?: string;
  
  // 合规信息
  gdprRequest: boolean;
  legalBasis: string;
  processingNotes: string;
}

// 合规审计记录
export interface ComplianceAuditRecord {
  recordId: string;
  userId: string;
  
  // 审计信息
  auditType: 'data_access' | 'data_export' | 'data_deletion' | 'consent_change' | 'privacy_update';
  timestamp: string;
  
  // 操作详情
  action: string;
  dataTypes: DataType[];
  legalBasis: string;
  
  // 用户信息
  userAgent: string;
  ipAddress: string;
  location?: string;
  
  // 合规验证
  consentVerified: boolean;
  policyVersion: string;
  auditTrail: string;
}

// 隐私政策版本
export interface PrivacyPolicyVersion {
  version: string;
  effectiveDate: string;
  
  // 政策内容
  title: string;
  content: string;
  summary: string;
  
  // 变更信息
  changes: {
    section: string;
    changeType: 'added' | 'modified' | 'removed';
    description: string;
  }[];
  
  // 合规要求
  requiresConsent: boolean;
  notificationRequired: boolean;
  gracePeriod: number; // days
  
  // 状态
  status: 'draft' | 'active' | 'superseded';
}

class UserAccountService {
  private static instance: UserAccountService;
  private analyticsService = AnalyticsService.getInstance();
  
  // 数据存储
  private userAccounts: Map<string, UserAccount> = new Map();
  private exportRequests: Map<string, DataExportRequest> = new Map();
  private deletionRequests: Map<string, AccountDeletionRequest> = new Map();
  private auditRecords: Map<string, ComplianceAuditRecord> = new Map();
  private policyVersions: Map<string, PrivacyPolicyVersion> = new Map();
  
  // 存储键
  private readonly ACCOUNTS_KEY = 'user_accounts';
  private readonly EXPORTS_KEY = 'data_exports';
  private readonly DELETIONS_KEY = 'account_deletions';
  private readonly AUDITS_KEY = 'compliance_audits';
  private readonly POLICIES_KEY = 'privacy_policies';

  static getInstance(): UserAccountService {
    if (!UserAccountService.instance) {
      UserAccountService.instance = new UserAccountService();
    }
    return UserAccountService.instance;
  }

  constructor() {
    this.initializeService();
  }

  // ===== 初始化 =====

  /**
   * 初始化用户账户服务
   */
  private async initializeService(): Promise<void> {
    try {
      // 加载本地数据
      await this.loadLocalData();
      
      // 初始化隐私政策
      this.initializePrivacyPolicies();
      
      // 开始合规监控
      this.startComplianceMonitoring();
      
      this.analyticsService.track('user_account_service_initialized', {
        accountsCount: this.userAccounts.size,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error initializing user account service:', error);
    }
  }

  /**
   * 加载本地数据
   */
  private async loadLocalData(): Promise<void> {
    try {
      // 加载用户账户
      const accountsData = await AsyncStorage.getItem(this.ACCOUNTS_KEY);
      if (accountsData) {
        const accounts: UserAccount[] = JSON.parse(accountsData);
        accounts.forEach(account => {
          this.userAccounts.set(account.userId, account);
        });
      }

      // 加载导出请求
      const exportsData = await AsyncStorage.getItem(this.EXPORTS_KEY);
      if (exportsData) {
        const exports: DataExportRequest[] = JSON.parse(exportsData);
        exports.forEach(exportReq => {
          this.exportRequests.set(exportReq.requestId, exportReq);
        });
      }

      // 加载删除请求
      const deletionsData = await AsyncStorage.getItem(this.DELETIONS_KEY);
      if (deletionsData) {
        const deletions: AccountDeletionRequest[] = JSON.parse(deletionsData);
        deletions.forEach(deletion => {
          this.deletionRequests.set(deletion.requestId, deletion);
        });
      }

      // 加载审计记录
      const auditsData = await AsyncStorage.getItem(this.AUDITS_KEY);
      if (auditsData) {
        const audits: ComplianceAuditRecord[] = JSON.parse(auditsData);
        audits.forEach(audit => {
          this.auditRecords.set(audit.recordId, audit);
        });
      }

      // 加载隐私政策
      const policiesData = await AsyncStorage.getItem(this.POLICIES_KEY);
      if (policiesData) {
        const policies: PrivacyPolicyVersion[] = JSON.parse(policiesData);
        policies.forEach(policy => {
          this.policyVersions.set(policy.version, policy);
        });
      }

    } catch (error) {
      console.error('Error loading local data:', error);
    }
  }

  /**
   * 初始化隐私政策
   */
  private initializePrivacyPolicies(): void {
    const currentPolicy: PrivacyPolicyVersion = {
      version: '2.0.0',
      effectiveDate: new Date().toISOString(),
      title: 'SmarTalk Privacy Policy',
      content: `
# SmarTalk Privacy Policy

## Data Collection
We collect the following types of data:
- Learning progress and achievements
- User preferences and settings
- Device and usage analytics
- Social sharing activities

## Data Usage
Your data is used to:
- Provide personalized learning experiences
- Track learning progress and achievements
- Improve our services and content
- Enable social sharing features

## Data Sharing
We do not sell your personal data. We may share data with:
- Service providers for app functionality
- Analytics providers for service improvement
- Social media platforms when you choose to share

## Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your account and data
- Export your data
- Opt out of marketing communications

## Contact Us
For privacy questions, contact us at privacy@smartalk.app
      `,
      summary: 'We collect learning data to provide personalized experiences and respect your privacy rights.',
      changes: [
        {
          section: 'Data Collection',
          changeType: 'added',
          description: 'Added social sharing data collection',
        },
        {
          section: 'User Rights',
          changeType: 'modified',
          description: 'Enhanced data export capabilities',
        },
      ],
      requiresConsent: true,
      notificationRequired: true,
      gracePeriod: 30,
      status: 'active',
    };

    if (!this.policyVersions.has(currentPolicy.version)) {
      this.policyVersions.set(currentPolicy.version, currentPolicy);
    }
  }

  /**
   * 开始合规监控
   */
  private startComplianceMonitoring(): void {
    // 每天检查合规状态
    setInterval(() => {
      this.performComplianceCheck();
    }, 24 * 60 * 60 * 1000);
    
    // 每周清理过期数据
    setInterval(() => {
      this.cleanupExpiredData();
    }, 7 * 24 * 60 * 60 * 1000);
    
    // 立即执行一次
    this.performComplianceCheck();
  }

  // ===== 账户管理 =====

  /**
   * 创建用户账户
   */
  async createUserAccount(
    authMethod: AuthMethod,
    credentials: {
      email?: string;
      phone?: string;
      username: string;
      displayName: string;
    },
    gdprConsent: {
      dataProcessing: boolean;
      marketing: boolean;
      analytics: boolean;
    }
  ): Promise<UserAccount> {
    try {
      const userId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${credentials.username}_${Date.now()}_${Math.random()}`
      );

      const account: UserAccount = {
        userId,
        email: credentials.email,
        phone: credentials.phone,
        username: credentials.username,
        displayName: credentials.displayName,
        authMethods: [authMethod],
        primaryAuthMethod: authMethod,
        emailVerified: false,
        phoneVerified: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        gdprConsent: {
          ...gdprConsent,
          consentDate: new Date().toISOString(),
          consentVersion: '2.0.0',
        },
        privacySettings: {
          profileVisibility: 'private',
          learningDataSharing: true,
          analyticsOptOut: false,
          marketingOptOut: !gdprConsent.marketing,
          locationTracking: false,
          crashReporting: true,
        },
        dataRetention: {
          retentionPeriod: 365, // 1 year
        },
        security: {
          twoFactorEnabled: false,
          loginNotifications: true,
          deviceTrust: true,
          sessionTimeout: 30, // 30 minutes
        },
        compliance: {
          gdprCompliant: true,
          ccpaCompliant: true,
          coppaCompliant: false, // Requires age verification
          platformPolicyVersion: '2.0.0',
          termsAcceptedAt: new Date().toISOString(),
          privacyPolicyAcceptedAt: new Date().toISOString(),
        },
      };

      this.userAccounts.set(userId, account);
      await this.saveUserAccounts();

      // 记录审计
      await this.recordAuditEvent(userId, 'data_access', 'account_created', ['profile']);

      this.analyticsService.track('user_account_created', {
        userId,
        authMethod,
        gdprConsent,
        timestamp: Date.now(),
      });

      return account;

    } catch (error) {
      console.error('Error creating user account:', error);
      throw error;
    }
  }

  /**
   * 获取用户账户
   */
  getUserAccount(userId: string): UserAccount | null {
    return this.userAccounts.get(userId) || null;
  }

  /**
   * 更新用户账户
   */
  async updateUserAccount(
    userId: string,
    updates: Partial<UserAccount>
  ): Promise<UserAccount | null> {
    try {
      const account = this.userAccounts.get(userId);
      if (!account) {
        throw new Error('Account not found');
      }

      const updatedAccount = { ...account, ...updates };
      this.userAccounts.set(userId, updatedAccount);
      await this.saveUserAccounts();

      // 记录审计
      await this.recordAuditEvent(userId, 'privacy_update', 'account_updated', ['profile']);

      return updatedAccount;

    } catch (error) {
      console.error('Error updating user account:', error);
      return null;
    }
  }

  /**
   * 更新隐私设置
   */
  async updatePrivacySettings(
    userId: string,
    privacySettings: Partial<UserAccount['privacySettings']>
  ): Promise<boolean> {
    try {
      const account = this.userAccounts.get(userId);
      if (!account) {
        throw new Error('Account not found');
      }

      account.privacySettings = { ...account.privacySettings, ...privacySettings };
      this.userAccounts.set(userId, account);
      await this.saveUserAccounts();

      // 记录审计
      await this.recordAuditEvent(userId, 'privacy_update', 'privacy_settings_updated', ['profile']);

      return true;

    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return false;
    }
  }

  // ===== 数据导出 =====

  /**
   * 请求数据导出
   */
  async requestDataExport(
    userId: string,
    dataTypes: DataType[],
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<string> {
    try {
      const requestId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `export_${userId}_${Date.now()}`
      );

      const exportRequest: DataExportRequest = {
        requestId,
        userId,
        requestedAt: new Date().toISOString(),
        dataTypes,
        format,
        status: 'pending',
        progress: 0,
        legalBasis: 'GDPR Article 20 - Right to data portability',
        processingNotes: 'User requested data export',
      };

      this.exportRequests.set(requestId, exportRequest);
      await this.saveExportRequests();

      // 开始处理导出
      this.processDataExport(requestId);

      // 记录审计
      await this.recordAuditEvent(userId, 'data_export', 'export_requested', dataTypes);

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
      request.progress = 10;
      this.exportRequests.set(requestId, request);

      // 模拟数据收集过程
      const userData = await this.collectUserData(request.userId, request.dataTypes);
      request.progress = 50;

      // 模拟数据格式化
      const formattedData = this.formatExportData(userData, request.format);
      request.progress = 80;

      // 模拟文件生成
      const downloadUrl = await this.generateExportFile(formattedData, request.format);
      request.progress = 100;
      request.status = 'completed';
      request.downloadUrl = downloadUrl;
      request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
      request.fileSize = JSON.stringify(formattedData).length;

      this.exportRequests.set(requestId, request);
      await this.saveExportRequests();

      // 记录审计
      await this.recordAuditEvent(request.userId, 'data_export', 'export_completed', request.dataTypes);

    } catch (error) {
      console.error('Error processing data export:', error);
      
      const request = this.exportRequests.get(requestId);
      if (request) {
        request.status = 'failed';
        request.errorMessage = error.message;
        this.exportRequests.set(requestId, request);
        await this.saveExportRequests();
      }
    }
  }

  /**
   * 收集用户数据
   */
  private async collectUserData(userId: string, dataTypes: DataType[]): Promise<any> {
    const userData: any = {};

    if (dataTypes.includes('profile') || dataTypes.includes('all')) {
      userData.profile = this.userAccounts.get(userId);
    }

    if (dataTypes.includes('learning_progress') || dataTypes.includes('all')) {
      // 这里应该从学习进度服务获取数据
      userData.learningProgress = {
        totalSessions: 50,
        completedChapters: 10,
        currentLevel: 'Intermediate',
        // ... 其他学习数据
      };
    }

    if (dataTypes.includes('achievements') || dataTypes.includes('all')) {
      // 这里应该从成就系统获取数据
      userData.achievements = {
        badges: [],
        milestones: [],
        streaks: [],
        // ... 其他成就数据
      };
    }

    // 添加其他数据类型...

    return userData;
  }

  /**
   * 格式化导出数据
   */
  private formatExportData(userData: any, format: string): any {
    switch (format) {
      case 'json':
        return userData;
      case 'csv':
        // 简化的CSV格式化
        return this.convertToCSV(userData);
      case 'xml':
        // 简化的XML格式化
        return this.convertToXML(userData);
      default:
        return userData;
    }
  }

  /**
   * 转换为CSV格式
   */
  private convertToCSV(data: any): string {
    // 简化的CSV转换实现
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(v => JSON.stringify(v)).join(',');
    return `${headers}\n${values}`;
  }

  /**
   * 转换为XML格式
   */
  private convertToXML(data: any): string {
    // 简化的XML转换实现
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<userData>\n';
    for (const [key, value] of Object.entries(data)) {
      xml += `  <${key}>${JSON.stringify(value)}</${key}>\n`;
    }
    xml += '</userData>';
    return xml;
  }

  /**
   * 生成导出文件
   */
  private async generateExportFile(data: any, format: string): Promise<string> {
    // 在实际应用中，这里会将数据保存到文件并返回下载URL
    // 现在返回模拟的URL
    return `https://smartalk.app/exports/user_data_${Date.now()}.${format}`;
  }

  // ===== 账户删除 =====

  /**
   * 请求账户删除
   */
  async requestAccountDeletion(
    userId: string,
    reason: string,
    feedback?: string,
    deletionType: 'immediate' | 'scheduled' | 'soft' = 'scheduled'
  ): Promise<string> {
    try {
      const requestId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `deletion_${userId}_${Date.now()}`
      );

      const deletionRequest: AccountDeletionRequest = {
        requestId,
        userId,
        requestedAt: new Date().toISOString(),
        reason,
        feedback,
        deletionType,
        scheduledDate: deletionType === 'scheduled' ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : // 30 days
          undefined,
        retainData: [], // 默认删除所有数据
        status: 'pending',
        confirmationToken: await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `confirm_${requestId}_${Math.random()}`
        ),
        confirmationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        gdprRequest: true,
        legalBasis: 'GDPR Article 17 - Right to erasure',
        processingNotes: 'User requested account deletion',
      };

      this.deletionRequests.set(requestId, deletionRequest);
      await this.saveDeletionRequests();

      // 记录审计
      await this.recordAuditEvent(userId, 'data_deletion', 'deletion_requested', ['all']);

      return requestId;

    } catch (error) {
      console.error('Error requesting account deletion:', error);
      throw error;
    }
  }

  /**
   * 确认账户删除
   */
  async confirmAccountDeletion(requestId: string, confirmationToken: string): Promise<boolean> {
    try {
      const request = this.deletionRequests.get(requestId);
      if (!request) {
        throw new Error('Deletion request not found');
      }

      if (request.confirmationToken !== confirmationToken) {
        throw new Error('Invalid confirmation token');
      }

      if (new Date() > new Date(request.confirmationExpiresAt!)) {
        throw new Error('Confirmation token expired');
      }

      request.status = 'confirmed';
      this.deletionRequests.set(requestId, request);
      await this.saveDeletionRequests();

      // 开始删除处理
      if (request.deletionType === 'immediate') {
        await this.processAccountDeletion(requestId);
      }

      return true;

    } catch (error) {
      console.error('Error confirming account deletion:', error);
      return false;
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

      const account = this.userAccounts.get(request.userId);
      if (account) {
        // 软删除：标记为已删除但保留数据
        if (request.deletionType === 'soft') {
          account.status = 'deleted';
          this.userAccounts.set(request.userId, account);
        } else {
          // 硬删除：完全移除数据
          this.userAccounts.delete(request.userId);
        }
      }

      request.status = 'completed';
      this.deletionRequests.set(requestId, request);

      await this.saveUserAccounts();
      await this.saveDeletionRequests();

      // 记录审计
      await this.recordAuditEvent(request.userId, 'data_deletion', 'deletion_completed', ['all']);

    } catch (error) {
      console.error('Error processing account deletion:', error);
    }
  }

  // ===== 合规审计 =====

  /**
   * 记录审计事件
   */
  private async recordAuditEvent(
    userId: string,
    auditType: ComplianceAuditRecord['auditType'],
    action: string,
    dataTypes: DataType[]
  ): Promise<void> {
    try {
      const recordId = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `audit_${userId}_${Date.now()}_${Math.random()}`
      );

      const auditRecord: ComplianceAuditRecord = {
        recordId,
        userId,
        auditType,
        timestamp: new Date().toISOString(),
        action,
        dataTypes,
        legalBasis: 'User consent and legitimate interest',
        userAgent: 'SmarTalk Mobile App',
        ipAddress: '0.0.0.0', // 在实际应用中获取真实IP
        consentVerified: true,
        policyVersion: '2.0.0',
        auditTrail: `${action} performed by user ${userId}`,
      };

      this.auditRecords.set(recordId, auditRecord);
      await this.saveAuditRecords();

    } catch (error) {
      console.error('Error recording audit event:', error);
    }
  }

  /**
   * 执行合规检查
   */
  private async performComplianceCheck(): Promise<void> {
    try {
      // 检查数据保留期限
      const now = new Date();
      
      this.userAccounts.forEach(async (account, userId) => {
        const accountAge = now.getTime() - new Date(account.createdAt).getTime();
        const retentionPeriod = account.dataRetention.retentionPeriod * 24 * 60 * 60 * 1000;
        
        if (accountAge > retentionPeriod && account.status === 'active') {
          // 通知用户数据即将过期
          console.log(`Data retention warning for user ${userId}`);
        }
      });

      // 检查待删除账户
      this.deletionRequests.forEach(async (request, requestId) => {
        if (request.status === 'confirmed' && request.scheduledDate) {
          const scheduledDate = new Date(request.scheduledDate);
          if (now >= scheduledDate) {
            await this.processAccountDeletion(requestId);
          }
        }
      });

    } catch (error) {
      console.error('Error performing compliance check:', error);
    }
  }

  /**
   * 清理过期数据
   */
  private async cleanupExpiredData(): Promise<void> {
    try {
      const now = new Date();
      
      // 清理过期的导出请求
      this.exportRequests.forEach((request, requestId) => {
        if (request.expiresAt && new Date(request.expiresAt) < now) {
          this.exportRequests.delete(requestId);
        }
      });

      // 清理过期的删除请求
      this.deletionRequests.forEach((request, requestId) => {
        if (request.status === 'completed' && 
            new Date(request.requestedAt).getTime() + 90 * 24 * 60 * 60 * 1000 < now.getTime()) {
          this.deletionRequests.delete(requestId);
        }
      });

      await this.saveExportRequests();
      await this.saveDeletionRequests();

    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  // ===== 数据持久化 =====

  private async saveUserAccounts(): Promise<void> {
    try {
      const accounts = Array.from(this.userAccounts.values());
      await AsyncStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (error) {
      console.error('Error saving user accounts:', error);
    }
  }

  private async saveExportRequests(): Promise<void> {
    try {
      const exports = Array.from(this.exportRequests.values());
      await AsyncStorage.setItem(this.EXPORTS_KEY, JSON.stringify(exports));
    } catch (error) {
      console.error('Error saving export requests:', error);
    }
  }

  private async saveDeletionRequests(): Promise<void> {
    try {
      const deletions = Array.from(this.deletionRequests.values());
      await AsyncStorage.setItem(this.DELETIONS_KEY, JSON.stringify(deletions));
    } catch (error) {
      console.error('Error saving deletion requests:', error);
    }
  }

  private async saveAuditRecords(): Promise<void> {
    try {
      const audits = Array.from(this.auditRecords.values());
      await AsyncStorage.setItem(this.AUDITS_KEY, JSON.stringify(audits));
    } catch (error) {
      console.error('Error saving audit records:', error);
    }
  }

  // ===== 公共API =====

  /**
   * 获取数据导出状态
   */
  getDataExportStatus(requestId: string): DataExportRequest | null {
    return this.exportRequests.get(requestId) || null;
  }

  /**
   * 获取账户删除状态
   */
  getAccountDeletionStatus(requestId: string): AccountDeletionRequest | null {
    return this.deletionRequests.get(requestId) || null;
  }

  /**
   * 获取用户审计记录
   */
  getUserAuditRecords(userId: string): ComplianceAuditRecord[] {
    return Array.from(this.auditRecords.values()).filter(record => record.userId === userId);
  }

  /**
   * 获取当前隐私政策
   */
  getCurrentPrivacyPolicy(): PrivacyPolicyVersion | null {
    const activePolicies = Array.from(this.policyVersions.values())
      .filter(policy => policy.status === 'active')
      .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    
    return activePolicies[0] || null;
  }

  /**
   * 检查用户合规状态
   */
  checkUserCompliance(userId: string): {
    gdprCompliant: boolean;
    ccpaCompliant: boolean;
    consentUpToDate: boolean;
    dataRetentionCompliant: boolean;
  } {
    const account = this.userAccounts.get(userId);
    if (!account) {
      return {
        gdprCompliant: false,
        ccpaCompliant: false,
        consentUpToDate: false,
        dataRetentionCompliant: false,
      };
    }

    const currentPolicy = this.getCurrentPrivacyPolicy();
    const consentUpToDate = currentPolicy ? 
      account.gdprConsent.consentVersion === currentPolicy.version : false;

    const accountAge = Date.now() - new Date(account.createdAt).getTime();
    const retentionPeriod = account.dataRetention.retentionPeriod * 24 * 60 * 60 * 1000;
    const dataRetentionCompliant = accountAge < retentionPeriod;

    return {
      gdprCompliant: account.compliance.gdprCompliant,
      ccpaCompliant: account.compliance.ccpaCompliant,
      consentUpToDate,
      dataRetentionCompliant,
    };
  }

  /**
   * 获取合规统计
   */
  getComplianceStatistics(): {
    totalAccounts: number;
    activeAccounts: number;
    gdprCompliantAccounts: number;
    pendingDeletions: number;
    completedExports: number;
  } {
    const totalAccounts = this.userAccounts.size;
    const activeAccounts = Array.from(this.userAccounts.values())
      .filter(account => account.status === 'active').length;
    const gdprCompliantAccounts = Array.from(this.userAccounts.values())
      .filter(account => account.compliance.gdprCompliant).length;
    const pendingDeletions = Array.from(this.deletionRequests.values())
      .filter(request => request.status === 'pending' || request.status === 'confirmed').length;
    const completedExports = Array.from(this.exportRequests.values())
      .filter(request => request.status === 'completed').length;

    return {
      totalAccounts,
      activeAccounts,
      gdprCompliantAccounts,
      pendingDeletions,
      completedExports,
    };
  }
}

export default UserAccountService;
