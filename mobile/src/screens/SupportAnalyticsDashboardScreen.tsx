import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import SupportAnalyticsService, { SupportAnalyticsReport, FeedbackType } from '@/services/SupportAnalyticsService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * SupportAnalyticsDashboardScreen - V2 支持分析仪表板界面
 * 提供完整的支持数据可视化：反馈分析、趋势监控、产品改进建议
 */
const SupportAnalyticsDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [analyticsReport, setAnalyticsReport] = useState<SupportAnalyticsReport | null>(null);
  const [supportStats, setSupportStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supportAnalyticsService = SupportAnalyticsService.getInstance();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadAnalyticsData();
    screenReader.announcePageChange('支持分析仪表板', '查看用户反馈和支持数据分析');
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // 获取最新分析报告
      const report = supportAnalyticsService.getLatestAnalyticsReport();
      setAnalyticsReport(report);

      // 获取支持统计
      const stats = supportAnalyticsService.getSupportStatistics();
      setSupportStats(stats);

    } catch (error) {
      console.error('Error loading analytics data:', error);
      Alert.alert('错误', '加载分析数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="支持概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{supportStats?.totalFeedback || 0}</Text>
          <Text style={styles.overviewLabel}>总反馈数</Text>
          <Text style={styles.overviewSubtext}>累计</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{supportStats?.openTickets || 0}</Text>
          <Text style={styles.overviewLabel}>待处理工单</Text>
          <Text style={styles.overviewSubtext}>需要关注</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {Math.round(supportStats?.averageResponseTime || 0)}h
          </Text>
          <Text style={styles.overviewLabel}>平均响应时间</Text>
          <Text style={styles.overviewSubtext}>小时</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {(supportStats?.userSatisfaction || 0).toFixed(1)}
          </Text>
          <Text style={styles.overviewLabel}>用户满意度</Text>
          <Text style={styles.overviewSubtext}>/ 5.0</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderFeedbackTypeChart = () => {
    if (!analyticsReport?.feedbackAnalysis.typeDistribution) return null;

    const typeLabels: { [key in FeedbackType]: string } = {
      bug_report: '错误报告',
      feature_request: '功能请求',
      user_experience: '用户体验',
      content_issue: '内容问题',
      technical_support: '技术支持',
      account_issue: '账户问题',
      payment_issue: '支付问题',
      general_inquiry: '一般咨询',
      compliment: '表扬',
      complaint: '投诉',
    };

    const chartData = Object.entries(analyticsReport.feedbackAnalysis.typeDistribution)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        name: typeLabels[type as FeedbackType],
        population: count,
        color: getColorForFeedbackType(type as FeedbackType),
        legendFontColor: '#64748b',
        legendFontSize: 12,
      }));

    if (chartData.length === 0) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="反馈类型分布图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>反馈类型分布</Text>
          <PieChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPriorityChart = () => {
    if (!analyticsReport?.feedbackAnalysis.priorityDistribution) return null;

    const priorityLabels = {
      low: '低',
      medium: '中',
      high: '高',
      critical: '紧急',
    };

    const chartData = {
      labels: Object.keys(analyticsReport.feedbackAnalysis.priorityDistribution)
        .map(priority => priorityLabels[priority as keyof typeof priorityLabels]),
      datasets: [
        {
          data: Object.values(analyticsReport.feedbackAnalysis.priorityDistribution),
        },
      ],
    };

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="优先级分布图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>优先级分布</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={styles.chart}
          />
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderSentimentChart = () => {
    if (!analyticsReport?.feedbackAnalysis.sentimentDistribution) return null;

    const sentimentData = [
      {
        name: '积极',
        population: analyticsReport.feedbackAnalysis.sentimentDistribution.positive,
        color: '#10b981',
        legendFontColor: '#64748b',
        legendFontSize: 12,
      },
      {
        name: '中性',
        population: analyticsReport.feedbackAnalysis.sentimentDistribution.neutral,
        color: '#6b7280',
        legendFontColor: '#64748b',
        legendFontSize: 12,
      },
      {
        name: '消极',
        population: analyticsReport.feedbackAnalysis.sentimentDistribution.negative,
        color: '#ef4444',
        legendFontColor: '#64748b',
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0);

    if (sentimentData.length === 0) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="情感分析图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>用户情感分析</Text>
          <PieChart
            data={sentimentData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderTrendChart = () => {
    if (!analyticsReport?.trends.feedbackVolumeTrend || analyticsReport.trends.feedbackVolumeTrend.length === 0) {
      return null;
    }

    const chartData = {
      labels: analyticsReport.trends.feedbackVolumeTrend.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: analyticsReport.trends.feedbackVolumeTrend.map(item => item.count),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="反馈趋势图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>反馈量趋势 (最近7天)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#3b82f6',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderProductImprovements = () => {
    if (!analyticsReport?.productImprovements) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="产品改进建议"
        applyHighContrast={true}
      >
        <View style={styles.improvementsContainer}>
          <Text style={styles.sectionTitle}>产品改进建议</Text>
          
          {/* 高影响问题 */}
          <View style={styles.improvementSection}>
            <Text style={styles.improvementSectionTitle}>🔥 高影响问题</Text>
            {analyticsReport.productImprovements.highImpactIssues.slice(0, 3).map((issue, index) => (
              <View key={index} style={styles.improvementItem}>
                <Text style={styles.improvementTitle}>{issue.issue}</Text>
                <Text style={styles.improvementDescription}>
                  影响度: {issue.impact} | 频率: {issue.frequency}
                </Text>
              </View>
            ))}
          </View>

          {/* 功能请求 */}
          <View style={styles.improvementSection}>
            <Text style={styles.improvementSectionTitle}>💡 热门功能请求</Text>
            {analyticsReport.productImprovements.featureRequests.slice(0, 3).map((request, index) => (
              <View key={index} style={styles.improvementItem}>
                <Text style={styles.improvementTitle}>{request.feature}</Text>
                <Text style={styles.improvementDescription}>
                  投票数: {request.votes}
                </Text>
              </View>
            ))}
          </View>

          {/* 用户体验问题 */}
          <View style={styles.improvementSection}>
            <Text style={styles.improvementSectionTitle}>🎯 用户体验改进</Text>
            {analyticsReport.productImprovements.userExperienceIssues.slice(0, 3).map((issue, index) => (
              <View key={index} style={styles.improvementItem}>
                <Text style={styles.improvementTitle}>{issue.issue}</Text>
                <Text style={styles.improvementDescription}>
                  严重度: {issue.severity} | 影响用户: {issue.affectedUsers}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderActionButtons = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="操作按钮"
      applyHighContrast={true}
    >
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => navigation.navigate('FeedbackListScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="查看所有反馈"
        >
          <Text style={styles.primaryButtonText}>查看反馈</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('SupportTicketsScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="管理工单"
        >
          <Text style={styles.secondaryButtonText}>管理工单</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  // 辅助方法
  const getColorForFeedbackType = (type: FeedbackType): string => {
    const colorMap: { [key in FeedbackType]: string } = {
      bug_report: '#ef4444',
      feature_request: '#3b82f6',
      user_experience: '#8b5cf6',
      content_issue: '#f59e0b',
      technical_support: '#10b981',
      account_issue: '#6366f1',
      payment_issue: '#ec4899',
      general_inquiry: '#6b7280',
      compliment: '#10b981',
      complaint: '#ef4444',
    };
    return colorMap[type];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载分析数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="支持分析仪表板页面头部"
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
          
          <Text style={styles.headerTitle}>支持分析</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadAnalyticsData}
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

        {/* 反馈类型分布 */}
        {renderFeedbackTypeChart()}

        {/* 优先级分布 */}
        {renderPriorityChart()}

        {/* 情感分析 */}
        {renderSentimentChart()}

        {/* 趋势图表 */}
        {renderTrendChart()}

        {/* 产品改进建议 */}
        {renderProductImprovements()}
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  improvementsContainer: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  improvementSection: {
    marginBottom: 20,
  },
  improvementSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  improvementItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  improvementDescription: {
    fontSize: 12,
    color: '#64748b',
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

export default SupportAnalyticsDashboardScreen;
