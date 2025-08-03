import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanGestureHandler,
  State,
  Dimensions,
} from 'react-native';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import SpeakingTipsService, { SpeakingTip, TipCardConfig } from '@/services/SpeakingTipsService';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

interface SpeakingTipCardProps {
  tip: SpeakingTip;
  config: TipCardConfig;
  userId: string;
  onDismiss?: () => void;
  onBookmark?: () => void;
  onRate?: (rating: number) => void;
  visible: boolean;
}

/**
 * SpeakingTipCard - V2 口语提示卡片组件
 * 提供动画展示、手势交互、音频播放、书签功能的口语提示卡片
 */
const SpeakingTipCard: React.FC<SpeakingTipCardProps> = ({
  tip,
  config,
  userId,
  onDismiss,
  onBookmark,
  onRate,
  visible,
}) => {
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number>(0);

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const panX = useRef(new Animated.Value(0)).current;

  const speakingTipsService = SpeakingTipsService.getInstance();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (visible) {
      setViewStartTime(Date.now());
      showCard();
    } else {
      hideCard();
    }
  }, [visible]);

  useEffect(() => {
    // 检查是否已书签
    checkBookmarkStatus();
    
    // 自动隐藏
    if (visible && config.interaction.autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, config.interaction.autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const checkBookmarkStatus = async () => {
    const bookmarkedTips = speakingTipsService.getUserBookmarkedTips(userId);
    setIsBookmarked(bookmarkedTips.some(t => t.tipId === tip.tipId));
  };

  const showCard = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: config.animation.duration,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: config.animation.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideCard = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: config.animation.duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: config.animation.duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 50,
        duration: config.animation.duration / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDismiss = () => {
    if (onDismiss) {
      // 记录查看时长
      const viewDuration = Date.now() - viewStartTime;
      // 这里可以调用服务记录查看时长
      
      hideCard();
      setTimeout(() => {
        onDismiss();
      }, config.animation.duration / 2);
    }
  };

  const handleBookmark = async () => {
    if (onBookmark) {
      const success = await speakingTipsService.bookmarkTip(tip.tipId, userId);
      if (success) {
        setIsBookmarked(true);
        onBookmark();
      }
    }
  };

  const handleLongPress = () => {
    if (config.interaction.longPressForMore) {
      setShowDetails(!showDetails);
    }
  };

  const handlePanGesture = (event: PanGestureHandlerGestureEvent) => {
    if (config.interaction.swipeToBookmark) {
      const { translationX } = event.nativeEvent;
      panX.setValue(translationX);
      
      // 如果向右滑动超过阈值，触发书签
      if (translationX > screenWidth * 0.3) {
        handleBookmark();
        handleDismiss();
      }
    }
  };

  const handlePanStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // 重置位置
      Animated.spring(panX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderLightbulbIcon = () => {
    const iconStyle = [
      styles.lightbulbIcon,
      { color: tip.visual.color },
      tip.visual.lightbulbStyle === 'animated' && styles.animatedIcon,
    ];

    return (
      <TouchableOpacity
        style={styles.lightbulbContainer}
        onPress={() => setShowDetails(!showDetails)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="点击查看提示详情"
      >
        <Text style={iconStyle}>{tip.visual.icon}</Text>
        {tip.visual.lightbulbStyle === 'animated' && (
          <View style={[styles.pulseRing, { borderColor: tip.visual.color }]} />
        )}
      </TouchableOpacity>
    );
  };

  const renderMainContent = () => (
    <View style={styles.mainContent}>
      <Text style={[styles.tipTitle, { color: config.theme.textColor }]}>
        {tip.title}
      </Text>
      
      <Text style={[styles.tipDescription, { color: config.theme.textColor }]}>
        {tip.description}
      </Text>
      
      <View style={styles.phraseContainer}>
        <Text style={[styles.mainPhrase, { color: config.theme.accentColor }]}>
          "{tip.content.mainPhrase}"
        </Text>
        <Text style={[styles.translation, { color: config.theme.textColor }]}>
          {tip.content.translation}
        </Text>
        <Text style={[styles.pronunciation, { color: config.theme.textColor }]}>
          {tip.content.pronunciation}
        </Text>
      </View>
      
      <Text style={[styles.example, { color: config.theme.textColor }]}>
        例句: {tip.content.example}
      </Text>
    </View>
  );

  const renderDetailedContent = () => (
    <View style={styles.detailedContent}>
      <Text style={[styles.contextTitle, { color: config.theme.textColor }]}>
        实用短语:
      </Text>
      
      {tip.practicalPhrases.slice(0, 3).map((phrase, index) => (
        <View key={index} style={styles.phraseItem}>
          <Text style={[styles.phraseText, { color: config.theme.accentColor }]}>
            • {phrase.phrase}
          </Text>
          <Text style={[styles.phraseTranslation, { color: config.theme.textColor }]}>
            {phrase.translation}
          </Text>
          <Text style={[styles.phraseUsage, { color: config.theme.textColor }]}>
            用法: {phrase.usage}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, styles.bookmarkButton]}
        onPress={handleBookmark}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={isBookmarked ? "已收藏" : "收藏提示"}
      >
        <Text style={styles.actionButtonText}>
          {isBookmarked ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.actionButton, styles.audioButton]}
        onPress={() => {/* 播放音频 */}}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="播放发音"
      >
        <Text style={styles.actionButtonText}>🔊</Text>
      </TouchableOpacity>
      
      {config.interaction.tapToDismiss && (
        <TouchableOpacity
          style={[styles.actionButton, styles.dismissButton]}
          onPress={handleDismiss}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="关闭提示"
        >
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (!visible) return null;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: config.theme.backgroundColor,
      borderRadius: config.theme.borderRadius,
    },
    config.theme.shadow && styles.shadow,
    config.layout.position === 'floating' && styles.floatingCard,
    config.layout.size === 'small' && styles.smallCard,
    config.layout.size === 'large' && styles.largeCard,
  ];

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [
      { scale: scaleAnim },
      { translateY: translateY },
      { translateX: panX },
    ],
  };

  return (
    <AccessibilityWrapper
      accessibilityRole="dialog"
      accessibilityLabel={`口语提示: ${tip.title}`}
      applyHighContrast={true}
    >
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={handlePanStateChange}
        enabled={config.interaction.swipeToBookmark}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <TouchableOpacity
            style={cardStyle}
            onPress={config.interaction.tapToDismiss ? handleDismiss : undefined}
            onLongPress={handleLongPress}
            activeOpacity={0.9}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${tip.title}: ${tip.description}`}
          >
            <View style={styles.cardHeader}>
              {renderLightbulbIcon()}
              <View style={styles.headerText}>
                <Text style={[styles.tipType, { color: config.theme.accentColor }]}>
                  {getTipTypeLabel(tip.type)}
                </Text>
                <Text style={[styles.priority, { color: config.theme.textColor }]}>
                  {getPriorityLabel(tip.priority)}
                </Text>
              </View>
            </View>
            
            {renderMainContent()}
            
            {showDetails && renderDetailedContent()}
            
            {renderActionButtons()}
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </AccessibilityWrapper>
  );

  function getTipTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      emergency_phrases: '紧急短语',
      conversation_starters: '对话开场',
      polite_expressions: '礼貌表达',
      clarification: '澄清说明',
      pronunciation: '发音技巧',
      grammar_quick: '语法速记',
      cultural_context: '文化背景',
      confidence_building: '信心建设',
    };
    return labels[type] || type;
  }

  function getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      high: '重要',
      medium: '一般',
      low: '参考',
    };
    return labels[priority] || priority;
  }
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  card: {
    maxWidth: '90%',
    minWidth: 280,
    padding: 20,
    margin: 20,
  },
  floatingCard: {
    position: 'absolute',
    top: 100,
    right: 20,
    maxWidth: 200,
    minWidth: 150,
  },
  smallCard: {
    padding: 12,
    maxWidth: 250,
  },
  largeCard: {
    padding: 24,
    maxWidth: '95%',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lightbulbContainer: {
    position: 'relative',
    marginRight: 12,
  },
  lightbulbIcon: {
    fontSize: 32,
  },
  animatedIcon: {
    // 动画效果将通过Animated API实现
  },
  pulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderWidth: 2,
    borderRadius: 20,
    opacity: 0.3,
  },
  headerText: {
    flex: 1,
  },
  tipType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  priority: {
    fontSize: 10,
    opacity: 0.7,
  },
  mainContent: {
    marginBottom: 16,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.8,
  },
  phraseContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  mainPhrase: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  translation: {
    fontSize: 14,
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  example: {
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  detailedContent: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  contextTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  phraseItem: {
    marginBottom: 8,
  },
  phraseText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  phraseTranslation: {
    fontSize: 13,
    marginBottom: 2,
  },
  phraseUsage: {
    fontSize: 11,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  bookmarkButton: {
    backgroundColor: '#fbbf24',
  },
  audioButton: {
    backgroundColor: '#3b82f6',
  },
  dismissButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default SpeakingTipCard;
