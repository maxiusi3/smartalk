/**
 * useAdvancedFeatures - V2 高级功能Hook
 * 提供组件级别的高级功能集成
 * 自动处理AI助手、智能推荐、个性化学习
 */

import { useEffect, useCallback, useState } from 'react';
import AdvancedFeaturesService, { 
  AIAssistantType,
  AIAssistantResponse,
  SmartRecommendation,
  PersonalizationProfile,
  VoiceRecognitionResult,
  NLPAnalysisResult,
  RecommendationType
} from '@/services/AdvancedFeaturesService';
import { useUserState } from '@/contexts/UserStateContext';
import { SupportedLanguage } from '@/services/InternationalizationService';

// 高级功能状态
interface AdvancedFeaturesState {
  // AI助手
  currentAssistant: AIAssistantType | null;
  conversationHistory: AIAssistantResponse[];
  assistantResponse: AIAssistantResponse | null;
  
  // 智能推荐
  recommendations: SmartRecommendation[];
  
  // 个性化配置
  personalizationProfile: PersonalizationProfile | null;
  
  // 语音识别
  voiceRecognitionResult: VoiceRecognitionResult | null;
  
  // NLP分析
  nlpAnalysisResult: NLPAnalysisResult | null;
  
  // 状态
  loading: boolean;
  error: string | null;
  isListening: boolean;
  isAnalyzing: boolean;
}

/**
 * 高级功能Hook
 */
export const useAdvancedFeatures = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<AdvancedFeaturesState>({
    currentAssistant: null,
    conversationHistory: [],
    assistantResponse: null,
    recommendations: [],
    personalizationProfile: null,
    voiceRecognitionResult: null,
    nlpAnalysisResult: null,
    loading: false,
    error: null,
    isListening: false,
    isAnalyzing: false,
  });

  const advancedFeaturesService = AdvancedFeaturesService.getInstance();

  // 初始化
  useEffect(() => {
    if (userProgress?.userId) {
      loadUserData();
    }
  }, [userProgress?.userId]);

  const loadUserData = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载个性化配置
      const profile = advancedFeaturesService.getPersonalizationProfile(userProgress.userId);
      
      // 加载推荐
      const recommendations = advancedFeaturesService.getUserRecommendations(userProgress.userId);

      setState(prev => ({
        ...prev,
        personalizationProfile: profile,
        recommendations,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载用户数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // AI助手对话
  const chatWithAssistant = useCallback(async (
    assistantType: AIAssistantType,
    message: string,
    context?: any
  ) => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null,
        currentAssistant: assistantType
      }));

      const response = await advancedFeaturesService.chatWithAssistant(
        assistantType,
        message,
        context
      );

      // 更新对话历史
      const history = advancedFeaturesService.getConversationHistory(
        userProgress.userId,
        assistantType
      );

      setState(prev => ({
        ...prev,
        assistantResponse: response,
        conversationHistory: history,
        loading: false,
      }));

      return response;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'AI助手对话失败',
      }));
      return null;
    }
  }, [userProgress?.userId]);

  // 生成智能推荐
  const generateRecommendations = useCallback(async (type?: RecommendationType) => {
    if (!userProgress?.userId) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const recommendations = await advancedFeaturesService.generateSmartRecommendations(
        userProgress.userId,
        type
      );

      setState(prev => ({
        ...prev,
        recommendations,
        loading: false,
      }));

      return recommendations;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '生成推荐失败',
      }));
      return [];
    }
  }, [userProgress?.userId]);

  // 语音识别
  const recognizeVoice = useCallback(async (
    audioData: string,
    language: SupportedLanguage
  ) => {
    try {
      setState(prev => ({ ...prev, isListening: true, error: null }));

      const result = await advancedFeaturesService.recognizeVoice(audioData, language);

      setState(prev => ({
        ...prev,
        voiceRecognitionResult: result,
        isListening: false,
      }));

      return result;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isListening: false,
        error: error.message || '语音识别失败',
      }));
      return null;
    }
  }, []);

  // 文本分析
  const analyzeText = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

      const result = await advancedFeaturesService.analyzeText(text);

      setState(prev => ({
        ...prev,
        nlpAnalysisResult: result,
        isAnalyzing: false,
      }));

      return result;

    } catch (error) {
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: error.message || '文本分析失败',
      }));
      return null;
    }
  }, []);

  // 更新个性化配置
  const updatePersonalization = useCallback((updates: Partial<PersonalizationProfile>) => {
    if (!userProgress?.userId) return;

    advancedFeaturesService.updatePersonalizationProfile(userProgress.userId, updates);
    
    const updatedProfile = advancedFeaturesService.getPersonalizationProfile(userProgress.userId);
    
    setState(prev => ({
      ...prev,
      personalizationProfile: updatedProfile,
    }));
  }, [userProgress?.userId]);

  // 接受推荐
  const acceptRecommendation = useCallback((recommendationId: string) => {
    if (!userProgress?.userId) return;

    advancedFeaturesService.acceptRecommendation(userProgress.userId, recommendationId);
    
    const updatedRecommendations = advancedFeaturesService.getUserRecommendations(userProgress.userId);
    
    setState(prev => ({
      ...prev,
      recommendations: updatedRecommendations,
    }));
  }, [userProgress?.userId]);

  // 拒绝推荐
  const rejectRecommendation = useCallback((recommendationId: string) => {
    if (!userProgress?.userId) return;

    advancedFeaturesService.rejectRecommendation(userProgress.userId, recommendationId);
    
    const updatedRecommendations = advancedFeaturesService.getUserRecommendations(userProgress.userId);
    
    setState(prev => ({
      ...prev,
      recommendations: updatedRecommendations,
    }));
  }, [userProgress?.userId]);

  // 切换AI助手
  const switchAssistant = useCallback((assistantType: AIAssistantType) => {
    if (!userProgress?.userId) return;

    const history = advancedFeaturesService.getConversationHistory(
      userProgress.userId,
      assistantType
    );

    setState(prev => ({
      ...prev,
      currentAssistant: assistantType,
      conversationHistory: history,
      assistantResponse: null,
    }));
  }, [userProgress?.userId]);

  return {
    // 状态
    ...state,
    
    // AI助手功能
    chatWithAssistant,
    switchAssistant,
    
    // 智能推荐功能
    generateRecommendations,
    acceptRecommendation,
    rejectRecommendation,
    
    // 语音和NLP功能
    recognizeVoice,
    analyzeText,
    
    // 个性化功能
    updatePersonalization,
    
    // 便捷属性
    hasRecommendations: state.recommendations.length > 0,
    pendingRecommendations: state.recommendations.filter(r => r.status === 'pending').length,
    hasPersonalization: !!state.personalizationProfile,
    isAIActive: !!state.currentAssistant,
  };
};

