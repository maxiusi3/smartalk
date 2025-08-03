import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PronunciationAssessment } from '@/services/PronunciationAssessmentService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface RouteParams {
  assessment: PronunciationAssessment;
  keywordId: string;
  targetText: string;
}

/**
 * PronunciationResultsScreen - V2 发音评估结果详情界面
 * 显示详细的发音分析结果、改进建议和练习推荐
 */
const PronunciationResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { assessment, keywordId, targetText } = route.params as RouteParams;

  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const analyticsService = AnalyticsService.getInstance();

  const [activeTab, setActiveTab] = useState<'overview' | 'phonemes' | 'words' | 'recommendations'>('overview');

  React.useEffect(() => {
    screenReader.announcePageChange('发音评估结果', `总分${assessment.overallScore}分`);
    
    analyticsService.track('pronunciation_results_viewed', {
      assessmentId: assessment.id,
      overallScore: assessment.overallScore,
      activeTab,
      timestamp: Date.now(),
    });
  }, []);

  const renderTabBar = () => (
    <AccessibilityWrapper
      accessibilityRole="tablist"
      accessibilityLabel="结果分析标签"
      applyHighContrast={true}
    >
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '总览', icon: '📊' },
          { key: 'phonemes', label: '音素', icon: '🔤' },
          { key: 'words', label: '单词', icon: '📝' },
          { key: 'recommendations', label: '建议', icon: '💡' },
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

  const renderOverview = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="总览分析"
      applyHighContrast={true}
    >
      <View style={styles.tabContent}>
        {/* 总分展示 */}
        <View style={styles.overallScoreCard}>
          <Text style={styles.overallScoreValue}>{assessment.overallScore}</Text>
          <Text style={styles.overallScoreLabel}>总分</Text>
          <Text style={styles.scoreDescription}>
            {getScoreDescription(assessment.overallScore)}
          </Text>
        </View>

        {/* 详细分数 */}
        <View style={styles.detailScoresCard}>
          <Text style={styles.cardTitle}>详细评分</Text>
          <View style={styles.scoreGrid}>
            {[
              { label: '准确度', value: assessment.accuracy, color: '#10b981' },
              { label: '流利度', value: assessment.fluency, color: '#3b82f6' },
              { label: '完整度', value: assessment.completeness, color: '#f59e0b' },
              { label: '韵律', value: assessment.prosody, color: '#8b5cf6' },
            ].map((score, index) => (
              <View key={index} style={styles.scoreGridItem}>
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreCircleText, { color: score.color }]}>
                    {score.value}
                  </Text>
                </View>
                <Text style={styles.scoreGridLabel}>{score.label}</Text>
                <View style={styles.scoreBar}>
                  <View 
                    style={[
                      styles.scoreBarFill,
                      { 
                        width: `${score.value}%`,
                        backgroundColor: score.color 
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 总体反馈 */}
        <View style={styles.feedbackCard}>
          <Text style={styles.cardTitle}>总体评价</Text>
          <Text style={styles.feedbackText}>{assessment.feedback.overall}</Text>
          
          {assessment.feedback.strengths.length > 0 && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackSectionTitle}>✅ 优点</Text>
              {assessment.feedback.strengths.map((strength, index) => (
                <Text key={index} style={styles.feedbackItem}>• {strength}</Text>
              ))}
            </View>
          )}
          
          {assessment.feedback.weaknesses.length > 0 && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackSectionTitle}>⚠️ 需要改进</Text>
              {assessment.feedback.weaknesses.map((weakness, index) => (
                <Text key={index} style={styles.feedbackItem}>• {weakness}</Text>
              ))}
            </View>
          )}
        </View>

        {/* 进步对比 */}
        {assessment.improvement !== undefined && (
          <View style={styles.improvementCard}>
            <Text style={styles.cardTitle}>进步情况</Text>
            <View style={styles.improvementContent}>
              <Text style={styles.improvementValue}>
                {assessment.improvement > 0 ? '+' : ''}{assessment.improvement}
              </Text>
              <Text style={styles.improvementLabel}>
                相比上次{assessment.improvement > 0 ? '提高' : '下降'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderPhonemes = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="音素分析列表"
      applyHighContrast={true}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>音素分析</Text>
        <Text style={styles.sectionDescription}>
          详细分析每个音素的发音准确度
        </Text>
        
        {assessment.phonemeAnalysis.map((phoneme, index) => (
          <View key={index} style={styles.phonemeCard}>
            <View style={styles.phonemeHeader}>
              <Text style={styles.phonemeSymbol}>{phoneme.phoneme}</Text>
              <Text style={[
                styles.phonemeScore,
                { color: getScoreColor(phoneme.accuracy) }
              ]}>
                {phoneme.accuracy}%
              </Text>
            </View>
            
            <View style={styles.phonemeDetails}>
              <Text style={styles.phonemeDetail}>
                期望: {phoneme.expected} → 实际: {phoneme.actual}
              </Text>
              <Text style={styles.phonemeDetail}>
                置信度: {phoneme.confidence}%
              </Text>
              {phoneme.errorType && (
                <Text style={styles.phonemeError}>
                  错误类型: {getErrorTypeName(phoneme.errorType)}
                </Text>
              )}
            </View>
            
            <View style={styles.phonemeProgressBar}>
              <View 
                style={[
                  styles.phonemeProgressFill,
                  { 
                    width: `${phoneme.accuracy}%`,
                    backgroundColor: getScoreColor(phoneme.accuracy)
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderWords = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="单词分析列表"
      applyHighContrast={true}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>单词分析</Text>
        <Text style={styles.sectionDescription}>
          分析每个单词的发音质量和时长
        </Text>
        
        {assessment.wordAnalysis.map((word, index) => (
          <View key={index} style={styles.wordCard}>
            <View style={styles.wordHeader}>
              <Text style={styles.wordText}>{word.word}</Text>
              <Text style={[
                styles.wordScore,
                { color: getScoreColor(word.accuracy) }
              ]}>
                {word.accuracy}%
              </Text>
            </View>
            
            <View style={styles.wordDetails}>
              <View style={styles.wordDetailRow}>
                <Text style={styles.wordDetailLabel}>重音准确度:</Text>
                <Text style={styles.wordDetailValue}>{word.stress.accuracy}%</Text>
              </View>
              <View style={styles.wordDetailRow}>
                <Text style={styles.wordDetailLabel}>时长比例:</Text>
                <Text style={styles.wordDetailValue}>
                  {word.timing.ratio.toFixed(2)}x
                </Text>
              </View>
              <View style={styles.wordDetailRow}>
                <Text style={styles.wordDetailLabel}>实际时长:</Text>
                <Text style={styles.wordDetailValue}>
                  {Math.round(word.timing.duration)}ms
                </Text>
              </View>
            </View>
            
            <View style={styles.wordProgressBar}>
              <View 
                style={[
                  styles.wordProgressFill,
                  { 
                    width: `${word.accuracy}%`,
                    backgroundColor: getScoreColor(word.accuracy)
                  }
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderRecommendations = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="改进建议列表"
      applyHighContrast={true}
    >
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>改进建议</Text>
        <Text style={styles.sectionDescription}>
          基于分析结果的个性化练习建议
        </Text>
        
        {assessment.recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <View style={styles.recommendationTitleRow}>
                <Text style={styles.recommendationIcon}>
                  {getRecommendationIcon(rec.type)}
                </Text>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
              </View>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(rec.priority) }
              ]}>
                <Text style={styles.priorityText}>
                  {getPriorityName(rec.priority)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.recommendationDescription}>
              {rec.description}
            </Text>
            
            <View style={styles.recommendationMeta}>
              <Text style={styles.recommendationTime}>
                ⏱ 预计 {rec.estimatedTime} 分钟
              </Text>
              <Text style={styles.recommendationExercises}>
                📚 {rec.exercises.length} 个练习
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.startPracticeButton}
              onPress={() => {
                // 导航到练习页面
                screenReader.announceButtonAction('开始练习', '已点击');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`开始${rec.title}练习`}
            >
              <Text style={styles.startPracticeButtonText}>开始练习</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const getScoreDescription = (score: number): string => {
    if (score >= 90) return '优秀！发音非常标准';
    if (score >= 80) return '良好，发音基本准确';
    if (score >= 70) return '一般，需要多加练习';
    if (score >= 60) return '较差，建议重点练习';
    return '需要大量练习';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getErrorTypeName = (type: string): string => {
    const names = {
      substitution: '替换错误',
      omission: '遗漏错误',
      insertion: '插入错误',
      distortion: '扭曲错误',
    };
    return names[type] || type;
  };

  const getRecommendationIcon = (type: string): string => {
    const icons = {
      phoneme: '🔤',
      word: '📝',
      rhythm: '🎵',
      intonation: '🎶',
      speed: '⚡',
    };
    return icons[type] || '💡';
  };

  const getPriorityColor = (priority: string): string => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981',
    };
    return colors[priority] || '#64748b';
  };

  const getPriorityName = (priority: string): string => {
    const names = {
      high: '高',
      medium: '中',
      low: '低',
    };
    return names[priority] || priority;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'phonemes': return renderPhonemes();
      case 'words': return renderWords();
      case 'recommendations': return renderRecommendations();
      default: return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="发音评估结果页面头部"
        applyHighContrast={true}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>评估结果</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => {
              // 分享功能
              screenReader.announceButtonAction('分享结果', '已点击');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="分享结果"
          >
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      {/* 标签栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 16,
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
  tabContent: {
    padding: 20,
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
    fontSize: 64,
    fontWeight: 'bold',
    color: '#10b981',
  },
  overallScoreLabel: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 8,
  },
  scoreDescription: {
    fontSize: 16,
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  detailScoresCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  scoreGridItem: {
    width: (screenWidth - 80) / 2,
    alignItems: 'center',
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreCircleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreGridLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  scoreBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  feedbackText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 16,
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  feedbackItem: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
  improvementCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  improvementContent: {
    alignItems: 'center',
  },
  improvementValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10b981',
  },
  improvementLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  phonemeCard: {
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
  phonemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phonemeSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  phonemeScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phonemeDetails: {
    marginBottom: 12,
  },
  phonemeDetail: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  phonemeError: {
    fontSize: 14,
    color: '#ef4444',
  },
  phonemeProgressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  phonemeProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  wordCard: {
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
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  wordScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  wordDetails: {
    marginBottom: 12,
  },
  wordDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  wordDetailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  wordDetailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  wordProgressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
  },
  wordProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recommendationTime: {
    fontSize: 12,
    color: '#64748b',
  },
  recommendationExercises: {
    fontSize: 12,
    color: '#64748b',
  },
  startPracticeButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startPracticeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PronunciationResultsScreen;
