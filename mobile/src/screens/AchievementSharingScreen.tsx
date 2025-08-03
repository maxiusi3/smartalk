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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AchievementSharingService, { 
  SharingTemplate, 
  SharingRecord, 
  SharingAnalyticsReport,
  SharingPlatform,
  SharingContentType 
} from '@/services/AchievementSharingService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * AchievementSharingScreen - V2 成就分享管理界面
 * 提供完整的分享功能管理：模板预览、分享记录、分析报告、配置设置
 */
const AchievementSharingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [sharingStats, setSharingStats] = useState<any>(null);
  const [recentShares, setRecentShares] = useState<SharingRecord[]>([]);
  const [analyticsReport, setAnalyticsReport] = useState<SharingAnalyticsReport | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<SharingTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const sharingService = AchievementSharingService.getInstance();

  useEffect(() => {
    loadSharingData();
    screenReader.announcePageChange('成就分享', '管理成就分享和社交传播功能');
  }, []);

  const loadSharingData = async () => {
    try {
      setLoading(true);

      // 获取分享统计
      const stats = sharingService.getSharingStatistics();
      setSharingStats(stats);

      // 获取用户分享记录
      if (userProgress?.userId) {
        const userShares = sharingService.getUserSharingRecords(userProgress.userId);
        setRecentShares(userShares.slice(-10)); // 最近10条记录
      }

      // 获取分析报告
      const report = sharingService.getLatestAnalyticsReport();
      setAnalyticsReport(report);

      // 获取可用模板（模拟数据）
      const templates = [
        sharingService.getSharingTemplate('badge_earned_wechat'),
        sharingService.getSharingTemplate('magic_moment_facebook'),
        sharingService.getSharingTemplate('streak_milestone_instagram'),
      ].filter(Boolean) as SharingTemplate[];
      setAvailableTemplates(templates);

    } catch (error) {
      console.error('Error loading sharing data:', error);
      Alert.alert('错误', '加载分享数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="分享概览卡片"
      applyHighContrast={true}
    >
      <View style={styles.overviewContainer}>
        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{sharingStats?.totalShares || 0}</Text>
          <Text style={styles.overviewLabel}>总分享数</Text>
          <Text style={styles.overviewSubtext}>累计</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>{sharingStats?.totalTemplates || 0}</Text>
          <Text style={styles.overviewLabel}>分享模板</Text>
          <Text style={styles.overviewSubtext}>可用</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {Math.round((sharingStats?.averageConversionRate || 0) * 100)}%
          </Text>
          <Text style={styles.overviewLabel}>转化率</Text>
          <Text style={styles.overviewSubtext}>平均</Text>
        </View>

        <View style={styles.overviewCard}>
          <Text style={styles.overviewNumber}>
            {getTemplateDisplayName(sharingStats?.topPerformingTemplate)}
          </Text>
          <Text style={styles.overviewLabel}>最佳模板</Text>
          <Text style={styles.overviewSubtext}>表现最好</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderSharingTemplates = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="分享模板"
      applyHighContrast={true}
    >
      <View style={styles.templatesSection}>
        <Text style={styles.templatesSectionTitle}>分享模板</Text>
        
        {availableTemplates.map((template, index) => (
          <View key={template.templateId} style={styles.templateCard}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateName}>{template.name}</Text>
              <View style={styles.templatePlatform}>
                <Text style={styles.templatePlatformText}>
                  {getPlatformLabel(template.platform)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.templateDescription}>
              {template.description}
            </Text>
            
            <View style={styles.templatePreview}>
              <View style={styles.templatePreviewImage}>
                <Text style={styles.templatePreviewText}>
                  {template.design.layout.toUpperCase()}
                </Text>
                <Text style={styles.templateDimensions}>
                  {template.design.dimensions.width}×{template.design.dimensions.height}
                </Text>
              </View>
              
              <View style={styles.templateInfo}>
                <Text style={styles.templateInfoTitle}>内容类型</Text>
                <Text style={styles.templateInfoValue}>
                  {getContentTypeLabel(template.contentType)}
                </Text>
                
                <Text style={styles.templateInfoTitle}>优先级</Text>
                <Text style={styles.templateInfoValue}>
                  {template.priority}/10
                </Text>
                
                <Text style={styles.templateInfoTitle}>使用次数</Text>
                <Text style={styles.templateInfoValue}>
                  {template.usage.totalShares}
                </Text>
              </View>
            </View>
            
            <View style={styles.templateActions}>
              <TouchableOpacity
                style={[styles.templateButton, styles.previewButton]}
                onPress={() => previewTemplate(template)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`预览${template.name}`}
              >
                <Text style={styles.previewButtonText}>预览</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.templateButton, styles.shareButton]}
                onPress={() => testShare(template)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`测试分享${template.name}`}
              >
                <Text style={styles.shareButtonText}>测试分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderRecentShares = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="最近分享记录"
      applyHighContrast={true}
    >
      <View style={styles.sharesSection}>
        <Text style={styles.sharesSectionTitle}>最近分享</Text>
        
        {recentShares.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>暂无分享记录</Text>
            <Text style={styles.emptyStateSubtext}>完成成就后可以分享到社交媒体</Text>
          </View>
        ) : (
          recentShares.map((share, index) => (
            <View key={share.recordId} style={styles.shareCard}>
              <View style={styles.shareHeader}>
                <Text style={styles.shareContentType}>
                  {getContentTypeLabel(share.contentType)}
                </Text>
                <Text style={styles.sharePlatform}>
                  {getPlatformLabel(share.platform)}
                </Text>
                <Text style={styles.shareDate}>
                  {formatDate(share.sharedAt)}
                </Text>
              </View>
              
              <Text style={styles.shareText} numberOfLines={2}>
                {share.shareText}
              </Text>
              
              <View style={styles.shareMetrics}>
                <View style={styles.shareMetric}>
                  <Text style={styles.shareMetricValue}>
                    {share.tracking.impressions}
                  </Text>
                  <Text style={styles.shareMetricLabel}>展示</Text>
                </View>
                
                <View style={styles.shareMetric}>
                  <Text style={styles.shareMetricValue}>
                    {share.tracking.clicks}
                  </Text>
                  <Text style={styles.shareMetricLabel}>点击</Text>
                </View>
                
                <View style={styles.shareMetric}>
                  <Text style={styles.shareMetricValue}>
                    {share.tracking.downloads}
                  </Text>
                  <Text style={styles.shareMetricLabel}>下载</Text>
                </View>
                
                <View style={styles.shareMetric}>
                  <Text style={styles.shareMetricValue}>
                    {share.tracking.conversions}
                  </Text>
                  <Text style={styles.shareMetricLabel}>转化</Text>
                </View>
              </View>
              
              <View style={styles.shareStatus}>
                <Text style={[
                  styles.shareStatusText,
                  share.shareResult === 'success' && styles.shareStatusSuccess,
                  share.shareResult === 'failed' && styles.shareStatusFailed,
                ]}>
                  {getShareResultLabel(share.shareResult)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderAnalyticsReport = () => {
    if (!analyticsReport) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="分析报告"
        applyHighContrast={true}
      >
        <View style={styles.analyticsSection}>
          <Text style={styles.analyticsSectionTitle}>分析报告</Text>
          
          <View style={styles.analyticsOverview}>
            <Text style={styles.analyticsTitle}>总体表现</Text>
            
            <View style={styles.analyticsMetrics}>
              <View style={styles.analyticsMetric}>
                <Text style={styles.analyticsMetricValue}>
                  {analyticsReport.overview.totalShares}
                </Text>
                <Text style={styles.analyticsMetricLabel}>总分享数</Text>
              </View>
              
              <View style={styles.analyticsMetric}>
                <Text style={styles.analyticsMetricValue}>
                  {analyticsReport.overview.uniqueSharers}
                </Text>
                <Text style={styles.analyticsMetricLabel}>分享用户</Text>
              </View>
              
              <View style={styles.analyticsMetric}>
                <Text style={styles.analyticsMetricValue}>
                  {Math.round(analyticsReport.overview.overallConversionRate * 100)}%
                </Text>
                <Text style={styles.analyticsMetricLabel}>转化率</Text>
              </View>
              
              <View style={styles.analyticsMetric}>
                <Text style={styles.analyticsMetricValue}>
                  {analyticsReport.overview.viralCoefficient.toFixed(2)}
                </Text>
                <Text style={styles.analyticsMetricLabel}>病毒系数</Text>
              </View>
            </View>
          </View>

          <View style={styles.analyticsRecommendations}>
            <Text style={styles.analyticsTitle}>优化建议</Text>
            
            {analyticsReport.recommendations.slice(0, 3).map((recommendation, index) => (
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
          onPress={() => createCustomShare()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="创建自定义分享"
        >
          <Text style={styles.primaryButtonText}>创建分享</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => navigation.navigate('SharingSettingsScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="分享设置"
        >
          <Text style={styles.secondaryButtonText}>分享设置</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  // 事件处理方法
  const previewTemplate = (template: SharingTemplate) => {
    Alert.alert(
      '模板预览',
      `模板: ${template.name}\n布局: ${template.design.layout}\n尺寸: ${template.design.dimensions.width}×${template.design.dimensions.height}\n\n元素包括:\n• 用户昵称\n• 成就标题\n• 成就图标\n• 应用Logo\n• 二维码\n• 标语`,
      [{ text: '关闭', style: 'default' }]
    );
  };

  const testShare = async (template: SharingTemplate) => {
    if (!userProgress?.userId) {
      Alert.alert('错误', '用户信息不可用');
      return;
    }

    try {
      const shareId = await sharingService.executeShare(
        userProgress.userId,
        template.templateId,
        template.platform,
        {
          contentType: template.contentType,
          contentId: 'test_achievement',
          achievementTitle: '测试成就',
          achievementIcon: 'https://example.com/test_icon.png',
          customMessage: '这是一个测试分享',
        }
      );

      if (shareId) {
        Alert.alert('分享成功', '测试分享已完成');
        loadSharingData(); // 刷新数据
      } else {
        Alert.alert('分享失败', '请检查网络连接或稍后重试');
      }
    } catch (error) {
      Alert.alert('分享错误', '分享过程中发生错误');
    }
  };

  const createCustomShare = () => {
    Alert.alert('自定义分享', '选择要分享的内容类型', [
      { text: '徽章获得', onPress: () => triggerShare('badge_earned') },
      { text: '魔法时刻', onPress: () => triggerShare('magic_moment') },
      { text: '学习连击', onPress: () => triggerShare('streak_milestone') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const triggerShare = async (contentType: SharingContentType) => {
    if (!userProgress?.userId) return;

    try {
      await sharingService.triggerAchievementShare(
        userProgress.userId,
        contentType,
        'custom_share',
        {
          achievementTitle: '自定义成就',
          achievementIcon: 'https://example.com/custom_icon.png',
          autoTrigger: false,
        }
      );
      
      Alert.alert('分享触发', '分享选项已准备就绪');
    } catch (error) {
      Alert.alert('错误', '触发分享失败');
    }
  };

  // 辅助方法
  const getPlatformLabel = (platform: SharingPlatform): string => {
    const labels: { [key in SharingPlatform]: string } = {
      wechat: '微信',
      weibo: '微博',
      facebook: 'Facebook',
      twitter: 'Twitter',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      system: '系统分享',
    };
    return labels[platform];
  };

  const getContentTypeLabel = (contentType: SharingContentType): string => {
    const labels: { [key in SharingContentType]: string } = {
      badge_earned: '徽章获得',
      magic_moment: '魔法时刻',
      streak_milestone: '连击里程碑',
      chapter_complete: '章节完成',
      level_up: '升级',
      learning_progress: '学习进度',
      achievement_wall: '成就墙',
      custom_milestone: '自定义里程碑',
    };
    return labels[contentType];
  };

  const getShareResultLabel = (result: string): string => {
    const labels: { [key: string]: string } = {
      success: '成功',
      cancelled: '已取消',
      failed: '失败',
    };
    return labels[result] || result;
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: { [key: string]: string } = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return labels[priority] || priority;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: { [key: string]: string } = {
      template: '模板',
      platform: '平台',
      content: '内容',
      timing: '时机',
    };
    return labels[category] || category;
  };

  const getTemplateDisplayName = (templateId?: string): string => {
    if (!templateId) return '无';
    const template = sharingService.getSharingTemplate(templateId);
    return template ? template.name.split(' - ')[0] : '未知';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载分享数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="成就分享页面头部"
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
          
          <Text style={styles.headerTitle}>成就分享</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadSharingData}
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

        {/* 分享模板 */}
        {renderSharingTemplates()}

        {/* 最近分享 */}
        {renderRecentShares()}

        {/* 分析报告 */}
        {renderAnalyticsReport()}
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
  templatesSection: {
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
  templatesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  templateCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  templatePlatform: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  templatePlatformText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  templateDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  templatePreview: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  templatePreviewImage: {
    width: 80,
    height: 80,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  templatePreviewText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 4,
  },
  templateDimensions: {
    fontSize: 8,
    color: '#94a3b8',
  },
  templateInfo: {
    flex: 1,
  },
  templateInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 2,
  },
  templateInfoValue: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
  },
  templateActions: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  previewButton: {
    backgroundColor: '#e5e7eb',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  shareButton: {
    backgroundColor: '#10b981',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sharesSection: {
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
  sharesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  shareCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shareContentType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  sharePlatform: {
    fontSize: 12,
    color: '#64748b',
  },
  shareDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  shareText: {
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 12,
  },
  shareMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  shareMetric: {
    alignItems: 'center',
  },
  shareMetricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  shareMetricLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  shareStatus: {
    alignItems: 'flex-end',
  },
  shareStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  shareStatusSuccess: {
    color: '#10b981',
  },
  shareStatusFailed: {
    color: '#ef4444',
  },
  analyticsSection: {
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
  analyticsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  analyticsOverview: {
    marginBottom: 20,
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  analyticsMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  analyticsMetric: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  analyticsMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  analyticsMetricLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  analyticsRecommendations: {
    marginTop: 8,
  },
  recommendationCard: {
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
  recommendationImpact: {
    fontSize: 12,
    color: '#10b981',
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

export default AchievementSharingScreen;
