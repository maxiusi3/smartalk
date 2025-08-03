import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import PerformanceService, { NetworkCondition } from '@/services/PerformanceService';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface PerformanceStats {
  targets: any;
  cacheStats: {
    hitRate: number;
    totalItems: number;
    totalSize: number;
  };
  currentNetworkCondition: NetworkCondition;
  isMonitoring: boolean;
  recentMetrics: any[];
}

interface PerformanceRecommendation {
  type: 'memory' | 'network' | 'cache' | 'preload';
  priority: 'low' | 'medium' | 'high';
  message: string;
  action: string;
}

/**
 * PerformanceMonitorDashboard - V2 性能监控仪表板
 * 实时显示性能指标、缓存状态、网络条件和优化建议
 */
const PerformanceMonitorDashboard: React.FC = () => {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [recommendations, setRecommendations] = useState<PerformanceRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const performanceService = PerformanceService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadPerformanceData();
    
    // 每30秒自动刷新数据
    const interval = setInterval(loadPerformanceData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      const [stats, recs] = await Promise.all([
        performanceService.getPerformanceStats(),
        performanceService.getPerformanceRecommendations(),
      ]);
      
      setPerformanceStats(stats);
      setRecommendations(recs);
      
      analyticsService.track('performance_dashboard_viewed', {
        cacheHitRate: stats.cacheStats.hitRate,
        networkCondition: stats.currentNetworkCondition,
        recommendationCount: recs.length,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPerformanceData();
  };

  const handleOptimize = async () => {
    try {
      await performanceService.triggerOptimization();
      await loadPerformanceData();
      
      analyticsService.track('performance_manual_optimization', {
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error triggering optimization:', error);
    }
  };

  const renderPerformanceTargets = () => {
    if (!performanceStats) return null;
    
    const { targets } = performanceStats;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>性能目标</Text>
        <View style={styles.targetsGrid}>
          <View style={styles.targetCard}>
            <Text style={styles.targetValue}>&lt;{targets.APP_STARTUP / 1000}s</Text>
            <Text style={styles.targetLabel}>应用启动</Text>
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetValue}>&lt;{targets.VIDEO_LOADING / 1000}s</Text>
            <Text style={styles.targetLabel}>视频加载</Text>
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetValue}>&lt;{targets.INTERACTION_RESPONSE}ms</Text>
            <Text style={styles.targetLabel}>交互响应</Text>
          </View>
          <View style={styles.targetCard}>
            <Text style={styles.targetValue}>&lt;{targets.FOCUS_MODE_ACTIVATION}ms</Text>
            <Text style={styles.targetLabel}>Focus Mode</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCurrentStatus = () => {
    if (!performanceStats) return null;
    
    const getNetworkColor = (condition: NetworkCondition) => {
      switch (condition) {
        case 'fast': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'slow': return '#ef4444';
        default: return '#64748b';
      }
    };
    
    const getNetworkIcon = (condition: NetworkCondition) => {
      switch (condition) {
        case 'fast': return '🚀';
        case 'medium': return '📶';
        case 'slow': return '🐌';
        default: return '❓';
      }
    };
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前状态</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>📊</Text>
            <Text style={styles.statusLabel}>监控状态</Text>
            <Text style={[
              styles.statusValue,
              { color: performanceStats.isMonitoring ? '#10b981' : '#ef4444' }
            ]}>
              {performanceStats.isMonitoring ? '运行中' : '已停止'}
            </Text>
          </View>
          
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>
              {getNetworkIcon(performanceStats.currentNetworkCondition)}
            </Text>
            <Text style={styles.statusLabel}>网络状态</Text>
            <Text style={[
              styles.statusValue,
              { color: getNetworkColor(performanceStats.currentNetworkCondition) }
            ]}>
              {performanceStats.currentNetworkCondition === 'fast' ? '快速' :
               performanceStats.currentNetworkCondition === 'medium' ? '中等' : '缓慢'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCacheStats = () => {
    if (!performanceStats) return null;
    
    const { cacheStats } = performanceStats;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>缓存统计</Text>
        <View style={styles.cacheContainer}>
          <View style={styles.cacheStatItem}>
            <Text style={styles.cacheStatValue}>{cacheStats.hitRate}%</Text>
            <Text style={styles.cacheStatLabel}>命中率</Text>
            <View style={styles.cacheProgressBar}>
              <View 
                style={[
                  styles.cacheProgressFill,
                  { 
                    width: `${cacheStats.hitRate}%`,
                    backgroundColor: cacheStats.hitRate > 80 ? '#10b981' : 
                                   cacheStats.hitRate > 60 ? '#f59e0b' : '#ef4444'
                  }
                ]}
              />
            </View>
          </View>
          
          <View style={styles.cacheStatItem}>
            <Text style={styles.cacheStatValue}>{cacheStats.totalItems}</Text>
            <Text style={styles.cacheStatLabel}>缓存项目</Text>
          </View>
          
          <View style={styles.cacheStatItem}>
            <Text style={styles.cacheStatValue}>{cacheStats.totalSize}KB</Text>
            <Text style={styles.cacheStatLabel}>缓存大小</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>优化建议</Text>
          <View style={styles.noRecommendations}>
            <Text style={styles.noRecommendationsIcon}>✅</Text>
            <Text style={styles.noRecommendationsText}>性能表现良好，暂无优化建议</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>优化建议 ({recommendations.length})</Text>
        {recommendations.map((rec, index) => (
          <View key={index} style={[
            styles.recommendationCard,
            { borderLeftColor: getPriorityColor(rec.priority) }
          ]}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationType}>{getTypeIcon(rec.type)} {getTypeName(rec.type)}</Text>
              <Text style={[
                styles.recommendationPriority,
                { color: getPriorityColor(rec.priority) }
              ]}>
                {getPriorityName(rec.priority)}
              </Text>
            </View>
            <Text style={styles.recommendationMessage}>{rec.message}</Text>
            <Text style={styles.recommendationAction}>{rec.action}</Text>
          </View>
        ))}
      </View>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case 'high': return '高优先级';
      case 'medium': return '中优先级';
      case 'low': return '低优先级';
      default: return '未知';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'memory': return '🧠';
      case 'network': return '🌐';
      case 'cache': return '💾';
      case 'preload': return '⚡';
      default: return '🔧';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'memory': return '内存优化';
      case 'network': return '网络优化';
      case 'cache': return '缓存优化';
      case 'preload': return '预加载优化';
      default: return '其他优化';
    }
  };

  if (loading && !performanceStats) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载性能数据...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>性能监控</Text>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimize}>
          <Text style={styles.optimizeButtonText}>🚀 优化</Text>
        </TouchableOpacity>
      </View>

      {/* 性能目标 */}
      {renderPerformanceTargets()}

      {/* 当前状态 */}
      {renderCurrentStatus()}

      {/* 缓存统计 */}
      {renderCacheStats()}

      {/* 优化建议 */}
      {renderRecommendations()}

      {/* 底部说明 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 性能监控每30秒自动更新，手动优化可立即改善性能表现
        </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  optimizeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optimizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
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
  targetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  targetCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    width: (screenWidth - 64) / 2,
    alignItems: 'center',
  },
  targetValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 4,
  },
  targetLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  statusGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  cacheContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cacheStatItem: {
    alignItems: 'center',
  },
  cacheStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  cacheStatLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  cacheProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  cacheProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  noRecommendations: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noRecommendationsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noRecommendationsText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  recommendationPriority: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  recommendationAction: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PerformanceMonitorDashboard;
