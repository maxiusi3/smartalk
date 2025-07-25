import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import TipManager from './TipManager';

interface SpeakingTipsButtonProps {
  context?: 'onboarding' | 'learning' | 'achievement' | 'general';
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'floating' | 'inline' | 'minimal';
  showLabel?: boolean;
  userProgress?: any;
  onTipShown?: (tipId: string) => void;
}

const SpeakingTipsButton: React.FC<SpeakingTipsButtonProps> = ({
  context = 'general',
  style,
  size = 'medium',
  variant = 'floating',
  showLabel = true,
  userProgress,
  onTipShown,
}) => {
  const [showTipManager, setShowTipManager] = useState(false);
  const tipManagerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Subtle pulsing animation to draw attention
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow effect
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 3000,
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
    setShowTipManager(true);
    // Show a random contextual tip
    setTimeout(() => {
      tipManagerRef.current?.showRandomTip();
    }, 100);
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small': return { width: 40, height: 40 };
      case 'large': return { width: 60, height: 60 };
      case 'medium':
      default: return { width: 50, height: 50 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 24;
      case 'medium':
      default: return 20;
    }
  };

  const getLabelSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 16;
      case 'medium':
      default: return 14;
    }
  };

  const getVariantStyles = () => {
    const baseSize = getButtonSize();
    
    switch (variant) {
      case 'floating':
        return {
          ...styles.floatingButton,
          ...baseSize,
          backgroundColor: '#FF6B35',
          elevation: 6,
          shadowColor: '#FF6B35',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        };
      case 'inline':
        return {
          ...styles.inlineButton,
          ...baseSize,
          backgroundColor: '#FFF3EF',
          borderWidth: 2,
          borderColor: '#FF6B35',
        };
      case 'minimal':
        return {
          ...styles.minimalButton,
          ...baseSize,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...styles.floatingButton,
          ...baseSize,
          backgroundColor: '#FF6B35',
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'floating': return '#FFFFFF';
      case 'inline': return '#FF6B35';
      case 'minimal': return '#FF6B35';
      default: return '#FFFFFF';
    }
  };

  const renderButton = () => (
    <Animated.View
      style={[
        {
          transform: [{ scale: pulseAnim }],
        },
        style,
      ]}
    >
      {/* Glow effect for floating variant */}
      {variant === 'floating' && (
        <Animated.View
          style={[
            styles.glowEffect,
            getButtonSize(),
            {
              opacity: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.3],
              }),
            },
          ]}
        />
      )}
      
      <TouchableOpacity
        style={[getVariantStyles()]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={[styles.icon, { fontSize: getIconSize() }]}>💡</Text>
        {showLabel && variant !== 'minimal' && (
          <Text 
            style={[
              styles.label, 
              { 
                fontSize: getLabelSize(),
                color: getTextColor(),
              }
            ]}
          >
            口语
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderInlineVersion = () => (
    <TouchableOpacity
      style={[styles.inlineContainer, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.inlineContent}>
        <Text style={styles.inlineIcon}>💬</Text>
        <View style={styles.inlineTextContainer}>
          <Text style={styles.inlineTitle}>实用口语技巧</Text>
          <Text style={styles.inlineSubtitle}>
            学会这些表达，开口说英语更自信
          </Text>
        </View>
        <Text style={styles.inlineArrow}>→</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {variant === 'inline' && size === 'large' ? renderInlineVersion() : renderButton()}
      
      {showTipManager && (
        <TipManager
          ref={tipManagerRef}
          context={context}
          userProgress={userProgress}
          onTipShown={(tipId) => {
            onTipShown?.(tipId);
            setShowTipManager(false);
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  inlineButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalButton: {
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowEffect: {
    position: 'absolute',
    borderRadius: 25,
    backgroundColor: '#FF6B35',
    transform: [{ scale: 1.2 }],
  },
  icon: {
    textAlign: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
    textAlign: 'center',
  },
  inlineContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  inlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  inlineTextContainer: {
    flex: 1,
  },
  inlineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 4,
  },
  inlineSubtitle: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 18,
  },
  inlineArrow: {
    fontSize: 18,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});

export default SpeakingTipsButton;