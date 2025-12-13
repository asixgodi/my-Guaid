'use client'
import React, { memo,useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import Header from '@/components/Header'
const AppLayout = memo(({children}:{children:React.ReactNode}) => {
  const [showSidebar,setShowSidebar] = useState(true)
  return (
    <div>
      <Header handleToggle = {()=>setShowSidebar(!showSidebar)}/>
      <div className='flex pt-16'>
          <Sidebar isOpen={showSidebar}/>
        <main className={`flex-1 transition-all duration-300 ease-in-out ${showSidebar? 'ml-60':'ml-0'} overflow-auto`}>{children}</main>
      </div>
    </div>
  )
})

AppLayout.displayName = 'AppLayout'

export default AppLayout