'use client';
/* eslint-disable @next/next/no-img-element */
import React, { memo,useState,useEffect, useCallback, use } from 'react'
import { useSession } from 'next-auth/react'
import { useItinerary } from '@/hooks/useTour';
// 瀑布流布局
import Masonry from 'react-masonry-css';
import { TourCard } from '@/app/tour/components/TourCard';
//定义响应式断点：不同屏幕宽度显示几列
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};
interface TourProps {
  initialItineraries: any[];
  initialXhsNotes: any[];
}
const Tour = memo(({ initialItineraries, initialXhsNotes }: TourProps) => {
  const {data:session,status} = useSession()

  const {
    itineraries,
    loading,
    deleteItinerary,
    xhsNotes,  
    deleteXhsNote,
    goToDetail,
    goToXhsDetail
  } = useItinerary(session?.user?.id || '',initialItineraries,initialXhsNotes);
  
  return (
    <div className='constainer mx-auto p-5'>
      {/* 用户信息 */}
      {session && session.user ?(
        <div className='px-3 py-6 bg-white shadow-lg flex justify-center max-w-md mx-auto rounded-xl mb-8'>
          <img
            src='1.jpg'
            alt='用户头像'
            className='w-20 h-20 rounded-full border-white border-2 shadow-lg mr-4'
          />
          <div className='flex flex-col items-start justify-center'>
            <h1 className='font-bold text-2xl'>{session.user.username || '未登录'}</h1>
            <p>邮箱：{session.user.email || '未登录'}</p>
          </div>
        </div>
      ):(
        <p></p>
      )}

      {/* 行程列表 */}
      <h1 className='font-bold text-3xl mb-6'>我的行程</h1>
      {loading ? (
        <p className='text-center text-gray-500 mb-8'>行程数据加载中...</p>
      ) : itineraries.length >0 ? (
        <Masonry breakpointCols={breakpointColumnsObj} className='flex gap-6' columnClassName='p-4'>
          {
            itineraries.map((item)=>(
              <TourCard
                key={item.id}
                onClick={()=>goToDetail(item)}
                image={item.schedule?.[0]?.places?.[0]?.image}
                title={item.city}
                onDelete={(e)=>deleteItinerary(item.id,e)}
                deleteLabel='删除行程'
                subtitle1={`${item.schedule?.length}天的行程`}
                subtitle2={`创建于${new Date(item.generatedAt).toLocaleDateString()}`}
              />
            ))
          }
        </Masonry>
      ) :(
        <p className='text-center text-gray-500 mb-8'>暂无行程数据</p>
      )}

      {/* 小红书笔记 */}
      <h1 className='text-3xl font-bold mb-6'>小红书笔记</h1>
      {loading ? (
        <p className='text-center text-gray-500 mb-8'>小红书笔记加载中...</p>
      ) : (
        xhsNotes.length >0 ? (
          <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="p-4">
            {
              xhsNotes.map((item)=>(
                <TourCard
                  key={item.id}
                  onClick={()=>goToXhsDetail(item.id)}
                  image={item.images?.[0]}
                  title={item.title}
                  onDelete={(event) => deleteXhsNote(item.id, event)}
                  deleteLabel='删除小红书笔记'
                  subtitle1={`${item.jsonBody?.data?.length || 0} 天行程`}
                  subtitle2={`创建于 ${new Date(item.createdAt).toLocaleDateString()}`}
                />
              ))
            }
          </Masonry>
        ) :(
          <p className='text-center text-gray-500 mb-8'>暂无小红书笔记数据</p>
        )
      )}
    </div>
  )
})

Tour.displayName = 'Tour'

export default Tour