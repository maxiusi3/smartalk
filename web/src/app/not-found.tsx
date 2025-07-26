/**
 * 404 页面
 * 当用户访问不存在的页面时显示
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">页面未找到</h2>
          <p className="text-gray-600">
            抱歉，您访问的页面不存在或已被移动。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回首页
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>或者您可以：</p>
            <ul className="mt-2 space-y-1">
              <li>
                <Link href="/learn" className="text-blue-600 hover:underline">
                  开始学习
                </Link>
              </li>
              <li>
                <Link href="/stories" className="text-blue-600 hover:underline">
                  浏览故事
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
