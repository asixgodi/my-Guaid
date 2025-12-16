'use client'
import React, { memo,useState } from 'react'
import dynamic from "next/dynamic";
import {motion} from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import useTourStore  from '@/app/store/useTourStore';
import { Palette, History, Music, Mountain, Utensils, Building2, Trees, ShoppingBag } from "lucide-react";
import { Card,CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// 设置card的动画
const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const Create = memo(() => {
  const [city,setCity] = useState('')
  const [loading,setLoading] = useState(false)
  const [selectedInterests,setSelectedInterests] = useState<string[]>([])
  const [error,setError] = useState<string|null>(null)
  const router = useRouter()
  const interests = [
    { id: "art", label: "艺术", icon: <Palette className="h-4 w-4" /> },
    { id: "history", label: "历史", icon: <History className="h-4 w-4" /> },
    { id: "music", label: "音乐", icon: <Music className="h-4 w-4" /> },
    { id: "sightseeing", label: "观光", icon: <Mountain className="h-4 w-4" /> },
    { id: "food", label: "美食", icon: <Utensils className="h-4 w-4" /> },
    { id: "museum", label: "博物馆", icon: <Building2 className="h-4 w-4" /> },
    { id: "nature", label: "自然公园", icon: <Trees className="h-4 w-4" /> },
    { id: "shopping", label: "购物", icon: <ShoppingBag className="h-4 w-4" /> },
  ];
  const handleCitySelect = (city:string)=>{
     setCity(city)
     console.log("Selected city:", city);
  }
  const handleInterestsToggle = (interestId:string) =>{
    // 如果之前存在就过滤出去，如果不存在就加入
    setSelectedInterests((prev)=>
      prev.includes(interestId) ? prev.filter((id)=>id!==interestId) : [...prev,interestId]
    )
  }

  const handleSumbit = async()=>{
    setLoading(true)
    const keyword = selectedInterests.length > 0 ? selectedInterests.join(",") : "博物馆\文化\艺术\历史\商场\图书馆等各式各样景点";
    try{
      const response = await fetch(`/api/getTourismGuide?city=${city}&keyword=${keyword}&days=1`);
      const data = await response.json();

      if (response.ok && data.schedule) {
        useTourStore.getState().setCity(data.city || ''); // 设置城市
        useTourStore.getState().setTourGuide({
          city: data.city || '',
          schedule: data.schedule,
        });
        router.push('/touronceplan');
      } else {
        setError(data.message || '获取攻略失败');
      }
    }catch(error){
      setError("创建旅程时出错，请稍后重试。")
    }finally{
      setLoading(false)
    }
  }
  return (
    <div className='flex h-[calc(100vh-4rem)] p-3'>
      {/* 地图区域 */}
      <div className='w-3/5 relative rounded-md'>
        <Map onCitySelect={handleCitySelect} />
        <div className='absolute top-3 left-20 bg-white px-4 py-2 rounded-md shadow-md'>
          <h1 className='font-bold text-xl'>点击地图选择您的旅行目的地</h1>
        </div>
      </div>
      {/* 右侧表达区域 */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className='w-2/5'
      >
        <Card className='h-full border-none bg-white/95] ml-2'>
          <CardContent>
            {/* 选择城市 */}
            <div className='space-y-4 pt-4'>
              <h2 className='md:text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent'>
                规划您的旅程
              </h2>
              <div>
                <Input
                  placeholder='请选择您要前往的城市'
                  value={city}
                  onChange={(e)=>setCity(e.target.value)}
                  className='bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all duration-300'
                />
                
              </div>
            </div>
            {/* 兴趣选择 */}
            <div className='space-y-4 mt-8'>
              <h3 className='text-xl font-semibold text-gray-700 '>选择兴趣</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {
                  interests.map((interest)=>(
                    <motion.div
                      key={interest.id}
                      whileHover={{scale:1.03}}
                      onClick={()=>handleInterestsToggle(interest.id)}
                      className={cn(
                        'flex items-center rounded-lg cursor-pointer border',
                        selectedInterests.includes(interest.id)
                        ? 'bg-blue-100  border-blue-500 p-2'
                        : 'bg-gray-100  border-transparent p-2 hover:bg-gray-200'
                      )}
                    >
                      <Checkbox
                        id={interest.id}
                        checked={selectedInterests.includes(interest.id)}
                      />
                      <label htmlFor={interest.id} className='ml-2 flex items-center gap-2'>
                        {interest.icon}
                        <span>{interest.label}</span>
                      </label>
                    </motion.div>
                  ))
                }
              </div>
              <div className="text-sm text-gray-600 italic">
                  已选: {selectedInterests.length > 0 ? selectedInterests.join(", ") : "未选择"}
              </div>
            </div>

            {/* 按钮 */}
            <div className='mt-8'>
                <Button 
                  className='w-full bg-blue-500 text-white hover:bg-blue-700'
                  disabled={loading || !city || selectedInterests.length === 0}
                  size='lg'
                  onClick={handleSumbit}
                >
                  {
                    loading ? (
                      <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" className="opacity-25" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                        生成中...
                      </span>
                    ) :
                    (
                      '创建我的旅程'
                    )
                  }
                </Button>
            </div>
            {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm bg-red-50 p-2 rounded"
                >
                  {error}
                </motion.div>
            )}    
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
})

Create.displayName = 'Create'

export default Create