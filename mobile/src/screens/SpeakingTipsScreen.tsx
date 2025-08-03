import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SpeakingTipsService, { SpeakingTip, TipType } from '@/services/SpeakingTipsService';
import SpeakingTipCard from '@/components/SpeakingTipCard';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * SpeakingTipsScreen - V2 口语提示管理界面
 * 提供口语提示浏览、书签管理、偏好设置、统计查看功能
 */
const SpeakingTipsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [allTips, setAllTips] = useState<SpeakingTip[]>([]);
  const [bookmarkedTips, setBookmarkedTips] = useState<SpeakingTip[]>([]);
  const [selectedTip, setSelectedTip] = useState<SpeakingTip | null>(null);
  const [showTipCard, setShowTipCard] = useState(false);
  const [tipStats, setTipStats] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<TipType | 'all'>('all');
  const [loading, setLoading] = useState(false);

  const speakingTipsService = SpeakingTipsService.getInstance();

  useEffect(() => {
    loadTipsData();
    screenReader.announcePageChange('口语提示', '浏览和管理实用的口语提示和短语');
  }, []);

  const loadTipsData = async () => {
    try {
      setLoading(true);

      if (userProgress?.userId) {
        // 获取所有提示（模拟数据）
        const contextualTips = speakingTipsService.getContextualTips(userProgress.userId, {
          trigger: 'manual_request',
          maxTips: 20,
        });
        setAllTips(contextualTips);

        // 获取书签提示
        const bookmarked = speakingTipsService.getUserBookmarkedTips(userProgress.userId);
        setBookmarkedTips(bookmarked);

        // 获取统计数据
        const stats = speakingTipsService.getTipStatistics();
        setTipStats(stats);
      }

    } catch (error) {
      console.error('Error loading tips data:', error);
      Alert.alert('错误', '加载提示数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderTipTypeFilter = () => {
    const tipTypes: (TipType | 'all')[] = [
      'all',
      'emergency_phrases',
      'conversation_starters',
      'confidence_building',
      'pronunciation',
      'polite_expressions',
    ];

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="提示类型筛选"
        applyHighContrast={true}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {tipTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                selectedType === type && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedType(type)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`筛选${getTipTypeLabel(type)}类型提示`}
            >
              <Text style={[
                styles.filterButtonText,
                selectedType === type && styles.filterButtonTextActive,
              ]}>
                {getTipTypeLabel(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </AccessibilityWrapper>
    );
  };

  const renderStatsCards = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="提示统计"
      applyHighContrast={true}
    >
      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{tipStats?.totalTips || 0}</Text>
          <Text style={styles.statsLabel}>总提示数</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{bookmarkedTips.length}</Text>
          <Text style={styles.statsLabel}>已收藏</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>{tipStats?.totalViews || 0}</Text>
          <Text style={styles.statsLabel}>总浏览</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsNumber}>
            {tipStats?.averageRating ? tipStats.averageRating.toFixed(1) : '0.0'}
          </Text>
          <Text style={styles.statsLabel}>平均评分</Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderTipsList = () => {
    const filteredTips = selectedType === 'all' 
      ? allTips 
      : allTips.filter(tip => tip.type === selectedType);

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="提示列表"
        applyHighContrast={true}
      >
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>
            {selectedType === 'all' ? '所有提示' : getTipTypeLabel(selectedType)}
          </Text>
          
          {filteredTips.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>暂无相关提示</Text>
              <Text style={styles.emptyStateSubtext}>尝试选择其他类型或添加新提示</Text>
            </View>
          ) : (
            filteredTips.map((tip, index) => (
              <TouchableOpacity
                key={tip.tipId}
                style={styles.tipCard}
                onPress={() => showTip(tip)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`查看提示: ${tip.title}`}
              >
                <View style={styles.tipHeader}>
                  <Text style={styles.tipIcon}>{tip.visual.icon}</Text>
                  <View style={styles.tipInfo}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                  <View style={styles.tipMeta}>
                    <Text style={styles.tipPriority}>
                      {getPriorityLabel(tip.priority)}
                    </Text>
                    <Text style={styles.tipViews}>
                      {tip.usage.totalViews} 次浏览
                    </Text>
                  </View>
                </View>
                
                <View style={styles.tipPreview}>
                  <Text style={styles.tipPhrase}>"{tip.content.mainPhrase}"</Text>
                  <Text style={styles.tipTranslation}>{tip.content.translation}</Text>
                </View>
                
                <View style={styles.tipActions}>
                  <TouchableOpacity
                    style={styles.tipActionButton}
                    onPress={() => bookmarkTip(tip)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="收藏提示"
                  >
                    <Text style={styles.tipActionText}>
                      {bookmarkedTips.some(b => b.tipId === tip.tipId) ? '★' : '☆'}
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.tipActionButton}
                    onPress={() => playAudio(tip)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="播放发音"
                  >
                    <Text style={styles.tipActionText}>🔊</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.tipActionButton}
                    onPress={() => rateTip(tip)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="评价提示"
                  >
                    <Text style={styles.tipActionText}>⭐</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderBookmarkedTips = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="收藏的提示"
      applyHighContrast={true}
    >
      <View style={styles.bookmarksSection}>
        <Text style={styles.sectionTitle}>收藏的提示</Text>
        
        {bookmarkedTips.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>还没有收藏的提示</Text>
            <Text style={styles.emptyStateSubtext}>点击星号收藏有用的提示</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bookmarkedTips.map((tip, index) => (
              <TouchableOpacity
                key={tip.tipId}
                style={styles.bookmarkCard}
                onPress={() => showTip(tip)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`查看收藏的提示: ${tip.title}`}
              >
                <Text style={styles.bookmarkIcon}>{tip.visual.icon}</Text>
                <Text style={styles.bookmarkTitle}>{tip.title}</Text>
                <Text style={styles.bookmarkPhrase}>"{tip.content.mainPhrase}"</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </AccessibilityWrapper>
  );

  // 事件处理方法
  const showTip = (tip: SpeakingTip) => {
    setSelectedTip(tip);
    setShowTipCard(true);
    
    if (userProgress?.userId) {
      speakingTipsService.showTipCard(tip.tipId, userProgress.userId);
    }
  };

  const bookmarkTip = async (tip: SpeakingTip) => {
    if (!userProgress?.userId) return;

    try {
      const success = await speakingTipsService.bookmarkTip(tip.tipId, userProgress.userId);
      if (success) {
        loadTipsData(); // 刷新数据
        Alert.alert('收藏成功', `已收藏提示: ${tip.title}`);
      }
    } catch (error) {
      Alert.alert('收藏失败', '无法收藏此提示，请重试');
    }
  };

  const playAudio = (tip: SpeakingTip) => {
    // 这里应该实现音频播放功能
    Alert.alert('播放发音', `正在播放: ${tip.content.mainPhrase}`);
  };

  const rateTip = (tip: SpeakingTip) => {
    Alert.alert('评价提示', '请为这个提示评分', [
      { text: '⭐', onPress: () => submitRating(tip, 1) },
      { text: '⭐⭐', onPress: () => submitRating(tip, 2) },
      { text: '⭐⭐⭐', onPress: () => submitRating(tip, 3) },
      { text: '⭐⭐⭐⭐', onPress: () => submitRating(tip, 4) },
      { text: '⭐⭐⭐⭐⭐', onPress: () => submitRating(tip, 5) },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const submitRating = async (tip: SpeakingTip, rating: number) => {
    if (!userProgress?.userId) return;

    try {
      const success = await speakingTipsService.rateTip(tip.tipId, userProgress.userId, rating);
      if (success) {
        Alert.alert('评价成功', `感谢您的${rating}星评价！`);
        loadTipsData(); // 刷新数据
      }
    } catch (error) {
      Alert.alert('评价失败', '无法提交评价，请重试');
    }
  };

  // 辅助方法
  const getTipTypeLabel = (type: TipType | 'all'): string => {
    const labels: { [key: string]: string } = {
      all: '全部',
      emergency_phrases: '紧急短语',
      conversation_starters: '对话开场',
      polite_expressions: '礼貌表达',
      clarification: '澄清说明',
      pronunciation: '发音技巧',
      grammar_quick: '语法速记',
      cultural_context: '文化背景',
      confidence_building: '信心建设',
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority: string): string => {
    const labels: { [key: string]: string } = {
      high: '重要',
      medium: '一般',
      low: '参考',
    };
    return labels[priority] || priority;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载口语提示...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="口语提示页面头部"
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
          
          <Text style={styles.headerTitle}>口语提示</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadTipsData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="刷新数据"
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 统计卡片 */}
        {renderStatsCards()}

        {/* 类型筛选 */}
        {renderTipTypeFilter()}

        {/* 收藏的提示 */}
        {renderBookmarkedTips()}

        {/* 提示列表 */}
        {renderTipsList()}
      </ScrollView>

      {/* 提示卡片弹窗 */}
      {selectedTip && (
        <SpeakingTipCard
          tip={selectedTip}
          config={{
            cardId: 'default_popup',
            layout: { position: 'center', size: 'medium', style: 'popup' },
            animation: { entrance: 'fadeInUp', exit: 'fadeOutDown', duration: 300, easing: 'ease-out' },
            interaction: { tapToDismiss: true, swipeToBookmark: true, longPressForMore: true, autoHide: true, autoHideDelay: 10000 },
            theme: { backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#3b82f6', borderRadius: 12, shadow: true },
          }}
          userId={userProgress?.userId || ''}
          visible={showTipCard}
          onDismiss={() => setShowTipCard(false)}
          onBookmark={() => loadTipsData()}
          onRate={(rating) => submitRating(selectedTip, rating)}
        />
      )}
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  statsCard: {
    flex: 1,
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
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  bookmarksSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bookmarkCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginLeft: 20,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookmarkIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  bookmarkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  bookmarkPhrase: {
    fontSize: 12,
    color: '#64748b',
  },
  tipsSection: {
    paddingHorizontal: 20,
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
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  tipInfo: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  tipMeta: {
    alignItems: 'flex-end',
  },
  tipPriority: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 2,
  },
  tipViews: {
    fontSize: 10,
    color: '#94a3b8',
  },
  tipPreview: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tipPhrase: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  tipTranslation: {
    fontSize: 13,
    color: '#64748b',
  },
  tipActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tipActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipActionText: {
    fontSize: 16,
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

export default SpeakingTipsScreen;
