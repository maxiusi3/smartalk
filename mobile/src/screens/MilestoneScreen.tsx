import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppStore } from '@/store/useAppStore';

type MilestoneRouteProp = RouteProp<RootStackParamList, 'Milestone'>;
type MilestoneNavigationProp = StackNavigationProp<RootStackParamList>;

const { width, height } = Dimensions.get('window');

const MilestoneScreen: React.FC = () => {
  const navigation = useNavigation<MilestoneNavigationProp>();
  const route = useRoute<MilestoneRouteProp>();
  const { dramaId } = route.params;
  const { user } = useAppStore();
  
  const [ready, setReady] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-transition after delay
    const timer = setTimeout(() => {
      setReady(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    navigation.navigate('TheaterMode', { dramaId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.contentContainer,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        <Text style={styles.icon}>🎭</Text>
        
        <Text style={styles.title}>准备好见证奇迹了吗？</Text>
        <Text style={styles.description}>
          你已经收集了所有的故事线索！
          现在，让我们来看看你能否理解整个故事...
        </Text>
        <Text style={styles.tip}>
          💡 提示：戴上耳机效果更佳
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.continueButton,
            ready ? styles.readyButton : styles.waitingButton
          ]}
          onPress={handleContinue}
          disabled={!ready}
        >
          <Text style={styles.buttonText}>
            {ready ? '开始体验' : '准备中...'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  tip: {
    fontSize: 14,
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  continueButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  readyButton: {
    backgroundColor: '#FF6B35',
  },
  waitingButton: {
    backgroundColor: '#BDBDBD',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default MilestoneScreen;