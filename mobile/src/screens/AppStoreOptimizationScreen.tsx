import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppStoreOptimizationService, { AppStoreAssets, ASOPerformanceReport } from '@/services/AppStoreOptimizationService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * AppStoreOptimizationScreen - V2 应用商店优化界面
 * 提供完整的ASO管理：资产预览、关键词分析、性能监控、市场洞察
 */
const AppStoreOptimizationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');
  const [selectedRegion, setSelectedRegion] = useState<'us' | 'cn' | 'global'>('global');
  const [assets, setAssets] = useState<AppStoreAssets | null>(null);
  const [performanceReport, setPerformanceReport] = useState<ASOPerformanceReport | null>(null);
  const [asoStats, setAsoStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const asoService = AppStoreOptimizationService.getInstance();

  useEffect(() => {
    loadASOData();
    screenReader.announcePageChange('应用商店优化', '管理ASO策略和监控应用商店表现');
  }, [selectedPlatform, selectedRegion]);

  const loadASOData = async () => {
    try {
      setLoading(true);

      // 获取应用商店资产
      const storeAssets = asoService.getAppStoreAssets(selectedPlatform, selectedRegion);
      setAssets(storeAssets);

      // 获取性能报告
      const report = asoService.getLatestPerformanceReport(selectedPlatform, selectedRegion);
      setPerformanceReport(report);

      // 获取ASO统计
      const stats = asoService.getASOStatistics();
      setAsoStats(stats);

    } catch (error) {
      console.error('Error loading ASO data:', error);
      Alert.alert('错误', '加载ASO数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderPlatformSelector = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="平台选择器"
      applyHighContrast={true}
    >
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>平台</Text>
        <View style={styles.selectorButtons}>
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedPlatform === 'ios' && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedPlatform('ios')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择iOS平台"
          >
            <Text style={[
              styles.selectorButtonText,
              selectedPlatform === 'ios' && styles.selectorButtonTextActive
            ]}>
              iOS
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.selectorButton,
              selectedPlatform === 'android' && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedPlatform('android')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择Android平台"
          >
            <Text style={[
              styles.selectorButtonText,
              selectedPlatform === 'android' && styles.selectorButtonTextActive
            ]}>
              Android
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderRegionSelector = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="地区选择器"
      applyHighContrast={true}
    >
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorTitle}>市场</Text>
        <View style={styles.selectorButtons}>
          {(['global', 'us', 'cn'] as const).map(region => (
            <TouchableOpacity
              key={region}
              style={[
                styles.selectorButton,
                selectedRegion === region && styles.selectorButtonActive
              ]}
              onPress={() => setSelectedRegion(region)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`选择${getRegionLabel(region)}市场`}
            >
              <Text style={[
                styles.selectorButtonText,
                selectedRegion === region && styles.selectorButtonTextActive
              ]}>
                {getRegionLabel(region)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="ASO概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{asoStats?.totalAssets || 0}</Text>
          <Text style={styles.overviewLabel}>资产集合</Text>
          <Text style={styles.overviewSubtext}>个平台</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{asoStats?.totalKeywords || 0}</Text>
          <Text style={styles.overviewLabel}>关键词</Text>
          <Text style={styles.overviewSubtext}>正在跟踪</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {Math.round(asoStats?.averageRanking || 0)}
          </Text>
          <Text style={styles.overviewLabel}>平均排名</Text>
          <Text style={styles.overviewSubtext}>关键词</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{asoStats?.totalRegions || 0}</Text>
          <Text style={styles.overviewLabel}>目标市场</Text>
          <Text style={styles.overviewSubtext}>个地区</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderAppIcon = () => {
    if (!assets?.appIcon) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="应用图标预览"
        applyHighContrast={true}
      >
        <View style={styles.assetSection}>
          <Text style={styles.assetSectionTitle}>应用图标</Text>
          <View style={styles.iconContainer}>
            <View style={styles.iconPlaceholder}>
              <Text style={styles.iconText}>SmarTalk</Text>
            </View>
            <View style={styles.iconDetails}>
              <Text style={styles.iconDetailTitle}>设计原则</Text>
              {assets.appIcon.designPrinciples.map((principle, index) => (
                <Text key={index} style={styles.iconDetailItem}>• {principle}</Text>
              ))}
              
              <Text style={styles.iconDetailTitle}>识别度评分</Text>
              <Text style={styles.iconDetailScore}>
                {assets.appIcon.recognitionScore}/100
              </Text>
            </View>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderScreenshots = () => {
    if (!assets?.screenshots || assets.screenshots.length === 0) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="应用截图预览"
        applyHighContrast={true}
      >
        <View style={styles.assetSection}>
          <Text style={styles.assetSectionTitle}>应用截图</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {assets.screenshots.map((screenshot, index) => (
              <View key={screenshot.screenshotId} style={styles.screenshotContainer}>
                <View style={styles.screenshotPlaceholder}>
                  <Text style={styles.screenshotText}>{index + 1}</Text>
                </View>
                <Text style={styles.screenshotTitle}>{screenshot.title}</Text>
                <Text style={styles.screenshotFeature}>{screenshot.featureHighlight}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderAppDescription = () => {
    if (!assets?.appDescription) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="应用描述"
        applyHighContrast={true}
      >
        <View style={styles.assetSection}>
          <Text style={styles.assetSectionTitle}>应用描述</Text>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>{assets.appDescription.title}</Text>
            <Text style={styles.descriptionSubtitle}>{assets.appDescription.subtitle}</Text>
            
            <Text style={styles.descriptionSectionTitle}>核心功能</Text>
            {assets.appDescription.keyFeatures.map((feature, index) => (
              <Text key={index} style={styles.descriptionFeature}>• {feature}</Text>
            ))}
            
            <Text style={styles.descriptionSectionTitle}>社会证明</Text>
            {assets.appDescription.socialProof.map((proof, index) => (
              <Text key={index} style={styles.descriptionProof}>• {proof}</Text>
            ))}
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceReport) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="性能指标"
        applyHighContrast={true}
      >
        <View style={styles.performanceSection}>
          <Text style={styles.performanceSectionTitle}>性能指标</Text>
          
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {performanceReport.keyMetrics.appStoreViews.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>商店浏览量</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(performanceReport.keyMetrics.installRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>安装率</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {performanceReport.keyMetrics.organicDownloads.toLocaleString()}
              </Text>
              <Text style={styles.metricLabel}>自然下载</Text>
            </View>
            
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(performanceReport.keyMetrics.conversionRate * 100).toFixed(1)}%
              </Text>
              <Text style={styles.metricLabel}>转化率</Text>
            </View>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderKeywordRankings = () => {
    if (!performanceReport?.keyMetrics.keywordRankings) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="关键词排名"
        applyHighContrast={true}
      >
        <View style={styles.keywordSection}>
          <Text style={styles.keywordSectionTitle}>关键词排名</Text>
          
          {Object.entries(performanceReport.keyMetrics.keywordRankings).map(([keyword, ranking]) => (
            <View key={keyword} style={styles.keywordItem}>
              <Text style={styles.keywordText}>{keyword}</Text>
              <View style={styles.keywordRanking}>
                <Text style={styles.keywordRankingText}>#{ranking}</Text>
              </View>
            </View>
          ))}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderRecommendations = () => {
    if (!performanceReport?.recommendations || performanceReport.recommendations.length === 0) {
      return null;
    }

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="优化建议"
        applyHighContrast={true}
      >
        <View style={styles.recommendationsSection}>
          <Text style={styles.recommendationsSectionTitle}>优化建议</Text>
          
          {performanceReport.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Text style={[
                  styles.recommendationPriority,
                  recommendation.priority === 'high' && styles.priorityHigh,
                  recommendation.priority === 'medium' && styles.priorityMedium,
                  recommendation.priority === 'low' && styles.priorityLow,
                ]}>
                  {getPriorityLabel(recommendation.priority)}
                </Text>
                <Text style={styles.recommendationCategory}>
                  {getCategoryLabel(recommendation.category)}
                </Text>
              </View>
              
              <Text style={styles.recommendationSuggestion}>
                {recommendation.suggestion}
              </Text>
              
              <Text style={styles.recommendationImpact}>
                预期影响: {recommendation.expectedImpact}
              </Text>
              
              <Text style={styles.recommendationEffort}>
                工作量: {getEffortLabel(recommendation.effort)}
              </Text>
            </View>
          ))}
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
          onPress={() => Alert.alert('功能开发中', '关键词分析功能即将推出')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="关键词分析"
        >
          <Text style={styles.primaryButtonText}>关键词分析</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => Alert.alert('功能开发中', '竞品分析功能即将推出')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="竞品分析"
        >
          <Text style={styles.secondaryButtonText}>竞品分析</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  // 辅助方法
  const getRegionLabel = (region: string): string => {
    const labels: { [key: string]: string } = {
      global: '全球',
      us: '美国',
      cn: '中国',
    };
    return labels[region] || region;
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: { [key: string]: string } = {
      high: '高优先级',
      medium: '中优先级',
      low: '低优先级',
    };
    return labels[priority] || priority;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      keywords: '关键词',
      assets: '资产',
      description: '描述',
      localization: '本地化',
    };
    return labels[category] || category;
  };

  const getEffortLabel = (effort: string): string => {
    const labels: { [key: string]: string } = {
      low: '低',
      medium: '中',
      high: '高',
    };
    return labels[effort] || effort;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载ASO数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="应用商店优化页面头部"
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
          
          <Text style={styles.headerTitle}>ASO优化</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadASOData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="刷新数据"
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 平台和地区选择器 */}
        {renderPlatformSelector()}
        {renderRegionSelector()}

        {/* 概览卡片 */}
        {renderOverviewCards()}

        {/* 操作按钮 */}
        {renderActionButtons()}

        {/* 应用图标 */}
        {renderAppIcon()}

        {/* 应用截图 */}
        {renderScreenshots()}

        {/* 应用描述 */}
        {renderAppDescription()}

        {/* 性能指标 */}
        {renderPerformanceMetrics()}

        {/* 关键词排名 */}
        {renderKeywordRankings()}

        {/* 优化建议 */}
        {renderRecommendations()}
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
  selectorContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#3b82f6',
  },
  selectorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  selectorButtonTextActive: {
    color: '#FFFFFF',
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
  assetSection: {
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
  assetSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  iconDetails: {
    flex: 1,
  },
  iconDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  iconDetailItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  iconDetailScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
  },
  screenshotContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  screenshotPlaceholder: {
    width: 120,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  screenshotText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748b',
  },
  screenshotTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 4,
  },
  screenshotFeature: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  descriptionContainer: {
    gap: 12,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  descriptionSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  descriptionSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  descriptionFeature: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  descriptionProof: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 8,
  },
  performanceSection: {
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
  performanceSectionTitle: {
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
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  keywordSection: {
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
  keywordSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  keywordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  keywordText: {
    fontSize: 14,
    color: '#1e293b',
  },
  keywordRanking: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  keywordRankingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recommendationsSection: {
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
  recommendationsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  recommendationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#10b981',
    marginBottom: 4,
  },
  recommendationEffort: {
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

export default AppStoreOptimizationScreen;
