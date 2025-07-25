import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import {useAppStore} from '@/store/useAppStore';

export const ProgressScreen: React.FC = () => {
  const {user, selectedInterest, userProgress} = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 标题 */}
        <View style={styles.header}>
          <Text style={styles.title}>学习进度</Text>
          <Text style={styles.subtitle}>跟踪你的学习成果</Text>
        </View>

        {/* 用户信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>用户信息</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>设备ID</Text>
            <Text style={styles.infoValue}>{user?.deviceId || '未知'}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>选择的兴趣</Text>
            <Text style={styles.infoValue}>
              {selectedInterest?.displayName || '未选择'}
            </Text>
          </View>
        </View>

        {/* 学习统计 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>学习统计</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userProgress.length}</Text>
              <Text style={styles.statLabel}>已学词汇</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProgress.filter(p => p.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>已完成</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userProgress.reduce((sum, p) => sum + p.attempts, 0)}
              </Text>
              <Text style={styles.statLabel}>总尝试</Text>
            </View>
          </View>
        </View>

        {/* 进度详情 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>详细进度</Text>
          {userProgress.length > 0 ? (
            userProgress.map((progress) => (
              <View key={progress.id} style={styles.progressCard}>
                <View style={styles.progressInfo}>
                  <Text style={styles.wordText}>
                    {progress.keyword?.word || '未知词汇'}
                  </Text>
                  <Text style={styles.translationText}>
                    {progress.keyword?.translation || ''}
                  </Text>
                </View>
                <View style={styles.progressStats}>
                  <Text style={[
                    styles.statusText,
                    progress.status === 'completed' && styles.completedStatus,
                    progress.status === 'unlocked' && styles.unlockedStatus,
                  ]}>
                    {progress.status === 'completed' ? '已完成' :
                     progress.status === 'unlocked' ? '已解锁' : '锁定'}
                  </Text>
                  <Text style={styles.attemptsText}>
                    {progress.correctAttempts}/{progress.attempts}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>还没有学习记录</Text>
              <Text style={styles.emptySubtext}>
                开始学习来查看你的进度吧！
              </Text>
            </View>
          )}
        </View>
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
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    color: '#666666',
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#999999',
  },
  completedStatus: {
    color: '#28a745',
  },
  unlockedStatus: {
    color: '#007AFF',
  },
  attemptsText: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});
