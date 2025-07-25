import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { VideoOptionSelectorProps } from '@/types/vtpr.types';
import { VTPR_THEME, VTPR_TEXTS } from '@/constants/vtpr';
import VideoOption from './VideoOption';

const { width: screenWidth } = Dimensions.get('window');

/**
 * VideoOptionSelector组件
 * 视频选项选择器，支持2-4个视频片段的网格显示
 */
const VideoOptionSelector: React.FC<VideoOptionSelectorProps> = ({
  options,
  selectedOption,
  onSelect,
  showResult = false,
  disabled = false,
  layout = 'grid',
  columns = 2,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟加载延迟
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [options]);

  /**
   * 处理选项选择
   */
  const handleOptionSelect = (optionId: string) => {
    if (!disabled && !showResult) {
      onSelect(optionId);
    }
  };

  /**
   * 获取网格样式
   */
  const getGridStyle = () => {
    const spacing = VTPR_THEME.spacing.medium;
    const containerPadding = VTPR_THEME.spacing.large * 2;
    const availableWidth = screenWidth - containerPadding;
    const itemWidth = (availableWidth - spacing * (columns - 1)) / columns;

    return {
      itemWidth,
      spacing,
    };
  };

  const gridStyle = getGridStyle();

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>{VTPR_TEXTS.videoSelector.loading}</Text>
      <View style={styles.loadingGrid}>
        {Array.from({ length: 4 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.loadingItem,
              {
                width: gridStyle.itemWidth,
                height: gridStyle.itemWidth * 0.75,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );

  /**
   * 渲染错误状态
   */
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{VTPR_TEXTS.videoSelector.error}</Text>
    </View>
  );

  /**
   * 渲染网格布局
   */
  const renderGridLayout = () => {
    const rows = Math.ceil(options.length / columns);
    
    return (
      <View style={styles.gridContainer}>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {Array.from({ length: columns }, (_, colIndex) => {
              const optionIndex = rowIndex * columns + colIndex;
              const option = options[optionIndex];
              
              if (!option) return <View key={colIndex} style={{ width: gridStyle.itemWidth }} />;
              
              return (
                <VideoOption
                  key={option.id}
                  option={option}
                  isSelected={selectedOption === option.id}
                  isCorrect={option.isCorrect}
                  showResult={showResult}
                  onSelect={handleOptionSelect}
                  disabled={disabled}
                  size="medium"
                />
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  /**
   * 渲染列表布局
   */
  const renderListLayout = () => (
    <ScrollView
      style={styles.listContainer}
      showsVerticalScrollIndicator={false}
    >
      {options.map((option) => (
        <VideoOption
          key={option.id}
          option={option}
          isSelected={selectedOption === option.id}
          isCorrect={option.isCorrect}
          showResult={showResult}
          onSelect={handleOptionSelect}
          disabled={disabled}
          size="large"
        />
      ))}
    </ScrollView>
  );

  // 如果没有选项，显示错误
  if (!options || options.length === 0) {
    return renderError();
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return renderLoading();
  }

  return (
    <View style={styles.container}>
      {/* 指导文字 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          {VTPR_TEXTS.videoSelector.instruction}
        </Text>
      </View>

      {/* 选项显示区域 */}
      <View style={styles.optionsContainer}>
        {layout === 'grid' ? renderGridLayout() : renderListLayout()}
      </View>

      {/* 选择状态指示 */}
      {selectedOption && !showResult && (
        <View style={styles.selectionIndicator}>
          <Text style={styles.selectionText}>
            已选择选项
          </Text>
        </View>
      )}

      {/* 结果反馈 */}
      {showResult && selectedOption && (
        <View style={styles.resultContainer}>
          <Text
            style={[
              styles.resultText,
              {
                color: options.find(opt => opt.id === selectedOption)?.isCorrect
                  ? VTPR_THEME.colors.correct
                  : VTPR_THEME.colors.incorrect,
              },
            ]}
          >
            {options.find(opt => opt.id === selectedOption)?.isCorrect
              ? '正确答案！'
              : '再试一次'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructionContainer: {
    paddingHorizontal: VTPR_THEME.spacing.large,
    paddingVertical: VTPR_THEME.spacing.medium,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: VTPR_THEME.fonts.option.fontSize + 2,
    color: VTPR_THEME.colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionsContainer: {
    flex: 1,
    paddingHorizontal: VTPR_THEME.spacing.large,
  },
  gridContainer: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: VTPR_THEME.spacing.medium,
  },
  listContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: VTPR_THEME.spacing.large,
  },
  loadingText: {
    fontSize: VTPR_THEME.fonts.option.fontSize,
    color: VTPR_THEME.colors.text,
    marginBottom: VTPR_THEME.spacing.large,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  loadingItem: {
    backgroundColor: VTPR_THEME.colors.neutral + '30',
    borderRadius: VTPR_THEME.borderRadius.medium,
    marginBottom: VTPR_THEME.spacing.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: VTPR_THEME.spacing.large,
  },
  errorText: {
    fontSize: VTPR_THEME.fonts.option.fontSize,
    color: VTPR_THEME.colors.incorrect,
    textAlign: 'center',
  },
  selectionIndicator: {
    paddingHorizontal: VTPR_THEME.spacing.large,
    paddingVertical: VTPR_THEME.spacing.small,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: VTPR_THEME.fonts.option.fontSize,
    color: VTPR_THEME.colors.primary,
    fontWeight: '500',
  },
  resultContainer: {
    paddingHorizontal: VTPR_THEME.spacing.large,
    paddingVertical: VTPR_THEME.spacing.medium,
    alignItems: 'center',
    backgroundColor: VTPR_THEME.colors.background,
    borderTopWidth: 1,
    borderTopColor: VTPR_THEME.colors.neutral + '30',
  },
  resultText: {
    fontSize: VTPR_THEME.fonts.feedback.fontSize,
    fontWeight: VTPR_THEME.fonts.feedback.fontWeight,
    textAlign: 'center',
  },
});

export default VideoOptionSelector;
