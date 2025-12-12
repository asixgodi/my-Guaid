import { PrismaClient } from '@prisma/client'

// 1. 给 globalThis 添加一个类型声明，防止 TS 报错
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 2. 如果全局变量里有，就用全局的；没有就 new 一个新的
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

// 3. 如果不是生产环境，就把实例存到全局变量里
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}