'use client'

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface Keyword {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  isUnlocked: boolean;
}

export default function StoryCluesPage() {
  const params = useParams();
  const interest = params.interest as string;

  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);

  useEffect(() => {
    // 模拟关键词数据
    const mockKeywords: Keyword[] = [
      { id: '1', word: 'check-in', translation: '办理登机手续', pronunciation: '/tʃek ɪn/', isUnlocked: true },
      { id: '2', word: 'boarding', translation: '登机', pronunciation: '/ˈbɔːrdɪŋ/', isUnlocked: true },
      { id: '3', word: 'luggage', translation: '行李', pronunciation: '/ˈlʌɡɪdʒ/', isUnlocked: false },
      { id: '4', word: 'departure', translation: '出发', pronunciation: '/dɪˈpɑːrtʃər/', isUnlocked: false },
      { id: '5', word: 'arrival', translation: '到达', pronunciation: '/əˈraɪvəl/', isUnlocked: false },
      { id: '6', word: 'passport', translation: '护照', pronunciation: '/ˈpæspɔːrt/', isUnlocked: false },
      { id: '7', word: 'security', translation: '安检', pronunciation: '/sɪˈkjʊrəti/', isUnlocked: false },
      { id: '8', word: 'gate', translation: '登机口', pronunciation: '/ɡeɪt/', isUnlocked: false },
      { id: '9', word: 'delay', translation: '延误', pronunciation: '/dɪˈleɪ/', isUnlocked: false },
      { id: '10', word: 'terminal', translation: '航站楼', pronunciation: '/ˈtɜːrmɪnəl/', isUnlocked: false },
      { id: '11', word: 'ticket', translation: '机票', pronunciation: '/ˈtɪkɪt/', isUnlocked: false },
      { id: '12', word: 'flight', translation: '航班', pronunciation: '/flaɪt/', isUnlocked: false },
      { id: '13', word: 'customs', translation: '海关', pronunciation: '/ˈkʌstəmz/', isUnlocked: false },
      { id: '14', word: 'baggage', translation: '行李', pronunciation: '/ˈbæɡɪdʒ/', isUnlocked: false },
      { id: '15', word: 'journey', translation: '旅程', pronunciation: '/ˈdʒɜːrni/', isUnlocked: false }
    ];

    setKeywords(mockKeywords);
    setUnlockedCount(mockKeywords.filter(k => k.isUnlocked).length);
  }, []);

  const getThemeInfo = (theme: string) => {
    switch (theme) {
      case 'travel':
        return { name: '旅行英语', icon: '✈️', color: '#3b82f6', bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' };
      case 'movie':
        return { name: '电影对话', icon: '🎬', color: '#8b5cf6', bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)' };
      case 'workplace':
        return { name: '职场沟通', icon: '💼', color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' };
      default:
        return { name: '学习', icon: '📚', color: '#6b7280', bg: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' };
    }
  };

  const themeInfo = getThemeInfo(interest);

  const handleKeywordClick = (keyword: Keyword) => {
    if (keyword.isUnlocked) {
      setSelectedKeyword(keyword);
    } else {
      // 导航到 VTPR 学习页面
      window.location.href = `/learning/vtpr?keyword=${keyword.id}&interest=${interest}`;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: themeInfo.bg,
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      {/* 头部 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{themeInfo.icon}</span>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '0.25rem'
              }}>
                {themeInfo.name} - 故事线索
              </h1>
              <p style={{ color: '#6b7280' }}>
                收集所有线索，解锁完整故事的魔法时刻
              </p>
            </div>
          </div>
          <a
            href="/learning"
            style={{
              display: 'inline-block',
              background: 'rgba(255, 255, 255, 0.8)',
              color: '#374151',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            ← 返回学习中心
          </a>
        </div>

        {/* 进度指示器 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              故事线索发现进度
            </h3>
            <span style={{
              background: themeInfo.color,
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '1rem',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}>
              {unlockedCount}/15
            </span>
          </div>

          <div style={{
            width: '100%',
            height: '8px',
            background: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(unlockedCount / 15) * 100}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${themeInfo.color}, ${themeInfo.color}dd)`,
              transition: 'width 0.5s ease'
            }}></div>
          </div>

          <p style={{
            color: '#6b7280',
            fontSize: '0.9rem',
            marginTop: '0.5rem'
          }}>
            {unlockedCount === 15
              ? '🎉 所有线索已收集！准备观看完整故事'
              : `还需收集 ${15 - unlockedCount} 个线索`
            }
          </p>
        </div>
      </div>

      {/* 关键词网格 */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {keywords.map((keyword, index) => (
            <div
              key={keyword.id}
              style={{
                background: keyword.isUnlocked
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(255, 255, 255, 0.4)',
                borderRadius: '1rem',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: keyword.isUnlocked
                  ? `2px solid ${themeInfo.color}`
                  : '2px solid transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => handleKeywordClick(keyword)}
            >
              {/* 解锁状态指示器 */}
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                fontSize: '1.2rem'
              }}>
                {keyword.isUnlocked ? '🔓' : '🔒'}
              </div>

              {/* 序号 */}
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                background: keyword.isUnlocked ? themeInfo.color : '#9ca3af',
                color: 'white',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>

              {/* 单词内容 */}
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: keyword.isUnlocked ? '#1f2937' : '#9ca3af',
                  marginBottom: '0.5rem'
                }}>
                  {keyword.isUnlocked ? keyword.word : '???'}
                </h4>

                {keyword.isUnlocked && (
                  <>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem'
                    }}>
                      {keyword.translation}
                    </p>
                    <p style={{
                      color: '#9ca3af',
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}>
                      {keyword.pronunciation}
                    </p>
                  </>
                )}

                {!keyword.isUnlocked && (
                  <p style={{
                    color: '#9ca3af',
                    fontSize: '0.9rem'
                  }}>
                    点击解锁
                  </p>
                )}
              </div>

              {/* 解锁动画效果 */}
              {keyword.isUnlocked && (
                <div style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  color: themeInfo.color,
                  fontSize: '1rem'
                }}>
                  ✨
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 行动按钮 */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '1rem',
          padding: '2rem',
          backdropFilter: 'blur(10px)'
        }}>
          {unlockedCount === 15 ? (
            <div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                🎉 恭喜！所有线索已收集完成
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '2rem'
              }}>
                现在你可以观看完整的故事，体验无字幕理解的魔法时刻！
              </p>
              <a
                href={`/theater-mode/${interest}`}
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${themeInfo.color}, ${themeInfo.color}dd)`,
                  color: 'white',
                  padding: '1rem 2rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                }}
              >
                🎭 进入剧场模式
              </a>
            </div>
          ) : (
            <div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '1rem'
              }}>
                继续收集故事线索
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '1.5rem'
              }}>
                点击锁定的关键词，通过音画匹配练习来解锁它们
              </p>
              <div style={{
                display: 'inline-block',
                background: '#f3f4f6',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                color: '#6b7280'
              }}>
                💡 提示：每个正确的匹配都会解锁一个新的故事线索
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 关键词详情模态框 */}
      {selectedKeyword && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
          }}
          onClick={() => setSelectedKeyword(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '400px',
              width: '100%',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: themeInfo.color,
              marginBottom: '1rem'
            }}>
              {selectedKeyword.word}
            </h3>
            <p style={{
              fontSize: '1.2rem',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>
              {selectedKeyword.translation}
            </p>
            <p style={{
              color: '#6b7280',
              fontStyle: 'italic',
              marginBottom: '2rem'
            }}>
              {selectedKeyword.pronunciation}
            </p>
            <button
              onClick={() => setSelectedKeyword(null)}
              style={{
                background: themeInfo.color,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
