//这个文件是整个应用的根布局文件，定义了HTML结构和全局样式
import { Inter } from "next/font/google";
import AppLayout from "./AppLayout";
import "./globals.css";
import { Providers } from "@/components/Providers";
import type { Metadata } from "next"; // 引入类型
const inter = Inter({ subsets: ['latin'] });
// Readonly包装整个对象，里面进行类型注解
export const metadata: Metadata = {
  title: 'AI 旅行助手 - 智能规划你的行程',
  description: '旅游 - 发现生活，发现美',
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AppLayout>
            {children}
          </AppLayout>
        </Providers>
      </body>
    </html>
  );
}
