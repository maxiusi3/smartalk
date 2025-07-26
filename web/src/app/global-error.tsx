'use client'

/**
 * 全局错误页面 - 处理应用级别的错误
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="zh-CN">
      <head>
        <title>出错了 | SmarTalk</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              max-width: 28rem;
              width: 100%;
              text-align: center;
              padding: 2rem;
            }
            .title {
              font-size: 3rem;
              font-weight: bold;
              color: #dc2626;
              margin-bottom: 1rem;
            }
            .subtitle {
              font-size: 1.5rem;
              font-weight: 600;
              color: #374151;
              margin-bottom: 0.5rem;
            }
            .description {
              color: #6b7280;
              margin-bottom: 1rem;
            }
            .button {
              display: inline-block;
              background: #dc2626;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              text-decoration: none;
              margin: 0.5rem;
              cursor: pointer;
              border: none;
              font-size: 1rem;
              transition: background-color 0.2s;
            }
            .button:hover {
              background: #b91c1c;
            }
            .button-secondary {
              background: #6b7280;
            }
            .button-secondary:hover {
              background: #4b5563;
            }
          `
        }} />
      </head>
      <body>
        <div className="container">
          <div>
            <h1 className="title">⚠️</h1>
            <h2 className="subtitle">出错了</h2>
            <p className="description">
              应用遇到了一个错误，我们正在努力修复。
            </p>
          </div>
          
          <div>
            <button onClick={reset} className="button">
              重试
            </button>
            <a href="/" className="button button-secondary">
              返回首页
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}
