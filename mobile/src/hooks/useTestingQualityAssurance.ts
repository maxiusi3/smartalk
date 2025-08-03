/**
 * useTestingQualityAssurance - V2 测试和质量保证Hook
 * 提供组件级别的测试和质量保证功能
 * 自动处理测试执行、质量监控、报告生成
 */

import { useEffect, useCallback, useState } from 'react';
import TestingQualityAssuranceService, { 
  TestSuite, 
  TestResult, 
  QualityMetrics, 
  QualityReport,
  TestType,
  TestStatus,
  TestPriority
} from '@/services/TestingQualityAssuranceService';
import { useUserState } from '@/contexts/UserStateContext';

interface TestingState {
  // 测试套件
  testSuites: TestSuite[];
  currentSuite: TestSuite | null;
  
  // 测试结果
  testResults: Map<string, TestResult[]>;
  currentResults: TestResult[];
  
  // 质量指标
  qualityMetrics: QualityMetrics | null;
  qualityReport: QualityReport | null;
  qualityHistory: QualityReport[];
  
  // 执行状态
  isRunning: boolean;
  runningTests: string[];
  
  // 错误状态
  error: string | null;
  loading: boolean;
}

/**
 * 测试和质量保证Hook
 */
export const useTestingQualityAssurance = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<TestingState>({
    testSuites: [],
    currentSuite: null,
    testResults: new Map(),
    currentResults: [],
    qualityMetrics: null,
    qualityReport: null,
    qualityHistory: [],
    isRunning: false,
    runningTests: [],
    error: null,
    loading: false,
  });

  const testingService = TestingQualityAssuranceService.getInstance();

  // 初始化
  useEffect(() => {
    loadTestSuites();
    loadQualityData();
  }, []);

  const loadTestSuites = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const suites = testingService.getTestSuites();
      
      setState(prev => ({
        ...prev,
        testSuites: suites,
        loading: false,
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载测试套件失败',
      }));
    }
  }, []);

  const loadQualityData = useCallback(async () => {
    try {
      const metrics = testingService.getCurrentQualityMetrics();
      const report = testingService.getLatestQualityReport();
      const history = testingService.getQualityHistory();
      
      setState(prev => ({
        ...prev,
        qualityMetrics: metrics,
        qualityReport: report,
        qualityHistory: history,
      }));
      
    } catch (error) {
      console.error('Error loading quality data:', error);
    }
  }, []);

  // 运行测试套件
  const runTestSuite = useCallback(async (suiteId: string) => {
    try {
      setState(prev => ({ 
        ...prev, 
        isRunning: true, 
        error: null,
        runningTests: [...prev.runningTests, suiteId]
      }));
      
      const results = await testingService.runTestSuite(suiteId);
      
      setState(prev => ({
        ...prev,
        testResults: new Map(prev.testResults).set(suiteId, results),
        currentResults: results,
        isRunning: false,
        runningTests: prev.runningTests.filter(id => id !== suiteId),
      }));
      
      // 更新测试套件状态
      await loadTestSuites();
      
      return results;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        runningTests: prev.runningTests.filter(id => id !== suiteId),
        error: error.message || '运行测试失败',
      }));
      throw error;
    }
  }, [loadTestSuites]);

  // 运行所有测试
  const runAllTests = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isRunning: true, error: null }));
      
      const allResults = await testingService.runAllTests();
      
      setState(prev => ({
        ...prev,
        testResults: allResults,
        isRunning: false,
      }));
      
      // 更新测试套件状态
      await loadTestSuites();
      await loadQualityData();
      
      return allResults;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRunning: false,
        error: error.message || '运行所有测试失败',
      }));
      throw error;
    }
  }, [loadTestSuites, loadQualityData]);

  // 获取测试结果
  const getTestResults = useCallback((suiteId: string) => {
    return testingService.getTestResults(suiteId);
  }, []);

  // 选择测试套件
  const selectTestSuite = useCallback((suiteId: string) => {
    const suite = state.testSuites.find(s => s.id === suiteId);
    const results = state.testResults.get(suiteId) || [];
    
    setState(prev => ({
      ...prev,
      currentSuite: suite || null,
      currentResults: results,
    }));
  }, [state.testSuites, state.testResults]);

  // 刷新质量数据
  const refreshQualityData = useCallback(async () => {
    await loadQualityData();
  }, [loadQualityData]);

  return {
    // 状态
    ...state,
    
    // 方法
    runTestSuite,
    runAllTests,
    getTestResults,
    selectTestSuite,
    refreshQualityData,
    loadTestSuites,
    
    // 便捷属性
    hasTests: state.testSuites.length > 0,
    totalTests: state.testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
    passedTests: Array.from(state.testResults.values()).flat().filter(r => r.passed).length,
    failedTests: Array.from(state.testResults.values()).flat().filter(r => !r.passed && r.status !== 'skipped').length,
    
    // 质量指标便捷访问
    overallScore: state.qualityReport?.overallScore || 0,
    qualityGrade: state.qualityReport?.grade || 'F',
    coverageScore: state.qualityMetrics?.coverage.lines || 0,
    performanceScore: state.qualityMetrics?.performance.averageLoadTime ? 
      (state.qualityMetrics.performance.averageLoadTime < 2000 ? 100 : 50) : 0,
    accessibilityScore: state.qualityMetrics?.accessibility.overallScore || 0,
  };
};

/**
 * 测试执行Hook
 */
