import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

// 模块扩展
declare module "next-auth" {
  /**
   * 扩展 Session 接口
   * 让 session.user 能拥有 id 和 username
   */
  interface Session {
    // 类型交叉
    user: {
      id: string
      username: string
    } & DefaultSession["user"]
  }

  /**
   * 扩展 User 接口
   * 这是 authorize 返回的对象，也是 jwt 回调里的 user 参数
   */
  interface User {
    id: string
    username: string
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展 JWT 接口，同名接口会自动合并
   * 让 token 能存储 id 和 username
   */
  interface JWT {
    id: string
    username: string
  }
}