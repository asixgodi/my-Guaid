'use client'
import React, { memo,useEffect,useState } from 'react'
import { Plane, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from "react-markdown";
import { cn } from '@/lib/utils';
interface Message {
  role: "user" | "assistant";
  content: string;
}

const Reply = memo(() => {
  // 用户所提问的消息列表
  const [message,setMessage] = useState<Message[]>([])
  const [input,setInput] = useState("")
  const [loading,setLoding] = useState(false)

  //加载时读取 localStorage
  useEffect(()=>{
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("travelMessages");
      if (saved) {
        setMessage(JSON.parse(saved));
      }
    }
  },[])

  //messages更新时 设置localStorage
  useEffect(()=>{
    if (typeof window !== "undefined") {
      localStorage.setItem("travelMessages", JSON.stringify(message));
    }
  },[message])
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()
    if(!input.trim() || loading) return 

    // 用户当前的提问
    const userMessage:Message = {role:"user",content:input.trim()}
    setMessage((prev)=>[...prev,userMessage])
    setInput("")
    setLoding(true)
    try{
      // 发送请求
      const res = await fetch('/api/reply',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({messages:[...message,userMessage]})
      })
       if (!res.ok) {
          throw new Error(`请求失败，状态码: ${res.status}`);
        }
        const data = await res.json();
        setMessage((prev)=>{
          return [...prev,{role:'assistant',content:data.response || "⚠️ AI 目前无法提供建议，请稍后再试。"}]
        })
    }catch(err){
      setMessage((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ AI 访问失败，请稍后再试。" },
      ]);
    }finally{
      setLoding(false)
    }
  }
  return (
    <div className='flex flex-col min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-teal-50'>
      <header className='bg-white/80 border-b border-gray-200  shadow-lg'>
        <div className='flex container mx-auto justify-between items-center px-6 py-4'>
          <div className='flex items-center gap-3'>
            <Plane className='w-8 h-8 text-blue-500'></Plane>
            <h1 className='font-bold text-2xl'>AI 旅行助手</h1>
          </div>
          <Button
            variant="outline"
            disabled={message.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" /> 清空聊天
          </Button>
        </div>
      </header>
      <main className='flex container mx-auto flex-1 items-center justify-center px-4 py-8'>
        <Card className='w-full max-w-4xl bg-white/90'>
          <CardContent className='flex flex-col h-[75vh]'>
            {/* 聊天区域 */}
            <ScrollArea className='flex-1'>
              <div>
                {/* 欢迎消息 */}
                {!message.length && !loading &&(
                  <div className='text-center py-8'>
                    <Plane className='w-10 h-10 text-blue-500 mx-auto mb-4'></Plane>
                    <p className='text-gray-500 text-xl'>欢迎使用 AI 旅行助手!</p>
                    <p className='text-gray-500 text-lg mt-2' >试试问我：“推荐一个日本的旅行行程” 或 “预算5000元的欧洲游怎么安排？”</p>
                  </div>
                )}
                {/* 聊天消息列表 */}
                {message.map((msg,index)=>(
                    <div 
                      key={index} 
                      className={cn(
                        'flex mt-6 mb-2',
                        msg.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                    >
                      <div 
                        className={cn(
                          'max-w-[70%] rounded-xl px-4 py-3 shadow-sm',
                          msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100'
                        )}
                      >
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="leading-relaxed">{children}</p>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))
                }
                {/* 加载状态 */}
                {loading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="rounded-xl bg-gray-200 dark:bg-gray-700 px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500 dark:text-teal-400" />
                      <span className="text-gray-700 dark:text-gray-200">
                        正在为您规划行程...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            {/* 输入区域 */}
            <form onSubmit={handleSubmit}  className='mt-6 flex gap-3'>
              <Input
                placeholder='输入您的旅行问题'
                type='text'
                value={input}
                onChange={(e)=>setInput(e.target.value)}
                disabled={loading}
                className='rounded-full'
              >
              </Input>
              <Button
                type='submit'
                className='rounded-full bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-400'
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
})

Reply.displayName = 'Reply'

export default Reply