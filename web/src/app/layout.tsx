import type { Metadata } from "next";
// import { Inter } from "next/font/google"; // 暂时禁用以避免网络问题
// import ErrorBoundary from "@/components/error-boundary"; // 暂时禁用
import "./globals.css";

// 使用系统字体，避免外部字体加载问题
const systemFont = 'font-sans'; // 使用 Tailwind 的系统字体

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
      <body className={`${systemFont} antialiased`}>
        {children}
      </body>
    </html>
  );
}
