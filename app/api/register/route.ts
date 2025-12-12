import { NextRequest,NextResponse } from "next/server";
import {prisma} from '@/lib/prisma';
import { Resend } from "resend";
import { randomBytes } from "crypto";
export async function POST(req:NextRequest){
    const {email,username,password} = await req.json();
    const resend = new Resend(process.env.RESEND_API_KEY);
    if(!email || !username || !password){
        return NextResponse.json({error:'缺少必要字段'},{status:400})
    }
    try{
        const existUsername = await prisma.user.findUnique({
            where:{username}
        })
        const existEmail = await prisma.user.findUnique({
            where:{email}
        })
        if(existUsername){
            return NextResponse.json({error:'用户名已被占用'},{status:400})
        }
        if(existEmail){
            return NextResponse.json({error:'邮箱已被注册'},{status:400})
        }
        // 删除过期的验证码 lt表示less than
        await prisma.verificationToken.deleteMany({
            where:{
                expires:{lt:new Date()}
            }
        })
        // 生成验证码
        const verificationCode = randomBytes(3).toString('hex')
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
        console.log("收到请求:", { email, username, password });
        console.log("生成的验证码:", verificationCode);
        // 保存验证码
        await prisma.verificationToken.create({
            data: { identifier: email, token: verificationCode, expires },
        })
        // 发送验证码邮件
        const emailHtml = `<p>您的验证码是：<strong>${verificationCode}</strong></p>`;
        const sendResult = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "注册验证码",
            html: emailHtml,
        })
        console.log('发送结果',sendResult);
        return NextResponse.json({ message: "验证码已发送" }, { status: 200 });
    }catch(err){
        console.error("注册错误:", err);
        return NextResponse.json({ error: "服务器错误" }, { status: 500 });
    }
}