import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface VideoClip {
  id: string;
  videoUrl: string;
  startTime: number;
  endTime: number;
  isCorrect: boolean;
  sortOrder: number;
}

interface VideoOptionSelectorProps {
  videoClips: VideoClip[];
  selectedOption: string | null;
  onOptionSelect: (clipId: string) => void;
  focusModeActive?: boolean; // 现在是可选的，因为Focus Mode由内部管理
  disabled: boolean;
}

/**
 * VideoOptionSelector组件 - V2增强版
 * 显示2-4个视频片段选项，支持Focus Mode高亮
 */
const VideoOptionSelectorV2: React.FC<VideoOptionSelectorProps> = ({
  videoClips,
  selectedOption,
  onOptionSelect,
  focusModeActive = false,
  disabled,
}) => {
  // V2: 内部Focus Mode状态管理
  const [internalFocusMode, setInternalFocusMode] = useState(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  const [lastSelectedWasCorrect, setLastSelectedWasCorrect] = useState<boolean | null>(null);

  const animationRefs = useRef<{ [key: string]: Animated.Value }>({});
  const glowAnimationRefs = useRef<{ [key: string]: Animated.Value }>({});

  // 实际的Focus Mode状态（内部或外部）
  const effectiveFocusMode = internalFocusMode || focusModeActive;

  // 为每个选项初始化动画值
  useEffect(() => {
    videoClips.forEach(clip => {
      if (!animationRefs.current[clip.id]) {
        animationRefs.current[clip.id] = new Animated.Value(1);
      }
      if (!glowAnimationRefs.current[clip.id]) {
        glowAnimationRefs.current[clip.id] = new Animated.Value(0);
      }
    });
  }, [videoClips]);

  // V2: Focus Mode触发逻辑
  useEffect(() => {
    if (lastSelectedWasCorrect === false) {
      setConsecutiveErrors(prev => {
        const newCount = prev + 1;

        // 2次连续错误触发Focus Mode
        if (newCount >= 2 && !internalFocusMode) {
          setInternalFocusMode(true);

          // 显示Focus Mode提示
          setTimeout(() => {
            alert('🎯 专注模式\n别担心！学习就是这样的过程。正确答案会有特殊提示。');
          }, 500);
        }

        return newCount;
      });
    } else if (lastSelectedWasCorrect === true) {
      // 正确选择后重置错误计数
      setConsecutiveErrors(0);
    }
  }, [lastSelectedWasCorrect, internalFocusMode]);

  // Focus Mode时高亮正确答案
  useEffect(() => {
    if (effectiveFocusMode) {
      const correctClip = videoClips.find(clip => clip.isCorrect);
      if (correctClip) {
        // 开始发光动画
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnimationRefs.current[correctClip.id], {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnimationRefs.current[correctClip.id], {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } else {
      // 停止所有发光动画
      Object.values(glowAnimationRefs.current).forEach(anim => {
        anim.stopAnimation();
        anim.setValue(0);
      });
    }
  }, [effectiveFocusMode, videoClips]);

  const handleOptionPress = (clip: VideoClip) => {
    if (disabled) return;

    // V2: 跟踪选择结果用于Focus Mode触发
    setLastSelectedWasCorrect(clip.isCorrect);

    // 选择动画
    Animated.sequence([
      Animated.timing(animationRefs.current[clip.id], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(animationRefs.current[clip.id], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onOptionSelect(clip.id);
  };

  const playErrorAnimation = (clipId: string) => {
    // 错误摇晃动画
    const shakeAnimation = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    return shakeAnimation;
  };

  const renderVideoOption = (clip: VideoClip, index: number) => {
    const isSelected = selectedOption === clip.id;
    const isCorrect = clip.isCorrect;
    const shouldGlow = effectiveFocusMode && isCorrect;

    return (
      <Animated.View
        key={clip.id}
        style={[
          styles.optionContainer,
          {
            transform: [
              { scale: animationRefs.current[clip.id] || new Animated.Value(1) },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.videoOption,
            isSelected && styles.selectedOption,
            shouldGlow && styles.glowOption,
          ]}
          onPress={() => handleOptionPress(clip)}
          disabled={disabled}
          activeOpacity={0.8}
        >
          {/* 视频预览区域 */}
          <View style={styles.videoPreview}>
            <Text style={styles.videoPlaceholder}>📹</Text>
            <Text style={styles.videoDuration}>
              {Math.round(clip.endTime - clip.startTime)}s
            </Text>
          </View>

          {/* 选项标签 */}
          <View style={styles.optionLabel}>
            <Text style={styles.optionText}>选项 {String.fromCharCode(65 + index)}</Text>
          </View>

          {/* Focus Mode 高亮指示器 */}
          {shouldGlow && (
            <Animated.View
              style={[
                styles.glowIndicator,
                {
                  opacity: glowAnimationRefs.current[clip.id] || new Animated.Value(0),
                },
              ]}
            >
              <Text style={styles.glowText}>✨</Text>
            </Animated.View>
          )}

          {/* 选中状态指示器 */}
          {isSelected && (
            <View style={styles.selectedIndicator}>
              <Text style={styles.selectedText}>✓</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getGridLayout = () => {
    const numOptions = videoClips.length;
    if (numOptions <= 2) {
      return { numColumns: 2, optionWidth: '45%' };
    } else {
      return { numColumns: 2, optionWidth: '45%' };
    }
  };

  const { numColumns, optionWidth } = getGridLayout();

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        选择最匹配的画面
      </Text>
      
      <View style={[styles.optionsGrid, { flexDirection: numColumns === 2 ? 'row' : 'column' }]}>
        {videoClips
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((clip, index) => (
            <View key={clip.id} style={{ width: optionWidth, marginBottom: 16 }}>
              {renderVideoOption(clip, index)}
            </View>
          ))}
      </View>

      {effectiveFocusMode && (
        <View style={styles.focusModeHint}>
          <Text style={styles.focusModeHintText}>
            💡 专注模式：正确答案已高亮显示
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsGrid: {
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  optionContainer: {
    marginBottom: 16,
  },
  videoOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#667eea',
    backgroundColor: '#f8faff',
  },
  glowOption: {
    borderColor: '#fbbf24',
    backgroundColor: '#fffbeb',
    shadowColor: '#fbbf24',
    shadowOpacity: 0.3,
  },
  videoPreview: {
    height: 80,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  videoPlaceholder: {
    fontSize: 32,
    marginBottom: 4,
  },
  videoDuration: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  optionLabel: {
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  glowIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  glowText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#667eea',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  focusModeHint: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  focusModeHintText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default VideoOptionSelectorV2;
