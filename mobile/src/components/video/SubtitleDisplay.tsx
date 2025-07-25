import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SubtitleDisplayProps } from '@/types/video.types';
import KeywordHighlight from './KeywordHighlight';

/**
 * 字幕显示组件
 * 显示当前字幕并支持关键词高亮
 */
const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({
  subtitle,
  keywords,
  onKeywordClick,
  style
}) => {
  if (!subtitle || !subtitle.text) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.subtitleBackground}>
        <KeywordHighlight
          text={subtitle.text}
          keywords={keywords}
          onKeywordClick={onKeywordClick}
          highlightStyle={styles.keywordHighlight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitleBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    maxWidth: '90%',
  },
  keywordHighlight: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default SubtitleDisplay;
