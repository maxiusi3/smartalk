import { KeywordData } from '@/types/video.types';

/**
 * 关键词匹配器
 * 在字幕文本中识别和匹配关键词
 */
export class KeywordMatcher {
  /**
   * 在文本中查找关键词
   * @param text 要搜索的文本
   * @param keywords 关键词列表
   * @returns 找到的关键词及其位置信息
   */
  static findKeywords(text: string, keywords: KeywordData[]): Array<{
    keyword: KeywordData;
    startIndex: number;
    endIndex: number;
    matchedText: string;
  }> {
    const matches: Array<{
      keyword: KeywordData;
      startIndex: number;
      endIndex: number;
      matchedText: string;
    }> = [];

    for (const keyword of keywords) {
      const keywordMatches = this.findKeywordInText(text, keyword);
      matches.push(...keywordMatches);
    }

    // 按位置排序，避免重叠
    return matches.sort((a, b) => a.startIndex - b.startIndex);
  }

  /**
   * 在文本中查找特定关键词
   * @param text 要搜索的文本
   * @param keyword 关键词对象
   * @returns 匹配结果数组
   */
  private static findKeywordInText(text: string, keyword: KeywordData): Array<{
    keyword: KeywordData;
    startIndex: number;
    endIndex: number;
    matchedText: string;
  }> {
    const matches: Array<{
      keyword: KeywordData;
      startIndex: number;
      endIndex: number;
      matchedText: string;
    }> = [];

    // 创建正则表达式，支持大小写不敏感和词边界
    const regex = new RegExp(`\\b${this.escapeRegExp(keyword.word)}\\b`, 'gi');
    let match;

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        keyword,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        matchedText: match[0]
      });
    }

    return matches;
  }

  /**
   * 转义正则表达式特殊字符
   * @param string 要转义的字符串
   * @returns 转义后的字符串
   */
  private static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 将文本分割为带有关键词标记的片段
   * @param text 原始文本
   * @param keywords 关键词列表
   * @returns 文本片段数组
   */
  static segmentTextWithKeywords(text: string, keywords: KeywordData[]): Array<{
    text: string;
    isKeyword: boolean;
    keyword?: KeywordData;
  }> {
    const matches = this.findKeywords(text, keywords);
    const segments: Array<{
      text: string;
      isKeyword: boolean;
      keyword?: KeywordData;
    }> = [];

    let lastIndex = 0;

    for (const match of matches) {
      // 添加关键词前的普通文本
      if (match.startIndex > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, match.startIndex),
          isKeyword: false
        });
      }

      // 添加关键词片段
      segments.push({
        text: match.matchedText,
        isKeyword: true,
        keyword: match.keyword
      });

      lastIndex = match.endIndex;
    }

    // 添加最后的普通文本
    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isKeyword: false
      });
    }

    return segments;
  }

  /**
   * 检查文本是否包含任何关键词
   * @param text 要检查的文本
   * @param keywords 关键词列表
   * @returns 是否包含关键词
   */
  static hasKeywords(text: string, keywords: KeywordData[]): boolean {
    return keywords.some(keyword => 
      new RegExp(`\\b${this.escapeRegExp(keyword.word)}\\b`, 'i').test(text)
    );
  }

  /**
   * 获取文本中的关键词数量
   * @param text 要检查的文本
   * @param keywords 关键词列表
   * @returns 关键词数量
   */
  static getKeywordCount(text: string, keywords: KeywordData[]): number {
    return this.findKeywords(text, keywords).length;
  }

  /**
   * 高亮文本中的关键词（返回HTML格式）
   * @param text 原始文本
   * @param keywords 关键词列表
   * @param highlightClass CSS类名
   * @returns 高亮后的HTML字符串
   */
  static highlightKeywords(text: string, keywords: KeywordData[], highlightClass: string = 'keyword-highlight'): string {
    const segments = this.segmentTextWithKeywords(text, keywords);
    
    return segments.map(segment => {
      if (segment.isKeyword && segment.keyword) {
        return `<span class="${highlightClass}" data-keyword-id="${segment.keyword.id}">${segment.text}</span>`;
      } else {
        return segment.text;
      }
    }).join('');
  }

  /**
   * 过滤在指定时间范围内的关键词
   * @param keywords 关键词列表
   * @param startTime 开始时间（秒）
   * @param endTime 结束时间（秒）
   * @returns 时间范围内的关键词
   */
  static filterKeywordsByTime(keywords: KeywordData[], startTime: number, endTime: number): KeywordData[] {
    return keywords.filter(keyword => 
      (keyword.startTime >= startTime && keyword.startTime <= endTime) ||
      (keyword.endTime >= startTime && keyword.endTime <= endTime) ||
      (keyword.startTime <= startTime && keyword.endTime >= endTime)
    );
  }

  /**
   * 根据关键词重要性排序
   * @param keywords 关键词列表
   * @returns 排序后的关键词列表
   */
  static sortKeywordsByImportance(keywords: KeywordData[]): KeywordData[] {
    return [...keywords].sort((a, b) => {
      // 可以根据词汇长度、频率等因素排序
      // 这里简单按照词汇长度排序，长词汇优先匹配
      return b.word.length - a.word.length;
    });
  }

  /**
   * 验证关键词数据
   * @param keyword 关键词对象
   * @returns 是否为有效的关键词
   */
  static validateKeyword(keyword: KeywordData): boolean {
    return !!(
      keyword.id &&
      keyword.word &&
      keyword.word.trim().length > 0 &&
      keyword.translation &&
      typeof keyword.startTime === 'number' &&
      typeof keyword.endTime === 'number' &&
      keyword.startTime >= 0 &&
      keyword.endTime > keyword.startTime
    );
  }
}
