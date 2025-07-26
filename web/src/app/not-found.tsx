// 简化的 404 页面，避免任何可能触发 styled-jsx 的代码
export default function NotFound() {
  return (
    <html lang="zh-CN">
      <head>
        <title>404 - 页面未找到</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f8fafc',
          margin: 0,
          padding: 0
        }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '500px'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>404</h1>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#374151',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>页面未找到</h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              margin: '0 0 2rem 0',
              lineHeight: '1.5'
            }}>抱歉，您访问的页面不存在或已被移动。</p>
            <a href="/" style={{
              display: 'inline-block',
              background: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '500'
            }}>返回首页</a>
          </div>
        </div>
      </body>
    </html>
  );
}
