'use client';
/* eslint-disable @next/next/no-img-element */
import React, { memo,useState,useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Trash2 } from "lucide-react";
import useTourStore from '../store/useTourStore';
// 瀑布流布局
import Masonry from 'react-masonry-css';
//定义响应式断点：不同屏幕宽度显示几列
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};
const Tour = memo(() => {
  const router = useRouter()
  const [loading,setLoading] = useState(false)
  const {data:session,status} = useSession()
  const [itineraries,setItineraries] = useState<any[]>([])
  const [xhsNotes,setXhsNotes] = useState<any[]>([])
  const {setTourGuide,setCity} = useTourStore()

  // 获取用户行程
  const fetchItineraries = useCallback(async()=>{
    if(!session?.user?.id) return
    setLoading(true)
    try{  
      const res = await fetch(`/api/itinerary/list`)
      if (!res.ok) throw new Error("获取行程数据失败");
      const data = await res.json();
      setItineraries(data);
    }catch(error){
      console.error('Failed to fetch itineraries:',error)
    }finally{
      setLoading(false)
    }
  },[session])
  
  // 获取用户小红书笔记
  const fetchXhsNotes = useCallback(async()=>{
    if(!session?.user?.id) return
    try{
      const res = await fetch('/api/xhs/notes')
      if(!res.ok) throw new Error('获取小红书笔记失败')
      const data = await res.json()
      setXhsNotes(data)
    }catch(error){
      console.error('获取小红书笔记失败:',error)
    }
  },[session])

  // 删除用户行程
  const deleteItinerary = useCallback(async(id:string,e:React.MouseEvent)=>{
     e.stopPropagation();
     if (!confirm("确定要删除这个行程吗？")) return;
      try {
        const response = await fetch(`/api/itinerary/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("删除行程失败");
          setItineraries((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        console.error("删除行程失败:", error);
        alert("删除行程失败，请稍后重试");
      }
  },[])

  const deleteXhsNote = useCallback(async(id:string,e:React.MouseEvent)=>{
    e.stopPropagation();
    if (!confirm("确定要删除这个小红书笔记吗？")) return;

    try {
      const response = await fetch(`/api/xhs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除小红书笔记失败");
      setXhsNotes((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("删除小红书笔记失败:", error);
      alert("删除小红书笔记失败，请稍后重试");
    }
  },[])

  // 跳转行程详情页
  const goToDetail = (item:any)=>{
    setTourGuide({city:item.city,schedule:item.schedule})
    setCity(item.city)
    router.push('/touronceplan')
  }

    // 点击小红书笔记跳转到详情页
  const goToXhsDetail = (id: any) => {
    router.push(`/xhstour?noteId=${id}`); // 跳转到小红书详情页
  };

  useEffect(()=>{
    if(status === 'authenticated'){
      fetchItineraries()
      fetchXhsNotes()
    }
  },[status,fetchItineraries,fetchXhsNotes])
  
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
              <div 
                key={item.id}
                className='relative bg-white shadow-lg overflow-hidden rounded-xl cursor-pointer mb-8'
                onClick={()=>goToDetail(item)}
              >
                <img 
                  src={item.schedule?.[0]?.places?.[0]?.image} alt={item.city} 
                  className='w-full h-auto transform transition-transform duration-300 hover:scale-103'
                 />
                 <div className='p-4'>
                    <div className='flex justify-between items-center'>
                      <h2 className='font-bold text-xl p-2'>{item.city}</h2>
                      <button 
                        title='删除行程'
                        className='mr-4 text-red-500 hover:text-red-700'
                        onClick={(e)=>deleteItinerary(item.id,e)}
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                    <div className='flex justify-between items-center mb-2 text-sm text-gray-600'>
                      <span>{item.schedule?.length}天的行程</span>
                      <span>创建于{new Date(item.generatedAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
            ))
          }
        </Masonry>
      ) :(
        <p className='text-center text-gray-500 mb-8'>暂无行程数据</p>
      )}

      {/* 小红书笔记 */}
      <h1 className='text-3xl font-bold mb-6'>小红书笔记</h1>
      {loading ? (
        <p className='text-center text-gray-500 mb-8'>行程数据加载中</p>
      ) : (
        xhsNotes.length >0 ? (
          <Masonry breakpointCols={breakpointColumnsObj} className="flex gap-6" columnClassName="p-4">
            {
              xhsNotes.map((item)=>(
                <div 
                  key={item.id}
                  className="relative rounded-xl overflow-hidden bg-white shadow-lg mb-6 cursor-pointer"
                  onClick={()=>goToXhsDetail(item.id)}
                >
                  <img 
                    src={item.images?.[0]} alt={item.title}
                    className='w-full h-auto transform transition-transform duration-300 hover:scale-103'
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                      <button
                        onClick={(event) => deleteXhsNote(item.id, event)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="删除小红书笔记"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{item.jsonBody?.data?.length || 0} 天行程</span>
                      <span>创建于 {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
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