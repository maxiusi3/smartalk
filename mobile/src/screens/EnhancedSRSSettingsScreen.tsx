import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EnhancedSRSUserExperienceService, { SRSUserExperienceConfig } from '@/services/EnhancedSRSUserExperienceService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * EnhancedSRSSettingsScreen - V2 增强SRS设置界面
 * 提供完整的SRS个性化设置：通知偏好、复习偏好、学习习惯、个性化选项
 */
const EnhancedSRSSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [config, setConfig] = useState<SRSUserExperienceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const srsUXService = EnhancedSRSUserExperienceService.getInstance();

  useEffect(() => {
    loadUserConfig();
    screenReader.announcePageChange('SRS设置', '个性化您的间隔重复学习体验');
  }, []);

  const loadUserConfig = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      
      let userConfig = srsUXService.getUserConfig(userProgress.userId);
      if (!userConfig) {
        userConfig = await srsUXService.initializeUserConfig(userProgress.userId);
      }
      
      setConfig(userConfig);

    } catch (error) {
      console.error('Error loading user config:', error);
      Alert.alert('错误', '加载设置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<SRSUserExperienceConfig>) => {
    if (!userProgress?.userId || !config) return;

    try {
      setSaving(true);
      
      await srsUXService.updateUserConfig(userProgress.userId, updates);
      
      const updatedConfig = { ...config, ...updates };
      setConfig(updatedConfig);
      
      screenReader.announce('设置已保存');

    } catch (error) {
      console.error('Error updating config:', error);
      Alert.alert('错误', '保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const renderNotificationSettings = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="通知设置"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通知设置</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>启用复习提醒</Text>
            <Text style={styles.settingDescription}>
              在最佳时机提醒您进行复习
            </Text>
          </View>
          <Switch
            value={config?.notificationPreferences.enabled || false}
            onValueChange={(value) => updateConfig({
              notificationPreferences: {
                ...config!.notificationPreferences,
                enabled: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="启用复习提醒开关"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>静默时间</Text>
            <Text style={styles.settingDescription}>
              {config?.notificationPreferences.quietHours.enabled ? 
                `${config.notificationPreferences.quietHours.startHour}:00 - ${config.notificationPreferences.quietHours.endHour}:00` :
                '已关闭'
              }
            </Text>
          </View>
          <Switch
            value={config?.notificationPreferences.quietHours.enabled || false}
            onValueChange={(value) => updateConfig({
              notificationPreferences: {
                ...config!.notificationPreferences,
                quietHours: {
                  ...config!.notificationPreferences.quietHours,
                  enabled: value,
                },
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="静默时间开关"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>提醒频率</Text>
            <Text style={styles.settingDescription}>
              {getFrequencyLabel(config?.notificationPreferences.frequency)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showFrequencyOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择提醒频率"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>提醒风格</Text>
            <Text style={styles.settingDescription}>
              {getReminderStyleLabel(config?.notificationPreferences.reminderStyle)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showReminderStyleOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择提醒风格"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderReviewSettings = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="复习设置"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>复习设置</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>会话长度</Text>
            <Text style={styles.settingDescription}>
              {getSessionLengthLabel(config?.reviewPreferences.sessionLength)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showSessionLengthOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择会话长度"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>复习速度</Text>
            <Text style={styles.settingDescription}>
              {getReviewSpeedLabel(config?.reviewPreferences.reviewSpeed)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showReviewSpeedOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择复习速度"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>难度自适应</Text>
            <Text style={styles.settingDescription}>
              根据您的表现自动调整复习难度
            </Text>
          </View>
          <Switch
            value={config?.reviewPreferences.difficultyAdaptation || false}
            onValueChange={(value) => updateConfig({
              reviewPreferences: {
                ...config!.reviewPreferences,
                difficultyAdaptation: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="难度自适应开关"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>显示进度</Text>
            <Text style={styles.settingDescription}>
              在复习过程中显示进度条
            </Text>
          </View>
          <Switch
            value={config?.reviewPreferences.showProgress || false}
            onValueChange={(value) => updateConfig({
              reviewPreferences: {
                ...config!.reviewPreferences,
                showProgress: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="显示进度开关"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>庆祝连击</Text>
            <Text style={styles.settingDescription}>
              连续答对时显示庆祝动画
            </Text>
          </View>
          <Switch
            value={config?.reviewPreferences.celebrateStreaks || false}
            onValueChange={(value) => updateConfig({
              reviewPreferences: {
                ...config!.reviewPreferences,
                celebrateStreaks: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="庆祝连击开关"
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderPersonalizationSettings = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="个性化设置"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>个性化设置</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>激励水平</Text>
            <Text style={styles.settingDescription}>
              {getMotivationLevelLabel(config?.personalization.motivationLevel)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showMotivationLevelOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择激励水平"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>反馈风格</Text>
            <Text style={styles.settingDescription}>
              {getFeedbackStyleLabel(config?.personalization.feedbackStyle)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showFeedbackStyleOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择反馈风格"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>视觉主题</Text>
            <Text style={styles.settingDescription}>
              {getVisualThemeLabel(config?.personalization.visualTheme)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => showVisualThemeOptions()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="选择视觉主题"
          >
            <Text style={styles.optionButtonText}>更改</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>音效</Text>
            <Text style={styles.settingDescription}>
              复习时播放音效反馈
            </Text>
          </View>
          <Switch
            value={config?.personalization.soundEnabled || false}
            onValueChange={(value) => updateConfig({
              personalization: {
                ...config!.personalization,
                soundEnabled: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="音效开关"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>触觉反馈</Text>
            <Text style={styles.settingDescription}>
              答题时提供触觉反馈
            </Text>
          </View>
          <Switch
            value={config?.personalization.hapticsEnabled || false}
            onValueChange={(value) => updateConfig({
              personalization: {
                ...config!.personalization,
                hapticsEnabled: value,
              },
            })}
            disabled={saving}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="触觉反馈开关"
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderLearningHabits = () => {
    if (!config) return null;

    const { learningHabits } = config;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="学习习惯分析"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习习惯分析</Text>
          
          <View style={styles.habitCard}>
            <Text style={styles.habitTitle}>当前连击</Text>
            <Text style={styles.habitValue}>{learningHabits.streakCount} 天</Text>
          </View>

          <View style={styles.habitCard}>
            <Text style={styles.habitTitle}>最长连击</Text>
            <Text style={styles.habitValue}>{learningHabits.longestStreak} 天</Text>
          </View>

          <View style={styles.habitCard}>
            <Text style={styles.habitTitle}>一致性评分</Text>
            <Text style={styles.habitValue}>{learningHabits.consistencyScore}/100</Text>
          </View>

          <View style={styles.habitCard}>
            <Text style={styles.habitTitle}>平均会话时长</Text>
            <Text style={styles.habitValue}>{learningHabits.averageSessionDuration} 分钟</Text>
          </View>

          <View style={styles.habitCard}>
            <Text style={styles.habitTitle}>偏好学习时间</Text>
            <Text style={styles.habitValue}>
              {learningHabits.preferredTimes.map(hour => `${hour}:00`).join(', ')}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  // 辅助方法
  const getFrequencyLabel = (frequency?: 'low' | 'medium' | 'high'): string => {
    switch (frequency) {
      case 'low': return '低频 (1-2次/天)';
      case 'medium': return '中频 (3-4次/天)';
      case 'high': return '高频 (5+次/天)';
      default: return '中频';
    }
  };

  const getReminderStyleLabel = (style?: 'gentle' | 'motivational' | 'urgent'): string => {
    switch (style) {
      case 'gentle': return '温和提醒';
      case 'motivational': return '激励式';
      case 'urgent': return '紧急提醒';
      default: return '激励式';
    }
  };

  const getSessionLengthLabel = (length?: 'short' | 'medium' | 'long'): string => {
    switch (length) {
      case 'short': return '短 (5个单词)';
      case 'medium': return '中 (10个单词)';
      case 'long': return '长 (15个单词)';
      default: return '中';
    }
  };

  const getReviewSpeedLabel = (speed?: 'relaxed' | 'normal' | 'fast'): string => {
    switch (speed) {
      case 'relaxed': return '轻松 (10秒/词)';
      case 'normal': return '正常 (7秒/词)';
      case 'fast': return '快速 (5秒/词)';
      default: return '正常';
    }
  };

  const getMotivationLevelLabel = (level?: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low': return '低调';
      case 'medium': return '适中';
      case 'high': return '高能';
      default: return '适中';
    }
  };

  const getFeedbackStyleLabel = (style?: 'minimal' | 'encouraging' | 'detailed'): string => {
    switch (style) {
      case 'minimal': return '简洁';
      case 'encouraging': return '鼓励式';
      case 'detailed': return '详细';
      default: return '鼓励式';
    }
  };

  const getVisualThemeLabel = (theme?: 'simple' | 'colorful' | 'elegant'): string => {
    switch (theme) {
      case 'simple': return '简约';
      case 'colorful': return '多彩';
      case 'elegant': return '优雅';
      default: return '多彩';
    }
  };

  // 选项弹窗方法（简化实现）
  const showFrequencyOptions = () => {
    Alert.alert('提醒频率', '选择您希望的提醒频率', [
      { text: '低频 (1-2次/天)', onPress: () => updateFrequency('low') },
      { text: '中频 (3-4次/天)', onPress: () => updateFrequency('medium') },
      { text: '高频 (5+次/天)', onPress: () => updateFrequency('high') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const updateFrequency = (frequency: 'low' | 'medium' | 'high') => {
    updateConfig({
      notificationPreferences: {
        ...config!.notificationPreferences,
        frequency,
      },
    });
  };

  const showReminderStyleOptions = () => {
    Alert.alert('提醒风格', '选择您喜欢的提醒风格', [
      { text: '温和提醒', onPress: () => updateReminderStyle('gentle') },
      { text: '激励式', onPress: () => updateReminderStyle('motivational') },
      { text: '紧急提醒', onPress: () => updateReminderStyle('urgent') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showSessionLengthOptions = () => {
    Alert.alert('会话长度', '选择每次复习的单词数量', [
      { text: '短 (5个单词)', onPress: () => updateSessionLength('short') },
      { text: '中 (10个单词)', onPress: () => updateSessionLength('medium') },
      { text: '长 (15个单词)', onPress: () => updateSessionLength('long') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showReviewSpeedOptions = () => {
    Alert.alert('复习速度', '选择每个单词的思考时间', [
      { text: '轻松 (10秒/词)', onPress: () => updateReviewSpeed('relaxed') },
      { text: '正常 (7秒/词)', onPress: () => updateReviewSpeed('normal') },
      { text: '快速 (5秒/词)', onPress: () => updateReviewSpeed('fast') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showMotivationLevelOptions = () => {
    Alert.alert('激励水平', '选择您希望的激励程度', [
      { text: '低调', onPress: () => updateMotivationLevel('low') },
      { text: '适中', onPress: () => updateMotivationLevel('medium') },
      { text: '高能', onPress: () => updateMotivationLevel('high') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showFeedbackStyleOptions = () => {
    Alert.alert('反馈风格', '选择您喜欢的反馈方式', [
      { text: '简洁', onPress: () => updateFeedbackStyle('minimal') },
      { text: '鼓励式', onPress: () => updateFeedbackStyle('encouraging') },
      { text: '详细', onPress: () => updateFeedbackStyle('detailed') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const showVisualThemeOptions = () => {
    Alert.alert('视觉主题', '选择您喜欢的界面风格', [
      { text: '简约', onPress: () => updateVisualTheme('simple') },
      { text: '多彩', onPress: () => updateVisualTheme('colorful') },
      { text: '优雅', onPress: () => updateVisualTheme('elegant') },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const updateReminderStyle = (reminderStyle: 'gentle' | 'motivational' | 'urgent') => {
    updateConfig({
      notificationPreferences: {
        ...config!.notificationPreferences,
        reminderStyle,
      },
    });
  };

  const updateSessionLength = (sessionLength: 'short' | 'medium' | 'long') => {
    updateConfig({
      reviewPreferences: {
        ...config!.reviewPreferences,
        sessionLength,
      },
    });
  };

  const updateReviewSpeed = (reviewSpeed: 'relaxed' | 'normal' | 'fast') => {
    updateConfig({
      reviewPreferences: {
        ...config!.reviewPreferences,
        reviewSpeed,
      },
    });
  };

  const updateMotivationLevel = (motivationLevel: 'low' | 'medium' | 'high') => {
    updateConfig({
      personalization: {
        ...config!.personalization,
        motivationLevel,
      },
    });
  };

  const updateFeedbackStyle = (feedbackStyle: 'minimal' | 'encouraging' | 'detailed') => {
    updateConfig({
      personalization: {
        ...config!.personalization,
        feedbackStyle,
      },
    });
  };

  const updateVisualTheme = (visualTheme: 'simple' | 'colorful' | 'elegant') => {
    updateConfig({
      personalization: {
        ...config!.personalization,
        visualTheme,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载设置...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="SRS设置页面头部"
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
          
          <Text style={styles.headerTitle}>SRS设置</Text>
          
          <View style={styles.headerRight} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 通知设置 */}
        {renderNotificationSettings()}

        {/* 复习设置 */}
        {renderReviewSettings()}

        {/* 个性化设置 */}
        {renderPersonalizationSettings()}

        {/* 学习习惯分析 */}
        {renderLearningHabits()}
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  optionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  optionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  habitCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  habitValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
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

export default EnhancedSRSSettingsScreen;
