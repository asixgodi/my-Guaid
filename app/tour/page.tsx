
import { Suspense } from 'react';
import TourClient from './TourClient';
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/lib/auth"; // 假设你有这个配置
import { prisma } from "@/lib/prisma"; // 直接读库，比 fetch API 更快
async function getItineraries(userId: string) {
    // 直接读数据库，或者 fetch 你的 API
    return await prisma.itinerary.findMany({ where: { userId } });
  }

  async function getXhsNotes(userId: string) {
    return await prisma.xhsNote.findMany({ where: { userId } });
  }
export default async function TourPage() {
  const session = await getServerSession(authOptions);
  if(!session?.user){
    return (
      <div>请先登录</div>
    )
  }
  return(
    <Suspense fallback={<div className='font-bold flex justify-center items-center text-2xl'>加载中...</div>}>
      <TourClientWrapper userId={session.user.id} />
    </Suspense>
  )
}
async function TourClientWrapper({userId}:{userId:string}){
  const [itineraries,xhsNotes] = await Promise.all([
    getItineraries(userId),
    getXhsNotes(userId)
  ])
  return <TourClient initialItineraries={itineraries} initialXhsNotes={xhsNotes} />
}
