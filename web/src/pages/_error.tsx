// 自定义错误页面，避免 styled-jsx 问题
function Error({ statusCode }: { statusCode: number }) {
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
          color: statusCode === 404 ? '#1f2937' : '#dc2626',
          marginBottom: '1rem'
        }}>{statusCode}</h1>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#374151',
          marginBottom: '1rem'
        }}>
          {statusCode === 404 ? '页面未找到' : '服务器错误'}
        </h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '2rem',
          lineHeight: '1.5'
        }}>
          {statusCode === 404 
            ? '抱歉，您访问的页面不存在或已被移动。'
            : '抱歉，服务器遇到了一些问题，请稍后再试。'
          }
        </p>
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

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
