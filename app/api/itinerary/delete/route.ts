import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export async function DELETE(req:NextRequest){
    const {id} = await req.json()
    const session = await getServerSession(authOptions)
    if(!session || !session.user){
        return NextResponse.json({message:'未授权'}, {status:401})
    }
    if(!id){
        return NextResponse.json({message:'缺少行程ID'}, {status:400})
    }
    try{
        const res = await prisma.itinerary.findUnique({
            where:{id}
        })
        if(!res || res.userId !== session.user.id){
            return NextResponse.json({message:'行程不存在或无权限删除'}, {status:403})
        }
        await prisma.itinerary.delete({
            where:{id}
        })
        return NextResponse.json({message:'行程删除成功'}, {status:200})
    }catch(error){
        return NextResponse.json({message:'删除行程失败'}, {status:500})
    }
}