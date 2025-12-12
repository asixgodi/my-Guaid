// 1. 引入 NextAuth 主程序
import NextAuth from 'next-auth';

// 2. 引入配置（这通常是你定义 authorize 函数的地方）
import { authOptions } from '@/lib/auth';

// 3. 初始化引擎
// 这里把你的配置传给 NextAuth，它生成了一个请求处理器 (handler)
const handler = NextAuth(authOptions);

// 4. 导出 GET 和 POST
// Next.js App Router 规定：API 路由必须导出 GET, POST 等函数名
export { handler as GET, handler as POST };