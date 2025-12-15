'use client'
import React, { memo } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/button'
import { useSession,signOut } from 'next-auth/react'
interface  headerProps {
    handleToggle:()=>void
}
export const Header = memo(({handleToggle}:headerProps) => {
    // 把这个钩子中的data解构出来，重命名为session
    const {data:session} = useSession()
  return (
    // 给header加个毛玻璃效果，如果浏览器支持backdrop-filter，就使用更透明的背景
    <header className='fixed top-0 right-0 left-0 h-16 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='flex items-center h-full'>
            <Button 
                variant="ghost" 
                size='icon' 
                className='absolute left-4'
                onClick={handleToggle}
            >
                <Menu/>
            </Button>
            <div className='md:ml-20 md:pl-10 ml-10 pl-5'>
                <div className='font-bold text-sm md:text-xl'>Tour-Guaid</div>
            </div>
            <div className='ml-auto flex-shrink-0 text-right mr-4'>
                {session?.user?.username?(
                    <div>
                        <span>欢迎，{session.user.username}</span>
                        <button className='border rounded-md px-3 py-2 ml-2 hover:bg-gray-100 transition' onClick={()=>signOut()}>
                            退出登录
                        </button>
                    </div>
                    
                )
                :(
                    <Link href="/login" className='px-4 py-2 border rounded-md hover:bg-gray-100 transition'>
                        登录
                    </Link>
                )}
            </div>
        </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header