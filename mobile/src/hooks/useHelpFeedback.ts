/**
 * useHelpFeedback - V2 帮助和反馈Hook
 * 提供组件级别的帮助和反馈功能
 * 自动处理智能建议、快速反馈和用户支持
 */

import { useEffect, useCallback, useState } from 'react';
import HelpFeedbackService, { 
  HelpContent, 
  FAQItem, 
  FeedbackItem, 
  FeedbackType, 
  HelpCategory 
} from '@/services/HelpFeedbackService';
import { useUserState } from '@/contexts/UserStateContext';
import { useAccessibility } from './useAccessibility';

interface HelpFeedbackState {
  helpContent: HelpContent[];
  faqs: FAQItem[];
  userFeedback: FeedbackItem[];
  loading: boolean;
  error: string | null;
}

interface SmartSuggestion {
  type: 'help_article' | 'faq' | 'tutorial' | 'contact_support';
  title: string;
  description: string;
  actionUrl?: string;
  confidence: number;
}

interface QuickFeedbackOptions {
  type: FeedbackType;
  category: HelpCategory;
  context?: string;
  autoSubmit?: boolean;
}

/**
 * 帮助和反馈Hook
 */
export const useHelpFeedback = () => {
  const { userProgress } = useUserState();
  const accessibility = useAccessibility();
  const [state, setState] = useState<HelpFeedbackState>({
    helpContent: [],
    faqs: [],
    userFeedback: [],
    loading: false,
    error: null,
  });

  const helpFeedbackService = HelpFeedbackService.getInstance();

  // 加载帮助内容
  const loadHelpContent = useCallback(async (category?: HelpCategory) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const content = await helpFeedbackService.getHelpContent(category);
      
      setState(prev => ({
        ...prev,
        helpContent: content,
        loading: false,
      }));
      
      return content;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载帮助内容失败',
      }));
      return [];
    }
  }, []);

  // 加载FAQ
  const loadFAQs = useCallback(async (category?: HelpCategory) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const faqs = await helpFeedbackService.getFAQs(category);
      
      setState(prev => ({
        ...prev,
        faqs,
        loading: false,
      }));
      
      return faqs;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载FAQ失败',
      }));
      return [];
    }
  }, []);

  // 搜索帮助内容
  const searchHelp = useCallback(async (query: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [helpResults, faqResults] = await Promise.all([
        helpFeedbackService.searchHelpContent(query),
        helpFeedbackService.searchFAQs(query),
      ]);
      
      setState(prev => ({
        ...prev,
        helpContent: helpResults,
        faqs: faqResults,
        loading: false,
      }));
      
      return { helpResults, faqResults };
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '搜索失败',
      }));
      return { helpResults: [], faqResults: [] };
    }
  }, []);

  // 获取智能建议
  const getSmartSuggestions = useCallback(async (
    context: string, 
    userIssue?: string
  ): Promise<SmartSuggestion[]> => {
    try {
      return await helpFeedbackService.getSmartSuggestions(context, userIssue);
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      return [];
    }
  }, []);

  // 提交反馈
  const submitFeedback = useCallback(async (
    feedbackData: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'deviceInfo' | 'appVersion'>
  ): Promise<string | null> => {
    if (!userProgress?.userId) {
      throw new Error('用户未登录');
    }

    try {
      const feedbackId = await helpFeedbackService.submitFeedback({
        ...feedbackData,
        userId: userProgress.userId,
      });
      
      // 更新用户反馈列表
      if (userProgress.userId) {
        const updatedFeedback = await helpFeedbackService.getUserFeedback(userProgress.userId);
        setState(prev => ({
          ...prev,
          userFeedback: updatedFeedback,
        }));
      }
      
      // 无障碍反馈
      accessibility.announceForScreenReader('反馈提交成功', 'assertive');
      
      return feedbackId;
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      accessibility.announceForScreenReader('反馈提交失败', 'assertive');
      throw error;
    }
  }, [userProgress?.userId, accessibility]);

  // 快速反馈
  const quickFeedback = useCallback(async (
    title: string,
    description: string,
    options: QuickFeedbackOptions
  ): Promise<string | null> => {
    if (!userProgress?.userId) {
      throw new Error('用户未登录');
    }

    const feedbackData = {
      type: options.type,
      title,
      description: options.context ? `${description}\n\n上下文: ${options.context}` : description,
      category: options.category,
      priority: 'medium' as const,
      status: 'submitted' as const,
      userId: userProgress.userId,
    };

    return await submitFeedback(feedbackData);
  }, [userProgress?.userId, submitFeedback]);

  // 加载用户反馈历史
  const loadUserFeedback = useCallback(async () => {
    if (!userProgress?.userId) return [];

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const feedback = await helpFeedbackService.getUserFeedback(userProgress.userId);
      
      setState(prev => ({
        ...prev,
        userFeedback: feedback,
        loading: false,
      }));
      
      return feedback;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载反馈历史失败',
      }));
      return [];
    }
  }, [userProgress?.userId]);

  // 评价帮助内容
  const rateHelpContent = useCallback(async (contentId: string, rating: number) => {
    try {
      await helpFeedbackService.rateHelpContent(contentId, rating);
      
      // 更新本地状态
      setState(prev => ({
        ...prev,
        helpContent: prev.helpContent.map(item =>
          item.id === contentId
            ? { ...item, helpfulness: (item.helpfulness + rating) / 2 }
            : item
        ),
      }));
      
      accessibility.announceForScreenReader(`已评价${rating}星`, 'polite');
      
    } catch (error) {
      console.error('Error rating help content:', error);
      accessibility.announceForScreenReader('评价失败', 'assertive');
    }
  }, [accessibility]);

  return {
    // 状态
    ...state,
    
    // 帮助功能
    loadHelpContent,
    loadFAQs,
    searchHelp,
    getSmartSuggestions,
    rateHelpContent,
    
    // 反馈功能
    submitFeedback,
    quickFeedback,
    loadUserFeedback,
    
    // 便捷方法
    getHelpCategories: helpFeedbackService.getHelpCategories.bind(helpFeedbackService),
    getFeedbackTypes: helpFeedbackService.getFeedbackTypes.bind(helpFeedbackService),
  };
};

