import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useAppStore} from '@/store/useAppStore';
import {ApiService} from '@/services/ApiService';
import {Drama} from '@/types/api';
import {RootStackParamList} from '@/navigation/AppNavigator';

type HomeNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const {selectedInterest, user, setCurrentDrama, setError} = useAppStore();
  
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedInterest) {
      loadDramas();
    }
  }, [selectedInterest]);

  const loadDramas = async () => {
    if (!selectedInterest) return;

    try {
      setLoading(true);
      const data = await ApiService.getDramasByInterest(selectedInterest.id);
      setDramas(data);
    } catch (error) {
      console.error('Failed to load dramas:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dramas');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = async (drama: Drama) => {
    if (!user) return;

    try {
      // 设置当前剧集
      setCurrentDrama(drama);

      // 记录开始学习事件
      await ApiService.recordEvent({
        userId: user.id,
        eventType: 'video_play_start',
        eventData: {
          dramaId: drama.id,
          dramaTitle: drama.title,
          timestamp: new Date().toISOString(),
        },
      });

      // 导航到学习界面
      navigation.navigate('Learning', {dramaId: drama.id});
    } catch (error) {
      console.error('Failed to start learning:', error);
      setError(error instanceof Error ? error.message : 'Failed to start learning');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载内容中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 欢迎区域 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>欢迎来到 SmarTalk</Text>
          <Text style={styles.welcomeSubtitle}>
            {selectedInterest?.displayName} 主题学习
          </Text>
        </View>

        {/* 今日推荐 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日推荐</Text>
          <Text style={styles.sectionSubtitle}>
            开始你的"首次致命接触"体验
          </Text>
        </View>

        {/* 剧集列表 */}
        <View style={styles.dramasContainer}>
          {dramas.map((drama) => (
            <TouchableOpacity
              key={drama.id}
              style={styles.dramaCard}
              onPress={() => handleStartLearning(drama)}>
              <View style={styles.dramaInfo}>
                <Text style={styles.dramaTitle}>{drama.title}</Text>
                <Text style={styles.dramaDescription}>{drama.description}</Text>
                <View style={styles.dramaMetadata}>
                  <Text style={styles.duration}>{drama.duration}秒</Text>
                  <Text style={styles.difficulty}>
                    {drama.difficulty === 'beginner' ? '初级' : 
                     drama.difficulty === 'intermediate' ? '中级' : '高级'}
                  </Text>
                </View>
              </View>
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 学习提示 */}
        <View style={styles.tipSection}>
          <Text style={styles.tipTitle}>💡 学习提示</Text>
          <Text style={styles.tipText}>
            每个迷你剧包含15个核心词汇，通过音画匹配的方式帮助你理解和记忆。
            建议在安静的环境中学习，获得最佳体验。
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  welcomeSection: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  dramasContainer: {
    marginBottom: 32,
  },
  dramaCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dramaInfo: {
    flex: 1,
  },
  dramaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  dramaDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  dramaMetadata: {
    flexDirection: 'row',
    gap: 16,
  },
  duration: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  difficulty: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#ffffff',
    fontSize: 18,
    marginLeft: 2,
  },
  tipSection: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});
