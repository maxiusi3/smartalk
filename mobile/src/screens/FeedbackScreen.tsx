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
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HelpFeedbackService, { FeedbackType, HelpCategory } from '@/services/HelpFeedbackService';
import { useUserState } from '@/contexts/UserStateContext';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';

/**
 * FeedbackScreen - V2 反馈提交界面
 * 提供完整的用户反馈系统：问题报告、功能建议、用户体验反馈
 */
const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProgress } = useUserState();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general_feedback');
  const [category, setCategory] = useState<HelpCategory>('technical_issues');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [includeDeviceInfo, setIncludeDeviceInfo] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(false);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const helpFeedbackService = HelpFeedbackService.getInstance();
  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    // 页面变化公告
    screenReader.announcePageChange('反馈提交', '提交问题反馈或功能建议');
    
    // 加载用户邮箱
    if (userProgress?.userEmail) {
      setUserEmail(userProgress.userEmail);
    }
  }, []);

  const handleSubmit = async () => {
    // 验证输入
    if (!title.trim()) {
      Alert.alert('错误', '请输入反馈标题');
      screenReader.announceError('请输入反馈标题');
      return;
    }

    if (!description.trim()) {
      Alert.alert('错误', '请输入详细描述');
      screenReader.announceError('请输入详细描述');
      return;
    }

    if (!userProgress?.userId) {
      Alert.alert('错误', '用户信息不完整，请重新登录');
      return;
    }

    try {
      setSubmitting(true);
      
      const feedbackData = {
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status: 'submitted' as const,
        userId: userProgress.userId,
        userEmail: userEmail.trim() || undefined,
        screenshots: [], // 在实际应用中，这里会包含用户上传的截图
        logs: includeLogs ? ['Sample log entry'] : [], // 在实际应用中，这里会包含应用日志
      };

      const feedbackId = await helpFeedbackService.submitFeedback(feedbackData);
      
      // 成功提交
      Alert.alert(
        '提交成功',
        `您的反馈已成功提交，反馈ID: ${feedbackId.slice(-8)}。我们会尽快处理您的反馈。`,
        [
          {
            text: '查看历史',
            onPress: () => navigation.navigate('FeedbackHistoryScreen'),
          },
          {
            text: '返回',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
      
      screenReader.announceSuccess('反馈提交成功');
      
      // 清空表单
      setTitle('');
      setDescription('');
      setFeedbackType('general_feedback');
      setCategory('technical_issues');
      setPriority('medium');
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('提交失败', '反馈提交失败，请稍后重试。');
      screenReader.announceError('反馈提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const renderFeedbackTypeSelector = () => {
    const types = helpFeedbackService.getFeedbackTypes();
    
    return (
      <AccessibilityWrapper
        accessibilityRole="radiogroup"
        accessibilityLabel="反馈类型选择"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>反馈类型 *</Text>
          {types.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[
                styles.optionButton,
                feedbackType === type.type && styles.activeOptionButton
              ]}
              onPress={() => {
                setFeedbackType(type.type);
                screenReader.announceButtonAction(type.name, '已选择');
              }}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={type.name}
              accessibilityHint={type.description}
              accessibilityState={{ selected: feedbackType === type.type }}
            >
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle,
                  feedbackType === type.type && styles.activeOptionTitle
                ]}>
                  {type.name}
                </Text>
                <Text style={styles.optionDescription}>
                  {type.description}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                feedbackType === type.type && styles.activeRadioButton
              ]}>
                {feedbackType === type.type && <View style={styles.radioButtonInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderCategorySelector = () => {
    const categories = helpFeedbackService.getHelpCategories();
    
    return (
      <AccessibilityWrapper
        accessibilityRole="combobox"
        accessibilityLabel="问题分类选择"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>问题分类 *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.category}
                style={[
                  styles.categoryChip,
                  category === cat.category && styles.activeCategoryChip
                ]}
                onPress={() => {
                  setCategory(cat.category);
                  screenReader.announceButtonAction(cat.name, '已选择');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={cat.name}
                accessibilityHint={cat.description}
                accessibilityState={{ selected: category === cat.category }}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat.category && styles.activeCategoryChipText
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPrioritySelector = () => {
    const priorities = [
      { value: 'low', label: '低', description: '一般问题，不影响使用' },
      { value: 'medium', label: '中', description: '影响部分功能使用' },
      { value: 'high', label: '高', description: '严重影响使用体验' },
      { value: 'critical', label: '紧急', description: '无法正常使用应用' },
    ];
    
    return (
      <AccessibilityWrapper
        accessibilityRole="radiogroup"
        accessibilityLabel="优先级选择"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>优先级</Text>
          <View style={styles.priorityContainer}>
            {priorities.map((p) => (
              <TouchableOpacity
                key={p.value}
                style={[
                  styles.priorityButton,
                  priority === p.value && styles.activePriorityButton,
                  p.value === 'critical' && styles.criticalPriorityButton,
                ]}
                onPress={() => {
                  setPriority(p.value as any);
                  screenReader.announceButtonAction(`优先级${p.label}`, '已选择');
                }}
                accessible={true}
                accessibilityRole="radio"
                accessibilityLabel={`优先级${p.label}`}
                accessibilityHint={p.description}
                accessibilityState={{ selected: priority === p.value }}
              >
                <Text style={[
                  styles.priorityButtonText,
                  priority === p.value && styles.activePriorityButtonText
                ]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderFormFields = () => (
    <AccessibilityWrapper
      accessibilityRole="form"
      accessibilityLabel="反馈表单"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>反馈详情</Text>
        
        {/* 标题输入 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>标题 *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="简要描述您的问题或建议"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            accessible={true}
            accessibilityLabel="反馈标题"
            accessibilityHint="输入简要的问题描述，最多100字符"
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>
        
        {/* 详细描述 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>详细描述 *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="请详细描述您遇到的问题或建议的功能..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={1000}
            accessible={true}
            accessibilityLabel="详细描述"
            accessibilityHint="详细描述问题或建议，最多1000字符"
          />
          <Text style={styles.characterCount}>{description.length}/1000</Text>
        </View>
        
        {/* 联系邮箱 */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>联系邮箱（可选）</Text>
          <TextInput
            style={styles.textInput}
            placeholder="用于接收处理结果通知"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="联系邮箱"
            accessibilityHint="可选，用于接收反馈处理结果"
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderOptions = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="附加选项"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>附加选项</Text>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchContent}>
            <Text style={styles.switchLabel}>包含设备信息</Text>
            <Text style={styles.switchDescription}>
              帮助我们更好地诊断技术问题
            </Text>
          </View>
          <Switch
            value={includeDeviceInfo}
            onValueChange={(value) => {
              setIncludeDeviceInfo(value);
              screenReader.announce(`设备信息${value ? '已包含' : '已排除'}`);
            }}
            trackColor={{ false: '#e2e8f0', true: '#10b981' }}
            thumbColor={includeDeviceInfo ? '#FFFFFF' : '#64748b'}
            accessible={true}
            accessibilityLabel="包含设备信息开关"
            accessibilityRole="switch"
          />
        </View>
        
        <View style={styles.switchContainer}>
          <View style={styles.switchContent}>
            <Text style={styles.switchLabel}>包含应用日志</Text>
            <Text style={styles.switchDescription}>
              包含最近的应用使用日志（不含个人信息）
            </Text>
          </View>
          <Switch
            value={includeLogs}
            onValueChange={(value) => {
              setIncludeLogs(value);
              screenReader.announce(`应用日志${value ? '已包含' : '已排除'}`);
            }}
            trackColor={{ false: '#e2e8f0', true: '#10b981' }}
            thumbColor={includeLogs ? '#FFFFFF' : '#64748b'}
            accessible={true}
            accessibilityLabel="包含应用日志开关"
            accessibilityRole="switch"
          />
        </View>
      </View>
    </AccessibilityWrapper>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="反馈提交页面头部"
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
          <Text style={styles.headerTitle}>提交反馈</Text>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('FeedbackHistoryScreen')}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="反馈历史"
            accessibilityHint="查看已提交的反馈"
          >
            <Text style={styles.historyButtonText}>📋</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 反馈类型选择 */}
        {renderFeedbackTypeSelector()}

        {/* 分类选择 */}
        {renderCategorySelector()}

        {/* 优先级选择 */}
        {renderPrioritySelector()}

        {/* 表单字段 */}
        {renderFormFields()}

        {/* 附加选项 */}
        {renderOptions()}

        {/* 提交按钮 */}
        <AccessibilityWrapper
          applyExtendedTouchTarget={true}
          applyHighContrast={true}
        >
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.disabledSubmitButton
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={submitting ? '正在提交反馈' : '提交反馈'}
              accessibilityState={{ disabled: submitting }}
            >
              <Text style={[
                styles.submitButtonText,
                submitting && styles.disabledSubmitButtonText
              ]}>
                {submitting ? '提交中...' : '提交反馈'}
              </Text>
            </TouchableOpacity>
          </View>
        </AccessibilityWrapper>

        {/* 底部说明 */}
        <AccessibilityWrapper applyHighContrast={true}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 您的反馈对我们非常重要。我们会认真对待每一条反馈，并尽快给您回复。
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
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  activeOptionButton: {
    borderColor: '#667eea',
    backgroundColor: '#eff6ff',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  activeOptionTitle: {
    color: '#667eea',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
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
  activeRadioButton: {
    borderColor: '#667eea',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea',
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeCategoryChip: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeCategoryChipText: {
    color: '#FFFFFF',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  activePriorityButton: {
    backgroundColor: '#eff6ff',
    borderColor: '#667eea',
  },
  criticalPriorityButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activePriorityButtonText: {
    color: '#667eea',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  submitContainer: {
    padding: 20,
  },
  submitButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledSubmitButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledSubmitButtonText: {
    color: '#e2e8f0',
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

export default FeedbackScreen;
