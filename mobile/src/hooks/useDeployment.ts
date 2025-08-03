/**
 * useDeployment - V2 部署管理Hook
 * 提供组件级别的部署管理功能
 * 自动处理部署流程、状态监控、健康检查
 */

import { useEffect, useCallback, useState } from 'react';
import DeploymentService, { 
  DeploymentRecord,
  DeploymentEnvironment,
  HealthCheckResult,
  DeploymentConfig,
  VersionInfo
} from '@/services/DeploymentService';
import { useUserState } from '@/contexts/UserStateContext';

// 部署管理状态
interface DeploymentState {
  // 部署记录
  deploymentHistory: DeploymentRecord[];
  activeDeployments: DeploymentRecord[];
  currentDeployment: DeploymentRecord | null;
  
  // 健康检查
  healthCheckResults: HealthCheckResult[];
  
  // 环境配置
  environmentConfigs: Map<DeploymentEnvironment, DeploymentConfig>;
  
  // 状态
  loading: boolean;
  error: string | null;
  deploying: boolean;
}

/**
 * 部署管理Hook
 */
export const useDeployment = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<DeploymentState>({
    deploymentHistory: [],
    activeDeployments: [],
    currentDeployment: null,
    healthCheckResults: [],
    environmentConfigs: new Map(),
    loading: false,
    error: null,
    deploying: false,
  });

  const deploymentService = DeploymentService.getInstance();

  // 初始化
  useEffect(() => {
    loadDeploymentData();
    
    // 定期更新活跃部署状态
    const interval = setInterval(() => {
      updateActiveDeployments();
    }, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, []);

  const loadDeploymentData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载部署历史
      const history = deploymentService.getDeploymentHistory();
      
      // 加载活跃部署
      const active = deploymentService.getActiveDeployments();
      
      // 加载健康检查结果
      const healthResults = deploymentService.getHealthCheckResults();
      
      // 加载环境配置
      const envConfigs = new Map<DeploymentEnvironment, DeploymentConfig>();
      (['development', 'staging', 'production', 'beta'] as DeploymentEnvironment[]).forEach(env => {
        const config = deploymentService.getEnvironmentConfig(env);
        if (config) {
          envConfigs.set(env, config);
        }
      });

      setState(prev => ({
        ...prev,
        deploymentHistory: history,
        activeDeployments: active,
        healthCheckResults: healthResults,
        environmentConfigs: envConfigs,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载部署数据失败',
      }));
    }
  }, []);

  const updateActiveDeployments = useCallback(() => {
    const active = deploymentService.getActiveDeployments();
    setState(prev => ({
      ...prev,
      activeDeployments: active,
    }));
  }, []);

  // 开始部署
  const startDeployment = useCallback(async (
    version: VersionInfo,
    environment: DeploymentEnvironment
  ) => {
    if (!userProgress?.userId) return null;

    try {
      setState(prev => ({ ...prev, deploying: true, error: null }));

      const deployment = await deploymentService.startDeployment(
        version,
        environment,
        {
          id: userProgress.userId,
          name: userProgress.userName || 'User',
          email: userProgress.userEmail || 'user@smartalk.app',
        }
      );

      setState(prev => ({
        ...prev,
        currentDeployment: deployment,
        activeDeployments: [...prev.activeDeployments, deployment],
        deploying: false,
      }));

      return deployment;

    } catch (error) {
      setState(prev => ({
        ...prev,
        deploying: false,
        error: error.message || '开始部署失败',
      }));
      return null;
    }
  }, [userProgress]);

  // 回滚部署
  const rollbackDeployment = useCallback(async (deploymentId: string) => {
    if (!userProgress?.userId) return null;

    try {
      setState(prev => ({ ...prev, deploying: true, error: null }));

      const rollbackDeployment = await deploymentService.rollbackDeployment(
        deploymentId,
        {
          id: userProgress.userId,
          name: userProgress.userName || 'User',
          email: userProgress.userEmail || 'user@smartalk.app',
        }
      );

      setState(prev => ({
        ...prev,
        currentDeployment: rollbackDeployment,
        activeDeployments: [...prev.activeDeployments, rollbackDeployment],
        deploying: false,
      }));

      return rollbackDeployment;

    } catch (error) {
      setState(prev => ({
        ...prev,
        deploying: false,
        error: error.message || '回滚部署失败',
      }));
      return null;
    }
  }, [userProgress]);

  // 获取部署详情
  const getDeploymentDetails = useCallback((deploymentId: string) => {
    return deploymentService.getDeployment(deploymentId);
  }, []);

  // 更新环境配置
  const updateEnvironmentConfig = useCallback((
    environment: DeploymentEnvironment,
    config: Partial<DeploymentConfig>
  ) => {
    deploymentService.updateEnvironmentConfig(environment, config);
    
    const updatedConfig = deploymentService.getEnvironmentConfig(environment);
    if (updatedConfig) {
      setState(prev => ({
        ...prev,
        environmentConfigs: new Map(prev.environmentConfigs).set(environment, updatedConfig),
      }));
    }
  }, []);

  return {
    // 状态
    ...state,
    
    // 方法
    startDeployment,
    rollbackDeployment,
    getDeploymentDetails,
    updateEnvironmentConfig,
    loadDeploymentData,
    
    // 便捷属性
    hasActiveDeployments: state.activeDeployments.length > 0,
    hasDeploymentHistory: state.deploymentHistory.length > 0,
    isHealthy: state.healthCheckResults.every(result => result.healthy),
    unhealthyEnvironments: state.healthCheckResults
      .filter(result => !result.healthy)
      .map(result => result.environment),
  };
};

