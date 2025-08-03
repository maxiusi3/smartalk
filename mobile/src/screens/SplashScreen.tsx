import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { AnalyticsService } from '@/services/AnalyticsService';
import { UserService } from '@/services/UserService';

type SplashNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // 启动动画
    startAnimations();
    
    // 检查用户状态并决定导航路径
    checkUserStatusAndNavigate();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const checkUserStatusAndNavigate = async () => {
    try {
      // 记录应用启动事件
      AnalyticsService.getInstance().track('app_launched', {
        timestamp: Date.now(),
        platform: 'mobile',
      });

      // 检查用户是否是首次启动
      const userService = UserService.getInstance();
      const isFirstLaunch = await userService.isFirstLaunch();
      
      // 延迟2秒显示启动画面，然后导航
      setTimeout(() => {
        if (isFirstLaunch) {
          // 首次启动 - 强制显示方法论介绍
          AnalyticsService.getInstance().track('first_launch_detected', {
            timestamp: Date.now(),
          });
          navigation.replace('Onboarding');
        } else {
          // 返回用户 - 检查是否完成了onboarding
          userService.hasCompletedOnboarding().then((completed) => {
            if (completed) {
              // 已完成onboarding，直接进入主界面
              navigation.replace('Home');
            } else {
              // 未完成onboarding，继续onboarding流程
              navigation.replace('Onboarding');
            }
          });
        }
      }, 2000);

    } catch (error) {
      console.error('Error checking user status:', error);
      // 出错时默认进入onboarding
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 2000);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo/Icon Area */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎭</Text>
            </View>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.taglineMain}>Don't learn a language,</Text>
            <Text style={styles.taglineEmphasis}>live a story</Text>
            <Text style={styles.taglineSubtitle}>不要学语言，要活在故事里</Text>
          </Animated.View>

          {/* Loading indicator */}
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dot1]} />
              <View style={[styles.dot, styles.dot2]} />
              <View style={[styles.dot, styles.dot3]} />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  taglineMain: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '300',
    marginBottom: 8,
  },
  taglineEmphasis: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  taglineSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '400',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 4,
  },
  dot1: {
    // 动画将通过Animated.loop添加
  },
  dot2: {
    // 动画将通过Animated.loop添加
  },
  dot3: {
    // 动画将通过Animated.loop添加
  },
});

export default SplashScreen;