/**
 * 智能帮助建议Hook
 */
export const useSmartHelp = (context: string) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  
  const helpFeedbackService = HelpFeedbackService.getInstance();

  const getSuggestions = useCallback(async (userIssue?: string) => {
    try {
      setLoading(true);
      const results = await helpFeedbackService.getSmartSuggestions(context, userIssue);
      setSuggestions(results);
    } catch (error) {
      console.error('Error getting smart suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    getSuggestions();
  }, [getSuggestions]);

  return {
    suggestions,
    loading,
    refresh: getSuggestions,
  };
};

/**
 * 快速反馈Hook
 */
export const useQuickFeedback = () => {
  const { submitFeedback } = useHelpFeedback();
  const { userProgress } = useUserState();
  const accessibility = useAccessibility();

  const reportBug = useCallback(async (
    description: string,
    context?: string
  ): Promise<string | null> => {
    if (!userProgress?.userId) return null;

    return await submitFeedback({
      type: 'bug_report',
      title: '错误报告',
      description: context ? `${description}\n\n发生位置: ${context}` : description,
      category: 'technical_issues',
      priority: 'high',
      status: 'submitted',
      userId: userProgress.userId,
    });
  }, [submitFeedback, userProgress?.userId]);

  const suggestFeature = useCallback(async (
    title: string,
    description: string
  ): Promise<string | null> => {
    if (!userProgress?.userId) return null;

    return await submitFeedback({
      type: 'feature_request',
      title,
      description,
      category: 'features',
      priority: 'medium',
      status: 'submitted',
      userId: userProgress.userId,
    });
  }, [submitFeedback, userProgress?.userId]);

  const reportAccessibilityIssue = useCallback(async (
    description: string,
    context?: string
  ): Promise<string | null> => {
    if (!userProgress?.userId) return null;

    return await submitFeedback({
      type: 'accessibility_issue',
      title: '无障碍问题',
      description: context ? `${description}\n\n发生位置: ${context}` : description,
      category: 'accessibility',
      priority: 'high',
      status: 'submitted',
      userId: userProgress.userId,
    });
  }, [submitFeedback, userProgress?.userId]);

  const reportPerformanceIssue = useCallback(async (
    description: string,
    performanceData?: any
  ): Promise<string | null> => {
    if (!userProgress?.userId) return null;

    const fullDescription = performanceData 
      ? `${description}\n\n性能数据: ${JSON.stringify(performanceData, null, 2)}`
      : description;

    return await submitFeedback({
      type: 'performance_issue',
      title: '性能问题',
      description: fullDescription,
      category: 'technical_issues',
      priority: 'medium',
      status: 'submitted',
      userId: userProgress.userId,
    });
  }, [submitFeedback, userProgress?.userId]);

  return {
    reportBug,
    suggestFeature,
    reportAccessibilityIssue,
    reportPerformanceIssue,
  };
};

/**
 * 上下文帮助Hook
 */
export const useContextualHelp = (screenName: string) => {
  const { getSmartSuggestions } = useHelpFeedback();
  const [contextHelp, setContextHelp] = useState<SmartSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContextHelp = async () => {
      try {
        setLoading(true);
        const suggestions = await getSmartSuggestions(screenName);
        setContextHelp(suggestions);
      } catch (error) {
        console.error('Error loading contextual help:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContextHelp();
  }, [screenName, getSmartSuggestions]);

  return {
    contextHelp,
    loading,
  };
};

export default useHelpFeedback;
