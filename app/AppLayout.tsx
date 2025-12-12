'use client'
import React, { memo } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/Header'
const AppLayout = memo(({children}:{children:React.ReactNode}) => {
  return (
    <div>
      <Header/>
      <div className='flex pt-16'>
        <Sidebar/>
        <main className={`flex-1 transition-all duration-300 ease-in-out`}>{children}</main>
      </div>
    </div>
  )
})

export default AppLayout