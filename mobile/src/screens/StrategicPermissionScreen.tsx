import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StrategicPermissionService, { 
  PermissionType, 
  PermissionRequestConfig, 
  PermissionAnalyticsReport,
  AlternativeStrategy 
} from '@/services/StrategicPermissionService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * StrategicPermissionScreen - V2 战略权限管理界面
 * 提供完整的权限策略管理：配置优化、分析报告、替代策略、用户体验监控
 */
const StrategicPermissionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [permissionStats, setPermissionStats] = useState<any>(null);
  const [notificationConfig, setNotificationConfig] = useState<PermissionRequestConfig | null>(null);
  const [microphoneConfig, setMicrophoneConfig] = useState<PermissionRequestConfig | null>(null);
  const [notificationReport, setNotificationReport] = useState<PermissionAnalyticsReport | null>(null);
  const [alternativeStrategies, setAlternativeStrategies] = useState<AlternativeStrategy[]>([]);
  const [loading, setLoading] = useState(false);

  const permissionService = StrategicPermissionService.getInstance();

  useEffect(() => {
    loadPermissionData();
    screenReader.announcePageChange('权限管理', '管理应用权限策略和用户体验优化');
  }, []);

  const loadPermissionData = async () => {
    try {
      setLoading(true);

      // 获取权限统计
      const stats = permissionService.getPermissionStatistics();
      setPermissionStats(stats);

      // 获取权限配置
      const notifConfig = permissionService.getPermissionConfig('notifications');
      const micConfig = permissionService.getPermissionConfig('microphone');
      setNotificationConfig(notifConfig);
      setMicrophoneConfig(micConfig);

      // 获取分析报告
      const notifReport = permissionService.getLatestAnalyticsReport('notifications');
      setNotificationReport(notifReport);

      // 获取替代策略
      const notifStrategy = permissionService.getAlternativeStrategy('notifications');
      const micStrategy = permissionService.getAlternativeStrategy('microphone');
      const strategies = [notifStrategy, micStrategy].filter(Boolean) as AlternativeStrategy[];
      setAlternativeStrategies(strategies);

    } catch (error) {
      console.error('Error loading permission data:', error);
      Alert.alert('错误', '加载权限数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="权限概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{permissionStats?.totalRequests || 0}</Text>
          <Text style={styles.overviewLabel}>总请求数</Text>
          <Text style={styles.overviewSubtext}>累计</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {Math.round((permissionStats?.averageAcceptanceRate || 0) * 100)}%
          </Text>
          <Text style={styles.overviewLabel}>平均接受率</Text>
          <Text style={styles.overviewSubtext}>所有权限</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{alternativeStrategies.length}</Text>
          <Text style={styles.overviewLabel}>替代策略</Text>
          <Text style={styles.overviewSubtext}>已激活</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {getTriggerLabel(permissionStats?.mostEffectiveTrigger)}
          </Text>
          <Text style={styles.overviewLabel}>最佳触发器</Text>
          <Text style={styles.overviewSubtext}>效果最好</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderPermissionConfig = (
    config: PermissionRequestConfig | null,
    permissionType: PermissionType,
    title: string
  ) => {
    if (!config) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel={`${title}配置`}
        applyHighContrast={true}
      >
        <View style={styles.configSection}>
          <Text style={styles.configSectionTitle}>{title}</Text>
          
          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>启用状态</Text>
              <Text style={styles.configDescription}>
                {config.enabled ? '已启用' : '已禁用'}
              </Text>
            </View>
            <Switch
              value={config.enabled}
              onValueChange={(value) => handleConfigToggle(config.configId, 'enabled', value)}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel={`${title}启用开关`}
            />
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>优先级</Text>
              <Text style={styles.configDescription}>
                {config.priority}/10 - {getPriorityLabel(config.priority)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => showPriorityOptions(config.configId, config.priority)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="调整优先级"
            >
              <Text style={styles.configButtonText}>调整</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>请求策略</Text>
              <Text style={styles.configDescription}>
                {getTimingLabel(config.requestStrategy.timing)} - 最多{config.requestStrategy.maxAttempts}次
              </Text>
            </View>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => showStrategyOptions(config.configId)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="调整策略"
            >
              <Text style={styles.configButtonText}>设置</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>上下文解释</Text>
              <Text style={styles.configDescription}>
                {config.contextualExplanation.title}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => showExplanationPreview(config)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="预览解释"
            >
              <Text style={styles.configButtonText}>预览</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.configItem}>
            <View style={styles.configInfo}>
              <Text style={styles.configTitle}>触发条件</Text>
              <Text style={styles.configDescription}>
                {config.triggers.length}个触发器已配置
              </Text>
            </View>
            <TouchableOpacity
              style={styles.configButton}
              onPress={() => showTriggerDetails(config)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="查看触发器"
            >
              <Text style={styles.configButtonText}>详情</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderAnalyticsReport = () => {
    if (!notificationReport) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="分析报告"
        applyHighContrast={true}
      >
        <View style={styles.reportSection}>
          <Text style={styles.reportSectionTitle}>通知权限分析报告</Text>
          
          <View style={styles.reportMetrics}>
            <View style={styles.reportMetric}>
              <Text style={styles.reportMetricValue}>
                {notificationReport.overview.totalRequests}
              </Text>
              <Text style={styles.reportMetricLabel}>总请求数</Text>
            </View>
            
            <View style={styles.reportMetric}>
              <Text style={styles.reportMetricValue}>
                {Math.round(notificationReport.overview.acceptanceRate * 100)}%
              </Text>
              <Text style={styles.reportMetricLabel}>接受率</Text>
            </View>
            
            <View style={styles.reportMetric}>
              <Text style={styles.reportMetricValue}>
                {Math.round(notificationReport.overview.averageResponseTime / 1000)}s
              </Text>
              <Text style={styles.reportMetricLabel}>平均响应时间</Text>
            </View>
            
            <View style={styles.reportMetric}>
              <Text style={styles.reportMetricValue}>
                {Math.round(notificationReport.overview.retryRate * 100)}%
              </Text>
              <Text style={styles.reportMetricLabel}>重试率</Text>
            </View>
          </View>

          <Text style={styles.reportSubtitle}>最佳触发器</Text>
          {notificationReport.timingOptimization.optimalTriggers.map((trigger, index) => (
            <View key={index} style={styles.triggerItem}>
              <Text style={styles.triggerName}>{getTriggerLabel(trigger)}</Text>
              <Text style={styles.triggerDescription}>
                效果评分: {notificationReport.triggerAnalysis[trigger]?.effectiveness || 0}/100
              </Text>
            </View>
          ))}

          <Text style={styles.reportSubtitle}>优化建议</Text>
          {notificationReport.recommendations.slice(0, 3).map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <View style={styles.recommendationHeader}>
                <Text style={[
                  styles.recommendationPriority,
                  recommendation.priority === 'high' && styles.priorityHigh,
                  recommendation.priority === 'medium' && styles.priorityMedium,
                  recommendation.priority === 'low' && styles.priorityLow,
                ]}>
                  {getPriorityText(recommendation.priority)}
                </Text>
                <Text style={styles.recommendationCategory}>
                  {getCategoryText(recommendation.category)}
                </Text>
              </View>
              <Text style={styles.recommendationSuggestion}>
                {recommendation.suggestion}
              </Text>
              <Text style={styles.recommendationImprovement}>
                预期改进: {recommendation.expectedImprovement}
              </Text>
            </View>
          ))}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderAlternativeStrategies = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="替代策略"
      applyHighContrast={true}
    >
      <View style={styles.strategiesSection}>
        <Text style={styles.strategiesSectionTitle}>替代策略</Text>
        
        {alternativeStrategies.map((strategy, index) => (
          <View key={strategy.strategyId} style={styles.strategyCard}>
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyName}>{strategy.name}</Text>
              <Text style={styles.strategyType}>
                {getPermissionTypeLabel(strategy.permissionType)}
              </Text>
            </View>
            
            <Text style={styles.strategyDescription}>
              {strategy.description}
            </Text>
            
            <Text style={styles.strategySubtitle}>替代功能</Text>
            {strategy.alternativeFeatures.slice(0, 2).map((feature, featureIndex) => (
              <View key={featureIndex} style={styles.featureItem}>
                <Text style={styles.featureName}>• {feature.name}</Text>
                <Text style={styles.featureExperience}>
                  体验: {getExperienceLabel(feature.userExperience)}
                </Text>
              </View>
            ))}
            
            <View style={styles.strategyMetrics}>
              <View style={styles.strategyMetric}>
                <Text style={styles.strategyMetricValue}>
                  {Math.round(strategy.effectiveness.userSatisfaction * 100)}%
                </Text>
                <Text style={styles.strategyMetricLabel}>用户满意度</Text>
              </View>
              
              <View style={styles.strategyMetric}>
                <Text style={styles.strategyMetricValue}>
                  {Math.round(strategy.effectiveness.conversionRate * 100)}%
                </Text>
                <Text style={styles.strategyMetricLabel}>转化率</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.strategyButton}
              onPress={() => showStrategyDetails(strategy)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`查看${strategy.name}详情`}
            >
              <Text style={styles.strategyButtonText}>查看详情</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderActionButtons = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="操作按钮"
      applyHighContrast={true}
    >
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => testPermissionRequest()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="测试权限请求"
        >
          <Text style={styles.primaryButtonText}>测试请求</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => exportAnalytics()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="导出分析数据"
        >
          <Text style={styles.secondaryButtonText}>导出数据</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  // 事件处理方法
  const handleConfigToggle = (configId: string, field: string, value: any) => {
    // 这里应该调用服务更新配置
    Alert.alert('配置更新', `${field} 已更新为 ${value}`);
  };

  const showPriorityOptions = (configId: string, currentPriority: number) => {
    Alert.alert('优先级设置', '选择新的优先级', [
      { text: '高 (8-10)', onPress: () => updatePriority(configId, 9) },
      { text: '中 (5-7)', onPress: () => updatePriority(configId, 6) },
      { text: '低 (1-4)', onPress: () => updatePriority(configId, 3) },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const updatePriority = (configId: string, priority: number) => {
    Alert.alert('更新成功', `优先级已更新为 ${priority}`);
  };

  const showStrategyOptions = (configId: string) => {
    Alert.alert('请求策略', '选择请求时机', [
      { text: '立即请求', onPress: () => updateStrategy(configId, 'immediate') },
      { text: '延迟请求', onPress: () => updateStrategy(configId, 'delayed') },
      { text: '上下文请求', onPress: () => updateStrategy(configId, 'contextual') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const updateStrategy = (configId: string, timing: string) => {
    Alert.alert('更新成功', `请求策略已更新为 ${getTimingLabel(timing as any)}`);
  };

  const showExplanationPreview = (config: PermissionRequestConfig) => {
    Alert.alert(
      config.contextualExplanation.title,
      config.contextualExplanation.description + '\n\n好处:\n' + 
      config.contextualExplanation.benefits.map(b => `• ${b}`).join('\n'),
      [{ text: '关闭', style: 'default' }]
    );
  };

  const showTriggerDetails = (config: PermissionRequestConfig) => {
    const triggerInfo = config.triggers.map(trigger => 
      `${getTriggerLabel(trigger.trigger)}: ${JSON.stringify(trigger.conditions)}`
    ).join('\n\n');
    
    Alert.alert('触发器详情', triggerInfo, [{ text: '关闭', style: 'default' }]);
  };

  const showStrategyDetails = (strategy: AlternativeStrategy) => {
    Alert.alert(
      strategy.name,
      `${strategy.description}\n\n用户指导:\n${strategy.userGuidance.explanation}`,
      [{ text: '关闭', style: 'default' }]
    );
  };

  const testPermissionRequest = async () => {
    if (!userProgress?.userId) return;
    
    try {
      Alert.alert('测试权限请求', '选择要测试的权限类型', [
        { 
          text: '通知权限', 
          onPress: () => permissionService.requestPermission(userProgress.userId, 'notifications')
        },
        { 
          text: '麦克风权限', 
          onPress: () => permissionService.requestPermission(userProgress.userId, 'microphone')
        },
        { text: '取消', style: 'cancel' },
      ]);
    } catch (error) {
      Alert.alert('错误', '测试权限请求失败');
    }
  };

  const exportAnalytics = () => {
    Alert.alert('导出数据', '分析数据导出功能即将推出');
  };

  // 辅助方法
  const getTriggerLabel = (trigger: string): string => {
    const labels: { [key: string]: string } = {
      first_magic_moment: '首次魔法时刻',
      chapter_completion: '章节完成',
      streak_achievement: '连击成就',
      feature_discovery: '功能发现',
      user_engagement: '用户参与',
      onboarding_completion: '入门完成',
      manual_request: '手动请求',
    };
    return labels[trigger] || trigger;
  };

  const getPriorityLabel = (priority: number): string => {
    if (priority >= 8) return '高优先级';
    if (priority >= 5) return '中优先级';
    return '低优先级';
  };

  const getTimingLabel = (timing: string): string => {
    const labels: { [key: string]: string } = {
      immediate: '立即请求',
      delayed: '延迟请求',
      contextual: '上下文请求',
    };
    return labels[timing] || timing;
  };

  const getPriorityText = (priority: string): string => {
    const labels: { [key: string]: string } = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return labels[priority] || priority;
  };

  const getCategoryText = (category: string): string => {
    const labels: { [key: string]: string } = {
      timing: '时机',
      explanation: '解释',
      strategy: '策略',
      fallback: '回退',
    };
    return labels[category] || category;
  };

  const getPermissionTypeLabel = (type: PermissionType): string => {
    const labels: { [key in PermissionType]: string } = {
      notifications: '通知',
      location: '位置',
      camera: '相机',
      microphone: '麦克风',
      media_library: '媒体库',
      contacts: '通讯录',
      calendar: '日历',
      photos: '相册',
    };
    return labels[type];
  };

  const getExperienceLabel = (experience: string): string => {
    const labels: { [key: string]: string } = {
      full: '完整',
      limited: '受限',
      degraded: '降级',
    };
    return labels[experience] || experience;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载权限数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="权限管理页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>权限管理</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadPermissionData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="刷新数据"
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 概览卡片 */}
        {renderOverviewCards()}

        {/* 操作按钮 */}
        {renderActionButtons()}

        {/* 通知权限配置 */}
        {renderPermissionConfig(notificationConfig, 'notifications', '通知权限')}

        {/* 麦克风权限配置 */}
        {renderPermissionConfig(microphoneConfig, 'microphone', '麦克风权限')}

        {/* 分析报告 */}
        {renderAnalyticsReport()}

        {/* 替代策略 */}
        {renderAlternativeStrategies()}
      </ScrollView>
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  overviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  overviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  overviewSubtext: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  configSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  configSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  configInfo: {
    flex: 1,
    marginRight: 16,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  configDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  configButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  configButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reportSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  reportMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  reportMetric: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  reportMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  reportMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  reportSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 8,
  },
  triggerItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  triggerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  triggerDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendationItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationPriority: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: '#FFFFFF',
  },
  priorityHigh: {
    backgroundColor: '#ef4444',
  },
  priorityMedium: {
    backgroundColor: '#f59e0b',
  },
  priorityLow: {
    backgroundColor: '#10b981',
  },
  recommendationCategory: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendationSuggestion: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 4,
  },
  recommendationImprovement: {
    fontSize: 12,
    color: '#10b981',
  },
  strategiesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  strategiesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  strategyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strategyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  strategyType: {
    fontSize: 12,
    color: '#64748b',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  strategyDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  strategySubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureName: {
    fontSize: 12,
    color: '#64748b',
    flex: 1,
  },
  featureExperience: {
    fontSize: 10,
    color: '#94a3b8',
  },
  strategyMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  strategyMetric: {
    alignItems: 'center',
  },
  strategyMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  strategyMetricLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  strategyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  strategyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
});

export default StrategicPermissionScreen;
