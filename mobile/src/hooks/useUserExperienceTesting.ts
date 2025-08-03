/**
 * useUserExperienceTesting - V2 用户体验测试Hook
 * 提供组件级别的用户体验测试功能
 * 自动处理测试会话、结果收集、内容验证
 */

import { useEffect, useCallback, useState, useRef } from 'react';
import UserExperienceValidationService, { 
  TestType,
  TestSession,
  TestResult,
  UserPersona,
  ContentValidationResult,
  TestScenario
} from '@/services/UserExperienceValidationService';
import { useUserState } from '@/contexts/UserStateContext';
import { ContentTheme } from '@/services/ContentManagementService';

// 用户体验测试Hook状态
interface UXTestingState {
  // 当前测试会话
  activeSession: TestSession | null;
  currentScenario: TestScenario | null;
  
  // 测试历史和统计
  testHistory: TestSession[];
  testStatistics: any;
  
  // 内容验证
  contentValidationResults: ContentValidationResult[];
  
  // 用户画像
  userPersonas: UserPersona[];
  
  // 状态
  loading: boolean;
  error: string | null;
  isTestingActive: boolean;
}

/**
 * 用户体验测试Hook
 */
export const useUserExperienceTesting = () => {
  const { userProgress } = useUserState();
  
  const [state, setState] = useState<UXTestingState>({
    activeSession: null,
    currentScenario: null,
    testHistory: [],
    testStatistics: null,
    contentValidationResults: [],
    userPersonas: [],
    loading: false,
    error: null,
    isTestingActive: false,
  });

  const uxValidationService = UserExperienceValidationService.getInstance();
  const testTimer = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    if (userProgress?.userId) {
      loadTestingData();
    }
  }, [userProgress?.userId]);

  const loadTestingData = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载测试历史
      const testHistory = uxValidationService.getUserTestHistory(userProgress.userId);
      
      // 加载测试统计
      const testStatistics = uxValidationService.getTestStatistics();
      
      // 加载内容验证结果
      const contentValidationResults = uxValidationService.getAllContentValidationResults();
      
      // 加载用户画像
      const userPersonas = uxValidationService.getAllUserPersonas();

      setState(prev => ({
        ...prev,
        testHistory,
        testStatistics,
        contentValidationResults,
        userPersonas,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载测试数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // 开始测试会话
  const startTestSession = useCallback(async (testType: TestType, personaId?: string) => {
    if (!userProgress?.userId) return null;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const sessionId = await uxValidationService.startTestSession(
        testType,
        userProgress.userId,
        personaId
      );
      
      const session = uxValidationService.getTestSession(sessionId);
      const currentScenario = session?.testScenarios[0] || null;

      setState(prev => ({
        ...prev,
        activeSession: session,
        currentScenario,
        isTestingActive: true,
        loading: false,
      }));

      // 开始测试计时器
      startTestTimer(sessionId);

      return sessionId;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '开始测试失败',
      }));
      return null;
    }
  }, [userProgress?.userId]);

  // 开始测试计时器
  const startTestTimer = useCallback((sessionId: string) => {
    testTimer.current = setInterval(() => {
      const session = uxValidationService.getTestSession(sessionId);
      if (session) {
        const currentScenario = session.testScenarios[session.currentScenarioIndex];
        setState(prev => ({
          ...prev,
          activeSession: session,
          currentScenario,
        }));
      }
    }, 1000); // 每秒更新一次
  }, []);

  // 停止测试计时器
  const stopTestTimer = useCallback(() => {
    if (testTimer.current) {
      clearInterval(testTimer.current);
      testTimer.current = null;
    }
  }, []);

  // 记录测试步骤结果
  const recordStepResult = useCallback(async (
    scenarioId: string,
    stepId: string,
    result: Partial<TestResult>
  ) => {
    if (!state.activeSession) return;

    try {
      await uxValidationService.recordStepResult(
        state.activeSession.sessionId,
        scenarioId,
        stepId,
        result
      );

      // 更新本地状态
      const updatedSession = uxValidationService.getTestSession(state.activeSession.sessionId);
      setState(prev => ({
        ...prev,
        activeSession: updatedSession,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '记录测试结果失败',
      }));
    }
  }, [state.activeSession]);

  // 移动到下一个场景
  const moveToNextScenario = useCallback(() => {
    if (!state.activeSession) return false;

    const nextIndex = state.activeSession.currentScenarioIndex + 1;
    if (nextIndex >= state.activeSession.testScenarios.length) {
      return false; // 没有更多场景
    }

    const nextScenario = state.activeSession.testScenarios[nextIndex];
    state.activeSession.currentScenarioIndex = nextIndex;

    setState(prev => ({
      ...prev,
      currentScenario: nextScenario,
    }));

    return true;
  }, [state.activeSession]);

  // 完成测试会话
  const completeTestSession = useCallback(async () => {
    if (!state.activeSession) return null;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const completedSession = await uxValidationService.completeTestSession(
        state.activeSession.sessionId
      );

      setState(prev => ({
        ...prev,
        activeSession: null,
        currentScenario: null,
        isTestingActive: false,
        loading: false,
      }));

      stopTestTimer();

      // 重新加载数据
      await loadTestingData();

      return completedSession;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '完成测试失败',
      }));
      return null;
    }
  }, [state.activeSession, stopTestTimer, loadTestingData]);

  // 取消测试会话
  const cancelTestSession = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeSession: null,
      currentScenario: null,
      isTestingActive: false,
    }));

    stopTestTimer();
  }, [stopTestTimer]);

  // 验证内容质量
  const validateContent = useCallback(async (
    themeId: ContentTheme,
    validationData: Partial<ContentValidationResult>
  ) => {
    try {
      await uxValidationService.validateThemeContent(themeId, validationData);
      
      // 重新加载验证结果
      const updatedResults = uxValidationService.getAllContentValidationResults();
      setState(prev => ({
        ...prev,
        contentValidationResults: updatedResults,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error.message || '内容验证失败',
      }));
    }
  }, []);

  // 获取测试会话
  const getTestSession = useCallback((sessionId: string) => {
    return uxValidationService.getTestSession(sessionId);
  }, []);

  // 清除错误
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // 清理资源
  useEffect(() => {
    return () => {
      stopTestTimer();
    };
  }, [stopTestTimer]);

  return {
    // 状态
    ...state,
    
    // 测试会话管理
    startTestSession,
    completeTestSession,
    cancelTestSession,
    recordStepResult,
    moveToNextScenario,
    
    // 内容验证
    validateContent,
    
    // 工具方法
    getTestSession,
    loadTestingData,
    clearError,
    
    // 便捷属性
    hasActiveSession: !!state.activeSession,
    testProgress: state.activeSession ? 
      ((state.activeSession.currentScenarioIndex + 1) / state.activeSession.testScenarios.length) * 100 : 0,
    remainingScenarios: state.activeSession ? 
      state.activeSession.testScenarios.length - state.activeSession.currentScenarioIndex - 1 : 0,
    sessionDuration: state.activeSession ? 
      Math.floor((Date.now() - new Date(state.activeSession.startedAt).getTime()) / 1000) : 0,
  };
};

