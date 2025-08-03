import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import { ContentTheme } from '@/services/ContentManagementService';
import { AnalyticsService } from '@/services/AnalyticsService';

interface StoryPreviewScreenProps {
  route: {
    params: {
      themeId: string;
      storyId: string;
    };
  };
}

interface StoryPreviewData {
  id: string;
  title: string;
  description: string;
  theme: ContentTheme;
  
  // 角色信息
  characters: {
    id: string;
    name: string;
    description: string;
    avatar: string;
    role: 'protagonist' | 'supporting' | 'narrator';
  }[];
  
  // 场景设置
  setting: {
    location: string;
    time: string;
    context: string;
    mood: string;
  };
  
  // 预告视频
  teaserVideo: {
    contentId: string;
    duration: number;
    keywordCount: number;
    keywords: string[];
  };
  
  // 学习目标
  learningObjectives: string[];
  
  // 难度信息
  difficulty: {
    level: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number; // minutes
    keywordCount: number;
  };
}

/**
 * StoryPreviewScreen - V2 故事预览界面
 * 提供完整的故事预览体验：角色介绍、场景设置、预告视频
 */
const StoryPreviewScreen: React.FC<StoryPreviewScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const { themeId, storyId } = route.params;
  const [storyData, setStoryData] = useState<StoryPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  const analyticsService = AnalyticsService.getInstance();
  const screenData = Dimensions.get('window');

  useEffect(() => {
    loadStoryData();
    screenReader.announcePageChange('故事预览', '了解故事背景和角色');
    
    analyticsService.track('story_preview_viewed', {
      themeId,
      storyId,
      timestamp: Date.now(),
    });
  }, [themeId, storyId]);

  const loadStoryData = async () => {
    try {
      setLoading(true);
      
      // 模拟加载故事数据
      // 在实际应用中，这里会从ContentManagementService获取数据
      const mockStoryData: StoryPreviewData = {
        id: storyId,
        title: '咖啡店的邂逅',
        description: '在繁忙的都市咖啡店里，一次偶然的相遇改变了两个人的生活轨迹。通过这个温馨的故事，学习日常交流中的关键词汇和表达方式。',
        theme: 'daily_life',
        characters: [
          {
            id: 'char_1',
            name: 'Emma',
            description: '一位热爱阅读的年轻作家，经常在咖啡店寻找灵感',
            avatar: '👩‍💼',
            role: 'protagonist',
          },
          {
            id: 'char_2',
            name: 'David',
            description: '友善的咖啡师，对每位顾客都很用心',
            avatar: '👨‍🍳',
            role: 'supporting',
          },
          {
            id: 'char_3',
            name: '旁白',
            description: '故事的引导者，帮助你理解情节发展',
            avatar: '🎭',
            role: 'narrator',
          },
        ],
        setting: {
          location: '市中心的温馨咖啡店',
          time: '阳光明媚的周末下午',
          context: '繁忙都市中的宁静角落',
          mood: '温暖、轻松、充满希望',
        },
        teaserVideo: {
          contentId: `teaser_${storyId}`,
          duration: 30,
          keywordCount: 5,
          keywords: ['coffee', 'order', 'please', 'thank you', 'enjoy'],
        },
        learningObjectives: [
          '掌握咖啡店常用词汇',
          '学会礼貌的点餐表达',
          '理解日常对话的语调',
          '培养自然的交流节奏',
          '建立语言使用的信心',
        ],
        difficulty: {
          level: 'intermediate',
          estimatedTime: 15,
          keywordCount: 5,
        },
      };

      setStoryData(mockStoryData);
      
    } catch (error) {
      console.error('Error loading story data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    analyticsService.track('story_learning_started', {
      themeId,
      storyId,
      fromPreview: true,
      timestamp: Date.now(),
    });

    navigation.navigate('vTPRScreen', {
      themeId,
      storyId,
      fromPreview: true,
    });
  };

  const handleWatchTeaser = () => {
    setShowVideo(true);
    screenReader.announce('开始播放预告视频');
    
    analyticsService.track('story_teaser_watched', {
      themeId,
      storyId,
      timestamp: Date.now(),
    });
  };

  const getThemeColor = (theme: ContentTheme): string => {
    switch (theme) {
      case 'daily_life': return '#10b981';
      case 'business': return '#3b82f6';
      case 'travel': return '#f59e0b';
      case 'culture': return '#8b5cf6';
      case 'technology': return '#06b6d4';
      default: return '#64748b';
    }
  };

  const getThemeName = (theme: ContentTheme): string => {
    switch (theme) {
      case 'daily_life': return '日常生活';
      case 'business': return '商务英语';
      case 'travel': return '旅行英语';
      case 'culture': return '文化交流';
      case 'technology': return '科技英语';
      default: return '通用英语';
    }
  };

  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'beginner': return '#10b981';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getDifficultyName = (level: string): string => {
    switch (level) {
      case 'beginner': return '初级';
      case 'intermediate': return '中级';
      case 'advanced': return '高级';
      default: return '未知';
    }
  };

  const renderCharacter = (character: any) => (
    <AccessibilityWrapper
      key={character.id}
      accessibilityRole="group"
      accessibilityLabel={`角色${character.name}：${character.description}`}
      applyHighContrast={true}
    >
      <View style={styles.characterCard}>
        <View style={styles.characterHeader}>
          <Text style={styles.characterAvatar}>{character.avatar}</Text>
          <View style={styles.characterInfo}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterRole}>
              {character.role === 'protagonist' ? '主角' :
               character.role === 'supporting' ? '配角' : '旁白'}
            </Text>
          </View>
        </View>
        <Text style={styles.characterDescription}>
          {character.description}
        </Text>
      </View>
    </AccessibilityWrapper>
  );

  const renderLearningObjective = (objective: string, index: number) => (
    <AccessibilityWrapper
      key={index}
      accessibilityRole="text"
      accessibilityLabel={`学习目标${index + 1}：${objective}`}
      applyHighContrast={true}
    >
      <View style={styles.objectiveItem}>
        <View style={styles.objectiveNumber}>
          <Text style={styles.objectiveNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.objectiveText}>{objective}</Text>
      </View>
    </AccessibilityWrapper>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载故事信息...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!storyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>故事信息加载失败</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadStoryData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="重新加载"
          >
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="故事预览页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>故事预览</Text>
          <View style={styles.headerSpacer} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 故事标题和主题 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="故事信息"
          applyHighContrast={true}
        >
          <View style={styles.storyHeader}>
            <View style={styles.storyTitleRow}>
              <Text style={styles.storyTitle}>{storyData.title}</Text>
              <View style={[
                styles.themeBadge,
                { backgroundColor: getThemeColor(storyData.theme) }
              ]}>
                <Text style={styles.themeBadgeText}>
                  {getThemeName(storyData.theme)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.storyDescription}>
              {storyData.description}
            </Text>

            <View style={styles.storyMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>难度</Text>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor(storyData.difficulty.level) }
                ]}>
                  <Text style={styles.difficultyText}>
                    {getDifficultyName(storyData.difficulty.level)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>预计时长</Text>
                <Text style={styles.metaValue}>
                  {storyData.difficulty.estimatedTime} 分钟
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>关键词</Text>
                <Text style={styles.metaValue}>
                  {storyData.difficulty.keywordCount} 个
                </Text>
              </View>
            </View>
          </View>
        </AccessibilityWrapper>

        {/* 预告视频区域 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="预告视频"
          applyHighContrast={true}
        >
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>30秒预告片</Text>
            <Text style={styles.sectionSubtitle}>
              集齐所有钥匙，见证奇迹时刻 ✨
            </Text>
            
            {showVideo ? (
              <EnhancedVideoPlayer
                contentId={storyData.teaserVideo.contentId}
                mode="teaser"
                autoplay={true}
                showControls={true}
                style={styles.videoPlayer}
              />
            ) : (
              <TouchableOpacity
                style={styles.videoPreview}
                onPress={handleWatchTeaser}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="播放预告视频"
                accessibilityHint="观看30秒故事预告"
              >
                <View style={styles.videoPreviewContent}>
                  <Text style={styles.playIcon}>▶️</Text>
                  <Text style={styles.videoPreviewText}>观看预告</Text>
                  <Text style={styles.videoPreviewDuration}>
                    {storyData.teaserVideo.duration}秒
                  </Text>
                </View>
                
                <View style={styles.keywordPreview}>
                  <Text style={styles.keywordPreviewTitle}>将学习的关键词：</Text>
                  <View style={styles.keywordList}>
                    {storyData.teaserVideo.keywords.map((keyword, index) => (
                      <View key={index} style={styles.keywordChip}>
                        <Text style={styles.keywordText}>{keyword}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </AccessibilityWrapper>

        {/* 角色介绍 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="角色介绍"
          applyHighContrast={true}
        >
          <View style={styles.charactersSection}>
            <Text style={styles.sectionTitle}>角色介绍</Text>
            <View style={styles.charactersGrid}>
              {storyData.characters.map(renderCharacter)}
            </View>
          </View>
        </AccessibilityWrapper>

        {/* 场景设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="场景设置"
          applyHighContrast={true}
        >
          <View style={styles.settingSection}>
            <Text style={styles.sectionTitle}>场景设置</Text>
            <View style={styles.settingGrid}>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>📍 地点</Text>
                <Text style={styles.settingValue}>{storyData.setting.location}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>⏰ 时间</Text>
                <Text style={styles.settingValue}>{storyData.setting.time}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>🎭 背景</Text>
                <Text style={styles.settingValue}>{storyData.setting.context}</Text>
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>💫 氛围</Text>
                <Text style={styles.settingValue}>{storyData.setting.mood}</Text>
              </View>
            </View>
          </View>
        </AccessibilityWrapper>

        {/* 学习目标 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="学习目标"
          applyHighContrast={true}
        >
          <View style={styles.objectivesSection}>
            <Text style={styles.sectionTitle}>学习目标</Text>
            <View style={styles.objectivesList}>
              {storyData.learningObjectives.map(renderLearningObjective)}
            </View>
          </View>
        </AccessibilityWrapper>
      </ScrollView>

      {/* 底部操作按钮 */}
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="操作按钮"
        applyExtendedTouchTarget={true}
        applyHighContrast={true}
      >
        <View style={[styles.actionButtons, getLayoutDirectionStyles()]}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="稍后学习"
            accessibilityHint="返回主页面"
          >
            <Text style={styles.secondaryButtonText}>稍后学习</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: getThemeColor(storyData.theme) }
            ]}
            onPress={handleStartLearning}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="开始学习"
            accessibilityHint="进入故事学习模式"
          >
            <Text style={styles.primaryButtonText}>开始学习 🚀</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>
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
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  storyHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  storyTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  themeBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  themeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storyDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 16,
  },
  storyMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  difficultyBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  videoSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  videoPlayer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  videoPreview: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    aspectRatio: 16/9,
    justifyContent: 'center',
  },
  videoPreviewContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  playIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  videoPreviewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  videoPreviewDuration: {
    fontSize: 14,
    color: '#94a3b8',
  },
  keywordPreview: {
    alignItems: 'center',
  },
  keywordPreviewTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  keywordList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  keywordChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  keywordText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  charactersSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  charactersGrid: {
    gap: 12,
  },
  characterCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterAvatar: {
    fontSize: 32,
    marginRight: 12,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  characterRole: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  characterDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  settingSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  settingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  settingItem: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 150,
  },
  settingLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  objectivesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  objectivesList: {
    gap: 12,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  objectiveNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  objectiveNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  objectiveText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StoryPreviewScreen;
