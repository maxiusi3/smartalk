import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAdvancedFeatures, useAIAssistant } from '@/hooks/useAdvancedFeatures';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AIAssistantType, AIAssistantResponse } from '@/services/AdvancedFeaturesService';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * AIAssistantScreen - V2 AI助手界面
 * 提供完整的AI助手体验：多类型助手、智能对话、个性化建议
 */
const AIAssistantScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 高级功能
  const {
    currentAssistant,
    switchAssistant,
    loading,
    error,
  } = useAdvancedFeatures();

  // 当前AI助手
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistantType>('learning_coach');
  const {
    conversationHistory,
    isTyping,
    sendMessage,
    assistantConfig,
  } = useAIAssistant(selectedAssistant);

  const [inputMessage, setInputMessage] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('AI助手', '与智能学习助手对话');
    
    analyticsService.track('ai_assistant_screen_viewed', {
      selectedAssistant,
      timestamp: Date.now(),
    });
  }, []);

  // 滚动到底部
  useEffect(() => {
    if (conversationHistory.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversationHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(message, {
        activity: 'chat',
        sessionTime: Date.now(),
      });
      
      screenReader.announce('消息已发送');
    } catch (error) {
      Alert.alert('错误', '发送消息失败: ' + error.message);
      screenReader.announceError('发送消息失败');
    }
  };

  const handleSwitchAssistant = (assistantType: AIAssistantType) => {
    setSelectedAssistant(assistantType);
    switchAssistant(assistantType);
    
    screenReader.announce(`已切换到${getAssistantName(assistantType)}`);
  };

  const getAssistantName = (type: AIAssistantType): string => {
    switch (type) {
      case 'learning_coach': return '学习教练';
      case 'pronunciation_tutor': return '发音导师';
      case 'conversation_partner': return '对话伙伴';
      case 'grammar_expert': return '语法专家';
      case 'vocabulary_trainer': return '词汇训练师';
      default: return '助手';
    }
  };

  const getAssistantIcon = (type: AIAssistantType): string => {
    switch (type) {
      case 'learning_coach': return '🎓';
      case 'pronunciation_tutor': return '🗣️';
      case 'conversation_partner': return '💬';
      case 'grammar_expert': return '📝';
      case 'vocabulary_trainer': return '📚';
      default: return '🤖';
    }
  };

  const getAssistantDescription = (type: AIAssistantType): string => {
    switch (type) {
      case 'learning_coach': return '帮助制定学习计划和跟踪进度';
      case 'pronunciation_tutor': return '指导发音技巧和练习';
      case 'conversation_partner': return '进行日常对话练习';
      case 'grammar_expert': return '解答语法问题和规则';
      case 'vocabulary_trainer': return '扩展词汇量和用法';
      default: return '智能学习助手';
    }
  };

  const renderAssistantSelector = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="AI助手选择器"
      applyHighContrast={true}
    >
      <View style={styles.assistantSelector}>
        <Text style={styles.selectorTitle}>选择AI助手</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.assistantList}
        >
          {(['learning_coach', 'pronunciation_tutor', 'conversation_partner', 'grammar_expert', 'vocabulary_trainer'] as AIAssistantType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.assistantCard,
                selectedAssistant === type && styles.selectedAssistantCard
              ]}
              onPress={() => handleSwitchAssistant(type)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`选择${getAssistantName(type)}`}
              accessibilityState={{ selected: selectedAssistant === type }}
            >
              <Text style={styles.assistantIcon}>
                {getAssistantIcon(type)}
              </Text>
              <Text style={[
                styles.assistantName,
                selectedAssistant === type && styles.selectedAssistantName
              ]}>
                {getAssistantName(type)}
              </Text>
              <Text style={styles.assistantDescription}>
                {getAssistantDescription(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </AccessibilityWrapper>
  );

  const renderMessage = ({ item, index }: { item: AIAssistantResponse; index: number }) => (
    <AccessibilityWrapper
      accessibilityRole="listitem"
      accessibilityLabel={`AI助手消息：${item.message}`}
      applyHighContrast={true}
    >
      <View style={styles.messageContainer}>
        {/* 用户消息 */}
        <View style={styles.userMessage}>
          <Text style={styles.userMessageText}>
            {item.context.userInput}
          </Text>
        </View>

        {/* AI响应 */}
        <View style={styles.assistantMessage}>
          <View style={styles.assistantHeader}>
            <Text style={styles.assistantMessageIcon}>
              {getAssistantIcon(item.type)}
            </Text>
            <Text style={styles.assistantMessageName}>
              {getAssistantName(item.type)}
            </Text>
            <Text style={styles.confidenceScore}>
              {Math.round(item.confidence * 100)}%
            </Text>
          </View>
          
          <Text style={styles.assistantMessageText}>
            {item.message}
          </Text>

          {/* 建议 */}
          {item.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>建议：</Text>
              {item.suggestions.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => setInputMessage(suggestion)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`建议：${suggestion}`}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 个性化指标 */}
          {item.personalization.adaptedToUser && (
            <View style={styles.personalizationIndicator}>
              <Text style={styles.personalizationText}>
                ✨ 已根据您的学习偏好调整
              </Text>
            </View>
          )}
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderInputArea = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="消息输入区域"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <View style={[styles.inputContainer, getLayoutDirectionStyles()]}>
        <TextInput
          style={[
            styles.messageInput,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}
          placeholder="输入您的问题..."
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
          maxLength={500}
          accessible={true}
          accessibilityLabel="消息输入框"
          accessibilityHint="输入您想问AI助手的问题"
        />

        <View style={styles.inputActions}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isVoiceMode && styles.activeVoiceButton
            ]}
            onPress={() => setIsVoiceMode(!isVoiceMode)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isVoiceMode ? '关闭语音模式' : '开启语音模式'}
            accessibilityState={{ selected: isVoiceMode }}
          >
            <Text style={styles.voiceButtonText}>
              {isVoiceMode ? '🎤' : '🎙️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isTyping) && styles.disabledSendButton
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="发送消息"
            accessibilityState={{ disabled: !inputMessage.trim() || isTyping }}
          >
            <Text style={styles.sendButtonText}>
              {isTyping ? '⏳' : '➤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="AI助手页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI助手</Text>
          <View style={styles.headerStatus}>
            <Text style={[
              styles.statusIndicator,
              { color: assistantConfig?.voiceEnabled ? '#10b981' : '#94a3b8' }
            ]}>
              {assistantConfig?.voiceEnabled ? '🔊' : '🔇'}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* AI助手选择器 */}
      {renderAssistantSelector()}

      {/* 对话区域 */}
      <View style={styles.conversationContainer}>
        {conversationHistory.length === 0 ? (
          <View style={styles.emptyConversation}>
            <Text style={styles.emptyConversationIcon}>
              {getAssistantIcon(selectedAssistant)}
            </Text>
            <Text style={styles.emptyConversationTitle}>
              {getAssistantName(selectedAssistant)}
            </Text>
            <Text style={styles.emptyConversationText}>
              {getAssistantDescription(selectedAssistant)}
            </Text>
            <Text style={styles.emptyConversationHint}>
              开始对话，我来帮助您学习！
            </Text>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.conversationScroll}
            showsVerticalScrollIndicator={false}
          >
            {conversationHistory.map((message, index) => (
              <View key={message.id}>
                {renderMessage({ item: message, index })}
              </View>
            ))}
            
            {/* 正在输入指示器 */}
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {getAssistantName(selectedAssistant)} 正在思考...
                </Text>
                <View style={styles.typingDots}>
                  <Text style={styles.typingDot}>●</Text>
                  <Text style={styles.typingDot}>●</Text>
                  <Text style={styles.typingDot}>●</Text>
                </View>
              </View>
            )}
          </ScrollView>
        )}
      </View>

      {/* 输入区域 */}
      {renderInputArea()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerStatus: {
    width: 40,
    alignItems: 'center',
  },
  statusIndicator: {
    fontSize: 20,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 4,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#dc2626',
  },
  assistantSelector: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  assistantList: {
    paddingHorizontal: 16,
  },
  assistantCard: {
    width: 120,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  selectedAssistantCard: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  assistantIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  assistantName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedAssistantName: {
    color: '#3b82f6',
  },
  assistantDescription: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 14,
  },
  conversationContainer: {
    flex: 1,
  },
  emptyConversation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyConversationIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyConversationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyConversationText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  emptyConversationHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  conversationScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '80%',
    marginBottom: 8,
  },
  userMessageText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assistantMessageIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  assistantMessageName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    flex: 1,
  },
  confidenceScore: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
  },
  assistantMessageText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 6,
  },
  suggestionChip: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  suggestionText: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '500',
  },
  personalizationIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  personalizationText: {
    fontSize: 11,
    color: '#10b981',
    fontStyle: 'italic',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    fontSize: 8,
    color: '#94a3b8',
    marginHorizontal: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeVoiceButton: {
    backgroundColor: '#ef4444',
  },
  voiceButtonText: {
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledSendButton: {
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

export default AIAssistantScreen;
