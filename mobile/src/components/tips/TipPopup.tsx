import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface TipContent {
  id: string;
  title: string;
  category: 'speaking' | 'listening' | 'confidence' | 'practical' | 'emergency';
  icon: string;
  mainMessage: string;
  examples: {
    phrase: string;
    translation: string;
    context: string;
  }[];
  encouragement: string;
  relatedTips?: string[];
}

interface TipPopupProps {
  tip: TipContent | null;
  visible: boolean;
  onClose: () => void;
  onRelatedTipPress?: (tipId: string) => void;
}

const TipPopup: React.FC<TipPopupProps> = ({
  tip,
  visible,
  onClose,
  onRelatedTipPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible && tip) {
      showTip();
    } else {
      hideTip();
    }
  }, [visible, tip]);

  const showTip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideTip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'speaking': return '#FF6B35';
      case 'listening': return '#4CAF50';
      case 'confidence': return '#2196F3';
      case 'practical': return '#9C27B0';
      case 'emergency': return '#F44336';
      default: return '#757575';
    }
  };

  const getCategoryName = (category: string): string => {
    switch (category) {
      case 'speaking': return '口语技巧';
      case 'listening': return '听力提升';
      case 'confidence': return '自信建立';
      case 'practical': return '实用对话';
      case 'emergency': return '应急表达';
      default: return '学习建议';
    }
  };

  if (!visible || !tip) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.icon}>{tip.icon}</Text>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>{tip.title}</Text>
                <View 
                  style={[
                    styles.categoryBadge, 
                    { backgroundColor: getCategoryColor(tip.category) }
                  ]}
                >
                  <Text style={styles.categoryText}>
                    {getCategoryName(tip.category)}
                  </Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Main Message */}
          <View style={styles.messageSection}>
            <Text style={styles.mainMessage}>{tip.mainMessage}</Text>
          </View>

          {/* Examples */}
          {tip.examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.sectionTitle}>💬 实用表达</Text>
              {tip.examples.map((example, index) => (
                <View key={index} style={styles.exampleCard}>
                  <Text style={styles.phraseText}>{example.phrase}</Text>
                  <Text style={styles.translationText}>{example.translation}</Text>
                  <Text style={styles.contextText}>💡 {example.context}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Encouragement */}
          <View style={styles.encouragementSection}>
            <Text style={styles.encouragementText}>{tip.encouragement}</Text>
          </View>

          {/* Related Tips */}
          {tip.relatedTips && tip.relatedTips.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>🔗 相关建议</Text>
              <View style={styles.relatedTipsContainer}>
                {tip.relatedTips.map((relatedTipId, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.relatedTipButton}
                    onPress={() => onRelatedTipPress?.(relatedTipId)}
                  >
                    <Text style={styles.relatedTipText}>
                      查看更多 →
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>我知道了</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: 'bold',
  },
  messageSection: {
    marginBottom: 24,
  },
  mainMessage: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  examplesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 12,
  },
  exampleCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  phraseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 6,
  },
  translationText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 13,
    color: '#FF6B35',
    fontStyle: 'italic',
  },
  encouragementSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  encouragementText: {
    fontSize: 15,
    color: '#2E7D32',
    lineHeight: 22,
    fontWeight: '500',
  },
  relatedSection: {
    marginBottom: 24,
  },
  relatedTipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  relatedTipButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  relatedTipText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TipPopup;