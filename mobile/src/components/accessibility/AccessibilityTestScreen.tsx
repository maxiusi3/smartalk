import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAccessibility, useScreenReader, useAccessibilityStyles, useVoiceControl } from '@/hooks/useAccessibility';
import AccessibilityWrapper from './AccessibilityWrapper';

/**
 * AccessibilityTestScreen - V2 无障碍功能测试界面
 * 用于测试和演示所有无障碍功能
 */
const AccessibilityTestScreen: React.FC = () => {
  const navigation = useNavigation();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');

  const accessibility = useAccessibility();
  const screenReader = useScreenReader();
  const accessibilityStyles = useAccessibilityStyles();
  const voiceControl = useVoiceControl();

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAccessibilityTests = async () => {
    setCurrentTest('运行无障碍测试...');
    setTestResults([]);

    // 测试1: 屏幕阅读器公告
    setCurrentTest('测试屏幕阅读器公告');
    screenReader.announce('这是一个测试公告');
    addTestResult('✅ 屏幕阅读器公告测试完成');

    // 测试2: 页面变化公告
    setCurrentTest('测试页面变化公告');
    screenReader.announcePageChange('测试页面', '这是一个用于测试无障碍功能的页面');
    addTestResult('✅ 页面变化公告测试完成');

    // 测试3: 按钮操作公告
    setCurrentTest('测试按钮操作公告');
    screenReader.announceButtonAction('测试按钮', '已点击');
    addTestResult('✅ 按钮操作公告测试完成');

    // 测试4: 进度更新公告
    setCurrentTest('测试进度更新公告');
    screenReader.announceProgressUpdate(3, 10, '学习进度');
    addTestResult('✅ 进度更新公告测试完成');

    // 测试5: 成功和错误公告
    setCurrentTest('测试成功和错误公告');
    screenReader.announceSuccess('操作成功完成');
    setTimeout(() => {
      screenReader.announceError('这是一个测试错误');
    }, 1000);
    addTestResult('✅ 成功和错误公告测试完成');

    // 测试6: 触觉反馈
    setCurrentTest('测试触觉反馈');
    accessibility.provideHapticFeedback('success');
    accessibility.provideHapticFeedback('warning');
    accessibility.provideHapticFeedback('error');
    addTestResult('✅ 触觉反馈测试完成');

    // 测试7: 视觉反馈
    setCurrentTest('测试视觉反馈');
    accessibility.provideVisualFeedback('这是一个视觉反馈测试');
    addTestResult('✅ 视觉反馈测试完成');

    // 测试8: 语音命令
    setCurrentTest('测试语音命令');
    const commands = ['返回', '开始学习', '播放音频', '显示提示', '下一个'];
    commands.forEach(command => {
      const action = accessibility.handleVoiceCommand(command);
      addTestResult(`🎤 语音命令 "${command}" -> ${action || '未识别'}`);
    });

    setCurrentTest('所有测试完成');
    addTestResult('🎉 所有无障碍功能测试完成');
  };

  const testHighContrast = () => {
    const styles = accessibility.getHighContrastStyles();
    Alert.alert('高对比度样式', JSON.stringify(styles, null, 2));
    addTestResult('🎨 高对比度样式测试完成');
  };

  const testFontSize = () => {
    const multiplier = accessibility.getFontSizeMultiplier();
    Alert.alert('字体大小倍数', `当前倍数: ${multiplier}`);
    addTestResult(`📝 字体大小倍数: ${multiplier}`);
  };

  const testColorBlindness = () => {
    const colors = ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'];
    const results = colors.map(color => ({
      original: color,
      adjusted: accessibility.getColorBlindnessColor(color),
    }));
    
    Alert.alert('色盲支持测试', JSON.stringify(results, null, 2));
    addTestResult('🌈 色盲支持测试完成');
  };

  const testVoiceControl = () => {
    if (voiceControl.isEnabled) {
      if (voiceControl.isListening) {
        voiceControl.stopListening();
        addTestResult('🎤 语音控制已停止');
      } else {
        voiceControl.startListening();
        addTestResult('🎤 语音控制已启动');
      }
    } else {
      addTestResult('❌ 语音控制未启用');
    }
  };

  const renderTestButton = (title: string, onPress: () => void, description: string) => (
    <AccessibilityWrapper
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      applyExtendedTouchTarget={true}
      applyFocusIndicator={true}
      applyHighContrast={true}
    >
      <TouchableOpacity
        style={accessibilityStyles.getAccessibleButtonStyle(styles.testButton)}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={description}
      >
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.testButtonText)}>
          {title}
        </Text>
      </TouchableOpacity>
    </AccessibilityWrapper>
  );

  const renderStatusInfo = () => (
    <AccessibilityWrapper
      applyHighContrast={true}
      applyLargeText={true}
    >
      <View style={styles.statusContainer}>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusTitle)}>
          无障碍状态
        </Text>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusText)}>
          屏幕阅读器: {screenReader.isEnabled() ? '✅ 启用' : '❌ 禁用'}
        </Text>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusText)}>
          高对比度: {accessibility.isHighContrastEnabled() ? '✅ 启用' : '❌ 禁用'}
        </Text>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusText)}>
          大字体: {accessibility.isLargeTextEnabled() ? '✅ 启用' : '❌ 禁用'}
        </Text>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusText)}>
          减少动画: {accessibility.shouldReduceMotion() ? '✅ 启用' : '❌ 禁用'}
        </Text>
        <Text style={accessibilityStyles.getAccessibleTextStyle(styles.statusText)}>
          语音控制: {voiceControl.isEnabled ? '✅ 启用' : '❌ 禁用'}
        </Text>
      </View>
    </AccessibilityWrapper>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="无障碍测试页面头部"
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
          <Text style={accessibilityStyles.getAccessibleTextStyle(styles.headerTitle)}>
            无障碍测试
          </Text>
          <View style={styles.placeholder} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 状态信息 */}
        {renderStatusInfo()}

        {/* 当前测试 */}
        {currentTest && (
          <AccessibilityWrapper applyHighContrast={true}>
            <View style={styles.currentTestContainer}>
              <Text style={accessibilityStyles.getAccessibleTextStyle(styles.currentTestText)}>
                {currentTest}
              </Text>
            </View>
          </AccessibilityWrapper>
        )}

        {/* 测试按钮 */}
        <AccessibilityWrapper applyHighContrast={true}>
          <View style={styles.testSection}>
            <Text style={accessibilityStyles.getAccessibleTextStyle(styles.sectionTitle)}>
              功能测试
            </Text>
            
            {renderTestButton(
              '运行所有测试',
              runAccessibilityTests,
              '运行所有无障碍功能测试'
            )}
            
            {renderTestButton(
              '测试高对比度',
              testHighContrast,
              '测试高对比度样式功能'
            )}
            
            {renderTestButton(
              '测试字体大小',
              testFontSize,
              '测试字体大小调整功能'
            )}
            
            {renderTestButton(
              '测试色盲支持',
              testColorBlindness,
              '测试色盲用户颜色调整功能'
            )}
            
            {renderTestButton(
              voiceControl.isListening ? '停止语音控制' : '启动语音控制',
              testVoiceControl,
              voiceControl.isListening ? '停止语音命令监听' : '启动语音命令监听'
            )}
          </View>
        </AccessibilityWrapper>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <AccessibilityWrapper
            applyHighContrast={true}
            applyLargeText={true}
            accessibilityRole="log"
            accessibilityLabel="测试结果日志"
          >
            <View style={styles.resultsSection}>
              <Text style={accessibilityStyles.getAccessibleTextStyle(styles.sectionTitle)}>
                测试结果
              </Text>
              {testResults.map((result, index) => (
                <Text 
                  key={index} 
                  style={accessibilityStyles.getAccessibleTextStyle(styles.resultText)}
                  accessible={true}
                  accessibilityRole="text"
                >
                  {result}
                </Text>
              ))}
            </View>
          </AccessibilityWrapper>
        )}

        {/* 语音命令列表 */}
        <AccessibilityWrapper applyHighContrast={true}>
          <View style={styles.commandsSection}>
            <Text style={accessibilityStyles.getAccessibleTextStyle(styles.sectionTitle)}>
              可用语音命令
            </Text>
            {voiceControl.availableCommands.map((command, index) => (
              <View key={index} style={styles.commandItem}>
                <Text style={accessibilityStyles.getAccessibleTextStyle(styles.commandText)}>
                  "{command.command}" - {command.description}
                </Text>
              </View>
            ))}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  currentTestContainer: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  currentTestText: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600',
  },
  testSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  commandsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  commandItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  commandText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default AccessibilityTestScreen;
