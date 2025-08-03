import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardMetrics {
  // North Star Metrics
  userActivationRate: number;
  nextDayRetention: number;
  coreLoopSuccessRate: number;
  
  // Performance Metrics
  avgStartupTime: number;
  avgVideoLoadingTime: number;
  avgInteractionResponseTime: number;
  
  // Conversion Funnel
  funnelData: {
    appLaunch: number;
    onboardingStart: number;
    placementTest: number;
    firstChapter: number;
    magicMoment: number;
    activation: number;
  };
  
  // Error Recovery
  focusModeTriggered: number;
  rescueModeTriggered: number;
  recoverySuccessRate: number;
  
  // SRS Engagement
  srsSessionsStarted: number;
  srsCompletionRate: number;
  avgSRSAccuracy: number;
  
  // Real-time Stats
  activeUsers: number;
  totalEvents: number;
  lastUpdated: string;
}

/**
 * AnalyticsDashboard - V2 实时分析仪表板
 * 显示关键业务指标和性能数据
 */
const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [loading, setLoading] = useState(true);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadMetrics();
    
    // 每30秒刷新一次数据
    const interval = setInterval(loadMetrics, 30000);
    
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // 模拟从分析服务获取数据
      const mockMetrics: DashboardMetrics = {
        // North Star Metrics (目标值)
        userActivationRate: 32, // ≥30% target ✅
        nextDayRetention: 45, // ≥40% target ✅
        coreLoopSuccessRate: 85, // ≥80% target ✅
        
        // Performance Metrics (目标值)
        avgStartupTime: 1800, // <2000ms target ✅
        avgVideoLoadingTime: 900, // <1000ms target ✅
        avgInteractionResponseTime: 80, // <100ms target ✅
        
        // Conversion Funnel
        funnelData: {
          appLaunch: 1000,
          onboardingStart: 850,
          placementTest: 720,
          firstChapter: 650,
          magicMoment: 520,
          activation: 320, // 32% activation rate
        },
        
        // Error Recovery
        focusModeTriggered: 180,
        rescueModeTriggered: 95,
        recoverySuccessRate: 92,
        
        // SRS Engagement
        srsSessionsStarted: 240,
        srsCompletionRate: 78,
        avgSRSAccuracy: 82,
        
        // Real-time Stats
        activeUsers: 156,
        totalEvents: 15420,
        lastUpdated: new Date().toISOString(),
      };
      
      setMetrics(mockMetrics);
      
    } catch (error) {
      console.error('Error loading analytics metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMetricCard = (title: string, value: string | number, target?: number, unit?: string, isGood?: boolean) => {
    const displayValue = typeof value === 'number' ? value.toLocaleString() : value;
    const hasTarget = target !== undefined;
    const meetsTarget = hasTarget && typeof value === 'number' ? value >= target : true;
    const statusColor = isGood !== undefined ? (isGood ? '#10b981' : '#ef4444') : (meetsTarget ? '#10b981' : '#f59e0b');
    
    return (
      <View style={styles.metricCard}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Text style={[styles.metricValue, { color: statusColor }]}>
          {displayValue}{unit || ''}
        </Text>
        {hasTarget && (
          <Text style={styles.metricTarget}>
            目标: {target}{unit || ''} {meetsTarget ? '✅' : '⚠️'}
          </Text>
        )}
      </View>
    );
  };

  const renderTimeRangeSelector = () => (
    <View style={styles.timeRangeContainer}>
      {(['1h', '24h', '7d', '30d'] as const).map(range => (
        <TouchableOpacity
          key={range}
          style={[
            styles.timeRangeButton,
            selectedTimeRange === range && styles.timeRangeButtonActive
          ]}
          onPress={() => setSelectedTimeRange(range)}
        >
          <Text style={[
            styles.timeRangeButtonText,
            selectedTimeRange === range && styles.timeRangeButtonTextActive
          ]}>
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderConversionFunnel = () => {
    if (!metrics) return null;
    
    const { funnelData } = metrics;
    const stages = [
      { name: '应用启动', value: funnelData.appLaunch },
      { name: '开始引导', value: funnelData.onboardingStart },
      { name: '水平测试', value: funnelData.placementTest },
      { name: '首个章节', value: funnelData.firstChapter },
      { name: 'Magic Moment', value: funnelData.magicMoment },
      { name: '用户激活', value: funnelData.activation },
    ];
    
    return (
      <View style={styles.funnelContainer}>
        <Text style={styles.sectionTitle}>转化漏斗</Text>
        {stages.map((stage, index) => {
          const conversionRate = index === 0 ? 100 : (stage.value / stages[0].value) * 100;
          const barWidth = (stage.value / stages[0].value) * 100;
          
          return (
            <View key={stage.name} style={styles.funnelStage}>
              <View style={styles.funnelStageInfo}>
                <Text style={styles.funnelStageName}>{stage.name}</Text>
                <Text style={styles.funnelStageValue}>
                  {stage.value.toLocaleString()} ({conversionRate.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.funnelBar}>
                <View style={[styles.funnelBarFill, { width: `${barWidth}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载分析数据...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>无法加载分析数据</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmarTalk V2 Analytics</Text>
        <Text style={styles.lastUpdated}>
          最后更新: {new Date(metrics.lastUpdated).toLocaleTimeString()}
        </Text>
      </View>

      {/* 时间范围选择器 */}
      {renderTimeRangeSelector()}

      {/* North Star Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>核心指标 (North Star Metrics)</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('用户激活率', metrics.userActivationRate, 30, '%')}
          {renderMetricCard('次日留存率', metrics.nextDayRetention, 40, '%')}
          {renderMetricCard('核心学习成功率', metrics.coreLoopSuccessRate, 80, '%')}
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>性能指标</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('平均启动时间', metrics.avgStartupTime, 2000, 'ms')}
          {renderMetricCard('视频加载时间', metrics.avgVideoLoadingTime, 1000, 'ms')}
          {renderMetricCard('交互响应时间', metrics.avgInteractionResponseTime, 100, 'ms')}
        </View>
      </View>

      {/* Conversion Funnel */}
      {renderConversionFunnel()}

      {/* Error Recovery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>错误恢复系统</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('Focus Mode触发', metrics.focusModeTriggered)}
          {renderMetricCard('Rescue Mode触发', metrics.rescueModeTriggered)}
          {renderMetricCard('恢复成功率', metrics.recoverySuccessRate, 90, '%')}
        </View>
      </View>

      {/* SRS Engagement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SRS参与度</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('复习会话开始', metrics.srsSessionsStarted)}
          {renderMetricCard('完成率', metrics.srsCompletionRate, 70, '%')}
          {renderMetricCard('平均准确率', metrics.avgSRSAccuracy, 75, '%')}
        </View>
      </View>

      {/* Real-time Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>实时统计</Text>
        <View style={styles.metricsGrid}>
          {renderMetricCard('活跃用户', metrics.activeUsers)}
          {renderMetricCard('总事件数', metrics.totalEvents)}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#64748b',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  timeRangeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  timeRangeButtonActive: {
    backgroundColor: '#667eea',
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  timeRangeButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 64) / 2, // 2列布局
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTarget: {
    fontSize: 12,
    color: '#94a3b8',
  },
  funnelContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    padding: 20,
  },
  funnelStage: {
    marginBottom: 16,
  },
  funnelStageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  funnelStageName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  funnelStageValue: {
    fontSize: 14,
    color: '#64748b',
  },
  funnelBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
  },
  funnelBarFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 4,
  },
});

export default AnalyticsDashboard;
