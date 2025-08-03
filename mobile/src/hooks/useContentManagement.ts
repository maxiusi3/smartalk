/**
 * useContentManagement - V2 内容管理Hook
 * 提供组件级别的内容管理功能
 * 自动处理内容加载、搜索、推荐和缓存
 */

import { useEffect, useCallback, useState } from 'react';
import ContentManagementService, { 
  ContentItem, 
  ContentCollection, 
  ContentFilter, 
  ContentSearchResult,
  ContentType,
  DifficultyLevel,
  ContentTheme
} from '@/services/ContentManagementService';
import { useUserState } from '@/contexts/UserStateContext';

interface ContentManagementState {
  // 内容数据
  currentContent: ContentItem | null;
  searchResults: ContentSearchResult | null;
  recommendations: any[];
  collections: ContentCollection[];
  
  // 加载状态
  loading: boolean;
  searching: boolean;
  loadingRecommendations: boolean;
  
  // 错误状态
  error: string | null;
  searchError: string | null;
}

interface SearchOptions {
  query?: string;
  filter?: ContentFilter;
  page?: number;
  pageSize?: number;
}

/**
 * 内容管理Hook
 */
export const useContentManagement = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<ContentManagementState>({
    currentContent: null,
    searchResults: null,
    recommendations: [],
    collections: [],
    loading: false,
    searching: false,
    loadingRecommendations: false,
    error: null,
    searchError: null,
  });

  const contentService = ContentManagementService.getInstance();

  // 加载内容项目
  const loadContent = useCallback(async (contentId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const content = await contentService.getContentItem(contentId);
      
      setState(prev => ({
        ...prev,
        currentContent: content,
        loading: false,
      }));
      
      return content;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载内容失败',
      }));
      return null;
    }
  }, []);

  // 搜索内容
  const searchContent = useCallback(async (options: SearchOptions = {}) => {
    try {
      setState(prev => ({ ...prev, searching: true, searchError: null }));
      
      const {
        query = '',
        filter = {},
        page = 1,
        pageSize = 20
      } = options;
      
      const results = await contentService.searchContent(query, filter, page, pageSize);
      
      setState(prev => ({
        ...prev,
        searchResults: results,
        searching: false,
      }));
      
      return results;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        searching: false,
        searchError: error.message || '搜索失败',
      }));
      return null;
    }
  }, []);

  // 加载推荐内容
  const loadRecommendations = useCallback(async (limit: number = 10) => {
    if (!userProgress?.userId) return [];

    try {
      setState(prev => ({ ...prev, loadingRecommendations: true }));
      
      const recommendations = await contentService.getRecommendedContent(userProgress.userId, limit);
      
      setState(prev => ({
        ...prev,
        recommendations,
        loadingRecommendations: false,
      }));
      
      return recommendations;
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        loadingRecommendations: false,
      }));
      return [];
    }
  }, [userProgress?.userId]);

  // 加载内容集合
  const loadCollections = useCallback(async () => {
    try {
      const collections = await contentService.getAllCollections();
      
      setState(prev => ({
        ...prev,
        collections,
      }));
      
      return collections;
      
    } catch (error) {
      console.error('Error loading collections:', error);
      return [];
    }
  }, []);

  // 获取单个集合
  const getCollection = useCallback(async (collectionId: string) => {
    try {
      return await contentService.getContentCollection(collectionId);
    } catch (error) {
      console.error('Error getting collection:', error);
      return null;
    }
  }, []);

  // 预加载内容
  const preloadContent = useCallback(async (contentIds: string[]) => {
    try {
      await contentService.preloadContent(contentIds);
    } catch (error) {
      console.error('Error preloading content:', error);
    }
  }, []);

  // 清理缓存
  const clearCache = useCallback(async () => {
    try {
      await contentService.clearCache();
      setState({
        currentContent: null,
        searchResults: null,
        recommendations: [],
        collections: [],
        loading: false,
        searching: false,
        loadingRecommendations: false,
        error: null,
        searchError: null,
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }, []);

  return {
    // 状态
    ...state,
    
    // 方法
    loadContent,
    searchContent,
    loadRecommendations,
    loadCollections,
    getCollection,
    preloadContent,
    clearCache,
    
    // 便捷方法
    getContentTypes: contentService.getContentTypes.bind(contentService),
    getDifficultyLevels: contentService.getDifficultyLevels.bind(contentService),
    getContentThemes: contentService.getContentThemes.bind(contentService),
  };
};

/**
 * 内容搜索Hook
 */
export const useContentSearch = () => {
  const [searchState, setSearchState] = useState({
    query: '',
    filter: {} as ContentFilter,
    results: null as ContentSearchResult | null,
    loading: false,
    error: null as string | null,
  });

  const contentService = ContentManagementService.getInstance();

  const search = useCallback(async (
    query: string,
    filter: ContentFilter = {},
    page: number = 1,
    pageSize: number = 20
  ) => {
    try {
      setSearchState(prev => ({ ...prev, loading: true, error: null }));
      
      const results = await contentService.searchContent(query, filter, page, pageSize);
      
      setSearchState(prev => ({
        ...prev,
        query,
        filter,
        results,
        loading: false,
      }));
      
      return results;
      
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '搜索失败',
      }));
      return null;
    }
  }, []);

  const updateFilter = useCallback((newFilter: Partial<ContentFilter>) => {
    setSearchState(prev => ({
      ...prev,
      filter: { ...prev.filter, ...newFilter },
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState({
      query: '',
      filter: {},
      results: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...searchState,
    search,
    updateFilter,
    clearSearch,
  };
};

/**
 * 内容推荐Hook
 */
export const useContentRecommendations = (limit: number = 10) => {
  const { userProgress } = useUserState();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentService = ContentManagementService.getInstance();

  const loadRecommendations = useCallback(async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      setError(null);
      
      const recs = await contentService.getRecommendedContent(userProgress.userId, limit);
      setRecommendations(recs);
      
    } catch (err) {
      setError(err.message || '加载推荐失败');
    } finally {
      setLoading(false);
    }
  }, [userProgress?.userId, limit]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    reload: loadRecommendations,
  };
};

/**
 * 内容集合Hook
 */
export const useContentCollections = () => {
  const [collections, setCollections] = useState<ContentCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentService = ContentManagementService.getInstance();

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const cols = await contentService.getAllCollections();
      setCollections(cols);
      
    } catch (err) {
      setError(err.message || '加载集合失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollection = useCallback(async (id: string) => {
    try {
      return await contentService.getContentCollection(id);
    } catch (error) {
      console.error('Error getting collection:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  return {
    collections,
    loading,
    error,
    reload: loadCollections,
    getCollection,
  };
};

/**
 * 内容过滤Hook
 */
export const useContentFilter = () => {
  const [filter, setFilter] = useState<ContentFilter>({});

  const updateFilter = useCallback((updates: Partial<ContentFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilter = useCallback(() => {
    setFilter({});
  }, []);

  const setContentType = useCallback((types: ContentType[]) => {
    updateFilter({ type: types });
  }, [updateFilter]);

  const setDifficulty = useCallback((difficulties: DifficultyLevel[]) => {
    updateFilter({ difficulty: difficulties });
  }, [updateFilter]);

  const setTheme = useCallback((themes: ContentTheme[]) => {
    updateFilter({ theme: themes });
  }, [updateFilter]);

  const setTags = useCallback((tags: string[]) => {
    updateFilter({ tags });
  }, [updateFilter]);

  const setDuration = useCallback((min: number, max: number) => {
    updateFilter({ duration: { min, max } });
  }, [updateFilter]);

  const setRating = useCallback((min: number, max: number) => {
    updateFilter({ rating: { min, max } });
  }, [updateFilter]);

  const setFeatured = useCallback((featured: boolean) => {
    updateFilter({ featured });
  }, [updateFilter]);

  const setPremium = useCallback((premium: boolean) => {
    updateFilter({ premium });
  }, [updateFilter]);

  return {
    filter,
    updateFilter,
    clearFilter,
    setContentType,
    setDifficulty,
    setTheme,
    setTags,
    setDuration,
    setRating,
    setFeatured,
    setPremium,
    
    // 便捷检查方法
    hasFilters: Object.keys(filter).length > 0,
    activeFilterCount: Object.keys(filter).length,
  };
};

/**
 * 内容统计Hook
 */
export const useContentStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contentService = ContentManagementService.getInstance();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contentStats = await contentService.getContentStats();
      setStats(contentStats);
      
    } catch (err) {
      setError(err.message || '加载统计失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    reload: loadStats,
  };
};

export default useContentManagement;
