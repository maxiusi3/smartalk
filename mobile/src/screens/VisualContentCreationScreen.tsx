import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import VisualContentCreationService, { 
  ContentCreationProject,
  ContentKeyword,
  ValidationStatus,
  ContentTemplate
} from '@/services/VisualContentCreationService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { ContentTheme } from '@/services/ContentManagementService';

/**
 * VisualContentCreationScreen - V2 可视化内容创建界面
 * 提供完整的内容创建工具：向导式流程、资源管理、质量验证
 */
const VisualContentCreationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [project, setProject] = useState<ContentCreationProject | null>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ContentTheme>('daily_life');
  const [loading, setLoading] = useState(false);

  const contentCreationService = VisualContentCreationService.getInstance();
  const projectId = route.params?.projectId;

  const steps = [
    '项目设置',
    '关键词配置',
    '资源上传',
    '质量验证',
    '预览测试',
  ];

  useEffect(() => {
    loadData();
    screenReader.announcePageChange('可视化内容创建', '创建和管理学习内容项目');
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // 加载模板
      const allTemplates = contentCreationService.getAllTemplates();
      setTemplates(allTemplates);

      // 如果有项目ID，加载项目
      if (projectId) {
        const existingProject = contentCreationService.getProject(projectId);
        if (existingProject) {
          setProject(existingProject);
          const validation = await contentCreationService.validateProject(projectId);
          setValidationStatus(validation);
          
          // 根据项目状态设置当前步骤
          if (validation.completionPercentage === 0) {
            setCurrentStep(1);
          } else if (validation.completionPercentage < 50) {
            setCurrentStep(2);
          } else if (validation.completionPercentage < 100) {
            setCurrentStep(3);
          } else {
            setCurrentStep(4);
          }
        }
      } else {
        setShowNewProjectModal(true);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('错误', '加载数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim() || !userProgress?.userId) return;

    try {
      setLoading(true);
      
      const newProjectId = await contentCreationService.createProject(
        newProjectTitle.trim(),
        selectedTheme,
        userProgress.userId
      );
      
      const newProject = contentCreationService.getProject(newProjectId);
      setProject(newProject);
      setShowNewProjectModal(false);
      setCurrentStep(1);
      
      screenReader.announce(`项目${newProjectTitle}创建成功`);

    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('错误', '创建项目失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateKeyword = async (keywordId: string, updates: Partial<ContentKeyword>) => {
    if (!project) return;

    try {
      await contentCreationService.updateKeyword(project.projectId, keywordId, updates);
      
      const updatedProject = contentCreationService.getProject(project.projectId);
      setProject(updatedProject);
      
      const validation = await contentCreationService.validateProject(project.projectId);
      setValidationStatus(validation);

    } catch (error) {
      console.error('Error updating keyword:', error);
      Alert.alert('错误', '更新关键词失败，请重试');
    }
  };

  const handleUploadAsset = async (keywordId: string, assetType: 'audio' | 'video_clip' | 'rescue_video') => {
    if (!project) return;

    try {
      setLoading(true);
      
      const fileType = assetType === 'audio' ? 'audio' : 'video';
      await contentCreationService.uploadAsset(project.projectId, keywordId, fileType, assetType);
      
      const updatedProject = contentCreationService.getProject(project.projectId);
      setProject(updatedProject);
      
      const validation = await contentCreationService.validateProject(project.projectId);
      setValidationStatus(validation);
      
      screenReader.announce(`${assetType}上传成功`);

    } catch (error) {
      console.error('Error uploading asset:', error);
      Alert.alert('错误', '上传文件失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewProject = async () => {
    if (!project) return;

    try {
      const previewResult = await contentCreationService.generateProjectPreview(project.projectId);
      
      if (previewResult.canPreview) {
        navigation.navigate('ContentPreviewScreen', {
          projectId: project.projectId,
        });
      } else {
        Alert.alert(
          '无法预览',
          `项目还缺少以下资源：\n${previewResult.missingAssets.join('\n')}`,
          [{ text: '确定' }]
        );
      }

    } catch (error) {
      console.error('Error generating preview:', error);
      Alert.alert('错误', '生成预览失败，请重试');
    }
  };

  const renderStepIndicator = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="创建步骤指示器"
      applyHighContrast={true}
    >
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={[
              styles.stepCircle,
              index <= currentStep && styles.stepCircleActive,
              index === currentStep && styles.stepCircleCurrent,
            ]}>
              <Text style={[
                styles.stepNumber,
                index <= currentStep && styles.stepNumberActive,
              ]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[
              styles.stepLabel,
              index === currentStep && styles.stepLabelCurrent,
            ]}>
              {step}
            </Text>
          </View>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderProjectSettings = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="项目设置"
      applyHighContrast={true}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>项目设置</Text>
        
        {project && (
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectTheme}>
              主题：{project.theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.projectStatus}>
              状态：{project.status === 'draft' ? '草稿' : project.status}
            </Text>
            
            <View style={styles.projectRequirements}>
              <Text style={styles.requirementsTitle}>项目要求：</Text>
              <Text style={styles.requirementItem}>• 剧本时长：30秒</Text>
              <Text style={styles.requirementItem}>• 关键词数量：5个</Text>
              <Text style={styles.requirementItem}>• 每个关键词需要：音频文件、2-4个视频片段、救援视频</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setCurrentStep(1)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="下一步：关键词配置"
        >
          <Text style={styles.nextButtonText}>下一步：关键词配置</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderKeywordConfiguration = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="关键词配置"
      applyHighContrast={true}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>关键词配置</Text>
        
        {project?.keywords.map((keyword, index) => (
          <View key={keyword.keywordId} style={styles.keywordCard}>
            <Text style={styles.keywordTitle}>关键词 {index + 1}</Text>
            
            <TextInput
              style={styles.keywordInput}
              placeholder="输入单词"
              value={keyword.word}
              onChangeText={(text) => handleUpdateKeyword(keyword.keywordId, { word: text })}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`关键词${index + 1}单词输入`}
            />
            
            <TextInput
              style={styles.keywordInput}
              placeholder="输入发音"
              value={keyword.pronunciation}
              onChangeText={(text) => handleUpdateKeyword(keyword.keywordId, { pronunciation: text })}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`关键词${index + 1}发音输入`}
            />
            
            <TextInput
              style={styles.keywordInput}
              placeholder="输入含义"
              value={keyword.meaning}
              onChangeText={(text) => handleUpdateKeyword(keyword.keywordId, { meaning: text })}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={`关键词${index + 1}含义输入`}
            />
            
            <View style={styles.keywordStatus}>
              <Text style={[
                styles.statusText,
                keyword.isComplete ? styles.statusComplete : styles.statusIncomplete
              ]}>
                {keyword.isComplete ? '✓ 完成' : '○ 未完成'}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(0)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="上一步"
          >
            <Text style={styles.backButtonText}>上一步</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(2)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="下一步：资源上传"
          >
            <Text style={styles.nextButtonText}>下一步：资源上传</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderAssetUpload = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="资源上传"
      applyHighContrast={true}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>资源上传</Text>
        
        {project?.keywords.map((keyword, index) => (
          <View key={keyword.keywordId} style={styles.assetCard}>
            <Text style={styles.assetCardTitle}>
              {keyword.word || `关键词 ${index + 1}`}
            </Text>
            
            <View style={styles.assetSection}>
              <Text style={styles.assetSectionTitle}>音频文件</Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  keyword.audioFile && styles.uploadButtonComplete
                ]}
                onPress={() => handleUploadAsset(keyword.keywordId, 'audio')}
                disabled={loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`上传${keyword.word}的音频文件`}
              >
                <Text style={styles.uploadButtonText}>
                  {keyword.audioFile ? '✓ 已上传' : '上传音频'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.assetSection}>
              <Text style={styles.assetSectionTitle}>
                视频片段 ({keyword.videoClips.length}/2-4)
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => handleUploadAsset(keyword.keywordId, 'video_clip')}
                disabled={loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`上传${keyword.word}的视频片段`}
              >
                <Text style={styles.uploadButtonText}>添加视频片段</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.assetSection}>
              <Text style={styles.assetSectionTitle}>救援视频</Text>
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  keyword.rescueVideo && styles.uploadButtonComplete
                ]}
                onPress={() => handleUploadAsset(keyword.keywordId, 'rescue_video')}
                disabled={loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`上传${keyword.word}的救援视频`}
              >
                <Text style={styles.uploadButtonText}>
                  {keyword.rescueVideo ? '✓ 已上传' : '上传救援视频'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(1)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="上一步"
          >
            <Text style={styles.backButtonText}>上一步</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => setCurrentStep(3)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="下一步：质量验证"
          >
            <Text style={styles.nextButtonText}>下一步：质量验证</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderValidation = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="质量验证"
      applyHighContrast={true}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>质量验证</Text>
        
        {validationStatus && (
          <View style={styles.validationCard}>
            <View style={styles.validationHeader}>
              <Text style={styles.validationTitle}>项目完成度</Text>
              <Text style={styles.validationPercentage}>
                {Math.round(validationStatus.completionPercentage)}%
              </Text>
            </View>
            
            <View style={styles.validationChecks}>
              <Text style={styles.checksTitle}>检查项目：</Text>
              
              {Object.entries(validationStatus.checks).map(([key, passed]) => (
                <View key={key} style={styles.checkItem}>
                  <Text style={[
                    styles.checkIcon,
                    passed ? styles.checkPassed : styles.checkFailed
                  ]}>
                    {passed ? '✓' : '✗'}
                  </Text>
                  <Text style={styles.checkLabel}>
                    {this.getCheckLabel(key)}
                  </Text>
                </View>
              ))}
            </View>
            
            {validationStatus.errors.length > 0 && (
              <View style={styles.validationErrors}>
                <Text style={styles.errorsTitle}>需要修复的问题：</Text>
                {validationStatus.errors.map(error => (
                  <Text key={error.errorId} style={styles.errorItem}>
                    • {error.message}
                  </Text>
                ))}
              </View>
            )}
            
            {validationStatus.warnings.length > 0 && (
              <View style={styles.validationWarnings}>
                <Text style={styles.warningsTitle}>建议改进：</Text>
                {validationStatus.warnings.map(warning => (
                  <Text key={warning.warningId} style={styles.warningItem}>
                    • {warning.message}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(2)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="上一步"
          >
            <Text style={styles.backButtonText}>上一步</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              validationStatus?.isValid && styles.nextButtonEnabled
            ]}
            onPress={() => setCurrentStep(4)}
            disabled={!validationStatus?.isValid}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="下一步：预览测试"
          >
            <Text style={styles.nextButtonText}>下一步：预览测试</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderPreview = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="预览测试"
      applyHighContrast={true}
    >
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>预览测试</Text>
        
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>项目预览</Text>
          <Text style={styles.previewDescription}>
            在发布之前，您可以预览完整的学习流程，确保所有内容都能正常工作。
          </Text>
          
          <TouchableOpacity
            style={styles.previewButton}
            onPress={handlePreviewProject}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="开始预览测试"
          >
            <Text style={styles.previewButtonText}>开始预览测试</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepActions}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(3)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="上一步"
          >
            <Text style={styles.backButtonText}>上一步</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.publishButton}
            onPress={() => Alert.alert('发布', '发布功能即将推出')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="发布项目"
          >
            <Text style={styles.publishButtonText}>发布项目</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderNewProjectModal = () => (
    <Modal
      visible={showNewProjectModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowNewProjectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <AccessibilityWrapper
          accessibilityRole="dialog"
          accessibilityLabel="创建新项目"
          applyHighContrast={true}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>创建新项目</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="输入项目标题"
              value={newProjectTitle}
              onChangeText={setNewProjectTitle}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="项目标题输入"
            />
            
            <Text style={styles.modalLabel}>选择主题：</Text>
            <View style={styles.themeSelector}>
              {(['daily_life', 'business', 'travel'] as ContentTheme[]).map(theme => (
                <TouchableOpacity
                  key={theme}
                  style={[
                    styles.themeOption,
                    selectedTheme === theme && styles.themeOptionSelected
                  ]}
                  onPress={() => setSelectedTheme(theme)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`选择${theme}主题`}
                >
                  <Text style={[
                    styles.themeOptionText,
                    selectedTheme === theme && styles.themeOptionTextSelected
                  ]}>
                    {theme.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowNewProjectModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="取消"
              >
                <Text style={styles.modalCancelButtonText}>取消</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalCreateButton,
                  !newProjectTitle.trim() && styles.modalCreateButtonDisabled
                ]}
                onPress={handleCreateProject}
                disabled={!newProjectTitle.trim() || loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="创建项目"
              >
                <Text style={styles.modalCreateButtonText}>
                  {loading ? '创建中...' : '创建项目'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </AccessibilityWrapper>
      </View>
    </Modal>
  );

  const getCheckLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      keywordCount: '关键词数量（5个）',
      dramaDuration: '剧本时长（30秒）',
      allAudioFiles: '所有音频文件',
      allVideoClips: '所有视频片段',
      allRescueVideos: '所有救援视频',
      pronunciationData: '发音数据',
    };
    return labels[key] || key;
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderProjectSettings();
      case 1: return renderKeywordConfiguration();
      case 2: return renderAssetUpload();
      case 3: return renderValidation();
      case 4: return renderPreview();
      default: return renderProjectSettings();
    }
  };

  if (loading && !project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="可视化内容创建页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="返回"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>内容创建</Text>
          
          <View style={styles.headerRight} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 步骤指示器 */}
        {project && renderStepIndicator()}

        {/* 当前步骤内容 */}
        {project && renderCurrentStep()}
      </ScrollView>

      {/* 新项目模态框 */}
      {renderNewProjectModal()}
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#3b82f6',
  },
  stepCircleCurrent: {
    backgroundColor: '#1d4ed8',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  stepContent: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  projectInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  projectTheme: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  projectStatus: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  projectRequirements: {
    marginTop: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  keywordCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  keywordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  keywordInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 8,
  },
  keywordStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusComplete: {
    color: '#10b981',
  },
  statusIncomplete: {
    color: '#f59e0b',
  },
  assetCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  assetCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  assetSection: {
    marginBottom: 12,
  },
  assetSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  uploadButtonComplete: {
    backgroundColor: '#10b981',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  validationCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  validationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  validationPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  validationChecks: {
    marginBottom: 16,
  },
  checksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checkIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    width: 16,
  },
  checkPassed: {
    color: '#10b981',
  },
  checkFailed: {
    color: '#ef4444',
  },
  checkLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  validationErrors: {
    marginBottom: 12,
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 12,
    color: '#dc2626',
    marginBottom: 4,
  },
  validationWarnings: {
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 12,
    color: '#d97706',
    marginBottom: 4,
  },
  previewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  previewButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonEnabled: {
    backgroundColor: '#1d4ed8',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  publishButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  themeOption: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  themeOptionSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  themeOptionText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  themeOptionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCreateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  modalCreateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default VisualContentCreationScreen;
