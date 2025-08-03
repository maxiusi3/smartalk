import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrivacyComplianceService, { AccountDeletionRequest } from '@/services/PrivacyComplianceService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * AccountDeletionScreen - V2 账户删除界面
 * 提供完整的账户删除流程：数据导出、宽限期、恢复选项
 */
const AccountDeletionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [deletionReason, setDeletionReason] = useState('');
  const [hasExportedData, setHasExportedData] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<AccountDeletionRequest | null>(null);

  const privacyService = PrivacyComplianceService.getInstance();
  const CONFIRMATION_TEXT = '删除我的账户';

  useEffect(() => {
    checkExistingRequest();
    screenReader.announcePageChange('账户删除', '管理账户删除请求和数据导出');
  }, []);

  const checkExistingRequest = async () => {
    if (!userProgress?.userId) return;

    try {
      const { deletionRequests } = privacyService.getUserRequests(userProgress.userId);
      const activeRequest = deletionRequests.find(
        req => req.status === 'grace_period' || req.status === 'pending'
      );
      
      if (activeRequest) {
        setExistingRequest(activeRequest);
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const handleDataExport = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      
      const requestId = await privacyService.requestDataExport(userProgress.userId, 'complete');
      
      Alert.alert(
        '数据导出已开始',
        '我们正在准备您的数据导出。完成后您将收到通知，可以在数据导出页面下载。',
        [
          {
            text: '查看导出状态',
            onPress: () => navigation.navigate('DataExportScreen'),
          },
          { text: '确定' },
        ]
      );
      
      setHasExportedData(true);
      screenReader.announce('数据导出请求已提交');

    } catch (error) {
      console.error('Error requesting data export:', error);
      Alert.alert('错误', '数据导出请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (!userProgress?.userId) return;

    if (confirmationText !== CONFIRMATION_TEXT) {
      Alert.alert('确认文本错误', `请输入"${CONFIRMATION_TEXT}"以确认删除`);
      return;
    }

    Alert.alert(
      '确认删除账户',
      '此操作将开始30天的宽限期。在此期间，您可以恢复账户。宽限期结束后，您的所有数据将被永久删除且无法恢复。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认删除',
          style: 'destructive',
          onPress: performAccountDeletion,
        },
      ]
    );
  };

  const performAccountDeletion = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      
      const requestId = await privacyService.requestAccountDeletion(
        userProgress.userId,
        deletionReason || undefined
      );
      
      Alert.alert(
        '删除请求已提交',
        '您的账户删除请求已提交。30天宽限期已开始，期间您可以随时恢复账户。我们已为您生成恢复码，请妥善保存。',
        [
          {
            text: '查看详情',
            onPress: () => {
              setExistingRequest(privacyService.getDeletionRequest(requestId));
            },
          },
        ]
      );
      
      screenReader.announce('账户删除请求已提交，宽限期已开始');

    } catch (error) {
      console.error('Error requesting account deletion:', error);
      Alert.alert('错误', '账户删除请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!existingRequest) return;

    Alert.alert(
      '取消删除请求',
      '您确定要取消账户删除请求吗？这将保留您的账户和所有数据。',
      [
        { text: '继续删除', style: 'cancel' },
        {
          text: '取消删除',
          onPress: performCancelDeletion,
        },
      ]
    );
  };

  const performCancelDeletion = async () => {
    if (!existingRequest?.recoveryToken) return;

    try {
      setLoading(true);
      
      await privacyService.cancelAccountDeletion(
        existingRequest.requestId,
        existingRequest.recoveryToken
      );
      
      Alert.alert(
        '删除已取消',
        '您的账户删除请求已成功取消。您的账户和数据将被保留。',
        [
          {
            text: '确定',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      
      screenReader.announce('账户删除请求已取消');

    } catch (error) {
      console.error('Error cancelling deletion:', error);
      Alert.alert('错误', '取消删除请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (endDate: string): number => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const renderExistingRequest = () => {
    if (!existingRequest) return null;

    const daysRemaining = getDaysRemaining(existingRequest.gracePeriodEndsAt);

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="现有删除请求"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>账户删除进行中</Text>
          
          <View style={styles.requestCard}>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusIcon}>⏳</Text>
              <View style={styles.statusInfo}>
                <Text style={styles.statusTitle}>宽限期进行中</Text>
                <Text style={styles.statusSubtitle}>
                  还有 {daysRemaining} 天可以恢复账户
                </Text>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>请求时间：</Text>
                {formatDate(existingRequest.requestedAt)}
              </Text>
              
              <Text style={styles.detailRow}>
                <Text style={styles.detailLabel}>宽限期结束：</Text>
                {formatDate(existingRequest.gracePeriodEndsAt)}
              </Text>
              
              {existingRequest.reason && (
                <Text style={styles.detailRow}>
                  <Text style={styles.detailLabel}>删除原因：</Text>
                  {existingRequest.reason}
                </Text>
              )}
            </View>

            <View style={styles.requestActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelDeletion}
                disabled={loading}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="取消删除请求"
              >
                <Text style={styles.cancelButtonText}>恢复账户</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderDeletionForm = () => {
    if (existingRequest) return null;

    return (
      <>
        {/* 数据导出提醒 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="数据导出提醒"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>删除前导出数据</Text>
            <Text style={styles.sectionDescription}>
              在删除账户前，我们强烈建议您导出学习数据。删除后将无法恢复这些数据。
            </Text>

            <TouchableOpacity
              style={[styles.exportButton, hasExportedData && styles.exportButtonCompleted]}
              onPress={handleDataExport}
              disabled={loading}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="导出我的数据"
            >
              <Text style={[styles.exportButtonText, hasExportedData && styles.exportButtonTextCompleted]}>
                {hasExportedData ? '✓ 已请求数据导出' : '📥 导出我的数据'}
              </Text>
            </TouchableOpacity>
          </View>
        </AccessibilityWrapper>

        {/* 删除原因 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="删除原因"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>删除原因（可选）</Text>
            <Text style={styles.sectionDescription}>
              告诉我们您删除账户的原因，这将帮助我们改进服务。
            </Text>

            <TextInput
              style={styles.reasonInput}
              value={deletionReason}
              onChangeText={setDeletionReason}
              placeholder="请输入删除原因..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="删除原因输入框"
            />
          </View>
        </AccessibilityWrapper>

        {/* 确认删除 */}
        <AccessibilityWrapper
          accessibilityRole="group"
          accessibilityLabel="确认删除"
          applyHighContrast={true}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>确认删除</Text>
            
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>重要提醒</Text>
                <Text style={styles.warningText}>
                  • 删除后有30天宽限期可以恢复{'\n'}
                  • 宽限期结束后数据将永久删除{'\n'}
                  • 学习进度、成就、设置将全部丢失{'\n'}
                  • 此操作无法撤销
                </Text>
              </View>
            </View>

            <Text style={styles.confirmationLabel}>
              请输入"{CONFIRMATION_TEXT}"以确认删除：
            </Text>
            
            <TextInput
              style={styles.confirmationInput}
              value={confirmationText}
              onChangeText={setConfirmationText}
              placeholder={CONFIRMATION_TEXT}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel="确认删除输入框"
            />

            <TouchableOpacity
              style={[
                styles.deleteButton,
                confirmationText !== CONFIRMATION_TEXT && styles.deleteButtonDisabled
              ]}
              onPress={handleAccountDeletion}
              disabled={loading || confirmationText !== CONFIRMATION_TEXT}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="删除我的账户"
            >
              <Text style={[
                styles.deleteButtonText,
                confirmationText !== CONFIRMATION_TEXT && styles.deleteButtonTextDisabled
              ]}>
                {loading ? '处理中...' : '删除我的账户'}
              </Text>
            </TouchableOpacity>
          </View>
        </AccessibilityWrapper>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="账户删除页面头部"
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
          
          <Text style={styles.headerTitle}>账户删除</Text>
          
          <View style={styles.headerRight} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderExistingRequest()}
        {renderDeletionForm()}
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
  requestCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fbbf24',
    borderRadius: 12,
    padding: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#a16207',
  },
  requestDetails: {
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    fontSize: 14,
    color: '#92400e',
  },
  detailLabel: {
    fontWeight: '600',
  },
  requestActions: {
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonCompleted: {
    backgroundColor: '#10b981',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportButtonTextCompleted: {
    color: '#FFFFFF',
  },
  reasonInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    minHeight: 100,
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 20,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#991b1b',
    lineHeight: 20,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  confirmationInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1e293b',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  deleteButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default AccountDeletionScreen;
