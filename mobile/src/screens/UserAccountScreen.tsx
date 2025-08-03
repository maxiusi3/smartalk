import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import UserAccountService, { 
  UserAccount, 
  DataExportRequest, 
  AccountDeletionRequest,
  DataType 
} from '@/services/UserAccountService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * UserAccountScreen - V2 用户账户管理界面
 * 提供完整的账户管理功能：隐私设置、数据导出、账户删除、合规管理
 */
const UserAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [complianceStats, setComplianceStats] = useState<any>(null);
  const [exportRequests, setExportRequests] = useState<DataExportRequest[]>([]);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [loading, setLoading] = useState(false);

  const accountService = UserAccountService.getInstance();

  useEffect(() => {
    loadAccountData();
    screenReader.announcePageChange('账户管理', '管理个人账户、隐私设置和数据权限');
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);

      if (userProgress?.userId) {
        // 获取用户账户信息
        const account = accountService.getUserAccount(userProgress.userId);
        setUserAccount(account);

        // 获取合规统计
        const stats = accountService.getComplianceStatistics();
        setComplianceStats(stats);

        // 获取导出请求（模拟数据）
        setExportRequests([]);

        // 获取删除请求（模拟数据）
        setDeletionRequest(null);
      }

    } catch (error) {
      console.error('Error loading account data:', error);
      Alert.alert('错误', '加载账户数据失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const renderAccountInfo = () => {
    if (!userAccount) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="账户信息"
        applyHighContrast={true}
      >
        <View style={styles.accountSection}>
          <Text style={styles.accountSectionTitle}>账户信息</Text>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>用户名</Text>
            <Text style={styles.accountValue}>{userAccount.username}</Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>显示名称</Text>
            <Text style={styles.accountValue}>{userAccount.displayName}</Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>邮箱</Text>
            <Text style={styles.accountValue}>
              {userAccount.email || '未设置'}
              {userAccount.emailVerified && ' ✓'}
            </Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>注册时间</Text>
            <Text style={styles.accountValue}>
              {formatDate(userAccount.createdAt)}
            </Text>
          </View>
          
          <View style={styles.accountItem}>
            <Text style={styles.accountLabel}>账户状态</Text>
            <Text style={[
              styles.accountValue,
              userAccount.status === 'active' && styles.statusActive,
              userAccount.status === 'suspended' && styles.statusSuspended,
            ]}>
              {getStatusLabel(userAccount.status)}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPrivacySettings = () => {
    if (!userAccount) return null;

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="隐私设置"
        applyHighContrast={true}
      >
        <View style={styles.privacySection}>
          <Text style={styles.privacySectionTitle}>隐私设置</Text>
          
          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>学习数据分享</Text>
              <Text style={styles.privacyDescription}>
                允许分享学习进度用于改进服务
              </Text>
            </View>
            <Switch
              value={userAccount.privacySettings.learningDataSharing}
              onValueChange={(value) => updatePrivacySetting('learningDataSharing', value)}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="学习数据分享开关"
            />
          </View>

          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>分析数据收集</Text>
              <Text style={styles.privacyDescription}>
                收集使用数据以改进应用体验
              </Text>
            </View>
            <Switch
              value={!userAccount.privacySettings.analyticsOptOut}
              onValueChange={(value) => updatePrivacySetting('analyticsOptOut', !value)}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="分析数据收集开关"
            />
          </View>

          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>营销通讯</Text>
              <Text style={styles.privacyDescription}>
                接收产品更新和学习建议
              </Text>
            </View>
            <Switch
              value={!userAccount.privacySettings.marketingOptOut}
              onValueChange={(value) => updatePrivacySetting('marketingOptOut', !value)}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="营销通讯开关"
            />
          </View>

          <View style={styles.privacyItem}>
            <View style={styles.privacyInfo}>
              <Text style={styles.privacyLabel}>崩溃报告</Text>
              <Text style={styles.privacyDescription}>
                自动发送崩溃报告帮助修复问题
              </Text>
            </View>
            <Switch
              value={userAccount.privacySettings.crashReporting}
              onValueChange={(value) => updatePrivacySetting('crashReporting', value)}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="崩溃报告开关"
            />
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderDataManagement = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="数据管理"
      applyHighContrast={true}
    >
      <View style={styles.dataSection}>
        <Text style={styles.dataSectionTitle}>数据管理</Text>
        
        <TouchableOpacity
          style={styles.dataButton}
          onPress={() => requestDataExport()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="导出我的数据"
        >
          <View style={styles.dataButtonContent}>
            <Text style={styles.dataButtonTitle}>导出我的数据</Text>
            <Text style={styles.dataButtonDescription}>
              下载您的所有个人数据副本
            </Text>
          </View>
          <Text style={styles.dataButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dataButton}
          onPress={() => showDataTypes()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="查看数据类型"
        >
          <View style={styles.dataButtonContent}>
            <Text style={styles.dataButtonTitle}>数据类型说明</Text>
            <Text style={styles.dataButtonDescription}>
              了解我们收集和使用的数据类型
            </Text>
          </View>
          <Text style={styles.dataButtonArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.dataButton, styles.dangerButton]}
          onPress={() => requestAccountDeletion()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="删除账户"
        >
          <View style={styles.dataButtonContent}>
            <Text style={[styles.dataButtonTitle, styles.dangerText]}>删除账户</Text>
            <Text style={[styles.dataButtonDescription, styles.dangerText]}>
              永久删除您的账户和所有数据
            </Text>
          </View>
          <Text style={[styles.dataButtonArrow, styles.dangerText]}>→</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  const renderComplianceInfo = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="合规信息"
      applyHighContrast={true}
    >
      <View style={styles.complianceSection}>
        <Text style={styles.complianceSectionTitle}>合规信息</Text>
        
        {userAccount && (
          <View style={styles.complianceGrid}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>GDPR合规</Text>
              <Text style={[
                styles.complianceStatus,
                userAccount.compliance.gdprCompliant && styles.complianceActive
              ]}>
                {userAccount.compliance.gdprCompliant ? '✓ 合规' : '✗ 不合规'}
              </Text>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>CCPA合规</Text>
              <Text style={[
                styles.complianceStatus,
                userAccount.compliance.ccpaCompliant && styles.complianceActive
              ]}>
                {userAccount.compliance.ccpaCompliant ? '✓ 合规' : '✗ 不合规'}
              </Text>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>隐私政策</Text>
              <Text style={styles.complianceVersion}>
                v{userAccount.compliance.platformPolicyVersion}
              </Text>
            </View>

            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>同意日期</Text>
              <Text style={styles.complianceDate}>
                {formatDate(userAccount.gdprConsent.consentDate)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.policyButton}
          onPress={() => showPrivacyPolicy()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="查看隐私政策"
        >
          <Text style={styles.policyButtonText}>查看隐私政策</Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  // 事件处理方法
  const updatePrivacySetting = async (setting: string, value: boolean) => {
    if (!userProgress?.userId) return;

    try {
      const success = await accountService.updatePrivacySettings(
        userProgress.userId,
        { [setting]: value }
      );

      if (success) {
        // 重新加载账户数据
        loadAccountData();
        Alert.alert('设置已更新', '隐私设置已成功更新');
      } else {
        Alert.alert('更新失败', '无法更新隐私设置，请重试');
      }
    } catch (error) {
      Alert.alert('错误', '更新隐私设置时发生错误');
    }
  };

  const requestDataExport = () => {
    if (!userProgress?.userId) return;

    Alert.alert('导出数据', '选择要导出的数据类型', [
      { text: '所有数据', onPress: () => performDataExport(['all']) },
      { text: '学习数据', onPress: () => performDataExport(['learning_progress', 'achievements']) },
      { text: '个人资料', onPress: () => performDataExport(['profile']) },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const performDataExport = async (dataTypes: DataType[]) => {
    if (!userProgress?.userId) return;

    try {
      const requestId = await accountService.requestDataExport(
        userProgress.userId,
        dataTypes,
        'json'
      );

      Alert.alert(
        '导出请求已提交',
        `请求ID: ${requestId}\n\n我们将在24小时内处理您的请求，完成后会通过邮件通知您下载链接。`,
        [{ text: '确定', style: 'default' }]
      );

      loadAccountData(); // 刷新数据
    } catch (error) {
      Alert.alert('导出失败', '无法提交数据导出请求，请重试');
    }
  };

  const requestAccountDeletion = () => {
    Alert.alert(
      '删除账户',
      '此操作将永久删除您的账户和所有数据，且无法恢复。您确定要继续吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确认删除', 
          style: 'destructive',
          onPress: () => showDeletionOptions()
        },
      ]
    );
  };

  const showDeletionOptions = () => {
    Alert.alert('删除方式', '选择删除方式', [
      { 
        text: '立即删除', 
        onPress: () => performAccountDeletion('immediate', '用户主动删除')
      },
      { 
        text: '30天后删除', 
        onPress: () => performAccountDeletion('scheduled', '用户主动删除，30天缓冲期')
      },
      { text: '取消', style: 'cancel' },
    ]);
  };

  const performAccountDeletion = async (type: 'immediate' | 'scheduled', reason: string) => {
    if (!userProgress?.userId) return;

    try {
      const requestId = await accountService.requestAccountDeletion(
        userProgress.userId,
        reason,
        undefined,
        type
      );

      const message = type === 'immediate' ? 
        '您的账户删除请求已提交，我们将立即开始处理。' :
        '您的账户将在30天后删除，在此期间您可以取消删除请求。';

      Alert.alert(
        '删除请求已提交',
        `请求ID: ${requestId}\n\n${message}`,
        [{ text: '确定', style: 'default' }]
      );

      loadAccountData(); // 刷新数据
    } catch (error) {
      Alert.alert('删除失败', '无法提交账户删除请求，请重试');
    }
  };

  const showDataTypes = () => {
    Alert.alert(
      '数据类型说明',
      '我们收集以下类型的数据：\n\n' +
      '• 个人资料：用户名、邮箱、头像\n' +
      '• 学习进度：完成的课程、学习时间\n' +
      '• 成就数据：获得的徽章、里程碑\n' +
      '• 分析数据：使用统计、性能数据\n' +
      '• 偏好设置：应用设置、通知偏好\n' +
      '• 社交数据：分享记录、好友关系',
      [{ text: '关闭', style: 'default' }]
    );
  };

  const showPrivacyPolicy = () => {
    const policy = accountService.getCurrentPrivacyPolicy();
    if (policy) {
      Alert.alert(
        policy.title,
        policy.summary + '\n\n点击"查看完整版本"阅读详细内容。',
        [
          { text: '查看完整版本', onPress: () => {/* 打开完整隐私政策页面 */} },
          { text: '关闭', style: 'default' },
        ]
      );
    }
  };

  // 辅助方法
  const getStatusLabel = (status: string): string => {
    const labels: { [key: string]: string } = {
      active: '活跃',
      suspended: '暂停',
      deactivated: '停用',
      pending_deletion: '待删除',
      deleted: '已删除',
    };
    return labels[status] || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载账户数据...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="账户管理页面头部"
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
          
          <Text style={styles.headerTitle}>账户管理</Text>
          
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadAccountData}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="刷新数据"
          >
            <Text style={styles.refreshButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 账户信息 */}
        {renderAccountInfo()}

        {/* 隐私设置 */}
        {renderPrivacySettings()}

        {/* 数据管理 */}
        {renderDataManagement()}

        {/* 合规信息 */}
        {renderComplianceInfo()}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  accountSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accountSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  accountLabel: {
    fontSize: 16,
    color: '#64748b',
    flex: 1,
  },
  accountValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusActive: {
    color: '#10b981',
  },
  statusSuspended: {
    color: '#ef4444',
  },
  privacySection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  privacySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  dataSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  dataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 12,
  },
  dataButtonContent: {
    flex: 1,
  },
  dataButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  dataButtonDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  dataButtonArrow: {
    fontSize: 18,
    color: '#64748b',
    marginLeft: 12,
  },
  dangerButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  dangerText: {
    color: '#dc2626',
  },
  complianceSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  complianceSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  complianceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  complianceLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    textAlign: 'center',
  },
  complianceStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  complianceActive: {
    color: '#10b981',
  },
  complianceVersion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  complianceDate: {
    fontSize: 12,
    color: '#64748b',
  },
  policyButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  policyButtonText: {
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

export default UserAccountScreen;
