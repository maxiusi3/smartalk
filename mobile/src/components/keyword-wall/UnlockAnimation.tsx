import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { UnlockAnimationProps } from '@/types/keyword-wall.types';
import { KEYWORD_WALL_ANIMATIONS } from '@/constants/keyword-wall';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * UnlockAnimation组件
 * 关键词解锁时的庆祝动画效果
 */
const UnlockAnimation: React.FC<UnlockAnimationProps> = ({
  isVisible,
  keyword,
  onAnimationComplete,
  duration = KEYWORD_WALL_ANIMATIONS.unlock.duration,
  particleCount = 12,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: particleCount }, () => ({
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (isVisible) {
      startUnlockAnimation();
    } else {
      resetAnimation();
    }
  }, [isVisible]);

  /**
   * 启动解锁动画
   */
  const startUnlockAnimation = () => {
    // 主要动画序列
    const mainAnimation = Animated.sequence([
      // 第一阶段：淡入和缩放
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),

      // 第二阶段：发光效果
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: duration * 0.3,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      // 第三阶段：旋转庆祝
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 0.4,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),

      // 第四阶段：淡出
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: duration * 0.1,
        useNativeDriver: true,
      }),
    ]);

    // 粒子动画
    const particleAnimations = particleAnims.map((particle, index) => {
      const angle = (index / particleCount) * 2 * Math.PI;
      const distance = 100 + Math.random() * 50;
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;

      return Animated.sequence([
        // 延迟启动
        Animated.delay(duration * 0.3 + index * 50),
        
        // 粒子爆发
        Animated.parallel([
          Animated.timing(particle.scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateX, {
            toValue: targetX,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: targetY,
            duration: 800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    // 启动所有动画
    Animated.parallel([
      mainAnimation,
      ...particleAnimations,
    ]).start(() => {
      onAnimationComplete?.();
    });
  };

  /**
   * 重置动画
   */
  const resetAnimation = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0);
    rotateAnim.setValue(0);
    glowAnim.setValue(0);
    
    particleAnims.forEach(particle => {
      particle.translateX.setValue(0);
      particle.translateY.setValue(0);
      particle.scale.setValue(0);
      particle.opacity.setValue(1);
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {/* 背景遮罩 */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
          },
        ]}
      />

      {/* 主要内容 */}
      <View style={styles.content}>
        {/* 发光背景 */}
        <Animated.View
          style={[
            styles.glowBackground,
            {
              opacity: glowAnim,
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 2],
                  }),
                },
              ],
            },
          ]}
        />

        {/* 关键词卡片 */}
        <Animated.View
          style={[
            styles.keywordCard,
            {
              opacity: fadeAnim,
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
          {/* 图标 */}
          <Text style={styles.icon}>{keyword.icon}</Text>
          
          {/* 词汇 */}
          <Text style={styles.word}>{keyword.word}</Text>
          
          {/* 翻译 */}
          <Text style={styles.translation}>{keyword.translation}</Text>
          
          {/* 解锁标识 */}
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>解锁成功!</Text>
          </View>
        </Animated.View>

        {/* 粒子效果 */}
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.translateX },
                  { translateY: particle.translateY },
                  { scale: particle.scale },
                ],
              },
            ]}
          >
            <Text style={styles.particleIcon}>✨</Text>
          </Animated.View>
        ))}

        {/* 光环效果 */}
        <Animated.View
          style={[
            styles.halo,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
              transform: [
                {
                  scale: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1.5],
                  }),
                },
                {
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* 成功消息 */}
        <Animated.View
          style={[
            styles.successMessage,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.successTitle}>🎉 太棒了!</Text>
          <Text style={styles.successSubtitle}>你发现了一个新的故事线索</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  keywordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  icon: {
    fontSize: 48,
    marginBottom: 12,
  },
  word: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  translation: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 16,
  },
  unlockedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unlockedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particleIcon: {
    fontSize: 16,
  },
  halo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#FFD700',
    opacity: 0.5,
  },
  successMessage: {
    position: 'absolute',
    bottom: -100,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
});

export default UnlockAnimation;
