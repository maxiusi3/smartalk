import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { KeywordHighlightProps } from '@/types/video.types';
import { KeywordMatcher } from '@/utils/keywordMatcher';

/**
 * 关键词高亮组件
 * 在文本中高亮显示关键词并支持点击交互
 */
const KeywordHighlight: React.FC<KeywordHighlightProps> = ({
  text,
  keywords,
  onKeywordClick,
  highlightStyle
}) => {
  // 将文本分割为普通文本和关键词片段
  const segments = KeywordMatcher.segmentTextWithKeywords(text, keywords);

  return (
    <Text style={styles.baseText}>
      {segments.map((segment, index) => {
        if (segment.isKeyword && segment.keyword) {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => onKeywordClick(segment.keyword!)}
              activeOpacity={0.7}
            >
              <Text style={[styles.keywordText, highlightStyle]}>
                {segment.text}
              </Text>
            </TouchableOpacity>
          );
        } else {
          return (
            <Text key={index} style={styles.normalText}>
              {segment.text}
            </Text>
          );
        }
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  baseText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  normalText: {
    color: '#ffffff',
  },
  keywordText: {
    color: '#007AFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default KeywordHighlight;
