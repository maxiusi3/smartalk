'use client'

import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
  showHeader?: boolean
  showFooter?: boolean
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = '',
  showHeader = true,
  showFooter = false
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {showHeader && (
        <header style={{
          background: 'white',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '4rem'
          }}>
            <h1 style={{
              fontSize: '1.25rem',
              fontWeight: '500',
              color: '#1f2937'
            }}>
              开芯说
            </h1>

            <nav style={{
              display: 'flex',
              gap: '2rem'
            }}>
              <a href="#" style={{
                color: '#6b7280',
                textDecoration: 'none'
              }}>学习</a>
              <a href="#" style={{
                color: '#6b7280',
                textDecoration: 'none'
              }}>进度</a>
              <a href="#" style={{
                color: '#6b7280',
                textDecoration: 'none'
              }}>设置</a>
            </nav>
          </div>
        </header>
      )}

      <main style={{ flex: 1 }}>
        {children}
      </main>

      {showFooter && (
        <footer style={{
          background: 'white',
          borderTop: '1px solid #e5e7eb',
          padding: '2rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            © 2024 开芯说. 让语言学习更自然。
          </div>
        </footer>
      )}
    </div>
  )
}

export { MainLayout }
