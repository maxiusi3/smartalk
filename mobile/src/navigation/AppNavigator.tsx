import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {useAppStore} from '@/store/useAppStore';

// 屏幕组件导入
import {OnboardingScreen} from '@/screens/OnboardingScreen';
import {InterestSelectionScreen} from '@/screens/InterestSelectionScreen';
import {HomeScreen} from '@/screens/HomeScreen';
import {LearningScreen} from '@/screens/LearningScreen';
import {ProgressScreen} from '@/screens/ProgressScreen';
import {SettingsScreen} from '@/screens/SettingsScreen';

// Milestone screens
import MilestoneScreen from '@/screens/MilestoneScreen';
import TheaterModeScreen from '@/screens/TheaterModeScreen';
import AchievementScreen from '@/screens/AchievementScreen';
import LearningMapScreen from '@/screens/LearningMapScreen';

// 导航类型定义
export type RootStackParamList = {
  Onboarding: undefined;
  InterestSelection: undefined;
  MainTabs: undefined;
  Learning: {
    dramaId: string;
    keywordId?: string;
  };
  Milestone: { dramaId: string };
  TheaterMode: { dramaId: string };
  Achievement: { dramaId: string };
  LearningMap: { dramaId?: string };
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 主标签导航器
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '首页',
          // tabBarIcon: ({color, size}) => (
          //   <Icon name="home" size={size} color={color} />
          // ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarLabel: '进度',
          // tabBarIcon: ({color, size}) => (
          //   <Icon name="chart-line" size={size} color={color} />
          // ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: '设置',
          // tabBarIcon: ({color, size}) => (
          //   <Icon name="cog" size={size} color={color} />
          // ),
        }}
      />
    </Tab.Navigator>
  );
};

// 主应用导航器
export const AppNavigator: React.FC = () => {
  const {isFirstLaunch, selectedInterest} = useAppStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({current, layouts}) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}>
      
      {/* 首次启动流程 */}
      {isFirstLaunch && (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{
            animationEnabled: false,
          }}
        />
      )}
      
      {/* 兴趣选择（如果未选择） */}
      {!selectedInterest && !isFirstLaunch && (
        <Stack.Screen
          name="InterestSelection"
          component={InterestSelectionScreen}
          options={{
            animationEnabled: false,
          }}
        />
      )}
      
      {/* 主应用界面 */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{
          animationEnabled: false,
        }}
      />
      
      {/* 学习界面 */}
      <Stack.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          gestureDirection: 'vertical',
        }}
      />
      
      {/* Milestone screens */}
      <Stack.Screen
        name="Milestone"
        component={MilestoneScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="TheaterMode"
        component={TheaterModeScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="Achievement"
        component={AchievementScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LearningMap"
        component={LearningMapScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
