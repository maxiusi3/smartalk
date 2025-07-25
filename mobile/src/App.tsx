import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AppStartupService } from '@/services/AppStartupService';
import { PerformanceMonitor } from '@/services/PerformanceMonitor';
import { ErrorHandler } from '@/utils/ErrorHandler';
import { useAppStore } from '@/store/useAppStore';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { initialize: initializeStore } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = useCallback(async () => {
    const startTime = Date.now();
    PerformanceMonitor.startMetric('app_startup');
    
    try {
      console.log('🚀 Starting SmarTalk app initialization...');
      
      // Initialize app store first
      PerformanceMonitor.startMetric('store_init');
      await initializeStore();
      PerformanceMonitor.endMetric('store_init');
      
      // Initialize app startup service
      PerformanceMonitor.startMetric('startup_service_init');
      await AppStartupService.initialize();
      PerformanceMonitor.endMetric('startup_service_init');
      
      const totalTime = Date.now() - startTime;
      PerformanceMonitor.endMetric('app_startup', { totalTime });
      
      console.log(`✅ SmarTalk app initialization completed in ${totalTime}ms`);
      
      // Check if startup time exceeds target (2 seconds)
      if (totalTime > 2000) {
        console.warn(`⚠️ App startup took ${totalTime}ms, exceeding 2s target`);
      }
      
      setIsInitializing(false);
      setInitError(null);
      setRetryCount(0);
    } catch (error) {
      console.error('❌ App initialization failed:', error);
      
      PerformanceMonitor.endMetric('app_startup', { error: true });
      
      // Handle initialization error
      const handledError = ErrorHandler.handleError(error, {
        showAlert: false,
        trackError: true,
        context: 'app_initialization',
      });
      
      setInitError(handledError.message);
      setIsInitializing(false);
    }
  }, [initializeStore]);

  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    setIsInitializing(true);
    setInitError(null);
    
    // Add delay for retry to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
    await initializeApp();
  }, [initializeApp]);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
        <Text style={styles.loadingTitle}>SmarTalk</Text>
        <ActivityIndicator size="large" color="#FF6B35" style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>正在初始化应用...</Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1A237E" />
        <Text style={styles.errorTitle}>初始化失败</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <Text style={styles.errorHint}>请检查网络连接后重试</Text>
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          disabled={isInitializing}
        >
          <Text style={styles.retryButtonText}>
            {isInitializing ? '重试中...' : `重试 ${retryCount > 0 ? `(${retryCount})` : ''}`}
          </Text>
        </TouchableOpacity>
        
        {retryCount > 2 && (
          <Text style={styles.persistentErrorHint}>
            如果问题持续存在，请稍后再试或联系客服
          </Text>
        )}
      </View>
    );
  }

  // Main app
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 40,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#1A237E',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  persistentErrorHint: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

export default App;
