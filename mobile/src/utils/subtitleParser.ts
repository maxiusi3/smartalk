import { SubtitleItem, ParsedSubtitles, SubtitleTimeFormat } from '@/types/video.types';

/**
 * SRT字幕解析器
 * 解析SRT格式的字幕文件并转换为应用可用的格式
 */
export class SubtitleParser {
  /**
   * 解析SRT字幕内容
   * @param srtContent SRT文件内容
   * @returns 解析后的字幕数据
   */
  static parseSRT(srtContent: string): ParsedSubtitles {
    const subtitles: SubtitleItem[] = [];
    
    // 清理内容并分割成块
    const blocks = srtContent
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n\n')
      .filter(block => block.trim().length > 0);

    for (const block of blocks) {
      const lines = block.trim().split('\n');
      
      if (lines.length >= 3) {
        const id = parseInt(lines[0], 10);
        const timeRange = lines[1];
        const text = lines.slice(2).join('\n').trim();

        const times = this.parseTimeRange(timeRange);
        if (times) {
          subtitles.push({
            id,
            startTime: times.startTime,
            endTime: times.endTime,
            text,
            keywords: [] // 将在后续处理中填充
          });
        }
      }
    }

    // 按开始时间排序
    subtitles.sort((a, b) => a.startTime - b.startTime);

    const duration = subtitles.length > 0 
      ? Math.max(...subtitles.map(s => s.endTime))
      : 0;

    return {
      subtitles,
      totalCount: subtitles.length,
      duration
    };
  }

  /**
   * 解析时间范围字符串
   * @param timeRange 时间范围字符串 (例: "00:00:02,500 --> 00:00:05,000")
   * @returns 开始和结束时间（秒）
   */
  private static parseTimeRange(timeRange: string): { startTime: number; endTime: number } | null {
    const match = timeRange.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
    
    if (!match) {
      return null;
    }

    const startTime = this.timeToSeconds({
      hours: parseInt(match[1], 10),
      minutes: parseInt(match[2], 10),
      seconds: parseInt(match[3], 10),
      milliseconds: parseInt(match[4], 10)
    });

    const endTime = this.timeToSeconds({
      hours: parseInt(match[5], 10),
      minutes: parseInt(match[6], 10),
      seconds: parseInt(match[7], 10),
      milliseconds: parseInt(match[8], 10)
    });

    return { startTime, endTime };
  }

  /**
   * 将时间格式转换为秒数
   * @param time 时间格式对象
   * @returns 总秒数
   */
  private static timeToSeconds(time: SubtitleTimeFormat): number {
    return time.hours * 3600 + time.minutes * 60 + time.seconds + time.milliseconds / 1000;
  }

  /**
   * 将秒数转换为时间格式
   * @param seconds 总秒数
   * @returns 时间格式对象
   */
  static secondsToTime(seconds: number): SubtitleTimeFormat {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return { hours, minutes, seconds: secs, milliseconds };
  }

  /**
   * 格式化时间为显示字符串
   * @param seconds 总秒数
   * @returns 格式化的时间字符串
   */
  static formatTime(seconds: number): string {
    const time = this.secondsToTime(seconds);
    
    if (time.hours > 0) {
      return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    } else {
      return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 根据当前时间获取应显示的字幕
   * @param subtitles 字幕列表
   * @param currentTime 当前播放时间（秒）
   * @returns 当前应显示的字幕项
   */
  static getCurrentSubtitle(subtitles: SubtitleItem[], currentTime: number): SubtitleItem | null {
    return subtitles.find(subtitle => 
      currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
    ) || null;
  }

  /**
   * 获取指定时间范围内的字幕
   * @param subtitles 字幕列表
   * @param startTime 开始时间（秒）
   * @param endTime 结束时间（秒）
   * @returns 时间范围内的字幕列表
   */
  static getSubtitlesInRange(subtitles: SubtitleItem[], startTime: number, endTime: number): SubtitleItem[] {
    return subtitles.filter(subtitle => 
      (subtitle.startTime >= startTime && subtitle.startTime <= endTime) ||
      (subtitle.endTime >= startTime && subtitle.endTime <= endTime) ||
      (subtitle.startTime <= startTime && subtitle.endTime >= endTime)
    );
  }

  /**
   * 清理字幕文本（移除HTML标签等）
   * @param text 原始字幕文本
   * @returns 清理后的文本
   */
  static cleanSubtitleText(text: string): string {
    return text
      .replace(/<[^>]*>/g, '') // 移除HTML标签
      .replace(/\{[^}]*\}/g, '') // 移除样式标签
      .replace(/\[[^\]]*\]/g, '') // 移除方括号内容
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();
  }

  /**
   * 验证SRT文件格式
   * @param srtContent SRT文件内容
   * @returns 是否为有效的SRT格式
   */
  static validateSRT(srtContent: string): boolean {
    if (!srtContent || srtContent.trim().length === 0) {
      return false;
    }

    // 检查是否包含时间戳格式
    const timeRegex = /\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}/;
    return timeRegex.test(srtContent);
  }
}
