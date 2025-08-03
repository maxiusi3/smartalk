import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTestingQualityAssurance, useTestExecution, useQualityMonitoring } from '@/hooks/useTestingQualityAssurance';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { TestSuite, TestResult, TestStatus } from '@/services/TestingQualityAssuranceService';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * TestingConsoleScreen - V2 测试控制台界面
 * 提供完整的测试管理体验：测试执行、结果查看、质量监控
 */
const TestingConsoleScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 测试管理
  const {
    testSuites,
    currentSuite,
    currentResults,
    isRunning,
    runningTests,
    error,
    overallScore,
    qualityGrade,
    coverageScore,
    performanceScore,
    accessibilityScore,
    runTestSuite,
    runAllTests,
    selectTestSuite,
    refreshQualityData,
  } = useTestingQualityAssurance();

  // 测试执行
  const {
    currentTest,
    isRunning: isExecuting,
    progress,
    logs,
    executeTest,
    clearLogs,
  } = useTestExecution();

  // 质量监控
  const {
    metrics,
    report,
    monitoring,
    alerts,
    startMonitoring,
    clearAlerts,
  } = useQualityMonitoring();

  const [activeTab, setActiveTab] = useState<'suites' | 'results' | 'quality' | 'logs'>('suites');
  const [selectedSuites, setSelectedSuites] = useState<string[]>([]);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('测试控制台', '管理和执行应用测试');
    
    // 开始质量监控
    const stopMonitoring = startMonitoring();
    
    analyticsService.track('testing_console_viewed', {
      testSuitesCount: testSuites.length,
      timestamp: Date.now(),
    });

    return stopMonitoring;
  }, []);

  const handleRunSuite = async (suiteId: string) => {
    try {
      await runTestSuite(suiteId);
      screenReader.announceSuccess('测试套件执行完成');
    } catch (error) {
      Alert.alert('错误', '测试执行失败: ' + error.message);
      screenReader.announceError('测试执行失败');
    }
  };

  const handleRunAllTests = async () => {
    try {
      await runAllTests();
      screenReader.announceSuccess('所有测试执行完成');
    } catch (error) {
      Alert.alert('错误', '测试执行失败: ' + error.message);
      screenReader.announceError('测试执行失败');
    }
  };

  const handleRunSelectedTests = async () => {
    if (selectedSuites.length === 0) {
      Alert.alert('提示', '请选择要运行的测试套件');
      return;
    }

    try {
      for (const suiteId of selectedSuites) {
        await runTestSuite(suiteId);
      }
      screenReader.announceSuccess('选中的测试套件执行完成');
    } catch (error) {
      Alert.alert('错误', '测试执行失败: ' + error.message);
      screenReader.announceError('测试执行失败');
    }
  };

  const toggleSuiteSelection = (suiteId: string) => {
    setSelectedSuites(prev => 
      prev.includes(suiteId) 
        ? prev.filter(id => id !== suiteId)
        : [...prev, suiteId]
    );
  };

  const getStatusColor = (status: TestStatus): string => {
    switch (status) {
      case 'passed': return '#10b981';
      case 'failed': return '#ef4444';
      case 'running': return '#3b82f6';
      case 'pending': return '#94a3b8';
      case 'skipped': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: TestStatus): string => {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'running': return '🔄';
      case 'pending': return '⏳';
      case 'skipped': return '⏭';
      default: return '❓';
    }
  };

  const renderTabBar = () => (
    <AccessibilityWrapper
      accessibilityRole="tablist"
      accessibilityLabel="测试控制台标签"
      applyHighContrast={true}
    >
      <View style={[styles.tabBar, getLayoutDirectionStyles()]}>
        {[
          { key: 'suites', label: '测试套件', icon: '📋' },
          { key: 'results', label: '测试结果', icon: '📊' },
          { key: 'quality', label: '质量监控', icon: '🎯' },
          { key: 'logs', label: '执行日志', icon: '📝' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton
            ]}
            onPress={() => {
              setActiveTab(tab.key as any);
              screenReader.announceButtonAction(tab.label, '已选择');
            }}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderControlPanel = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="测试控制面板"
      applyHighContrast={true}
    >
      <View style={styles.controlPanel}>
        <TouchableOpacity
          style={[styles.controlButton, styles.primaryButton]}
          onPress={handleRunAllTests}
          disabled={isRunning}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="运行所有测试"
          accessibilityState={{ disabled: isRunning }}
        >
          <Text style={styles.primaryButtonText}>
            {isRunning ? '运行中...' : '运行所有测试'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={handleRunSelectedTests}
          disabled={isRunning || selectedSuites.length === 0}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`运行选中的${selectedSuites.length}个测试套件`}
          accessibilityState={{ disabled: isRunning || selectedSuites.length === 0 }}
        >
          <Text style={styles.secondaryButtonText}>
            运行选中 ({selectedSuites.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.tertiaryButton]}
          onPress={refreshQualityData}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="刷新质量数据"
        >
          <Text style={styles.tertiaryButtonText}>刷新数据</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderTestSuite = ({ item: suite }: { item: TestSuite }) => {
    const isSelected = selectedSuites.includes(suite.id);
    const isRunningThis = runningTests.includes(suite.id);

    return (
      <AccessibilityWrapper
        accessibilityRole="button"
        accessibilityLabel={`${suite.name}测试套件，${suite.tests.length}个测试，状态${suite.status}`}
        accessibilityHint="点击选择或查看详情"
        applyExtendedTouchTarget={true}
        applyHighContrast={true}
      >
        <TouchableOpacity
          style={[
            styles.testSuiteCard,
            isSelected && styles.selectedSuiteCard,
            isRunningThis && styles.runningSuiteCard,
          ]}
          onPress={() => {
            selectTestSuite(suite.id);
            setActiveTab('results');
          }}
          onLongPress={() => toggleSuiteSelection(suite.id)}
          accessible={true}
          accessibilityRole="button"
        >
          <View style={styles.suiteHeader}>
            <View style={styles.suiteTitleRow}>
              <Text style={styles.suiteIcon}>
                {getStatusIcon(suite.status)}
              </Text>
              <Text style={styles.suiteName}>{suite.name}</Text>
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>已选</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity
              style={styles.runButton}
              onPress={() => handleRunSuite(suite.id)}
              disabled={isRunningThis}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`运行${suite.name}测试`}
              accessibilityState={{ disabled: isRunningThis }}
            >
              <Text style={styles.runButtonText}>
                {isRunningThis ? '运行中' : '运行'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.suiteDescription} numberOfLines={2}>
            {suite.description}
          </Text>

          <View style={styles.suiteStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>测试数量</Text>
              <Text style={styles.statValue}>{suite.tests.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>通过率</Text>
              <Text style={[
                styles.statValue,
                { color: suite.stats.total > 0 ? getStatusColor('passed') : '#94a3b8' }
              ]}>
                {suite.stats.total > 0 ? 
                  `${Math.round((suite.stats.passed / suite.stats.total) * 100)}%` : 
                  'N/A'
                }
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>优先级</Text>
              <Text style={[
                styles.statValue,
                { color: suite.priority === 'critical' ? '#ef4444' : 
                         suite.priority === 'high' ? '#f59e0b' : '#10b981' }
              ]}>
                {suite.priority === 'critical' ? '关键' :
                 suite.priority === 'high' ? '高' :
                 suite.priority === 'medium' ? '中' : '低'}
              </Text>
            </View>
          </View>

          {suite.stats.duration > 0 && (
            <View style={styles.suiteProgress}>
              <Text style={styles.progressLabel}>
                执行时间: {Math.round(suite.stats.duration / 1000)}秒
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </AccessibilityWrapper>
    );
  };

  const renderTestResult = ({ item: result }: { item: TestResult }) => (
    <AccessibilityWrapper
      accessibilityRole="listitem"
      accessibilityLabel={`${result.name}测试，状态${result.status}，${result.passed ? '通过' : '失败'}`}
      applyHighContrast={true}
    >
      <View style={styles.testResultCard}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultIcon}>
            {getStatusIcon(result.status)}
          </Text>
          <Text style={styles.resultName}>{result.name}</Text>
          <Text style={[
            styles.resultStatus,
            { color: getStatusColor(result.status) }
          ]}>
            {result.status}
          </Text>
        </View>

        <View style={styles.resultDetails}>
          <Text style={styles.resultDetail}>
            执行时间: {Math.round(result.duration)}ms
          </Text>
          <Text style={styles.resultDetail}>
            断言: {result.details.assertions.passed}/{result.details.assertions.total}
          </Text>
          {result.score && (
            <Text style={styles.resultDetail}>
              评分: {result.score}/100
            </Text>
          )}
        </View>

        {result.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{result.error}</Text>
          </View>
        )}

        {result.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{result.message}</Text>
          </View>
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderQualityDashboard = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="质量监控面板"
      applyHighContrast={true}
    >
      <ScrollView style={styles.qualityDashboard} showsVerticalScrollIndicator={false}>
        {/* 总体评分 */}
        <View style={styles.overallScoreCard}>
          <Text style={styles.overallScoreValue}>{overallScore.toFixed(1)}</Text>
          <Text style={styles.overallScoreLabel}>总体评分</Text>
          <View style={[
            styles.gradeBadge,
            { backgroundColor: qualityGrade === 'A' ? '#10b981' : 
                               qualityGrade === 'B' ? '#3b82f6' :
                               qualityGrade === 'C' ? '#f59e0b' : '#ef4444' }
          ]}>
            <Text style={styles.gradeText}>{qualityGrade}</Text>
          </View>
        </View>

        {/* 详细指标 */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{coverageScore.toFixed(1)}%</Text>
            <Text style={styles.metricLabel}>测试覆盖率</Text>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricBarFill,
                  { 
                    width: `${coverageScore}%`,
                    backgroundColor: coverageScore >= 90 ? '#10b981' : 
                                   coverageScore >= 80 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{performanceScore.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>性能评分</Text>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricBarFill,
                  { 
                    width: `${performanceScore}%`,
                    backgroundColor: performanceScore >= 90 ? '#10b981' : 
                                   performanceScore >= 80 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{accessibilityScore.toFixed(1)}</Text>
            <Text style={styles.metricLabel}>可访问性</Text>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricBarFill,
                  { 
                    width: `${accessibilityScore}%`,
                    backgroundColor: accessibilityScore >= 95 ? '#10b981' : 
                                   accessibilityScore >= 90 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
          </View>
        </View>

        {/* 质量警报 */}
        {alerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <View style={styles.alertsHeader}>
              <Text style={styles.alertsTitle}>质量警报</Text>
              <TouchableOpacity
                style={styles.clearAlertsButton}
                onPress={clearAlerts}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="清除警报"
              >
                <Text style={styles.clearAlertsButtonText}>清除</Text>
              </TouchableOpacity>
            </View>
            {alerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{alert}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderLogs = () => (
    <AccessibilityWrapper
      accessibilityRole="log"
      accessibilityLabel="测试执行日志"
      applyHighContrast={true}
    >
      <View style={styles.logsContainer}>
        <View style={styles.logsHeader}>
          <Text style={styles.logsTitle}>执行日志</Text>
          <TouchableOpacity
            style={styles.clearLogsButton}
            onPress={clearLogs}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="清除日志"
          >
            <Text style={styles.clearLogsButtonText}>清除</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.logsContent} showsVerticalScrollIndicator={false}>
          {logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <Text style={styles.logTimestamp}>
                {new Date().toLocaleTimeString()}
              </Text>
              <Text style={styles.logText}>{log}</Text>
            </View>
          ))}
          
          {logs.length === 0 && (
            <View style={styles.emptyLogs}>
              <Text style={styles.emptyLogsText}>暂无日志</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AccessibilityWrapper>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'suites':
        return (
          <FlatList
            data={testSuites}
            renderItem={renderTestSuite}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      
      case 'results':
        return (
          <FlatList
            data={currentResults}
            renderItem={renderTestResult}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {currentSuite ? '暂无测试结果' : '请选择测试套件'}
                </Text>
              </View>
            )}
          />
        );
      
      case 'quality':
        return renderQualityDashboard();
      
      case 'logs':
        return renderLogs();
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="测试控制台页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>测试控制台</Text>
          <View style={styles.headerStatus}>
            <Text style={[
              styles.statusIndicator,
              { color: monitoring ? '#10b981' : '#94a3b8' }
            ]}>
              {monitoring ? '●' : '○'}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>

      {/* 控制面板 */}
      {renderControlPanel()}

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* 标签栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerStatus: {
    width: 40,
    alignItems: 'center',
  },
  statusIndicator: {
    fontSize: 20,
  },
  controlPanel: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  tertiaryButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tertiaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 4,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#dc2626',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#eff6ff',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabLabel: {
    color: '#3b82f6',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  testSuiteCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedSuiteCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  runningSuiteCard: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  suiteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suiteTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  suiteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  suiteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  selectedBadge: {
    backgroundColor: '#3b82f6',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  runButton: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  runButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suiteDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  suiteStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  suiteProgress: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  testResultCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  resultDetail: {
    fontSize: 12,
    color: '#64748b',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
  },
  messageContainer: {
    backgroundColor: '#f0fdf4',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  messageText: {
    fontSize: 12,
    color: '#166534',
  },
  qualityDashboard: {
    flex: 1,
    padding: 16,
  },
  overallScoreCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  overallScoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 12,
  },
  gradeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  metricBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  alertsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  clearAlertsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  clearAlertsButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  alertIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  clearLogsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  clearLogsButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  logsContent: {
    flex: 1,
    padding: 16,
  },
  logItem: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  logTimestamp: {
    fontSize: 12,
    color: '#94a3b8',
    width: 80,
    marginRight: 12,
  },
  logText: {
    fontSize: 12,
    color: '#1e293b',
    flex: 1,
  },
  emptyLogs: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyLogsText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default TestingConsoleScreen;
