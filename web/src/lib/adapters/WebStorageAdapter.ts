/**
 * Web存储适配器
 * 将React Native的AsyncStorage适配为Web环境的localStorage
 * 并集成progressManager进行数据同步
 */

import { progressManager } from '../progressManager';

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
  multiGet(keys: string[]): Promise<Array<[string, string | null]>>;
  multiSet(keyValuePairs: Array<[string, string]>): Promise<void>;
  clear(): Promise<void>;
}

export class WebStorageAdapter implements StorageAdapter {
  private readonly PREFIX = 'smartalk_';
  
  /**
   * 获取存储项
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(this.PREFIX + key);
    } catch (error) {
      console.error('WebStorageAdapter.getItem error:', error);
      return null;
    }
  }

  /**
   * 设置存储项
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.PREFIX + key, value);
      
      // 同步关键数据到progressManager
      await this.syncToProgressManager(key, value);
    } catch (error) {
      console.error('WebStorageAdapter.setItem error:', error);
      throw error;
    }
  }

  /**
   * 删除存储项
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('WebStorageAdapter.removeItem error:', error);
      throw error;
    }
  }

  /**
   * 获取所有键
   */
  async getAllKeys(): Promise<string[]> {
    try {
      if (typeof window === 'undefined') return [];
      
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.PREFIX)) {
          keys.push(key.substring(this.PREFIX.length));
        }
      }
      return keys;
    } catch (error) {
      console.error('WebStorageAdapter.getAllKeys error:', error);
      return [];
    }
  }

  /**
   * 批量获取
   */
  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      const results: Array<[string, string | null]> = [];
      for (const key of keys) {
        const value = await this.getItem(key);
        results.push([key, value]);
      }
      return results;
    } catch (error) {
      console.error('WebStorageAdapter.multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  /**
   * 批量设置
   */
  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      for (const [key, value] of keyValuePairs) {
        await this.setItem(key, value);
      }
    } catch (error) {
      console.error('WebStorageAdapter.multiSet error:', error);
      throw error;
    }
  }

  /**
   * 清空存储
   */
  async clear(): Promise<void> {
    try {
      if (typeof window === 'undefined') return;
      
      const keys = await this.getAllKeys();
      for (const key of keys) {
        await this.removeItem(key);
      }
    } catch (error) {
      console.error('WebStorageAdapter.clear error:', error);
      throw error;
    }
  }

  /**
   * 同步数据到progressManager
   */
  private async syncToProgressManager(key: string, value: string): Promise<void> {
    try {
      // 同步Focus Mode相关数据
      if (key.includes('focus_mode')) {
        const data = JSON.parse(value);
        // 这里可以将Focus Mode状态同步到progressManager
        // 具体实现将在progressManager扩展时添加
      }
      
      // 同步Rescue Mode相关数据
      if (key.includes('rescue_mode')) {
        const data = JSON.parse(value);
        // 同步Rescue Mode状态
      }
      
      // 同步SRS相关数据
      if (key.includes('srs_')) {
        const data = JSON.parse(value);
        // 同步SRS卡片和复习数据
      }
    } catch (error) {
      // 非JSON数据或同步失败，不影响主要功能
      console.warn('Failed to sync to progressManager:', error);
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    total: number;
  }> {
    try {
      if (typeof window === 'undefined') {
        return { used: 0, available: 0, total: 0 };
      }

      // 估算localStorage使用情况
      let used = 0;
      const keys = await this.getAllKeys();
      
      for (const key of keys) {
        const value = await this.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }

      // localStorage通常限制为5-10MB
      const total = 5 * 1024 * 1024; // 5MB
      const available = total - used;

      return { used, available, total };
    } catch (error) {
      console.error('WebStorageAdapter.getStorageInfo error:', error);
      return { used: 0, available: 0, total: 0 };
    }
  }
}

// 创建单例实例
export const webStorageAdapter = new WebStorageAdapter();
