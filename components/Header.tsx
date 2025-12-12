'use client'
import React, { memo } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
export const Header = memo(() => {
  return (
    // 给header加个毛玻璃效果，如果浏览器支持backdrop-filter，就使用更透明的背景
    <header className='fixed top-0 right-0 left-0 h-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex items-center h-full'>
            <Button variant="ghost" size='icon' className='absolute left-4'>
                <Menu/>
            </Button>
            <div className='ml-20 pl-10'>
                <div className='font-bold text-xl'>Tour-Guaid</div>
            </div>
            <div className='ml-auto flex-shrink-0 text-right mr-4'>
                <Link href="/login" className='px-4 py-2 border rounded-md hover:bg-gray-100 transition'>
                    登录
                </Link>
            </div>
        </div>
    </header>
  )
})

export default Header