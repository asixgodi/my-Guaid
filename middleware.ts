import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    console.log("Cookies:", req.cookies.getAll().map(c => c.name));
    // 1. 获取 Token
    // getToken 会自动帮你读取 Cookie 并解密，如果 Cookie 不存在或无效，它返回 null
    const token = await getToken({ 
        req, 
        secret: process.env.NEXTAUTH_SECRET,
        // 强制在本地生产环境测试时 (http://localhost) 禁用 secureCookie
        // 只有当协议是 https 时才开启 secureCookie
        secureCookie: req.nextUrl.protocol === "https:"
    });
     console.log(`[Middleware] Token存在: ${!!token}`);
    // 2. 核心判断逻辑
    // 如果没有 Token (说明没登录)，则强制跳转去登录页
    if (!token) {
        // 创建登录页的 URL
        const url = new URL("/login", req.url);
        
        // (可选) 把当前想去的页面作为参数传过去，登录后跳回来
        // url.searchParams.set("callbackUrl", req.nextUrl.pathname);
        
        return NextResponse.redirect(url);
    }

    // 3. 有 Token，放行
    return NextResponse.next();
}

// 4. 在这里配置所有“需要保护”的路由
// 只有访问下面这些路径时，上面的 middleware 函数才会执行！
export const config = {
  matcher: [
    "/create", 
    "/",
    "/reply", 
    "/dashboard/:path*", // 这里支持通配符，/dashboard/a, /dashboard/b 都会触发
    "/xhs",
    "/tour"
  ],
};