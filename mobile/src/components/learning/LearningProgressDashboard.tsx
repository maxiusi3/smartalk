import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLearningProgress, useLearningStats } from '@/hooks/useLearningProgress';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { ThemeProgress, StoryProgress } from '@/services/LearningProgressService';

interface LearningProgressDashboardProps {
  onThemeSelect?: (themeId: string) => void;
  onStorySelect?: (storyId: string) => void;
  onReviewSelect?: () => void;
  showDetailedStats?: boolean;
}

/**
 * LearningProgressDashboard - V2 学习进度仪表板
 * 提供完整的学习进度展示：整体统计、主题进度、故事状态
 */
const LearningProgressDashboard: React.FC<LearningProgressDashboardProps> = ({
  onThemeSelect,
  onStorySelect,
  onReviewSelect,
  showDetailedStats = true,
}) => {
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const {
    overallProgress,
    currentThemeProgress,
    reviewKeywords,
    loading,
    error,
    hasReviewKeywords,
    totalProgress,
    selectTheme,
  } = useLearningProgress();

  const {
    stats,
    formattedTotalTime,
    accuracyPercentage,
    isOnStreak,
    isActiveThisWeek,
  } = useLearningStats();

  const screenData = Dimensions.get('window');
  const isTablet = screenData.width > 768;

  useEffect(() => {
    if (overallProgress) {
      screenReader.announce(`学习进度已加载，总进度${totalProgress}%`);
    }
  }, [overallProgress, totalProgress]);

  const getThemeColor = (themeId: string): string => {
    switch (themeId) {
      case 'daily_life': return '#10b981';
      case 'business': return '#3b82f6';
      case 'travel': return '#f59e0b';
      case 'culture': return '#8b5cf6';
      case 'technology': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const getThemeName = (themeId: string): string => {
    switch (themeId) {
      case 'daily_life': return '日常生活';
      case 'business': return '商务英语';
      case 'travel': return '旅行英语';
      case 'culture': return '文化交流';
      case 'technology': return '科技英语';
      default: return '通用英语';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'mastered': return '⭐';
      case 'needs_review': return '🔄';
      default: return '⭕';
    }
  };

  const renderOverallStats = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="整体学习统计"
      applyHighContrast={true}
    >
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>学习统计</Text>
        
        <View style={[
          styles.statsGrid,
          isTablet && styles.statsGridTablet
        ]}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalProgress}%</Text>
            <Text style={styles.statLabel}>总体进度</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formattedTotalTime}</Text>
            <Text style={styles.statLabel}>学习时长</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalKeywordsLearned || 0}</Text>
            <Text style={styles.statLabel}>已学关键词</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{accuracyPercentage}%</Text>
            <Text style={styles.statLabel}>准确率</Text>
          </View>
        </View>

        {showDetailedStats && (
          <View style={styles.detailedStats}>
            <View style={styles.streakContainer}>
              <Text style={[
                styles.streakText,
                isOnStreak && styles.activeStreak
              ]}>
                {isOnStreak ? '🔥' : '📅'} {stats?.currentStreak || 0} 天连续学习
              </Text>
              
              <Text style={styles.weeklyActivity}>
                本周学习 {stats?.sessionsThisWeek || 0} 次
                {isActiveThisWeek && ' 🎯'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderReviewSection = () => {
    if (!hasReviewKeywords) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="复习提醒"
        applyHighContrast={true}
      >
        <TouchableOpacity
          style={styles.reviewCard}
          onPress={onReviewSelect}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`有${reviewKeywords.length}个关键词需要复习`}
          accessibilityHint="点击开始复习"
        >
          <View style={styles.reviewHeader}>
            <Text style={styles.reviewIcon}>📚</Text>
            <View style={styles.reviewInfo}>
              <Text style={styles.reviewTitle}>复习提醒</Text>
              <Text style={styles.reviewSubtitle}>
                {reviewKeywords.length} 个关键词需要复习
              </Text>
            </View>
            <Text style={styles.reviewArrow}>→</Text>
          </View>
        </TouchableOpacity>
      </AccessibilityWrapper>
    );
  };

  const renderThemeProgress = (theme: ThemeProgress) => (
    <AccessibilityWrapper
      key={theme.themeId}
      accessibilityRole="button"
      accessibilityLabel={`${getThemeName(theme.themeId)}主题，进度${theme.progressPercentage}%`}
      accessibilityHint="点击查看主题详情"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={styles.themeCard}
        onPress={() => {
          selectTheme(theme.themeId);
          onThemeSelect?.(theme.themeId);
        }}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.themeHeader}>
          <View style={[
            styles.themeColorBar,
            { backgroundColor: getThemeColor(theme.themeId) }
          ]} />
          
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>
              {getThemeName(theme.themeId)}
            </Text>
            <Text style={styles.themeStats}>
              {theme.completedStories}/{theme.totalStories} 故事完成
            </Text>
          </View>
          
          <View style={styles.themeProgress}>
            <Text style={styles.themeProgressText}>
              {Math.round(theme.progressPercentage)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarTrack}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${theme.progressPercentage}%`,
                  backgroundColor: getThemeColor(theme.themeId)
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.themeDetails}>
          <Text style={styles.themeDetailText}>
            已学习 {theme.totalKeywordsLearned} 个关键词
          </Text>
          <Text style={styles.themeDetailText}>
            平均准确率 {Math.round(theme.averageAccuracy * 100)}%
          </Text>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderStoryProgress = (story: StoryProgress) => (
    <AccessibilityWrapper
      key={story.storyId}
      accessibilityRole="button"
      accessibilityLabel={`故事${story.storyId}，状态${story.status}，进度${story.progressPercentage}%`}
      accessibilityHint="点击继续学习"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={styles.storyCard}
        onPress={() => onStorySelect?.(story.storyId)}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.storyHeader}>
          <Text style={styles.storyStatus}>
            {getStatusIcon(story.status)}
          </Text>
          
          <View style={styles.storyInfo}>
            <Text style={styles.storyTitle}>
              {story.storyId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.storyProgress}>
              {story.completedKeywords}/{story.totalKeywords} 关键词
            </Text>
          </View>
          
          <View style={styles.storyTime}>
            <Text style={styles.storyTimeText}>
              {Math.round(story.totalTimeSpent / 60)}分钟
            </Text>
          </View>
        </View>

        {story.currentSession?.isActive && (
          <View style={styles.activeSessionIndicator}>
            <Text style={styles.activeSessionText}>
              🔄 有未完成的学习会话
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加载学习进度...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>加载失败</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!overallProgress) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无学习进度</Text>
        <Text style={styles.emptySubtext}>开始您的学习之旅吧！</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, getLayoutDirectionStyles()]}
      showsVerticalScrollIndicator={false}
    >
      {/* 整体统计 */}
      {renderOverallStats()}

      {/* 复习提醒 */}
      {renderReviewSection()}

      {/* 主题进度 */}
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="主题学习进度"
        applyHighContrast={true}
      >
        <View style={styles.themesContainer}>
          <Text style={styles.sectionTitle}>学习主题</Text>
          <View style={styles.themesList}>
            {overallProgress.themes.map(renderThemeProgress)}
          </View>
        </View>
      </AccessibilityWrapper>

      {/* 当前主题的故事进度 */}
      {currentThemeProgress && (
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="当前主题故事进度"
          applyHighContrast={true}
        >
          <View style={styles.storiesContainer}>
            <Text style={styles.sectionTitle}>
              {getThemeName(currentThemeProgress.themeId)} - 故事进度
            </Text>
            <View style={styles.storiesList}>
              {currentThemeProgress.stories.map(renderStoryProgress)}
            </View>
          </View>
        </AccessibilityWrapper>
      )}
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
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statsGridTablet: {
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 80,
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  detailedStats: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  streakContainer: {
    alignItems: 'center',
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  activeStreak: {
    color: '#f59e0b',
  },
  weeklyActivity: {
    fontSize: 14,
    color: '#94a3b8',
  },
  reviewCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: '#a16207',
  },
  reviewArrow: {
    fontSize: 18,
    color: '#92400e',
  },
  themesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  themesList: {
    gap: 12,
  },
  themeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  themeColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  themeStats: {
    fontSize: 14,
    color: '#64748b',
  },
  themeProgress: {
    alignItems: 'center',
  },
  themeProgressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  themeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeDetailText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  storiesContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  storiesList: {
    gap: 8,
  },
  storyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyStatus: {
    fontSize: 20,
    marginRight: 12,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  storyProgress: {
    fontSize: 12,
    color: '#64748b',
  },
  storyTime: {
    alignItems: 'center',
  },
  storyTimeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  activeSessionIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  activeSessionText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
});

export default LearningProgressDashboard;
