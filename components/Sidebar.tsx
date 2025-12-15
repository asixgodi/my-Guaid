"use client"
import React, { memo, } from 'react'
import { usePathname } from 'next/navigation';
// cn的作用是可以写条件判断，也可以解决样式冲突
import { cn } from '@/lib/utils'
import { Button } from './ui/button';
import Link from 'next/link';
import { 
  MapPin, 
  Map, 
  Sparkles, 
  Share2, 
  Plane 
} from 'lucide-react';
interface SidebarProps {
    isOpen?:boolean
}
export const Sidebar = memo(({isOpen}:SidebarProps) => {
    const pathname = usePathname();
    const menuItems = [
        { name: "景点推荐", path: "/", icon: MapPin },
        { name: "地图推荐", path: "/create", icon: Map },
        { name: "AI", path: "/reply", icon: Sparkles },
        { name: "小红书链接解析", path: "/xhs", icon: Share2 },
        { name: "我的行程", path: "/tour", icon: Plane },
    ]
    return (
        <div>
            <aside className={cn('fixed top-16 h-[calc(100vh-4rem)] w-60 border-r bg-white',
                'shadow-md transition-transform duration-300 ease-in-out',
                'flex flex-col z-50',
                isOpen ? 'translate-x-0 ' : '-translate-x-full')}>
                {/* 菜单标题 */}
                <div className='px-6 py-6 border-b border-t border-sidebar-border'>
                    <h2 className='text-lg font-bold'>
                        导航菜单
                    </h2>
                </div>
                <nav className='flex-1 space-y-3 py-4 px-3 overflow-y-auto'>
                    {menuItems.map(({ name, path, icon: Icon }) => {
                    const isActive = pathname === path;
                    
                    return (
                        <Button
                        key={path}
                        variant="ghost"
                        className={cn(
                            'w-full justify-start px-4 py-3 h-14',
                            'rounded-lg transition-all duration-100 ease-in-out',
                            'flex items-center gap-3',
                            isActive && [
                            'bg-sidebar-primary/10 text-sidebar-primary',
                            'border-l-2',
                            'font-semibold shadow-sm',
                            ],
                            !isActive && 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
                        )}
                        asChild
                        >
                        <Link href={path}>
                            <Icon className='w-5 h-5 flex-shrink-0' />
                            <span className='truncate text-lg'>{name}</span>
                        </Link>
                        </Button>
                    );
                    })}
                </nav>
                <div className='px-6 py-4 border-t border-sidebar-border text-center text-sm '>
                    <p>© 2025 Tour Guide</p>
                </div>
            </aside>
        </div>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar