import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// LinearGradient will be implemented with View and backgroundColor for now

import { useAppStore } from '@/store/useAppStore';
import { ApiService } from '@/services/ApiService';
import { UserService } from '@/services/UserService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { Interest } from '@/types/api';
import { RootStackParamList } from '@/navigation/AppNavigator';

type InterestSelectionNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

interface InterestCardData extends Interest {
  icon: string;
  gradient: string[];
  image: string;
  // V2 主题特定配置
  primaryColor?: string;
  secondaryColor?: string;
  badgeName?: string;
}

export const InterestSelectionScreen: React.FC = () => {
  const navigation = useNavigation<InterestSelectionNavigationProp>();
  const { user, setSelectedInterest, setLoading, setError } = useAppStore();
  
  const [interests, setInterests] = useState<InterestCardData[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLocalLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    loadInterests();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadInterests = async () => {
    try {
      setLocalLoading(true);
      const data = await ApiService.getInterests();
      
      // Enhance interests with visual data and V2 theme configurations
      const enhancedInterests: InterestCardData[] = data.map(interest => ({
        ...interest,
        icon: getInterestIcon(interest.name),
        gradient: getInterestGradient(interest.name),
        image: getInterestImage(interest.name),
        // V2 主题特定配置（从数据库获取或使用默认值）
        primaryColor: interest.primaryColor || getInterestGradient(interest.name)[0],
        secondaryColor: interest.secondaryColor || getInterestGradient(interest.name)[1],
        badgeName: interest.badgeName || getDefaultBadgeName(interest.name),
      }));
      
      setInterests(enhancedInterests);
    } catch (error) {
      console.error('Failed to load interests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load interests');
    } finally {
      setLocalLoading(false);
    }
  };

  const getInterestIcon = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'travel': return '✈️';
      case 'movies': return '🎬';
      case 'workplace': return '💼';
      default: return '🌟';
    }
  };

  const getInterestGradient = (name: string): string[] => {
    // V2 主题特定颜色方案
    switch (name.toLowerCase()) {
      case 'travel': return ['#2196F3', '#FF9800']; // Sky Blue + Sunset Orange
      case 'movies': return ['#673AB7', '#FFC107']; // Deep Purple + Gold
      case 'workplace': return ['#1976D2', '#90A4AE']; // Business Blue + Silver
      default: return ['#2196F3', '#FF9800'];
    }
  };

  const getInterestImage = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'travel': return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
      case 'movies': return 'https://images.unsplash.com/photo-1489599904472-af35ff2c7c3f?w=400';
      case 'workplace': return 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400';
      default: return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
    }
  };

  const getDefaultBadgeName = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'travel': return '旅行生存家';
      case 'movies': return '电影达人';
      case 'workplace': return '职场精英';
      default: return '学习达人';
    }
  };

  const handleSelectInterest = (interest: InterestCardData) => {
    setSelectedId(interest.id);
    
    // Selection animation
    Animated.sequence([
      Animated.timing(new Animated.Value(1), {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(new Animated.Value(0.95), {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleContinue = async () => {
    if (!selectedId) return;

    try {
      setContentLoading(true);

      const selectedInterest = interests.find(i => i.id === selectedId);
      if (!selectedInterest) return;

      // 使用UserService保存选择的兴趣主题
      await UserService.getInstance().setSelectedInterest(selectedInterest.name);

      // Save selected interest to app store
      setSelectedInterest(selectedInterest);

      // 记录主题选择事件
      AnalyticsService.getInstance().track('theme_selected', {
        selectedTheme: selectedInterest.name,
        themeDisplayName: selectedInterest.displayName,
        primaryColor: selectedInterest.primaryColor,
        secondaryColor: selectedInterest.secondaryColor,
        badgeName: selectedInterest.badgeName,
          interestName: selectedInterest.name,
          dramaCount: dramas.length,
          timestamp: new Date().toISOString(),
        },
      });

      // Navigate to main interface
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Failed to save interest:', error);
      setError(error instanceof Error ? error.message : 'Failed to save interest');
    } finally {
      setContentLoading(false);
    }
  };

  const renderInterestCard = (interest: InterestCardData, index: number) => (
    <Animated.View
      key={interest.id}
      style={[
        styles.cardContainer,
        {
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, 50],
              }),
            },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.interestCard,
          selectedId === interest.id && styles.selectedCard,
        ]}
        onPress={() => handleSelectInterest(interest)}
        activeOpacity={0.8}
      >
        <View style={[styles.cardGradient, { backgroundColor: interest.gradient[0] }]}>
          <View style={styles.cardImageContainer}>
            <Image
              source={{ uri: interest.image }}
              style={styles.cardImage}
              defaultSource={require('@/assets/images/interest-placeholder.png')}
            />
            <View style={styles.cardOverlay} />
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.interestIcon}>{interest.icon}</Text>
            <Text style={styles.interestTitle}>{interest.displayName}</Text>
            <Text style={styles.interestDescription}>{interest.description}</Text>
          </View>
          
          {selectedId === interest.id && (
            <Animated.View style={styles.selectedIndicator}>
              <View style={styles.checkmarkContainer}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>正在加载学习主题...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient
      colors={['#f8fafc', '#e2e8f0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>哪种故事更能点燃你？</Text>
              <Text style={styles.subtitle}>
                选择你最感兴趣的场景，我们将为你量身定制专属的故事体验
              </Text>
            </View>

            {/* Interest Cards */}
            <View style={styles.cardsContainer}>
              {interests.map((interest, index) => renderInterestCard(interest, index))}
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueButton,
                !selectedId && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!selectedId || contentLoading}
            >
              <LinearGradient
                colors={!selectedId ? ['#e2e8f0', '#e2e8f0'] : ['#667eea', '#764ba2']}
                style={[
                  styles.continueButtonGradient,
                  !selectedId && styles.disabledButtonGradient,
                ]}
              >
                {contentLoading ? (
                  <View style={styles.buttonLoadingContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.buttonLoadingText}>正在准备内容...</Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.continueButtonText,
                    !selectedId && styles.disabledButtonText,
                  ]}>
                    开始学习之旅
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  header: {
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  cardsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  interestCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    height: 128,
    position: 'relative',
  },
  cardImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  interestIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  interestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  interestDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  continueButton: {
    borderRadius: 30,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonGradient: {
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  disabledButton: {
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonGradient: {
    backgroundColor: '#e2e8f0',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#9ca3af',
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonLoadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
