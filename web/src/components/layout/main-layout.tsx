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
    <div className={`min-h-screen bg-neutral-50 font-chinese ${className}`}>
      {showHeader && (
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-medium text-primary-900">
                  开芯说
                </h1>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  学习
                </a>
                <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  进度
                </a>
                <a href="#" className="text-neutral-600 hover:text-primary-600 transition-colors">
                  设置
                </a>
              </nav>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {showFooter && (
        <footer className="bg-white border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-neutral-500 text-sm">
              © 2024 开芯说. 让语言学习更自然。
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export { MainLayout }