/**
 * 环境健康监控Hook
 */
export const useEnvironmentHealth = (environment?: DeploymentEnvironment) => {
  const [healthResults, setHealthResults] = useState<HealthCheckResult[]>([]);
  const [loading, setLoading] = useState(false);

  const deploymentService = DeploymentService.getInstance();

  const loadHealthResults = useCallback(async () => {
    try {
      setLoading(true);
      const results = deploymentService.getHealthCheckResults(environment);
      setHealthResults(results);
    } catch (error) {
      console.error('Error loading health results:', error);
    } finally {
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadHealthResults();
    
    // 定期更新健康状态
    const interval = setInterval(loadHealthResults, 30000); // 每30秒更新
    return () => clearInterval(interval);
  }, [loadHealthResults]);

  return {
    healthResults,
    loading,
    reload: loadHealthResults,
    
    // 便捷属性
    isHealthy: healthResults.every(result => result.healthy),
    unhealthyCount: healthResults.filter(result => !result.healthy).length,
    overallHealth: healthResults.length > 0 
      ? healthResults.filter(result => result.healthy).length / healthResults.length 
      : 0,
  };
};

/**
 * 部署历史Hook
 */
export const useDeploymentHistory = (environment?: DeploymentEnvironment) => {
  const [history, setHistory] = useState<DeploymentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const deploymentService = DeploymentService.getInstance();

  const loadHistory = useCallback(() => {
    try {
      setLoading(true);
      const deploymentHistory = deploymentService.getDeploymentHistory(environment);
      setHistory(deploymentHistory);
    } catch (error) {
      console.error('Error loading deployment history:', error);
    } finally {
      setLoading(false);
    }
  }, [environment]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    history,
    loading,
    reload: loadHistory,
    
    // 便捷属性
    totalDeployments: history.length,
    successfulDeployments: history.filter(d => d.success).length,
    failedDeployments: history.filter(d => !d.success).length,
    successRate: history.length > 0 
      ? history.filter(d => d.success).length / history.length 
      : 0,
    recentDeployments: history.slice(0, 10),
  };
};

/**
 * 部署监控Hook
 */
export const useDeploymentMonitoring = (deploymentId?: string) => {
  const [deployment, setDeployment] = useState<DeploymentRecord | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  const deploymentService = DeploymentService.getInstance();

  const startMonitoring = useCallback((id: string) => {
    setMonitoring(true);
    
    const updateDeployment = () => {
      const deploymentData = deploymentService.getDeployment(id);
      setDeployment(deploymentData);
      
      // 如果部署完成，停止监控
      if (deploymentData && 
          (deploymentData.status === 'deployed' || 
           deploymentData.status === 'failed' || 
           deploymentData.status === 'rolled_back')) {
        setMonitoring(false);
        return;
      }
    };

    // 立即更新一次
    updateDeployment();
    
    // 定期更新
    const interval = setInterval(updateDeployment, 2000); // 每2秒更新
    
    return () => {
      clearInterval(interval);
      setMonitoring(false);
    };
  }, []);

  useEffect(() => {
    if (deploymentId) {
      const stopMonitoring = startMonitoring(deploymentId);
      return stopMonitoring;
    }
  }, [deploymentId, startMonitoring]);

  return {
    deployment,
    monitoring,
    startMonitoring,
    
    // 便捷属性
    isActive: deployment && 
              deployment.status !== 'deployed' && 
              deployment.status !== 'failed' && 
              deployment.status !== 'rolled_back',
    progress: deployment ? 
      deployment.steps.filter(s => s.status === 'completed').length / deployment.steps.length * 100 : 0,
    currentStep: deployment?.steps.find(s => s.status === 'running')?.name || null,
  };
};

export default useDeployment;
