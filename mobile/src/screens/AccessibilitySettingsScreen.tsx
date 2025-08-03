import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AccessibilityService, { AccessibilityConfig } from '@/services/AccessibilityService';
import { useUserState } from '@/contexts/UserStateContext';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * AccessibilitySettingsScreen - V2 无障碍设置界面
 * 提供完整的无障碍功能配置选项
 * 符合WCAG 2.1 AA标准的设置界面
 */
const AccessibilitySettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProgress } = useUserState();
  const [config, setConfig] = useState<AccessibilityConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessibilityScore, setAccessibilityScore] = useState<number>(0);

  const accessibilityService = AccessibilityService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadAccessibilitySettings();
  }, []);

  const loadAccessibilitySettings = async () => {
    if (!userProgress?.userId) return;
    
    try {
      setLoading(true);
      
      const [accessibilityConfig, checkResult] = await Promise.all([
        accessibilityService.loadAccessibilityConfig(userProgress.userId),
        accessibilityService.performAccessibilityCheck(),
      ]);
      
      setConfig(accessibilityConfig);
      setAccessibilityScore(checkResult.score);
      
      analyticsService.track('accessibility_settings_viewed', {
        userId: userProgress.userId,
        score: checkResult.score,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
      Alert.alert('错误', '加载无障碍设置失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: keyof AccessibilityConfig, value: any) => {
    if (!userProgress?.userId || !config) return;
    
    try {
      const updatedConfig = { ...config, [key]: value };
      setConfig(updatedConfig);
      
      await accessibilityService.updateAccessibilityConfig(
        userProgress.userId,
        { [key]: value }
      );
      
      // 重新检查无障碍得分
      const checkResult = await accessibilityService.performAccessibilityCheck();
      setAccessibilityScore(checkResult.score);
      
      // 提供反馈
      accessibilityService.announceForScreenReader(
        `${getSettingName(key)}已${value ? '启用' : '禁用'}`,
        'polite'
      );
      
      analyticsService.track('accessibility_setting_changed', {
        userId: userProgress.userId,
        setting: key,
        value,
        newScore: checkResult.score,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error updating accessibility setting:', error);
      Alert.alert('错误', '更新设置失败，请重试。');
    }
  };

  const getSettingName = (key: keyof AccessibilityConfig): string => {
    const names: { [K in keyof AccessibilityConfig]: string } = {
      screenReaderEnabled: '屏幕阅读器支持',
      announcePageChanges: '页面变化公告',
      announceButtonActions: '按钮操作公告',
      announceProgressUpdates: '进度更新公告',
      highContrastMode: '高对比度模式',
      largeTextMode: '大字体模式',
      fontSizeMultiplier: '字体大小倍数',
      colorBlindnessSupport: '色盲支持',
      reduceMotion: '减少动画',
      disableAutoplay: '禁用自动播放',
      extendedTouchTargets: '扩展触摸目标',
      simplifiedInterface: '简化界面',
      focusIndicators: '焦点指示器',
      timeoutExtensions: '超时延长',
      visualCaptions: '视觉字幕',
      hapticFeedback: '触觉反馈',
      visualIndicators: '视觉指示器',
      voiceNavigationEnabled: '语音导航',
      voiceCommandsEnabled: '语音命令',
      lastUpdated: '最后更新时间',
    };
    return names[key] || key;
  };

  const renderSectionHeader = (title: string, description: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );

  const renderSwitchSetting = (
    key: keyof AccessibilityConfig,
    title: string,
    description: string,
    value: boolean
  ) => (
    <View 
      style={styles.settingItem}
      accessible={true}
      accessibilityRole="switch"
      accessibilityLabel={`${title}，${description}，当前${value ? '已启用' : '已禁用'}`}
      accessibilityHint={`双击以${value ? '禁用' : '启用'}${title}`}
    >
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => updateSetting(key, newValue)}
        trackColor={{ false: '#e2e8f0', true: '#10b981' }}
        thumbColor={value ? '#FFFFFF' : '#64748b'}
        accessibilityLabel={`${title}开关`}
      />
    </View>
  );

  const renderFontSizeSlider = () => {
    if (!config) return null;
    
    const fontSizes = [
      { value: 1.0, label: '标准' },
      { value: 1.2, label: '大' },
      { value: 1.5, label: '更大' },
      { value: 2.0, label: '最大' },
    ];
    
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>字体大小</Text>
          <Text style={styles.settingDescription}>调整应用内文字大小</Text>
        </View>
        <View style={styles.fontSizeOptions}>
          {fontSizes.map((size) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.fontSizeButton,
                config.fontSizeMultiplier === size.value && styles.activeFontSizeButton
              ]}
              onPress={() => updateSetting('fontSizeMultiplier', size.value)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`字体大小${size.label}`}
              accessibilityState={{ selected: config.fontSizeMultiplier === size.value }}
            >
              <Text style={[
                styles.fontSizeButtonText,
                { fontSize: 14 * size.value },
                config.fontSizeMultiplier === size.value && styles.activeFontSizeButtonText
              ]}>
                {size.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderColorBlindnessOptions = () => {
    if (!config) return null;
    
    const options = [
      { value: 'none', label: '无', description: '标准颜色' },
      { value: 'protanopia', label: '红色盲', description: '红色识别困难' },
      { value: 'deuteranopia', label: '绿色盲', description: '绿色识别困难' },
      { value: 'tritanopia', label: '蓝色盲', description: '蓝色识别困难' },
    ];
    
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>色盲支持</Text>
          <Text style={styles.settingDescription}>选择适合的颜色方案</Text>
        </View>
        <View style={styles.colorBlindnessOptions}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.colorBlindnessButton,
                config.colorBlindnessSupport === option.value && styles.activeColorBlindnessButton
              ]}
              onPress={() => updateSetting('colorBlindnessSupport', option.value)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${option.label}，${option.description}`}
              accessibilityState={{ selected: config.colorBlindnessSupport === option.value }}
            >
              <Text style={[
                styles.colorBlindnessButtonText,
                config.colorBlindnessSupport === option.value && styles.activeColorBlindnessButtonText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderAccessibilityScore = () => (
    <View style={styles.scoreContainer}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>无障碍得分</Text>
        <Text style={[
          styles.scoreValue,
          { color: accessibilityScore >= 80 ? '#10b981' : accessibilityScore >= 60 ? '#f59e0b' : '#ef4444' }
        ]}>
          {accessibilityScore}分
        </Text>
      </View>
      <View style={styles.scoreBar}>
        <View 
          style={[
            styles.scoreBarFill,
            { 
              width: `${accessibilityScore}%`,
              backgroundColor: accessibilityScore >= 80 ? '#10b981' : accessibilityScore >= 60 ? '#f59e0b' : '#ef4444'
            }
          ]}
        />
      </View>
      <Text style={styles.scoreDescription}>
        {accessibilityScore >= 80 ? '优秀！您的无障碍设置配置良好。' :
         accessibilityScore >= 60 ? '良好，建议启用更多无障碍功能。' :
         '建议启用更多无障碍功能以改善使用体验。'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载无障碍设置...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!config) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>无法加载无障碍设置</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAccessibilitySettings}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
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
        <Text style={styles.headerTitle}>无障碍设置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 无障碍得分 */}
        {renderAccessibilityScore()}

        {/* 屏幕阅读器支持 */}
        {renderSectionHeader('屏幕阅读器', '为视觉障碍用户提供语音反馈')}
        {renderSwitchSetting('screenReaderEnabled', '启用屏幕阅读器支持', '提供语音导航和内容朗读', config.screenReaderEnabled)}
        {renderSwitchSetting('announcePageChanges', '页面变化公告', '切换页面时自动朗读页面名称', config.announcePageChanges)}
        {renderSwitchSetting('announceButtonActions', '按钮操作公告', '点击按钮时朗读操作结果', config.announceButtonActions)}
        {renderSwitchSetting('announceProgressUpdates', '进度更新公告', '学习进度变化时自动朗读', config.announceProgressUpdates)}

        {/* 视觉辅助 */}
        {renderSectionHeader('视觉辅助', '改善视觉体验和可读性')}
        {renderSwitchSetting('highContrastMode', '高对比度模式', '使用高对比度颜色方案', config.highContrastMode)}
        {renderFontSizeSlider()}
        {renderColorBlindnessOptions()}

        {/* 运动和交互 */}
        {renderSectionHeader('运动和交互', '优化动画和触摸体验')}
        {renderSwitchSetting('reduceMotion', '减少动画', '减少或禁用动画效果', config.reduceMotion)}
        {renderSwitchSetting('disableAutoplay', '禁用自动播放', '禁用视频和音频自动播放', config.disableAutoplay)}
        {renderSwitchSetting('extendedTouchTargets', '扩展触摸目标', '增大按钮和链接的触摸区域', config.extendedTouchTargets)}

        {/* 认知辅助 */}
        {renderSectionHeader('认知辅助', '简化界面和操作流程')}
        {renderSwitchSetting('simplifiedInterface', '简化界面', '使用更简洁的界面布局', config.simplifiedInterface)}
        {renderSwitchSetting('focusIndicators', '焦点指示器', '显示键盘导航的焦点位置', config.focusIndicators)}
        {renderSwitchSetting('timeoutExtensions', '超时延长', '延长操作超时时间', config.timeoutExtensions)}

        {/* 听力辅助 */}
        {renderSectionHeader('听力辅助', '为听力障碍用户提供视觉替代')}
        {renderSwitchSetting('visualCaptions', '视觉字幕', '为音频内容提供文字说明', config.visualCaptions)}
        {renderSwitchSetting('hapticFeedback', '触觉反馈', '使用震动提供操作反馈', config.hapticFeedback)}
        {renderSwitchSetting('visualIndicators', '视觉指示器', '使用视觉效果替代音频提示', config.visualIndicators)}

        {/* 语音控制 */}
        {renderSectionHeader('语音控制', '使用语音进行导航和控制')}
        {renderSwitchSetting('voiceNavigationEnabled', '语音导航', '启用语音导航功能', config.voiceNavigationEnabled)}
        {renderSwitchSetting('voiceCommandsEnabled', '语音命令', '启用语音命令控制', config.voiceCommandsEnabled)}

        {/* 底部说明 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 这些设置将帮助您获得更好的学习体验。SmarTalk致力于为所有用户提供无障碍的英语学习环境。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scoreContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  sectionHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingContent: {
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
    lineHeight: 20,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeFontSizeButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  fontSizeButtonText: {
    fontWeight: '600',
    color: '#64748b',
  },
  activeFontSizeButtonText: {
    color: '#3b82f6',
  },
  colorBlindnessOptions: {
    gap: 8,
  },
  colorBlindnessButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColorBlindnessButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  colorBlindnessButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeColorBlindnessButtonText: {
    color: '#3b82f6',
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

export default AccessibilitySettingsScreen;
