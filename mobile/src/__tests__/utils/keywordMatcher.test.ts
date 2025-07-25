import { KeywordMatcher } from '@/utils/keywordMatcher';
import { KeywordData } from '@/types/video.types';

describe('KeywordMatcher', () => {
  const mockKeywords: KeywordData[] = [
    {
      id: 'keyword-1',
      word: 'hello',
      translation: '你好',
      startTime: 2.5,
      endTime: 5.0
    },
    {
      id: 'keyword-2',
      word: 'world',
      translation: '世界',
      startTime: 3.0,
      endTime: 6.0
    },
    {
      id: 'keyword-3',
      word: 'test',
      translation: '测试',
      startTime: 5.5,
      endTime: 8.0
    }
  ];

  describe('findKeywords', () => {
    it('should find keywords in text', () => {
      const text = 'Hello world, this is a test';
      const matches = KeywordMatcher.findKeywords(text, mockKeywords);
      
      expect(matches).toHaveLength(3);
      expect(matches[0].keyword.word).toBe('hello');
      expect(matches[0].startIndex).toBe(0);
      expect(matches[0].endIndex).toBe(5);
      expect(matches[0].matchedText).toBe('Hello');
    });

    it('should handle case insensitive matching', () => {
      const text = 'HELLO WORLD test';
      const matches = KeywordMatcher.findKeywords(text, mockKeywords);
      
      expect(matches).toHaveLength(3);
      expect(matches[0].matchedText).toBe('HELLO');
      expect(matches[1].matchedText).toBe('WORLD');
      expect(matches[2].matchedText).toBe('test');
    });

    it('should respect word boundaries', () => {
      const text = 'helloworld testing';
      const matches = KeywordMatcher.findKeywords(text, mockKeywords);
      
      // Should not match 'hello' in 'helloworld' or 'test' in 'testing'
      expect(matches).toHaveLength(0);
    });

    it('should handle multiple occurrences of same keyword', () => {
      const text = 'Hello there, hello again';
      const matches = KeywordMatcher.findKeywords(text, mockKeywords);
      
      expect(matches).toHaveLength(2);
      expect(matches[0].matchedText).toBe('Hello');
      expect(matches[1].matchedText).toBe('hello');
    });

    it('should return empty array when no keywords found', () => {
      const text = 'No matching words here';
      const matches = KeywordMatcher.findKeywords(text, mockKeywords);
      
      expect(matches).toHaveLength(0);
    });
  });

  describe('segmentTextWithKeywords', () => {
    it('should segment text correctly with keywords', () => {
      const text = 'Hello world test';
      const segments = KeywordMatcher.segmentTextWithKeywords(text, mockKeywords);
      
      expect(segments).toHaveLength(5);
      expect(segments[0]).toEqual({ text: 'Hello', isKeyword: true, keyword: mockKeywords[0] });
      expect(segments[1]).toEqual({ text: ' ', isKeyword: false });
      expect(segments[2]).toEqual({ text: 'world', isKeyword: true, keyword: mockKeywords[1] });
      expect(segments[3]).toEqual({ text: ' ', isKeyword: false });
      expect(segments[4]).toEqual({ text: 'test', isKeyword: true, keyword: mockKeywords[2] });
    });

    it('should handle text without keywords', () => {
      const text = 'No matching words';
      const segments = KeywordMatcher.segmentTextWithKeywords(text, mockKeywords);
      
      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ text: 'No matching words', isKeyword: false });
    });

    it('should handle text with only keywords', () => {
      const text = 'hello world';
      const segments = KeywordMatcher.segmentTextWithKeywords(text, mockKeywords);
      
      expect(segments).toHaveLength(3);
      expect(segments[0].isKeyword).toBe(true);
      expect(segments[1].isKeyword).toBe(false);
      expect(segments[2].isKeyword).toBe(true);
    });

    it('should handle empty text', () => {
      const segments = KeywordMatcher.segmentTextWithKeywords('', mockKeywords);
      expect(segments).toHaveLength(0);
    });
  });

  describe('hasKeywords', () => {
    it('should return true when text contains keywords', () => {
      expect(KeywordMatcher.hasKeywords('Hello world', mockKeywords)).toBe(true);
      expect(KeywordMatcher.hasKeywords('This is a test', mockKeywords)).toBe(true);
    });

    it('should return false when text does not contain keywords', () => {
      expect(KeywordMatcher.hasKeywords('No matching words', mockKeywords)).toBe(false);
      expect(KeywordMatcher.hasKeywords('', mockKeywords)).toBe(false);
    });

    it('should handle case insensitive matching', () => {
      expect(KeywordMatcher.hasKeywords('HELLO WORLD', mockKeywords)).toBe(true);
    });
  });

  describe('getKeywordCount', () => {
    it('should count keywords correctly', () => {
      expect(KeywordMatcher.getKeywordCount('Hello world test', mockKeywords)).toBe(3);
      expect(KeywordMatcher.getKeywordCount('Hello hello world', mockKeywords)).toBe(3);
      expect(KeywordMatcher.getKeywordCount('No matches', mockKeywords)).toBe(0);
    });
  });

  describe('highlightKeywords', () => {
    it('should generate HTML with highlighted keywords', () => {
      const text = 'Hello world';
      const html = KeywordMatcher.highlightKeywords(text, mockKeywords, 'highlight');
      
      expect(html).toContain('<span class="highlight" data-keyword-id="keyword-1">Hello</span>');
      expect(html).toContain('<span class="highlight" data-keyword-id="keyword-2">world</span>');
    });

    it('should use default class when not specified', () => {
      const text = 'Hello world';
      const html = KeywordMatcher.highlightKeywords(text, mockKeywords);
      
      expect(html).toContain('class="keyword-highlight"');
    });

    it('should handle text without keywords', () => {
      const text = 'No matches here';
      const html = KeywordMatcher.highlightKeywords(text, mockKeywords);
      
      expect(html).toBe('No matches here');
    });
  });

  describe('filterKeywordsByTime', () => {
    it('should filter keywords by time range', () => {
      const filtered = KeywordMatcher.filterKeywordsByTime(mockKeywords, 2.0, 6.0);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].word).toBe('hello');
      expect(filtered[1].word).toBe('world');
    });

    it('should include keywords that overlap with time range', () => {
      const filtered = KeywordMatcher.filterKeywordsByTime(mockKeywords, 4.0, 5.5);
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].word).toBe('hello');
      expect(filtered[1].word).toBe('world');
    });

    it('should return empty array when no keywords in range', () => {
      const filtered = KeywordMatcher.filterKeywordsByTime(mockKeywords, 0.0, 1.0);
      expect(filtered).toHaveLength(0);
    });
  });

  describe('sortKeywordsByImportance', () => {
    it('should sort keywords by word length (longer first)', () => {
      const keywords = [
        { id: '1', word: 'a', translation: '', startTime: 0, endTime: 1 },
        { id: '2', word: 'hello', translation: '', startTime: 0, endTime: 1 },
        { id: '3', word: 'hi', translation: '', startTime: 0, endTime: 1 }
      ];
      
      const sorted = KeywordMatcher.sortKeywordsByImportance(keywords);
      
      expect(sorted[0].word).toBe('hello');
      expect(sorted[1].word).toBe('hi');
      expect(sorted[2].word).toBe('a');
    });

    it('should not modify original array', () => {
      const original = [...mockKeywords];
      KeywordMatcher.sortKeywordsByImportance(mockKeywords);
      
      expect(mockKeywords).toEqual(original);
    });
  });

  describe('validateKeyword', () => {
    it('should validate correct keyword', () => {
      expect(KeywordMatcher.validateKeyword(mockKeywords[0])).toBe(true);
    });

    it('should reject keyword with missing required fields', () => {
      const invalidKeywords = [
        { id: '', word: 'hello', translation: 'hi', startTime: 0, endTime: 1 },
        { id: '1', word: '', translation: 'hi', startTime: 0, endTime: 1 },
        { id: '1', word: 'hello', translation: '', startTime: 0, endTime: 1 },
        { id: '1', word: 'hello', translation: 'hi', startTime: -1, endTime: 1 },
        { id: '1', word: 'hello', translation: 'hi', startTime: 2, endTime: 1 }
      ];
      
      invalidKeywords.forEach(keyword => {
        expect(KeywordMatcher.validateKeyword(keyword as KeywordData)).toBe(false);
      });
    });

    it('should reject keyword with invalid time values', () => {
      const invalidKeyword = {
        id: '1',
        word: 'hello',
        translation: 'hi',
        startTime: 5,
        endTime: 3
      };
      
      expect(KeywordMatcher.validateKeyword(invalidKeyword)).toBe(false);
    });
  });
});
