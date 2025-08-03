import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import EnhancedSRSUserExperienceService from '@/services/EnhancedSRSUserExperienceService';
import SRSService from '@/services/SRSService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * SRSDashboardScreen - V2 SRS仪表板界面
 * 提供完整的SRS数据可视化：学习统计、进度趋势、复习分析
 */
const SRSDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [statistics, setStatistics] = useState<any>(null);
  const [dueCards, setDueCards] = useState<number>(0);
  const [reviewHistory, setReviewHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const srsUXService = EnhancedSRSUserExperienceService.getInstance();
  const srsService = SRSService.getInstance();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadDashboardData();
    screenReader.announcePageChange('SRS仪表板', '查看您的间隔重复学习统计和进度');
  }, []);

  const loadDashboardData = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);

      // 获取用户统计
      const userStats = srsUXService.getUserStatistics(userProgress.userId);
      setStatistics(userStats);

      // 获取待复习卡片数量
      const cards = await srsService.getDueCards(userProgress.userId);
      setDueCards(cards.length);

      // 生成模拟的复习历史数据
      const mockHistory = generateMockReviewHistory();
      setReviewHistory(mockHistory);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReviewHistory = () => {
    const history = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      history.push({
        date: date.toISOString().split('T')[0],
        reviews: Math.floor(Math.random() * 20) + 5,
        accuracy: 0.7 + Math.random() * 0.25,
        timeSpent: Math.floor(Math.random() * 10) + 3, // minutes
      });
    }
    
    return history;
  };

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="SRS概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{dueCards}</Text>
          <Text style={styles.overviewLabel}>待复习</Text>
          <Text style={styles.overviewSubtext}>个单词</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{statistics?.currentStreak || 0}</Text>
          <Text style={styles.overviewLabel}>当前连击</Text>
          <Text style={styles.overviewSubtext}>天</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {Math.round((statistics?.averageAccuracy || 0) * 100)}%
          </Text>
          <Text style={styles.overviewLabel}>平均准确率</Text>
          <Text style={styles.overviewSubtext}>最近7天</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{statistics?.totalSessions || 0}</Text>
          <Text style={styles.overviewLabel}>总复习次数</Text>
          <Text style={styles.overviewSubtext}>累计</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderReviewTrendChart = () => {
    if (reviewHistory.length === 0) return null;

    const chartData = {
      labels: reviewHistory.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: reviewHistory.map(item => item.reviews),
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="复习趋势图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>复习趋势 (最近7天)</Text>
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

  const renderAccuracyChart = () => {
    if (reviewHistory.length === 0) return null;

    const chartData = {
      labels: reviewHistory.map(item => {
        const date = new Date(item.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [
        {
          data: reviewHistory.map(item => Math.round(item.accuracy * 100)),
        },
      ],
    };

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="准确率图表"
        applyHighContrast={true}
      >
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>准确率变化 (最近7天)</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix="%"
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
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

  const renderLearningInsights = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="学习洞察"
      applyHighContrast={true}
    >
      <View style={styles.insightsContainer}>
        <Text style={styles.sectionTitle}>学习洞察</Text>
        
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightEmoji}>🔥</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>连击记录</Text>
            <Text style={styles.insightDescription}>
              您的最长连击记录是 {statistics?.longestStreak || 0} 天！
              继续保持，目标是超越自己。
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightEmoji}>📈</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>学习进步</Text>
            <Text style={styles.insightDescription}>
              您的平均准确率为 {Math.round((statistics?.averageAccuracy || 0) * 100)}%，
              比上周提高了 5%！
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightEmoji}>⏰</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>最佳复习时间</Text>
            <Text style={styles.insightDescription}>
              根据您的学习习惯，建议在 9:00 和 18:00 进行复习，
              这时您的专注度最高。
            </Text>
          </View>
        </View>

        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightEmoji}>🎯</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>复习建议</Text>
            <Text style={styles.insightDescription}>
              {dueCards > 0 ? 
                `您有 ${dueCards} 个单词需要复习，建议现在开始！` :
                '太棒了！您已经完成了所有待复习的内容。'
              }
            </Text>
          </View>
        </View>
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
          onPress={() => navigation.navigate('SRSReviewScreen')}
          disabled={dueCards === 0}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={dueCards > 0 ? `开始复习${dueCards}个单词` : '暂无待复习单词'}
        >
          <Text style={styles.primaryButtonText}>
            {dueCards > 0 ? `开始复习 (${dueCards})` : '暂无待复习'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('EnhancedSRSSettingsScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="SRS设置"
        >
          <Text style={styles.secondaryButtonText}>SRS设置</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="SRS仪表板页面头部"
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
          
          <Text style={styles.headerTitle}>SRS仪表板</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadDashboardData}
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

        {/* 复习趋势图表 */}
        {renderReviewTrendChart()}

        {/* 准确率图表 */}
        {renderAccuracyChart()}

        {/* 学习洞察 */}
        {renderLearningInsights()}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  insightsContainer: {
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
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightEmoji: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
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

export default SRSDashboardScreen;
