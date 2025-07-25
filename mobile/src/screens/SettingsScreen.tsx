import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

import {useAppStore} from '@/store/useAppStore';

export const SettingsScreen: React.FC = () => {
  const {
    isDarkMode,
    language,
    user,
    selectedInterest,
    setDarkMode,
    setLanguage,
    reset,
  } = useAppStore();

  const handleLanguageToggle = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  const handleResetData = () => {
    Alert.alert(
      '重置数据',
      '确定要重置所有学习数据吗？此操作不可撤销。',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '确定',
          style: 'destructive',
          onPress: () => {
            reset();
            Alert.alert('成功', '数据已重置');
          },
        },
      ]
    );
  };

  const SettingItem: React.FC<{
    title: string;
    subtitle?: string;
    rightComponent?: React.ReactNode;
    onPress?: () => void;
  }> = ({title, subtitle, rightComponent, onPress}) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>设置</Text>
          <Text style={styles.subtitle}>个性化你的学习体验</Text>
        </View>

        {/* 用户信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用户信息</Text>
          <SettingItem
            title="设备ID"
            subtitle={user?.deviceId || '未知'}
          />
          <SettingItem
            title="选择的兴趣"
            subtitle={selectedInterest?.displayName || '未选择'}
          />
          <SettingItem
            title="注册时间"
            subtitle={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
          />
        </View>

        {/* 应用设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>应用设置</Text>
          <SettingItem
            title="深色模式"
            subtitle="切换应用主题"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={setDarkMode}
                trackColor={{false: '#e0e0e0', true: '#007AFF'}}
                thumbColor={isDarkMode ? '#ffffff' : '#ffffff'}
              />
            }
          />
          <SettingItem
            title="语言设置"
            subtitle={language === 'zh' ? '中文' : 'English'}
            rightComponent={
              <TouchableOpacity
                style={styles.languageButton}
                onPress={handleLanguageToggle}>
                <Text style={styles.languageButtonText}>
                  {language === 'zh' ? 'EN' : '中'}
                </Text>
              </TouchableOpacity>
            }
          />
        </View>

        {/* 学习设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习设置</Text>
          <SettingItem
            title="学习提醒"
            subtitle="每日学习提醒通知"
            rightComponent={
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{false: '#e0e0e0', true: '#007AFF'}}
                thumbColor="#ffffff"
              />
            }
          />
          <SettingItem
            title="音频质量"
            subtitle="高质量音频（消耗更多流量）"
            rightComponent={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{false: '#e0e0e0', true: '#007AFF'}}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>
          <SettingItem
            title="重置学习数据"
            subtitle="清除所有学习进度和设置"
            onPress={handleResetData}
            rightComponent={
              <Text style={styles.dangerText}>重置</Text>
            }
          />
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          <SettingItem
            title="版本信息"
            subtitle="SmarTalk MVP v1.0.0"
          />
          <SettingItem
            title="隐私政策"
            subtitle="了解我们如何保护你的隐私"
            onPress={() => Alert.alert('隐私政策', '隐私政策页面开发中')}
          />
          <SettingItem
            title="用户协议"
            subtitle="查看使用条款"
            onPress={() => Alert.alert('用户协议', '用户协议页面开发中')}
          />
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  languageButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
