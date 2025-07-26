export default function RegisterPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
          }}>创建账户</h1>
          <p style={{ color: '#6b7280' }}>加入 SmarTalk 开始学习</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            background: '#fef3cd',
            border: '1px solid #fbbf24',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            注册功能正在开发中，请稍后再试。
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="/auth/login"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            已有账户？立即登录
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a
            href="/"
            style={{
              color: '#6b7280',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
