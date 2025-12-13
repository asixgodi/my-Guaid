'use client'
import  Link  from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import React, { memo,useEffect,useState } from 'react'
import { useSession } from 'next-auth/react';
const LoginPage = memo(() => {
  const [email,setEmail] = useState('')
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router  = useRouter()

  // status 是 useSession() 这个钩子返回的一个状态标志,有三个状态：'loading'（正在加载用户会话）、'authenticated'（用户已认证）和 'unauthenticated'（用户未认证）
  const {status} = useSession()
  useEffect(()=>{
    if(status==='authenticated'){
      router.push('/')
    }
  },[status,router])

  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault()
    if(!email || !password){
      setError('请填写完整的信息')
      return
    }
    setLoading(true)
    setError('')
    try{
       // 账号密码打包，发了一个 HTTP POST 请求 给后台目标地址：/api/auth/callback/credentials（这个地址是 NextAuth 自动生成的)
      const res = await signIn('credentials',{
        email,
        password,
        redirect:false
      })
      console.log("SignIn result:", res);
      if(res?.error){
        switch(res.error){
          case '邮箱和密码不能为空':
            setError('邮箱和密码不能为空');
            break;
          case '该邮箱未注册':
            setError('该邮箱未注册');
            break;
          case '密码错误':
            setError('密码错误');
            break;
          default:
            setError('登录失败，请稍后重试');
        }
        setLoading(false);
      }
    }catch(err){
      setError("网络错误，请检查连接后重试");
      setLoading(false);
    }finally{
      setLoading(false);
    }
  }
  return (
    <div className='flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-100'>
      {/* 登录小卡片 */}
      <div className='w-full max-w-md bg-white rounded-lg shadow-xl p-8'>
        <h1 className='text-3xl font-bold text-center mb-8'>登录</h1>
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
                disabled={loading}
                required
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
                disabled={loading}
                required
              />
          </div>
          <button type='submit' className='w-full bg-blue-600 py-3 rounded-md font-medium hover:bg-blue-700 text-white '>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                登录中...
              </span>
            ) : (
              "登录"
            )}
          </button>
        </form>
        <p className='text-center py-4 text-sm'>
          还没有账号？
          <Link href='/register' className='text-blue-600 hover:underline'>立即注册</Link>
        </p>
      </div>
    </div>
  )
})

LoginPage.displayName = 'LoginPage'

export default LoginPage