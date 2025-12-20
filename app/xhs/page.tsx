'use client'
import { useSession } from 'next-auth/react'
import React, { memo } from 'react'
import { useState } from 'react'
import { LazyMotion, domAnimation, m } from "framer-motion"
import { cn } from '@/lib/utils'
import { useRouter } from "next/navigation";
import  useXhsStore  from "@/app/store/useXhsStore";
const Xhs = memo(() => {
  const [loading,setLoading] = useState(false)
  const [inputText,setInputText] = useState("")
  const [errorMessage,setErrorMessage] = useState<string | null>(null)
  const {data:session} = useSession()
  const router = useRouter();
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) {
      setErrorMessage("请先登录！");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try{
      //1、先解析小红书内容
      const parseRes = await fetch('/api/xhs/parse', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ link: inputText.trim() }),
      })
      const parseData = await parseRes.json();
      if(!parseRes.ok){
        throw new Error(parseData.error || "解析失败，请稍后再试。")
      }
      //2、调用spark分析,将得到的内容，给AI提示词，让其生成想要的内容。并存入数据库
      const analyzeRes = await fetch('/api/xhs/analyze',{
        method:'POST',
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({...parseData,userId:session.user.id})
      })
      const analyzeData = await analyzeRes.json();
      console.log("分析结果:", analyzeData);
      if (!analyzeRes.ok || analyzeData.error) throw new Error(analyzeData.error || "保存失败");
      useXhsStore.getState().setData(analyzeData);
      router.push(`/xhstour?noteId=${analyzeData.id}`);
    }catch(err:any){
      setErrorMessage(err.message || "解析失败，请稍后再试。")
    }finally{
      setLoading(false)
    }
  }
  
  return (
    <LazyMotion features={domAnimation}>
    <div className='min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 via-white to-red-50 flex items-center justify-center'>
      <m.div
        initial={{opacity:0,y:20}}
        animate={{opacity:1,y:0}}
        transition={{duration:0.5}}
        className='bg-white max-w-lg rounded-2xl shadow-xl w-full p-8'
      >
        <h1 className='font-bold text-3xl text-center mb-6 mt-2'>小红书笔记解析</h1>
        <p className='text-gray-500 text-center mb-6'>
          粘贴小红书分享链接，快速解析笔记内容，生成专属行程！
        </p>
        <form onSubmit={handleSubmit}>
          <m.div 
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="relative"
          >
            <textarea
              value={inputText}
              onChange={(e)=>setInputText(e.target.value)}
              placeholder="粘贴小红书分享内容..."
              disabled={loading}
              className='w-full border border-gray-300 rounded-md p-4 h-32 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none mb-4'
            />
          </m.div>
          {/* 勾选框：执行OCR */}
          {/* <div className='flex items-center mt-4 space-x-2 mb-6'>
            <input
              type='checkbox'
              id='checkbox'
              checked={forceOcr}
              onChange={(e) => setForceOcr(e.target.checked)}
              className='mr-2 h-4 w-4'
            />
            <label htmlFor="checkbox" className='text-sm text-gray-700'>如果刚刚解析的内容不一致，请勾选这个，不过识别会有点久哦</label>
          </div> */}

          {/* 错误提醒 */}
          {errorMessage && (
            <m.p
              initial={{opacity:0}}
              animate={{opacity:1}}
              className='text-red-500 text-center'
            >
              {errorMessage}
              {errorMessage.includes('数量已上限') && (
                <span>
                  {" "}
                  <a href="/cc" className="underline text-pink-500 hover:text-pink-700">
                    去删除笔记
                  </a>
                </span>
              )}
            </m.p>
          )}

          {/* 按钮 */}
          <m.button
            type='submit'
            disabled={loading || !inputText.trim() || !session}
            whileHover={{ scale: !loading ? 1.05 : 1 }}
            whileTap={{ scale: !loading ? 0.95 : 1 }} 
            aria-label='解析'
            className={cn(
              'w-full py-3 text-white rounded-md transition-all duration-300 flex items-center justify-center space-x-2',
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
            )}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>解析中...</span>
              </>
            ) : (
              <span>解析链接</span>
            )}
          </m.button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Powered by <span className="text-pink-500 font-semibold">小红书</span>
          </p>
        </div>
      </m.div>
    </div>
    </LazyMotion>
  )
})

Xhs.displayName = 'Xhs'

export default Xhs