import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import UserStateService, { SessionState } from '@/services/UserStateService';
import { AnalyticsService } from '@/services/AnalyticsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SessionRecoveryModalProps {
  visible: boolean;
  onRestore: (sessionState: SessionState) => void;
  onDiscard: () => void;
  onClose: () => void;
  sessionState: SessionState;
}

/**
 * SessionRecoveryModal - V2 会话恢复模态框
 * 当检测到未完成的学习会话时，提供恢复选项
 */
const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  visible,
  onRestore,
  onDiscard,
  onClose,
  sessionState,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      analyticsService.track('session_recovery_modal_shown', {
        sessionId: sessionState.sessionId,
        userId: sessionState.userId,
        timeSinceLastActivity: Date.now() - new Date(sessionState.lastActivityTime).getTime(),
        timestamp: Date.now(),
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleRestore = () => {
    analyticsService.track('session_recovery_restore_selected', {
      sessionId: sessionState.sessionId,
      userId: sessionState.userId,
      timestamp: Date.now(),
    });

    onRestore(sessionState);
  };

  const handleDiscard = () => {
    analyticsService.track('session_recovery_discard_selected', {
      sessionId: sessionState.sessionId,
      userId: sessionState.userId,
      timestamp: Date.now(),
    });

    onDiscard();
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return '刚刚';
    if (diffMins < 60) return `${diffMins}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${diffDays}天前`;
  };

  const getSessionDescription = (): string => {
    const { sessionProgress, currentChapterId, currentPhase } = sessionState;
    
    if (sessionProgress.keywordsCompleted > 0) {
      return `已完成 ${sessionProgress.keywordsCompleted}/${sessionProgress.totalKeywords} 个单词`;
    }
    
    if (currentPhase === 'context_guessing') {
      return '正在进行情景猜义';
    }
    
    if (currentPhase === 'pronunciation_training') {
      return '正在进行发音训练';
    }
    
    return '学习进行中';
  };

  const getProgressPercentage = (): number => {
    const { sessionProgress } = sessionState;
    if (sessionProgress.totalKeywords === 0) return 0;
    return (sessionProgress.keywordsCompleted / sessionProgress.totalKeywords) * 100;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔄</Text>
            </View>
            <Text style={styles.title}>发现未完成的学习</Text>
            <Text style={styles.subtitle}>
              {formatTimeAgo(sessionState.lastActivityTime)}
            </Text>
          </View>

          {/* Session Info */}
          <View style={styles.sessionInfo}>
            <View style={styles.sessionDetail}>
              <Text style={styles.sessionLabel}>学习状态</Text>
              <Text style={styles.sessionValue}>{getSessionDescription()}</Text>
            </View>

            {sessionState.sessionProgress.totalKeywords > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getProgressPercentage()}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(getProgressPercentage())}% 完成
                </Text>
              </View>
            )}

            {sessionState.sessionProgress.totalAnswers > 0 && (
              <View style={styles.sessionDetail}>
                <Text style={styles.sessionLabel}>正确率</Text>
                <Text style={styles.sessionValue}>
                  {Math.round((sessionState.sessionProgress.correctAnswers / sessionState.sessionProgress.totalAnswers) * 100)}%
                </Text>
              </View>
            )}

            {(sessionState.focusModeActive || sessionState.rescueModeActive) && (
              <View style={styles.recoveryModeContainer}>
                <Text style={styles.recoveryModeText}>
                  {sessionState.focusModeActive && '🎯 Focus Mode 已激活'}
                  {sessionState.rescueModeActive && '🆘 Rescue Mode 已激活'}
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
            >
              <Text style={styles.restoreButtonText}>继续学习</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.discardButton}
              onPress={handleDiscard}
            >
              <Text style={styles.discardButtonText}>重新开始</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 继续学习可以保持你的学习节奏
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: screenWidth - 48,
    maxWidth: 400,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  sessionInfo: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sessionDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sessionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  sessionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  recoveryModeContainer: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  recoveryModeText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  restoreButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  discardButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  discardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default SessionRecoveryModal;
