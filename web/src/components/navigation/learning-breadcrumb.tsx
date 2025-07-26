// 简化的面包屑组件，移除复杂依赖
export function LearningBreadcrumb({ currentPhase, interest, className = '' }: {
  currentPhase: 'preview' | 'collecting' | 'magic-moment'
  interest: string
  className?: string
}) {

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <span>📍 当前阶段: {currentPhase}</span>
      <span>🎯 主题: {interest}</span>
    </div>
  )
}

export function LearningProgressIndicator({ interest }: { interest: string }) {
  return (
    <div style={{
      padding: '1rem',
      background: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <p>学习进度指示器 - {interest}</p>
    </div>
  )
}
