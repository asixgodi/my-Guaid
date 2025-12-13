import NextAuth,{AuthOptions} from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
export const authOptions:AuthOptions={
    providers:[
        // 在这里添加你的认证提供者，例如 CredentialsProvider(账号密码登录)、GitHubProvider 等
        CredentialsProvider({
            name:'credentials',
            credentials:{
                email:{label:'Email',type:'email'},
                password:{ label: 'Password', type: 'password'}
            },
            async authorize(credentials){
                // 在这里实现认证逻辑，例如验证用户名和密码
                if(!credentials?.email || !credentials?.password){
                    throw new Error('邮箱和密码不能为空')
                }
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                })
                if(!user){
                    throw new Error('该邮箱未注册')
                }
                const isValidPassword = await bcrypt.compare(credentials.password,user.password)
                if(!isValidPassword){
                    throw new Error('密码错误')
                }
                return { id: user.id, email: user.email, username: user.username };
            }
        })
    ],
    pages:{signIn:'/login'},
    session:{
        strategy:'jwt',
        maxAge:1*24*60*60 // 1 天
    },
    callbacks:{
        // 将从数据库获取的用户信息存储到token中 token 是 NextAuth 生成的初始加密对象
        async jwt({token,user}){
            if(user){
                token.id = user.id
                token.email = user.email
                token.username = user.username
            }
            return token
        },
        // 把 token 里的数据，搬运到 session.user 里
        // 这样前端 useSession() 才能拿到 id 和 username
        async session({session,token}){
            if(session.user){
                session.user.id = token.id as string
                session.user.email = token.email as string
                session.user.username = token.username as string    
            }
            return session
        }
    },
    secret:process.env.NEXTAUTH_SECRET,
    events:{
        async signIn({ user }) {
            console.log("User signed in:", user);
        },
    },
}