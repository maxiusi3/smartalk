import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { VideoOptionProps } from '@/types/vtpr.types';
import { VTPR_THEME } from '@/constants/vtpr';

const { width: screenWidth } = Dimensions.get('window');

/**
 * VideoOption组件
 * 单个视频选项，支持缩略图显示、选择状态和反馈动画
 */
const VideoOption: React.FC<VideoOptionProps> = ({
  option,
  isSelected,
  isCorrect,
  showResult,
  onSelect,
  disabled = false,
  size = 'medium',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * 处理选项点击
   */
  const handlePress = () => {
    if (disabled || isLoading) return;

    // 播放点击动画
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onSelect(option.id);
  };

  /**
   * 获取容器样式
   */
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    // 尺寸样式
    if (size === 'small') {
      baseStyle.push(styles.containerSmall);
    } else if (size === 'large') {
      baseStyle.push(styles.containerLarge);
    } else {
      baseStyle.push(styles.containerMedium);
    }

    // 选中状态样式
    if (isSelected && !showResult) {
      baseStyle.push(styles.containerSelected);
    }

    // 结果状态样式
    if (showResult && isSelected) {
      if (isCorrect) {
        baseStyle.push(styles.containerCorrect);
      } else {
        baseStyle.push(styles.containerIncorrect);
      }
    }

    // 禁用状态样式
    if (disabled) {
      baseStyle.push(styles.containerDisabled);
    }

    return baseStyle;
  };

  /**
   * 获取不透明度值
   */
  const getOpacity = () => {
    if (showResult && isSelected && !isCorrect) {
      return 0.5;
    }
    if (showResult && !isSelected) {
      return 0.6;
    }
    return 1;
  };

  /**
   * 渲染视频缩略图
   */
  const renderThumbnail = () => {
    if (option.thumbnailUrl) {
      return (
        <Image
          source={{ uri: option.thumbnailUrl }}
          style={styles.thumbnail}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      );
    }

    // 如果没有缩略图，显示占位符
    return (
      <View style={styles.thumbnailPlaceholder}>
        <Text style={styles.placeholderText}>🎬</Text>
        <Text style={styles.placeholderLabel}>视频片段</Text>
      </View>
    );
  };

  /**
   * 渲染状态指示器
   */
  const renderStatusIndicator = () => {
    if (!showResult || !isSelected) return null;

    return (
      <View style={styles.statusIndicator}>
        <Text style={styles.statusIcon}>
          {isCorrect ? '✅' : '💡'}
        </Text>
      </View>
    );
  };

  /**
   * 渲染加载指示器
   */
  const renderLoadingIndicator = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.loadingOverlay}>
        <Text style={styles.loadingText}>⏳</Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: getOpacity(),
        },
      ]}
    >
      <TouchableOpacity
        style={getContainerStyle()}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
      >
        {/* 视频缩略图 */}
        <View style={styles.thumbnailContainer}>
          {renderThumbnail()}
          {renderLoadingIndicator()}
          {renderStatusIndicator()}
        </View>

        {/* 选项描述 */}
        {option.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText} numberOfLines={2}>
              {option.description}
            </Text>
          </View>
        )}

        {/* 选择边框 */}
        {isSelected && (
          <View style={styles.selectionBorder} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: VTPR_THEME.borderRadius.medium,
    backgroundColor: VTPR_THEME.colors.surface,
    overflow: 'hidden',
    ...VTPR_THEME.shadows.small,
  },
  containerSmall: {
    width: (screenWidth - VTPR_THEME.spacing.large * 3) / 2,
    height: 80,
  },
  containerMedium: {
    width: (screenWidth - VTPR_THEME.spacing.large * 3) / 2,
    height: 120,
  },
  containerLarge: {
    width: screenWidth - VTPR_THEME.spacing.large * 2,
    height: 160,
    marginBottom: VTPR_THEME.spacing.medium,
  },
  containerSelected: {
    borderWidth: 2,
    borderColor: VTPR_THEME.colors.primary,
    ...VTPR_THEME.shadows.medium,
  },
  containerCorrect: {
    borderWidth: 2,
    borderColor: VTPR_THEME.colors.correct,
    backgroundColor: VTPR_THEME.colors.correct + '10',
  },
  containerIncorrect: {
    borderWidth: 2,
    borderColor: VTPR_THEME.colors.neutral,
    backgroundColor: VTPR_THEME.colors.neutral + '10',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  thumbnailContainer: {
    flex: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbnailPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: VTPR_THEME.colors.neutral + '20',
  },
  placeholderText: {
    fontSize: 24,
    marginBottom: 4,
  },
  placeholderLabel: {
    fontSize: 12,
    color: VTPR_THEME.colors.text,
    opacity: 0.7,
  },
  statusIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VTPR_THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...VTPR_THEME.shadows.small,
  },
  statusIcon: {
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 24,
  },
  descriptionContainer: {
    padding: VTPR_THEME.spacing.small,
    backgroundColor: VTPR_THEME.colors.background,
  },
  descriptionText: {
    fontSize: VTPR_THEME.fonts.caption.fontSize,
    color: VTPR_THEME.colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  selectionBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 2,
    borderColor: VTPR_THEME.colors.primary,
    borderRadius: VTPR_THEME.borderRadius.medium + 2,
  },
});

export default VideoOption;