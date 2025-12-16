import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";


export async function GET(req:NextRequest){
    const session = await getServerSession(authOptions)
    if(!session || !session.user?.id){
        return NextResponse.json({message:'未授权'}, {status:401})
    }
    const userId = session.user.id
    try{
        const itineraries =await prisma.itinerary.findMany({
            where:{userId}
        })
        //console.log('数据库查到的内容',itineraries)
        return new NextResponse(JSON.stringify(itineraries), {
            status: 200,
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
            },
        });
    }catch(error){
        console.error("获取行程列表失败:", error);
        return new NextResponse(
            JSON.stringify({ message: "获取行程列表失败", error: String(error) }),
            { status: 500 }
        );
    }
}