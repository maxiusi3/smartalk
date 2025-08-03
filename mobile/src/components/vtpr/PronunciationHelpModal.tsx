import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Keyword {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  phoneticTips?: string[];
  contextClues?: string[];
  rescueVideoUrl?: string;
}

interface PronunciationHelpModalProps {
  visible: boolean;
  keyword: Keyword;
  onClose: () => void;
  onPronunciationAssessment: () => void;
}

/**
 * PronunciationHelpModal组件 - V2 Rescue Mode
 * 显示口型视频、发音技巧和音标帮助
 */
const PronunciationHelpModal: React.FC<PronunciationHelpModalProps> = ({
  visible,
  keyword,
  onClose,
  onPronunciationAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'tips' | 'phonetic'>('video');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

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

  const renderVideoTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>👄 口型示范</Text>
      
      {/* 视频播放器占位符 */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoIcon}>🎬</Text>
          <Text style={styles.videoText}>口型示范视频</Text>
          <Text style={styles.videoSubtext}>观察嘴型和舌位</Text>
        </View>
      </View>
      
      <Text style={styles.instructionText}>
        👀 仔细观察说话者的嘴型变化
        {'\n'}🗣️ 模仿舌头和嘴唇的位置
        {'\n'}🔄 可以重复播放多次练习
      </Text>
    </View>
  );

  const renderTipsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🎵 发音技巧</Text>
      
      <View style={styles.tipsContainer}>
        <View style={styles.wordDisplay}>
          <Text style={styles.word}>{keyword.word}</Text>
          <Text style={styles.pronunciation}>{keyword.pronunciation}</Text>
        </View>
        
        <View style={styles.tipsContent}>
          {keyword.phoneticTips && keyword.phoneticTips.length > 0 ? (
            keyword.phoneticTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>💡</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))
          ) : (
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>💡</Text>
              <Text style={styles.tipText}>专注于重音和语调，多听几遍原音</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderPhoneticTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>📝 音标解析</Text>
      
      <View style={styles.phoneticContainer}>
        <View style={styles.phoneticDisplay}>
          <Text style={styles.phoneticWord}>{keyword.word}</Text>
          <Text style={styles.phoneticSymbols}>
            {keyword.pronunciation || '/wɜːrd/'}
          </Text>
        </View>
        
        <View style={styles.phoneticBreakdown}>
          <Text style={styles.breakdownTitle}>音标分解：</Text>
          <Text style={styles.breakdownText}>
            • 每个符号代表一个音素
            {'\n'}• /ˈ/ 表示重音位置
            {'\n'}• 长音符号 /ː/ 要拉长发音
            {'\n'}• 注意元音和辅音的区别
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTabButtons = () => (
    <View style={styles.tabButtons}>
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'video' && styles.activeTabButton]}
        onPress={() => setActiveTab('video')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'video' && styles.activeTabButtonText]}>
          👄 口型
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'tips' && styles.activeTabButton]}
        onPress={() => setActiveTab('tips')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'tips' && styles.activeTabButtonText]}>
          🎵 技巧
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tabButton, activeTab === 'phonetic' && styles.activeTabButton]}
        onPress={() => setActiveTab('phonetic')}
      >
        <Text style={[styles.tabButtonText, activeTab === 'phonetic' && styles.activeTabButtonText]}>
          📝 音标
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={styles.assessmentButton}
        onPress={onPronunciationAssessment}
      >
        <Text style={styles.assessmentButtonText}>🎤 测试我的发音</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>继续学习</Text>
      </TouchableOpacity>
    </View>
  );

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
            <Text style={styles.headerTitle}>🆘 发音救援</Text>
            <TouchableOpacity style={styles.headerCloseButton} onPress={onClose}>
              <Text style={styles.headerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Tab Buttons */}
          {renderTabButtons()}
          
          {/* Tab Content */}
          <View style={styles.contentContainer}>
            {activeTab === 'video' && renderVideoTab()}
            {activeTab === 'tips' && renderTipsTab()}
            {activeTab === 'phonetic' && renderPhoneticTab()}
          </View>
          
          {/* Action Buttons */}
          {renderActionButtons()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCloseText: {
    fontSize: 16,
    color: '#64748b',
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#667eea',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tabContent: {
    flex: 1,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  videoContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  videoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  videoSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    textAlign: 'center',
  },
  tipsContainer: {
    flex: 1,
  },
  wordDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  word: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  pronunciation: {
    fontSize: 18,
    color: '#667eea',
    fontStyle: 'italic',
  },
  tipsContent: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    fontSize: 16,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 22,
  },
  phoneticContainer: {
    flex: 1,
  },
  phoneticDisplay: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
  },
  phoneticWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  phoneticSymbols: {
    fontSize: 24,
    color: '#667eea',
    fontFamily: 'monospace',
  },
  phoneticBreakdown: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  breakdownText: {
    fontSize: 14,
    color: '#a16207',
    lineHeight: 20,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  assessmentButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  assessmentButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
});

export default PronunciationHelpModal;
