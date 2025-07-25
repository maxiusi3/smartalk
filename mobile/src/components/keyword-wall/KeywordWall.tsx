import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { KeywordWallProps, KeywordItem, ProgressData, GridLayout } from '@/types/keyword-wall.types';
import { 
  KEYWORD_WALL_THEME, 
  KEYWORD_WALL_TEXTS, 
  SAMPLE_KEYWORDS,
  calculateGridLayout 
} from '@/constants/keyword-wall';
import { useAppStore } from '@/store/useAppStore';
import { ApiService } from '@/services/ApiService';
import KeywordItemComponent from './KeywordItem';
import ProgressIndicator from './ProgressIndicator';
import UnlockAnimation from './UnlockAnimation';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * KeywordWall组件
 * 显示15个词汇的"故事线索"网格，支持解锁动画和进度跟踪
 */
const KeywordWall: React.FC<KeywordWallProps> = ({
  dramaId,
  userId,
  onKeywordClick,
  onProgressUpdate,
  theme = KEYWORD_WALL_THEME,
  animationEnabled = true,
  showProgressIndicator = true,
}) => {
  const [keywords, setKeywords] = useState<KeywordItem[]>(SAMPLE_KEYWORDS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gridLayout, setGridLayout] = useState<GridLayout | null>(null);
  const [lastUnlockedId, setLastUnlockedId] = useState<string | null>(null);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  const { user } = useAppStore();

  // 计算网格布局
  useEffect(() => {
    const containerWidth = screenWidth - (theme.spacing.container * 2);
    const containerHeight = screenHeight * 0.6; // 60% of screen height
    const layout = calculateGridLayout(containerWidth, containerHeight, keywords.length);
    setGridLayout(layout);
  }, [keywords.length, theme.spacing.container]);

  // 加载用户进度
  useEffect(() => {
    if (userId && dramaId) {
      loadUserProgress();
    }
  }, [userId, dramaId]);

  /**
   * 加载用户进度数据
   */
  const loadUserProgress = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getUserProgress(userId, dramaId);
      
      if (response.success && response.data) {
        // 更新关键词解锁状态
        const updatedKeywords = keywords.map(keyword => {
          const progress = response.data.progress.find(p => p.keywordId === keyword.id);
          return {
            ...keyword,
            isUnlocked: progress?.status === 'completed' || progress?.status === 'unlocked',
            unlockedAt: progress?.completedAt ? new Date(progress.completedAt) : undefined,
          };
        });
        
        setKeywords(updatedKeywords);
        
        // 更新进度数据
        const unlockedCount = updatedKeywords.filter(k => k.isUnlocked).length;
        const progressData: ProgressData = {
          unlockedCount,
          totalCount: keywords.length,
          percentage: (unlockedCount / keywords.length) * 100,
          recentlyUnlocked: [],
        };
        
        onProgressUpdate?.(progressData);
      }
    } catch (error) {
      console.error('Failed to load user progress:', error);
      setError('加载进度失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理关键词解锁
   */
  const handleKeywordUnlock = useCallback(async (keywordId: string) => {
    const keyword = keywords.find(k => k.id === keywordId);
    if (!keyword || keyword.isUnlocked) return;

    try {
      // 乐观更新
      const updatedKeywords = keywords.map(k => 
        k.id === keywordId 
          ? { ...k, isUnlocked: true, unlockedAt: new Date() }
          : k
      );
      setKeywords(updatedKeywords);
      setLastUnlockedId(keywordId);

      // 显示解锁动画
      if (animationEnabled) {
        setShowUnlockAnimation(true);
      }

      // 调用API更新进度
      const response = await ApiService.unlockProgress({
        userId,
        dramaId,
        keywordId,
        isCorrect: true,
      });

      if (response.success) {
        // 更新进度数据
        const unlockedCount = updatedKeywords.filter(k => k.isUnlocked).length;
        const progressData: ProgressData = {
          unlockedCount,
          totalCount: keywords.length,
          percentage: (unlockedCount / keywords.length) * 100,
          recentlyUnlocked: [keyword],
          milestoneReached: unlockedCount === 5 || unlockedCount === 10 || unlockedCount === 15,
          milestoneType: unlockedCount === 5 ? 'quarter' : 
                       unlockedCount === 10 ? 'half' : 
                       unlockedCount === 15 ? 'complete' : undefined,
        };
        
        onProgressUpdate?.(progressData);
      }
    } catch (error) {
      console.error('Failed to unlock keyword:', error);
      // 回滚乐观更新
      setKeywords(prev => prev.map(k => 
        k.id === keywordId 
          ? { ...k, isUnlocked: false, unlockedAt: undefined }
          : k
      ));
    }
  }, [keywords, userId, dramaId, animationEnabled, onProgressUpdate]);

  /**
   * 处理关键词点击
   */
  const handleKeywordPress = useCallback((keyword: KeywordItem) => {
    if (keyword.isUnlocked) {
      onKeywordClick?.(keyword);
    }
  }, [onKeywordClick]);

  /**
   * 处理解锁动画完成
   */
  const handleUnlockAnimationComplete = useCallback(() => {
    setShowUnlockAnimation(false);
    setLastUnlockedId(null);
  }, []);

  /**
   * 处理下拉刷新
   */
  const handleRefresh = useCallback(() => {
    loadUserProgress();
  }, []);

  // 计算进度数据
  const unlockedCount = keywords.filter(k => k.isUnlocked).length;
  const progressData: ProgressData = {
    unlockedCount,
    totalCount: keywords.length,
    percentage: (unlockedCount / keywords.length) * 100,
    recentlyUnlocked: [],
  };

  // 渲染错误状态
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 标题区域 */}
      <View style={styles.header}>
        <Text style={[styles.title, theme.fonts.title, { color: theme.colors.text }]}>
          {KEYWORD_WALL_TEXTS.title}
        </Text>
        <Text style={[styles.subtitle, theme.fonts.subtitle, { color: theme.colors.text }]}>
          {KEYWORD_WALL_TEXTS.subtitle}
        </Text>
      </View>

      {/* 进度指示器 */}
      {showProgressIndicator && (
        <ProgressIndicator
          current={progressData.unlockedCount}
          total={progressData.totalCount}
          title={`${KEYWORD_WALL_TEXTS.progressLabel} ${progressData.unlockedCount}/${progressData.totalCount} ${KEYWORD_WALL_TEXTS.progressSuffix}`}
          color={theme.colors.progress}
          backgroundColor={theme.colors.locked}
        />
      )}

      {/* 关键词网格 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.progress}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.grid,
          gridLayout && {
            width: gridLayout.containerWidth,
            alignSelf: 'center',
          }
        ]}>
          {keywords.map((keyword, index) => (
            <KeywordItemComponent
              key={keyword.id}
              keyword={keyword}
              isRecentlyUnlocked={keyword.id === lastUnlockedId}
              onPress={handleKeywordPress}
              animationDelay={index * 50}
              size="medium"
              disabled={isLoading}
            />
          ))}
        </View>
      </ScrollView>

      {/* 解锁动画 */}
      {showUnlockAnimation && lastUnlockedId && (
        <UnlockAnimation
          isVisible={showUnlockAnimation}
          keyword={keywords.find(k => k.id === lastUnlockedId)!}
          onAnimationComplete={handleUnlockAnimationComplete}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default KeywordWall;
