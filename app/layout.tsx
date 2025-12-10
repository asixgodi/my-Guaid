//这个文件是整个应用的根布局文件，定义了HTML结构和全局样式
import { Inter } from "next/font/google";
import {metadata} from "./metadata";
import "./globals.css";
const inter = Inter({ subsets: ['latin'] });
// Readonly包装整个对象，里面进行类型注解
export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content={metadata.description}/>
        <meta name="title" content={metadata.title}/>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
