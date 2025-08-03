import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface ProgressVisualizationProps {
  current: number;
  total: number;
  aquaPoints: number;
  showAnimation?: boolean;
}

/**
 * ProgressVisualization组件 - V2增强版
 * 显示"声音钥匙"进度和Aqua积分
 */
const ProgressVisualizationV2: React.FC<ProgressVisualizationProps> = ({
  current,
  total,
  aquaPoints,
  showAnimation = true,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pointsAnim = useRef(new Animated.Value(1)).current;

  const progress = total > 0 ? current / total : 0;

  useEffect(() => {
    if (showAnimation) {
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(progress);
    }
  }, [progress, showAnimation]);

  useEffect(() => {
    if (aquaPoints > 0 && showAnimation) {
      // Aqua积分增加时的动画
      Animated.sequence([
        Animated.timing(pointsAnim, {
          toValue: 1.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pointsAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [aquaPoints, showAnimation]);

  const renderSoundKeysProgress = () => (
    <View style={styles.keysContainer}>
      <Text style={styles.keysTitle}>🔑 声音钥匙</Text>
      <View style={styles.progressBar}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {current} / {total}
      </Text>
    </View>
  );

  const renderAquaPoints = () => (
    <Animated.View 
      style={[
        styles.pointsContainer,
        { transform: [{ scale: pointsAnim }] }
      ]}
    >
      <Text style={styles.pointsIcon}>💧</Text>
      <Text style={styles.pointsValue}>{aquaPoints}</Text>
      <Text style={styles.pointsLabel}>Aqua</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {renderSoundKeysProgress()}
      {renderAquaPoints()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  keysContainer: {
    flex: 1,
    marginRight: 16,
  },
  keysTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  pointsContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pointsIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  pointsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
});

export default ProgressVisualizationV2;
