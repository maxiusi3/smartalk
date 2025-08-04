/**
 * 代码质量功能测试页面
 * 测试代码质量分析、重构管理和质量监控功能
 */

'use client'

import React, { useState } from 'react';
import { useCodeQuality } from '../../hooks/useCodeQuality';
import { codeQualityAnalyzer } from '../../lib/quality/CodeQualityAnalyzer';
import { codeRefactoringEngine } from '../../lib/quality/CodeRefactoringEngine';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  timestamp: string;
  duration: number;
}

export default function TestCodeQualityPage() {
  const {
    qualityStatus,
    qualityReport,
    qualityMetrics,
    codeSmells,
    refactoringOpportunities,
    refactoringPlans,
    activeRefactoringPlan,
    refactoringProgress,
    qualityAlerts,
    isAnalyzing,
    isRefactoring,
    analyzeCodeQuality,
    createRefactoringPlan,
    executeRefactoringTask,
    qualityStats
  } = useCodeQuality();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // 添加测试结果
  const addTestResult = (testName: string, passed: boolean, details: string, duration: number) => {
    const result: TestResult = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
      duration
    };
    setTestResults(prev => [...prev, result]);
  };

  // 测试代码质量分析功能
  const testCodeQualityAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      // 执行代码质量分析
      await analyzeCodeQuality();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        qualityReport !== null,
        qualityMetrics !== null,
        codeSmells.length >= 0,
        refactoringOpportunities.length >= 0,
        qualityStatus !== null,
        qualityStatus?.score !== undefined,
        qualityStats !== null
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '代码质量分析',
        allPassed,
        `质量评分: ${qualityStatus?.score || 0}, 代码异味: ${codeSmells.length}, 重构机会: ${refactoringOpportunities.length}, 技术债务: ${qualityStats?.technicalDebtScore || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('代码质量分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试代码异味检测
  const testCodeSmellDetection = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有质量报告
      if (!qualityReport) {
        await analyzeCodeQuality();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const duration = Date.now() - startTime;
      
      const checks = [
        codeSmells !== undefined,
        Array.isArray(codeSmells),
        codeSmells.every(smell => smell.id && smell.type && smell.severity),
        codeSmells.some(smell => smell.suggestion),
        codeSmells.filter(s => s.severity === 'critical').length >= 0
      ];
      
      const allPassed = checks.every(check => check);
      
      const severityCount = {
        critical: codeSmells.filter(s => s.severity === 'critical').length,
        major: codeSmells.filter(s => s.severity === 'major').length,
        minor: codeSmells.filter(s => s.severity === 'minor').length,
        info: codeSmells.filter(s => s.severity === 'info').length
      };
      
      addTestResult(
        '代码异味检测',
        allPassed,
        `总异味: ${codeSmells.length}, 严重: ${severityCount.critical}, 主要: ${severityCount.major}, 次要: ${severityCount.minor}, 信息: ${severityCount.info}`,
        duration
      );
    } catch (error) {
      addTestResult('代码异味检测', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试重构计划创建
  const testRefactoringPlanCreation = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有重构机会
      if (refactoringOpportunities.length === 0) {
        await analyzeCodeQuality();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 创建重构计划
      const plan = await createRefactoringPlan();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        plan !== null,
        plan.planId !== undefined,
        plan.tasks.length > 0,
        plan.phases.length > 0,
        plan.estimatedTotalEffort > 0,
        activeRefactoringPlan !== null,
        refactoringPlans.length > 0
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '重构计划创建',
        allPassed,
        `计划ID: ${plan?.planId || 'N/A'}, 任务数: ${plan?.tasks.length || 0}, 阶段数: ${plan?.phases.length || 0}, 预计工作量: ${plan?.estimatedTotalEffort || 0}h`,
        duration
      );
    } catch (error) {
      addTestResult('重构计划创建', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试重构任务执行
  const testRefactoringTaskExecution = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有活跃的重构计划
      if (!activeRefactoringPlan) {
        await createRefactoringPlan();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      if (!activeRefactoringPlan || activeRefactoringPlan.tasks.length === 0) {
        throw new Error('No active refactoring plan or tasks available');
      }
      
      // 执行第一个待处理的任务
      const pendingTask = activeRefactoringPlan.tasks.find(t => t.status === 'pending');
      if (!pendingTask) {
        throw new Error('No pending tasks available');
      }
      
      const result = await executeRefactoringTask(pendingTask.id);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duration = Date.now() - startTime;
      
      const checks = [
        result !== null,
        result.success === true,
        result.filesModified.length > 0,
        result.linesChanged > 0,
        result.improvements !== undefined,
        refactoringProgress !== null,
        refactoringProgress?.completedTasks > 0
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '重构任务执行',
        allPassed,
        `任务: ${pendingTask.title}, 成功: ${result?.success}, 修改文件: ${result?.filesModified.length || 0}, 修改行数: ${result?.linesChanged || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('重构任务执行', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试质量警报系统
  const testQualityAlertSystem = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有质量分析结果
      if (!qualityReport) {
        await analyzeCodeQuality();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const duration = Date.now() - startTime;
      
      const checks = [
        qualityAlerts !== undefined,
        Array.isArray(qualityAlerts),
        qualityAlerts.every(alert => alert.id && alert.type && alert.severity),
        qualityAlerts.every(alert => alert.title && alert.description),
        qualityAlerts.filter(a => a.severity === 'critical').length >= 0
      ];
      
      const allPassed = checks.every(check => check);
      
      const alertTypes = {
        code_smell: qualityAlerts.filter(a => a.type === 'code_smell').length,
        refactoring_needed: qualityAlerts.filter(a => a.type === 'refactoring_needed').length,
        quality_decline: qualityAlerts.filter(a => a.type === 'quality_decline').length,
        technical_debt: qualityAlerts.filter(a => a.type === 'technical_debt').length
      };
      
      addTestResult(
        '质量警报系统',
        allPassed,
        `总警报: ${qualityAlerts.length}, 代码异味: ${alertTypes.code_smell}, 重构需求: ${alertTypes.refactoring_needed}, 质量下降: ${alertTypes.quality_decline}, 技术债务: ${alertTypes.technical_debt}`,
        duration
      );
    } catch (error) {
      addTestResult('质量警报系统', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试质量指标计算
  const testQualityMetricsCalculation = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有质量指标
      if (!qualityMetrics) {
        await analyzeCodeQuality();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const duration = Date.now() - startTime;
      
      const checks = [
        qualityMetrics !== null,
        qualityMetrics?.cyclomaticComplexity !== undefined,
        qualityMetrics?.maintainabilityIndex !== undefined,
        qualityMetrics?.technicalDebt !== undefined,
        qualityMetrics?.typeScriptCoverage !== undefined,
        qualityMetrics?.bundleSize !== undefined,
        qualityMetrics?.commentCoverage !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '质量指标计算',
        allPassed,
        `圈复杂度: ${qualityMetrics?.cyclomaticComplexity.toFixed(1) || 0}, 可维护性: ${qualityMetrics?.maintainabilityIndex || 0}, TS覆盖率: ${qualityMetrics?.typeScriptCoverage || 0}%, 打包大小: ${qualityMetrics?.bundleSize || 0}KB`,
        duration
      );
    } catch (error) {
      addTestResult('质量指标计算', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 测试架构分析
  const testArchitectureAnalysis = async () => {
    const startTime = Date.now();
    
    try {
      // 确保有质量报告
      if (!qualityReport) {
        await analyzeCodeQuality();
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const duration = Date.now() - startTime;
      
      const architecture = qualityReport?.architecture;
      
      const checks = [
        architecture !== undefined,
        architecture?.overallHealth !== undefined,
        architecture?.modularity !== undefined,
        architecture?.dependencies !== undefined,
        architecture?.designPatterns !== undefined,
        architecture?.violations !== undefined
      ];
      
      const allPassed = checks.every(check => check);
      
      addTestResult(
        '架构分析',
        allPassed,
        `架构健康度: ${architecture?.overallHealth || 0}, 模块化评分: ${architecture?.modularity.score || 0}, 循环依赖: ${architecture?.dependencies.circularDependencies || 0}, 设计模式: ${architecture?.designPatterns.identified.length || 0}`,
        duration
      );
    } catch (error) {
      addTestResult('架构分析', false, `错误: ${error}`, Date.now() - startTime);
    }
  };

  // 运行所有测试
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);

    try {
      await testCodeQualityAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testCodeSmellDetection();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testQualityMetricsCalculation();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testArchitectureAnalysis();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testQualityAlertSystem();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testRefactoringPlanCreation();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await testRefactoringTaskExecution();
      
    } catch (error) {
      console.error('Code quality tests failed:', error);
    } finally {
      setIsRunningTests(false);
    }
  };

  // 计算测试统计
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔧 代码质量功能测试
          </h1>
          <p className="text-gray-300 text-lg">
            验证代码质量分析、重构管理和质量监控功能
          </p>
        </div>

        {/* 代码质量状态概览 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">代码质量状态</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 质量状态 */}
            <div className="bg-purple-900/20 border border-purple-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">质量状态</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">整体评分:</span>
                  <span className={qualityStatus ? 'text-purple-400' : 'text-gray-400'}>
                    {qualityStatus?.score || '未知'}/100
                  </span>
                </div>
                {qualityStatus && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-300">质量等级:</span>
                      <span className="text-white">{
                        qualityStatus.overall === 'excellent' ? '优秀' :
                        qualityStatus.overall === 'good' ? '良好' :
                        qualityStatus.overall === 'fair' ? '一般' :
                        qualityStatus.overall === 'poor' ? '较差' : '严重'
                      }</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">趋势:</span>
                      <span className="text-white">{
                        qualityStatus.trendsDirection === 'improving' ? '改善' :
                        qualityStatus.trendsDirection === 'stable' ? '稳定' : '下降'
                      }</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 代码异味 */}
            <div className="bg-orange-900/20 border border-orange-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-300 mb-3">代码异味</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">总数量:</span>
                  <span className="text-white">{codeSmells.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">严重问题:</span>
                  <span className="text-white">{codeSmells.filter(s => s.severity === 'critical').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">主要问题:</span>
                  <span className="text-white">{codeSmells.filter(s => s.severity === 'major').length}</span>
                </div>
              </div>
            </div>

            {/* 重构管理 */}
            <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">重构管理</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">重构机会:</span>
                  <span className="text-white">{refactoringOpportunities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">活跃计划:</span>
                  <span className="text-white">{activeRefactoringPlan ? '1' : '0'}</span>
                </div>
                {refactoringProgress && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">进度:</span>
                    <span className="text-white">{refactoringProgress.completionPercentage.toFixed(0)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* 质量警报 */}
            <div className="bg-red-900/20 border border-red-400 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-3">质量警报</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">警报总数:</span>
                  <span className="text-white">{qualityAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">严重警报:</span>
                  <span className="text-white">{qualityAlerts.filter(a => a.severity === 'critical').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">技术债务:</span>
                  <span className="text-white">{qualityStats?.technicalDebtScore || 0}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试控制面板 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isRunningTests ? '运行中...' : '🚀 运行所有质量测试'}
            </button>
            
            <button
              onClick={testCodeQualityAnalysis}
              disabled={isRunningTests}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🔍 测试质量分析
            </button>
            
            <button
              onClick={testCodeSmellDetection}
              disabled={isRunningTests}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🚨 测试异味检测
            </button>
            
            <button
              onClick={testRefactoringPlanCreation}
              disabled={isRunningTests}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              🔧 测试重构计划
            </button>
            
            <button
              onClick={() => setTestResults([])}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              🗑️ 清除结果
            </button>
          </div>

          {/* 测试统计 */}
          {totalTests > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">测试统计</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{totalTests}</div>
                  <div className="text-sm text-gray-300">总测试数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{passedTests}</div>
                  <div className="text-sm text-gray-300">通过测试</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${parseFloat(passRate) >= 90 ? 'text-green-400' : parseFloat(passRate) >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {passRate}%
                  </div>
                  <div className="text-sm text-gray-300">通过率</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">代码质量功能测试结果</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-400 text-center py-8">点击上方按钮开始代码质量功能测试</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.passed 
                      ? 'bg-green-900/20 border-green-400' 
                      : 'bg-red-900/20 border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white">
                      {result.passed ? '✅' : '❌'} {result.testName}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>⏱️ {result.duration}ms</span>
                      <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{result.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 返回链接 */}
        <div className="text-center">
          <a
            href="/code-quality"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            🔧 代码质量管理中心
          </a>
          <a
            href="/system-optimization"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            ⚡ 系统优化监控
          </a>
          <a
            href="/advanced-analytics"
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors mr-4"
          >
            📊 高级数据分析
          </a>
          <a
            href="/learning/vtpr?interest=travel&keyword=hello"
            className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            📖 返回学习
          </a>
        </div>
      </div>
    </div>
  );
}
