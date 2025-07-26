// 简化的魔法时刻模态框，移除复杂依赖
export function MagicMomentModal({ isOpen, onClose, onComplete }: {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          ✨ 魔法时刻
        </h2>
        <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
          魔法时刻功能正在开发中，敬请期待！
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: '#e5e7eb',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            关闭
          </button>
          <button
            onClick={onComplete}
            style={{
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  )
}
