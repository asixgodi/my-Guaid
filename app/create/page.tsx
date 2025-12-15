'use client'
import React, { memo,useState } from 'react'
import dynamic from "next/dynamic";
import {motion} from 'framer-motion'
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// 设置card的动画
const cardVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};
const Create = memo(() => {
  const [city,setCity] = useState('')
  const handleCitySelect = (city:string)=>{
     setCity(city)
     console.log("Selected city:", city);
  }
  return (
    <div className='flex h-[calc(100vh-4rem)] p-3'>
      {/* 地图区域 */}
      <div className='w-3/5 relative'>
        <Map onCitySelect={handleCitySelect} />
        <div className='absolute top-3 left-20 bg-white px-4 py-2 rounded-md shadow-md'>
          <h1 className='font-bold text-2xl'>点击地图选择您的旅行目的地</h1>
        </div>
      </div>
      {/* 右侧表达区域 */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className='w-2/5'
      >

      </motion.div>
    </div>
  )
})

Create.displayName = 'Create'

export default Create