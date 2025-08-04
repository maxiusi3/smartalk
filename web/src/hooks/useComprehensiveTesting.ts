/**
 * useComprehensiveTesting - 综合测试管理Hook
 * 集成用户体验测试、功能测试、性能测试和兼容性测试
 */

'use client'

import { useState, useEffect, useCallback } from 'react';
import { 
  userExperienceTestEngine, 
  UserJourney, 
  TestResult as UXTestResult,
  UsabilityTestResult 
} from '../lib/testing/UserExperienceTestEngine';
import { 
  functionalTestEngine, 
  FunctionalTestSuite, 
  FunctionalTestResult 
} from '../lib/testing/FunctionalTestEngine';
import { 
  performanceTestEngine, 
  PerformanceTestConfig, 
  PerformanceTestResult 
} from '../lib/testing/PerformanceTestEngine';
import { 
  compatibilityTestEngine, 
  CompatibilityTestConfig, 
  CompatibilityTestResult,
  BrowserCompatibilityMatrix,
  DeviceCompatibilityReport 
} from '../lib/testing/CompatibilityTestEngine';

export interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'user_experience' | 'functional' | 'performance' | 'compatibility' | 'integration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedDuration: number; // 分钟
  dependencies?: string[];
}

export interface TestExecutionPlan {
  id: string;
  name: string;
  description: string;
  testSuites: TestSuite[];
  totalEstimatedDuration: number;
  executionOrder: string[];
  parallelExecution: boolean;
}

export interface TestExecutionResult {
  planId: string;
  suiteId: string;
  category: TestSuite['category'];
  passed: boolean;
  score: number;
  duration: number;
  issues: TestIssue[];
  recommendations: string[];
  timestamp: string;
}

export interface TestIssue {
  type: 'critical' | 'major' | 'minor' | 'cosmetic';
  category: 'functionality' | 'performance' | 'usability' | 'compatibility' | 'accessibility';
  description: string;
  impact: string;
  solution: string;
  affectedAreas: string[];
}

export interface TestingProgress {
  currentSuite: string | null;
  completedSuites: number;
  totalSuites: number;
  overallProgress: number;
  estimatedTimeRemaining: number;
  currentPhase: 'preparation' | 'execution' | 'analysis' | 'completed';
}

export interface TestingSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallScore: number;
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
  recommendations: string[];
  readinessLevel: 'production_ready' | 'needs_fixes' | 'major_issues' | 'not_ready';
}

export interface UseComprehensiveTestingReturn {
  // 测试状态
  isRunning: boolean;
  progress: TestingProgress | null;
  
  // 测试结果
  testResults: TestExecutionResult[];
  testingSummary: TestingSummary | null;
  
  // 用户体验测试
  uxTestResults: UXTestResult[];
  usabilityResults: UsabilityTestResult[];
  
  // 功能测试
  functionalTestResults: FunctionalTestResult[];
  functionalTestSuites: FunctionalTestSuite[];
  
  // 性能测试
  performanceTestResults: PerformanceTestResult[];
  
  // 兼容性测试
  compatibilityTestResults: CompatibilityTestResult[];
  browserCompatibilityMatrix: BrowserCompatibilityMatrix[];
  deviceCompatibilityReport: DeviceCompatibilityReport[];
  
  // 操作方法
  createTestPlan: (suites: TestSuite[]) => TestExecutionPlan;
  executeTestPlan: (plan: TestExecutionPlan) => Promise<void>;
  executeUserJourneyTest: (journey: UserJourney) => Promise<UXTestResult[]>;
  executeFunctionalTest: (suiteId: string) => Promise<FunctionalTestResult[]>;
  executePerformanceTest: (config: PerformanceTestConfig) => Promise<PerformanceTestResult>;
  executeCompatibilityTest: (config: CompatibilityTestConfig) => Promise<CompatibilityTestResult[]>;
  
  // 分析方法
  generateTestReport: () => string;
  getProductionReadinessAssessment: () => ProductionReadinessAssessment;
  
  // 管理方法
  clearAllResults: () => void;
  stopCurrentTest: () => void;
}

export interface ProductionReadinessAssessment {
  overallReadiness: 'ready' | 'conditional' | 'not_ready';
  score: number; // 0-100
  categories: {
    functionality: number;
    performance: number;
    usability: number;
    compatibility: number;
    accessibility: number;
  };
  blockers: TestIssue[];
  recommendations: string[];
  deploymentRisks: string[];
  nextSteps: string[];
}

