// 全局类型声明文件

declare var __DEV__: boolean;
declare var console: any;

// React Native模块声明
declare module 'react-native' {
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const StatusBar: any;
  export const TouchableOpacity: any;
  export const SafeAreaView: any;
  export const ScrollView: any;
  export const ActivityIndicator: any;
  export const FlatList: any;
  export const Dimensions: any;
  export const Switch: any;
  export const Alert: any;
}

// 导航模块声明
declare module '@react-navigation/native' {
  export const useNavigation: () => any;
  export const useRoute: () => any;
  export type RouteProp<T = any, K = any> = any;
  export const NavigationContainer: any;
}

declare module '@react-navigation/stack' {
  export const createStackNavigator: () => any;
  export type StackNavigationProp<T = any, K = any> = any;
}

declare module '@react-navigation/bottom-tabs' {
  export const createBottomTabNavigator: () => any;
}

// 第三方库声明
declare module 'react-native-safe-area-context' {
  export const SafeAreaProvider: any;
  export const useSafeAreaInsets: any;
}

declare module 'react-native-gesture-handler' {
  export const GestureHandlerRootView: any;
}

declare module 'react-native-screens' {
  export const enableScreens: any;
}

declare module 'zustand' {
  export const create: (fn: any) => any;
}

declare module 'zustand/middleware' {
  export const persist: any;
  export const createJSONStorage: any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

declare module 'react-native-device-info' {
  const DeviceInfo: any;
  export default DeviceInfo;
}

declare module 'axios' {
  const axios: any;
  export default axios;
  export interface AxiosInstance {
    get: any;
    post: any;
    put: any;
    delete: any;
    interceptors: any;
  }
  export interface AxiosResponse {
    data: any;
    status: number;
    config: any;
  }
  export interface AxiosError {
    response?: any;
    request?: any;
    message: string;
  }
}

// 资源文件声明
declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.jpeg' {
  const value: any;
  export default value;
}

declare module '*.svg' {
  const value: any;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}
