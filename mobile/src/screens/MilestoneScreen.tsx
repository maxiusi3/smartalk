import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppStore } from '@/store/useAppStore';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';

type MilestoneRouteProp = RouteProp<RootStackParamList, 'Milestone'>;
type MilestoneNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const MilestoneScreen: React.FC = () => {
  const navigation = useNavigation<MilestoneNavigationProp>();
  const route = useRoute<MilestoneRouteProp>();
  const { dramaId } = route.params;
  const { user } = useAppStore();

  const [ready, setReady] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [headphonesDetected, setHeadphonesDetected] = useState(false);
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, delay: number}>>([]);

  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const particleAnims = new Array(20).fill(0).map(() => new Animated.Value(0));
  const blackScreenAnim = new Animated.Value(0);

  const analyticsService = AnalyticsService.getInstance();
  const userService = UserService.getInstance();

  useEffect(() => {
    // 记录Magic Moment开始事件
    analyticsService.track('magic_moment_initiated', {
      dramaId,
      timestamp: Date.now(),
    });

    // 检测耳机
    checkHeadphones();

    // 生成金色粒子效果
    generateParticles();

    // 入场动画
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 延迟显示CTA按钮
    const timer = setTimeout(() => {
      setReady(true);
      setShowCTA(true);
      startParticleAnimation();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkHeadphones = async () => {
    // 简化的耳机检测（实际应用中需要使用音频API）
    try {
      // 这里应该集成真实的耳机检测逻辑
      setHeadphonesDetected(Math.random() > 0.5); // 模拟检测结果
    } catch (error) {
      console.log('Headphone detection not available');
      setHeadphonesDetected(false);
    }
  };

  const generateParticles = () => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        delay: i * 100,
      });
    }
    setParticles(newParticles);
  };

  const startParticleAnimation = () => {
    particleAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(particles[index]?.delay || 0),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const handleMagicMomentStart = async () => {
    // 记录用户选择开始Magic Moment
    analyticsService.track('magic_moment_started', {
      dramaId,
      headphonesDetected,
      timestamp: Date.now(),
    });

    // 3秒黑屏过渡
    setShowBlackScreen(true);

    Animated.timing(blackScreenAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // 播放上升音效（这里用setTimeout模拟）
    setTimeout(() => {
      // 实际应用中在这里播放音效
      console.log('Playing uplifting sound effect');
    }, 1000);

    // 3秒后进入Theater Mode
    setTimeout(() => {
      navigation.navigate('TheaterMode', { dramaId });
    }, 3000);
  };

  const handleLaterExperience = () => {
    // 记录用户选择稍后体验
    analyticsService.track('magic_moment_deferred', {
      dramaId,
      timestamp: Date.now(),
    });

    // 返回主界面
    navigation.navigate('Home');
  };

  const renderParticles = () => (
    <View style={styles.particlesContainer}>
      {particles.map((particle, index) => (
        <Animated.View
          key={particle.id}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              opacity: particleAnims[index],
              transform: [
                {
                  translateY: particleAnims[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -100],
                  }),
                },
                {
                  scale: particleAnims[index].interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.particleText}>✨</Text>
        </Animated.View>
      ))}
    </View>
  );

  const renderHeadphonePrompt = () => {
    if (headphonesDetected) return null;

    return (
      <View style={styles.headphonePrompt}>
        <Text style={styles.headphoneIcon}>🎧</Text>
        <Text style={styles.headphoneText}>建议佩戴耳机以获得最佳体验</Text>
      </View>
    );
  };

  const renderBlackScreen = () => {
    if (!showBlackScreen) return null;

    return (
      <Animated.View
        style={[
          styles.blackScreen,
          { opacity: blackScreenAnim }
        ]}
      >
        <Text style={styles.blackScreenText}>准备见证奇迹...</Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 金色粒子效果 */}
      {renderParticles()}

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* 庆祝图标 */}
        <View style={styles.celebrationContainer}>
          <Text style={styles.celebrationIcon}>🏆</Text>
          <Text style={styles.keysIcon}>🔑🔑🔑🔑🔑</Text>
        </View>

        {/* V2 庆祝文案 */}
        <Text style={styles.congratsTitle}>恭喜！</Text>
        <Text style={styles.congratsSubtitle}>你已集齐所有钥匙</Text>
        <Text style={styles.magicPrompt}>准备好见证奇迹了吗？</Text>

        {/* 耳机提示 */}
        {renderHeadphonePrompt()}

        {/* CTA按钮 */}
        {showCTA && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleMagicMomentStart}
            >
              <Text style={styles.primaryButtonText}>
                🎧 戴上耳机，见证奇迹
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLaterExperience}
            >
              <Text style={styles.secondaryButtonText}>
                稍后体验
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      {/* 黑屏过渡 */}
      {renderBlackScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23', // 深蓝紫色背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  particleText: {
    fontSize: 16,
    color: '#fbbf24', // 金色
  },
  contentContainer: {
    width: width * 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    zIndex: 2,
  },
  celebrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  keysIcon: {
    fontSize: 24,
    letterSpacing: 4,
  },
  congratsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fbbf24', // 金色
    textAlign: 'center',
    marginBottom: 8,
  },
  congratsSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  magicPrompt: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    fontStyle: 'italic',
  },
  headphonePrompt: {
    backgroundColor: '#fef3c7', // 淡黄色背景
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: 'center',
  },
  headphoneIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  headphoneText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  blackScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  blackScreenText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
    textAlign: 'center',
  },
});

export default MilestoneScreen;