export const useTestExecution = () => {
  const [executionState, setExecutionState] = useState({
    currentTest: null as TestResult | null,
    isRunning: false,
    progress: 0,
    logs: [] as string[],
  });

  const testingService = TestingQualityAssuranceService.getInstance();

  const executeTest = useCallback(async (suiteId: string, testId?: string) => {
    try {
      setExecutionState(prev => ({ 
        ...prev, 
        isRunning: true, 
        progress: 0,
        logs: ['开始执行测试...']
      }));

      let results: TestResult[];
      
      if (testId) {
        // 运行单个测试（需要扩展服务支持）
        results = await testingService.runTestSuite(suiteId);
        results = results.filter(r => r.id.includes(testId));
      } else {
        // 运行整个套件
        results = await testingService.runTestSuite(suiteId);
      }

      setExecutionState(prev => ({
        ...prev,
        isRunning: false,
        progress: 100,
        currentTest: results[0] || null,
        logs: [...prev.logs, '测试执行完成'],
      }));

      return results;

    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        isRunning: false,
        logs: [...prev.logs, `测试执行失败: ${error.message}`],
      }));
      throw error;
    }
  }, []);

  const clearLogs = useCallback(() => {
    setExecutionState(prev => ({ ...prev, logs: [] }));
  }, []);

  return {
    ...executionState,
    executeTest,
    clearLogs,
  };
};

/**
 * 质量监控Hook
 */
export const useQualityMonitoring = () => {
  const [qualityState, setQualityState] = useState({
    metrics: null as QualityMetrics | null,
    report: null as QualityReport | null,
    history: [] as QualityReport[],
    monitoring: false,
    alerts: [] as string[],
  });

  const testingService = TestingQualityAssuranceService.getInstance();

  const startMonitoring = useCallback(() => {
    setQualityState(prev => ({ ...prev, monitoring: true }));
    
    // 定期更新质量数据
    const interval = setInterval(() => {
      const metrics = testingService.getCurrentQualityMetrics();
      const report = testingService.getLatestQualityReport();
      const history = testingService.getQualityHistory();
      
      setQualityState(prev => ({
        ...prev,
        metrics,
        report,
        history,
      }));
      
      // 检查质量警报
      if (report && report.overallScore < 80) {
        setQualityState(prev => ({
          ...prev,
          alerts: [...prev.alerts, `质量评分低于80分: ${report.overallScore.toFixed(1)}`],
        }));
      }
    }, 30000); // 每30秒更新一次

    return () => {
      clearInterval(interval);
      setQualityState(prev => ({ ...prev, monitoring: false }));
    };
  }, []);

  const clearAlerts = useCallback(() => {
    setQualityState(prev => ({ ...prev, alerts: [] }));
  }, []);

  return {
    ...qualityState,
    startMonitoring,
    clearAlerts,
  };
};

/**
 * 测试报告Hook
 */
export const useTestReporting = () => {
  const [reportState, setReportState] = useState({
    generating: false,
    reports: [] as any[],
    currentReport: null as any,
  });

  const generateTestReport = useCallback(async (suiteIds: string[]) => {
    try {
      setReportState(prev => ({ ...prev, generating: true }));

      const testingService = TestingQualityAssuranceService.getInstance();
      
      // 收集测试数据
      const reportData = {
        timestamp: new Date().toISOString(),
        suites: suiteIds.map(id => {
          const suite = testingService.getTestSuites().find(s => s.id === id);
          const results = testingService.getTestResults(id);
          return { suite, results };
        }),
        qualityMetrics: testingService.getCurrentQualityMetrics(),
        qualityReport: testingService.getLatestQualityReport(),
      };

      // 生成报告
      const report = {
        id: `report_${Date.now()}`,
        ...reportData,
        summary: {
          totalSuites: suiteIds.length,
          totalTests: reportData.suites.reduce((sum, s) => sum + (s.results?.length || 0), 0),
          passedTests: reportData.suites.reduce((sum, s) => 
            sum + (s.results?.filter(r => r.passed).length || 0), 0),
          failedTests: reportData.suites.reduce((sum, s) => 
            sum + (s.results?.filter(r => !r.passed && r.status !== 'skipped').length || 0), 0),
        },
      };

      setReportState(prev => ({
        ...prev,
        generating: false,
        reports: [...prev.reports, report],
        currentReport: report,
      }));

      return report;

    } catch (error) {
      setReportState(prev => ({ ...prev, generating: false }));
      throw error;
    }
  }, []);

  const exportReport = useCallback((report: any, format: 'json' | 'html' | 'pdf' = 'json') => {
    // 模拟报告导出
    const exportData = {
      format,
      data: report,
      exportedAt: new Date().toISOString(),
    };

    console.log('Exporting report:', exportData);
    return exportData;
  }, []);

  return {
    ...reportState,
    generateTestReport,
    exportReport,
  };
};

/**
 * 测试配置Hook
 */
export const useTestConfiguration = () => {
  const [config, setConfig] = useState({
    environment: 'development' as string,
    timeout: 30000,
    retries: 2,
    parallel: false,
    tags: [] as string[],
    coverage: true,
    performance: true,
    accessibility: true,
  });

  const updateConfig = useCallback((updates: Partial<typeof config>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      environment: 'development',
      timeout: 30000,
      retries: 2,
      parallel: false,
      tags: [],
      coverage: true,
      performance: true,
      accessibility: true,
    });
  }, []);

  return {
    config,
    updateConfig,
    resetConfig,
  };
};

export default useTestingQualityAssurance;
