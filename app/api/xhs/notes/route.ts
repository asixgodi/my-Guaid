import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
export async function GET(req: NextRequest){
    const session = await getServerSession(authOptions)
    if(!session || !session.user?.id){
        return NextResponse.json({message:'未授权'},{status:401})
    }
    const userId = session.user.id
    try{
        const notes = await prisma.xhsNote.findMany({
            where:{userId}
        })
        return NextResponse.json(notes,{
            status:200, 
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
        })
    }catch(error){
        return NextResponse.json({messgae:"获取小红书笔记失败",error:String(error)},{status:500})
    }

}
