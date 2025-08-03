import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Slider,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSoundAndHaptic } from '@/hooks/useSoundAndHaptic';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AudioSettings, HapticSettings } from '@/services/SoundDesignService';

/**
 * AudioSettingsScreen - V2 音频和触觉设置界面
 * 提供完整的音效和触觉设置：音量控制、分类开关、高级选项
 */
const AudioSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const {
    audioSettings,
    hapticSettings,
    loading,
    soundEnabled,
    musicEnabled,
    hapticEnabled,
    updateAudioSettings,
    updateHapticSettings,
    playSound,
    triggerHaptic,
    toggleMute,
    isMuted,
  } = useSoundAndHaptic();

  const [localAudioSettings, setLocalAudioSettings] = useState<AudioSettings | null>(null);
  const [localHapticSettings, setLocalHapticSettings] = useState<HapticSettings | null>(null);

  useEffect(() => {
    if (audioSettings) {
      setLocalAudioSettings({ ...audioSettings });
    }
    if (hapticSettings) {
      setLocalHapticSettings({ ...hapticSettings });
    }
  }, [audioSettings, hapticSettings]);

  useEffect(() => {
    screenReader.announcePageChange('音频设置', '调整声音和触觉反馈设置');
  }, []);

  const handleAudioSettingChange = async (key: keyof AudioSettings, value: any) => {
    if (!localAudioSettings) return;

    const updatedSettings = { ...localAudioSettings, [key]: value };
    setLocalAudioSettings(updatedSettings);
    
    await updateAudioSettings({ [key]: value });
    
    // 播放测试音效
    if (key === 'soundEffectsEnabled' && value) {
      await playSound('button_tap');
    }
  };

  const handleHapticSettingChange = async (key: keyof HapticSettings, value: any) => {
    if (!localHapticSettings) return;

    const updatedSettings = { ...localHapticSettings, [key]: value };
    setLocalHapticSettings(updatedSettings);
    
    await updateHapticSettings({ [key]: value });
    
    // 触发测试触觉反馈
    if (key === 'enabled' && value) {
      await triggerHaptic('light');
    }
  };

  const handleQuietHoursChange = async (key: string, value: any) => {
    if (!localAudioSettings || !localHapticSettings) return;

    const audioQuietHours = { ...localAudioSettings.quietHours, [key]: value };
    const hapticQuietHours = { ...localHapticSettings.quietHours, [key]: value };

    setLocalAudioSettings(prev => prev ? { ...prev, quietHours: audioQuietHours } : null);
    setLocalHapticSettings(prev => prev ? { ...prev, quietHours: hapticQuietHours } : null);

    await Promise.all([
      updateAudioSettings({ quietHours: audioQuietHours }),
      updateHapticSettings({ quietHours: hapticQuietHours }),
    ]);
  };

  const testAudioEffect = async (type: 'sound' | 'music' | 'haptic') => {
    switch (type) {
      case 'sound':
        await playSound('bingo');
        break;
      case 'music':
        // 播放短暂的背景音乐测试
        break;
      case 'haptic':
        await triggerHaptic('success');
        break;
    }
  };

  const renderSettingRow = (
    title: string,
    subtitle: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    testAction?: () => void
  ) => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel={`${title}设置`}
      applyHighContrast={true}
    >
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.settingControls}>
          {testAction && (
            <TouchableOpacity
              style={styles.testButton}
              onPress={testAction}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`测试${title}`}
            >
              <Text style={styles.testButtonText}>测试</Text>
            </TouchableOpacity>
          )}
          
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
            thumbColor={value ? '#FFFFFF' : '#94a3b8'}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel={`${title}开关`}
            accessibilityState={{ checked: value }}
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderSliderRow = (
    title: string,
    subtitle: string,
    value: number,
    onValueChange: (value: number) => void,
    minimumValue: number = 0,
    maximumValue: number = 1
  ) => (
    <AccessibilityWrapper
      accessibilityRole="adjustable"
      accessibilityLabel={`${title}：${Math.round(value * 100)}%`}
      applyHighContrast={true}
    >
      <View style={styles.sliderRow}>
        <View style={styles.sliderInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
          <Slider
            style={styles.slider}
            value={value}
            onValueChange={onValueChange}
            minimumValue={minimumValue}
            maximumValue={maximumValue}
            minimumTrackTintColor="#3b82f6"
            maximumTrackTintColor="#e2e8f0"
            thumbStyle={{ backgroundColor: '#3b82f6' }}
            accessible={true}
            accessibilityRole="adjustable"
            accessibilityLabel={title}
            accessibilityValue={{ min: minimumValue, max: maximumValue, now: value }}
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderTimePickerRow = (
    title: string,
    hour: number,
    onHourChange: (hour: number) => void
  ) => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel={`${title}时间设置`}
      applyHighContrast={true}
    >
      <View style={styles.timePickerRow}>
        <Text style={styles.settingTitle}>{title}</Text>
        <View style={styles.timePicker}>
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => onHourChange(Math.max(0, hour - 1))}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="减少小时"
          >
            <Text style={styles.timeButtonText}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.timeValue}>{hour.toString().padStart(2, '0')}:00</Text>
          
          <TouchableOpacity
            style={styles.timeButton}
            onPress={() => onHourChange(Math.min(23, hour + 1))}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="增加小时"
          >
            <Text style={styles.timeButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  if (loading || !localAudioSettings || !localHapticSettings) {
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
        accessibilityLabel="音频设置页面头部"
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
          
          <Text style={styles.headerTitle}>音频设置</Text>
          
          <TouchableOpacity
            style={styles.muteButton}
            onPress={toggleMute}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? '取消静音' : '静音'}
          >
            <Text style={styles.muteButtonText}>
              {isMuted ? '🔇' : '🔊'}
            </Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 音效设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="音效设置"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>音效设置</Text>
            
            {renderSettingRow(
              '音效开关',
              '控制所有音效的播放',
              localAudioSettings.soundEffectsEnabled,
              (value) => handleAudioSettingChange('soundEffectsEnabled', value),
              () => testAudioEffect('sound')
            )}
            
            {localAudioSettings.soundEffectsEnabled && (
              <>
                {renderSliderRow(
                  '音效音量',
                  '调整音效的音量大小',
                  localAudioSettings.soundEffectsVolume,
                  (value) => handleAudioSettingChange('soundEffectsVolume', value)
                )}
                
                {renderSettingRow(
                  '反馈音效',
                  '正确/错误答案的音效反馈',
                  localAudioSettings.feedbackSoundsEnabled,
                  (value) => handleAudioSettingChange('feedbackSoundsEnabled', value)
                )}
                
                {renderSettingRow(
                  '成就音效',
                  '徽章解锁和成就达成音效',
                  localAudioSettings.achievementSoundsEnabled,
                  (value) => handleAudioSettingChange('achievementSoundsEnabled', value)
                )}
                
                {renderSettingRow(
                  'UI音效',
                  '按钮点击和界面交互音效',
                  localAudioSettings.uiSoundsEnabled,
                  (value) => handleAudioSettingChange('uiSoundsEnabled', value)
                )}
              </>
            )}
          </View>
        </AccessibilityWrapper>

        {/* 背景音乐设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="背景音乐设置"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>背景音乐</Text>
            
            {renderSettingRow(
              '背景音乐',
              '学习时播放主题背景音乐',
              localAudioSettings.backgroundMusicEnabled,
              (value) => handleAudioSettingChange('backgroundMusicEnabled', value),
              () => testAudioEffect('music')
            )}
            
            {localAudioSettings.backgroundMusicEnabled && (
              <>
                {renderSliderRow(
                  '音乐音量',
                  '调整背景音乐的音量大小',
                  localAudioSettings.backgroundMusicVolume,
                  (value) => handleAudioSettingChange('backgroundMusicVolume', value)
                )}
                
                {renderSettingRow(
                  '自适应音乐',
                  '根据学习状态自动切换音乐',
                  localAudioSettings.adaptiveMusic,
                  (value) => handleAudioSettingChange('adaptiveMusic', value)
                )}
                
                {renderSettingRow(
                  '音乐淡入淡出',
                  '音乐切换时的淡入淡出效果',
                  localAudioSettings.musicFadeEnabled,
                  (value) => handleAudioSettingChange('musicFadeEnabled', value)
                )}
              </>
            )}
          </View>
        </AccessibilityWrapper>

        {/* 触觉反馈设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="触觉反馈设置"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>触觉反馈</Text>
            
            {renderSettingRow(
              '触觉反馈',
              '振动反馈和触觉提示',
              localHapticSettings.enabled,
              (value) => handleHapticSettingChange('enabled', value),
              () => testAudioEffect('haptic')
            )}
            
            {localHapticSettings.enabled && (
              <>
                {renderSliderRow(
                  '反馈强度',
                  '调整触觉反馈的强度',
                  localHapticSettings.intensity,
                  (value) => handleHapticSettingChange('intensity', value)
                )}
                
                {renderSettingRow(
                  '学习反馈',
                  '正确/错误答案的触觉反馈',
                  localHapticSettings.feedbackEnabled,
                  (value) => handleHapticSettingChange('feedbackEnabled', value)
                )}
                
                {renderSettingRow(
                  '成就反馈',
                  '徽章解锁和成就达成反馈',
                  localHapticSettings.achievementEnabled,
                  (value) => handleHapticSettingChange('achievementEnabled', value)
                )}
                
                {renderSettingRow(
                  'UI反馈',
                  '按钮点击和界面交互反馈',
                  localHapticSettings.uiEnabled,
                  (value) => handleHapticSettingChange('uiEnabled', value)
                )}
              </>
            )}
          </View>
        </AccessibilityWrapper>

        {/* 静默时间设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="静默时间设置"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>静默时间</Text>
            
            {renderSettingRow(
              '启用静默时间',
              '在指定时间段降低音量和触觉强度',
              localAudioSettings.quietHours.enabled,
              (value) => handleQuietHoursChange('enabled', value)
            )}
            
            {localAudioSettings.quietHours.enabled && (
              <>
                {renderTimePickerRow(
                  '开始时间',
                  localAudioSettings.quietHours.startHour,
                  (hour) => handleQuietHoursChange('startHour', hour)
                )}
                
                {renderTimePickerRow(
                  '结束时间',
                  localAudioSettings.quietHours.endHour,
                  (hour) => handleQuietHoursChange('endHour', hour)
                )}
                
                {renderSliderRow(
                  '静默音量',
                  '静默时间的音量比例',
                  localAudioSettings.quietHours.quietVolume,
                  (value) => handleQuietHoursChange('quietVolume', value)
                )}
              </>
            )}
          </View>
        </AccessibilityWrapper>

        {/* 高级设置 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="高级设置"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>高级设置</Text>
            
            {renderSliderRow(
              '主音量',
              '控制所有音频的总音量',
              localAudioSettings.masterVolume,
              (value) => handleAudioSettingChange('masterVolume', value)
            )}
            
            {renderSettingRow(
              '预加载音频',
              '提前加载音效以减少延迟',
              localAudioSettings.preloadAudio,
              (value) => handleAudioSettingChange('preloadAudio', value)
            )}
            
            {renderSettingRow(
              '自适应强度',
              '根据使用情况自动调整反馈强度',
              localHapticSettings.adaptiveIntensity,
              (value) => handleHapticSettingChange('adaptiveIntensity', value)
            )}
          </View>
        </AccessibilityWrapper>
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
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButtonText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  settingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sliderRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sliderInfo: {
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    minWidth: 40,
    textAlign: 'right',
  },
  slider: {
    flex: 1,
    height: 40,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    minWidth: 60,
    textAlign: 'center',
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

export default AudioSettingsScreen;
