'use client'

// 强制动态渲染，避免预渲染时的 styled-jsx 错误
export const dynamic = 'force-dynamic'

export default function Error500() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '500px',
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>500</h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#374151',
          marginBottom: '1rem'
        }}>服务器内部错误</h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>抱歉，服务器遇到了一些问题，请稍后再试。</p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            background: '#2563eb',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
