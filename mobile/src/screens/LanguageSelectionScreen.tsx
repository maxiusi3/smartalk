import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInternationalization, useLanguageSelector, useTypedTranslation } from '@/hooks/useInternationalization';
import { useAccessibility, useScreenReader } from '@/hooks/useAccessibility';
import AccessibilityWrapper from '@/components/accessibility/AccessibilityWrapper';
import { AnalyticsService } from '@/services/AnalyticsService';
import { SupportedLanguage } from '@/services/InternationalizationService';

/**
 * LanguageSelectionScreen - V2 语言选择界面
 * 提供完整的多语言选择体验：语言列表、完成度显示、预览功能
 */
const LanguageSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentLanguage, isRTL, getLayoutDirectionStyles } = useInternationalization();
  const { availableLanguages, selectLanguage, getLanguageProgress, isChanging } = useLanguageSelector();
  const { common, navigation: navTranslations } = useTypedTranslation();
  const accessibility = useAccessibility();
  const screenReader = useScreenReader();

  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(currentLanguage);
  const [previewMode, setPreviewMode] = useState(false);

  const analyticsService = AnalyticsService.getInstance();

  useEffect(() => {
    screenReader.announcePageChange('语言选择', '选择您的首选语言');
    
    analyticsService.track('language_selection_screen_viewed', {
      currentLanguage,
      availableLanguagesCount: availableLanguages.length,
      timestamp: Date.now(),
    });
  }, []);

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    if (language === currentLanguage) {
      navigation.goBack();
      return;
    }

    try {
      setSelectedLanguage(language);
      
      if (previewMode) {
        // 预览模式：临时切换语言
        await selectLanguage(language);
        screenReader.announce(`已切换到${getLanguageName(language)}预览模式`);
      } else {
        // 确认切换
        Alert.alert(
          '确认切换语言',
          `确定要切换到${getLanguageName(language)}吗？`,
          [
            {
              text: '取消',
              style: 'cancel',
            },
            {
              text: '确认',
              onPress: async () => {
                await confirmLanguageChange(language);
              },
            },
          ]
        );
      }
      
    } catch (error) {
      console.error('Error selecting language:', error);
      Alert.alert('错误', '切换语言失败，请重试。');
      screenReader.announceError('切换语言失败');
    }
  };

  const confirmLanguageChange = async (language: SupportedLanguage) => {
    try {
      await selectLanguage(language);
      
      screenReader.announceSuccess(`语言已切换到${getLanguageName(language)}`);
      
      analyticsService.track('language_changed', {
        oldLanguage: currentLanguage,
        newLanguage: language,
        fromScreen: 'language_selection',
        timestamp: Date.now(),
      });
      
      // 延迟返回，让用户看到变化
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
      
    } catch (error) {
      console.error('Error confirming language change:', error);
      Alert.alert('错误', '切换语言失败，请重试。');
    }
  };

  const getLanguageName = (language: SupportedLanguage): string => {
    const languageInfo = availableLanguages.find(lang => lang.code === language);
    return languageInfo?.nativeName || language;
  };

  const getCompletionColor = (completeness: number): string => {
    if (completeness >= 95) return '#10b981';
    if (completeness >= 80) return '#f59e0b';
    if (completeness >= 60) return '#ef4444';
    return '#94a3b8';
  };

  const getCompletionText = (completeness: number): string => {
    if (completeness >= 95) return '完整';
    if (completeness >= 80) return '良好';
    if (completeness >= 60) return '部分';
    return '开发中';
  };

  const renderLanguageItem = (languageInfo: any) => {
    const isSelected = languageInfo.code === selectedLanguage;
    const isCurrent = languageInfo.code === currentLanguage;
    const progress = getLanguageProgress(languageInfo.code);
    
    return (
      <AccessibilityWrapper
        key={languageInfo.code}
        accessibilityRole="button"
        accessibilityLabel={`${languageInfo.nativeName}，${languageInfo.name}，完成度${progress}%`}
        accessibilityHint={
          isCurrent ? '当前语言' : 
          isSelected ? '已选择，点击确认切换' : '点击选择此语言'
        }
        accessibilityState={{ selected: isSelected }}
        applyExtendedTouchTarget={true}
        applyFocusIndicator={true}
        applyHighContrast={true}
      >
        <TouchableOpacity
          style={[
            styles.languageItem,
            isSelected && styles.selectedLanguageItem,
            isCurrent && styles.currentLanguageItem,
            getLayoutDirectionStyles(),
          ]}
          onPress={() => handleLanguageSelect(languageInfo.code)}
          disabled={isChanging}
          accessible={true}
          accessibilityRole="button"
        >
          <View style={styles.languageContent}>
            <View style={styles.languageHeader}>
              <Text style={styles.languageFlag}>{languageInfo.flag}</Text>
              <View style={styles.languageNames}>
                <Text style={[
                  styles.languageNativeName,
                  isSelected && styles.selectedLanguageText,
                  isCurrent && styles.currentLanguageText,
                ]}>
                  {languageInfo.nativeName}
                </Text>
                <Text style={[
                  styles.languageEnglishName,
                  isSelected && styles.selectedLanguageSubtext,
                  isCurrent && styles.currentLanguageSubtext,
                ]}>
                  {languageInfo.name}
                </Text>
              </View>
            </View>
            
            <View style={styles.languageInfo}>
              <View style={styles.completionContainer}>
                <View style={styles.completionBar}>
                  <View 
                    style={[
                      styles.completionBarFill,
                      { 
                        width: `${progress}%`,
                        backgroundColor: getCompletionColor(progress)
                      }
                    ]}
                  />
                </View>
                <Text style={[
                  styles.completionText,
                  { color: getCompletionColor(progress) }
                ]}>
                  {getCompletionText(progress)} ({progress}%)
                </Text>
              </View>
              
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>当前</Text>
                </View>
              )}
              
              {isSelected && !isCurrent && (
                <View style={styles.selectedBadge}>
                  <Text style={styles.selectedBadgeText}>已选择</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.languageArrow}>
            <Text style={[
              styles.arrowText,
              isSelected && styles.selectedArrowText,
              isCurrent && styles.currentArrowText,
            ]}>
              {isRTL ? '‹' : '›'}
            </Text>
          </View>
        </TouchableOpacity>
      </AccessibilityWrapper>
    );
  };

  const renderPreviewToggle = () => (
    <AccessibilityWrapper
      accessibilityRole="switch"
      accessibilityLabel="预览模式"
      accessibilityHint="启用后可以预览语言切换效果"
      applyHighContrast={true}
    >
      <View style={styles.previewToggleContainer}>
        <TouchableOpacity
          style={[
            styles.previewToggle,
            previewMode && styles.activePreviewToggle
          ]}
          onPress={() => {
            setPreviewMode(!previewMode);
            screenReader.announce(`预览模式${!previewMode ? '已启用' : '已禁用'}`);
          }}
          accessible={true}
          accessibilityRole="switch"
          accessibilityState={{ checked: previewMode }}
        >
          <Text style={[
            styles.previewToggleText,
            previewMode && styles.activePreviewToggleText
          ]}>
            🔍 预览模式
          </Text>
        </TouchableOpacity>
        <Text style={styles.previewToggleDescription}>
          启用预览模式可以临时切换语言查看效果
        </Text>
      </View>
    </AccessibilityWrapper>
  );

  const renderComingSoonLanguages = () => {
    const comingSoonLanguages = [
      { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
      { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
      { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
      { code: 'de-DE', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
      { code: 'ar-SA', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    ];

    return (
      <AccessibilityWrapper
        accessibilityRole="group"
        accessibilityLabel="即将支持的语言"
        applyHighContrast={true}
      >
        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonTitle}>即将支持</Text>
          <Text style={styles.comingSoonDescription}>
            我们正在努力添加更多语言支持
          </Text>
          
          <View style={styles.comingSoonGrid}>
            {comingSoonLanguages.map((lang) => (
              <View key={lang.code} style={styles.comingSoonItem}>
                <Text style={styles.comingSoonFlag}>{lang.flag}</Text>
                <Text style={styles.comingSoonName}>{lang.nativeName}</Text>
              </View>
            ))}
          </View>
        </View>
      </AccessibilityWrapper>
    );
  };

  return (
    <SafeAreaView style={[styles.container, getLayoutDirectionStyles()]}>
      {/* 头部 */}
      <AccessibilityWrapper
        accessibilityRole="header"
        accessibilityLabel="语言选择页面头部"
        applyHighContrast={true}
      >
        <View style={[styles.header, getLayoutDirectionStyles()]}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={common('back')}
            accessibilityHint="返回上一页"
          >
            <Text style={styles.backButtonText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>选择语言</Text>
          <View style={styles.placeholder} />
        </View>
      </AccessibilityWrapper>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 预览模式切换 */}
        {renderPreviewToggle()}

        {/* 可用语言列表 */}
        <AccessibilityWrapper
          accessibilityRole="list"
          accessibilityLabel="可用语言列表"
          applyHighContrast={true}
        >
          <View style={styles.languagesSection}>
            <Text style={styles.sectionTitle}>可用语言</Text>
            <Text style={styles.sectionDescription}>
              选择您的首选语言，应用界面将使用该语言显示
            </Text>
            
            {availableLanguages.map(renderLanguageItem)}
          </View>
        </AccessibilityWrapper>

        {/* 即将支持的语言 */}
        {renderComingSoonLanguages()}

        {/* 底部说明 */}
        <AccessibilityWrapper applyHighContrast={true}>
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💡 语言设置会影响应用界面显示，但不会影响学习内容的语言。
              您可以随时在设置中更改语言偏好。
            </Text>
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
  previewToggleContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  previewToggle: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: 'transparent',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  activePreviewToggle: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  previewToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  activePreviewToggleText: {
    color: '#3b82f6',
  },
  previewToggleDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  languagesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedLanguageItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  currentLanguageItem: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  languageContent: {
    flex: 1,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageNames: {
    flex: 1,
  },
  languageNativeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  selectedLanguageText: {
    color: '#3b82f6',
  },
  currentLanguageText: {
    color: '#10b981',
  },
  languageEnglishName: {
    fontSize: 14,
    color: '#64748b',
  },
  selectedLanguageSubtext: {
    color: '#60a5fa',
  },
  currentLanguageSubtext: {
    color: '#34d399',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completionContainer: {
    flex: 1,
  },
  completionBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 4,
  },
  completionBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  completionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentBadge: {
    backgroundColor: '#10b981',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedBadge: {
    backgroundColor: '#3b82f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  selectedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  languageArrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#94a3b8',
  },
  selectedArrowText: {
    color: '#3b82f6',
  },
  currentArrowText: {
    color: '#10b981',
  },
  comingSoonSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 20,
  },
  comingSoonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  comingSoonItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
  },
  comingSoonFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  comingSoonName: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    marginTop: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LanguageSelectionScreen;
