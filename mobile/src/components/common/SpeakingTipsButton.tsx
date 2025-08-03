import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import SpeakingTipsModal from './SpeakingTipsModal';

interface SpeakingTipsButtonProps {
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentTheme?: string;
  style?: any;
}

/**
 * SpeakingTipsButton组件 - V2 实用口语建议按钮
 * 可点击的灯泡图标，显示实用口语建议
 */
const SpeakingTipsButton: React.FC<SpeakingTipsButtonProps> = ({
  userLevel = 'beginner',
  currentTheme,
  style,
}) => {
  const [showModal, setShowModal] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 脉冲动画
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // 发光动画
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, []);

  const handlePress = () => {
    setShowModal(true);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* 发光效果 */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
            },
          ]}
        />
        
        {/* 主按钮 */}
        <Animated.View
          style={[
            styles.button,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.icon}>💡</Text>
        </Animated.View>
        
        {/* 提示文本 */}
        <Text style={styles.hintText}>口语建议</Text>
      </TouchableOpacity>

      {/* 口语建议模态框 */}
      <SpeakingTipsModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        userLevel={userLevel}
        currentTheme={currentTheme}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fbbf24',
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    fontSize: 28,
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default SpeakingTipsButton;
