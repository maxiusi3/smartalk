'use client'

import { useState, MouseEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SpeakingTip {
  id: string
  title: string
  category: 'pronunciation' | 'conversation' | 'confidence' | 'culture'
  content: string
  example?: string
  audioUrl?: string
}

const speakingTips: SpeakingTip[] = [
  {
    id: 'tip-1',
    title: '自然语调的秘密',
    category: 'pronunciation',
    content: '不要逐字朗读，而要按意群说话。把句子分成几个意思相关的词组，每个意群之间稍作停顿。',
    example: 'I went to the store | to buy some groceries | for dinner tonight.',
    audioUrl: '/audio/tips/intonation.mp3'
  },
  {
    id: 'tip-2',
    title: '开启对话的万能句式',
    category: 'conversation',
    content: '使用这些句式可以自然地开始任何对话，让你显得更加自信和友好。',
    example: '"I couldn\'t help but notice..." 或 "Speaking of which..." 或 "That reminds me..."'
  },
  {
    id: 'tip-3',
    title: '克服开口恐惧',
    category: 'confidence',
    content: '记住：犯错是学习的一部分。母语者也会犯语法错误，重要的是传达你的意思。',
    example: '与其说 "My English is not good"，不如说 "I\'m still learning, please bear with me."'
  },
  {
    id: 'tip-4',
    title: '文化背景小贴士',
    category: 'culture',
    content: '了解文化背景能让你的表达更地道。比如西方人更喜欢直接表达，而不是过度客套。',
    example: '说 "Could you help me?" 比 "I\'m sorry to bother you, but..." 更自然。'
  },
  {
    id: 'tip-5',
    title: '填充词的巧妙使用',
    category: 'conversation',
    content: '当你需要思考时，使用自然的填充词而不是沉默，这会让对话更流畅。',
    example: '"Well..." "You know..." "Actually..." "Let me think..." 都是很好的选择。'
  },
  {
    id: 'tip-6',
    title: '重音位置决定意思',
    category: 'pronunciation',
    content: '英语是重音语言，重音位置的改变会影响句子的意思和情感色彩。',
    example: '"I didn\'t say HE stole it" vs "I DIDN\'T say he stole it" 意思完全不同。'
  }
]

const categoryNames = {
  pronunciation: '发音技巧',
  conversation: '对话技巧',
  confidence: '自信表达',
  culture: '文化理解'
}

const categoryColors = {
  pronunciation: 'bg-blue-50 text-blue-700 border-blue-200',
  conversation: 'bg-green-50 text-green-700 border-green-200',
  confidence: 'bg-purple-50 text-purple-700 border-purple-200',
  culture: 'bg-orange-50 text-orange-700 border-orange-200'
}

interface SpeakingTipsProps {
  isOpen: boolean
  onClose: () => void
}

export function SpeakingTips({ isOpen, onClose }: SpeakingTipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTip, setSelectedTip] = useState<SpeakingTip | null>(null)

  if (!isOpen) return null

  const filteredTips = selectedCategory === 'all' 
    ? speakingTips 
    : speakingTips.filter(tip => tip.category === selectedCategory)

  const handleTipClick = (tip: SpeakingTip) => {
    setSelectedTip(tip)
  }

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl)
    audio.play().catch(() => {
      console.log('Audio playback failed')
    })
  }

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">💡</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">说话技巧宝典</h2>
                <p className="text-white/90">让你的英语表达更自然、更自信</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-1/3 border-r border-neutral-200 p-6 overflow-y-auto">
            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="font-medium text-neutral-800 mb-3">技巧分类</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  全部技巧
                </button>
                {Object.entries(categoryNames).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === key
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips List */}
            <div className="space-y-3">
              <h3 className="font-medium text-neutral-800">
                技巧列表 ({filteredTips.length})
              </h3>
              {filteredTips.map((tip) => (
                <div
                  key={tip.id}
                  onClick={() => handleTipClick(tip)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTip?.id === tip.id
                      ? 'border-primary-300 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-neutral-800 text-sm leading-tight">
                      {tip.title}
                    </h4>
                    {tip.audioUrl && (
                      <div className="text-primary-500 ml-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824a1 1 0 011.617.824zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={`inline-block px-2 py-1 rounded text-xs border ${categoryColors[tip.category]}`}>
                    {categoryNames[tip.category]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedTip ? (
              <div className="space-y-6">
                {/* Tip Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-neutral-800">
                      {selectedTip.title}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm border ${categoryColors[selectedTip.category]}`}>
                      {categoryNames[selectedTip.category]}
                    </div>
                  </div>
                  
                  {selectedTip.audioUrl && (
                    <Button
                      onClick={() => playAudio(selectedTip.audioUrl!)}
                      className="mb-4 flex items-center space-x-2"
                      variant="outline"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      <span>播放示例音频</span>
                    </Button>
                  )}
                </div>

                {/* Tip Content */}
                <Card>
                  <CardHeader>
                    <h4 className="font-medium text-neutral-800">💡 核心要点</h4>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-700 leading-relaxed">
                      {selectedTip.content}
                    </p>
                  </CardContent>
                </Card>

                {/* Example */}
                {selectedTip.example && (
                  <Card>
                    <CardHeader>
                      <h4 className="font-medium text-neutral-800">📝 实用示例</h4>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-neutral-50 rounded-lg p-4 border-l-4 border-primary-500">
                        <p className="text-neutral-700 font-mono text-sm leading-relaxed">
                          {selectedTip.example}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Practice Suggestion */}
                <Card>
                  <CardHeader>
                    <h4 className="font-medium text-neutral-800">🎯 练习建议</h4>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          1
                        </div>
                        <p className="text-neutral-700 text-sm">
                          在日常对话中有意识地应用这个技巧
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          2
                        </div>
                        <p className="text-neutral-700 text-sm">
                          录制自己的练习音频，对比改进前后的效果
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                          3
                        </div>
                        <p className="text-neutral-700 text-sm">
                          在开芯说的故事学习中特别注意相关表达
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-4xl">💡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-neutral-800 mb-2">
                      选择一个技巧开始学习
                    </h3>
                    <p className="text-neutral-600">
                      点击左侧的技巧卡片查看详细内容和练习建议
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
