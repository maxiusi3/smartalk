import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ErrorBoundary from "@/components/error-boundary";
import "./globals.css";

// 使用系统字体作为主要字体，避免外部字体加载问题
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  fallback: [
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'Noto Sans',
    'sans-serif',
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji'
  ],
  // 添加预连接以提高字体加载性能
  preload: false, // 禁用预加载以避免网络问题
  // 使用本地字体作为备选
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "SmarTalk - 智能英语学习平台",
  description: "通过故事化学习和智能分析，提升英语口语和听力能力",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
