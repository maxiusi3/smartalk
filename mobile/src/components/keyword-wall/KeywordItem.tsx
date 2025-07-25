import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { KeywordItemProps } from '@/types/keyword-wall.types';
import { KEYWORD_WALL_THEME, KEYWORD_WALL_ANIMATIONS } from '@/constants/keyword-wall';

const { width: screenWidth } = Dimensions.get('window');

/**
 * KeywordItem组件
 * 单个关键词的显示组件，支持locked/unlocked状态和动画
 */
const KeywordItem: React.FC<KeywordItemProps> = ({
  keyword,
  isRecentlyUnlocked = false,
  onPress,
  onLongPress,
  animationDelay = 0,
  size = 'medium',
  disabled = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // 组件挂载动画
  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.delay(animationDelay),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: KEYWORD_WALL_ANIMATIONS.entrance.duration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]);

    entranceAnimation.start();
  }, [animationDelay, opacityAnim, scaleAnim]);

  // 解锁状态变化动画
  useEffect(() => {
    if (keyword.isUnlocked) {
      // 解锁动画
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // 发光效果
      if (isRecentlyUnlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ).start();
      }
    }
  }, [keyword.isUnlocked, isRecentlyUnlocked, scaleAnim, glowAnim]);

  /**
   * 处理按压开始
   */
  const handlePressIn = () => {
    if (!disabled && keyword.isUnlocked) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  /**
   * 处理按压结束
   */
  const handlePressOut = () => {
    if (!disabled && keyword.isUnlocked) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  /**
   * 处理点击
   */
  const handlePress = () => {
    if (!disabled && keyword.isUnlocked && onPress) {
      onPress(keyword);
    }
  };

  /**
   * 处理长按
   */
  const handleLongPress = () => {
    if (!disabled && keyword.isUnlocked && onLongPress) {
      onLongPress(keyword);
    }
  };

  // 计算尺寸
  const getItemSize = () => {
    const baseSize = screenWidth / 4 - 20;
    switch (size) {
      case 'small':
        return baseSize * 0.8;
      case 'large':
        return baseSize * 1.2;
      default:
        return baseSize;
    }
  };

  const itemSize = getItemSize();

  // 获取主题颜色
  const getThemeColors = () => {
    if (keyword.isUnlocked) {
      if (isRecentlyUnlocked) {
        return {
          background: KEYWORD_WALL_THEME.colors.recentlyUnlocked,
          text: '#FFFFFF',
          border: KEYWORD_WALL_THEME.colors.recentlyUnlocked,
        };
      }
      return {
        background: KEYWORD_WALL_THEME.colors.unlocked,
        text: '#FFFFFF',
        border: KEYWORD_WALL_THEME.colors.unlocked,
      };
    }
    return {
      background: KEYWORD_WALL_THEME.colors.locked,
      text: '#999999',
      border: KEYWORD_WALL_THEME.colors.locked,
    };
  };

  const themeColors = getThemeColors();

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !keyword.isUnlocked}
      activeOpacity={keyword.isUnlocked ? 0.8 : 1}
      style={[styles.container, { width: itemSize, height: itemSize }]}
    >
      <Animated.View
        style={[
          styles.itemContainer,
          {
            width: itemSize,
            height: itemSize,
            opacity: opacityAnim,
            transform: [
              { scale: scaleAnim },
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          },
        ]}
      >
        {/* 背景渐变 */}
        <LinearGradient
          colors={
            keyword.isUnlocked
              ? [themeColors.background, `${themeColors.background}CC`]
              : [themeColors.background, themeColors.background]
          }
          style={[
            styles.gradient,
            {
              borderRadius: KEYWORD_WALL_THEME.borderRadius.item,
            },
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />

        {/* 发光效果 */}
        {isRecentlyUnlocked && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim,
                borderRadius: KEYWORD_WALL_THEME.borderRadius.item,
              },
            ]}
          />
        )}

        {/* 内容区域 */}
        <View style={styles.content}>
          {/* 图标 */}
          <Text style={[styles.icon, { opacity: keyword.isUnlocked ? 1 : 0.3 }]}>
            {keyword.isUnlocked ? keyword.icon : '🔒'}
          </Text>

          {/* 词汇文本 */}
          <Text
            style={[
              styles.word,
              KEYWORD_WALL_THEME.fonts.keyword,
              { color: themeColors.text },
            ]}
            numberOfLines={1}
          >
            {keyword.isUnlocked ? keyword.word : '???'}
          </Text>

          {/* 翻译文本 */}
          <Text
            style={[
              styles.translation,
              { color: themeColors.text, opacity: 0.8 },
            ]}
            numberOfLines={1}
          >
            {keyword.isUnlocked ? keyword.translation : '???'}
          </Text>
        </View>

        {/* 解锁指示器 */}
        {keyword.isUnlocked && (
          <View style={styles.unlockedIndicator}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}

        {/* 阴影效果 */}
        <View
          style={[
            styles.shadow,
            keyword.isUnlocked
              ? KEYWORD_WALL_THEME.shadows.unlocked
              : KEYWORD_WALL_THEME.shadows.locked,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  itemContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  word: {
    textAlign: 'center',
    marginBottom: 2,
  },
  translation: {
    fontSize: 10,
    textAlign: 'center',
  },
  unlockedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: KEYWORD_WALL_THEME.borderRadius.item,
  },
});

export default KeywordItem;
