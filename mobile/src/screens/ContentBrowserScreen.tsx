import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContentManagement, useContentSearch, useContentFilter } from '@/hooks/useContentManagement';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { ContentItem, ContentType, DifficultyLevel, ContentTheme } from '@/services/ContentManagementService';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * ContentBrowserScreen - V2 内容浏览界面
 * 提供完整的内容浏览体验：搜索、过滤、分类、推荐
 */
const ContentBrowserScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 内容管理
  const { 
    recommendations, 
    collections, 
    loadRecommendations, 
    loadCollections,
    getContentTypes,
    getDifficultyLevels,
    getContentThemes
  } = useContentManagement();

  // 搜索功能
  const { 
    query, 
    results, 
    loading: searching, 
    search, 
    clearSearch 
  } = useContentSearch();

  // 过滤功能
  const {
    filter,
    updateFilter,
    clearFilter,
    hasFilters,
    activeFilterCount
  } = useContentFilter();

  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'collections' | 'recommendations'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('内容浏览', '浏览学习内容和资源');
    
    // 初始化数据
    loadRecommendations();
    loadCollections();
    
    analyticsService.track('content_browser_viewed', {
      activeTab,
      timestamp: Date.now(),
    });
  }, []);

  const handleSearch = async (searchText: string) => {
    if (!searchText.trim()) {
      clearSearch();
      return;
    }
    
    await search(searchText, filter);
    setActiveTab('search');
    
    screenReader.announce(`搜索到${results?.total || 0}个结果`);
  };

  const handleContentPress = (content: ContentItem) => {
    navigation.navigate('ContentDetailScreen', { contentId: content.id });
    
    analyticsService.track('content_item_selected', {
      contentId: content.id,
      type: content.type,
      difficulty: content.metadata.difficulty,
      theme: content.metadata.theme,
      source: activeTab,
      timestamp: Date.now(),
    });
  };

  const renderTabBar = () => (
    <AccessibilityWrapper
      accessibilityRole="tablist"
      accessibilityLabel="内容浏览标签"
      applyHighContrast={true}
    >
      <View style={[styles.tabBar, getLayoutDirectionStyles()]}>
        {[
          { key: 'browse', label: '浏览', icon: '📚' },
          { key: 'search', label: '搜索', icon: '🔍' },
          { key: 'collections', label: '合集', icon: '📂' },
          { key: 'recommendations', label: '推荐', icon: '⭐' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton
            ]}
            onPress={() => {
              setActiveTab(tab.key as any);
              screenReader.announceButtonAction(tab.label, '已选择');
            }}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.activeTabLabel
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderSearchBar = () => (
    <AccessibilityWrapper
      accessibilityRole="search"
      accessibilityLabel="内容搜索"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <View style={[styles.searchContainer, getLayoutDirectionStyles()]}>
        <TextInput
          style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
          placeholder="搜索学习内容..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          accessible={true}
          accessibilityLabel="搜索输入框"
          accessibilityHint="输入关键词搜索学习内容"
        />
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(searchQuery)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="搜索"
        >
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasFilters && styles.activeFilterButton
          ]}
          onPress={() => setShowFilters(!showFilters)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`过滤器${hasFilters ? `，已应用${activeFilterCount}个过滤条件` : ''}`}
        >
          <Text style={styles.filterButtonText}>🎛</Text>
          {hasFilters && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderFilterPanel = () => {
    if (!showFilters) return null;

    const contentTypes = getContentTypes();
    const difficultyLevels = getDifficultyLevels();
    const themes = getContentThemes();

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="过滤选项"
        applyHighContrast={true}
      >
        <View style={styles.filterPanel}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>过滤条件</Text>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                clearFilter();
                screenReader.announce('过滤条件已清空');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="清空过滤条件"
            >
              <Text style={styles.clearFilterButtonText}>清空</Text>
            </TouchableOpacity>
          </View>
          
          {/* 内容类型过滤 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>内容类型</Text>
            <View style={styles.filterOptions}>
              {contentTypes.map((type) => (
                <TouchableOpacity
                  key={type.type}
                  style={[
                    styles.filterOption,
                    filter.type?.includes(type.type) && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    const currentTypes = filter.type || [];
                    const newTypes = currentTypes.includes(type.type)
                      ? currentTypes.filter(t => t !== type.type)
                      : [...currentTypes, type.type];
                    updateFilter({ type: newTypes.length > 0 ? newTypes : undefined });
                  }}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityLabel={type.name}
                  accessibilityState={{ checked: filter.type?.includes(type.type) || false }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filter.type?.includes(type.type) && styles.activeFilterOptionText
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 难度过滤 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>难度级别</Text>
            <View style={styles.filterOptions}>
              {difficultyLevels.map((level) => (
                <TouchableOpacity
                  key={level.level}
                  style={[
                    styles.filterOption,
                    filter.difficulty?.includes(level.level) && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    const currentLevels = filter.difficulty || [];
                    const newLevels = currentLevels.includes(level.level)
                      ? currentLevels.filter(l => l !== level.level)
                      : [...currentLevels, level.level];
                    updateFilter({ difficulty: newLevels.length > 0 ? newLevels : undefined });
                  }}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityLabel={level.name}
                  accessibilityState={{ checked: filter.difficulty?.includes(level.level) || false }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filter.difficulty?.includes(level.level) && styles.activeFilterOptionText
                  ]}>
                    {level.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* 主题过滤 */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>主题分类</Text>
            <View style={styles.filterOptions}>
              {themes.map((theme) => (
                <TouchableOpacity
                  key={theme.theme}
                  style={[
                    styles.filterOption,
                    filter.theme?.includes(theme.theme) && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    const currentThemes = filter.theme || [];
                    const newThemes = currentThemes.includes(theme.theme)
                      ? currentThemes.filter(t => t !== theme.theme)
                      : [...currentThemes, theme.theme];
                    updateFilter({ theme: newThemes.length > 0 ? newThemes : undefined });
                  }}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityLabel={theme.name}
                  accessibilityState={{ checked: filter.theme?.includes(theme.theme) || false }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filter.theme?.includes(theme.theme) && styles.activeFilterOptionText
                  ]}>
                    {theme.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderContentItem = ({ item }: { item: ContentItem }) => (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={`${item.title}，${item.type}，${item.metadata.difficulty}难度`}
      accessibilityHint="点击查看详情"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={styles.contentItem}
        onPress={() => handleContentPress(item)}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.contentItemHeader}>
          <Text style={styles.contentItemTitle}>{item.title}</Text>
          <View style={styles.contentItemBadges}>
            {item.featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredBadgeText}>精选</Text>
              </View>
            )}
            {item.premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>会员</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.contentItemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.contentItemMeta}>
          <Text style={styles.contentItemType}>
            {getContentTypes().find(t => t.type === item.type)?.name || item.type}
          </Text>
          <Text style={styles.contentItemDifficulty}>
            {getDifficultyLevels().find(d => d.level === item.metadata.difficulty)?.name || item.metadata.difficulty}
          </Text>
          <Text style={styles.contentItemDuration}>
            {Math.ceil(item.metadata.duration / 60)}分钟
          </Text>
          <Text style={styles.contentItemRating}>
            ⭐ {item.learningData.averageScore}
          </Text>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderBrowseTab = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="内容浏览"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>热门内容</Text>
        <Text style={styles.sectionDescription}>
          最受欢迎的学习内容
        </Text>
        
        {/* 这里会显示热门内容列表 */}
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            热门内容加载中...
          </Text>
        </View>
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderSearchTab = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="搜索结果"
      applyHighContrast={true}
    >
      <View style={styles.tabContent}>
        {results && results.items.length > 0 ? (
          <FlatList
            data={results.items}
            renderItem={renderContentItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <Text style={styles.searchResultsHeader}>
                找到 {results.total} 个结果
              </Text>
            )}
          />
        ) : searching ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>搜索中...</Text>
          </View>
        ) : query ? (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              没有找到相关内容
            </Text>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              输入关键词开始搜索
            </Text>
          </View>
        )}
      </View>
    </AccessibilityWrapper>
  );

  const renderCollectionsTab = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="内容合集列表"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>学习合集</Text>
        <Text style={styles.sectionDescription}>
          精心组织的学习内容合集
        </Text>
        
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={styles.collectionItem}
            onPress={() => navigation.navigate('CollectionDetailScreen', { collectionId: collection.id })}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${collection.name}合集，包含${collection.contentIds.length}个内容`}
          >
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>{collection.name}</Text>
              <Text style={styles.collectionCount}>
                {collection.contentIds.length} 项
              </Text>
            </View>
            <Text style={styles.collectionDescription} numberOfLines={2}>
              {collection.description}
            </Text>
            <View style={styles.collectionMeta}>
              <Text style={styles.collectionDuration}>
                ⏱ {Math.ceil(collection.estimatedDuration / 60)} 分钟
              </Text>
              <Text style={styles.collectionReward}>
                🏆 {collection.completionReward} 积分
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderRecommendationsTab = () => (
    <AccessibilityWrapper
      accessibilityRole="list"
      accessibilityLabel="推荐内容列表"
      applyHighContrast={true}
    >
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>为您推荐</Text>
        <Text style={styles.sectionDescription}>
          基于您的学习进度和兴趣推荐
        </Text>
        
        {recommendations.map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationReason}>
                {rec.reason === 'popular' ? '🔥 热门推荐' :
                 rec.reason === 'difficulty_match' ? '🎯 难度匹配' :
                 rec.reason === 'learning_path' ? '📈 学习路径' : '💡 智能推荐'}
              </Text>
              <Text style={styles.recommendationScore}>
                {Math.round(rec.score * 100)}%
              </Text>
            </View>
            <Text style={styles.recommendationExplanation}>
              {rec.explanation}
            </Text>
          </View>
        ))}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'browse': return renderBrowseTab();
      case 'search': return renderSearchTab();
      case 'collections': return renderCollectionsTab();
      case 'recommendations': return renderRecommendationsTab();
      default: return renderBrowseTab();
    }
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="内容浏览页面头部"
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
          <Text style={styles.headerTitle}>内容浏览</Text>
          <View style={styles.placeholder} />
        </View>
      </AccessibilityWrapper>

      {/* 搜索栏 */}
      {renderSearchBar()}

      {/* 过滤面板 */}
      {renderFilterPanel()}

      {/* 标签栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      {renderTabContent()}
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
  placeholder: {
    width: 40,
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
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchButtonText: {
    fontSize: 16,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filterPanel: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  clearFilterButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  clearFilterButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterOption: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeFilterOptionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: '#eff6ff',
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabLabel: {
    color: '#3b82f6',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  searchResultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  contentItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  contentItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  contentItemBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  featuredBadge: {
    backgroundColor: '#f59e0b',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumBadge: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  contentItemDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentItemMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  contentItemType: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  contentItemDifficulty: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  contentItemDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  contentItemRating: {
    fontSize: 12,
    color: '#f59e0b',
  },
  collectionItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  collectionCount: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  collectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  collectionMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  collectionDuration: {
    fontSize: 12,
    color: '#64748b',
  },
  collectionReward: {
    fontSize: 12,
    color: '#f59e0b',
  },
  recommendationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  recommendationScore: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  recommendationExplanation: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default ContentBrowserScreen;
