export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{
          fontSize: '4rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>404</h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#374151',
          marginBottom: '1rem'
        }}>页面未找到</h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem'
        }}>抱歉，您访问的页面不存在或已被移动。</p>
        <a href="/" style={{
          display: 'inline-block',
          background: '#2563eb',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          textDecoration: 'none'
        }}>返回首页</a>
      </div>
    </div>
  );
}
