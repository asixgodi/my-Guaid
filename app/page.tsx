'use client'
import React, { memo,useState } from 'react'
import useTourStore from './store/useTourStore'
import { useRouter } from 'next/navigation'
const Home = memo(() => {
  const [city,setCity] = useState('')
  const [day,setDay] = useState(0)
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('') 
  const router = useRouter()
  async function fetchTourismGuide(e:React.FormEvent){
    e.preventDefault()
    setError('')
    setLoading(true)
    if(!city){
      setError('请输入城市名称')
      setLoading(false)
      return
    }
    try{
      const res = await fetch(`/api/getTourismGuide?city=${city}&days=${day}`)
      const data = await res.json();
      if(res.ok && data.schedule){
         useTourStore.getState().setCity(data.city || "");
         useTourStore.getState().setTourGuide({
          city: data.city || "",
          schedule: data.schedule,
        });
        router.push('/touronceplan')
      }else{
        setError(data.message || '获取行程失败，请重试')
      }
    }catch(err){
      setError('请求失败，请稍后重试')
      console.log('请求失败',err);
    }finally{
      setLoading(false)
    }
  }
  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-slate-950"
    >
      {/* 背景图  */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 blur-[2px] opacity-70"
        style={{ backgroundImage: "url('/home.avif')" }}
      />
      {/* 遮罩层 */}
       <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />

      {/* 内容卡片 */}
      <div className="relative z-10 w-full max-w-5xl px-6 md:px-10">
        <div className="group rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.1),transparent_32%),radial-gradient(circle_at_70%_80%,rgba(167,139,250,0.12),transparent_30%)]" />
          
          <div className="relative px-6 md:px-10 py-10 md:py-12 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 self-center rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/90 shadow-inner shadow-cyan-500/20">
              Explore · AI · Travel
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-black leading-tight bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(59,130,246,0.35)]">
                开始您的旅行规划之旅吧！
              </h1>
              <p className="text-lg md:text-xl text-slate-100/85">
                让每一步都留下与众不同的回忆
              </p>
            </div>

            {/* 表单 */}
            <form
              onSubmit={(e)=>fetchTourismGuide(e)}
              className="flex flex-col md:flex-row gap-3 md:gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 shadow-inner shadow-cyan-500/10"
            >
              <input
                className="flex-1 rounded-xl bg-slate-900/40 border border-white/10 px-4 py-4 text-slate-100 placeholder:text-slate-400/80 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-transparent transition"
                type="text"
                placeholder="你想去哪？"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="城市名称"
                disabled={loading}
              />
              <select
                className="rounded-xl bg-slate-900/40 border border-white/10 px-4 py-4 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-transparent transition"
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                aria-label="旅行天数"
                disabled={loading}
              >
                {[1, 2, 3, 4].map((d) => (
                  <option key={d} value={d} className="bg-slate-900 text-slate-100">
                    {d} 天
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 px-6 py-4 text-white font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-400/40 hover:translate-y-[-1px] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                disabled={loading}
                aria-live="polite"
              >
                {loading ? "加载中..." : "探索旅程"}
              </button>
            </form>

            {/* 错误提示 */}
            {error && <p className="text-center text-yellow-300">{error}!!!</p>}

            {/* 推荐标签 */}
            <div className="flex flex-wrap justify-center gap-3 pt-2 text-slate-100/80">
              {!loading &&["北京", "上海", "深圳", "杭州", "成都", "重庆"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className="px-4 py-2 rounded-full bg-white/10 border border-white/10 hover:border-cyan-300/70 hover:text-white hover:bg-cyan-400/20 transition text-sm"
                  onClick={() => setCity(tag)}
                >
                  # {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})

Home.displayName = 'Home'
export default Home