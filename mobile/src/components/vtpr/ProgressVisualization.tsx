import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { VTPR_THEME } from '@/constants/vtpr';

const { width: screenWidth } = Dimensions.get('window');

interface ProgressVisualizationProps {
  totalKeywords: number;
  completedKeywords: number;
  currentKeyword: string;
  showMilestone?: boolean;
  onMilestoneComplete?: () => void;
}

interface ParticleProps {
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
}

const Particle: React.FC<ParticleProps> = ({ x, y, color, size, delay }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          backgroundColor: color,
          opacity: opacityValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -50],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1.2, 0],
              }),
            },
          ],
        },
      ]}
    />
  );
};

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  totalKeywords,
  completedKeywords,
  currentKeyword,
  showMilestone = false,
  onMilestoneComplete,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const milestoneAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = React.useState<ParticleProps[]>([]);

  const progressPercentage = (completedKeywords / totalKeywords) * 100;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progressPercentage / 100,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Glow effect for active progress
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
      ])
    ).start();
  }, [completedKeywords, totalKeywords]);

  useEffect(() => {
    if (showMilestone) {
      // Create celebration particles
      const newParticles: ParticleProps[] = [];
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          x: Math.random() * screenWidth * 0.8,
          y: 100 + Math.random() * 50,
          color: i % 2 === 0 ? VTPR_THEME.colors.primary : VTPR_THEME.colors.secondary,
          size: 6 + Math.random() * 8,
          delay: i * 100,
        });
      }
      setParticles(newParticles);

      // Milestone animation
      Animated.sequence([
        Animated.timing(milestoneAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(milestoneAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onMilestoneComplete?.();
      });
    }
  }, [showMilestone]);

  const renderProgressDots = () => {
    const dots = [];
    for (let i = 0; i < totalKeywords; i++) {
      const isCompleted = i < completedKeywords;
      const isCurrent = i === completedKeywords;
      
      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.progressDot,
            isCompleted && styles.completedDot,
            isCurrent && styles.currentDot,
            isCurrent && {
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          {isCompleted && (
            <Text style={styles.dotCheckmark}>✓</Text>
          )}
          {isCurrent && (
            <Animated.View
              style={[
                styles.currentDotGlow,
                {
                  opacity: glowAnim,
                },
              ]}
            />
          )}
        </Animated.View>
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.header}>
        <Text style={styles.title}>学习进度</Text>
        <Text style={styles.stats}>
          {completedKeywords}/{totalKeywords} 个词汇
        </Text>
      </View>

      {/* Current Keyword Display */}
      <View style={styles.currentKeywordContainer}>
        <Text style={styles.currentKeywordLabel}>当前学习</Text>
        <Text style={styles.currentKeyword}>{currentKeyword}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      {/* Progress Dots */}
      <View style={styles.progressDotsContainer}>
        {renderProgressDots()}
      </View>

      {/* Milestone Celebration */}
      {showMilestone && (
        <Animated.View
          style={[
            styles.milestoneContainer,
            {
              opacity: milestoneAnim,
              transform: [
                {
                  scale: milestoneAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.milestoneIcon}>🎉</Text>
          <Text style={styles.milestoneText}>
            恭喜！你已经收集了所有故事线索
          </Text>
          <Text style={styles.milestoneSubtext}>
            准备好见证奇迹了吗？
          </Text>
        </Animated.View>
      )}

      {/* Celebration Particles */}
      {particles.map((particle, index) => (
        <Particle key={index} {...particle} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: VTPR_THEME.spacing.large,
    paddingVertical: VTPR_THEME.spacing.medium,
    backgroundColor: VTPR_THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: VTPR_THEME.colors.neutral + '20',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: VTPR_THEME.spacing.medium,
  },
  title: {
    fontSize: VTPR_THEME.fonts.subtitle.fontSize,
    fontWeight: VTPR_THEME.fonts.subtitle.fontWeight,
    color: VTPR_THEME.colors.text,
  },
  stats: {
    fontSize: VTPR_THEME.fonts.body.fontSize,
    color: VTPR_THEME.colors.primary,
    fontWeight: '600',
  },
  currentKeywordContainer: {
    alignItems: 'center',
    marginBottom: VTPR_THEME.spacing.large,
  },
  currentKeywordLabel: {
    fontSize: VTPR_THEME.fonts.caption.fontSize,
    color: VTPR_THEME.colors.neutral,
    marginBottom: VTPR_THEME.spacing.small,
  },
  currentKeyword: {
    fontSize: VTPR_THEME.fonts.keyword.fontSize,
    fontWeight: VTPR_THEME.fonts.keyword.fontWeight,
    color: VTPR_THEME.colors.primary,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: VTPR_THEME.spacing.large,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: VTPR_THEME.colors.neutral + '30',
    borderRadius: 4,
    marginRight: VTPR_THEME.spacing.medium,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: VTPR_THEME.colors.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: VTPR_THEME.fonts.caption.fontSize,
    fontWeight: '600',
    color: VTPR_THEME.colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  progressDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: VTPR_THEME.spacing.small,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: VTPR_THEME.colors.neutral + '30',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  completedDot: {
    backgroundColor: VTPR_THEME.colors.secondary,
  },
  currentDot: {
    backgroundColor: VTPR_THEME.colors.primary,
    position: 'relative',
  },
  currentDotGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: VTPR_THEME.colors.primary + '40',
    top: -4,
    left: -4,
  },
  dotCheckmark: {
    color: VTPR_THEME.colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  milestoneContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  milestoneIcon: {
    fontSize: 64,
    marginBottom: VTPR_THEME.spacing.medium,
  },
  milestoneText: {
    fontSize: VTPR_THEME.fonts.title.fontSize,
    fontWeight: VTPR_THEME.fonts.title.fontWeight,
    color: VTPR_THEME.colors.text,
    textAlign: 'center',
    marginBottom: VTPR_THEME.spacing.small,
  },
  milestoneSubtext: {
    fontSize: VTPR_THEME.fonts.body.fontSize,
    color: VTPR_THEME.colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 99,
  },
});

export default ProgressVisualization;