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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserExperienceValidationService, { 
  TestType,
  TestSession,
  UserPersona,
  ContentValidationResult
} from '@/services/UserExperienceValidationService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * UserExperienceTestingScreen - V2 用户体验测试界面
 * 提供完整的用户体验测试：可用性测试、内容验证、A/B测试管理
 */
const UserExperienceTestingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [activeSession, setActiveSession] = useState<TestSession | null>(null);
  const [testHistory, setTestHistory] = useState<TestSession[]>([]);
  const [contentValidation, setContentValidation] = useState<ContentValidationResult[]>([]);
  const [userPersonas, setUserPersonas] = useState<UserPersona[]>([]);
  const [testStatistics, setTestStatistics] = useState<any>(null);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);
  const [loading, setLoading] = useState(false);

  const uxValidationService = UserExperienceValidationService.getInstance();

  useEffect(() => {
    loadTestingData();
    screenReader.announcePageChange('用户体验测试', '管理和执行用户体验测试');
  }, []);

  const loadTestingData = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);

      // 加载测试历史
      const history = uxValidationService.getUserTestHistory(userProgress.userId);
      setTestHistory(history);

      // 加载内容验证结果
      const validation = uxValidationService.getAllContentValidationResults();
      setContentValidation(validation);

      // 加载用户画像
      const personas = uxValidationService.getAllUserPersonas();
      setUserPersonas(personas);

      // 加载测试统计
      const stats = uxValidationService.getTestStatistics();
      setTestStatistics(stats);

    } catch (error) {
      console.error('Error loading testing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testType: TestType, personaId?: string) => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      
      const sessionId = await uxValidationService.startTestSession(
        testType,
        userProgress.userId,
        personaId
      );
      
      const session = uxValidationService.getTestSession(sessionId);
      setActiveSession(session);
      
      Alert.alert(
        '测试已开始',
        `${getTestTypeName(testType)}测试已开始。请按照指示完成测试场景。`,
        [{ text: '开始测试', onPress: () => setShowPersonaModal(false) }]
      );
      
      screenReader.announce(`${getTestTypeName(testType)}测试已开始`);

    } catch (error) {
      console.error('Error starting test:', error);
      Alert.alert('错误', '开始测试失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTest = async () => {
    if (!activeSession) return;

    try {
      setLoading(true);
      
      const completedSession = await uxValidationService.completeTestSession(activeSession.sessionId);
      
      Alert.alert(
        '测试完成',
        `测试已完成！总体评分：${completedSession.overallScore}/100`,
        [
          {
            text: '查看结果',
            onPress: () => navigation.navigate('TestResultScreen', {
              sessionId: completedSession.sessionId,
            }),
          },
          { text: '确定' },
        ]
      );
      
      setActiveSession(null);
      await loadTestingData();
      
      screenReader.announce(`测试完成，评分${completedSession.overallScore}分`);

    } catch (error) {
      console.error('Error completing test:', error);
      Alert.alert('错误', '完成测试失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeName = (type: TestType): string => {
    const names: { [key in TestType]: string } = {
      usability: '可用性测试',
      magic_moment: '魔法时刻验证',
      error_recovery: '错误恢复测试',
      accessibility: '无障碍测试',
      content_quality: '内容质量验证',
      pronunciation: '发音API测试',
      cross_device: '跨设备兼容性',
      emotional_response: '情感响应测试',
      learning_effectiveness: '学习效果验证',
    };
    return names[type];
  };

  const getTestTypeDescription = (type: TestType): string => {
    const descriptions: { [key in TestType]: string } = {
      usability: '测试用户界面的易用性和导航流畅度',
      magic_moment: '验证用户首次成功体验的情感影响',
      error_recovery: '测试错误处理和恢复机制的有效性',
      accessibility: '验证无障碍功能和辅助技术兼容性',
      content_quality: '评估学习内容的质量和有效性',
      pronunciation: '测试语音识别和发音反馈的准确性',
      cross_device: '验证不同设备和屏幕尺寸的兼容性',
      emotional_response: '测量用户的情感参与度和满意度',
      learning_effectiveness: '验证实际的学习效果和知识保留',
    };
    return descriptions[type];
  };

  const renderTestTypeCard = (testType: TestType) => (
    <AccessibilityWrapper
      key={testType}
      accessibilityRole="button"
      accessibilityLabel={`${getTestTypeName(testType)}测试`}
      accessibilityHint="点击开始此类型的测试"
      applyExtendedTouchTarget={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={styles.testCard}
        onPress={() => {
          setSelectedTestType(testType);
          setShowPersonaModal(true);
        }}
        disabled={loading || !!activeSession}
        accessible={true}
        accessibilityRole="button"
      >
        <View style={styles.testCardHeader}>
          <Text style={styles.testCardTitle}>
            {getTestTypeName(testType)}
          </Text>
          <View style={styles.testCardBadge}>
            <Text style={styles.testCardBadgeText}>测试</Text>
          </View>
        </View>
        
        <Text style={styles.testCardDescription}>
          {getTestTypeDescription(testType)}
        </Text>
        
        <View style={styles.testCardFooter}>
          <Text style={styles.testCardDuration}>
            预计时长：5-15分钟
          </Text>
          <Text style={styles.testCardArrow}>→</Text>
        </View>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderActiveSession = () => {
    if (!activeSession) return null;

    const currentScenario = activeSession.testScenarios[activeSession.currentScenarioIndex];
    const progress = ((activeSession.currentScenarioIndex + 1) / activeSession.testScenarios.length) * 100;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="当前测试会话"
        applyHighContrast={true}
      >
        <View style={styles.activeSessionCard}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>
              正在进行：{getTestTypeName(activeSession.testType)}
            </Text>
            <Text style={styles.sessionProgress}>
              {Math.round(progress)}%
            </Text>
          </View>

          {currentScenario && (
            <View style={styles.scenarioInfo}>
              <Text style={styles.scenarioTitle}>
                当前场景：{currentScenario.title}
              </Text>
              <Text style={styles.scenarioDescription}>
                {currentScenario.description}
              </Text>
            </View>
          )}

          <View style={styles.sessionActions}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('TestExecutionScreen', {
                sessionId: activeSession.sessionId,
              })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="继续测试"
            >
              <Text style={styles.continueButtonText}>继续测试</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteTest}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="完成测试"
            >
              <Text style={styles.completeButtonText}>完成测试</Text>
            </TouchableOpacity>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderTestStatistics = () => {
    if (!testStatistics) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="测试统计"
        applyHighContrast={true}
      >
        <View style={styles.statisticsCard}>
          <Text style={styles.statisticsTitle}>测试统计</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testStatistics.totalSessions}</Text>
              <Text style={styles.statLabel}>总测试数</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testStatistics.completedSessions}</Text>
              <Text style={styles.statLabel}>已完成</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{testStatistics.averageScore}</Text>
              <Text style={styles.statLabel}>平均分</Text>
            </View>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderContentValidation = () => {
    if (contentValidation.length === 0) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="内容验证结果"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>内容验证结果</Text>
          
          {contentValidation.map(result => (
            <View key={result.themeId} style={styles.validationCard}>
              <View style={styles.validationHeader}>
                <Text style={styles.validationTheme}>
                  {result.themeId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
                <Text style={styles.validationScore}>
                  {Math.round(result.engagementScore * 100)}%
                </Text>
              </View>
              
              <View style={styles.validationMetrics}>
                <Text style={styles.validationMetric}>
                  准确性：{Math.round(result.accuracyScore * 100)}%
                </Text>
                <Text style={styles.validationMetric}>
                  相关性：{Math.round(result.relevanceScore * 100)}%
                </Text>
                <Text style={styles.validationMetric}>
                  理解率：{Math.round(result.comprehensionRate * 100)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPersonaModal = () => (
    <Modal
      visible={showPersonaModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPersonaModal(false)}
    >
      <View style={styles.modalOverlay}>
        <AccessibilityWrapper
          accessibilityRole="dialog"
          accessibilityLabel="选择用户画像"
          applyHighContrast={true}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>选择用户画像</Text>
            <Text style={styles.modalSubtitle}>
              选择一个用户画像来模拟特定用户群体的测试体验
            </Text>

            <ScrollView style={styles.personaList}>
              <TouchableOpacity
                style={styles.personaOption}
                onPress={() => handleStartTest(selectedTestType!, undefined)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="使用当前用户进行测试"
              >
                <Text style={styles.personaName}>当前用户</Text>
                <Text style={styles.personaDescription}>
                  使用您当前的用户配置进行测试
                </Text>
              </TouchableOpacity>

              {userPersonas.map(persona => (
                <TouchableOpacity
                  key={persona.id}
                  style={styles.personaOption}
                  onPress={() => handleStartTest(selectedTestType!, persona.id)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`使用${persona.name}画像进行测试`}
                >
                  <Text style={styles.personaName}>{persona.name}</Text>
                  <Text style={styles.personaDescription}>
                    {persona.occupation}，{persona.englishLevel}水平
                  </Text>
                  <Text style={styles.personaDetails}>
                    每日{persona.timeAvailable}分钟，{persona.devicePreference}设备
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPersonaModal(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="取消"
            >
              <Text style={styles.modalCloseButtonText}>取消</Text>
            </TouchableOpacity>
          </View>
        </AccessibilityWrapper>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="用户体验测试页面头部"
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
          
          <Text style={styles.headerTitle}>用户体验测试</Text>
          
          <View style={styles.headerRight} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 活跃测试会话 */}
        {renderActiveSession()}

        {/* 测试统计 */}
        {renderTestStatistics()}

        {/* 测试类型 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="可用测试类型"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>可用测试</Text>
            <Text style={styles.sectionDescription}>
              选择一种测试类型来验证用户体验的不同方面
            </Text>
            
            <View style={styles.testGrid}>
              {(['usability', 'magic_moment', 'error_recovery', 'accessibility', 'content_quality', 'pronunciation'] as TestType[]).map(renderTestTypeCard)}
            </View>
          </View>
        </AccessibilityWrapper>

        {/* 内容验证结果 */}
        {renderContentValidation()}

        {/* 测试历史 */}
        {testHistory.length > 0 && (
          <AccessibilityWrapper
            accessibilityRole="group"
            accessibilityLabel="测试历史"
            applyHighContrast={true}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>最近测试</Text>
              
              {testHistory.slice(0, 5).map(session => (
                <TouchableOpacity
                  key={session.sessionId}
                  style={styles.historyCard}
                  onPress={() => navigation.navigate('TestResultScreen', {
                    sessionId: session.sessionId,
                  })}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`查看${getTestTypeName(session.testType)}测试结果`}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>
                      {getTestTypeName(session.testType)}
                    </Text>
                    <Text style={styles.historyScore}>
                      {session.overallScore}/100
                    </Text>
                  </View>
                  
                  <Text style={styles.historyDate}>
                    {new Date(session.completedAt!).toLocaleDateString('zh-CN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AccessibilityWrapper>
        )}
      </ScrollView>

      {/* 用户画像选择模态框 */}
      {renderPersonaModal()}
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
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  activeSessionCard: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  sessionProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  scenarioInfo: {
    marginBottom: 16,
  },
  scenarioTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  scenarioDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statisticsCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statisticsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  testGrid: {
    gap: 12,
  },
  testCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  testCardBadge: {
    backgroundColor: '#3b82f6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  testCardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testCardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  testCardDuration: {
    fontSize: 12,
    color: '#94a3b8',
  },
  testCardArrow: {
    fontSize: 16,
    color: '#3b82f6',
  },
  validationCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  validationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationTheme: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  validationScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  validationMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  validationMetric: {
    fontSize: 12,
    color: '#64748b',
  },
  historyCard: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  historyScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  historyDate: {
    fontSize: 12,
    color: '#94a3b8',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  personaList: {
    maxHeight: 300,
  },
  personaOption: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  personaDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  personaDetails: {
    fontSize: 12,
    color: '#94a3b8',
  },
  modalCloseButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});

export default UserExperienceTestingScreen;
