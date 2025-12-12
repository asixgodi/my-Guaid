import { NextRequest,NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import bcrypt from "bcryptjs";
interface RegisterBody {
  email?: string;
  username?: string;
  password?: string;
  code?: string;
}
export async function POST(req:NextRequest){
    const {email,username,password,code} = (await req.json()) as RegisterBody;
    if (!email || !password || !username || !code) {
        return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }
    try{
        // 校验验证码是否正确
        const existCode = await prisma.verificationToken.findUnique({
            where:{
                // 对于这种由多个字段组成的唯一索引，Prisma 自动生成的 Client 会给这个组合起一个名字。默认规则是：把字段名用下划线拼起来。
                 identifier_token: {
                    identifier: email,
                    token: code,
                },
            }
        })
        if(!existCode || existCode.expires < new Date()){
            return NextResponse.json({error:'验证码无效或已过期'},{status:400  })
        }

        // 2. 删除已验证的验证码记录
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token: code,
                },
            },
        });

        // 3. 创建用户 先对密码进行加密
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data:{
                email,
                username,
                password:hashedPassword,
            }
        })
        return NextResponse.json({ message: "注册成功！" });
    }catch(err){
        console.error("注册错误:", err);
        return NextResponse.json({ error: "服务器错误" }, { status: 500 });
    }   
}