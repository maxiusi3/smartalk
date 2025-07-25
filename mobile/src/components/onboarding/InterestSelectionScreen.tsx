import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { InterestSelectionScreenProps, InterestType } from '@/types/onboarding.types';
import { ONBOARDING_TEXTS, ONBOARDING_STYLES } from '@/constants/onboarding';
import InterestCard from './InterestCard';

/**
 * InterestSelectionScreen组件
 * 用户兴趣选择界面
 */
const InterestSelectionScreen: React.FC<InterestSelectionScreenProps> = ({
  onComplete,
  onSkip,
  interests,
  allowMultipleSelection = true,
  minSelections = 1,
  maxSelections = 3,
}) => {
  const [selectedInterests, setSelectedInterests] = useState<InterestType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 处理兴趣选择
   */
  const handleInterestSelect = (interestId: InterestType) => {
    if (allowMultipleSelection) {
      setSelectedInterests(prev => {
        if (prev.includes(interestId)) {
          // 取消选择
          return prev.filter(id => id !== interestId);
        } else {
          // 添加选择
          if (prev.length >= maxSelections) {
            Alert.alert(
              '选择提示',
              `最多只能选择${maxSelections}个主题`,
              [{ text: '确定' }]
            );
            return prev;
          }
          return [...prev, interestId];
        }
      });
    } else {
      // 单选模式
      setSelectedInterests([interestId]);
    }
  };

  /**
   * 处理继续按钮点击
   */
  const handleContinue = async () => {
    if (selectedInterests.length < minSelections) {
      Alert.alert(
        '选择提示',
        `请至少选择${minSelections}个感兴趣的主题`,
        [{ text: '确定' }]
      );
      return;
    }

    setIsLoading(true);
    try {
      await onComplete(selectedInterests);
    } catch (error) {
      console.error('Interest selection error:', error);
      Alert.alert(
        '错误',
        '保存兴趣选择时出现错误，请重试',
        [{ text: '确定' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 处理跳过按钮点击
   */
  const handleSkip = () => {
    Alert.alert(
      '跳过确认',
      '跳过兴趣选择将使用默认推荐内容，您可以稍后在设置中修改',
      [
        { text: '取消', style: 'cancel' },
        { text: '确认跳过', onPress: onSkip },
      ]
    );
  };

  const canContinue = selectedInterests.length >= minSelections;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={ONBOARDING_STYLES.colors.background} />

      {/* 头部区域 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{ONBOARDING_TEXTS.interestSelection.skip}</Text>
        </TouchableOpacity>
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 标题区域 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{ONBOARDING_TEXTS.interestSelection.title}</Text>
          <Text style={styles.subtitle}>{ONBOARDING_TEXTS.interestSelection.subtitle}</Text>
          
          {/* 选择提示 */}
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {selectedInterests.length === 0 
                ? ONBOARDING_TEXTS.interestSelection.selectHint
                : `已选择 ${selectedInterests.length}/${maxSelections} 个主题`
              }
            </Text>
          </View>
        </View>

        {/* 兴趣卡片列表 */}
        <View style={styles.cardsContainer}>
          {interests.map((interest) => (
            <InterestCard
              key={interest.id}
              interest={interest}
              isSelected={selectedInterests.includes(interest.id)}
              onSelect={handleInterestSelect}
              disabled={isLoading}
            />
          ))}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !canContinue && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!canContinue || isLoading}
        >
          <LinearGradient
            colors={
              canContinue 
                ? ['#667eea', '#764ba2'] 
                : [ONBOARDING_STYLES.colors.border, ONBOARDING_STYLES.colors.border]
            }
            style={styles.continueButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[
              styles.continueButtonText,
              !canContinue && styles.continueButtonTextDisabled,
            ]}>
              {isLoading ? ONBOARDING_TEXTS.common.loading : ONBOARDING_TEXTS.interestSelection.continue}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ONBOARDING_STYLES.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
    paddingTop: 50,
    paddingBottom: ONBOARDING_STYLES.spacing.md,
  },
  skipButton: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.md,
    paddingVertical: ONBOARDING_STYLES.spacing.sm,
  },
  skipText: {
    color: ONBOARDING_STYLES.colors.textSecondary,
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.caption.fontWeight,
  },
  content: {
    flex: 1,
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.xl,
  },
  title: {
    fontSize: ONBOARDING_STYLES.fonts.title.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.title.fontWeight,
    color: ONBOARDING_STYLES.colors.text,
    textAlign: 'center',
    marginBottom: ONBOARDING_STYLES.spacing.md,
    lineHeight: ONBOARDING_STYLES.fonts.title.lineHeight,
  },
  subtitle: {
    fontSize: ONBOARDING_STYLES.fonts.body.fontSize,
    color: ONBOARDING_STYLES.colors.textSecondary,
    textAlign: 'center',
    lineHeight: ONBOARDING_STYLES.fonts.body.lineHeight,
    marginBottom: ONBOARDING_STYLES.spacing.lg,
  },
  hintContainer: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.md,
    paddingVertical: ONBOARDING_STYLES.spacing.sm,
    backgroundColor: ONBOARDING_STYLES.colors.primary + '10',
    borderRadius: ONBOARDING_STYLES.borderRadius.md,
  },
  hintText: {
    fontSize: ONBOARDING_STYLES.fonts.caption.fontSize,
    color: ONBOARDING_STYLES.colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardsContainer: {
    gap: ONBOARDING_STYLES.spacing.md,
  },
  bottomSpacing: {
    height: 100,
  },
  bottomContainer: {
    paddingHorizontal: ONBOARDING_STYLES.spacing.lg,
    paddingBottom: 50,
    paddingTop: ONBOARDING_STYLES.spacing.lg,
    backgroundColor: ONBOARDING_STYLES.colors.background,
    borderTopWidth: 1,
    borderTopColor: ONBOARDING_STYLES.colors.border,
  },
  continueButton: {
    borderRadius: ONBOARDING_STYLES.borderRadius.lg,
    ...ONBOARDING_STYLES.shadows.small,
  },
  continueButtonDisabled: {
    ...ONBOARDING_STYLES.shadows.small,
  },
  continueButtonGradient: {
    paddingVertical: ONBOARDING_STYLES.spacing.md + 2,
    borderRadius: ONBOARDING_STYLES.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: ONBOARDING_STYLES.colors.textLight,
    fontSize: ONBOARDING_STYLES.fonts.button.fontSize,
    fontWeight: ONBOARDING_STYLES.fonts.button.fontWeight,
  },
  continueButtonTextDisabled: {
    color: ONBOARDING_STYLES.colors.textSecondary,
  },
});

export default InterestSelectionScreen;
