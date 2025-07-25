import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Animated, Easing } from 'react-native';
import { VTPR_THEME } from '@/constants/vtpr';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface FeedbackAnimationsProps {
  type: 'correct' | 'incorrect' | 'encouragement' | 'milestone';
  visible: boolean;
  onComplete?: () => void;
}

interface FloatingTextProps {
  text: string;
  color: string;
  startY: number;
  delay: number;
}

const FloatingText: React.FC<FloatingTextProps> = ({ text, color, startY, delay }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingText,
        {
          color,
          opacity: opacityValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [startY, startY - 100],
              }),
            },
            {
              scale: animValue.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0, 1.2, 1],
              }),
            },
          ],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
};

interface PulseRingProps {
  size: number;
  color: string;
  delay: number;
}

const PulseRing: React.FC<PulseRingProps> = ({ size, color, delay }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
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
        styles.pulseRing,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: color,
          opacity: opacityValue,
          transform: [{ scale: scaleValue }],
        },
      ]}
    />
  );
};

interface SparkleProps {
  x: number;
  y: number;
  delay: number;
}

const Sparkle: React.FC<SparkleProps> = ({ x, y, delay }) => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.back(2)),
          useNativeDriver: true,
        }),
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        {
          left: x,
          top: y,
          opacity: opacityValue,
          transform: [
            { scale: scaleValue },
            {
              rotate: rotateValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      ✨
    </Animated.Text>
  );
};

const FeedbackAnimations: React.FC<FeedbackAnimationsProps> = ({
  type,
  visible,
  onComplete,
}) => {
  const containerOpacity = useRef(new Animated.Value(0)).current;
  const [sparkles, setSparkles] = React.useState<SparkleProps[]>([]);
  const [floatingTexts, setFloatingTexts] = React.useState<FloatingTextProps[]>([]);

  const generateCorrectAnimations = useCallback(() => {
    // Create sparkles
    const newSparkles: SparkleProps[] = [];
    for (let i = 0; i < 8; i++) {
      newSparkles.push({
        x: screenWidth * 0.2 + Math.random() * screenWidth * 0.6,
        y: screenHeight * 0.3 + Math.random() * screenHeight * 0.4,
        delay: i * 100,
      });
    }
    setSparkles(newSparkles);

    // Create floating texts
    const encouragingTexts = ['太棒了!', '很好!', '继续加油!'];
    const newFloatingTexts: FloatingTextProps[] = encouragingTexts.map((text, index) => ({
      text,
      color: VTPR_THEME.colors.correct,
      startY: screenHeight * 0.6 + index * 30,
      delay: index * 300,
    }));
    setFloatingTexts(newFloatingTexts);
  }, []);

  const generateIncorrectAnimations = useCallback(() => {
    // Create gentle floating texts for encouragement
    const encouragingTexts = ['再试一次', '你能做到的!'];
    const newFloatingTexts: FloatingTextProps[] = encouragingTexts.map((text, index) => ({
      text,
      color: VTPR_THEME.colors.neutral,
      startY: screenHeight * 0.5 + index * 40,
      delay: index * 500,
    }));
    setFloatingTexts(newFloatingTexts);
  }, []);

  const generateEncouragementAnimations = useCallback(() => {
    // Create warm, supportive animations
    const encouragingTexts = ['别担心', '大脑正在学习', '继续尝试!'];
    const newFloatingTexts: FloatingTextProps[] = encouragingTexts.map((text, index) => ({
      text,
      color: VTPR_THEME.colors.secondary,
      startY: screenHeight * 0.4 + index * 35,
      delay: index * 400,
    }));
    setFloatingTexts(newFloatingTexts);
  }, []);

  const generateMilestoneAnimations = useCallback(() => {
    // Create celebration sparkles
    const newSparkles: SparkleProps[] = [];
    for (let i = 0; i < 15; i++) {
      newSparkles.push({
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight,
        delay: i * 150,
      });
    }
    setSparkles(newSparkles);

    // Create milestone texts
    const milestoneTexts = ['恭喜完成!', '准备见证奇迹!'];
    const newFloatingTexts: FloatingTextProps[] = milestoneTexts.map((text, index) => ({
      text,
      color: VTPR_THEME.colors.primary,
      startY: screenHeight * 0.5 + index * 50,
      delay: index * 800,
    }));
    setFloatingTexts(newFloatingTexts);
  }, []);

  const hideAnimation = useCallback(() => {
    Animated.timing(containerOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setSparkles([]);
      setFloatingTexts([]);
      onComplete?.();
    });
  }, [containerOpacity, onComplete]);

  const showAnimation = useCallback(() => {
    // Show container
    Animated.timing(containerOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Generate animations based on type
    switch (type) {
      case 'correct':
        generateCorrectAnimations();
        break;
      case 'incorrect':
        generateIncorrectAnimations();
        break;
      case 'encouragement':
        generateEncouragementAnimations();
        break;
      case 'milestone':
        generateMilestoneAnimations();
        break;
    }

    // Auto-hide after duration
    const timer = setTimeout(() => {
      hideAnimation();
    }, type === 'milestone' ? 3000 : 2000);

    return timer;
  }, [type, containerOpacity, generateCorrectAnimations, generateIncorrectAnimations, generateEncouragementAnimations, generateMilestoneAnimations, hideAnimation]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (visible) {
      timer = showAnimation();
    } else {
      hideAnimation();
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [visible, showAnimation, hideAnimation]);

  if (!visible && containerOpacity._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: containerOpacity,
        },
      ]}
      pointerEvents="none"
    >
      {/* Pulse Rings for Correct Answers */}
      {type === 'correct' && (
        <View style={styles.centerContainer}>
          <PulseRing size={100} color={VTPR_THEME.colors.correct} delay={0} />
          <PulseRing size={150} color={VTPR_THEME.colors.correct} delay={200} />
          <PulseRing size={200} color={VTPR_THEME.colors.correct} delay={400} />
        </View>
      )}

      {/* Sparkles */}
      {sparkles.map((sparkle, index) => (
        <Sparkle key={index} {...sparkle} />
      ))}

      {/* Floating Texts */}
      {floatingTexts.map((floatingText, index) => (
        <FloatingText key={index} {...floatingText} />
      ))}

      {/* Central Icon for Milestone */}
      {type === 'milestone' && (
        <View style={styles.centerContainer}>
          <Animated.Text
            style={[
              styles.milestoneIcon,
              {
                transform: [
                  {
                    scale: containerOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            🏆
          </Animated.Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    pointerEvents: 'none',
  },
  centerContainer: {
    position: 'absolute',
    top: screenHeight * 0.4,
    left: screenWidth * 0.5 - 100,
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    borderWidth: 3,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  floatingText: {
    position: 'absolute',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    width: screenWidth,
  },
  milestoneIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
});

export default FeedbackAnimations;