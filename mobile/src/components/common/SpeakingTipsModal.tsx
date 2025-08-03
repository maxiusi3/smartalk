import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SpeakingTip {
  id: string;
  category: 'emergency' | 'conversation' | 'clarification' | 'encouragement';
  title: string;
  phrase: string;
  translation: string;
  pronunciation?: string;
  usage: string;
  example?: string;
}

interface SpeakingTipsModalProps {
  visible: boolean;
  onClose: () => void;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  currentTheme?: string;
}

/**
 * SpeakingTipsModal组件 - V2 实用口语建议系统
 * 提供紧急短语、对话启动器和澄清表达
 */
const SpeakingTipsModal: React.FC<SpeakingTipsModalProps> = ({
  visible,
  onClose,
  userLevel = 'beginner',
  currentTheme,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SpeakingTip['category']>('emergency');
  const [tips, setTips] = useState<SpeakingTip[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    if (visible) {
      loadTips();
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      analyticsService.track('speaking_tips_opened', {
        userLevel,
        currentTheme,
        timestamp: Date.now(),
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadTips = () => {
    // V2: 实用口语建议数据
    const allTips: SpeakingTip[] = [
      // 紧急短语
      {
        id: 'emergency_1',
        category: 'emergency',
        title: '表达不清楚时',
        phrase: 'Sorry, I mean...',
        translation: '不好意思，我的意思是...',
        pronunciation: '/ˈsɒri aɪ miːn/',
        usage: '当你说错话或想重新表达时使用',
        example: 'Sorry, I mean the blue one, not the red one.',
      },
      {
        id: 'emergency_2',
        category: 'emergency',
        title: '询问英语表达',
        phrase: 'How do you say... in English?',
        translation: '用英语怎么说...？',
        pronunciation: '/haʊ duː juː seɪ ɪn ˈɪŋɡlɪʃ/',
        usage: '当你不知道某个词的英语表达时',
        example: 'How do you say "筷子" in English?',
      },
      {
        id: 'emergency_3',
        category: 'emergency',
        title: '请求重复',
        phrase: 'Could you repeat that, please?',
        translation: '你能再说一遍吗？',
        pronunciation: '/kʊd juː rɪˈpiːt ðæt pliːz/',
        usage: '当你没听清楚对方说话时',
        example: 'Could you repeat that, please? I didn\'t catch it.',
      },
      
      // 对话启动器
      {
        id: 'conversation_1',
        category: 'conversation',
        title: '开始对话',
        phrase: 'Excuse me, could I ask you something?',
        translation: '不好意思，我能问你个问题吗？',
        pronunciation: '/ɪkˈskjuːz miː kʊd aɪ ɑːsk juː ˈsʌmθɪŋ/',
        usage: '礼貌地开始与陌生人对话',
        example: 'Excuse me, could I ask you something about this menu?',
      },
      {
        id: 'conversation_2',
        category: 'conversation',
        title: '表达观点',
        phrase: 'In my opinion...',
        translation: '在我看来...',
        pronunciation: '/ɪn maɪ əˈpɪnjən/',
        usage: '表达个人观点时使用',
        example: 'In my opinion, this movie is really interesting.',
      },
      {
        id: 'conversation_3',
        category: 'conversation',
        title: '同意对方',
        phrase: 'I totally agree with you.',
        translation: '我完全同意你的观点。',
        pronunciation: '/aɪ ˈtoʊtəli əˈɡriː wɪð juː/',
        usage: '表示强烈同意时使用',
        example: 'I totally agree with you about that restaurant.',
      },
      
      // 澄清表达
      {
        id: 'clarification_1',
        category: 'clarification',
        title: '澄清误解',
        phrase: 'What I meant was...',
        translation: '我的意思是...',
        pronunciation: '/wʌt aɪ ment wʌz/',
        usage: '当对方误解你的意思时',
        example: 'What I meant was that we should leave earlier.',
      },
      {
        id: 'clarification_2',
        category: 'clarification',
        title: '确认理解',
        phrase: 'So you\'re saying that...',
        translation: '所以你的意思是...',
        pronunciation: '/soʊ jʊr ˈseɪɪŋ ðæt/',
        usage: '确认你是否正确理解对方',
        example: 'So you\'re saying that the meeting is at 3 PM?',
      },
      
      // 鼓励表达
      {
        id: 'encouragement_1',
        category: 'encouragement',
        title: '表达努力',
        phrase: 'I\'m still learning, but...',
        translation: '我还在学习中，但是...',
        pronunciation: '/aɪm stɪl ˈlɜrnɪŋ bʌt/',
        usage: '承认自己在学习的同时表达观点',
        example: 'I\'m still learning, but I think this is correct.',
      },
      {
        id: 'encouragement_2',
        category: 'encouragement',
        title: '请求耐心',
        phrase: 'Bear with me, please.',
        translation: '请耐心一点。',
        pronunciation: '/ber wɪð miː pliːz/',
        usage: '当你需要时间思考或表达时',
        example: 'Bear with me, please. Let me think about this.',
      },
    ];

    setTips(allTips);
  };

  const getCategoryTitle = (category: SpeakingTip['category']): string => {
    switch (category) {
      case 'emergency': return '🆘 紧急短语';
      case 'conversation': return '💬 对话启动';
      case 'clarification': return '🔍 澄清表达';
      case 'encouragement': return '💪 鼓励表达';
      default: return '💡 实用建议';
    }
  };

  const getCategoryDescription = (category: SpeakingTip['category']): string => {
    switch (category) {
      case 'emergency': return '当你遇到困难时的救命短语';
      case 'conversation': return '开始和维持对话的实用表达';
      case 'clarification': return '澄清误解和确认理解的短语';
      case 'encouragement': return '建立信心的鼓励性表达';
      default: return '实用的口语建议';
    }
  };

  const handleTipPress = (tip: SpeakingTip) => {
    analyticsService.track('speaking_tip_viewed', {
      tipId: tip.id,
      category: tip.category,
      phrase: tip.phrase,
      timestamp: Date.now(),
    });
  };

  const renderCategoryButtons = () => {
    const categories: SpeakingTip['category'][] = ['emergency', 'conversation', 'clarification', 'encouragement'];
    
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.activeCategoryButtonText
            ]}>
              {getCategoryTitle(category)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTipCard = (tip: SpeakingTip) => (
    <TouchableOpacity
      key={tip.id}
      style={styles.tipCard}
      onPress={() => handleTipPress(tip)}
    >
      <View style={styles.tipHeader}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
      </View>
      
      <View style={styles.tipContent}>
        <Text style={styles.tipPhrase}>{tip.phrase}</Text>
        <Text style={styles.tipTranslation}>{tip.translation}</Text>
        
        {tip.pronunciation && (
          <Text style={styles.tipPronunciation}>{tip.pronunciation}</Text>
        )}
        
        <Text style={styles.tipUsage}>{tip.usage}</Text>
        
        {tip.example && (
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>例句：</Text>
            <Text style={styles.exampleText}>{tip.example}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredTips = tips.filter(tip => tip.category === selectedCategory);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>💡 实用口语建议</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* 分类按钮 */}
          {renderCategoryButtons()}
          
          {/* 分类描述 */}
          <View style={styles.categoryDescription}>
            <Text style={styles.categoryDescriptionText}>
              {getCategoryDescription(selectedCategory)}
            </Text>
          </View>
          
          {/* 建议列表 */}
          <ScrollView style={styles.tipsContainer} showsVerticalScrollIndicator={false}>
            {filteredTips.map(tip => renderTipCard(tip))}
          </ScrollView>
          
          {/* 底部鼓励文案 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💪 记住：沟通比完美更重要！
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.85,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  categoryContainer: {
    paddingVertical: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  activeCategoryButton: {
    backgroundColor: '#667eea',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeCategoryButtonText: {
    color: '#FFFFFF',
  },
  categoryDescription: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoryDescriptionText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  tipsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  tipHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  tipContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tipPhrase: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  tipTranslation: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  tipPronunciation: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  tipUsage: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  exampleContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 14,
    color: '#1e40af',
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    color: '#10b981',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SpeakingTipsModal;
