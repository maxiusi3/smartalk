import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useContentCreator, useProjectManagement } from '@/hooks/useContentCreator';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { CreatorProject, ContentTemplate, AssetType } from '@/services/ContentCreatorService';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * ContentCreatorScreen - V2 内容创作者界面
 * 提供完整的内容创作体验：项目管理、资产上传、质量验证
 */
const ContentCreatorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  // 内容创作
  const {
    projects,
    currentProject,
    templates,
    qualityReport,
    loading,
    error,
    uploading,
    validating,
    hasProjects,
    canPublish,
    createProject,
    selectProject,
    generateQualityReport,
    publishProject,
  } = useContentCreator();

  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'quality'>('projects');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: '',
    templateId: '',
  });

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('内容创作者', '管理和创建学习内容');
    
    analyticsService.track('content_creator_screen_viewed', {
      projectsCount: projects.length,
      timestamp: Date.now(),
    });
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectForm.name.trim() || !newProjectForm.templateId) {
      Alert.alert('错误', '请填写项目名称并选择模板');
      return;
    }

    try {
      await createProject(
        newProjectForm.name.trim(),
        newProjectForm.description.trim(),
        newProjectForm.templateId
      );
      
      setShowCreateModal(false);
      setNewProjectForm({ name: '', description: '', templateId: '' });
      screenReader.announceSuccess('项目创建成功');
      
    } catch (error) {
      Alert.alert('错误', '创建项目失败: ' + error.message);
      screenReader.announceError('创建项目失败');
    }
  };

  const handleSelectProject = (projectId: string) => {
    selectProject(projectId);
    screenReader.announce('项目已选择');
  };

  const handleGenerateReport = async () => {
    if (!currentProject) return;

    try {
      await generateQualityReport(currentProject.id);
      screenReader.announceSuccess('质量报告生成完成');
    } catch (error) {
      Alert.alert('错误', '生成质量报告失败: ' + error.message);
    }
  };

  const handlePublishProject = async () => {
    if (!currentProject) return;

    Alert.alert(
      '确认发布',
      '确定要发布此项目吗？发布后将无法修改。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '发布',
          onPress: async () => {
            try {
              await publishProject(currentProject.id);
              screenReader.announceSuccess('项目发布成功');
              Alert.alert('成功', '项目已成功发布！');
            } catch (error) {
              Alert.alert('错误', '发布失败: ' + error.message);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'published': return '#10b981';
      case 'in_review': return '#3b82f6';
      case 'approved': return '#8b5cf6';
      case 'draft': return '#f59e0b';
      case 'archived': return '#94a3b8';
      default: return '#64748b';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'published': return '已发布';
      case 'in_review': return '审核中';
      case 'approved': return '已批准';
      case 'draft': return '草稿';
      case 'archived': return '已归档';
      default: return '未知';
    }
  };

  const renderTabBar = () => (
    <AccessibilityWrapper
      accessibilityRole="tablist"
      accessibilityLabel="内容创作标签"
      applyHighContrast={true}
    >
      <View style={[styles.tabBar, getLayoutDirectionStyles()]}>
        {[
          { key: 'projects', label: '项目', icon: '📁', badge: projects.length },
          { key: 'templates', label: '模板', icon: '📋', badge: templates.length },
          { key: 'quality', label: '质量', icon: '🎯' },
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
            <View style={styles.tabContent}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel
              ]}>
                {tab.label}
              </Text>
              {tab.badge && tab.badge > 0 && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </AccessibilityWrapper>
  );

  const renderProject = ({ item: project }: { item: CreatorProject }) => (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={`项目${project.name}，状态${getStatusText(project.status)}，进度${project.progress}%`}
      accessibilityHint="点击选择项目"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={[
          styles.projectCard,
          currentProject?.id === project.id && styles.selectedProjectCard
        ]}
        onPress={() => handleSelectProject(project.id)}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleRow}>
            <Text style={styles.projectName}>{project.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(project.status) }
            ]}>
              <Text style={styles.statusText}>{getStatusText(project.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description}
          </Text>
        </View>

        <View style={styles.projectProgress}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>进度</Text>
            <Text style={styles.progressValue}>{project.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${project.progress}%`,
                  backgroundColor: project.progress === 100 ? '#10b981' : '#3b82f6'
                }
              ]}
            />
          </View>
        </View>

        <View style={styles.projectStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>类型</Text>
            <Text style={styles.statValue}>{project.type}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>主题</Text>
            <Text style={styles.statValue}>{project.theme}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>难度</Text>
            <Text style={styles.statValue}>{project.difficulty}</Text>
          </View>
        </View>

        <View style={styles.projectFooter}>
          <Text style={styles.projectDate}>
            创建于 {new Date(project.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.projectCreator}>
            创建者: {project.creator.name}
          </Text>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderTemplate = ({ item: template }: { item: ContentTemplate }) => (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={`模板${template.name}，${template.description}`}
      accessibilityHint="点击使用此模板创建项目"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={styles.templateCard}
        onPress={() => {
          setNewProjectForm(prev => ({ ...prev, templateId: template.id }));
          setShowCreateModal(true);
        }}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.templateHeader}>
          <Text style={styles.templateName}>{template.name}</Text>
          <View style={styles.templateType}>
            <Text style={styles.templateTypeText}>{template.type}</Text>
          </View>
        </View>

        <Text style={styles.templateDescription}>
          {template.description}
        </Text>

        <View style={styles.templateStructure}>
          <View style={styles.structureItem}>
            <Text style={styles.structureLabel}>关键词数量</Text>
            <Text style={styles.structureValue}>{template.structure.keywordCount}</Text>
          </View>
          <View style={styles.structureItem}>
            <Text style={styles.structureLabel}>必需资产</Text>
            <Text style={styles.structureValue}>{template.structure.requiredAssets.length}</Text>
          </View>
        </View>

        <View style={styles.templateDefaults}>
          <Text style={styles.defaultsTitle}>默认设置:</Text>
          <Text style={styles.defaultsText}>
            难度: {template.defaults.difficulty} | 
            主题: {template.defaults.theme} | 
            时长: {template.defaults.duration}秒
          </Text>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderQualityReport = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="质量报告"
      applyHighContrast={true}
    >
      <ScrollView style={styles.qualityContainer} showsVerticalScrollIndicator={false}>
        {!currentProject ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>请先选择一个项目</Text>
          </View>
        ) : !qualityReport ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无质量报告</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerateReport}
              disabled={validating}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="生成质量报告"
              accessibilityState={{ disabled: validating }}
            >
              <Text style={styles.generateButtonText}>
                {validating ? '生成中...' : '生成报告'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.reportContainer}>
            {/* 总体评分 */}
            <View style={styles.overallScoreCard}>
              <Text style={[
                styles.overallScoreValue,
                { color: qualityReport.overallScore >= 80 ? '#10b981' : 
                         qualityReport.overallScore >= 60 ? '#f59e0b' : '#ef4444' }
              ]}>
                {qualityReport.overallScore.toFixed(1)}
              </Text>
              <Text style={styles.overallScoreLabel}>总体评分</Text>
            </View>

            {/* 详细评分 */}
            <View style={styles.scoresGrid}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{qualityReport.scores.contentStructure.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>内容结构</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{qualityReport.scores.assetQuality.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>资产质量</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{qualityReport.scores.accessibility.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>可访问性</Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreValue}>{qualityReport.scores.learningEffectiveness.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>学习效果</Text>
              </View>
            </View>

            {/* 问题汇总 */}
            <View style={styles.issuesContainer}>
              <Text style={styles.issuesTitle}>问题汇总</Text>
              <View style={styles.issuesGrid}>
                <View style={styles.issueItem}>
                  <Text style={[styles.issueCount, { color: '#dc2626' }]}>
                    {qualityReport.issues.critical}
                  </Text>
                  <Text style={styles.issueLabel}>严重</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={[styles.issueCount, { color: '#ef4444' }]}>
                    {qualityReport.issues.major}
                  </Text>
                  <Text style={styles.issueLabel}>重要</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={[styles.issueCount, { color: '#f59e0b' }]}>
                    {qualityReport.issues.minor}
                  </Text>
                  <Text style={styles.issueLabel}>轻微</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={[styles.issueCount, { color: '#10b981' }]}>
                    {qualityReport.issues.suggestions}
                  </Text>
                  <Text style={styles.issueLabel}>建议</Text>
                </View>
              </View>
            </View>

            {/* 发布按钮 */}
            {canPublish && (
              <TouchableOpacity
                style={styles.publishButton}
                onPress={handlePublishProject}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="发布项目"
              >
                <Text style={styles.publishButtonText}>发布项目</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </AccessibilityWrapper>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCreateModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowCreateModal(false)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="关闭"
          >
            <Text style={styles.modalCloseText}>取消</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>创建新项目</Text>
          <TouchableOpacity
            style={[
              styles.modalSaveButton,
              (!newProjectForm.name.trim() || !newProjectForm.templateId) && styles.disabledButton
            ]}
            onPress={handleCreateProject}
            disabled={!newProjectForm.name.trim() || !newProjectForm.templateId}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="创建项目"
            accessibilityState={{ disabled: !newProjectForm.name.trim() || !newProjectForm.templateId }}
          >
            <Text style={[
              styles.modalSaveText,
              (!newProjectForm.name.trim() || !newProjectForm.templateId) && styles.disabledButtonText
            ]}>
              创建
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>项目名称 *</Text>
            <TextInput
              style={styles.formInput}
              placeholder="输入项目名称"
              value={newProjectForm.name}
              onChangeText={(text) => setNewProjectForm(prev => ({ ...prev, name: text }))}
              accessible={true}
              accessibilityLabel="项目名称输入框"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>项目描述</Text>
            <TextInput
              style={[styles.formInput, styles.formTextArea]}
              placeholder="输入项目描述"
              value={newProjectForm.description}
              onChangeText={(text) => setNewProjectForm(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              accessible={true}
              accessibilityLabel="项目描述输入框"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>选择模板 *</Text>
            {templates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateOption,
                  newProjectForm.templateId === template.id && styles.selectedTemplateOption
                ]}
                onPress={() => setNewProjectForm(prev => ({ ...prev, templateId: template.id }))}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={template.name}
                accessibilityState={{ selected: newProjectForm.templateId === template.id }}
              >
                <View style={styles.templateOptionHeader}>
                  <Text style={styles.templateOptionName}>{template.name}</Text>
                  <View style={[
                    styles.radioButton,
                    newProjectForm.templateId === template.id && styles.selectedRadioButton
                  ]}>
                    {newProjectForm.templateId === template.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </View>
                <Text style={styles.templateOptionDescription}>
                  {template.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return (
          <View style={styles.tabContentContainer}>
            {!hasProjects ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无项目</Text>
                <Text style={styles.emptySubtext}>创建您的第一个内容项目</Text>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={() => setShowCreateModal(true)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="创建新项目"
                >
                  <Text style={styles.createButtonText}>创建项目</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={projects}
                renderItem={renderProject}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        );
      
      case 'templates':
        return (
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      
      case 'quality':
        return renderQualityReport();
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="内容创作者页面头部"
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
          <Text style={styles.headerTitle}>内容创作者</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="创建新项目"
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      {/* 错误提示 */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* 标签栏 */}
      {renderTabBar()}

      {/* 内容区域 */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* 创建项目模态框 */}
      {renderCreateModal()}
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    paddingVertical: 8,
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
  tabContent: {
    position: 'relative',
    alignItems: 'center',
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
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
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
  selectedProjectCard: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  projectHeader: {
    marginBottom: 12,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  projectDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  projectProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  projectDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  projectCreator: {
    fontSize: 11,
    color: '#94a3b8',
  },
  templateCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  templateType: {
    backgroundColor: '#eff6ff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  templateTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3b82f6',
  },
  templateDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  templateStructure: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  structureItem: {
    alignItems: 'center',
  },
  structureLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginBottom: 2,
  },
  structureValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  templateDefaults: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  defaultsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  defaultsText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  qualityContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generateButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reportContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  overallScoreCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallScoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  overallScoreLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  issuesContainer: {
    marginBottom: 20,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  issuesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  issueItem: {
    flex: 1,
    alignItems: 'center',
  },
  issueCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  issueLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  publishButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  disabledButtonText: {
    color: '#f1f5f9',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  formTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  templateOption: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedTemplateOption: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  templateOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadioButton: {
    borderColor: '#3b82f6',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  templateOptionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default ContentCreatorScreen;
