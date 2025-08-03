import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useSessionRecovery } from '@/hooks/useLearningProgress';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import { useInternationalization } from '@/hooks/useInternationalization';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { SessionRecoveryData } from '@/services/LearningProgressService';

interface SessionRecoveryModalProps {
  visible: boolean;
  onRecover: (recoveryData: SessionRecoveryData) => void;
  onDismiss: () => void;
  onCancel: () => void;
}

/**
 * SessionRecoveryModal - V2 会话恢复模态框
 * 提供智能会话恢复体验：进度展示、一键恢复、优雅取消
 */
const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  visible,
  onRecover,
  onDismiss,
  onCancel,
}) => {
  const { t, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const {
    recoveryData,
    loading,
    recoverSession,
    dismissRecovery,
    canRecover,
    progressSnapshot,
  } = useSessionRecovery();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    if (visible) {
      screenReader.announce('发现未完成的学习会话，可以继续学习');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleRecover = async () => {
    if (!recoveryData) return;

    try {
      const session = await recoverSession();
      if (session) {
        onRecover(recoveryData);
        screenReader.announceSuccess('学习会话已恢复');
      }
    } catch (error) {
      screenReader.announceError('恢复会话失败');
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissRecovery();
      onDismiss();
      screenReader.announce('已忽略未完成的会话');
    } catch (error) {
      screenReader.announceError('操作失败');
    }
  };

  const handleCancel = () => {
    onCancel();
    screenReader.announce('已取消操作');
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前`;
  };

  const getProgressText = (): string => {
    if (!progressSnapshot) return '';
    
    const completed = progressSnapshot.completedKeywords.length;
    const total = progressSnapshot.attempts > 0 ? Math.max(completed + 1, 5) : 5; // 假设总共5个关键词
    
    return `${completed}/${total}`;
  };

  if (!recoveryData || !canRecover) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <SafeAreaView style={styles.container}>
          <Animated.View 
            style={[
              styles.modal,
              getLayoutDirectionStyles(),
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            {/* 头部图标 */}
            <AccessibilityWrapper
              accessibilityRole="image"
              accessibilityLabel="会话恢复图标"
              applyHighContrast={true}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔄</Text>
              </View>
            </AccessibilityWrapper>

            {/* 标题和描述 */}
            <AccessibilityWrapper
              accessibilityRole="header"
              accessibilityLabel="会话恢复标题"
              applyHighContrast={true}
            >
              <Text style={styles.title}>继续学习</Text>
              <Text style={styles.subtitle}>
                发现您有一个未完成的学习会话
              </Text>
            </AccessibilityWrapper>

            {/* 会话信息 */}
            <AccessibilityWrapper
              accessibilityRole="group"
              accessibilityLabel="会话详情"
              applyHighContrast={true}
            >
              <View style={styles.sessionInfo}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionTitle}>
                    {recoveryData.storyId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.sessionTime}>
                    {formatTimeAgo(recoveryData.createdAt)}
                  </Text>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>学习进度</Text>
                    <Text style={styles.progressValue}>
                      {getProgressText()}
                    </Text>
                  </View>
                  
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          width: `${(progressSnapshot?.completedKeywords.length || 0) * 20}%` 
                        }
                      ]}
                    />
                  </View>
                </View>

                {progressSnapshot?.currentKeyword && (
                  <View style={styles.currentKeyword}>
                    <Text style={styles.currentKeywordLabel}>当前关键词：</Text>
                    <Text style={styles.currentKeywordValue}>
                      {progressSnapshot.currentKeyword}
                    </Text>
                  </View>
                )}

                <View style={styles.sessionStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>学习模式</Text>
                    <Text style={styles.statValue}>
                      {recoveryData.mode === 'context_guessing' ? '情境猜词' :
                       recoveryData.mode === 'focus_mode' ? '专注模式' :
                       recoveryData.mode === 'pronunciation' ? '发音练习' :
                       recoveryData.mode === 'rescue_mode' ? '救援模式' : '学习模式'}
                    </Text>
                  </View>
                  
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>尝试次数</Text>
                    <Text style={styles.statValue}>
                      {progressSnapshot?.attempts || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </AccessibilityWrapper>

            {/* 操作按钮 */}
            <AccessibilityWrapper
              accessibilityRole="group"
              accessibilityLabel="操作选项"
              applyExtendedTouchTarget={true}
              applyHighContrast={true}
            >
              <View style={[styles.actions, getLayoutDirectionStyles()]}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleDismiss}
                  disabled={loading}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="忽略会话"
                  accessibilityHint="忽略这个未完成的学习会话"
                >
                  <Text style={styles.secondaryButtonText}>忽略</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleRecover}
                  disabled={loading}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="继续学习"
                  accessibilityHint="恢复并继续这个学习会话"
                >
                  <Text style={styles.primaryButtonText}>
                    {loading ? '恢复中...' : '继续学习'}
                  </Text>
                </TouchableOpacity>
              </View>
            </AccessibilityWrapper>

            {/* 关闭按钮 */}
            <AccessibilityWrapper
              accessibilityRole="button"
              accessibilityLabel="关闭对话框"
              applyExtendedTouchTarget={true}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="关闭"
                accessibilityHint="关闭会话恢复对话框"
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </AccessibilityWrapper>
          </Animated.View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  sessionInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  sessionTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  currentKeyword: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  currentKeywordLabel: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  currentKeywordValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    backgroundColor: '#eff6ff',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  primaryButton: {
    flex: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
});

export default SessionRecoveryModal;