export function useComprehensiveTesting(): UseComprehensiveTestingReturn {
  // 状态管理
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<TestingProgress | null>(null);
  const [testResults, setTestResults] = useState<TestExecutionResult[]>([]);
  const [testingSummary, setTestingSummary] = useState<TestingSummary | null>(null);
  
  // 各类测试结果
  const [uxTestResults, setUxTestResults] = useState<UXTestResult[]>([]);
  const [usabilityResults, setUsabilityResults] = useState<UsabilityTestResult[]>([]);
  const [functionalTestResults, setFunctionalTestResults] = useState<FunctionalTestResult[]>([]);
  const [functionalTestSuites, setFunctionalTestSuites] = useState<FunctionalTestSuite[]>([]);
  const [performanceTestResults, setPerformanceTestResults] = useState<PerformanceTestResult[]>([]);
  const [compatibilityTestResults, setCompatibilityTestResults] = useState<CompatibilityTestResult[]>([]);
  const [browserCompatibilityMatrix, setBrowserCompatibilityMatrix] = useState<BrowserCompatibilityMatrix[]>([]);
  const [deviceCompatibilityReport, setDeviceCompatibilityReport] = useState<DeviceCompatibilityReport[]>([]);

  // 初始化测试套件
  useEffect(() => {
    const suites = functionalTestEngine.getTestSuites();
    setFunctionalTestSuites(suites);
  }, []);

  // 创建测试计划
  const createTestPlan = useCallback((suites: TestSuite[]): TestExecutionPlan => {
    const totalDuration = suites.reduce((sum, suite) => sum + suite.estimatedDuration, 0);
    
    // 根据依赖关系和优先级排序
    const sortedSuites = [...suites].sort((a, b) => {
      // 首先按优先级排序
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // 然后按依赖关系排序
      if (a.dependencies?.includes(b.id)) return 1;
      if (b.dependencies?.includes(a.id)) return -1;
      
      return 0;
    });

    return {
      id: `test_plan_${Date.now()}`,
      name: '综合测试计划',
      description: '包含用户体验、功能、性能和兼容性测试的综合测试计划',
      testSuites: sortedSuites,
      totalEstimatedDuration: totalDuration,
      executionOrder: sortedSuites.map(suite => suite.id),
      parallelExecution: false // 暂时不支持并行执行
    };
  }, []);

  // 执行测试计划
  const executeTestPlan = useCallback(async (plan: TestExecutionPlan): Promise<void> => {
    if (isRunning) {
      throw new Error('Another test plan is already running');
    }

    setIsRunning(true);
    setProgress({
      currentSuite: null,
      completedSuites: 0,
      totalSuites: plan.testSuites.length,
      overallProgress: 0,
      estimatedTimeRemaining: plan.totalEstimatedDuration,
      currentPhase: 'preparation'
    });

    const results: TestExecutionResult[] = [];

    try {
      setProgress(prev => prev ? { ...prev, currentPhase: 'execution' } : null);

      for (let i = 0; i < plan.testSuites.length; i++) {
        const suite = plan.testSuites[i];
        
        setProgress(prev => prev ? {
          ...prev,
          currentSuite: suite.name,
          completedSuites: i,
          overallProgress: (i / plan.testSuites.length) * 100
        } : null);

        const startTime = Date.now();
        let result: TestExecutionResult;

        try {
          switch (suite.category) {
            case 'functional':
              const functionalResults = await executeFunctionalTest(suite.id);
              result = convertFunctionalResult(functionalResults[0], suite, plan.id);
              break;
            case 'performance':
              const perfConfig = createDefaultPerformanceConfig(suite.id);
              const perfResult = await executePerformanceTest(perfConfig);
              result = convertPerformanceResult(perfResult, suite, plan.id);
              break;
            case 'compatibility':
              const compatConfig = createDefaultCompatibilityConfig(suite.id);
              const compatResults = await executeCompatibilityTest(compatConfig);
              result = convertCompatibilityResult(compatResults[0], suite, plan.id);
              break;
            case 'user_experience':
              const journey = createDefaultUserJourney(suite.id);
              const uxResults = await executeUserJourneyTest(journey);
              result = convertUXResult(uxResults[0], suite, plan.id);
              break;
            default:
              throw new Error(`Unsupported test suite category: ${suite.category}`);
          }

          result.duration = Date.now() - startTime;
          results.push(result);

        } catch (error) {
          result = {
            planId: plan.id,
            suiteId: suite.id,
            category: suite.category,
            passed: false,
            score: 0,
            duration: Date.now() - startTime,
            issues: [{
              type: 'critical',
              category: 'functionality',
              description: `测试套件执行失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
              impact: '无法评估该测试套件的质量',
              solution: '检查测试配置和环境设置',
              affectedAreas: [suite.name]
            }],
            recommendations: ['检查测试环境配置', '重新运行测试套件'],
            timestamp: new Date().toISOString()
          };
          results.push(result);
        }
      }

      setProgress(prev => prev ? { ...prev, currentPhase: 'analysis' } : null);
      
      // 分析结果并生成总结
      const summary = generateTestingSummary(results);
      setTestingSummary(summary);
      setTestResults(results);

    } finally {
      setProgress(prev => prev ? { 
        ...prev, 
        currentPhase: 'completed',
        completedSuites: plan.testSuites.length,
        overallProgress: 100,
        estimatedTimeRemaining: 0
      } : null);
      setIsRunning(false);
    }
  }, [isRunning]);

  // 执行用户旅程测试
  const executeUserJourneyTest = useCallback(async (journey: UserJourney): Promise<UXTestResult[]> => {
    const results = await userExperienceTestEngine.executeUserJourney(journey);
    setUxTestResults(prev => [...prev, ...results]);
    return results;
  }, []);

  // 执行功能测试
  const executeFunctionalTest = useCallback(async (suiteId: string): Promise<FunctionalTestResult[]> => {
    const results = await functionalTestEngine.executeTestSuite(suiteId);
    setFunctionalTestResults(prev => [...prev, ...results]);
    return results;
  }, []);

  // 执行性能测试
  const executePerformanceTest = useCallback(async (config: PerformanceTestConfig): Promise<PerformanceTestResult> => {
    const result = await performanceTestEngine.executePerformanceTest(config);
    setPerformanceTestResults(prev => [...prev, result]);
    return result;
  }, []);

  // 执行兼容性测试
  const executeCompatibilityTest = useCallback(async (config: CompatibilityTestConfig): Promise<CompatibilityTestResult[]> => {
    const results = await compatibilityTestEngine.executeCompatibilityTest(config);
    setCompatibilityTestResults(prev => [...prev, ...results]);
    
    // 生成兼容性矩阵和报告
    const matrix = compatibilityTestEngine.generateBrowserCompatibilityMatrix(['Focus Mode', 'Pronunciation', 'SRS', 'AI Assistant']);
    const deviceReport = compatibilityTestEngine.generateDeviceCompatibilityReport(results);
    setBrowserCompatibilityMatrix(matrix);
    setDeviceCompatibilityReport(deviceReport);
    
    return results;
  }, []);

  // 生成测试报告
  const generateTestReport = useCallback((): string => {
    if (!testingSummary) return '';

    const report = `
# SmarTalk Web 综合测试报告

## 测试概览
- 总测试数: ${testingSummary.totalTests}
- 通过测试: ${testingSummary.passedTests}
- 失败测试: ${testingSummary.failedTests}
- 整体评分: ${testingSummary.overallScore}/100
- 生产就绪程度: ${testingSummary.readinessLevel}

## 问题统计
- 严重问题: ${testingSummary.criticalIssues}
- 主要问题: ${testingSummary.majorIssues}
- 次要问题: ${testingSummary.minorIssues}

## 主要建议
${testingSummary.recommendations.map(rec => `- ${rec}`).join('\n')}

## 详细结果
${testResults.map(result => `
### ${result.category} 测试
- 通过状态: ${result.passed ? '✅ 通过' : '❌ 失败'}
- 评分: ${result.score}/100
- 持续时间: ${result.duration}ms
- 问题数量: ${result.issues.length}
`).join('\n')}

生成时间: ${new Date().toLocaleString()}
    `.trim();

    return report;
  }, [testingSummary, testResults]);

  // 获取生产就绪评估
  const getProductionReadinessAssessment = useCallback((): ProductionReadinessAssessment => {
    if (!testingSummary) {
      return {
        overallReadiness: 'not_ready',
        score: 0,
        categories: {
          functionality: 0,
          performance: 0,
          usability: 0,
          compatibility: 0,
          accessibility: 0
        },
        blockers: [],
        recommendations: ['请先运行综合测试'],
        deploymentRisks: ['未进行测试验证'],
        nextSteps: ['执行综合测试计划']
      };
    }

    const criticalIssues = testResults.flatMap(result => 
      result.issues.filter(issue => issue.type === 'critical')
    );

    const categories = {
      functionality: calculateCategoryScore('functionality'),
      performance: calculateCategoryScore('performance'),
      usability: calculateCategoryScore('usability'),
      compatibility: calculateCategoryScore('compatibility'),
      accessibility: calculateCategoryScore('accessibility')
    };

    const overallScore = Object.values(categories).reduce((sum, score) => sum + score, 0) / 5;
    
    let overallReadiness: ProductionReadinessAssessment['overallReadiness'];
    if (overallScore >= 90 && criticalIssues.length === 0) {
      overallReadiness = 'ready';
    } else if (overallScore >= 70 && criticalIssues.length <= 2) {
      overallReadiness = 'conditional';
    } else {
      overallReadiness = 'not_ready';
    }

    return {
      overallReadiness,
      score: overallScore,
      categories,
      blockers: criticalIssues,
      recommendations: generateProductionRecommendations(overallReadiness, categories),
      deploymentRisks: generateDeploymentRisks(criticalIssues),
      nextSteps: generateNextSteps(overallReadiness, criticalIssues)
    };
  }, [testingSummary, testResults]);

  // 计算分类评分
  const calculateCategoryScore = (category: string): number => {
    const categoryResults = testResults.filter(result => 
      result.category === category || result.issues.some(issue => issue.category === category)
    );
    
    if (categoryResults.length === 0) return 100;
    
    const totalScore = categoryResults.reduce((sum, result) => sum + result.score, 0);
    return totalScore / categoryResults.length;
  };

  // 清除所有结果
  const clearAllResults = useCallback(() => {
    setTestResults([]);
    setTestingSummary(null);
    setUxTestResults([]);
    setUsabilityResults([]);
    setFunctionalTestResults([]);
    setPerformanceTestResults([]);
    setCompatibilityTestResults([]);
    setBrowserCompatibilityMatrix([]);
    setDeviceCompatibilityReport([]);
    
    // 清除各引擎的结果
    userExperienceTestEngine.clearResults();
    functionalTestEngine.clearResults();
    performanceTestEngine.clearResults();
    compatibilityTestEngine.clearResults();
  }, []);

  // 停止当前测试
  const stopCurrentTest = useCallback(() => {
    setIsRunning(false);
    setProgress(null);
    performanceTestEngine.stopCurrentTest();
  }, []);

  return {
    // 测试状态
    isRunning,
    progress,
    
    // 测试结果
    testResults,
    testingSummary,
    
    // 各类测试结果
    uxTestResults,
    usabilityResults,
    functionalTestResults,
    functionalTestSuites,
    performanceTestResults,
    compatibilityTestResults,
    browserCompatibilityMatrix,
    deviceCompatibilityReport,
    
    // 操作方法
    createTestPlan,
    executeTestPlan,
    executeUserJourneyTest,
    executeFunctionalTest,
    executePerformanceTest,
    executeCompatibilityTest,
    
    // 分析方法
    generateTestReport,
    getProductionReadinessAssessment,
    
    // 管理方法
    clearAllResults,
    stopCurrentTest
  };
}

// 辅助函数
function generateTestingSummary(results: TestExecutionResult[]): TestingSummary {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const failedTests = totalTests - passedTests;
  const overallScore = results.reduce((sum, r) => sum + r.score, 0) / totalTests;
  
  const allIssues = results.flatMap(r => r.issues);
  const criticalIssues = allIssues.filter(i => i.type === 'critical').length;
  const majorIssues = allIssues.filter(i => i.type === 'major').length;
  const minorIssues = allIssues.filter(i => i.type === 'minor').length;
  
  const recommendations = Array.from(new Set(results.flatMap(r => r.recommendations)));
  
  let readinessLevel: TestingSummary['readinessLevel'];
  if (overallScore >= 90 && criticalIssues === 0) {
    readinessLevel = 'production_ready';
  } else if (overallScore >= 70 && criticalIssues <= 2) {
    readinessLevel = 'needs_fixes';
  } else if (overallScore >= 50) {
    readinessLevel = 'major_issues';
  } else {
    readinessLevel = 'not_ready';
  }

  return {
    totalTests,
    passedTests,
    failedTests,
    overallScore,
    criticalIssues,
    majorIssues,
    minorIssues,
    recommendations,
    readinessLevel
  };
}

function convertFunctionalResult(result: FunctionalTestResult, suite: TestSuite, planId: string): TestExecutionResult {
  return {
    planId,
    suiteId: suite.id,
    category: 'functional',
    passed: result.passed,
    score: result.passed ? 100 : 0,
    duration: result.duration,
    issues: result.error ? [{
      type: 'critical',
      category: 'functionality',
      description: result.error,
      impact: '功能无法正常工作',
      solution: '检查功能实现和测试配置',
      affectedAreas: [suite.name]
    }] : [],
    recommendations: result.passed ? [] : ['修复功能问题', '重新运行测试'],
    timestamp: result.timestamp
  };
}

function convertPerformanceResult(result: PerformanceTestResult, suite: TestSuite, planId: string): TestExecutionResult {
  const issues: TestIssue[] = result.thresholdViolations.map(violation => ({
    type: violation.severity as TestIssue['type'],
    category: 'performance',
    description: violation.description,
    impact: '性能不达标，影响用户体验',
    solution: '优化性能瓶颈',
    affectedAreas: [violation.metric]
  }));

  return {
    planId,
    suiteId: suite.id,
    category: 'performance',
    passed: result.passed,
    score: Math.max(0, 100 - (result.thresholdViolations.length * 20)),
    duration: result.duration,
    issues,
    recommendations: result.recommendations.map(rec => rec.title),
    timestamp: result.endTime
  };
}

function convertCompatibilityResult(result: CompatibilityTestResult, suite: TestSuite, planId: string): TestExecutionResult {
  const issues: TestIssue[] = result.issues.map(issue => ({
    type: issue.severity as TestIssue['type'],
    category: 'compatibility',
    description: issue.description,
    impact: '兼容性问题，影响部分用户',
    solution: issue.workaround || '提供兼容性修复',
    affectedAreas: issue.affectedTargets
  }));

  return {
    planId,
    suiteId: suite.id,
    category: 'compatibility',
    passed: result.passed,
    score: result.score,
    duration: result.duration,
    issues,
    recommendations: ['改进兼容性支持', '测试更多设备和浏览器'],
    timestamp: result.timestamp
  };
}

function convertUXResult(result: UXTestResult, suite: TestSuite, planId: string): TestExecutionResult {
  return {
    planId,
    suiteId: suite.id,
    category: 'user_experience',
    passed: result.passed,
    score: result.passed ? 100 : 0,
    duration: result.duration,
    issues: result.error ? [{
      type: 'major',
      category: 'usability',
      description: result.error,
      impact: '用户体验受影响',
      solution: '改进用户界面和交互',
      affectedAreas: [suite.name]
    }] : [],
    recommendations: ['优化用户体验', '改进界面设计'],
    timestamp: result.timestamp
  };
}

function createDefaultPerformanceConfig(suiteId: string): PerformanceTestConfig {
  return {
    id: suiteId,
    name: '默认性能测试',
    type: 'load',
    description: '基础负载测试',
    parameters: {
      concurrentUsers: 10,
      requestsPerSecond: 5,
      rampUpTime: 30
    },
    thresholds: {
      maxResponseTime: 2000,
      maxMemoryUsage: 500,
      maxCpuUsage: 80,
      minThroughput: 1,
      maxErrorRate: 5,
      maxLatency: 1000
    },
    duration: 60000
  };
}

function createDefaultCompatibilityConfig(suiteId: string): CompatibilityTestConfig {
  return {
    id: suiteId,
    name: '默认兼容性测试',
    description: '基础兼容性测试',
    testTargets: [
      {
        type: 'browser',
        name: 'Chrome',
        version: '90+',
        specifications: { userAgent: 'Chrome/90.0', engine: 'Blink' }
      }
    ],
    testScenarios: [],
    criticalFeatures: ['Focus Mode', 'Pronunciation', 'SRS']
  };
}

function createDefaultUserJourney(suiteId: string): UserJourney {
  return {
    id: suiteId,
    name: '默认用户旅程',
    description: '基础用户体验测试',
    category: 'learning',
    priority: 'high',
    steps: []
  };
}

function generateProductionRecommendations(readiness: string, categories: any): string[] {
  const recommendations: string[] = [];
  
  if (readiness === 'not_ready') {
    recommendations.push('修复所有严重问题后再考虑部署');
  }
  
  if (categories.functionality < 80) {
    recommendations.push('改进核心功能的稳定性');
  }
  
  if (categories.performance < 80) {
    recommendations.push('优化系统性能');
  }
  
  return recommendations;
}

function generateDeploymentRisks(criticalIssues: TestIssue[]): string[] {
  const risks: string[] = [];
  
  if (criticalIssues.length > 0) {
    risks.push('存在严重功能问题，可能影响用户体验');
  }
  
  return risks;
}

function generateNextSteps(readiness: string, criticalIssues: TestIssue[]): string[] {
  const steps: string[] = [];
  
  if (criticalIssues.length > 0) {
    steps.push('优先修复严重问题');
  }
  
  if (readiness === 'ready') {
    steps.push('准备生产部署');
  } else {
    steps.push('继续改进和测试');
  }
  
  return steps;
}
