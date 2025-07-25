import React from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '@/navigation/AppNavigator';
import VTPRScreenOptimized from '@/components/vtpr/vTPRScreenOptimized';

type LearningRouteProp = RouteProp<RootStackParamList, 'Learning'>;

export const LearningScreen: React.FC = () => {
  const route = useRoute<LearningRouteProp>();
  const { dramaId, keywordId } = route.params;

  // 使用优化后的vTPR学习界面
  return <VTPRScreenOptimized dramaId={dramaId} keywordId={keywordId} />;
};
