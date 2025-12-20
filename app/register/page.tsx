'use client'
import React, { memo,useState,useRef, useEffect } from 'react'
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AwardIcon } from 'lucide-react';
const Register = memo(() => {
    const [email,setEmail] = useState('')
    const [username,setUsername] = useState('')
    const [password, setPassword] = useState("");
    const [code,setCode] = useState("")
    const [error, setError] = useState("");
    const [message,setMessage] = useState('')
    const [loading, setLoading] = useState(false);
    const [codeSent,setCodeSent] = useState(false)  //控制验证码输入框的显示
    const router  = useRouter()
    const codeInputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
      if(codeSent){
        codeInputRef.current?.focus()
      }
    },[codeSent])
    
    const handleSubmit = async(e:React.FormEvent)=>{
      e.preventDefault()
      setError('')
      setMessage("");
      setLoading(true);
      if(!codeSent){
        //发送验证码,让后端接口去处理：邮箱和用户名是否已经存在，如果不存在就发送验证码
        try{
          const res = await fetch('/api/register',{
            method:'POST',
            body:JSON.stringify({email,username,password}),
            headers:{'Content-Type':'application/json'}
          })
          const data = await res.json()
          console.log('接收到的data',data);
          
          if(data.error){
            setError(data.error)
          }else{
            setMessage('验证码已发送至您的邮箱，请查收！')
            setCodeSent(true)
          }
        }catch(err){
          setError('服务器错误，请稍后重试！')
        }
        finally {
           setLoading(false);
        }
      }else{
        // 得到验证码后，提交验证码和注册信息进行验证
        try {
          const response = await fetch("/api/verify", {
            method: "POST",
            body: JSON.stringify({ email, username, password, code }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();

          if (data.error) {
            setError(data.error);
          } else {
            setMessage("注册成功！即将跳转...");
            setTimeout(() => router.push("/login"), 1000);
          }
          } catch (err) {
          setError("服务器错误，请稍后重试！");
        }
      }
        
    }
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100'>
      {/* 登录小卡片 */}
      <div className='w-full max-w-md bg-white rounded-lg shadow-xl p-8'>
        <h1 className='text-3xl font-bold text-center mb-8'>注册</h1>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <label htmlFor='email' className='block mb-2 text-sm font-medium'>
             邮箱
            </label>
             <input 
                type="email" 
                id='email'
                placeholder='请输入邮箱'
                value={email}
                onChange={(e)=>setEmail(e.target.value.trim())}
                className='w-full px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
                disabled={codeSent} // 发送验证码后禁用
              />
          </div>
          <div>
            <label htmlFor='username' className='block mb-2 text-sm font-medium'>
             用户名
            </label>
             <input 
                type="username" 
                id='username'
                placeholder='请输入用户名'
                value={username}
                onChange={(e)=>setUsername(e.target.value.trim())}
                className='w-full px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
                disabled={codeSent}
              />
          </div>
          <div>
            <label htmlFor='password' className='block mb-2 text-sm font-medium'>
             密码
            </label>
             <input 
                type="password" 
                id='password'
                placeholder='请输入密码'
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className='w-full px-4 py-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
                disabled={codeSent}
              />
          </div>

          {codeSent && (
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                验证码
              </label>
              <input
                id="code"
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                ref={codeInputRef}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all disabled:bg-gray-400"
            disabled={loading}
            aria-label='注册'
          >
            {loading ? "处理中..." : codeSent ? "提交验证码" : "发送验证码"}
          </button>
        </form>
        <p className='text-center py-4 text-sm'>
          已有账号？
          <Link href='/login' className='text-blue-600 hover:underline'>登录</Link>
        </p>
      </div>
    </div>
  )
})

Register.displayName = 'Register'

export default Register