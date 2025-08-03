/**
 * usePrivacyCompliance - V2 隐私合规Hook
 * 提供组件级别的隐私合规功能
 * 自动处理用户同意、数据导出、账户删除
 */

import { useEffect, useCallback, useState } from 'react';
import PrivacyComplianceService, { 
  ConsentType,
  UserConsent,
  DataExportType,
  DataExportRequest,
  AccountDeletionRequest,
  DataRetentionPolicy
} from '@/services/PrivacyComplianceService';
import { useUserState } from '@/contexts/UserStateContext';

// 隐私合规Hook状态
interface PrivacyComplianceState {
  // 用户同意
  userConsent: UserConsent | null;
  needsConsentUpdate: boolean;
  
  // 数据导出
  exportRequests: DataExportRequest[];
  activeExportRequests: DataExportRequest[];
  
  // 账户删除
  deletionRequests: AccountDeletionRequest[];
  activeDeletionRequest: AccountDeletionRequest | null;
  
  // 政策信息
  privacyPolicyVersion: string;
  termsOfServiceVersion: string;
  dataRetentionPolicies: DataRetentionPolicy[];
  
  // 状态
  loading: boolean;
  error: string | null;
}

/**
 * 隐私合规Hook
 */
export const usePrivacyCompliance = () => {
  const { userProgress } = useUserState();
  
  const [state, setState] = useState<PrivacyComplianceState>({
    userConsent: null,
    needsConsentUpdate: false,
    exportRequests: [],
    activeExportRequests: [],
    deletionRequests: [],
    activeDeletionRequest: null,
    privacyPolicyVersion: '',
    termsOfServiceVersion: '',
    dataRetentionPolicies: [],
    loading: false,
    error: null,
  });

  const privacyService = PrivacyComplianceService.getInstance();

  // 初始化
  useEffect(() => {
    if (userProgress?.userId) {
      loadPrivacyData();
    }
  }, [userProgress?.userId]);

  const loadPrivacyData = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载用户同意
      const userConsent = privacyService.getUserConsent(userProgress.userId);
      const needsConsentUpdate = privacyService.needsConsentUpdate(userProgress.userId);
      
      // 加载用户请求
      const { exportRequests, deletionRequests } = privacyService.getUserRequests(userProgress.userId);
      
      // 查找活跃请求
      const activeExportRequests = exportRequests.filter(
        req => req.status === 'pending' || req.status === 'processing' || req.status === 'completed'
      );
      
      const activeDeletionRequest = deletionRequests.find(
        req => req.status === 'grace_period' || req.status === 'pending'
      ) || null;
      
      // 加载政策信息
      const privacyPolicyVersion = privacyService.getPrivacyPolicyVersion();
      const termsOfServiceVersion = privacyService.getTermsOfServiceVersion();
      const dataRetentionPolicies = privacyService.getDataRetentionPolicies();

      setState(prev => ({
        ...prev,
        userConsent,
        needsConsentUpdate,
        exportRequests,
        activeExportRequests,
        deletionRequests,
        activeDeletionRequest,
        privacyPolicyVersion,
        termsOfServiceVersion,
        dataRetentionPolicies,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载隐私数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // 更新用户同意
  const updateConsent = useCallback(async (consentType: ConsentType, granted: boolean) => {
    if (!userProgress?.userId) return;

    try {
      await privacyService.updateUserConsent(userProgress.userId, consentType, granted);
      
      // 更新本地状态
      setState(prev => {
        if (!prev.userConsent) return prev;
        
        const updatedConsent = { ...prev.userConsent };
        updatedConsent.consents[consentType] = {
          granted,
          timestamp: new Date().toISOString(),
          version: prev.privacyPolicyVersion,
        };
        updatedConsent.lastUpdated = new Date().toISOString();
        
        return {
          ...prev,
          userConsent: updatedConsent,
        };
      });

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '更新同意失败',
      }));
    }
  }, [userProgress?.userId]);

  // 批量更新同意
  const updateMultipleConsents = useCallback(async (consents: { [key in ConsentType]?: boolean }) => {
    if (!userProgress?.userId) return;

    try {
      await privacyService.updateMultipleConsents(userProgress.userId, consents);
      
      // 重新加载数据
      await loadPrivacyData();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '批量更新同意失败',
      }));
    }
  }, [userProgress?.userId, loadPrivacyData]);

  // 请求数据导出
  const requestDataExport = useCallback(async (exportType: DataExportType) => {
    if (!userProgress?.userId) return null;

    try {
      const requestId = await privacyService.requestDataExport(userProgress.userId, exportType);
      
      // 重新加载数据
      await loadPrivacyData();
      
      return requestId;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '请求数据导出失败',
      }));
      return null;
    }
  }, [userProgress?.userId, loadPrivacyData]);

  // 下载导出文件
  const downloadExportFile = useCallback(async (requestId: string) => {
    try {
      await privacyService.downloadExportFile(requestId);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '下载导出文件失败',
      }));
    }
  }, []);

  // 请求账户删除
  const requestAccountDeletion = useCallback(async (reason?: string) => {
    if (!userProgress?.userId) return null;

    try {
      const requestId = await privacyService.requestAccountDeletion(userProgress.userId, reason);
      
      // 重新加载数据
      await loadPrivacyData();
      
      return requestId;

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '请求账户删除失败',
      }));
      return null;
    }
  }, [userProgress?.userId, loadPrivacyData]);

  // 取消账户删除
  const cancelAccountDeletion = useCallback(async (requestId: string, recoveryToken: string) => {
    try {
      await privacyService.cancelAccountDeletion(requestId, recoveryToken);
      
      // 重新加载数据
      await loadPrivacyData();

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '取消账户删除失败',
      }));
    }
  }, [loadPrivacyData]);

  // 检查特定同意状态
  const hasConsent = useCallback((consentType: ConsentType): boolean => {
    return state.userConsent?.consents[consentType]?.granted || false;
  }, [state.userConsent]);

  // 获取导出请求状态
  const getExportRequestStatus = useCallback((requestId: string): DataExportRequest | null => {
    return state.exportRequests.find(req => req.requestId === requestId) || null;
  }, [state.exportRequests]);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // 状态
    ...state,
    
    // 同意管理
    updateConsent,
    updateMultipleConsents,
    hasConsent,
    
    // 数据导出
    requestDataExport,
    downloadExportFile,
    getExportRequestStatus,
    
    // 账户删除
    requestAccountDeletion,
    cancelAccountDeletion,
    
    // 工具方法
    loadPrivacyData,
    clearError,
    
    // 便捷属性
    hasActiveExportRequests: state.activeExportRequests.length > 0,
    hasActiveDeletionRequest: !!state.activeDeletionRequest,
    isInGracePeriod: state.activeDeletionRequest?.status === 'grace_period',
    gracePeriodDaysRemaining: state.activeDeletionRequest ? 
      Math.max(0, Math.ceil((new Date(state.activeDeletionRequest.gracePeriodEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0,
  };
};

/**
 * 同意管理Hook
 */
export const useConsentManagement = () => {
  const { userConsent, updateConsent, updateMultipleConsents, hasConsent, loading } = usePrivacyCompliance();

  const getConsentInfo = useCallback((consentType: ConsentType) => {
    const consent = userConsent?.consents[consentType];
    return {
      granted: consent?.granted || false,
      timestamp: consent?.timestamp,
      version: consent?.version,
    };
  }, [userConsent]);

  const getAllConsents = useCallback(() => {
    if (!userConsent) return {};
    
    const consents: { [key in ConsentType]?: boolean } = {};
    Object.entries(userConsent.consents).forEach(([type, consent]) => {
      consents[type as ConsentType] = consent.granted;
    });
    
    return consents;
  }, [userConsent]);

  return {
    userConsent,
    loading,
    updateConsent,
    updateMultipleConsents,
    hasConsent,
    getConsentInfo,
    getAllConsents,
  };
};

/**
 * 数据导出Hook
 */
export const useDataExport = () => {
  const { 
    exportRequests,
    activeExportRequests,
    requestDataExport,
    downloadExportFile,
    getExportRequestStatus,
    loading,
    error
  } = usePrivacyCompliance();

  const getCompletedExports = useCallback(() => {
    return exportRequests.filter(req => req.status === 'completed');
  }, [exportRequests]);

  const getPendingExports = useCallback(() => {
    return exportRequests.filter(req => req.status === 'pending' || req.status === 'processing');
  }, [exportRequests]);

  const canDownload = useCallback((requestId: string): boolean => {
    const request = getExportRequestStatus(requestId);
    if (!request || request.status !== 'completed') return false;
    
    const now = new Date();
    const expiresAt = new Date(request.expiresAt);
    return now < expiresAt;
  }, [getExportRequestStatus]);

  return {
    exportRequests,
    activeExportRequests,
    completedExports: getCompletedExports(),
    pendingExports: getPendingExports(),
    loading,
    error,
    requestDataExport,
    downloadExportFile,
    getExportRequestStatus,
    canDownload,
  };
};

/**
 * 账户删除Hook
 */
export const useAccountDeletion = () => {
  const {
    deletionRequests,
    activeDeletionRequest,
    isInGracePeriod,
    gracePeriodDaysRemaining,
    requestAccountDeletion,
    cancelAccountDeletion,
    loading,
    error
  } = usePrivacyCompliance();

  const canRecover = useCallback((): boolean => {
    if (!activeDeletionRequest) return false;
    
    const now = new Date();
    const recoveryExpiresAt = new Date(activeDeletionRequest.recoveryExpiresAt || '');
    return now < recoveryExpiresAt;
  }, [activeDeletionRequest]);

  return {
    deletionRequests,
    activeDeletionRequest,
    isInGracePeriod,
    gracePeriodDaysRemaining,
    canRecover: canRecover(),
    loading,
    error,
    requestAccountDeletion,
    cancelAccountDeletion,
  };
};

export default usePrivacyCompliance;
