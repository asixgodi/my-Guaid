'use client'
import  Link  from 'next/link';
import { useRouter } from 'next/navigation';
import React, { memo,useState } from 'react'

const LoginPage = memo(() => {
  const [email,setEmail] = useState('')
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router  = useRouter()
  const handleSubmit = async(e:React.FormEvent)=>{

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
                required
              />
          </div>
          <button type='submit' className='w-full bg-blue-600 py-3 rounded-md font-medium hover:bg-blue-700 text-white '>
            登录
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

export default LoginPage