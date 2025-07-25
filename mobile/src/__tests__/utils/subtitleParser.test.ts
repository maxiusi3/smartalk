import { SubtitleParser } from '@/utils/subtitleParser';

describe('SubtitleParser', () => {
  const sampleSRT = `1
00:00:02,500 --> 00:00:05,000
Hello world

2
00:00:05,500 --> 00:00:08,000
This is a test subtitle

3
00:00:10,000 --> 00:00:12,500
Another subtitle line`;

  describe('parseSRT', () => {
    it('should parse valid SRT content correctly', () => {
      const result = SubtitleParser.parseSRT(sampleSRT);
      
      expect(result.subtitles).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.duration).toBe(12.5);
      
      expect(result.subtitles[0]).toEqual({
        id: 1,
        startTime: 2.5,
        endTime: 5.0,
        text: 'Hello world',
        keywords: []
      });
      
      expect(result.subtitles[1]).toEqual({
        id: 2,
        startTime: 5.5,
        endTime: 8.0,
        text: 'This is a test subtitle',
        keywords: []
      });
    });

    it('should handle empty SRT content', () => {
      const result = SubtitleParser.parseSRT('');
      
      expect(result.subtitles).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.duration).toBe(0);
    });

    it('should handle malformed SRT blocks', () => {
      const malformedSRT = `1
Invalid time format
Hello world

2
00:00:05,500 --> 00:00:08,000
Valid subtitle`;

      const result = SubtitleParser.parseSRT(malformedSRT);
      
      expect(result.subtitles).toHaveLength(1);
      expect(result.subtitles[0].text).toBe('Valid subtitle');
    });

    it('should sort subtitles by start time', () => {
      const unorderedSRT = `2
00:00:05,500 --> 00:00:08,000
Second subtitle

1
00:00:02,500 --> 00:00:05,000
First subtitle`;

      const result = SubtitleParser.parseSRT(unorderedSRT);
      
      expect(result.subtitles[0].text).toBe('First subtitle');
      expect(result.subtitles[1].text).toBe('Second subtitle');
    });
  });

  describe('formatTime', () => {
    it('should format time correctly for minutes and seconds', () => {
      expect(SubtitleParser.formatTime(125.5)).toBe('02:05');
      expect(SubtitleParser.formatTime(65)).toBe('01:05');
      expect(SubtitleParser.formatTime(30)).toBe('00:30');
    });

    it('should format time correctly for hours', () => {
      expect(SubtitleParser.formatTime(3665)).toBe('01:01:05');
      expect(SubtitleParser.formatTime(7200)).toBe('02:00:00');
    });

    it('should handle zero time', () => {
      expect(SubtitleParser.formatTime(0)).toBe('00:00');
    });
  });

  describe('getCurrentSubtitle', () => {
    const subtitles = [
      { id: 1, startTime: 2.5, endTime: 5.0, text: 'First', keywords: [] },
      { id: 2, startTime: 5.5, endTime: 8.0, text: 'Second', keywords: [] },
      { id: 3, startTime: 10.0, endTime: 12.5, text: 'Third', keywords: [] }
    ];

    it('should return correct subtitle for given time', () => {
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 3.0)?.text).toBe('First');
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 6.0)?.text).toBe('Second');
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 11.0)?.text).toBe('Third');
    });

    it('should return null when no subtitle matches time', () => {
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 1.0)).toBeNull();
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 9.0)).toBeNull();
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 15.0)).toBeNull();
    });

    it('should handle edge cases at exact start/end times', () => {
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 2.5)?.text).toBe('First');
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 5.0)?.text).toBe('First');
      expect(SubtitleParser.getCurrentSubtitle(subtitles, 5.5)?.text).toBe('Second');
    });
  });

  describe('getSubtitlesInRange', () => {
    const subtitles = [
      { id: 1, startTime: 2.5, endTime: 5.0, text: 'First', keywords: [] },
      { id: 2, startTime: 5.5, endTime: 8.0, text: 'Second', keywords: [] },
      { id: 3, startTime: 10.0, endTime: 12.5, text: 'Third', keywords: [] }
    ];

    it('should return subtitles within range', () => {
      const result = SubtitleParser.getSubtitlesInRange(subtitles, 4.0, 9.0);
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('First');
      expect(result[1].text).toBe('Second');
    });

    it('should return empty array when no subtitles in range', () => {
      const result = SubtitleParser.getSubtitlesInRange(subtitles, 0.0, 1.0);
      expect(result).toHaveLength(0);
    });

    it('should handle overlapping ranges', () => {
      const result = SubtitleParser.getSubtitlesInRange(subtitles, 1.0, 15.0);
      expect(result).toHaveLength(3);
    });
  });

  describe('cleanSubtitleText', () => {
    it('should remove HTML tags', () => {
      const text = '<b>Bold text</b> and <i>italic text</i>';
      expect(SubtitleParser.cleanSubtitleText(text)).toBe('Bold text and italic text');
    });

    it('should remove style tags', () => {
      const text = '{\\an8}Subtitle with style{\\an1}';
      expect(SubtitleParser.cleanSubtitleText(text)).toBe('Subtitle with style');
    });

    it('should remove square bracket content', () => {
      const text = '[Music playing] Dialogue here [Sound effect]';
      expect(SubtitleParser.cleanSubtitleText(text)).toBe('Dialogue here');
    });

    it('should normalize whitespace', () => {
      const text = 'Text   with    multiple     spaces';
      expect(SubtitleParser.cleanSubtitleText(text)).toBe('Text with multiple spaces');
    });
  });

  describe('validateSRT', () => {
    it('should validate correct SRT format', () => {
      expect(SubtitleParser.validateSRT(sampleSRT)).toBe(true);
    });

    it('should reject empty content', () => {
      expect(SubtitleParser.validateSRT('')).toBe(false);
      expect(SubtitleParser.validateSRT('   ')).toBe(false);
    });

    it('should reject content without time stamps', () => {
      const invalidSRT = `1
Just some text without timestamps

2
More text`;
      expect(SubtitleParser.validateSRT(invalidSRT)).toBe(false);
    });

    it('should accept content with valid time stamps', () => {
      const validSRT = 'Some text 00:00:02,500 --> 00:00:05,000 more text';
      expect(SubtitleParser.validateSRT(validSRT)).toBe(true);
    });
  });

  describe('secondsToTime', () => {
    it('should convert seconds to time format correctly', () => {
      const time = SubtitleParser.secondsToTime(3665.123);
      expect(time).toEqual({
        hours: 1,
        minutes: 1,
        seconds: 5,
        milliseconds: 123
      });
    });

    it('should handle zero seconds', () => {
      const time = SubtitleParser.secondsToTime(0);
      expect(time).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      });
    });

    it('should handle fractional seconds', () => {
      const time = SubtitleParser.secondsToTime(2.5);
      expect(time).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 2,
        milliseconds: 500
      });
    });
  });
});
