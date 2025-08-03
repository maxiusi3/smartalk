/**
 * useContentCreator - V2 内容创作者Hook
 * 提供组件级别的内容创作功能
 * 自动处理项目管理、资产上传、质量验证
 */

import { useEffect, useCallback, useState } from 'react';
import ContentCreatorService, { 
  CreatorProject,
  AssetItem,
  ContentTemplate,
  BatchOperation,
  QualityReport,
  AssetType
} from '@/services/ContentCreatorService';
import { useUserState } from '@/contexts/UserStateContext';

// 内容创作状态
interface ContentCreatorState {
  // 项目管理
  projects: CreatorProject[];
  currentProject: CreatorProject | null;
  
  // 资产管理
  assets: AssetItem[];
  
  // 模板
  templates: ContentTemplate[];
  
  // 批量操作
  batchOperations: BatchOperation[];
  currentBatchOperation: BatchOperation | null;
  
  // 质量报告
  qualityReport: QualityReport | null;
  
  // 状态
  loading: boolean;
  error: string | null;
  uploading: boolean;
  validating: boolean;
}

/**
 * 内容创作者Hook
 */
export const useContentCreator = () => {
  const { userProgress } = useUserState();
  const [state, setState] = useState<ContentCreatorState>({
    projects: [],
    currentProject: null,
    assets: [],
    templates: [],
    batchOperations: [],
    currentBatchOperation: null,
    qualityReport: null,
    loading: false,
    error: null,
    uploading: false,
    validating: false,
  });

  const contentCreatorService = ContentCreatorService.getInstance();

  // 初始化
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 加载模板
      const templates = contentCreatorService.getTemplates();
      
      // 加载用户项目
      const projects = userProgress?.userId 
        ? contentCreatorService.getProjects(userProgress.userId)
        : [];

      setState(prev => ({
        ...prev,
        templates,
        projects,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '加载数据失败',
      }));
    }
  }, [userProgress?.userId]);

  // 创建项目
  const createProject = useCallback(async (
    name: string,
    description: string,
    templateId: string
  ) => {
    if (!userProgress?.userId) return null;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const project = await contentCreatorService.createProject(
        name,
        description,
        templateId,
        {
          id: userProgress.userId,
          name: userProgress.userName || 'User',
          role: 'creator',
        }
      );

      setState(prev => ({
        ...prev,
        projects: [...prev.projects, project],
        currentProject: project,
        loading: false,
      }));

      return project;

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '创建项目失败',
      }));
      return null;
    }
  }, [userProgress]);

  // 选择项目
  const selectProject = useCallback((projectId: string) => {
    const project = contentCreatorService.getProject(projectId);
    const assets = contentCreatorService.getProjectAssets(projectId);
    const qualityReport = contentCreatorService.getQualityReport(projectId);

    setState(prev => ({
      ...prev,
      currentProject: project,
      assets,
      qualityReport,
    }));
  }, []);

  // 上传资产
  const uploadAsset = useCallback(async (
    projectId: string,
    file: {
      name: string;
      type: AssetType;
      data: string;
      size: number;
      metadata?: any;
    }
  ) => {
    try {
      setState(prev => ({ ...prev, uploading: true, error: null }));

      const asset = await contentCreatorService.uploadAsset(projectId, file);

      // 更新资产列表
      const updatedAssets = contentCreatorService.getProjectAssets(projectId);
      
      // 更新项目信息
      const updatedProject = contentCreatorService.getProject(projectId);

      setState(prev => ({
        ...prev,
        assets: updatedAssets,
        currentProject: updatedProject,
        uploading: false,
      }));

      return asset;

    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || '上传资产失败',
      }));
      return null;
    }
  }, []);

  // 批量上传
  const startBatchUpload = useCallback(async (
    projectId: string,
    files: { name: string; type: AssetType; data: string; size: number }[]
  ) => {
    try {
      setState(prev => ({ ...prev, uploading: true, error: null }));

      const operation = await contentCreatorService.startBatchUpload(projectId, files);

      setState(prev => ({
        ...prev,
        currentBatchOperation: operation,
        batchOperations: [...prev.batchOperations, operation],
        uploading: false,
      }));

      // 定期检查批量操作状态
      const checkInterval = setInterval(() => {
        const updatedOperation = contentCreatorService.getBatchOperation(operation.id);
        if (updatedOperation) {
          setState(prev => ({
            ...prev,
            currentBatchOperation: updatedOperation,
            batchOperations: prev.batchOperations.map(op => 
              op.id === operation.id ? updatedOperation : op
            ),
          }));

          if (updatedOperation.status === 'completed' || updatedOperation.status === 'failed') {
            clearInterval(checkInterval);
            
            // 更新资产列表
            const updatedAssets = contentCreatorService.getProjectAssets(projectId);
            const updatedProject = contentCreatorService.getProject(projectId);
            
            setState(prev => ({
              ...prev,
              assets: updatedAssets,
              currentProject: updatedProject,
            }));
          }
        }
      }, 1000);

      return operation;

    } catch (error) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: error.message || '批量上传失败',
      }));
      return null;
    }
  }, []);

  // 生成质量报告
  const generateQualityReport = useCallback(async (projectId: string) => {
    try {
      setState(prev => ({ ...prev, validating: true, error: null }));

      const report = await contentCreatorService.generateQualityReport(projectId);

      setState(prev => ({
        ...prev,
        qualityReport: report,
        validating: false,
      }));

      return report;

    } catch (error) {
      setState(prev => ({
        ...prev,
        validating: false,
        error: error.message || '生成质量报告失败',
      }));
      return null;
    }
  }, []);

  // 发布项目
  const publishProject = useCallback(async (projectId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      await contentCreatorService.publishProject(projectId);

      // 更新项目状态
      const updatedProject = contentCreatorService.getProject(projectId);
      const updatedProjects = contentCreatorService.getProjects(userProgress?.userId);

      setState(prev => ({
        ...prev,
        currentProject: updatedProject,
        projects: updatedProjects,
        loading: false,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '发布项目失败',
      }));
    }
  }, [userProgress?.userId]);

  // 更新项目
  const updateProject = useCallback((projectId: string, updates: Partial<CreatorProject>) => {
    contentCreatorService.updateProject(projectId, updates);
    
    const updatedProject = contentCreatorService.getProject(projectId);
    const updatedProjects = contentCreatorService.getProjects(userProgress?.userId);

    setState(prev => ({
      ...prev,
      currentProject: updatedProject,
      projects: updatedProjects,
    }));
  }, [userProgress?.userId]);

  return {
    // 状态
    ...state,
    
    // 项目管理
    createProject,
    selectProject,
    updateProject,
    publishProject,
    
    // 资产管理
    uploadAsset,
    startBatchUpload,
    
    // 质量验证
    generateQualityReport,
    
    // 便捷属性
    hasProjects: state.projects.length > 0,
    hasCurrentProject: !!state.currentProject,
    projectProgress: state.currentProject?.progress || 0,
    canPublish: state.currentProject?.status === 'draft' && 
                state.currentProject?.progress === 100 &&
                state.qualityReport?.overallScore >= 70,
  };
};