/**
 * 测试场景执行Hook
 */
export const useTestScenarioExecution = (sessionId?: string) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepResults, setStepResults] = useState<{ [stepId: string]: Partial<TestResult> }>({});
  const [scenarioStartTime, setScenarioStartTime] = useState<number>(0);

  const uxValidationService = UserExperienceValidationService.getInstance();

  const session = sessionId ? uxValidationService.getTestSession(sessionId) : null;
  const currentScenario = session?.testScenarios[session.currentScenarioIndex];

  useEffect(() => {
    if (currentScenario) {
      setCurrentStep(0);
      setStepResults({});
      setScenarioStartTime(Date.now());
    }
  }, [currentScenario]);

  const recordStepResult = useCallback((stepId: string, result: Partial<TestResult>) => {
    setStepResults(prev => ({
      ...prev,
      [stepId]: result,
    }));
  }, []);

  const moveToNextStep = useCallback(() => {
    if (!currentScenario || currentStep >= currentScenario.steps.length - 1) {
      return false;
    }
    
    setCurrentStep(prev => prev + 1);
    return true;
  }, [currentScenario, currentStep]);

  const getCurrentStep = useCallback(() => {
    return currentScenario?.steps[currentStep] || null;
  }, [currentScenario, currentStep]);

  const getStepProgress = useCallback(() => {
    if (!currentScenario) return 0;
    return ((currentStep + 1) / currentScenario.steps.length) * 100;
  }, [currentScenario, currentStep]);

  return {
    session,
    currentScenario,
    currentStep: getCurrentStep(),
    stepProgress: getStepProgress(),
    stepResults,
    scenarioStartTime,
    recordStepResult,
    moveToNextStep,
    
    // 便捷属性
    isLastStep: currentScenario ? currentStep >= currentScenario.steps.length - 1 : false,
    totalSteps: currentScenario?.steps.length || 0,
    completedSteps: currentStep + 1,
  };
};

/**
 * 内容验证Hook
 */
export const useContentValidation = () => {
  const { contentValidationResults, validateContent, loading, error } = useUserExperienceTesting();

  const getValidationResult = useCallback((themeId: ContentTheme) => {
    return contentValidationResults.find(result => result.themeId === themeId) || null;
  }, [contentValidationResults]);

  const getOverallValidationScore = useCallback(() => {
    if (contentValidationResults.length === 0) return 0;
    
    const totalScore = contentValidationResults.reduce((sum, result) => {
      return sum + (
        result.accuracyScore * 0.3 +
        result.relevanceScore * 0.3 +
        result.engagementScore * 0.4
      );
    }, 0);
    
    return Math.round((totalScore / contentValidationResults.length) * 100);
  }, [contentValidationResults]);

  const getValidationSummary = useCallback(() => {
    const total = contentValidationResults.length;
    const highQuality = contentValidationResults.filter(r => r.engagementScore > 0.8).length;
    const needsImprovement = contentValidationResults.filter(r => r.engagementScore < 0.6).length;
    
    return {
      total,
      highQuality,
      needsImprovement,
      averageEngagement: contentValidationResults.length > 0 ? 
        contentValidationResults.reduce((sum, r) => sum + r.engagementScore, 0) / total : 0,
    };
  }, [contentValidationResults]);

  return {
    contentValidationResults,
    loading,
    error,
    validateContent,
    getValidationResult,
    getOverallValidationScore,
    getValidationSummary,
  };
};

export default useUserExperienceTesting;
