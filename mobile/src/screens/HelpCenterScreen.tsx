import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HelpFeedbackService, { HelpContent, FAQItem, HelpCategory } from '@/services/HelpFeedbackService';
import { useUserState } from '@/contexts/UserStateContext';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * HelpCenterScreen - V2 帮助中心界面
 * 提供完整的用户帮助系统：分类浏览、搜索、FAQ、智能建议
 */
const HelpCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProgress } = useUserState();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [helpContent, setHelpContent] = useState<HelpContent[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<HelpContent[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const helpFeedbackService = HelpFeedbackService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    loadHelpData();
    
    // 页面变化公告
    screenReader.announcePageChange('帮助中心', '浏览帮助文档和常见问题');
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryContent(selectedCategory);
    }
  }, [selectedCategory]);

  const loadHelpData = async () => {
    try {
      setLoading(true);
      
      const [helpData, faqData] = await Promise.all([
        helpFeedbackService.getHelpContent(),
        helpFeedbackService.getFAQs(),
      ]);
      
      setHelpContent(helpData);
      setFaqs(faqData);
      
      analyticsService.track('help_center_viewed', {
        userId: userProgress?.userId,
        helpContentCount: helpData.length,
        faqCount: faqData.length,
        timestamp: Date.now(),
      });
      
    } catch (error) {
      console.error('Error loading help data:', error);
      Alert.alert('错误', '加载帮助内容失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryContent = async (category: HelpCategory) => {
    try {
      const [categoryHelp, categoryFAQs] = await Promise.all([
        helpFeedbackService.getHelpContent(category),
        helpFeedbackService.getFAQs(category),
      ]);
      
      setHelpContent(categoryHelp);
      setFaqs(categoryFAQs);
      
      const categoryName = helpFeedbackService.getHelpCategories()
        .find(cat => cat.category === category)?.name || category;
      
      screenReader.announce(`已切换到${categoryName}分类`);
      
    } catch (error) {
      console.error('Error loading category content:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearch(false);
      return;
    }
    
    try {
      const results = await helpFeedbackService.searchHelpContent(query);
      setSearchResults(results);
      setShowSearch(true);
      
      screenReader.announce(`搜索到${results.length}个相关结果`);
      
    } catch (error) {
      console.error('Error searching help content:', error);
    }
  };

  const handleHelpItemPress = async (item: HelpContent) => {
    try {
      // 获取完整内容
      const fullContent = await helpFeedbackService.getHelpContentById(item.id);
      if (fullContent) {
        // 导航到帮助详情页面
        navigation.navigate('HelpDetailScreen', { helpContent: fullContent });
        
        screenReader.announceButtonAction('帮助文章', '已打开');
      }
    } catch (error) {
      console.error('Error opening help item:', error);
    }
  };

  const handleFAQPress = (faq: FAQItem) => {
    Alert.alert(faq.question, faq.answer, [
      { text: '关闭', style: 'cancel' },
      { text: '有帮助', onPress: () => screenReader.announceSuccess('感谢您的反馈') },
    ]);
    
    screenReader.announceButtonAction('常见问题', '已展开');
  };

  const renderSearchBar = () => (
    <AccessibilityWrapper
      accessibilityRole="search"
      accessibilityLabel="搜索帮助内容"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索帮助内容..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            handleSearch(text);
          }}
          accessible={true}
          accessibilityLabel="搜索输入框"
          accessibilityHint="输入关键词搜索帮助内容"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowSearch(false);
              screenReader.announce('搜索已清空');
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="清空搜索"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderCategories = () => {
    const categories = helpFeedbackService.getHelpCategories();
    
    return (
      <AccessibilityWrapper
        accessibilityRole="tablist"
        accessibilityLabel="帮助分类"
        applyHighContrast={true}
      >
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>帮助分类</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && styles.activeCategoryButton
              ]}
              onPress={() => {
                setSelectedCategory(null);
                loadHelpData();
                screenReader.announceButtonAction('全部分类', '已选择');
              }}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="全部分类"
              accessibilityState={{ selected: !selectedCategory }}
            >
              <Text style={[
                styles.categoryButtonText,
                !selectedCategory && styles.activeCategoryButtonText
              ]}>
                全部
              </Text>
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category.category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.category && styles.activeCategoryButton
                ]}
                onPress={() => {
                  setSelectedCategory(category.category);
                  screenReader.announceButtonAction(category.name, '已选择');
                }}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={category.name}
                accessibilityHint={category.description}
                accessibilityState={{ selected: selectedCategory === category.category }}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.category && styles.activeCategoryButtonText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderHelpContent = (content: HelpContent[]) => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="帮助文章列表"
      applyHighContrast={true}
    >
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          帮助文章 ({content.length})
        </Text>
        {content.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.helpItem}
            onPress={() => handleHelpItemPress(item)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`帮助文章：${item.title}`}
            accessibilityHint={`难度：${item.difficulty}，评分：${item.helpfulness.toFixed(1)}星`}
          >
            <View style={styles.helpItemContent}>
              <Text style={styles.helpItemTitle}>{item.title}</Text>
              <Text style={styles.helpItemDescription} numberOfLines={2}>
                {item.content}
              </Text>
              <View style={styles.helpItemMeta}>
                <Text style={styles.helpItemDifficulty}>
                  {item.difficulty === 'beginner' ? '初级' : 
                   item.difficulty === 'intermediate' ? '中级' : '高级'}
                </Text>
                <Text style={styles.helpItemRating}>
                  ⭐ {item.helpfulness.toFixed(1)}
                </Text>
                <Text style={styles.helpItemViews}>
                  👁 {item.viewCount}
                </Text>
              </View>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderFAQs = (faqList: FAQItem[]) => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="常见问题列表"
      applyHighContrast={true}
    >
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>
          常见问题 ({faqList.length})
        </Text>
        {faqList.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqItem}
            onPress={() => handleFAQPress(faq)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`常见问题：${faq.question}`}
            accessibilityHint="点击查看答案"
          >
            <View style={styles.faqContent}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqPopularity}>
                🔥 热度: {faq.popularity}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderQuickActions = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="快速操作"
      applyHighContrast={true}
      applyExtendedTouchTarget={true}
    >
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>快速操作</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('FeedbackScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="提交反馈"
            accessibilityHint="报告问题或提出建议"
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionText}>提交反馈</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('ContactSupportScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="联系客服"
            accessibilityHint="获得人工客服帮助"
          >
            <Text style={styles.quickActionIcon}>🎧</Text>
            <Text style={styles.quickActionText}>联系客服</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('AccessibilitySettingsScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="无障碍设置"
            accessibilityHint="配置无障碍功能"
          >
            <Text style={styles.quickActionIcon}>♿</Text>
            <Text style={styles.quickActionText}>无障碍设置</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('TutorialScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="使用教程"
            accessibilityHint="观看应用使用教程"
          >
            <Text style={styles.quickActionIcon}>🎥</Text>
            <Text style={styles.quickActionText}>使用教程</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载帮助内容...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="帮助中心页面头部"
        applyHighContrast={true}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>帮助中心</Text>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => navigation.navigate('FeedbackScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="反馈"
            accessibilityHint="提交问题反馈"
          >
            <Text style={styles.feedbackButtonText}>💬</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 搜索栏 */}
        {renderSearchBar()}

        {/* 分类选择 */}
        {!showSearch && renderCategories()}

        {/* 快速操作 */}
        {!showSearch && renderQuickActions()}

        {/* 搜索结果 */}
        {showSearch && searchResults.length > 0 && (
          <View>
            <Text style={styles.searchResultsTitle}>
              搜索结果 ({searchResults.length})
            </Text>
            {renderHelpContent(searchResults)}
          </View>
        )}

        {/* 搜索无结果 */}
        {showSearch && searchResults.length === 0 && searchQuery.trim() && (
          <AccessibilityWrapper applyHighContrast={true}>
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                没有找到相关内容
              </Text>
              <Text style={styles.noResultsHint}>
                尝试使用不同的关键词，或浏览下方的分类内容
              </Text>
            </View>
          </AccessibilityWrapper>
        )}

        {/* 帮助内容 */}
        {!showSearch && helpContent.length > 0 && renderHelpContent(helpContent)}

        {/* FAQ */}
        {!showSearch && faqs.length > 0 && renderFAQs(faqs)}

        {/* 底部说明 */}
        <AccessibilityWrapper applyHighContrast={true}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 如果您没有找到需要的帮助，请联系我们的客服团队获得更多支持。
            </Text>
          </View>
        </AccessibilityWrapper>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
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
  feedbackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#64748b',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    marginLeft: 16,
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
  quickActionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 8,
  },
  helpItemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  helpItemDifficulty: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  helpItemRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  helpItemViews: {
    fontSize: 12,
    color: '#64748b',
  },
  chevron: {
    fontSize: 18,
    color: '#94a3b8',
    marginLeft: 8,
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  faqPopularity: {
    fontSize: 12,
    color: '#ef4444',
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  noResultsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    alignItems: 'center',
    margin: 16,
    borderRadius: 12,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  noResultsHint: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HelpCenterScreen;
