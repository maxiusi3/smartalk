import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PrivacyComplianceService, { ConsentType, UserConsent } from '@/services/PrivacyComplianceService';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import { useUserState } from '@/contexts/UserStateContext';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';

/**
 * PrivacyPolicyScreen - V2 隐私政策和用户同意界面
 * 提供完整的隐私保护：政策展示、同意管理、数据控制
 */
const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const { userProgress } = useUserState();

  const [userConsent, setUserConsent] = useState<UserConsent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const privacyService = PrivacyComplianceService.getInstance();

  useEffect(() => {
    loadUserConsent();
    screenReader.announcePageChange('隐私政策', '查看隐私政策和管理数据使用同意');
  }, []);

  const loadUserConsent = async () => {
    if (!userProgress?.userId) return;

    try {
      setLoading(true);
      const consent = privacyService.getUserConsent(userProgress.userId);
      setUserConsent(consent);
    } catch (error) {
      console.error('Error loading user consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (consentType: ConsentType, granted: boolean) => {
    if (!userProgress?.userId || !userConsent) return;

    try {
      setSaving(true);
      
      await privacyService.updateUserConsent(userProgress.userId, consentType, granted);
      
      // 更新本地状态
      const updatedConsent = { ...userConsent };
      updatedConsent.consents[consentType] = {
        granted,
        timestamp: new Date().toISOString(),
        version: privacyService.getPrivacyPolicyVersion(),
      };
      updatedConsent.lastUpdated = new Date().toISOString();
      
      setUserConsent(updatedConsent);
      
      screenReader.announce(`${getConsentTitle(consentType)}已${granted ? '启用' : '禁用'}`);

    } catch (error) {
      console.error('Error updating consent:', error);
      Alert.alert('错误', '更新设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const getConsentTitle = (type: ConsentType): string => {
    const titles: { [key in ConsentType]: string } = {
      analytics: '使用分析',
      personalization: '个性化推荐',
      marketing: '营销通信',
      crash_reporting: '崩溃报告',
      performance: '性能监控',
      location: '位置服务',
      camera: '摄像头访问',
      microphone: '麦克风访问',
      notifications: '推送通知',
      cloud_sync: '云端同步',
    };
    return titles[type];
  };

  const getConsentDescription = (type: ConsentType): string => {
    const descriptions: { [key in ConsentType]: string } = {
      analytics: '收集匿名使用数据以改进应用体验',
      personalization: '基于学习历史提供个性化内容推荐',
      marketing: '发送产品更新和学习建议',
      crash_reporting: '自动发送崩溃报告以修复问题',
      performance: '监控应用性能以优化用户体验',
      location: '提供基于位置的学习内容',
      camera: '用于拍照和视频学习功能',
      microphone: '用于语音识别和发音练习',
      notifications: '发送学习提醒和进度通知',
      cloud_sync: '在设备间同步学习进度',
    };
    return descriptions[type];
  };

  const renderConsentSection = () => {
    if (!userConsent) return null;

    const consentTypes: ConsentType[] = [
      'analytics',
      'personalization',
      'crash_reporting',
      'performance',
      'notifications',
      'cloud_sync',
    ];

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="数据使用同意设置"
        applyHighContrast={true}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据使用同意</Text>
          <Text style={styles.sectionDescription}>
            您可以控制我们如何使用您的数据。这些设置可以随时更改。
          </Text>

          {consentTypes.map(type => (
            <View key={type} style={styles.consentRow}>
              <View style={styles.consentInfo}>
                <Text style={styles.consentTitle}>
                  {getConsentTitle(type)}
                </Text>
                <Text style={styles.consentDescription}>
                  {getConsentDescription(type)}
                </Text>
              </View>
              
              <Switch
                value={userConsent.consents[type]?.granted || false}
                onValueChange={(value) => handleConsentChange(type, value)}
                disabled={saving}
                trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                thumbColor={userConsent.consents[type]?.granted ? '#FFFFFF' : '#94a3b8'}
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel={`${getConsentTitle(type)}开关`}
                accessibilityState={{ checked: userConsent.consents[type]?.granted || false }}
              />
            </View>
          ))}
        </View>
      </AccessibilityWrapper>
    );
  };

  const renderPrivacyPolicy = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="隐私政策内容"
      applyHighContrast={true}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>隐私政策</Text>
        
        <View style={styles.policyContent}>
          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>1. 信息收集{'\n'}</Text>
            我们收集您提供的信息（如学习偏好）和自动收集的信息（如使用统计）。我们不会收集敏感个人信息，除非您明确同意。
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>2. 信息使用{'\n'}</Text>
            我们使用收集的信息来：{'\n'}
            • 提供和改进学习服务{'\n'}
            • 个性化您的学习体验{'\n'}
            • 发送重要通知和更新{'\n'}
            • 分析使用模式以优化应用
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>3. 信息共享{'\n'}</Text>
            我们不会出售、交易或转让您的个人信息给第三方。我们可能与服务提供商共享匿名化数据以改进服务质量。
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>4. 数据安全{'\n'}</Text>
            我们采用行业标准的安全措施保护您的数据，包括加密传输和存储、访问控制和定期安全审计。
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>5. 您的权利{'\n'}</Text>
            您有权：{'\n'}
            • 访问和更新您的个人信息{'\n'}
            • 导出您的学习数据{'\n'}
            • 删除您的账户和数据{'\n'}
            • 撤回数据使用同意
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>6. 数据保留{'\n'}</Text>
            我们会根据法律要求和业务需要保留您的数据。学习进度数据保留3年，分析数据保留2年，临时文件保留1周。
          </Text>

          <Text style={styles.policySection}>
            <Text style={styles.policyHeading}>7. 联系我们{'\n'}</Text>
            如有隐私相关问题，请联系：privacy@smartalk.app
          </Text>
        </View>
      </View>
    </AccessibilityWrapper>
  );

  const renderActionButtons = () => (
    <AccessibilityWrapper
      accessibilityRole="group"
      accessibilityLabel="隐私管理操作"
      applyHighContrast={true}
    >
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('DataExportScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="导出我的数据"
          accessibilityHint="下载您的学习数据副本"
        >
          <Text style={styles.actionButtonText}>📥 导出我的数据</Text>
          <Text style={styles.actionButtonSubtext}>
            下载您的学习进度和设置
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AccountDeletionScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="删除我的账户"
          accessibilityHint="永久删除您的账户和所有数据"
        >
          <Text style={styles.actionButtonText}>🗑️ 删除我的账户</Text>
          <Text style={styles.actionButtonSubtext}>
            永久删除账户和所有数据
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('TermsOfServiceScreen')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="服务条款"
          accessibilityHint="查看服务条款和使用协议"
        >
          <Text style={styles.actionButtonText}>📋 服务条款</Text>
          <Text style={styles.actionButtonSubtext}>
            查看使用协议和条款
          </Text>
        </TouchableOpacity>
      </View>
    </AccessibilityWrapper>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载隐私设置...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="隐私政策页面头部"
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
          
          <Text style={styles.headerTitle}>隐私政策</Text>
          
          <View style={styles.headerRight}>
            <Text style={styles.versionText}>
              v{privacyService.getPrivacyPolicyVersion()}
            </Text>
          </View>
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 同意设置 */}
        {renderConsentSection()}

        {/* 隐私政策内容 */}
        {renderPrivacyPolicy()}

        {/* 操作按钮 */}
        {renderActionButtons()}

        {/* 最后更新时间 */}
        {userConsent && (
          <AccessibilityWrapper
            accessibilityRole="text"
            accessibilityLabel="最后更新时间"
            applyHighContrast={true}
          >
            <View style={styles.updateInfo}>
              <Text style={styles.updateText}>
                最后更新：{new Date(userConsent.lastUpdated).toLocaleDateString('zh-CN')}
              </Text>
            </View>
          </AccessibilityWrapper>
        )}
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
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
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
    marginBottom: 20,
    lineHeight: 20,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  consentInfo: {
    flex: 1,
    marginRight: 16,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  policyContent: {
    gap: 20,
  },
  policySection: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  policyHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  updateInfo: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  updateText: {
    fontSize: 12,
    color: '#94a3b8',
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

export default PrivacyPolicyScreen;
