'use client';

// 简化的全局错误页面，避免任何可能触发 styled-jsx 的代码
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>500 - 服务器错误</title>
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
              color: '#dc2626',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>500</h1>
            <h2 style={{
              fontSize: '1.5rem',
              color: '#374151',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>服务器错误</h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              margin: '0 0 2rem 0',
              lineHeight: '1.5'
            }}>抱歉，服务器遇到了一些问题。</p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => reset()}
                style={{
                  display: 'inline-block',
                  background: '#2563eb',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                重试
              </button>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  background: '#6b7280',
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
        </div>
      </body>
    </html>
  );
}