/**
 * AI助手Hook
 */
export const useAIAssistant = (assistantType: AIAssistantType) => {
  const { userProgress } = useUserState();
  const [conversationHistory, setConversationHistory] = useState<AIAssistantResponse[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const advancedFeaturesService = AdvancedFeaturesService.getInstance();

  useEffect(() => {
    if (userProgress?.userId) {
      const history = advancedFeaturesService.getConversationHistory(
        userProgress.userId,
        assistantType
      );
      setConversationHistory(history);
    }
  }, [userProgress?.userId, assistantType]);

  const sendMessage = useCallback(async (message: string, context?: any) => {
    if (!userProgress?.userId) return null;

    try {
      setIsTyping(true);

      const response = await advancedFeaturesService.chatWithAssistant(
        assistantType,
        message,
        context
      );

      const updatedHistory = advancedFeaturesService.getConversationHistory(
        userProgress.userId,
        assistantType
      );
      
      setConversationHistory(updatedHistory);
      setIsTyping(false);

      return response;

    } catch (error) {
      setIsTyping(false);
      throw error;
    }
  }, [userProgress?.userId, assistantType]);

  return {
    conversationHistory,
    isTyping,
    sendMessage,
    assistantConfig: advancedFeaturesService.getAIAssistantConfig(assistantType),
  };
};

/**
 * 智能推荐Hook
 */
export const useSmartRecommendations = (type?: RecommendationType) => {
  const { userProgress } = useUserState();
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const advancedFeaturesService = AdvancedFeaturesService.getInstance();

  const loadRecommendations = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      const recs = await advancedFeaturesService.generateSmartRecommendations(
        userProgress.userId,
        type
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }, [userProgress?.userId, type]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const acceptRecommendation = useCallback((recommendationId: string) => {
    if (!userProgress?.userId) return;

    advancedFeaturesService.acceptRecommendation(userProgress.userId, recommendationId);
    loadRecommendations();
  }, [userProgress?.userId, loadRecommendations]);

  const rejectRecommendation = useCallback((recommendationId: string) => {
    if (!userProgress?.userId) return;

    advancedFeaturesService.rejectRecommendation(userProgress.userId, recommendationId);
    loadRecommendations();
  }, [userProgress?.userId, loadRecommendations]);

  return {
    recommendations,
    loading,
    acceptRecommendation,
    rejectRecommendation,
    reload: loadRecommendations,
  };
};

export default useAdvancedFeatures;
