import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePerformanceMonitoring, useSystemPerformance } from '@/hooks/usePerformanceMonitoring';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { PerformanceIssue, OptimizationSuggestion } from '@/services/PerformanceOptimizationService';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * PerformanceMonitorScreen - V2 性能监控界面
 * 提供完整的性能监控体验：实时指标、问题检测、优化建议
 */
const PerformanceMonitorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 性能监控
  const {
    systemMetrics,
    componentMetrics,
    issues,
    suggestions,
    report,
    isMonitoring,
    loading,
    error,
    hasIssues,
    criticalIssues,
    overallScore,
    performanceGrade,
    optimize,
    generateReport,
    resolveIssue,
    implementSuggestion,
  } = usePerformanceMonitoring({
    componentName: 'PerformanceMonitorScreen',
    trackInteractions: true,
    enableAutoOptimization: true,
    monitorMemory: true,
    monitorRendering: true,
  });

  // 系统性能监控
  const {
    metrics: liveMetrics,
    isMonitoring: isSystemMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useSystemPerformance();

  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'suggestions' | 'report'>('overview');

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('性能监控', '查看应用性能指标和优化建议');
    
    // 开始系统监控
    const stopSystemMonitoring = startMonitoring();
    
    analyticsService.track('performance_monitor_viewed', {
      timestamp: Date.now(),
    });

    return stopSystemMonitoring;
  }, []);

  const handleOptimize = async () => {
    try {
      await optimize();
      screenReader.announceSuccess('性能优化完成');
      Alert.alert('成功', '性能优化已完成');
    } catch (error) {
      Alert.alert('错误', '性能优化失败: ' + error.message);
      screenReader.announceError('性能优化失败');
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport();
      screenReader.announceSuccess('性能报告生成完成');
    } catch (error) {
      Alert.alert('错误', '生成性能报告失败: ' + error.message);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#ef4444';
    return '#dc2626';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return '#10b981';
      case 'B': return '#3b82f6';
      case 'C': return '#f59e0b';
      case 'D': return '#ef4444';
      case 'F': return '#dc2626';
      default: return '#94a3b8';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#94a3b8';
    }
  };

  const renderTabBar = () => (
    <AccessibilityWrapper
      accessibilityRole="tablist"
      accessibilityLabel="性能监控标签"
      applyHighContrast={true}
    >
      <View style={[styles.tabBar, getLayoutDirectionStyles()]}>
        {[
          { key: 'overview', label: '概览', icon: '📊' },
          { key: 'issues', label: '问题', icon: '⚠️', badge: issues.length },
          { key: 'suggestions', label: '建议', icon: '💡', badge: suggestions.filter(s => s.status === 'pending').length },
          { key: 'report', label: '报告', icon: '📋' },
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
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
              {tab.badge && tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderOverview = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="性能概览"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* 总体评分 */}
        <View style={styles.scoreCard}>
          <Text style={[
            styles.scoreValue,
            { color: getScoreColor(overallScore) }
          ]}>
            {overallScore.toFixed(1)}
          </Text>
          <Text style={styles.scoreLabel}>性能评分</Text>
          <View style={[
            styles.gradeBadge,
            { backgroundColor: getGradeColor(performanceGrade) }
          ]}>
            <Text style={styles.gradeText}>{performanceGrade}</Text>
          </View>
        </View>

        {/* 实时指标 */}
        {systemMetrics && (
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{systemMetrics.memory.used.toFixed(1)}MB</Text>
              <Text style={styles.metricLabel}>内存使用</Text>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricBarFill,
                    { 
                      width: `${(systemMetrics.memory.used / systemMetrics.memory.total) * 100}%`,
                      backgroundColor: systemMetrics.memory.used > 150 ? '#ef4444' : '#10b981'
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{systemMetrics.cpu.usage.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>CPU使用率</Text>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricBarFill,
                    { 
                      width: `${systemMetrics.cpu.usage}%`,
                      backgroundColor: systemMetrics.cpu.usage > 70 ? '#ef4444' : '#10b981'
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{systemMetrics.rendering.fps.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>帧率 (FPS)</Text>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricBarFill,
                    { 
                      width: `${(systemMetrics.rendering.fps / 60) * 100}%`,
                      backgroundColor: systemMetrics.rendering.fps < 45 ? '#ef4444' : '#10b981'
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{systemMetrics.network.latency.toFixed(0)}ms</Text>
              <Text style={styles.metricLabel}>网络延迟</Text>
              <View style={styles.metricBar}>
                <View 
                  style={[
                    styles.metricBarFill,
                    { 
                      width: `${Math.min((systemMetrics.network.latency / 500) * 100, 100)}%`,
                      backgroundColor: systemMetrics.network.latency > 200 ? '#ef4444' : '#10b981'
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* 快速操作 */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={handleOptimize}
            disabled={loading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="优化性能"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.primaryActionText}>
              {loading ? '优化中...' : '立即优化'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryAction]}
            onPress={handleGenerateReport}
            disabled={loading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="生成报告"
            accessibilityState={{ disabled: loading }}
          >
            <Text style={styles.secondaryActionText}>生成报告</Text>
          </TouchableOpacity>
        </View>

        {/* 状态指示 */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Text style={[
              styles.statusIndicator,
              { color: isSystemMonitoring ? '#10b981' : '#94a3b8' }
            ]}>
              ●
            </Text>
            <Text style={styles.statusText}>
              {isSystemMonitoring ? '监控中' : '监控已停止'}
            </Text>
          </View>
          
          {hasIssues && (
            <View style={styles.statusItem}>
              <Text style={[styles.statusIndicator, { color: '#ef4444' }]}>⚠</Text>
              <Text style={styles.statusText}>
                发现 {criticalIssues} 个严重问题
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderIssues = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="性能问题列表"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {issues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎉 暂无性能问题</Text>
            <Text style={styles.emptySubtext}>应用运行良好</Text>
          </View>
        ) : (
          issues.map((issue) => (
            <View key={issue.id} style={styles.issueCard}>
              <View style={styles.issueHeader}>
                <View style={styles.issueTitleRow}>
                  <Text style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(issue.severity) }
                  ]}>
                    {issue.severity === 'critical' ? '严重' :
                     issue.severity === 'high' ? '高' :
                     issue.severity === 'medium' ? '中' : '低'}
                  </Text>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                </View>
                
                <TouchableOpacity
                  style={styles.resolveButton}
                  onPress={() => resolveIssue(issue.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`解决${issue.title}问题`}
                >
                  <Text style={styles.resolveButtonText}>解决</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.issueDescription}>{issue.description}</Text>
              <Text style={styles.issueImpact}>影响: {issue.impact}</Text>
              <Text style={styles.issueRecommendation}>建议: {issue.recommendation}</Text>

              <View style={styles.issueMetrics}>
                <Text style={styles.issueMetricText}>
                  当前值: {issue.metrics.current.toFixed(1)} {issue.metrics.unit}
                </Text>
                <Text style={styles.issueMetricText}>
                  阈值: {issue.metrics.threshold.toFixed(1)} {issue.metrics.unit}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderSuggestions = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="优化建议列表"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {suggestions.map((suggestion) => (
          <View key={suggestion.id} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={styles.suggestionTitleRow}>
                <Text style={[
                  styles.priorityBadge,
                  { backgroundColor: 
                    suggestion.priority === 'critical' ? '#dc2626' :
                    suggestion.priority === 'high' ? '#ef4444' :
                    suggestion.priority === 'medium' ? '#f59e0b' : '#10b981'
                  }
                ]}>
                  {suggestion.priority === 'critical' ? '关键' :
                   suggestion.priority === 'high' ? '高' :
                   suggestion.priority === 'medium' ? '中' : '低'}
                </Text>
                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              </View>
              
              {suggestion.status === 'pending' && (
                <TouchableOpacity
                  style={styles.implementButton}
                  onPress={() => implementSuggestion(suggestion.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`实施${suggestion.title}建议`}
                >
                  <Text style={styles.implementButtonText}>实施</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            <Text style={styles.suggestionImplementation}>实施方案: {suggestion.implementation}</Text>
            <Text style={styles.suggestionImprovement}>预期改进: {suggestion.expectedImprovement}</Text>

            <View style={styles.suggestionFooter}>
              <Text style={styles.suggestionEffort}>
                工作量: {suggestion.effort === 'low' ? '低' : 
                        suggestion.effort === 'medium' ? '中' : '高'}
              </Text>
              <Text style={[
                styles.suggestionStatus,
                { color: suggestion.status === 'completed' ? '#10b981' : '#94a3b8' }
              ]}>
                {suggestion.status === 'completed' ? '已完成' : 
                 suggestion.status === 'in_progress' ? '进行中' : '待实施'}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderReport = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="性能报告"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {report ? (
          <View style={styles.reportContainer}>
            <View style={styles.reportHeader}>
              <Text style={styles.reportTitle}>性能报告</Text>
              <Text style={styles.reportTimestamp}>
                {new Date(report.timestamp).toLocaleString()}
              </Text>
            </View>

            <View style={styles.reportSummary}>
              <Text style={styles.reportScore}>
                总体评分: {report.overallScore.toFixed(1)} ({report.grade})
              </Text>
              <Text style={styles.reportDuration}>
                监控时长: {report.duration.toFixed(1)} 分钟
              </Text>
            </View>

            <View style={styles.reportIssues}>
              <Text style={styles.reportSectionTitle}>问题汇总</Text>
              <Text style={styles.reportIssueText}>
                严重: {report.issues.critical} | 高: {report.issues.high} | 
                中: {report.issues.medium} | 低: {report.issues.low}
              </Text>
            </View>

            <View style={styles.reportTrends}>
              <Text style={styles.reportSectionTitle}>性能趋势</Text>
              <Text style={styles.reportTrendText}>
                内存: {report.trends.memory === 'improving' ? '改善' : 
                      report.trends.memory === 'stable' ? '稳定' : '下降'}
              </Text>
              <Text style={styles.reportTrendText}>
                CPU: {report.trends.cpu === 'improving' ? '改善' : 
                     report.trends.cpu === 'stable' ? '稳定' : '下降'}
              </Text>
              <Text style={styles.reportTrendText}>
                渲染: {report.trends.rendering === 'improving' ? '改善' : 
                      report.trends.rendering === 'stable' ? '稳定' : '下降'}
              </Text>
              <Text style={styles.reportTrendText}>
                网络: {report.trends.network === 'improving' ? '改善' : 
                      report.trends.network === 'stable' ? '稳定' : '下降'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无性能报告</Text>
            <Text style={styles.emptySubtext}>点击"生成报告"创建性能报告</Text>
          </View>
        )}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'issues': return renderIssues();
      case 'suggestions': return renderSuggestions();
      case 'report': return renderReport();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="性能监控页面头部"
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
          <Text style={styles.headerTitle}>性能监控</Text>
          <View style={styles.headerStatus}>
            <Text style={[
              styles.statusIndicator,
              { color: isSystemMonitoring ? '#10b981' : '#94a3b8' }
            ]}>
              {isSystemMonitoring ? '●' : '○'}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* 标签栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      {renderTabContent()}
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
  tabContent: {
    position: 'relative',
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
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  scoreCard: {
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
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
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
    minWidth: 150,
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
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryAction: {
    backgroundColor: '#667eea',
  },
  secondaryAction: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  severityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  resolveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resolveButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  issueDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  issueImpact: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 4,
  },
  issueRecommendation: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 8,
  },
  issueMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  issueMetricText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  suggestionCard: {
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
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  suggestionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  implementButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  implementButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  suggestionImplementation: {
    fontSize: 12,
    color: '#3b82f6',
    marginBottom: 4,
  },
  suggestionImprovement: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 8,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionEffort: {
    fontSize: 12,
    color: '#94a3b8',
  },
  suggestionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  reportHeader: {
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportTimestamp: {
    fontSize: 14,
    color: '#64748b',
  },
  reportSummary: {
    marginBottom: 16,
  },
  reportScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportDuration: {
    fontSize: 14,
    color: '#64748b',
  },
  reportIssues: {
    marginBottom: 16,
  },
  reportSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  reportIssueText: {
    fontSize: 14,
    color: '#64748b',
  },
  reportTrends: {
    marginBottom: 16,
  },
  reportTrendText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
});

export default PerformanceMonitorScreen;