/**
 * 项目管理Hook
 */
export const useProjectManagement = (projectId?: string) => {
  const [project, setProject] = useState<CreatorProject | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);

  const contentCreatorService = ContentCreatorService.getInstance();

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      
      const projectData = contentCreatorService.getProject(projectId);
      const projectAssets = contentCreatorService.getProjectAssets(projectId);
      
      setProject(projectData);
      setAssets(projectAssets);
      
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    project,
    assets,
    loading,
    reload: loadProject,
  };
};

/**
 * 资产管理Hook
 */
export const useAssetManagement = (projectId: string) => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const contentCreatorService = ContentCreatorService.getInstance();

  useEffect(() => {
    if (projectId) {
      loadAssets();
    }
  }, [projectId]);

  const loadAssets = useCallback(() => {
    const projectAssets = contentCreatorService.getProjectAssets(projectId);
    setAssets(projectAssets);
  }, [projectId]);

  const uploadAsset = useCallback(async (
    file: {
      name: string;
      type: AssetType;
      data: string;
      size: number;
      metadata?: any;
    }
  ) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const asset = await contentCreatorService.uploadAsset(projectId, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      loadAssets();
      
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

      return asset;

    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      throw error;
    }
  }, [projectId, loadAssets]);

  return {
    assets,
    uploading,
    uploadProgress,
    uploadAsset,
    reload: loadAssets,
  };
};

export default useContentCreator;
